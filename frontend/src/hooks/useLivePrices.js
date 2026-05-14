import { useState, useEffect } from 'react';
import axios from 'axios';

export const useLivePrices = () => {
  const [prices, setPrices] = useState({});

  useEffect(() => {
    axios
      .get('/api/market/prices')
      .then((res) => setPrices(res.data))
      .catch(() => {});
  }, []);

  return prices;
};
