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
Das Backend fügt diesen Key dann bei jedem Request automatisch als `x-cg-demo-api-key`-Header hinzu. Um das Limit der API zusätzlich zu schonen, werden abgefragte Preise in Spring Boot im RAM gecached.
