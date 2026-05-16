import { useState, useEffect } from 'react';
import axios from 'axios';

const REFRESH_MS = 60_000;

export const useLivePrices = () => {
  const [prices, setPrices] = useState({});

  useEffect(() => {
    let cancelled = false;
    const fetchPrices = () =>
      axios
        .get('/api/market/prices')
        .then((res) => { if (!cancelled) setPrices(res.data); })
        .catch(() => {});
    fetchPrices();
    const timer = setInterval(fetchPrices, REFRESH_MS);
    return () => { cancelled = true; clearInterval(timer); };
  }, []);

  return prices;
};
