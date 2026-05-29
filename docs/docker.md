# Docker

## Dockerfiles

### Backend

`backend/Dockerfile` — two-stage build:

1. **Builder**: `maven:3-eclipse-temurin-21` — runs `mvn package -DskipTests` to produce the JAR.
2. **Runtime**: `eclipse-temurin:21-jre` (Ubuntu) — copies the JAR and runs it. `curl` is installed for the compose healthcheck.

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

Changes over the base file: none today. The base `docker-compose.yml` already binds `db` and `backend` to `127.0.0.1:` (loopback), so they are not reachable from the internet on the server. The overlay exists as a hook for environment-specific overrides if the deployment topology changes.

## Data Persistence

PostgreSQL data is stored in a named Docker volume. It survives container restarts and image upgrades — only `docker compose down -v` removes it.

## CI/CD Pipeline

### CI (`ci.yml`)

Runs on every push and pull request to `main`. Two parallel jobs:

- `backend-test`: Java 21 (Temurin), runs `./mvnw test -B`
- `frontend-build`: Node 20, runs `npm ci && npm run build`

No Docker or Postgres required — backend tests use H2.

### CD (`cd.yml`)

Triggered by a successful CI run on `main` (via `workflow_run`). If CI fails, CD does not run.

1. Checks out the exact commit CI tested.
2. Builds `walletpulse-backend` and `walletpulse-frontend` Docker images with appropriate build args.
3. Pushes images to `ghcr.io/wsukram/` with two tags: `:latest` and `:<commit-sha>` (so rollback is `docker pull …:<previous-sha>`).
4. Pulls the new images and restarts the containers with the production Compose overlay.

### GitHub Pages (`pages.yml`)

Runs on push to `main`:

1. Installs `mkdocs-material` and builds the documentation site from `docs/` + `mkdocs.yml`.
2. Deploys the generated `site/` to GitHub Pages at `https://wsukram.github.io/DHBW_WalletPulse/`.

The live React app itself ships via the CD pipeline (above), not GitHub Pages.
