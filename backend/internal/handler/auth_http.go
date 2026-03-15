package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"go.uber.org/zap"

	"github.com/km/ai-quiz/internal/usecase"
)

type AuthHTTPHandler struct {
	uc     *usecase.AuthUsecase
	logger *zap.Logger
}

func NewAuthHTTPHandler(uc *usecase.AuthUsecase, logger *zap.Logger) *AuthHTTPHandler {
	return &AuthHTTPHandler{uc: uc, logger: logger}
}

func (h *AuthHTTPHandler) Register(mux *http.ServeMux) {
	// Note: do not use method-based patterns (e.g. "GET /path") to avoid
	// incompatibilities when ServeMux runs in legacy mode.
	mux.HandleFunc("/auth/google/start", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		h.googleStart(w, r)
	})
	mux.HandleFunc("/auth/google/callback", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		h.googleCallback(w, r)
	})
	mux.HandleFunc("/auth/me", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		h.me(w, r)
	})
	mux.HandleFunc("/auth/register", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		h.registerWithPassword(w, r)
	})
	mux.HandleFunc("/auth/login", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		h.emailLogin(w, r)
	})
}

func (h *AuthHTTPHandler) googleStart(w http.ResponseWriter, r *http.Request) {
	returnTo := r.URL.Query().Get("return_to")
	if returnTo == "" {
		http.Error(w, "return_to is required", http.StatusBadRequest)
		return
	}
	if !isAllowedReturnTo(returnTo) {
		http.Error(w, "return_to is not allowed", http.StatusBadRequest)
		return
	}

	res, cookie, err := h.uc.GoogleStart(returnTo)
	if err != nil {
		h.logger.Error("google start failed", zap.Error(err))
		if os.Getenv("APP_ENV") == "local" {
			http.Error(w, "failed to start: "+err.Error(), http.StatusInternalServerError)
			return
		}
		http.Error(w, "failed to start", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, cookie)
	http.Redirect(w, r, res.AuthURL, http.StatusFound)
}

func (h *AuthHTTPHandler) googleCallback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	state := r.URL.Query().Get("state")

	stCookie, err := r.Cookie("oauth_state")
	if err != nil {
		http.Error(w, "missing oauth_state", http.StatusBadRequest)
		return
	}

	res, err := h.uc.GoogleCallback(r.Context(), code, state, stCookie.Value)
	if err != nil {
		h.logger.Error("google callback failed", zap.Error(err))
		http.Error(w, "login failed", http.StatusBadRequest)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    res.RefreshToken,
		Path:     "/auth",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int((7 * 24 * time.Hour).Seconds()),
		Secure:   isCookieSecure(),
	})

	// Clear oauth_state cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "oauth_state",
		Value:    "",
		Path:     "/auth/google",
		HttpOnly: true,
		MaxAge:   -1,
	})

	// Redirect back to frontend with access_token in URL fragment to avoid query logs.
	writeCallbackHTML(w, res.ReturnTo, res.AccessToken, res.DisplayName, res.DisplayEmail)
}

func (h *AuthHTTPHandler) me(w http.ResponseWriter, r *http.Request) {
	auth := r.Header.Get("Authorization")
	const prefix = "Bearer "
	if !strings.HasPrefix(auth, prefix) {
		http.Error(w, "missing bearer token", http.StatusUnauthorized)
		return
	}
	token := strings.TrimPrefix(auth, prefix)

	me, err := h.uc.ParseAccessToken(r.Context(), token)
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	_ = json.NewEncoder(w).Encode(map[string]any{
		"user_id": me.UserID.String(),
		"email":   me.Email,
		"role":    me.Role,
	})
}

func (h *AuthHTTPHandler) registerWithPassword(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		Name     string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	res, err := h.uc.RegisterWithPassword(r.Context(), req.Email, req.Password, req.Name)
	if err != nil {
		h.logger.Warn("register failed", zap.Error(err))
		if errors.Is(err, usecase.ErrEmailAlreadyRegistered) {
			http.Error(w, "email already registered", http.StatusConflict)
			return
		}
		http.Error(w, "registration failed", http.StatusBadRequest)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    res.RefreshToken,
		Path:     "/auth",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int((7 * 24 * time.Hour).Seconds()),
		Secure:   isCookieSecure(),
	})
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"access_token": res.AccessToken,
		"user_id":      res.UserID.String(),
		"display_name": res.DisplayName,
	})
}

func (h *AuthHTTPHandler) emailLogin(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	res, err := h.uc.LoginWithPassword(r.Context(), req.Email, req.Password)
	if err != nil {
		h.logger.Warn("login failed", zap.Error(err))
		http.Error(w, "invalid email or password", http.StatusUnauthorized)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    res.RefreshToken,
		Path:     "/auth",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int((7 * 24 * time.Hour).Seconds()),
		Secure:   isCookieSecure(),
	})
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"access_token": res.AccessToken,
		"display_name": res.DisplayName,
	})
}

func isAllowedReturnTo(returnTo string) bool {
	// Local/dev convenience: allow localhost/127.0.0.1 without maintaining an allowlist
	// when APP_ENV=local.
	if os.Getenv("APP_ENV") == "local" {
		u, err := url.Parse(returnTo)
		if err != nil || u.Scheme == "" || u.Host == "" {
			return false
		}
		h := strings.ToLower(u.Hostname())
		return h == "localhost" || h == "127.0.0.1"
	}

	allowed := os.Getenv("AUTH_RETURN_TO_ORIGINS")
	if allowed == "" {
		return false
	}
	u, err := url.Parse(returnTo)
	if err != nil || u.Scheme == "" || u.Host == "" {
		return false
	}
	origin := u.Scheme + "://" + u.Host
	for _, a := range strings.Split(allowed, ",") {
		if strings.TrimSpace(a) == origin {
			return true
		}
	}
	return false
}

func isCookieSecure() bool {
	return os.Getenv("APP_ENV") == "production"
}

func writeCallbackHTML(w http.ResponseWriter, returnTo string, accessToken string, name string, email string) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	escapedReturnTo := htmlEscape(returnTo)
	escapedToken := htmlEscape(accessToken)
	escapedName := htmlEscape(name)
	escapedEmail := htmlEscape(email)

	_, _ = w.Write([]byte(`<!doctype html><html><head><meta charset="utf-8"><title>Login</title></head><body>
<script>
  const returnTo = "` + escapedReturnTo + `";
  const token = "` + escapedToken + `";
  const name = "` + escapedName + `";
  const email = "` + escapedEmail + `";
  const url = new URL(returnTo);
  url.hash = "access_token=" + encodeURIComponent(token)
    + "&name=" + encodeURIComponent(name)
    + "&email=" + encodeURIComponent(email);
  window.location.replace(url.toString());
</script>
ログイン処理中...
</body></html>`))
}

func htmlEscape(s string) string {
	replacer := strings.NewReplacer(
		"&", "&amp;",
		"<", "&lt;",
		">", "&gt;",
		"\"", "&quot;",
		"'", "&#39;",
	)
	return replacer.Replace(s)
}
