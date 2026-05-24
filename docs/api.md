# API Reference

Full interactive documentation is available at `/docs` (Scalar UI, backed by the OpenAPI 3 spec served at `/v3/api-docs`). Swagger UI is also available at `/swagger-ui/index.html`. This page provides a quick endpoint reference.

## Authentication

All protected endpoints require a `Bearer` token in the `Authorization` header. Obtain one via `POST /api/auth/login`.

## REST Endpoints

### Auth (public except `/refresh`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new user account |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT |
| `POST` | `/api/auth/refresh` | Issue a fresh JWT (requires the current one) |

### Wallets

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/wallets` | List all wallets for the authenticated user |
| `GET` | `/api/wallets/{id}` | Get a single wallet |
| `POST` | `/api/wallets` | Create a new wallet |
| `PUT` | `/api/wallets/{id}` | Update a wallet |
| `DELETE` | `/api/wallets/{id}` | Delete a wallet and all its assets |
| `GET` | `/api/wallets/{id}/portfolio` | Get portfolio summary for a wallet |
| `POST` | `/api/wallets/{id}/import` | Import on-chain transactions (ETH, BTC, SOL) |

### Assets

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/wallets/{id}/assets` | List assets in a wallet |
| `POST` | `/api/wallets/{id}/assets` | Add an asset to a wallet |
| `GET` | `/api/assets/{id}` | Get a single asset |
| `PUT` | `/api/assets/{id}` | Update an asset's coin id |
| `DELETE` | `/api/assets/{id}` | Delete an asset and its transactions |

### Transactions

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/assets/{id}/transactions` | List transactions for an asset |
| `GET` | `/api/transactions/{id}` | Get a single transaction |
| `POST` | `/api/assets/{id}/transactions` | Add a transaction |
| `PUT` | `/api/transactions/{id}` | Update a transaction (manual only) |
| `DELETE` | `/api/transactions/{id}` | Delete a transaction (manual only) |

### User

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/user/me` | Get the authenticated user's profile |
| `PUT` | `/api/user/me/preferences` | Update display preferences (currency, theme) |
| `PUT` | `/api/user/me/password` | Change password (minimum 12 characters) |
| `DELETE` | `/api/user/me` | Delete account and all associated data (requires current password) |

### Market (public)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/market/prices` | Live BTC, ETH, SOL prices in EUR. Cached in Caffeine for 5 min. |

## GraphQL

| | |
|---|---|
| Endpoint | `POST /graphql` |
| Auth | Bearer token required |
| Playground | `GET /graphiql` |

### Available Queries

```graphql
wallets: [Wallet!]!
wallet(id: ID!): Wallet
assets(walletId: ID!): [Asset!]!
asset(id: ID!): Asset
transactions(assetId: ID!): [Transaction!]!
```

Computed fields on `Asset` (`totalAmount`, `totalInvested`, `currentPrice`, `currentValue`, `profit`) are resolved server-side via `AssetService`. All queries are scoped to the authenticated user.
