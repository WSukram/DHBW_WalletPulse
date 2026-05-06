import React from 'react';

const Dashboard = () => {
  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-layout-margin space-y-8">
      {/* Header & Currency Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading-lg text-heading-lg text-on-surface">Overview</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Performance vs. Purchase Price</p>
        </div>

        {/* Currency Switcher */}
        <div className="flex bg-surface-container rounded-lg p-1 border border-outline-variant inline-flex self-start">
          <button className="px-4 py-1.5 rounded text-sm font-medium bg-surface-bright text-primary shadow-sm">USD</button>
          <button className="px-4 py-1.5 rounded text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">EUR</button>
          <button className="px-4 py-1.5 rounded text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">BTC</button>
        </div>
      </div>

      {/* Key Metrics (Bento Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Portfolio Value */}
        <div className="bg-surface-container-low rounded-xl p-lg border-t border-t-white/10 border-x border-x-transparent border-b border-b-transparent relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">Total Portfolio Value</p>
          <h3 className="font-display-xl text-display-xl text-on-surface tracking-tight">$142,580.00</h3>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              24h: +1.2%
            </span>
          </div>
        </div>

        {/* Total Investment */}
        <div className="bg-surface-container-low rounded-xl p-lg border-t border-t-white/10 border-x border-x-transparent border-b border-b-transparent">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">Total Investment</p>
          <h3 className="font-heading-lg text-heading-lg text-on-surface mt-2">$115,000.00</h3>
          <p className="font-body-md text-body-md text-outline mt-2">Initial cost basis across all connected sources.</p>
        </div>

        {/* Unrealized P&L */}
        <div className="bg-surface-container-low rounded-xl p-lg border-t border-t-white/10 border-x border-x-transparent border-b border-b-transparent">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">Unrealized P&amp;L</p>
          <h3 className="font-heading-lg text-heading-lg text-secondary mt-2">+$27,580.00</h3>
          <div className="mt-4 flex items-center gap-2">
            <span className="font-data-mono text-data-mono text-secondary">+23.98%</span>
            <span className="text-outline text-sm">vs. initial investment</span>
          </div>
        </div>
      </div>

      {/* Connected Wallets Table */}
      <div className="bg-surface-container-low rounded-xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-heading-md text-heading-md text-on-surface">Connected Wallets</h3>
          <button className="text-sm font-medium text-primary hover:text-primary-fixed transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">add</span> Add Wallet
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container border-b border-white/5 font-label-sm text-label-sm text-on-surface-variant uppercase">
                <th className="px-6 py-4 font-semibold">Wallet Name</th>
                <th className="px-6 py-4 font-semibold text-right">Initial Cost</th>
                <th className="px-6 py-4 font-semibold text-right">Current Value</th>
                <th className="px-6 py-4 font-semibold text-right">Net P&amp;L</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface divide-y divide-white/5">
              <tr className="hover:bg-surface-bright/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center text-outline group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">account_balance_wallet</span>
                    </div>
                    <div>
                      <div className="font-medium text-on-surface">Main Trading (Exchange)</div>
                      <div className="text-xs text-outline font-data-mono">Binance • 3 assets</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-data-mono text-data-mono">$45,000.00</td>
                <td className="px-6 py-4 text-right font-data-mono text-data-mono">$52,340.00</td>
                <td className="px-6 py-4 text-right">
                  <div className="font-data-mono text-data-mono text-secondary">+$7,340.00</div>
                  <div className="text-xs text-secondary mt-1">+16.3%</div>
                </td>
              </tr>
              <tr className="hover:bg-surface-bright/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center text-outline group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">usb</span>
                    </div>
                    <div>
                      <div className="font-medium text-on-surface">Cold Storage Vault</div>
                      <div className="text-xs text-outline font-data-mono">Ledger • 1 asset (BTC)</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-data-mono text-data-mono">$50,000.00</td>
                <td className="px-6 py-4 text-right font-data-mono text-data-mono">$68,900.00</td>
                <td className="px-6 py-4 text-right">
                  <div className="font-data-mono text-data-mono text-secondary">+$18,900.00</div>
                  <div className="text-xs text-secondary mt-1">+37.8%</div>
                </td>
              </tr>
              <tr className="hover:bg-surface-bright/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center text-outline group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">account_balance</span>
                    </div>
                    <div>
                      <div className="font-medium text-on-surface">DeFi Yield Yielding</div>
                      <div className="text-xs text-outline font-data-mono">MetaMask • 5 assets</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-data-mono text-data-mono">$20,000.00</td>
                <td className="px-6 py-4 text-right font-data-mono text-data-mono">$21,340.00</td>
                <td className="px-6 py-4 text-right">
                  <div className="font-data-mono text-data-mono text-secondary">+$1,340.00</div>
                  <div className="text-xs text-secondary mt-1">+6.7%</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

