# WalletPulse

> Crypto portfolio tracker with live & historical EUR pricing and on-chain import for Ethereum, Bitcoin, and Solana.

![Java](https://img.shields.io/badge/Java-21-007396?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![CI](https://github.com/WSukram/DHBW_WalletPulse/actions/workflows/ci.yml/badge.svg)
![CD](https://github.com/WSukram/DHBW_WalletPulse/actions/workflows/cd.yml/badge.svg)

**Live**: [https://walletpulse.de](https://walletpulse.de) · **Docs**: [https://wsukram.github.io/DHBW_WalletPulse/](https://wsukram.github.io/DHBW_WalletPulse/)

WalletPulse is a full-stack web application for managing a personal crypto portfolio. It tracks holdings across multiple wallets, calculates profit and loss against current market prices, and can import on-chain transactions directly from Ethereum, Bitcoin, and Solana.

Developed for the **Web Engineering 2** module at **DHBW Ravensburg** Campus Friedrichshafen.

---

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Data Model](#data-model)
6. [Running Locally](#running-locally)
7. [Configuration](#configuration)
8. [API Keys](#api-keys)
9. [Authentication](#authentication)
10. [API Documentation](#api-documentation)
11. [On-Chain Import](#on-chain-import)
12. [Testing](#testing)
13. [CI/CD](#cicd)
14. [License](#license)

---

## Features

- **Portfolio dashboard** with live valuation, asset breakdown, and historical performance charts
- **Multiple wallets per user**, each scoped to ETH / BTC / SOL or used for manual tracking
- **Manual transaction entry** and **automated on-chain import** for Ethereum, Bitcoin, and Solana
- **Live and historical prices** from CoinGecko (CryptoCompare fallback for dates > 365 days old)
- **Display currency** switchable between EUR (native), USD (live ECB rate via frankfurter.app), and BTC (live BTC/EUR price via CoinGecko)
- **JWT authentication** — all data is user-scoped at the database query level
- **REST and GraphQL** API surfaces backed by the same services and security context
- **Interactive API reference** (Scalar at `/docs`) and GraphiQL playground (`/graphiql`)

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
│  nginx in Docker    │  Serves React SPA
│  (frontend:3000)    │  Proxies /api/* /graphql /v3/api-docs → backend
└──────────┬──────────┘
           │  Docker internal network
           ▼
┌─────────────────────┐         ┌──────────────────────┐
│  Spring Boot 4      │ ───────►│  CoinGecko           │
│  REST + GraphQL     │ ───────►│  CryptoCompare       │
│  Spring Security    │ ───────►│  Etherscan (ETH)     │
│  Spring Data JPA    │ ───────►│  Blockstream (BTC)   │
└──────────┬──────────┘ ───────►│  Helius (SOL)        │
           ▼                    └──────────────────────┘
┌─────────────────────┐
│  PostgreSQL 15      │
└─────────────────────┘
```

The backend follows a classical layered architecture: `controller → service → repository → entity`. Chain-specific import logic lives in `service/blockchain/` — a `ChainImporter` interface with one implementation per chain (`EthereumImporter`, `BitcoinImporter`, `SolanaImporter`), dispatched by `BlockchainImportService` via a Spring-assembled `Map<ChainType, ChainImporter>`.

The frontend is a React SPA. Axios is configured once in `utils/api.js` with a base URL baked at build time; all calls use bare paths (`/api/wallets`, not `http://localhost:8080/api/wallets`) so the same build works locally and in production without any code change.

---

## Tech Stack

### Backend

| Dependency | Version | Purpose |
|---|---|---|
| Java | 21 | Runtime |
| Spring Boot | 4.0.5 | Framework (web, security, data JPA, graphql, validation) |
| springdoc-openapi | 2.8.x | OpenAPI 3 spec + Swagger UI |
| jjwt | 0.12.6 | JWT signing and validation |
| PostgreSQL driver | 42.x | Production database |
| H2 | 2.x | In-memory database for tests |
| Lombok | 1.18.x | Boilerplate reduction |

### Frontend

| Dependency | Version | Purpose |
|---|---|---|
| React / React DOM | 19.2 | UI framework |
| Vite | 8.0 | Build tool and dev server |
| React Router | 7.x | Client-side routing |
| axios | 1.x | HTTP client |
| Tailwind CSS | 3.4 | Utility-first styling |
| lucide-react | 1.x | Icon set |
| @scalar/api-reference-react | 0.9.x | Interactive API docs (lazy-loaded) |

### Infrastructure

| Tool | Purpose |
|---|---|
| Docker + Docker Compose | Local development and production containers |
| nginx (Alpine) | Frontend container — serves SPA, proxies API calls |
| GitHub Actions | CI (test + build on every push) and CD (deploy on merge to main) |
| GitHub Container Registry | Stores built Docker images (`ghcr.io/wsukram/`) |
| GitHub Pages | MkDocs Material documentation site (see `docs/`, `mkdocs.yml`) |
| Let's Encrypt / certbot | HTTPS certificate with auto-renewal |

---

## Project Structure

```
.
├── backend/
│   ├── src/main/java/.../walletpulse/backend/
│   │   ├── api/                    # External API clients
│   │   │   ├── CoinGeckoClient     # Live + historical prices (primary)
│   │   │   ├── CryptoCompareClient # Historical price fallback (> 365 days)
│   │   │   ├── EtherscanClient     # ETH + ERC-20 import
│   │   │   ├── BlockstreamClient   # BTC import (no key needed)
│   │   │   └── HeliusClient        # SOL + SPL import
│   │   ├── config/                 # SecurityConfig, OpenApiConfig, RestTemplateConfig
│   │   ├── controller/             # REST controllers + GraphQLController
│   │   │   └── dto/                # Request and response DTOs
│   │   ├── entity/                 # JPA entities: User, Wallet, Asset, Transaction, HistoricalPrice
│   │   ├── exception/              # GlobalExceptionHandler, BusinessException, ResourceNotFoundException
│   │   ├── repository/             # Spring Data JPA repositories
│   │   ├── security/               # JwtService, JwtAuthFilter, UserDetailsServiceImpl
│   │   └── service/                # Business logic
│   │       └── blockchain/         # ChainImporter interface + per-chain implementations
│   ├── src/main/resources/
│   │   ├── application.properties  # Minimal config for test suite only (excluded from Docker)
│   │   └── graphql/schema.graphqls # GraphQL schema
│   ├── src/test/java/.../          # 38 tests (service, controller, smoke tests)
│   ├── Dockerfile                  # Multi-stage: Maven → JRE
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/             # MainLayout, Sidebar, TopNav
│   │   │   ├── wallet/             # AddWalletModal, EditWalletModal, DeleteWalletModal, AddTransactionModal
│   │   │   └── history/            # EditTransactionModal, DeleteTransactionModal
│   │   ├── context/
│   │   │   └── AppContext.jsx      # Auth state, JWT, axios defaults, currency, theme
│   │   ├── hooks/
│   │   │   ├── useLivePrices.js    # Fetches live BTC/ETH/SOL prices
│   │   │   └── usePortfolioData.js # Wallets → portfolios → transactions cascade
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Public landing page with live ticker
│   │   │   ├── Dashboard.jsx       # Portfolio overview
│   │   │   ├── Wallet.jsx          # Per-wallet detail + transactions
│   │   │   ├── Assets.jsx          # All assets grouped by coin
│   │   │   ├── History.jsx         # Full transaction history + CSV export
│   │   │   ├── Analytics.jsx       # Charts and performance metrics
│   │   │   ├── Security.jsx        # Password change
│   │   │   ├── Docs.jsx            # Scalar API reference (lazy-loaded)
│   │   │   ├── Login.jsx / Register.jsx
│   │   │   ├── TermsOfService.jsx / PrivacyPolicy.jsx / Impressum.jsx
│   │   └── utils/
│   │       ├── api.js              # axios baseURL setup
│   │       ├── coins.js            # COIN_META, formatPct, TICKER_COINS
│   │       ├── chart.js            # Chart math (labels, data points, SVG path)
│   │       ├── groupByCoin.js      # Merge same-coin assets across wallets
│   │       ├── exportCsv.js        # CSV blob download
│   │       └── styles.js           # Shared Tailwind class strings
│   ├── public/wp-icon.svg          # App icon (favicon + logo)
│   ├── nginx.conf                  # SPA routing + API proxy rules
│   ├── Dockerfile                  # Multi-stage: Node → nginx:alpine
│   └── package.json
├── .github/workflows/
│   ├── ci.yml                      # Tests + build on every push and PR
│   ├── cd.yml                      # Build images, push to ghcr.io, SSH deploy on main
│   └── pages.yml                   # Build and deploy to GitHub Pages on main
├── docker-compose.yml              # Base stack: db + backend + frontend
├── docker-compose.prod.yml         # Production overrides: validate DDL, prod CORS
├── docs/                           # MkDocs documentation source (deployed to GitHub Pages)
│   ├── index.md                    # Overview
│   ├── architecture.md
│   ├── setup.md
│   ├── api.md
│   ├── security.md
│   ├── frontend.md
│   ├── testing.md
│   └── docker.md
├── mkdocs.yml                      # MkDocs Material config
├── .env.example                    # Template — copy to .env and fill in values
└── README.md
```

---

## Data Model

```
User
 ├── email (unique), firstName, lastName
 ├── passwordHash
 └── preferences (currency, theme)
  │
  └──► Wallet (OneToMany)
        ├── name, chainType (ETH | BTC | SOL | null), chainAddress
        └── lastImportTime
         │
         └──► Asset (OneToMany, cascadeAll)
               ├── coinId (e.g. "bitcoin"), symbol, name
               └── totalAmount (sum of transactions)
                │
                └──► Transaction (OneToMany, cascadeAll)
                      ├── date, amount, pricePerCoin (EUR)
                      └── source (MANUAL | IMPORTED), txHash

HistoricalPrice (standalone cache)
  └── coinId + date → eurPrice
```

Key behaviours:
- Deleting the last transaction on an asset automatically removes the asset (no orphaned zero-balance rows).
- On-chain imports are idempotent — re-importing deduplicates by `txHash`.
- Historical prices are looked up in the DB cache first, then CoinGecko (≤ 365 days), then CryptoCompare (> 365 days).

---

## Running Locally

**The only prerequisite is [Docker](https://docs.docker.com/get-docker/) with Docker Compose.**

### 1. Clone and configure

```bash
git clone https://github.com/WSukram/DHBW_WalletPulse.git
cd DHBW_WalletPulse
cp .env.example .env
```

Open `.env` and fill in your values. At minimum you must replace `JWT_SECRET`. Set the API keys for any features you want to use — see [API Keys](#api-keys) for details.

### 2. Start everything

```bash
docker-compose up --build -d
```

This starts PostgreSQL, the Spring Boot backend, and the React frontend in the correct order using healthchecks. On first run the images are built locally — this takes a few minutes.

| Service | URL |
|---|---|
| App | http://localhost:3000 |
| API Docs | http://localhost:3000/docs |
| GraphiQL | http://localhost:3000/graphiql |

After the initial build, subsequent runs are much faster. To stop the container without losing data, type `docker-compose down`. The PostgreSQL data is persisted in a Docker volume, so your wallets and transactions remain intact across restarts. To start the database, run `docker-compose up -d`. If you want to wipe all data and start fresh, run `docker-compose down -v` to remove the volume.

### 3. Register an account

Open http://localhost:3000 and click **Get Started**, or use the API directly:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"firstName":"Jane","lastName":"Doe","email":"jane@example.com","password":"my-strong-password"}'
```

Passwords must be at least 12 characters.

---

## Configuration

All configuration is done via `.env` at the repo root. Docker Compose reads this file and injects the values as environment variables — you never need to touch any source files.

| Variable | Purpose | Required |
|---|---|---|
| `JWT_SECRET` | HMAC secret for signing JWT tokens | **Yes** — generate with `openssl rand -base64 48` |
| `DB_PASSWORD` | PostgreSQL password | No — defaults to `postgres` |
| `COINGECKO_API_KEY` | Live & historical EUR prices | **Yes** — without a key the free tier is severely rate-limited and price lookups will fail under normal use |
| `ETHERSCAN_API_KEY` | Ethereum + ERC-20 on-chain import | **Yes** for ETH import |
| `HELIUS_API_KEY` | Solana + SPL token on-chain import | **Yes** for SOL import |

Bitcoin import uses Blockstream's public API — no key needed.

> `application.properties` is **excluded from the Docker image** and is not a configuration file for normal usage. It only provides the two settings the test suite needs that have no code-level default.

---

## API Keys

### CoinGecko — prices (required for reliable use)

Used for live BTC/ETH/SOL prices (cached in memory) and historical EUR prices for transactions up to 365 days old (cached in the `HistoricalPrice` DB table). Without a key the public free tier is aggressively rate-limited — the dashboard will load slowly and historical price lookups during import will frequently fail.

- Sign up at [coingecko.com/en/api](https://www.coingecko.com/en/api)
- Go to **Developer Dashboard → API Keys** and create a free Demo Key
- Add to `.env` as `COINGECKO_API_KEY=your_key`

### CryptoCompare — historical fallback (no key needed)

Automatically used as a fallback when a transaction date is older than 365 days (outside the CoinGecko Demo Key window). No account or key required.

### Etherscan — Ethereum import (required for ETH)

Used by `EtherscanClient` to fetch incoming native ETH transfers and ERC-20 token transfers (USDC, USDT, DAI, WBTC, LINK, UNI, and others) for a given wallet address.

- Sign up at [etherscan.io](https://etherscan.io)
- Go to **My Account → API Keys → Add**
- Add to `.env` as `ETHERSCAN_API_KEY=your_key`
- Free tier: 5 req/s, more than enough for personal use

### Blockstream Esplora — Bitcoin import (no key needed)

`BlockstreamClient` reads incoming BTC transactions for an address (`bc1...`, `1...`, `3...`). Uses the public Blockstream Esplora API — completely free, no account required.

### Helius — Solana import (required for SOL)

Used by `HeliusClient` to fetch incoming SOL transfers and SPL token transfers (USDC, WBTC, BONK, JUP, and others) for a given wallet address.

- Sign up at [helius.dev](https://helius.dev)
- Your API key is shown on the dashboard immediately after signup
- Add to `.env` as `HELIUS_API_KEY=your_key`
- Free tier: 100,000 requests/month — more than enough for personal use

---

## Authentication

WalletPulse uses stateless JWT authentication. All wallet, asset, and transaction data is scoped to the authenticated user at the database query level — you can never access another user's data.

```bash
# Log in — returns { "token": "..." }
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"jane@example.com","password":"my-strong-password"}'

# Authenticated request
curl http://localhost:3000/api/wallets \
  -H 'Authorization: Bearer <token>'
```

---

## API Documentation

| Interface | URL (local) |
|---|---|
| Scalar UI (interactive) | http://localhost:3000/docs |
| Swagger UI | http://localhost:3000/swagger-ui/index.html |
| Raw OpenAPI 3 spec | http://localhost:3000/v3/api-docs |
| GraphQL endpoint | `POST http://localhost:3000/graphql` (use curl or Scalar — not a browser URL) |
| GraphiQL playground | http://localhost:3000/graphiql |

Every REST endpoint has `@Operation` annotations with request/response schemas including 4xx error payloads. Protected endpoints show a padlock in Scalar. The GraphQL schema is at `backend/src/main/resources/graphql/schema.graphqls`.

Available GraphQL queries: `wallets`, `wallet(id)`, `assets(walletId)`, `asset(id)`, `transactions(assetId)`.

---

## On-Chain Import

A wallet must have `chainType` (`ETH`, `BTC`, or `SOL`) and a valid `chainAddress` set. Trigger an import from the UI or via the API:

```http
POST /api/wallets/{id}/import
Authorization: Bearer <token>
```

Example response:

```json
{ "imported": 12, "skipped": 3, "failed": 0 }
```

Imports are idempotent — re-running never creates duplicates. Historical prices for imported transactions are resolved automatically; any that fail due to rate limiting are retried on the next import.

| Chain | Provider | Key required |
|---|---|---|
| ETH | Etherscan | `ETHERSCAN_API_KEY` |
| BTC | Blockstream Esplora | none |
| SOL | Helius | `HELIUS_API_KEY` |

---

## Testing

The test suite runs against H2 in-memory — no Docker or database needed:

```bash
cd backend
./mvnw test
```

38 tests across:

| Class | What it tests |
|---|---|
| `WalletServiceTest` | Wallet CRUD, portfolio aggregation |
| `AssetServiceTest` | Asset mapping, live price integration |
| `TransactionServiceTest` | Transaction CRUD, orphan asset cleanup |
| `AuthControllerTest` | Register, login, duplicate email |
| `WalletControllerTest` | REST endpoints, auth, address validation |
| `CoinGeckoClientTest` | External API client |
| `OpenApiSmokeTest` | OpenAPI spec loads and is valid |
| `GraphQlSmokeTest` | GraphiQL returns 200, unauthenticated POST /graphql is rejected |

---

## CI/CD

On every push and PR to `main`, GitHub Actions runs backend tests and a frontend production build in parallel (`.github/workflows/ci.yml`).

On every merge to `main`:

**CD** (`.github/workflows/cd.yml`) — deploys to the production server:
1. Builds backend and frontend Docker images
2. Pushes them to GitHub Container Registry (`ghcr.io/wsukram/`)
3. SSHes into the production server as a dedicated `deploy` user
4. Pulls the new images and restarts containers

**Pages** (`.github/workflows/pages.yml`) — deploys the MkDocs documentation site:
1. Installs `mkdocs-material` and runs `mkdocs build` against `docs/` + `mkdocs.yml`
2. Deploys the generated `site/` to GitHub Pages at `https://wsukram.github.io/DHBW_WalletPulse/`

Required GitHub Secrets: `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`.

---

## License

Released under the [MIT License](LICENSE).

---

**Course**: Web Engineering 2 · **University**: DHBW Ravensburg Campus Friedrichshafen · **Author**: Markus Wenninger
