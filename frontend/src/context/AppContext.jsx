import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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

const loadStoredUser = () => {
  try {
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
  const storedUser = loadStoredUser();
  const [currency, setCurrencyRaw] = useState(storedUser?.preferredCurrency ?? localStorage.getItem('wp_currency') ?? 'EUR');
  const [theme, setThemeRaw] = useState(storedUser?.preferredTheme ?? localStorage.getItem('wp_theme') ?? 'Dark');
  const [user, setUser] = useState(storedUser);

  const currencyRef = useRef(currency);
  const themeRef = useRef(theme);

  useEffect(() => {
    applyTheme(theme);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('wp_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

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
    const t = preferredTheme ?? 'Dark';
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
    localStorage.removeItem('wp_token');
    localStorage.removeItem('wp_user');
    localStorage.removeItem('wp_currency');
    localStorage.removeItem('wp_theme');
    delete axios.defaults.headers.common['Authorization'];
    setCurrencyRaw('EUR');
    currencyRef.current = 'EUR';
    setThemeRaw('Dark');
    themeRef.current = 'Dark';
    setUser(null);
  };

  const formatCurrency = (value) => fmt(value, currency);

  return (
    <AppContext.Provider value={{ currency, setCurrency, theme, setTheme, formatCurrency, user, login, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
