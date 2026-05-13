# Example Auth Server

This is a minimal example Express server with JWT auth for local development.

Install and start:

```bash
cd example_server
npm install
npm start
```

Endpoints:
- POST /auth/login { email, password } -> { accessToken, refreshToken }
- POST /auth/refresh { refreshToken } -> { accessToken, refreshToken }
- POST /auth/logout
- GET /transactions (protected)
- POST /transactions (protected)
- PUT /transactions/:id (protected)

Default user: `user@example.com` / `password`
