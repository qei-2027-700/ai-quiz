package middleware

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"os"
	"strings"

	"connectrpc.com/connect"
)

func NewAdminBasicAuthInterceptor() connect.UnaryInterceptorFunc {
	return func(next connect.UnaryFunc) connect.UnaryFunc {
		return func(ctx context.Context, req connect.AnyRequest) (connect.AnyResponse, error) {
			user := os.Getenv("ADMIN_USER")
			pass := os.Getenv("ADMIN_PASS")
			if user == "" || pass == "" {
				return nil, connect.NewError(connect.CodeInternal, errors.New("admin auth is not configured"))
			}

			auth := req.Header().Get("Authorization")
			if auth == "" {
				return nil, connect.NewError(connect.CodeUnauthenticated, errors.New("missing Authorization header"))
			}

			const prefix = "Basic "
			if !strings.HasPrefix(auth, prefix) {
				return nil, connect.NewError(connect.CodeUnauthenticated, errors.New("unsupported auth scheme"))
			}

			raw, err := base64.StdEncoding.DecodeString(strings.TrimPrefix(auth, prefix))
			if err != nil {
				return nil, connect.NewError(connect.CodeUnauthenticated, errors.New("invalid basic auth"))
			}

			parts := strings.SplitN(string(raw), ":", 2)
			if len(parts) != 2 {
				return nil, connect.NewError(connect.CodeUnauthenticated, errors.New("invalid basic auth"))
			}

			if parts[0] != user || parts[1] != pass {
				return nil, connect.NewError(connect.CodeUnauthenticated, fmt.Errorf("invalid credentials"))
			}

			return next(ctx, req)
		}
	}
}
