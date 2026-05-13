import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const fmt = (value, currency) => {
  const RATES = { EUR: 1, USD: 1.09, BTC: 0.0000148 };
  const v = (value ?? 0) * RATES[currency];
  if (currency === 'BTC') return `₿ ${v.toFixed(6)}`;
  return new Intl.NumberFormat(currency === 'EUR' ? 'de-DE' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(v);
};

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
  axios.put('http://localhost:8080/api/user/me/preferences', { currency, theme }).catch(() => {});
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

  useEffect(() => {
    applyTheme(theme);
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

  // Auto-refresh token when less than 2 minutes remain
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
            refreshing = axios.post('http://localhost:8080/api/auth/refresh').then((res) => {
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

  // Intercept 401 responses and redirect to login
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error.response?.status === 401 && !error.config?.url?.includes('/api/auth/')) {
          clearSession();
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [navigate]);

  const clearSession = () => {
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
  };

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

  const formatCurrency = (value) => fmt(value, currency);

  return (
    <AppContext.Provider value={{ currency, setCurrency, theme, setTheme, formatCurrency, user, login, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
