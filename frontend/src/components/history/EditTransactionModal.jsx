import React from 'react';
import { coinMeta } from '../../utils/coins';
import { inputCls, labelCls } from '../../utils/styles';

const EditTransactionModal = ({ tx, form, setForm, saving, errorMsg, onClose, onSave, formatEur }) => {
  if (!tx) return null;
  const meta = coinMeta(tx.coinId);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface-container rounded-xl p-6 w-full max-w-md border border-outline-variant/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-heading-md text-heading-md text-on-surface mb-1">Edit Transaction</h3>
        <div className="flex items-center gap-2 mb-5">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
          >
            {meta.icon}
          </div>
          <span className="text-sm text-on-surface-variant">{meta.name} · {tx.walletName}</span>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Amount</label>
              <input
                type="number"
                min="0"
                step="any"
                className={inputCls}
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>Buy Price (EUR)</label>
              <input
                type="number"
                min="0"
                step="any"
                className={inputCls}
                value={form.buyPrice}
                onChange={(e) => setForm((f) => ({ ...f, buyPrice: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Purchase Date</label>
            <input
              type="date"
              className={inputCls}
              value={form.date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>
          {form.amount && form.buyPrice && (
            <div className="bg-surface-container-highest rounded-lg px-4 py-3 text-sm text-on-surface-variant">
              Total cost: <span className="font-data-mono text-on-surface">
                {formatEur(parseFloat(form.amount || 0) * parseFloat(form.buyPrice || 0))}
              </span>
            </div>
          )}
          {errorMsg && <p className="text-error text-sm">{errorMsg}</p>}
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-on-surface-variant font-label-sm text-label-sm hover:text-on-surface transition-colors">
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTransactionModal;
