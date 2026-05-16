# WalletPulse

WalletPulse is a crypto portfolio management application. Users track Bitcoin, Ethereum, and Solana holdings across multiple wallets, view live and historical valuations, and import on-chain transactions directly from public block explorers.

## Links

- Live app: [https://walletpulse.de](https://walletpulse.de)
- API Documentation: [https://walletpulse.de/docs](https://walletpulse.de/docs)
- Documentation: [https://wsukram.github.io/DHBW_WalletPulse/](https://wsukram.github.io/DHBW_WalletPulse/)
- Source: [https://github.com/WSukram/DHBW_WalletPulse](https://github.com/WSukram/DHBW_WalletPulse)

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 4, Spring Security, Spring GraphQL |
| Database | PostgreSQL 15 |
| Frontend | React 19, Vite |
| Styling | Tailwind CSS v3, Material 3 design tokens |
| API docs | Scalar (OpenAPI 3) |
| Auth | Stateless JWT  |
| Prices | CoinGecko API |
| On-chain import | Etherscan (ETH), Blockstream (BTC), Helius (SOL) |
| Container runtime | Docker, Docker Compose |
| CI/CD | GitHub Actions |

## Features

- Register and authenticate via JWT
- Create wallets and track assets manually or by importing on-chain transactions
- Live prices and portfolio valuation in EUR, USD, and BTC
- Historical price charts per asset and across the full portfolio
- Transaction history with CSV export
- Scalar interactive API docs at `/docs`
- GraphQL endpoint at `/graphql`
