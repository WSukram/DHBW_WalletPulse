export const COIN_META = {
  bitcoin:  { name: 'Bitcoin',  symbol: 'BTC', color: '#F7931A', icon: '₿', mui: 'currency_bitcoin' },
  ethereum: { name: 'Ethereum', symbol: 'ETH', color: '#627EEA', icon: 'Ξ', mui: 'token' },
  solana:   { name: 'Solana',   symbol: 'SOL', color: '#14F195', icon: 'S', mui: 'toll' },
};

export const TICKER_COINS = [
  { id: 'bitcoin',  symbol: 'BTC', name: 'Bitcoin',  color: '#F7931A' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', color: '#627EEA' },
  { id: 'solana',   symbol: 'SOL', name: 'Solana',   color: '#14F195' },
];

export const KNOWN_COINS = [
  { id: 'bitcoin',  name: 'Bitcoin',  symbol: 'BTC' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  { id: 'solana',   name: 'Solana',   symbol: 'SOL' },
];

export const coinMeta = (coinId) => {
  if (!coinId) {
    return { name: 'Unknown', symbol: '?', color: '#888888', icon: '?', mui: 'generating_tokens' };
  }
  return COIN_META[coinId] ?? {
    name: coinId.charAt(0).toUpperCase() + coinId.slice(1),
    symbol: coinId.slice(0, 4).toUpperCase(),
    color: '#888888',
    icon: coinId[0].toUpperCase(),
    mui: 'generating_tokens',
  };
};

export const formatPct = (profit, invested) => {
  if (!invested || invested === 0) return '0.00%';
  const pct = ((profit / invested) * 100).toFixed(2);
  return (profit >= 0 ? '+' : '') + pct + '%';
};
