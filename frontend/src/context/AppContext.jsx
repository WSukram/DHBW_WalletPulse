import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Fallback rates used only when the live FX/BTC lookups have not yet completed
// or have failed. The defaults are deliberately conservative so a first paint
// before the fetches resolve still shows a sensible number.
const FALLBACK_RATES = { EUR: 1, USD: 1.09, BTC: 0.0000148 };

const fmt = (value, currency, rates) => {
  const effective = rates ?? FALLBACK_RATES;
  const rate = effective[currency] ?? FALLBACK_RATES[currency];
  const v = (value ?? 0) * rate;
  if (currency === 'BTC') return `₿ ${v.toFixed(6)}`;
  return new Intl.NumberFormat(currency === 'EUR' ? 'de-DE' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(v);
};

const FX_REFRESH_MS = 5 * 60 * 1000;

const applyTheme = (theme) => {
  const html = document.documentElement;
  if (theme === 'Dark') {
    html.classList.add('dark');
  } else if (theme === 'Light') {
    html.classList.remove('dark');
  } else {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) html.classList.add('dark');
    else html.classList.remove('dark');
  }
};

export const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const loadStoredUser = () => {
  try {
    const token = localStorage.getItem('wp_token');
    if (!token || isTokenExpired(token)) return null;
    const raw = localStorage.getItem('wp_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const savePreferencesToBackend = (currency, theme) => {
  if (!localStorage.getItem('wp_token')) return;
  axios.put('/api/user/me/preferences', { currency, theme }).catch(() => {});
};

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const storedUser = loadStoredUser();
  const [currency, setCurrencyRaw] = useState(storedUser?.preferredCurrency ?? 'EUR');
  const [theme, setThemeRaw] = useState(storedUser?.preferredTheme ?? 'System');
  const [user, setUser] = useState(storedUser);

  const currencyRef = useRef(currency);
  const themeRef = useRef(theme);
  const [rates, setRates] = useState(FALLBACK_RATES);

  const clearSession = useCallback(() => {
    localStorage.removeItem('wp_token');
    localStorage.removeItem('wp_user');
    localStorage.removeItem('wp_currency');
    localStorage.removeItem('wp_theme');
    delete axios.defaults.headers.common['Authorization'];
    setCurrencyRaw('EUR');
    currencyRef.current = 'EUR';
    setThemeRaw('System');
    themeRef.current = 'System';
    setUser(null);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, []);

  // Pull a live EUR→USD rate from frankfurter.app (free, no key) and the
  // current BTC/EUR price from our own backend. BTC moves quickly; FX moves
  // slowly. One 5-minute refresh covers both. We use native fetch for the
  // third-party call so axios's default Authorization header isn't sent to
  // frankfurter.app.
  useEffect(() => {
    let cancelled = false;
    const fetchRates = async () => {
      try {
        const [fxResp, pricesResp] = await Promise.all([
          fetch('https://api.frankfurter.app/latest?from=EUR&to=USD').then((r) => r.json()).catch(() => null),
          axios.get('/api/market/prices').then((r) => r.data).catch(() => null),
        ]);
        if (cancelled) return;
        const usd = fxResp?.rates?.USD ?? FALLBACK_RATES.USD;
        const btcEur = pricesResp?.bitcoin?.eur;
        const btc = btcEur && btcEur > 0 ? 1 / Number(btcEur) : FALLBACK_RATES.BTC;
        setRates({ EUR: 1, USD: usd, BTC: btc });
      } catch { /* keep last good rates */ }
    };
    fetchRates();
    const timer = setInterval(fetchRates, FX_REFRESH_MS);
    return () => { cancelled = true; clearInterval(timer); };
  }, []);

  // Restore axios header if session is still valid
  useEffect(() => {
    const token = localStorage.getItem('wp_token');
    if (token && !isTokenExpired(token)) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else if (token) {
      // Token exists but is expired — clear everything silently
      clearSession();
    }
  }, []);

  // Proactive session expiry — redirect to login exactly when the token expires.
  // Self-reschedules if the token was refreshed in the meantime.
  useEffect(() => {
    if (!user) return;
    let timer;
    const schedule = () => {
      const token = localStorage.getItem('wp_token');
      if (!token) return;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiresIn = payload.exp * 1000 - Date.now();
        if (expiresIn <= 0) {
          clearSession();
          navigate('/login');
          return;
        }
        timer = setTimeout(() => {
          const current = localStorage.getItem('wp_token');
          if (!current || isTokenExpired(current)) {
            clearSession();
            navigate('/login');
          } else {
            schedule();
          }
        }, expiresIn);
      } catch {}
    };
    schedule();
    return () => clearTimeout(timer);
  }, [user, clearSession, navigate]);

  // Auto-refresh the JWT shortly before it expires. We trigger a refresh on the
  // first request that finds less than two minutes of lifetime left and share
  // the in-flight request between concurrent callers so they all attach the new
  // token. If the refresh fails we let the original request continue with the
  // old token — the response interceptor below will catch the inevitable 401.
  useEffect(() => {
    let refreshing = null;
    const interceptor = axios.interceptors.request.use(async (config) => {
      if (config.url?.includes('/api/auth/')) return config;
      const token = localStorage.getItem('wp_token');
      if (!token) return config;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiresIn = payload.exp * 1000 - Date.now();
        if (expiresIn < 120000 && expiresIn > 0) {
          if (!refreshing) {
            refreshing = axios.post('/api/auth/refresh').then((res) => {
              const newToken = res.data.token;
              localStorage.setItem('wp_token', newToken);
              axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            }).catch(() => {}).finally(() => { refreshing = null; });
          }
          await refreshing;
          config.headers['Authorization'] = `Bearer ${localStorage.getItem('wp_token')}`;
        }
      } catch {}
      return config;
    });
    return () => axios.interceptors.request.eject(interceptor);
  }, []);

  // Intercept 401 responses and redirect to login. The guard on the current
  // path stops a burst of concurrent 401s (e.g. after a refresh failure) from
  // each firing its own navigate + clearSession.
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      (error) => {
        if (
          error.response?.status === 401 &&
          !error.config?.url?.includes('/api/auth/') &&
          window.location.pathname !== '/login'
        ) {
          clearSession();
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [navigate]);

  const setCurrency = (c) => {
    setCurrencyRaw(c);
    currencyRef.current = c;
    localStorage.setItem('wp_currency', c);
    savePreferencesToBackend(c, themeRef.current);
  };

  const setTheme = (t) => {
    setThemeRaw(t);
    themeRef.current = t;
    localStorage.setItem('wp_theme', t);
    applyTheme(t);
    savePreferencesToBackend(currencyRef.current, t);
  };

  const login = (authResponse) => {
    const { token, email, firstName, lastName, preferredCurrency, preferredTheme } = authResponse;
    const c = preferredCurrency ?? 'EUR';
    const t = preferredTheme ?? 'System';
    const userData = { email, firstName, lastName, preferredCurrency: c, preferredTheme: t };

    localStorage.setItem('wp_token', token);
    localStorage.setItem('wp_user', JSON.stringify(userData));
    localStorage.setItem('wp_currency', c);
    localStorage.setItem('wp_theme', t);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    setCurrencyRaw(c);
    currencyRef.current = c;
    setThemeRaw(t);
    themeRef.current = t;
    applyTheme(t);
    setUser(userData);
  };

  const logout = () => {
    clearSession();
  };

  const formatCurrency = (value) => fmt(value, currency, rates);

  return (
    <AppContext.Provider value={{ currency, setCurrency, theme, setTheme, formatCurrency, user, login, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
