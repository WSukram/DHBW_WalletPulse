# Frontend

## Stack

| | |
|---|---|
| Framework | React 19 |
| Build tool | Vite |
| Styling | Tailwind CSS v3 with Material 3 color tokens |
| HTTP client | axios |
| Icons | Material Symbols Outlined (Google Fonts), lucide-react |
| API docs UI | Scalar (`@scalar/api-reference-react`) |

## Route Structure

### Public Routes

| Path | Page |
|---|---|
| `/` | Home — live price ticker, feature overview |
| `/login` | Login form |
| `/register` | Registration form |
| `/terms` | Terms of Service |
| `/privacy` | Privacy Policy |
| `/impressum` | Legal Notice |
| `/docs` | Scalar API reference (lazy-loaded) |

### Protected Routes

Protected routes are wrapped by `PrivateRoute` (redirects to `/login` if unauthenticated) and rendered inside `MainLayout` (sidebar + top nav).

| Path | Page |
|---|---|
| `/dashboard` | Portfolio summary, total value, allocation chart |
| `/wallet` | Per-wallet asset list and transaction history |
| `/assets` | All assets grouped by coin across wallets |
| `/history` | Full transaction history with CSV export |
| `/analytics` | Historical portfolio value chart |
| `/security` | Change password |

## Key Files

### Context

`context/AppContext.jsx` — global auth state. Stores the JWT in `localStorage` under `wp_token`, sets `axios.defaults.headers.common['Authorization']` on login, intercepts 401 responses to redirect to `/login`. Exposes `login()`, `logout()`, `formatCurrency()`, `currency`, and `theme`.

### Utilities

| File | Purpose |
|---|---|
| `utils/api.js` | Sets `axios.defaults.baseURL` from `VITE_API_URL` on app boot. Import as a side effect in `main.jsx`; all other files use bare paths like `/api/wallets`. |
| `utils/coins.js` | Single source of truth for the 3 supported coins: `COIN_META`, `coinMeta()` fallback, `formatPct()`, `TICKER_COINS`, `KNOWN_COINS`. |
| `utils/chart.js` | Shared SVG chart math: `timeRanges`, `getChartLabels`, `computePortfolioChartPoints`, `computeAssetChartPoints`, `pointsToPath`. |
| `utils/groupByCoin.js` | Merges same-coin assets across wallets for display on Assets and Analytics pages. |
| `utils/styles.js` | Shared `inputCls` / `labelCls` Tailwind strings for modal forms. |
| `utils/exportCsv.js` | CSV blob download helper used by History and Wallet pages. |

### Hooks

| File | Purpose |
|---|---|
| `hooks/useLivePrices.js` | Fetches `GET /api/market/prices` (public). Used by `Home.jsx`. |
| `hooks/usePortfolioData.js` | Cascades `GET /wallets → /portfolios → /transactions`. Returns `{ wallets, portfolios, transactions, isLoading, error, reload }`. Used by Analytics, Assets, and History. |

## Styling

Tailwind CSS v3 with a custom Material 3 palette defined in `tailwind.config.js` (primary, secondary, tertiary, error, surface tokens). Dark mode is the default, toggled by the `dark` class on `<html>` and controlled via `AppContext`.

## API Communication

`VITE_API_URL` is baked into the bundle at build time. In production Docker builds it is set to an empty string so axios uses same-origin relative paths — the frontend nginx then proxies API requests to the backend container. In GitHub Pages builds it is set to `https://walletpulse.de`.

## The Docs Page

`pages/Docs.jsx` renders `<ApiReferenceReact />` from `@scalar/api-reference-react` pointing at `${VITE_API_URL}/v3/api-docs`. It is lazy-loaded via `React.lazy()` in `App.jsx` to keep Scalar's ~2.5 MB bundle out of the main chunk.
