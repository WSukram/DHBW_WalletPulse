export const groupByCoin = (assets) => {
  const map = {};
  for (const a of assets) {
    if (!map[a.coinId]) {
      map[a.coinId] = { ...a };
    } else {
      const g = map[a.coinId];
      g.totalAmount = (g.totalAmount ?? 0) + (a.totalAmount ?? 0);
      g.totalInvested = (g.totalInvested ?? 0) + (a.totalInvested ?? 0);
      g.profit = (g.profit ?? 0) + (a.profit ?? 0);
      g.currentValue = (g.currentValue ?? 0) + (a.currentValue ?? 0);
    }
  }
  return Object.values(map);
};
