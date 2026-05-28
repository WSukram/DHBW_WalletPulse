import React, { useState } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { usePageTitle } from '../hooks/usePageTitle';
import {
  LIGHT,
  DARK,
  headlineStyle,
  monoStyle,
  bodyFontFamily,
  usePrefersDark,
} from '../theme/softStack';

const Security = () => {
  usePageTitle('Security');
  const { currency, setCurrency, theme, setTheme, user, logout } = useApp();
  const isDark = usePrefersDark();
  const t = isDark ? DARK : LIGHT;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteError('');
    setDeleteLoading(true);
    try {
      await axios.delete('/api/user/me', { data: { currentPassword: deletePassword } });
      logout();
    } catch (err) {
      setDeleteError(err.response?.data?.error ?? 'Failed to delete account.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (newPassword.length < 12) { setPwError('New password must be at least 12 characters.'); return; }
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match.'); return; }

    setPwLoading(true);
    try {
      await axios.put('/api/user/me/password', {
        currentPassword,
        newPassword,
      });
      setPwSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwError(err.response?.data?.error ?? 'Failed to update password.');
    } finally {
      setPwLoading(false);
    }
  };

  const eyebrow = {
    ...monoStyle,
    fontSize: 10,
    letterSpacing: '0.22em',
    color: t.SUBINK,
    textTransform: 'uppercase',
  };

  const labelStyle = {
    ...monoStyle,
    fontSize: 10,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: t.SUBINK,
    display: 'block',
    marginBottom: 8,
  };

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 12,
    background: t.PAPER,
    border: `1px solid ${t.HAIR_HEAVY}`,
    color: t.INK,
    fontFamily: bodyFontFamily,
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 160ms ease, box-shadow 160ms ease',
  };

  const focusOn = (e) => {
    e.currentTarget.style.borderColor = t.MINT_DEEP;
    e.currentTarget.style.boxShadow = `0 0 0 3px ${t.MINT_BG}`;
  };
  const focusOff = (e) => {
    e.currentTarget.style.borderColor = t.HAIR_HEAVY;
    e.currentTarget.style.boxShadow = 'none';
  };

  const cardStyle = {
    background: t.CARD,
    border: `1px solid ${t.HAIR_HEAVY}`,
    borderRadius: 24,
    boxShadow: t.SH_CARD,
    color: t.INK,
  };

  const sectionHeading = {
    ...headlineStyle,
    fontWeight: 600,
    fontSize: 22,
    color: t.INK,
    lineHeight: 1.2,
  };

  const subText = { fontSize: 14, color: t.SUBINK };

  const themeOptions = [
    { label: 'Dark', icon: 'dark_mode' },
    { label: 'Light', icon: 'light_mode' },
    { label: 'System', icon: 'desktop_windows' },
  ];

  return (
    <div
      className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 max-w-[1240px] mx-auto w-full"
      style={{ background: t.PAPER, color: t.INK, fontFamily: bodyFontFamily }}
    >
      {/* Header */}
      <div>
        <div style={eyebrow}>ACCOUNT · SETTINGS</div>
        <h1
          className="mt-2"
          style={{ ...headlineStyle, fontSize: 'clamp(34px, 4.4vw, 48px)', fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1, color: t.INK }}
        >
          Security &amp; settings.
        </h1>
        <p className="mt-3 text-[15px]" style={{ color: t.SUBINK }}>
          Manage your account preferences and security settings.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left column */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Account Card */}
          <section style={{ ...cardStyle, padding: 28 }}>
            <div style={eyebrow}>PROFILE · ACCOUNT</div>
            <h3 style={{ ...sectionHeading, marginTop: 8, marginBottom: 18 }}>My account</h3>

            <div className="space-y-4">
              <div>
                <div style={labelStyle}>Name</div>
                <div style={{ fontSize: 15, color: t.INK }}>
                  {user ? `${user.firstName} ${user.lastName}` : '—'}
                </div>
              </div>
              <div>
                <div style={labelStyle}>Email</div>
                <div style={{ fontSize: 15, color: t.INK }}>{user?.email ?? '—'}</div>
              </div>
              <div
                className="pt-4 flex justify-between items-center"
                style={{ borderTop: `1px solid ${t.HAIR_DIV}` }}
              >
                <span style={subText}>Account status</span>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{
                    background: t.MINT_BG,
                    color: t.MINT_DEEP,
                    ...monoStyle,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                  }}
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ background: t.MINT_DEEP }}
                  />
                  ACTIVE
                </span>
              </div>
            </div>
          </section>

          {/* Preferences Card */}
          <section style={{ ...cardStyle, padding: 28 }}>
            <div style={eyebrow}>DISPLAY · PREFERENCES</div>
            <h3 style={{ ...sectionHeading, marginTop: 8, marginBottom: 18 }}>Preferences</h3>

            <div className="space-y-5">
              {/* Currency */}
              <div>
                <label style={labelStyle}>Display currency</label>
                <div className="grid grid-cols-3 gap-2">
                  {['EUR', 'USD', 'BTC'].map((code) => {
                    const active = currency === code;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setCurrency(code)}
                        style={{
                          padding: '10px 0',
                          borderRadius: 999,
                          background: active ? t.CTA_INK_BG : t.CARD_2,
                          color: active ? t.CTA_INK_FG : t.INK,
                          border: `1px solid ${active ? t.CTA_INK_BG : t.HAIR}`,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'background-color 160ms ease, color 160ms ease, border-color 160ms ease',
                          ...monoStyle,
                          letterSpacing: '0.08em',
                        }}
                      >
                        {code}
                      </button>
                    );
                  })}
                </div>
                <p style={{ ...subText, fontSize: 12.5, marginTop: 10, lineHeight: 1.5 }}>
                  {currency === 'EUR'
                    ? 'Prices sourced in EUR from CoinGecko.'
                    : currency === 'USD'
                    ? 'Converted from EUR using the live ECB rate (frankfurter.app), refreshed every 5 minutes.'
                    : 'Converted from EUR using the live BTC/EUR price from CoinGecko, refreshed every 5 minutes.'}
                </p>
              </div>

              {/* Theme */}
              <div>
                <label style={labelStyle}>Theme</label>
                <div
                  className="flex gap-1.5 p-1.5 rounded-full"
                  style={{
                    background: t.CARD_2,
                    border: `1px solid ${t.HAIR}`,
                  }}
                >
                  {themeOptions.map(({ label, icon }) => {
                    const active = theme === label;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setTheme(label)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full transition-colors"
                        style={{
                          background: active ? t.CTA_INK_BG : 'transparent',
                          color: active ? t.CTA_INK_FG : t.SUBINK,
                          fontSize: 12.5,
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Change Password */}
          <section style={cardStyle}>
            <div className="px-7 pt-7 pb-5" style={{ borderBottom: `1px solid ${t.HAIR_DIV}` }}>
              <div style={eyebrow}>SECURITY · PASSWORD</div>
              <h3 style={{ ...sectionHeading, marginTop: 8 }}>Change password</h3>
              <p style={{ ...subText, marginTop: 6 }}>
                Update your password to keep your account secure.
              </p>
            </div>
            <form className="p-7 space-y-5" onSubmit={handlePasswordUpdate}>
              <div>
                <label style={labelStyle}>Current password</label>
                <input
                  type="password"
                  style={inputStyle}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  onFocus={focusOn}
                  onBlur={focusOff}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label style={labelStyle}>New password</label>
                  <input
                    type="password"
                    style={inputStyle}
                    placeholder="Min. 12 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onFocus={focusOn}
                    onBlur={focusOff}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Confirm new password</label>
                  <input
                    type="password"
                    style={inputStyle}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={focusOn}
                    onBlur={focusOff}
                    required
                  />
                </div>
              </div>

              {pwError && (
                <div
                  className="rounded-xl px-4 py-3 text-[13.5px]"
                  style={{ background: t.RED_BG, color: t.RED_DEEP, border: `1px solid ${t.HAIR_LIGHT}` }}
                >
                  {pwError}
                </div>
              )}
              {pwSuccess && (
                <div
                  className="rounded-xl px-4 py-3 text-[13.5px]"
                  style={{ background: t.MINT_BG, color: t.MINT_DEEP, border: `1px solid ${t.HAIR_LIGHT}` }}
                >
                  {pwSuccess}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={pwLoading}
                  style={{
                    padding: '12px 22px',
                    borderRadius: 999,
                    background: t.CTA_INK_BG,
                    color: t.CTA_INK_FG,
                    fontSize: 14,
                    fontWeight: 600,
                    border: 'none',
                    cursor: pwLoading ? 'not-allowed' : 'pointer',
                    opacity: pwLoading ? 0.6 : 1,
                    boxShadow: t.SH_CTA_INK,
                    transition: 'box-shadow 160ms ease, transform 160ms ease',
                  }}
                  onMouseEnter={(e) => { if (!pwLoading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = t.SH_CTA_INK_H; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = t.SH_CTA_INK; }}
                >
                  {pwLoading ? 'Updating…' : 'Update password'}
                </button>
              </div>
            </form>
          </section>

          {/* Danger Zone */}
          <section
            style={{
              background: t.CARD,
              border: `1px solid ${t.HAIR_HEAVY}`,
              borderRadius: 24,
              boxShadow: t.SH_CARD,
              color: t.INK,
              overflow: 'hidden',
            }}
          >
            <div className="px-7 pt-7 pb-5" style={{ borderBottom: `1px solid ${t.HAIR_DIV}` }}>
              <div style={{ ...eyebrow, color: t.RED_DEEP }}>DANGER · IRREVERSIBLE</div>
              <h3 style={{ ...sectionHeading, marginTop: 8, color: t.RED_DEEP }}>Danger zone</h3>
              <p style={{ ...subText, marginTop: 6 }}>
                Irreversible actions for your account.
              </p>
            </div>
            <div className="p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: t.INK }}>Delete account</div>
                <p style={{ ...subText, marginTop: 6, maxWidth: 520, lineHeight: 1.55 }}>
                  Permanently delete your account and all wallets, assets, and transaction history. This cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setDeleteError(''); setDeletePassword(''); setShowDeleteModal(true); }}
                style={{
                  flexShrink: 0,
                  padding: '11px 20px',
                  borderRadius: 999,
                  background: t.RED_BG,
                  color: t.RED_DEEP,
                  border: `1px solid ${t.RED_BG_2}`,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 160ms ease, color 160ms ease, transform 160ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = t.RED_DEEP; e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = t.RED_BG; e.currentTarget.style.color = t.RED_DEEP; }}
              >
                Delete account
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px) saturate(140%)',
            WebkitBackdropFilter: 'blur(8px) saturate(140%)',
            fontFamily: bodyFontFamily,
          }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="w-full max-w-[480px]"
            style={{
              background: t.CARD,
              border: `1px solid ${t.HAIR_HEAVY}`,
              borderRadius: 24,
              boxShadow: t.SH_HERO,
              padding: 28,
              color: t.INK,
              animation: 'softStackPop 180ms cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <style>{`@keyframes softStackPop { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }`}</style>

            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-3">
                <span
                  className="inline-flex w-10 h-10 rounded-full items-center justify-center shrink-0"
                  style={{
                    background: t.RED_BG,
                    color: t.RED_DEEP,
                    border: `1px solid ${t.RED_BG_2}`,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>warning</span>
                </span>
                <div>
                  <div style={{ ...monoStyle, fontSize: 10, letterSpacing: '0.22em', color: t.SUBINK, marginBottom: 6 }}>
                    DANGER · DELETE
                  </div>
                  <h3 style={{ ...headlineStyle, fontWeight: 600, fontSize: 24, color: t.INK, lineHeight: 1.15 }}>
                    Delete account
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                aria-label="Close"
                className="material-symbols-outlined"
                style={{
                  color: t.SUBINK,
                  fontSize: 22,
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'background-color 160ms ease, color 160ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = t.CARD_3; e.currentTarget.style.color = t.INK; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.SUBINK; }}
              >
                close
              </button>
            </div>

            <form className="mt-4" onSubmit={handleDeleteAccount}>
              <p style={{ fontSize: 14, color: t.SUBINK, marginBottom: 18, lineHeight: 1.55 }}>
                This will permanently delete your account and{' '}
                <span style={{ color: t.INK, fontWeight: 600 }}>all data</span> associated with it — wallets, assets, and transaction history. Enter your current password to confirm.
              </p>

              <div className="mb-5">
                <label style={labelStyle}>Current password</label>
                <input
                  type="password"
                  style={inputStyle}
                  placeholder="Enter your password to confirm"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  onFocus={focusOn}
                  onBlur={focusOff}
                  required
                  autoFocus
                />
              </div>

              {deleteError && (
                <div
                  className="rounded-xl px-4 py-3 mb-5 text-[13.5px]"
                  style={{ background: t.RED_BG, color: t.RED_DEEP, border: `1px solid ${t.HAIR_LIGHT}` }}
                >
                  {deleteError}
                </div>
              )}

              <div className="flex gap-3 justify-end items-center">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  style={{
                    padding: '11px 18px',
                    borderRadius: 999,
                    background: 'transparent',
                    color: t.SUBINK,
                    fontSize: 14,
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 160ms ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = t.INK; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = t.SUBINK; }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteLoading}
                  style={{
                    padding: '12px 22px',
                    borderRadius: 999,
                    background: t.RED_DEEP,
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: 600,
                    border: 'none',
                    cursor: deleteLoading ? 'not-allowed' : 'pointer',
                    opacity: deleteLoading ? 0.6 : 1,
                    boxShadow: t.SH_CTA_INK,
                    transition: 'box-shadow 160ms ease, transform 160ms ease',
                  }}
                  onMouseEnter={(e) => { if (!deleteLoading) e.currentTarget.style.boxShadow = t.SH_CTA_INK_H; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = t.SH_CTA_INK; }}
                >
                  {deleteLoading ? 'Deleting…' : 'Delete my account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Security;
