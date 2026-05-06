import React, { useState } from 'react';

const transactions = [
  {
    date: '2023-10-24 14:32:01',
    asset: { name: 'Bitcoin', symbol: 'BTC', color: '#F7931A', icon: '₿' },
    type: 'Buy',
    typeIcon: 'arrow_downward',
    typeStyle: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amount: '+0.15000000',
    amountStyle: 'text-emerald-400',
    price: '$34,250.00',
    total: '$5,137.50',
    wallet: 'Trading Desk',
    status: 'check_circle',
    statusStyle: 'text-emerald-500',
  },
  {
    date: '2023-10-23 09:15:44',
    asset: { name: 'Ethereum', symbol: 'ETH', color: '#627EEA', icon: 'Ξ' },
    type: 'Sell',
    typeIcon: 'arrow_upward',
    typeStyle: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    amount: '-4.50000000',
    amountStyle: 'text-rose-400',
    price: '$1,850.20',
    total: '$8,325.90',
    wallet: 'Cold Storage A',
    status: 'check_circle',
    statusStyle: 'text-emerald-500',
  },
  {
    date: '2023-10-22 18:45:12',
    asset: { name: 'Solana', symbol: 'SOL', color: '#9333ea', icon: 'S' },
    type: 'Transfer',
    typeIcon: 'swap_horiz',
    typeStyle: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    amount: '125.0000000',
    amountStyle: 'text-on-surface-variant',
    price: '--',
    total: '--',
    wallet: 'Trading Desk → Cold',
    status: 'pending',
    statusStyle: 'text-amber-500',
  },
  {
    date: '2023-10-20 11:05:33',
    asset: { name: 'Bitcoin', symbol: 'BTC', color: '#F7931A', icon: '₿' },
    type: 'Buy',
    typeIcon: 'arrow_downward',
    typeStyle: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amount: '+0.05000000',
    amountStyle: 'text-emerald-400',
    price: '$33,100.00',
    total: '$1,655.00',
    wallet: 'Trading Desk',
    status: 'check_circle',
    statusStyle: 'text-emerald-500',
  },
];

const History = () => {
  const [activeWallet, setActiveWallet] = useState('All Wallets');
  const wallets = ['All Wallets', 'Cold Storage A', 'Trading Desk'];

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-layout-margin flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="font-heading-lg text-heading-lg text-on-surface mb-1">Transaction History</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">A comprehensive log of all actions across connected wallets.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-high border border-outline-variant rounded-lg hover:bg-surface-bright transition-colors font-label-sm text-label-sm text-on-surface">
          <span className="material-symbols-outlined text-[16px]">download</span>
          Export CSV
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          {/* Date Range */}
          <div className="relative">
            <select className="appearance-none pl-4 pr-10 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-label-sm text-label-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer hover:border-outline">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>This Year</option>
              <option>Custom Range...</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">calendar_today</span>
          </div>
          {/* Asset Filter */}
          <div className="relative">
            <select className="appearance-none pl-4 pr-10 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-label-sm text-label-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer hover:border-outline">
              <option>All Assets</option>
              <option>Bitcoin (BTC)</option>
              <option>Ethereum (ETH)</option>
              <option>Solana (SOL)</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">token</span>
          </div>
          {/* Type Filter */}
          <div className="relative">
            <select className="appearance-none pl-4 pr-10 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-label-sm text-label-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer hover:border-outline">
              <option>All Types</option>
              <option>Buy</option>
              <option>Sell</option>
              <option>Transfer</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">filter_list</span>
          </div>
        </div>
        {/* Wallet Selector */}
        <div className="flex items-center gap-1 bg-surface-container-lowest border border-outline-variant rounded-lg p-1">
          {wallets.map((w) => (
            <button
              key={w}
              onClick={() => setActiveWallet(w)}
              className={`px-3 py-1.5 rounded font-label-sm text-label-sm transition-colors ${
                activeWallet === w
                  ? 'bg-surface-bright text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container/30">
                {['Date/Time', 'Asset', 'Type', 'Amount', 'Price', 'Total Value', 'Wallet', 'Status'].map((col, i) => (
                  <th key={col} className={`px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider${i >= 3 && i <= 5 ? ' text-right' : i === 7 ? ' text-center' : ''}`}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {transactions.map((tx, idx) => (
                <tr key={idx} className="hover:bg-surface-container-highest/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-data-mono text-data-mono text-on-surface">{tx.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center border font-bold text-xs"
                        style={{ backgroundColor: `${tx.asset.color}1a`, borderColor: `${tx.asset.color}33`, color: tx.asset.color }}
                      >
                        {tx.asset.icon}
                      </div>
                      <div>
                        <div className="font-label-sm text-label-sm text-on-surface">{tx.asset.name}</div>
                        <div className="text-xs text-on-surface-variant font-mono">{tx.asset.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-sm text-[11px] border ${tx.typeStyle}`}>
                      <span className="material-symbols-outlined text-[14px]">{tx.typeIcon}</span>
                      {tx.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-data-mono text-data-mono ${tx.amountStyle}`}>{tx.amount}</td>
                  <td className="px-6 py-4 text-right font-data-mono text-data-mono text-on-surface-variant">{tx.price}</td>
                  <td className="px-6 py-4 text-right font-data-mono text-data-mono text-on-surface">{tx.total}</td>
                  <td className="px-6 py-4">
                    <div className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-outline">account_balance_wallet</span>
                      {tx.wallet}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`material-symbols-outlined text-[18px] ${tx.statusStyle}`}>{tx.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container/30 flex items-center justify-between">
          <div className="font-label-sm text-label-sm text-on-surface-variant">Showing 1 to 4 of 128 transactions</div>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded bg-surface-container-high text-on-surface-variant opacity-50 cursor-not-allowed">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-primary/20 text-primary border border-primary/30 font-label-sm text-label-sm">1</button>
            {[2, 3].map((n) => (
              <button key={n} className="w-8 h-8 flex items-center justify-center rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright transition-colors font-label-sm text-label-sm">{n}</button>
            ))}
            <span className="w-8 h-8 flex items-center justify-center text-on-surface-variant font-label-sm text-label-sm">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright transition-colors font-label-sm text-label-sm">12</button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
