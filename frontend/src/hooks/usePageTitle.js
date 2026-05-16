import { useEffect } from 'react';

/**
 * Sets document.title to `${title} · WalletPulse` on mount. Pass the bare page
 * label — the suffix is added here so it stays consistent across pages.
 * Pass an empty string to render just "WalletPulse" (used by the landing page).
 */
export const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} · WalletPulse` : 'WalletPulse';
  }, [title]);
};
