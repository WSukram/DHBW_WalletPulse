import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';

const Security = () => {
  useEffect(() => { document.title = 'Security · WalletPulse'; }, []);
  const { currency, setCurrency, theme, setTheme, user } = useApp();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (newPassword.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
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

  const inputCls = 'w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all';

  return (
    <div className="flex-1 overflow-y-auto p-lg lg:p-layout-margin bg-background">
      <div className="max-w-7xl mx-auto space-y-lg">
        {/* Page Header */}
        <div>
          <h2 className="font-heading-lg text-heading-lg text-on-background">Security &amp; Settings</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-sm">Manage your account preferences and security settings.</p>
        </div>

        <div className="grid grid-cols-12 gap-layout-gutter">

          {/* Left Column: Account info & Preferences */}
          <div className="col-span-12 lg:col-span-4 space-y-layout-gutter">

            {/* Account Card */}
            <section className="bg-surface-container rounded-xl border border-outline-variant p-lg">
              <h3 className="font-heading-md text-heading-md text-on-surface mb-md">My Account</h3>
              <div className="space-y-sm">
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Name</p>
                  <p className="font-body-md text-body-md text-on-surface mt-xs">
                    {user ? `${user.firstName} ${user.lastName}` : '—'}
                  </p>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Email</p>
                  <p className="font-body-md text-body-md text-on-surface mt-xs">{user?.email ?? '—'}</p>
                </div>
                <div className="pt-sm border-t border-outline-variant flex justify-between items-center">
                  <span className="font-body-md text-body-md text-on-surface-variant">Account Status</span>
                  <span className="px-3 py-1 rounded-full bg-secondary-container/20 text-secondary font-label-sm text-label-sm border border-secondary/20">Active</span>
                </div>
              </div>
            </section>

            {/* Preferences Card */}
            <section className="bg-surface-container rounded-xl border border-outline-variant p-lg">
              <h3 className="font-heading-md text-heading-md text-on-surface mb-md">Preferences</h3>
              <div className="space-y-md">
                {/* Currency */}
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Display Currency</label>
                  <div className="relative">
                    <select
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <option value="EUR">EUR - Euro</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="BTC">BTC - Bitcoin</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {currency !== 'EUR' ? 'Values are converted from EUR using approximate rates.' : 'Prices sourced in EUR from CoinGecko.'}
                  </p>
                </div>

                {/* Theme */}
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Theme</label>
                  <div className="flex gap-2 p-1 bg-surface-container-lowest rounded-lg border border-outline-variant">
                    {[
                      { label: 'Dark', icon: 'dark_mode' },
                      { label: 'Light', icon: 'light_mode' },
                      { label: 'System', icon: 'desktop_windows' },
                    ].map(({ label, icon }) => (
                      <button
                        key={label}
                        onClick={() => setTheme(label)}
                        className={`flex-1 py-1.5 rounded font-label-sm text-label-sm flex items-center justify-center gap-2 transition-colors ${
                          theme === label
                            ? 'bg-surface-bright shadow-sm text-on-surface'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">{icon}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Change Password */}
          <div className="col-span-12 lg:col-span-8 space-y-layout-gutter">
            <section className="bg-surface-container rounded-xl border border-outline-variant">
              <div className="p-lg border-b border-outline-variant">
                <h3 className="font-heading-md text-heading-md text-on-surface">Change Password</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">Update your password to keep your account secure.</p>
              </div>
              <form className="p-lg space-y-md" onSubmit={handlePasswordUpdate}>
                <div className="space-y-xs">
                  <label className="block font-label-sm text-label-sm text-on-surface-variant">Current Password</label>
                  <input
                    type="password"
                    className={inputCls}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant">New Password</label>
                    <input
                      type="password"
                      className={inputCls}
                      placeholder="Min. 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-xs">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant">Confirm New Password</label>
                    <input
                      type="password"
                      className={inputCls}
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {pwError && <p className="text-sm text-error">{pwError}</p>}
                {pwSuccess && <p className="text-sm text-secondary">{pwSuccess}</p>}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={pwLoading}
                    className="bg-primary-container text-on-primary-container px-lg py-sm rounded-lg font-label-sm text-label-sm hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {pwLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Security;
