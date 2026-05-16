# Docker

## Dockerfiles

### Backend

`backend/Dockerfile` — two-stage build:

1. **Builder**: `maven:3-eclipse-temurin-21` — runs `./mvnw package -DskipTests` to produce the JAR.
2. **Runtime**: `eclipse-temurin:21-jre-alpine` — copies the JAR and runs it. Minimal image size.

`backend/.dockerignore` excludes `application.properties` so the committed defaults never shadow environment variable secrets injected by Docker Compose.

### Frontend

`frontend/Dockerfile` — two-stage build:

1. **Builder**: `node:20-alpine` — runs `npm ci && npm run build`. Accepts `ARG VITE_API_URL=""` so the CD pipeline bakes an empty string into the bundle (all API calls become same-origin relative paths).
2. **Runtime**: `nginx:alpine` — serves the built SPA.

`frontend/nginx.conf` configures:

- `try_files` fallback for React Router client-side routing
- 1-year cache on content-hashed static assets (`/assets/`)
- `X-Content-Type-Options: nosniff` header
- Proxy pass for `/api/*`, `/graphql`, `/graphiql`, `/v3/api-docs`, `/swagger-ui` to the `backend` container on Docker's internal network

## Docker Compose Files

### `docker-compose.yml` (base)

Orchestrates three services: `db`, `backend`, `frontend`.

- `db`: `postgres:15` with a named volume for data persistence
- `backend`: depends on `db` with a healthcheck; receives all secrets via env vars from `.env`
- `frontend`: depends on `backend`; port `3000:80` exposed to the host
- Log rotation on all services: `json-file` driver with `max-size` and `max-file` limits

### `docker-compose.prod.yml` (production overlay)

Applied on the server as:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Changes over the base file:

| Change | Reason |
|---|---|
| Removes `ports` for `db` and `backend` | Only the frontend container is reachable from the internet |
| Sets `SPRING_GRAPHQL_GRAPHIQL_ENABLED=false` | GraphiQL playground is disabled in production |

## Data Persistence

PostgreSQL data is stored in a named Docker volume. It survives container restarts and image upgrades — only `docker compose down -v` removes it.

## CI/CD Pipeline

### CI (`ci.yml`)

Runs on every push and pull request to `main`. Two parallel jobs:

- `backend-test`: Java 21 (Temurin), runs `./mvnw test -B`
- `frontend-build`: Node 20, runs `npm ci && npm run build`

No Docker or Postgres required — backend tests use H2.

### CD (`cd.yml`)

Runs on push to `main`:

1. Builds `walletpulse-backend` and `walletpulse-frontend` Docker images with appropriate build args.
2. Pushes images to `ghcr.io/wsukram/`.
3. Pulls the new images and restarts the containers with the production Compose overlay.

### GitHub Pages (`pages.yml`)

Runs on push to `main`:

1. Builds the frontend with `--base=/DHBW_WalletPulse/` and `VITE_API_URL=https://walletpulse.de`.
2. Deploys to GitHub Pages at `https://wsukram.github.io/DHBW_WalletPulse/`.
3. Adds `404.html = index.html` for React Router SPA routing support.
