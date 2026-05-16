# Testing

## Overview

The backend has 38 tests written with JUnit 5 and Spring Boot Test. Tests use an H2 in-memory database configured with `MODE=PostgreSQL` — no running PostgreSQL instance is needed.

## Running Tests

```bash
cd backend
./mvnw test
```

Run a single test class:

```bash
./mvnw test -Dtest=WalletServiceTest
```

## Test Configuration

Tests activate the `test` Spring profile, which loads `application-test.properties`. This overrides the datasource with H2 and disables JPA's DDL auto-management beyond `create-drop`. `application.properties` values never interfere with the test database.

## Test Classes

### Service Unit Tests

| Class | What it covers |
|---|---|
| `WalletServiceTest` | Wallet CRUD, portfolio aggregation, ownership enforcement |
| `AssetServiceTest` | Asset creation, portfolio response mapping, live price integration |
| `TransactionServiceTest` | Transaction CRUD, automatic asset cleanup when last transaction is deleted |
| `HistoricalPriceServiceTest` | Cache-first price lookup, CoinGecko fallback, CryptoCompare fallback |
| `BlockchainImportServiceTest` | Import orchestration, per-chain dispatch, deduplication |

### Controller Integration Tests

These tests load the full Spring context, start an embedded server, and exercise HTTP endpoints end-to-end.

| Class | What it covers |
|---|---|
| `AuthControllerTest` | Register, login, duplicate email rejection |
| `WalletControllerTest` | Wallet CRUD and import endpoints, auth enforcement |
| `AssetControllerTest` | Asset endpoints, ownership scoping |
| `TransactionControllerTest` | Transaction endpoints, manual-vs-imported distinction |
| `UserControllerTest` | Profile read, preferences update, password change |
| `MarketControllerTest` | Public market prices endpoint |

### GraphQL Tests

| Class | What it covers |
|---|---|
| `GraphQlSmokeTest` | GraphiQL returns 200 without auth; `POST /graphql` without a JWT returns 4xx. Schema validity is implicitly verified by context load. |

## Coverage Notes

- The `shouldDeleteTransactionAndAssetWhenLastOne` and `shouldDeleteTransactionButKeepAssetWhenOthersRemain` tests verify the orphan-cleanup behaviour in `TransactionService`.
- External API clients (`CoinGeckoClient`, `EtherscanClient`, etc.) are mocked in tests that exercise the services depending on them.
