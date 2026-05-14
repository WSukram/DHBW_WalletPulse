import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * Loads the full portfolio cascade — wallets → portfolios → transactions —
 * in one go. Transactions are flattened across all wallets and enriched with
 * the wallet/asset context callers commonly need (`assetId`, `coinId`,
 * `walletId`, `walletName`, `chainType`). Sorted newest-first.
 *
 * Pages that mutate transactions (e.g. History edit/delete) can call `reload`
 * to refetch the whole tree.
 */
export const usePortfolioData = () => {
  const [wallets, setWallets] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() =>
    axios.get('/api/wallets')
      .then((res) => {
        const walletList = res.data;
        setWallets(walletList);
        return Promise.all(
          walletList.map((w) =>
            axios.get(`/api/wallets/${w.id}/portfolio`).then((r) => ({ wallet: w, portfolio: r.data }))
          )
        );
      })
      .then((walletPortfolios) => {
        setPortfolios(walletPortfolios.map((wp) => wp.portfolio));
        return Promise.all(
          walletPortfolios.flatMap(({ wallet, portfolio }) =>
            (portfolio.assets ?? []).map((asset) =>
              axios.get(`/api/assets/${asset.id}/transactions`).then((r) =>
                r.data.map((tx) => ({
                  ...tx,
                  assetId: asset.id,
                  coinId: asset.coinId,
                  walletId: wallet.id,
                  walletName: wallet.name,
                  chainType: wallet.chainType,
                }))
              )
            )
          )
        );
      })
      .then((txArrays) => {
        const flat = txArrays.flat().sort((a, b) => new Date(b.date) - new Date(a.date));
        setTransactions(flat);
      }),
  []);

  const reload = useCallback(() => {
    setIsLoading(true);
    setError(null);
    return load()
      .then(() => setIsLoading(false))
      .catch(() => { setError('Failed to load data.'); setIsLoading(false); });
  }, [load]);

  useEffect(() => { reload(); }, [reload]);

  return { wallets, portfolios, transactions, isLoading, error, reload };
};
