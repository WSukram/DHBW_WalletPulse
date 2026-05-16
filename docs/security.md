# Security

## Authentication

Authentication is stateless — no server-side sessions are maintained. On login the server issues a signed JWT. The client attaches it as a `Bearer` token on every subsequent request.

Each request is validated before reaching any business logic. Invalid or expired tokens are rejected; the request proceeds unauthenticated and receives a 401 response from any protected path.

## Authorization

All data access is scoped to the authenticated user at the database query level. A user can never read or modify another user's wallets, assets, or transactions, regardless of how the request is constructed.

## Public Endpoints

A small set of endpoints require no authentication: user registration, login, and the live market price feed. Everything else — including the GraphQL endpoint — requires a valid token.

The Scalar API reference (`/docs`) and the GraphiQL playground (`/graphiql`) are also public. Both expose schema-level information, which is intentional — discoverability of the API surface is a feature, not a leak. Neither lets a caller execute anything without a valid JWT; the read-only schema view is symmetric to publishing the OpenAPI spec.

## Password Storage

Passwords are hashed before storage. Plaintext passwords are never persisted or logged. The minimum password length is 12 characters; BCrypt truncates beyond 72 bytes.

## Transport Security

In production, TLS is terminated at the reverse proxy layer. The backend and database are not exposed to the internet — only the frontend is reachable externally, behind HTTPS.

## CORS

Allowed origins are controlled via an environment variable set at deploy time. In production this is locked to the frontend domain.
