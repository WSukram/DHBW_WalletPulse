# Frontend

## Stack

| | |
|---|---|
| Framework | React 19 |
| Build tool | Vite |
| Styling | Tailwind utilities + inline theme tokens (soft-stack design system) |
| Typography | General Sans (display), Geist Sans (body), JetBrains Mono (tabular data) |
| HTTP client | axios |
| Icons | Material Symbols Outlined (Google Fonts) |
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
| `*` | NotFound — 404 catch-all |

### Protected Routes

Protected routes are wrapped by `PrivateRoute` (redirects to `/login` if unauthenticated) and rendered inside `MainLayout` (sidebar + top nav).

| Path | Page |
|---|---|
| `/dashboard` | Portfolio summary, total value |
| `/wallet` | Per-wallet asset list and transaction history |
| `/assets` | All assets grouped by coin across wallets |
| `/history` | Full transaction history with CSV export |
| `/analytics` | Historical portfolio value chart |
| `/security` | Change password, display currency, theme preferences, account deletion |

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
| `utils/exportCsv.js` | CSV blob download helper used by History and Wallet pages. |

### Hooks

| File | Purpose |
|---|---|
| `hooks/useLivePrices.js` | Fetches `GET /api/market/prices` (public) on mount and every 60 s. Used by `Home.jsx`. |
| `hooks/usePortfolioData.js` | Cascades `GET /api/wallets → GET /api/wallets/{id}/portfolio → GET /api/assets/{id}/transactions`. Returns `{ wallets, portfolios, transactions, isLoading, error, reload }`. Used by Analytics, Assets, and History. |
| `hooks/usePageTitle.js` | One-liner that sets `document.title = '${title} · WalletPulse'`. |

### Theme

`theme/softStack.js` is the design system. It exports `LIGHT` and `DARK` palette objects (~50 tokens each — paper surfaces, ink/sub-ink text, mint/lavender/cream brand tints, hairlines, shadows, and CTA pairs), plus shared text styles (`headlineStyle`, `monoStyle`, `bodyFontFamily`) and a `usePrefersDark()` hook. The hook observes the `.dark` class on `<html>` (which `AppContext` toggles based on the user's Light/Dark/System preference) and falls back to `matchMedia('(prefers-color-scheme: dark)')` for prerender. Every page resolves its theme at the top with `const t = usePrefersDark() ? DARK : LIGHT;` and reads `t.*` inline.

## Styling

The codebase uses **inline theme tokens** rather than utility class names for colors. Layout primitives (`flex`, `grid`, `gap-*`, `rounded-*`, responsive `md:` / `lg:` prefixes) still come from Tailwind. Surfaces, text, hairlines, shadows, and brand tints come from the `LIGHT`/`DARK` objects in `theme/softStack.js`.

Dark mode is driven by the `.dark` class on `<html>`, which `AppContext` toggles in response to the user's preference (`Light` / `Dark` / `System`). The `.dark` class is the single source of truth — `usePrefersDark()` observes this class via `MutationObserver` with no live OS listener.

Provider logos (CoinGecko, Etherscan, Helius, Blockstream) shown on the Home page live in `public/logos/` as PNGs.

## API Communication

`VITE_API_URL` is baked into the bundle at build time. In production Docker builds it is set to an empty string so axios uses same-origin relative paths — the frontend nginx then proxies API requests to the backend container. For local dev it defaults to `http://localhost:8080`.

## The Docs Page

`pages/Docs.jsx` renders `<ApiReferenceReact />` from `@scalar/api-reference-react` pointing at `${VITE_API_URL}/v3/api-docs`. It is lazy-loaded via `React.lazy()` in `App.jsx` to keep Scalar's ~2.5 MB bundle out of the main chunk.
