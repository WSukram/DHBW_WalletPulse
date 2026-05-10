# WalletPulse

Webanwendung zur Verwaltung eines Krypto-Portfolios mit Gewinn- und Verlustberechnung basierend auf aktuellen Marktdaten.

## Technologien
- Backend: Spring Boot (Java 21)
- Frontend: React (Vite)
- Datenbank: PostgreSQL
- Externe APIs: CoinGecko, Etherscan (ETH), Blockstream (BTC), Helius (SOL)

## Architektur
Frontend (React) ↔ Backend (Spring Boot) ↔ Drittanbieter API

## API-Dokumentation (Swagger)
- OpenAPI JSON: `/v3/api-docs`
- Swagger UI: `/swagger-ui/index.html`

## Externe API (CoinGecko)
WalletPulse nutzt die [CoinGecko API](https://www.coingecko.com/en/api) im Backend, um Live-Preise für Kryptowährungen in Euro abzufragen. 
Diese Live-Daten bilden die Grundlage für die Berechnung des aktuellen Portfoliowerts und der Gewinn-/Verlust-Entwicklung.

### API-Key konfigurieren (Optional, aber empfohlen)
Ohne Key ist die API stark ratenlimitiert (Rate-Limiting). Für eine robuste Entwicklung empfiehlt es sich, einen kostenlosen Demo-API-Key bei CoinGecko zu erstellen.

**So richtest du den Key ein:**
1. Erstelle einen Account bei CoinGecko und generiere einen Demo-API-Key.
2. Öffne die Datei `backend/src/main/resources/application.properties`.
3. Füge deinen Key wie folgt ein:
   ```properties
   coingecko.api.key=DEIN_GENERIERTER_DEMO_KEY
   ```
Das Backend fügt diesen Key dann bei jedem Request automatisch als `x-cg-demo-api-key`-Header hinzu. Um das Limit der API zusätzlich zu schonen, werden abgefragte Preise in Spring Boot im RAM gecached sowie historische Preise dauerhaft in der Datenbank gespeichert.

---

## Externe API: Etherscan (ETH Blockchain-Import)

WalletPulse kann Transaktionen direkt von einer Ethereum-Wallet-Adresse importieren. Dafür wird die [Etherscan API](https://etherscan.io/apis) verwendet.

### API-Key einrichten

1. Erstelle einen kostenlosen Account auf [etherscan.io](https://etherscan.io).
2. Gehe zu **My Account → API Keys** und erstelle einen neuen Key (Free Plan reicht aus: 5 req/s, 100.000 req/Tag).
3. Öffne `backend/src/main/resources/application.properties` und trage den Key ein:
   ```properties
   etherscan.api.key=DEIN_ETHERSCAN_KEY
   ```

### Wallet für den Import konfigurieren

Eine Wallet muss mit einer Blockchain-Adresse verknüpft sein, bevor sie importiert werden kann. Setze beim Erstellen oder Aktualisieren einer Wallet:
- `chainType`: `ETH` (aktuell unterstützt; `BTC` und `SOL` folgen)
- `chainAddress`: deine öffentliche Ethereum-Adresse (z. B. `0xAbCd...`)

### Import auslösen

```
POST /api/wallets/{id}/import
Authorization: Bearer <dein-JWT-Token>
```

Die Antwort zeigt, wie viele Transaktionen importiert, übersprungen (bereits vorhanden) oder fehlgeschlagen sind:
```json
{ "imported": 12, "skipped": 3, "failed": 0 }
```

Der Import ist idempotent — mehrmaliges Aufrufen fügt keine Duplikate ein.

### Was wird importiert?

| Typ | Beschreibung |
|-----|-------------|
| Native ETH | Eingehende ETH-Transfers |
| ERC-20 Tokens | Eingehende Token-Transfers (USDC, USDT, DAI, WBTC, LINK, UNI u. v. m.) |

Für jeden importierten Kauf wird automatisch der historische EUR-Kurs zum Transaktionsdatum über CoinGecko abgerufen und als Kaufpreis gespeichert.

---

## Externe API: Blockstream (BTC Blockchain-Import)

Für Bitcoin wird die kostenlose [Blockstream Esplora API](https://github.com/Blockstream/esplora/blob/master/API.md) verwendet. **Kein API-Key erforderlich.**

- Setze `chainType=BTC` und deine Bitcoin-Adresse (z. B. `bc1q...` oder `1A2b3C...`) in der Wallet.
- Rufe danach `POST /api/wallets/{id}/import` auf — fertig.

---

## Externe API: Helius (SOL Blockchain-Import)

Für Solana wird die [Helius API](https://helius.dev) verwendet (Free Plan: 100.000 req/Monat).

### API-Key einrichten

1. Erstelle einen kostenlosen Account auf [helius.dev](https://helius.dev).
2. Kopiere deinen API-Key aus dem Dashboard.
3. Trage ihn in `backend/src/main/resources/application.properties` ein:
   ```properties
   helius.api.key=DEIN_HELIUS_KEY
   ```

- Setze `chainType=SOL` und deine Solana-Adresse in der Wallet.
- Rufe `POST /api/wallets/{id}/import` auf.
