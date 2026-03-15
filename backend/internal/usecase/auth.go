package usecase

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/mail"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/idtoken"

	db "github.com/km/ai-quiz/internal/db/gen"
)

type AuthUsecase struct {
	queries *db.Queries
}

func NewAuthUsecase(queries *db.Queries) *AuthUsecase {
	return &AuthUsecase{queries: queries}
}

type GoogleStartResult struct {
	AuthURL string
}

type GoogleCallbackResult struct {
	ReturnTo     string
	AccessToken  string
	RefreshToken string
	DisplayName  string
	DisplayEmail string
}

type MeResult struct {
	UserID uuid.UUID
	Email  string
	Role   string
}

func (u *AuthUsecase) GoogleStart(returnTo string) (*GoogleStartResult, *http.Cookie, error) {
	if returnTo == "" {
		return nil, nil, errors.New("return_to is required")
	}

	cfg, err := googleOAuthConfig()
	if err != nil {
		return nil, nil, err
	}

	state, err := randomBase64URL(32)
	if err != nil {
		return nil, nil, fmt.Errorf("state: %w", err)
	}
	verifier, err := randomBase64URL(32)
	if err != nil {
		return nil, nil, fmt.Errorf("verifier: %w", err)
	}
	challenge := pkceChallenge(verifier)

	authURL := cfg.AuthCodeURL(
		state,
		oauth2.AccessTypeOffline,
		oauth2.SetAuthURLParam("prompt", "consent"),
		oauth2.SetAuthURLParam("code_challenge", challenge),
		oauth2.SetAuthURLParam("code_challenge_method", "S256"),
	)

	c, err := makeOAuthStateCookie(oauthState{
		State:     state,
		Verifier:  verifier,
		ReturnTo:  returnTo,
		ExpiresAt: time.Now().Add(10 * time.Minute).Unix(),
	})
	if err != nil {
		return nil, nil, err
	}

	return &GoogleStartResult{AuthURL: authURL}, c, nil
}

func (u *AuthUsecase) GoogleCallback(ctx context.Context, code string, state string, stateCookie string) (*GoogleCallbackResult, error) {
	if code == "" || state == "" {
		return nil, errors.New("code/state is required")
	}

	st, err := parseOAuthStateCookie(stateCookie)
	if err != nil {
		return nil, fmt.Errorf("state cookie: %w", err)
	}
	if time.Now().Unix() > st.ExpiresAt {
		return nil, errors.New("state expired")
	}
	if st.State != state {
		return nil, errors.New("state mismatch")
	}

	cfg, err := googleOAuthConfig()
	if err != nil {
		return nil, err
	}

	token, err := cfg.Exchange(ctx, code, oauth2.SetAuthURLParam("code_verifier", st.Verifier))
	if err != nil {
		return nil, fmt.Errorf("exchange: %w", err)
	}

	rawIDToken, _ := token.Extra("id_token").(string)
	if rawIDToken == "" {
		return nil, errors.New("missing id_token")
	}

	payload, err := idtoken.Validate(ctx, rawIDToken, cfg.ClientID)
	if err != nil {
		return nil, fmt.Errorf("validate id_token: %w", err)
	}

	sub, _ := payload.Claims["sub"].(string)
	email, _ := payload.Claims["email"].(string)
	name, _ := payload.Claims["name"].(string)
	picture, _ := payload.Claims["picture"].(string)
	if sub == "" {
		return nil, errors.New("missing sub")
	}
	if email == "" {
		return nil, errors.New("missing email")
	}

	user, err := u.ensureGoogleUser(ctx, sub, email, name, picture)
	if err != nil {
		return nil, err
	}

	refresh, refreshHash, err := newRefreshToken()
	if err != nil {
		return nil, err
	}
	if err := u.queries.InsertRefreshToken(ctx, db.InsertRefreshTokenParams{
		UserID:    user.ID,
		TokenHash: refreshHash,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
	}); err != nil {
		return nil, fmt.Errorf("insert refresh token: %w", err)
	}

	accessToken, err := mintAccessToken(user.ID, user.Role)
	if err != nil {
		return nil, err
	}

	return &GoogleCallbackResult{
		ReturnTo:     st.ReturnTo,
		AccessToken:  accessToken,
		RefreshToken: refresh,
		DisplayName:  name,
		DisplayEmail: email,
	}, nil
}

func (u *AuthUsecase) ParseAccessToken(ctx context.Context, token string) (*MeResult, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return nil, errors.New("JWT_SECRET is required")
	}

	parsed, err := jwt.Parse(token, func(t *jwt.Token) (any, error) {
		if t.Method.Alg() != jwt.SigningMethodHS256.Alg() {
			return nil, fmt.Errorf("unexpected signing method: %s", t.Method.Alg())
		}
		return []byte(secret), nil
	})
	if err != nil || !parsed.Valid {
		return nil, errors.New("invalid token")
	}

	claims, ok := parsed.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid claims")
	}

	sub, _ := claims["sub"].(string)
	role, _ := claims["role"].(string)
	userID, err := uuid.Parse(sub)
	if err != nil {
		return nil, errors.New("invalid sub")
	}

	user, err := u.queries.GetUserByID(ctx, userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	return &MeResult{
		UserID: user.ID,
		Email:  user.Email,
		Role:   role,
	}, nil
}

type oauthState struct {
	State     string `json:"state"`
	Verifier  string `json:"verifier"`
	ReturnTo  string `json:"return_to"`
	ExpiresAt int64  `json:"expires_at"`
}

func googleOAuthConfig() (*oauth2.Config, error) {
	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	clientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")
	redirectURL := os.Getenv("GOOGLE_REDIRECT_URL")
	if clientID == "" || clientSecret == "" || redirectURL == "" {
		missing := make([]string, 0, 3)
		if clientID == "" {
			missing = append(missing, "GOOGLE_CLIENT_ID")
		}
		if clientSecret == "" {
			missing = append(missing, "GOOGLE_CLIENT_SECRET")
		}
		if redirectURL == "" {
			missing = append(missing, "GOOGLE_REDIRECT_URL")
		}
		return nil, fmt.Errorf("missing env: %s", strings.Join(missing, ", "))
	}
	return &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  redirectURL,
		Endpoint:     google.Endpoint,
		Scopes:       []string{"openid", "email", "profile"},
	}, nil
}

func makeOAuthStateCookie(st oauthState) (*http.Cookie, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return nil, errors.New("JWT_SECRET is required")
	}

	b, err := json.Marshal(st)
	if err != nil {
		return nil, err
	}

	payload := base64.RawURLEncoding.EncodeToString(b)
	sig := signHMAC(payload, secret)
	value := payload + "." + sig

	return &http.Cookie{
		Name:     "oauth_state",
		Value:    value,
		Path:     "/auth/google",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int((10 * time.Minute).Seconds()),
	}, nil
}

func parseOAuthStateCookie(value string) (oauthState, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return oauthState{}, errors.New("JWT_SECRET is required")
	}

	parts := strings.Split(value, ".")
	if len(parts) != 2 {
		return oauthState{}, errors.New("invalid cookie format")
	}

	payload, sig := parts[0], parts[1]
	if signHMAC(payload, secret) != sig {
		return oauthState{}, errors.New("invalid cookie signature")
	}

	raw, err := base64.RawURLEncoding.DecodeString(payload)
	if err != nil {
		return oauthState{}, errors.New("invalid cookie payload")
	}

	var st oauthState
	if err := json.Unmarshal(raw, &st); err != nil {
		return oauthState{}, errors.New("invalid cookie json")
	}

	if _, err := url.Parse(st.ReturnTo); err != nil {
		return oauthState{}, errors.New("invalid return_to")
	}

	return st, nil
}

func signHMAC(payload string, secret string) string {
	h := hmac.New(sha256.New, []byte(secret))
	_, _ = h.Write([]byte(payload))
	return base64.RawURLEncoding.EncodeToString(h.Sum(nil))
}

func pkceChallenge(verifier string) string {
	sum := sha256.Sum256([]byte(verifier))
	return base64.RawURLEncoding.EncodeToString(sum[:])
}

func randomBase64URL(n int) (string, error) {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

func (u *AuthUsecase) ensureGoogleUser(ctx context.Context, sub string, email string, name string, picture string) (db.User, error) {
	existing, err := u.queries.GetUserByProviderSub(ctx, db.GetUserByProviderSubParams{Provider: "google", ProviderSub: sub})
	if err == nil {
		if err := u.queries.UpsertOAuthIdentity(ctx, db.UpsertOAuthIdentityParams{
			Provider:    "google",
			ProviderSub: sub,
			UserID:      existing.ID,
			Email:       email,
			Name:        name,
			PictureUrl:  picture,
		}); err != nil {
			return db.User{}, fmt.Errorf("upsert oauth identity: %w", err)
		}
		return db.User{ID: existing.ID, Email: existing.Email, Role: existing.Role, DisplayName: name, CreatedAt: existing.CreatedAt, UpdatedAt: existing.UpdatedAt}, nil
	}

	created, err := u.queries.CreateUser(ctx, db.CreateUserParams{Email: email, Role: "user"})
	if err != nil {
		return db.User{}, fmt.Errorf("create user: %w", err)
	}
	if err := u.queries.UpsertOAuthIdentity(ctx, db.UpsertOAuthIdentityParams{
		Provider:    "google",
		ProviderSub: sub,
		UserID:      created.ID,
		Email:       email,
		Name:        name,
		PictureUrl:  picture,
	}); err != nil {
		return db.User{}, fmt.Errorf("upsert oauth identity: %w", err)
	}

	return db.User{ID: created.ID, Email: created.Email, Role: created.Role, DisplayName: name, CreatedAt: created.CreatedAt, UpdatedAt: created.UpdatedAt}, nil
}

func newRefreshToken() (plain string, hash string, err error) {
	plain, err = randomBase64URL(32)
	if err != nil {
		return "", "", err
	}
	sum := sha256.Sum256([]byte(plain))
	return plain, base64.RawURLEncoding.EncodeToString(sum[:]), nil
}

type RegisterWithPasswordResult struct {
	AccessToken string
	UserID      uuid.UUID
	DisplayName string
}

func (u *AuthUsecase) RegisterWithPassword(ctx context.Context, email, password, name string) (*RegisterWithPasswordResult, error) {
	if email == "" || password == "" || name == "" {
		return nil, errors.New("email, password and name are required")
	}
	if _, err := mail.ParseAddress(email); err != nil {
		return nil, errors.New("invalid email address")
	}
	if len(password) < 8 {
		return nil, errors.New("password must be at least 8 characters")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		return nil, fmt.Errorf("hash: %w", err)
	}

	hashStr := string(hash)
	user, err := u.queries.CreateUserWithPassword(ctx, db.CreateUserWithPasswordParams{
		Email:        email,
		PasswordHash: sql.NullString{String: hashStr, Valid: true},
		DisplayName:  name,
	})
	if err != nil {
		var pqErr *pq.Error
		if errors.As(err, &pqErr) && pqErr.Code == "23505" {
			return nil, errors.New("email already registered")
		}
		return nil, fmt.Errorf("create user: %w", err)
	}

	token, err := mintAccessToken(user.ID, user.Role)
	if err != nil {
		return nil, err
	}

	return &RegisterWithPasswordResult{AccessToken: token, UserID: user.ID, DisplayName: user.DisplayName}, nil
}

type LoginWithPasswordResult struct {
	AccessToken string
	DisplayName string
}

func (u *AuthUsecase) LoginWithPassword(ctx context.Context, email, password string) (*LoginWithPasswordResult, error) {
	user, err := u.queries.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}
	if !user.PasswordHash.Valid {
		return nil, errors.New("invalid email or password")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash.String), []byte(password)); err != nil {
		return nil, errors.New("invalid email or password")
	}
	token, err := mintAccessToken(user.ID, user.Role)
	if err != nil {
		return nil, err
	}
	return &LoginWithPasswordResult{AccessToken: token, DisplayName: user.DisplayName}, nil
}

func mintAccessToken(userID uuid.UUID, role string) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "", errors.New("JWT_SECRET is required")
	}
	claims := jwt.MapClaims{
		"sub":  userID.String(),
		"role": role,
		"iat":  time.Now().Unix(),
		"exp":  time.Now().Add(15 * time.Minute).Unix(),
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString([]byte(secret))
}
