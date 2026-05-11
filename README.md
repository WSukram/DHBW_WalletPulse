# WalletPulse

Webanwendung zur Verwaltung eines Krypto-Portfolios mit Gewinn- und Verlustberechnung basierend auf aktuellen Marktdaten.

## Technologien
- Backend: Spring Boot (Java 21)
- Frontend: React (Vite)
- Datenbank: PostgreSQL
- Externe APIs: CoinGecko, CryptoCompare, Etherscan (ETH), Blockstream (BTC), Helius (SOL)

## Architektur
Frontend (React) ↔ Backend (Spring Boot) ↔ Drittanbieter API

## API-Dokumentation (Swagger)
- OpenAPI JSON: `/v3/api-docs`
- Swagger UI: `/swagger-ui/index.html`

## Lokale Entwicklung

### Voraussetzungen
- Java 21, Maven, Node.js, Docker

### Starten
```bash
# Datenbank starten
docker compose up -d

# Backend starten (http://localhost:8080)
cd backend && ./mvnw spring-boot:run

# Frontend starten (http://localhost:5173)
cd frontend && npm install && npm run dev
```

### Testbenutzer
Beim ersten Start legt `DataInitializer` automatisch einen Entwicklungsbenutzer an, sofern noch keiner vorhanden ist:

| Feld | Wert |
|------|------|
| E-Mail | `dev@walletpulse.local` |
| Passwort | `dev1234` |

---

## Externe API: CoinGecko (Preisdaten)

WalletPulse nutzt die [CoinGecko API](https://www.coingecko.com/en/api), um Live-Preise und historische Kurse in Euro abzufragen.

### API-Key einrichten (empfohlen)
Ohne Key ist die API stark ratenlimitiert. Der kostenlose Demo-Key erhöht das Limit auf 30 Anfragen/Minute.

1. Erstelle einen Account bei CoinGecko und generiere einen Demo-API-Key.
2. Trage ihn in `backend/src/main/resources/application.properties` ein:
   ```properties
   coingecko.api.key=DEIN_GENERIERTER_DEMO_KEY
   ```

### Historische Preise & Fallback
Der kostenlose Demo-Key unterstützt historische Kurse nur für die letzten **365 Tage**. Für ältere Transaktionen greift das Backend automatisch auf die kostenlose [CryptoCompare API](https://min-api.cryptocompare.com) zurück — kein zusätzlicher Key erforderlich.

Abgefragte Preise werden gecacht (aktuelle Preise im RAM, historische Preise dauerhaft in der Datenbank), um API-Aufrufe zu minimieren.

---

## Externe API: Etherscan (ETH Blockchain-Import)

WalletPulse importiert Transaktionen direkt von einer Ethereum-Wallet-Adresse über die [Etherscan API v2](https://docs.etherscan.io/v2-migration).

### API-Key einrichten
1. Erstelle einen kostenlosen Account auf [etherscan.io](https://etherscan.io).
2. Gehe zu **My Account → API Keys** und erstelle einen neuen Key.
3. Trage ihn in `application.properties` ein:
   ```properties
   etherscan.api.key=DEIN_ETHERSCAN_KEY
   ```

### Was wird importiert?

| Typ | Beschreibung |
|-----|-------------|
| Native ETH | Eingehende ETH-Transfers |
| ERC-20 Tokens | Eingehende Token-Transfers (USDC, USDT, DAI, WBTC, LINK, UNI u. v. m.) |

---

## Externe API: Blockstream (BTC Blockchain-Import)

Für Bitcoin wird die kostenlose [Blockstream Esplora API](https://github.com/Blockstream/esplora/blob/master/API.md) verwendet. **Kein API-Key erforderlich.**

- Setze `chainType=BTC` und deine Bitcoin-Adresse (z. B. `bc1q...` oder `1A2b3C...`) in der Wallet.
- Rufe `POST /api/wallets/{id}/import` auf.

---

## Externe API: Helius (SOL Blockchain-Import)

Für Solana wird die [Helius API](https://helius.dev) verwendet (Free Plan: 100.000 req/Monat).

### API-Key einrichten
1. Erstelle einen kostenlosen Account auf [helius.dev](https://helius.dev).
2. Trage den Key in `application.properties` ein:
   ```properties
   helius.api.key=DEIN_HELIUS_KEY
   ```

### Was wird importiert?

| Typ | Beschreibung |
|-----|-------------|
| Native SOL | Eingehende SOL-Transfers |
| SPL Tokens | Eingehende Token-Transfers (WBTC, USDC, USDT, BONK, JUP u. v. m.) |

---

## Import auslösen

Eine Wallet muss mit `chainType` (`ETH`, `BTC` oder `SOL`) und einer `chainAddress` konfiguriert sein. Der Import wird über die UI oder direkt per API ausgelöst:

```
POST /api/wallets/{id}/import
Authorization: Bearer <JWT-Token>
```

Antwort:
```json
{ "imported": 12, "skipped": 3, "failed": 0 }
```

Der Import ist idempotent — mehrmaliges Aufrufen fügt keine Duplikate ein. Transaktionen, für die beim ersten Import kein historischer Preis ermittelt werden konnte (z. B. wegen Rate-Limiting), werden bei erneutem Import automatisch nachgepflegt.
