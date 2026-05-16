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

### Controller Integration Tests

These tests load the full Spring context, start an embedded server, and exercise HTTP endpoints end-to-end.

| Class | What it covers |
|---|---|
| `AuthControllerTest` | Register, login, duplicate email rejection |
| `WalletControllerTest` | Wallet CRUD and import endpoints, auth enforcement, address validation |

### External Client Tests

| Class | What it covers |
|---|---|
| `CoinGeckoClientTest` | Live and historical price calls, response parsing, error handling |

### Smoke Tests

| Class | What it covers |
|---|---|
| `BackendApplicationTests` | Spring context loads successfully |
| `OpenApiSmokeTest` | OpenAPI 3 spec is generated and served at `/v3/api-docs` |
| `GraphQlSmokeTest` | GraphiQL returns 200 without auth; `POST /graphql` without a JWT is rejected. Schema validity is implicitly verified by context load. |

## Coverage Notes

- The `shouldDeleteTransactionAndAssetWhenLastOne` and `shouldDeleteTransactionButKeepAssetWhenOthersRemain` tests verify the orphan-cleanup behaviour in `TransactionService`.
- External API clients (`CoinGeckoClient`, `EtherscanClient`, etc.) are mocked in tests that exercise the services depending on them.
- Controller integration tests stub out external API clients via `@MockitoBean` so HTTP-level behaviour can be exercised without real network calls.
