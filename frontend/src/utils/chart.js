export const timeRanges = ['1W', '1M', '1Y', 'ALL'];

export const getChartLabels = (range) => {
  const now = new Date();
  if (range === '1W') {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    });
  }
  if (range === '1M') {
    // 6 labels over 30 days (cutoff = -1 month). Stride 6 days. Aligned with cutoff.
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (30 - i * 6));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
  }
  if (range === '1Y') {
    // 7 labels over 12 months (cutoff = -1 year). Stride 2 months. Aligned with cutoff.
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() - (12 - i * 2));
      return d.toLocaleDateString('en-US', { month: 'short' });
    });
  }
  const year = now.getFullYear();
  return [year - 4, year - 3, year - 2, year - 1, year].map(String);
};

/**
 * Reconstructs portfolio cost and value over time by replaying every transaction
 * in chronological order and accumulating per-asset holdings. The timeline is
 * sampled into N+1 evenly-spaced points between the first transaction (or the
 * range cutoff, whichever is later) and now, so the chart has a fixed number
 * of vertices regardless of how many transactions exist.
 *
 * Note: current market price is used for every sample — we do not look up the
 * historical price at each point, so the resulting "value" curve is an
 * approximation that mirrors today's prices applied to past holdings.
 */
export const computePortfolioChartPoints = (txs, allAssets, range) => {
  if (!txs.length) return [];

  const now = new Date();
  let cutoff = null;
  if (range === '1W') { cutoff = new Date(now); cutoff.setDate(now.getDate() - 7); }
  else if (range === '1M') { cutoff = new Date(now); cutoff.setMonth(now.getMonth() - 1); }
  else if (range === '1Y') { cutoff = new Date(now); cutoff.setFullYear(now.getFullYear() - 1); }

  const priceMap = {};
  const assetCoinMap = {};
  allAssets.forEach((a) => {
    priceMap[a.coinId] = a.currentPrice;
    assetCoinMap[String(a.id)] = a.coinId;
  });

  const sorted = [...txs].sort((a, b) => new Date(a.date) - new Date(b.date));
  const firstTxDate = new Date(sorted[0].date);
  const rangeStart = cutoff && cutoff > firstTxDate ? cutoff : firstTxDate;
  const span = now - rangeStart;
  if (span <= 0) return [];

  const N = 40;
  const holdings = {};
  let cost = 0;
  let txIdx = 0;

  while (txIdx < sorted.length && new Date(sorted[txIdx].date) < rangeStart) {
    const tx = sorted[txIdx];
    holdings[tx.assetId] = (holdings[tx.assetId] || 0) + tx.amount;
    cost += tx.amount * tx.buyPrice;
    txIdx++;
  }

  const points = [];
  for (let i = 0; i <= N; i++) {
    const t = new Date(rangeStart.getTime() + (span * i) / N);
    while (txIdx < sorted.length && new Date(sorted[txIdx].date) <= t) {
      const tx = sorted[txIdx];
      holdings[tx.assetId] = (holdings[tx.assetId] || 0) + tx.amount;
      cost += tx.amount * tx.buyPrice;
      txIdx++;
    }
    let value = 0;
    Object.entries(holdings).forEach(([aid, amt]) => {
      const coinId = assetCoinMap[String(aid)];
      value += amt * (priceMap[coinId] || 0);
    });
    points.push({ t, cost, value });
  }
  return points;
};

export const computeAssetChartPoints = (txs, asset, range) => {
  if (!txs.length || !asset) return [];
  const assetTxs = txs.filter((tx) => tx.coinId === asset.coinId);
  if (!assetTxs.length) return [];

  const now = new Date();
  let cutoff = null;
  if (range === '1W') { cutoff = new Date(now); cutoff.setDate(now.getDate() - 7); }
  else if (range === '1M') { cutoff = new Date(now); cutoff.setMonth(now.getMonth() - 1); }
  else if (range === '1Y') { cutoff = new Date(now); cutoff.setFullYear(now.getFullYear() - 1); }

  const sorted = [...assetTxs].sort((a, b) => new Date(a.date) - new Date(b.date));
  const firstTxDate = new Date(sorted[0].date);
  const rangeStart = cutoff && cutoff > firstTxDate ? cutoff : firstTxDate;
  const span = now - rangeStart;
  if (span <= 0) return [];

  const N = 40;
  let holdings = 0;
  let cost = 0;
  let txIdx = 0;

  while (txIdx < sorted.length && new Date(sorted[txIdx].date) < rangeStart) {
    holdings += sorted[txIdx].amount;
    cost += sorted[txIdx].amount * sorted[txIdx].buyPrice;
    txIdx++;
  }

  const points = [];
  for (let i = 0; i <= N; i++) {
    const t = new Date(rangeStart.getTime() + (span * i) / N);
    while (txIdx < sorted.length && new Date(sorted[txIdx].date) <= t) {
      holdings += sorted[txIdx].amount;
      cost += sorted[txIdx].amount * sorted[txIdx].buyPrice;
      txIdx++;
    }
    points.push({ t, cost, value: holdings * (asset.currentPrice || 0) });
  }
  return points;
};

/**
 * Converts a series of `{cost, value, t}` points into an SVG path string.
 * The chart uses a 100×100 viewBox: x is the point's index mapped to 0–100,
 * y maps the value into 10–95 (95 puts the baseline a little above the bottom
 * edge, the 85-unit span leaves a 5-unit top margin so the line never touches
 * the chart edge). With `closed = true` the path is closed down to the bottom
 * edge, which we use for the filled area below the line.
 */
export const pointsToPath = (points, key, minV, maxV, closed = false) => {
  if (!points.length || maxV === minV) return '';
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * 100;
    const y = 95 - ((p[key] - minV) / (maxV - minV)) * 85;
    return [x, y];
  });
  const d = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
  return closed ? `${d} L100 100 L0 100 Z` : d;
};
