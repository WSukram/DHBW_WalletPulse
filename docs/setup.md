# Setup

## Prerequisites

- Docker and Docker Compose (Docker Desktop or Docker Engine + Compose plugin)
- A `.env` file at the repo root (copy from `.env.example` and fill in values)

## Environment Variables

Copy the template:

```bash
cp .env.example .env
```

### Required

| Variable | Description |
|---|---|
| `JWT_SECRET` | Signing secret for JWT tokens. Generate with `openssl rand -base64 48`. |

### Strongly Recommended

| Variable | Description |
|---|---|
| `COINGECKO_API_KEY` | CoinGecko API key. Without it the free tier applies, which is severely rate-limited. Get one at [coingecko.com](https://www.coingecko.com/en/api). |

### Required for On-Chain Import

| Variable | Description |
|---|---|
| `ETHERSCAN_API_KEY` | Required to import Ethereum transactions. Get one at [etherscan.io/apis](https://etherscan.io/apis). |
| `HELIUS_API_KEY` | Required to import Solana transactions. Get one at [helius.dev](https://www.helius.dev/). |

Bitcoin import uses Blockstream's public API and requires no key.

### Optional

| Variable | Description |
|---|---|
| `DB_PASSWORD` | PostgreSQL password. Defaults to `postgres` (fine for local; override for prod). |

Database name (`walletpulse`) and user (`postgres`) are hardcoded in `docker-compose.yml`. Token lifetime is hardcoded to 10 minutes (`JWT_EXPIRATION: 600000`) in the compose file; auto-refresh keeps sessions alive transparently.

## Starting the Application

```bash
docker compose up --build
```

This starts the database, backend, and frontend containers with healthchecks. On first start, Spring Boot creates the database schema automatically.

Stop the application with:

```bash
docker compose down
```

Start the application in detached mode with:

```bash
docker compose up -d
```

To wipe all data and start fresh, run:

```bash
docker compose down -v && docker compose up --build
```

## Local Service URLs

| Service | URL |
|---|---|
| App | [http://localhost:3000](http://localhost:3000) |
| API Docs (Scalar) | [http://localhost:3000/docs](http://localhost:3000/docs) |
| GraphiQL playground | [http://localhost:3000/graphiql](http://localhost:3000/graphiql) |
| Raw OpenAPI spec | [http://localhost:3000/v3/api-docs](http://localhost:3000/v3/api-docs) |

## Backend Development (without Docker)

The backend can be run directly if a PostgreSQL instance is available. Provide all required env vars in your shell or IDE run configuration, then:

```bash
cd backend
./mvnw spring-boot:run
```

Tests use H2 in-memory and require no running database:

```bash
cd backend
./mvnw test
```
