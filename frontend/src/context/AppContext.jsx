import React, { createContext, useContext, useState, useEffect } from 'react';

const RATES = { EUR: 1, USD: 1.09, BTC: 0.0000148 };

const fmt = (value, currency) => {
  const v = (value ?? 0) * RATES[currency];
  if (currency === 'BTC') return `₿ ${v.toFixed(6)}`;
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

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [currency, setCurrencyRaw] = useState(() => localStorage.getItem('wp_currency') || 'EUR');
  const [theme, setThemeRaw] = useState(() => localStorage.getItem('wp_theme') || 'Dark');

  useEffect(() => {
    applyTheme(theme);
  }, []);

  const setCurrency = (c) => {
    setCurrencyRaw(c);
    localStorage.setItem('wp_currency', c);
  };

  const setTheme = (t) => {
    setThemeRaw(t);
    localStorage.setItem('wp_theme', t);
    applyTheme(t);
  };

  const formatCurrency = (value) => fmt(value, currency);

  return (
    <AppContext.Provider value={{ currency, setCurrency, theme, setTheme, formatCurrency }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
