# Architecture

## System Components

Three Docker containers communicate over an internal Docker network:

| Container | Image | Exposed |
|---|---|---|
| `db` | postgres:15 | internal only (prod) |
| `backend` | ghcr.io/wsukram/walletpulse-backend | internal only (prod) |
| `frontend` | ghcr.io/wsukram/walletpulse-frontend | port 3000 |

The frontend nginx serves the React SPA and proxies `/api/*`, `/graphql`, `/graphiql`, `/v3/api-docs`, and `/swagger-ui` to the backend container. Browsers never talk directly to the backend.

## Backend Layer Structure

Java package: `de.dhbwravensburg.webengineering2.walletpulse.backend`

| Package | Responsibility |
|---|---|
| `entity/` | JPA entities: `User`, `Wallet`, `Asset`, `Transaction`, `HistoricalPrice` |
| `repository/` | Spring Data JPA repositories |
| `service/` | Business logic |
| `service/blockchain/` | Per-chain import logic (`EthereumImporter`, `BitcoinImporter`, `SolanaImporter`) |
| `controller/` | REST controllers — all endpoints under `/api/*` |
| `controller/dto/` | Request and response DTOs |
| `api/` | External API clients (CoinGecko, Etherscan, Blockstream, Helius, CryptoCompare) |
| `security/` | `JwtService`, `JwtAuthFilter`, `UserDetailsServiceImpl` |
| `config/` | `SecurityConfig` (includes CORS), `RestTemplateConfig` (Caffeine cache), `OpenApiConfig` |
| `exception/` | `GlobalExceptionHandler`, `ResourceNotFoundException`, `BusinessException`, `ConflictException` |

## Data Model

```
User
 └── Wallet (OneToMany, owner_id FK)
      └── Asset (OneToMany, cascade ALL)
           └── Transaction (OneToMany, cascade ALL)

HistoricalPrice  (standalone cache: coinId + date → eurPrice)
```

- A `Wallet` belongs to exactly one `User`.
- An `Asset` represents one coin in one wallet (e.g. BTC in "Cold Storage").
- A `Transaction` is a single buy/sell/transfer event. Source is `MANUAL` or `IMPORTED`.
- `HistoricalPrice` caches CoinGecko/CryptoCompare lookups to avoid redundant API calls.

Deleting the last transaction on an asset automatically removes the asset, preventing orphaned zero-balance entries.

## Key Services

### WalletService

CRUD for wallets. Portfolio calculation aggregates `AssetResponse` totals across all assets in a wallet.

### AssetService

Maps assets to portfolio responses including live price fetched from `CoinGeckoClient`. All queries are scoped to the authenticated user's email.

### BlockchainImportService

Thin orchestrator. Resolves the wallet, then dispatches to the matching `ChainImporter` via a `Map<ChainType, ChainImporter>` assembled by Spring DI. Per-chain importers (`EthereumImporter`, `BitcoinImporter`, `SolanaImporter`) handle fetching, deduplication, and price resolution. `ImportResult` is a top-level record.

### HistoricalPriceService

Cache-first price lookup for a coin on a given date:

1. Check the `HistoricalPrice` DB cache.
2. If missing: CoinGecko (within last 365 days).
3. Fallback: CryptoCompare (older dates).

### TransactionService

After deleting a transaction, checks whether the parent asset has any remaining transactions and removes it if not.

## External APIs

| API | Purpose | Required |
|---|---|---|
| CoinGecko | Live prices, historical prices (last 365 days) | Strongly recommended (free tier is rate-limited) |
| CryptoCompare | Historical price fallback for dates older than 365 days | Optional |
| Etherscan | Import ETH transactions | Required for ETH import |
| Blockstream | Import BTC transactions | Public, no key needed |
| Helius | Import SOL transactions | Required for SOL import |
