# WalletPulse

> Crypto portfolio tracker with live & historical EUR, USD and BTC pricing and on-chain import for Ethereum, Bitcoin, and Solana.

![Java](https://img.shields.io/badge/Java-21-007396?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![CI](https://github.com/WSukram/DHBW_WalletPulse/actions/workflows/ci.yml/badge.svg)
![CD](https://github.com/WSukram/DHBW_WalletPulse/actions/workflows/cd.yml/badge.svg)

**Live**: [https://walletpulse.de](https://walletpulse.de)

WalletPulse is a full-stack web application for managing a personal crypto portfolio. It tracks holdings across multiple wallets, calculates profit and loss against current market prices in EUR, USD, BTC and can import on-chain transactions directly from public blockchain APIs.

This project was developed for the **Web Engineering 2** module at **DHBW Ravensburg**.

---

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Configuration](#configuration)
7. [Authentication](#authentication)
8. [API Documentation](#api-documentation)
9. [Third-Party APIs](#third-party-apis)
10. [Triggering an On-Chain Import](#triggering-an-on-chain-import)
11. [Testing](#testing)
12. [CI/CD](#cicd)
13. [Docker](#docker)
14. [Production Deployment](#production-deployment)
15. [License](#license)

---

## Features

- **Portfolio dashboard** with live valuation, asset breakdown, and historical performance charts. Display currency switchable between **EUR**, **USD**, and **BTC** (per-user preference, persisted on the backend).
- **Multiple wallets per user**, each scoped to a single chain (ETH / BTC / SOL) or used purely for manual tracking.
- **Manual transaction entry** alongside **automated on-chain import** for Ethereum (ERC-20), Bitcoin, and Solana (SPL).
- **Live and historical prices** fetched in EUR from CoinGecko (CryptoCompare fallback for prices older than 365 days) and converted to the user's display currency (EUR / USD / BTC) on the frontend. Live prices cached in memory; historical prices cached in the database.
- **JWT authentication** (Spring Security). All wallet/asset/transaction data is user-scoped at the query level.
- **Two API surfaces**: REST and GraphQL — both backed by the same services and security context.
- **Interactive API reference** with Scalar (`/docs`) and a GraphiQL playground (`/graphiql`, local dev only).
- **Material 3 dark/light theme** with a custom Tailwind palette.

---

## Architecture

```
  Browser
     │  HTTPS
     ▼
┌─────────────────────┐
│  Host nginx (443)   │  SSL termination, rate limiting on /api/auth/
└──────────┬──────────┘
           │  HTTP
           ▼
┌─────────────────────┐
│  nginx in Docker    │  Serves React SPA, proxies /api/* /graphql to backend
│  (frontend:3000)    │
└──────────┬──────────┘
           │  Docker internal network
           ▼
┌─────────────────────┐         ┌──────────────────────┐
│  Spring Boot 4      │ ───────►│  CoinGecko           │
│  REST + GraphQL     │         │  CryptoCompare       │
│  Spring Security    │ ───────►│  Etherscan (ETH)     │
│  Spring Data JPA    │         │  Blockstream (BTC)   │
└──────────┬──────────┘ ───────►│  Helius (SOL)        │
           │                    └──────────────────────┘
           ▼
┌─────────────────────┐
│  PostgreSQL 15      │  Not exposed to internet
└─────────────────────┘
```

The **backend** follows a classical layered architecture: `controller → service → repository → entity`. Chain-specific import logic is split into a `ChainImporter` interface with one implementation per chain (`EthereumImporter`, `BitcoinImporter`, `SolanaImporter`) under `service/blockchain/`, dispatched by a Spring-assembled `Map<ChainType, ChainImporter>`.

The **frontend** is a single-page React app organised into `pages/` (route components), `components/` (presentational and modal components), `hooks/` (data-fetching hooks), `utils/` (shared helpers and constants), and `context/` (auth and global state). Axios is configured once in `utils/api.js`; all calls use bare paths.

The **data model**:

```
User ─┬─► Wallet ──► Asset ──► Transaction
      │
      └─ HistoricalPrice (standalone price cache: coinId + date → eurPrice)
```

---

## Tech Stack

### Backend

| | Version |
|---|---|
| Java | 21 |
| Spring Boot | 4.0.5 |
| Spring Web MVC, Security, Data JPA, GraphQL, Validation | (BOM) |
| springdoc-openapi | 2.8.13 |
| jjwt (JWT) | 0.12.6 |
| PostgreSQL driver | runtime |
| H2 (test) | runtime |
| Lombok | provided |

### Frontend

| | Version |
|---|---|
| React / React DOM | 19.2 |
| Vite | 8.0 |
| React Router | 7.15 |
| axios | 1.16 |
| Tailwind CSS | 3.4 |
| lucide-react | 1.14 |
| @scalar/api-reference-react | 0.9 |

---

## Project Structure

```
.
├── backend/
│   ├── src/main/java/.../walletpulse/backend/
│   │   ├── api/              # External API clients (CoinGecko, Etherscan, ...)
│   │   ├── config/           # Security, CORS, OpenAPI, REST template
│   │   ├── controller/       # REST + GraphQL controllers
│   │   ├── entity/           # JPA entities
│   │   ├── exception/        # Global exception handler
│   │   ├── repository/       # Spring Data repositories
│   │   ├── security/         # JWT filter & service
│   │   └── service/          # Business logic (incl. service/blockchain/)
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── graphql/schema.graphqls
│   ├── src/test/java/...     # JUnit + Spring Boot tests (H2)
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/       # UI + modal components
│   │   ├── context/          # AppContext (auth, theme, currency)
│   │   ├── hooks/            # useLivePrices, usePortfolioData
│   │   ├── pages/            # Route components
│   │   └── utils/            # api, coins, chart, styles, ...
│   ├── public/
│   ├── nginx.conf
│   ├── Dockerfile
│   └── package.json
├── .github/workflows/
│   ├── ci.yml             # backend tests + frontend build on every push
│   └── cd.yml             # build images, push to ghcr.io, deploy to server on main
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites

- **Java 21** (Temurin recommended)
- **Node.js 20+**
- **Docker** and **Docker Compose**
- Maven is **not** required — the Maven Wrapper (`./mvnw`) is bundled.

### Clone and configure

```bash
git clone https://github.com/WSukram/DHBW_WalletPulse.git
cd DHBW_WalletPulse
cp .env.example .env
# Edit .env and fill in JWT_SECRET and any API keys you have.
```

### Option A — Full stack via Docker (one command)

Bring up the database, backend, and frontend together:

```bash
docker compose up
```

| Service  | URL                       |
|----------|---------------------------|
| Frontend | http://localhost:3000     |
| Backend  | http://localhost:8080     |
| Postgres | localhost:5432            |

The compose stack uses healthchecks so the backend waits for Postgres to be ready and the frontend waits for the backend.

### Option B — DB in Docker, backend & frontend run locally (recommended for dev)

```bash
# 1. Start PostgreSQL only
docker compose up -d db

# 2. Backend on http://localhost:8080
cd backend
./mvnw spring-boot:run

# 3. Frontend on http://localhost:5173 (in a new terminal)
cd frontend
npm install
npm run dev
```

### Option C — Run the test suite (no database needed)

```bash
cd backend
./mvnw test          # uses H2 in-memory, 38 tests
```

---

## Configuration

Non-sensitive defaults live in `backend/src/main/resources/application.properties`. All secrets and environment-specific values are read from environment variables — populate `.env` (gitignored) from `.env.example`. Docker Compose passes them through automatically; for local Spring Boot runs, you can either export them or replace the placeholders in `application.properties` directly.

| Variable             | Purpose                                                 | Required          | Where to obtain                          |
|----------------------|---------------------------------------------------------|-------------------|------------------------------------------|
| `DB_PASSWORD`        | Postgres password                                       | Yes (Docker only) | Pick anything; default `postgres`        |
| `JWT_SECRET`         | HMAC secret for signing JWT access tokens               | Yes               | Generate a long random string            |
| `COINGECKO_API_KEY`  | Live & historical EUR prices (≤ 365 days)               | Recommended       | https://www.coingecko.com/en/api         |
| `ETHERSCAN_API_KEY`  | Ethereum + ERC-20 transaction import                    | For ETH import    | https://etherscan.io (My Account → API)  |
| `HELIUS_API_KEY`     | Solana + SPL token transaction import                   | For SOL import    | https://helius.dev                       |

Bitcoin and the CryptoCompare fallback do not require keys.

---

## Authentication

WalletPulse uses **stateless JWT** authentication. There is no seeded test user — register your own account through the UI or the API:

Passwords must be **at least 12 characters**.

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"firstName":"John","lastName":"Doe","email":"you@example.com","password":"your-password-12"}'

# Log in (returns { "token": "..." })
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"your-password-12"}'

# Subsequent requests
curl http://localhost:8080/api/wallets \
  -H 'Authorization: Bearer <token>'
```

Public endpoints: `/api/auth/login`, `/api/auth/register`, `/api/market/prices`, `/v3/api-docs/**`, `/swagger-ui/**`. Everything else (including `POST /graphql`) requires a valid bearer token.

---

## API Documentation

### REST

- **Scalar UI** (interactive reference, embedded in the React app):
  - Local dev: http://localhost:5173/docs
  - Docker: http://localhost:3000/docs
- **Raw OpenAPI 3 spec**: http://localhost:8080/v3/api-docs
- **Legacy Swagger UI**: http://localhost:8080/swagger-ui/index.html

Every controller is annotated with `@Tag`, every endpoint with `@Operation` and explicit `@ApiResponse` entries (including 4xx error schemas). Protected endpoints display a padlock icon in Scalar.

### GraphQL

- **Endpoint**: `POST http://localhost:8080/graphql` (requires bearer token)
- **GraphiQL playground**: http://localhost:8080/graphiql (public)

Schema lives at `backend/src/main/resources/graphql/schema.graphqls`. Available queries: `wallets`, `wallet(id)`, `assets(walletId)`, `asset(id)`, `transactions(assetId)`. Resolvers reuse the same services as the REST controllers, so user-scoping rules apply identically.

---

## Third-Party APIs

| Service                     | Purpose                                          | Key required                  | Notes                          |
|-----------------------------|--------------------------------------------------|-------------------------------|--------------------------------|
| **CoinGecko**               | Live + historical EUR prices (≤ 365 days)        | Optional (Demo Key recommended) | 30 req/min with key          |
| **CryptoCompare**           | Historical price fallback (> 365 days)           | No                            | Free, no signup                |
| **Etherscan v2**            | ETH + ERC-20 import                              | Yes                           | Free tier sufficient           |
| **Blockstream Esplora**     | BTC import                                       | No                            | Public endpoint                |
| **Helius**                  | SOL + SPL token import                           | Yes                           | 100 000 req/month free         |

### CoinGecko — prices

Used by `CoinGeckoClient` for live prices (cached in-memory) and historical EUR prices for transactions in the last 365 days (cached in the `HistoricalPrice` table). Without a key the API is heavily rate-limited; the free Demo Key raises the limit to 30 req/min.
- Docs: https://www.coingecko.com/en/api
- Env var: `COINGECKO_API_KEY`

### CryptoCompare — historical fallback

`CryptoCompareClient` is queried automatically when a requested historical date is older than CoinGecko's 365-day Demo Key window. No key required.
- Docs: https://min-api.cryptocompare.com

### Etherscan v2 — Ethereum import

`EtherscanClient` fetches incoming native ETH transfers and ERC-20 token transfers (USDC, USDT, DAI, WBTC, LINK, UNI, …) for a given address.
- Docs: https://docs.etherscan.io/v2-migration
- Env var: `ETHERSCAN_API_KEY`

### Blockstream Esplora — Bitcoin import

`BlockstreamClient` reads incoming BTC transactions for an address (`bc1...`, `1...`, `3...`). Public, no key.
- Docs: https://github.com/Blockstream/esplora/blob/master/API.md

### Helius — Solana import

`HeliusClient` fetches incoming SOL transfers and SPL token transfers (WBTC, USDC, USDT, BONK, JUP, …).
- Docs: https://helius.dev
- Env var: `HELIUS_API_KEY`

All imports are **idempotent**: re-running an import never inserts duplicates. Transactions for which a historical price could not be resolved on the first run (e.g. due to rate limiting) are back-filled automatically on subsequent imports.

---

## Triggering an On-Chain Import

A wallet must be configured with `chainType` (`ETH`, `BTC`, or `SOL`) and a valid `chainAddress`. The import can be triggered from the UI or directly via the API:

```http
POST /api/wallets/{id}/import
Authorization: Bearer <token>
```

Example response:

```json
{ "imported": 12, "skipped": 3, "failed": 0 }
```

---

## Testing

```bash
cd backend
./mvnw test
```

38 tests run against an H2 in-memory database (PostgreSQL compatibility mode), so no Postgres instance is required. Notable test classes:

- `WalletServiceTest`, `AssetServiceTest`, `TransactionServiceTest` — service-layer logic
- `AuthControllerTest`, `WalletControllerTest` — controller + security
- `CoinGeckoClientTest` — external API client
- `OpenApiSmokeTest` — OpenAPI spec sanity
- `GraphQlSmokeTest` — GraphQL endpoint sanity

---

## CI/CD

### Continuous Integration

GitHub Actions runs on every push and pull request (`.github/workflows/ci.yml`):

| Job             | Runtime              | Command                    |
|-----------------|----------------------|----------------------------|
| `backend-test`  | Java 21 (Temurin)    | `./mvnw test -B`           |
| `frontend-build`| Node 20              | `npm ci && npm run build`  |

### Continuous Deployment

On every push to `main` (`.github/workflows/cd.yml`):

1. Builds backend and frontend Docker images
2. Pushes them to GitHub Container Registry (`ghcr.io/wsukram/`)
3. SSHes into the production server as a dedicated `deploy` user
4. Pulls the new images and restarts containers with zero-downtime (`docker compose up -d`)

Secrets required in GitHub repository settings: `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`.

---

## Docker

`docker-compose.yml` orchestrates three services:

- **db** — `postgres:15`, healthcheck via `pg_isready`.
- **backend** — built from `backend/Dockerfile` (multi-stage Maven → JRE), waits on `db: service_healthy`, healthcheck via `/api/market/prices`.
- **frontend** — built from `frontend/Dockerfile` (multi-stage Node → nginx:alpine), serves the SPA via `nginx.conf`.

`backend/.dockerignore` excludes `application.properties` so the placeholder values are never baked into the image — secrets always come from environment variables. Make sure `.env` exists at the repo root before running `docker compose up`.

`docker-compose.prod.yml` is an override file used in production that disables GraphiQL, switches `ddl-auto` to `validate`, restricts CORS to the production domain, and closes the DB and backend host ports. Run with:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## Production Deployment

The app runs on an Ionos VPS (Ubuntu 24.04). The deployment stack:

- **UFW firewall** — only ports 22, 80, and 443 are open
- **Host nginx** — terminates HTTPS (Let's Encrypt / certbot), rate-limits `/api/auth/` to 10 req/min per IP, forwards to the frontend container
- **Docker Compose** — runs db, backend, and frontend containers; DB and backend ports are bound to `127.0.0.1` (not reachable from internet)
- **Let's Encrypt** — TLS certificate with auto-renewal via certbot
- **fail2ban** — auto-bans IPs after repeated failed SSH attempts
- **deploy user** — dedicated SSH user with Docker group permissions only (no sudo)

---

## License

Released under the [MIT License](LICENSE).

---

**Course**: Web Engineering 2 · **University**: DHBW Ravensburg Campus Friedrichshafen · **Author**: Markus Wenninger
