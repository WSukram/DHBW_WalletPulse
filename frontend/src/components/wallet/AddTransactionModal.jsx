import React from 'react';
import { inputCls, labelCls } from '../../utils/styles';

const AddTransactionModal = ({
  open, form, setForm, coinOptions, saving, errorMsg, onClose, onSave, formatEur,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface-container rounded-xl p-6 w-full max-w-md border border-outline-variant/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-heading-md text-heading-md text-on-surface mb-1">Add Transaction</h3>
        <p className="text-sm text-on-surface-variant mb-5">Record a new purchase for this wallet.</p>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Coin</label>
            <select className={inputCls} value={form.coinId} onChange={(e) => setForm((f) => ({ ...f, coinId: e.target.value }))}>
              <option value="">Select a coin…</option>
              {coinOptions.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Amount</label>
              <input type="number" min="0" step="any" className={inputCls} placeholder="0.00" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Buy Price (EUR)</label>
              <input type="number" min="0" step="any" className={inputCls} placeholder="0.00" value={form.buyPrice} onChange={(e) => setForm((f) => ({ ...f, buyPrice: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Purchase Date</label>
            <input type="date" className={inputCls} value={form.date} max={new Date().toISOString().split('T')[0]} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </div>
          {form.amount && form.buyPrice && (
            <div className="bg-surface-container-highest rounded-lg px-4 py-3 text-sm text-on-surface-variant">
              Total cost: <span className="font-data-mono text-on-surface">{formatEur(parseFloat(form.amount || 0) * parseFloat(form.buyPrice || 0))}</span>
            </div>
          )}
          {errorMsg && <p className="text-error text-sm font-label-sm">{errorMsg}</p>}
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-on-surface-variant font-label-sm text-label-sm hover:text-on-surface transition-colors">Cancel</button>
          <button onClick={onSave} disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? 'Saving…' : 'Add Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTransactionModal;
