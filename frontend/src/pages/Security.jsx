import React, { useState } from 'react';


const Security = () => {
  const [activeTheme, setActiveTheme] = useState('Dark');

  return (
    <div className="flex-1 overflow-y-auto p-lg lg:p-layout-margin bg-background">
      <div className="max-w-7xl mx-auto space-y-lg">
        {/* Page Header */}
        <div>
          <h2 className="font-heading-lg text-heading-lg text-on-background">Security &amp; Settings</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-sm">Manage your account preferences, API connections, and security protocols.</p>
        </div>

        {/* Settings Bento Grid */}
        <div className="grid grid-cols-12 gap-layout-gutter">

          {/* Left Column: Profile & Preferences */}
          <div className="col-span-12 lg:col-span-4 space-y-layout-gutter">
            {/* Profile Card */}
            <section className="bg-surface-container rounded-xl border border-outline-variant p-lg flex flex-col items-center text-center">
              <div className="relative mb-md">
                <div className="w-24 h-24 rounded-full bg-surface-container-high border-2 border-surface-bright flex items-center justify-center">
                  <span className="material-symbols-outlined text-[48px] text-on-surface-variant">account_circle</span>
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-surface-bright border border-outline-variant rounded-full flex items-center justify-center hover:bg-surface-variant transition-colors">
                  <span className="material-symbols-outlined text-sm text-on-surface">edit</span>
                </button>
              </div>
              <h3 className="font-heading-md text-heading-md text-on-surface">Alex Mercer</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">alex.mercer@example.com</p>
              <div className="w-full mt-lg pt-lg border-t border-outline-variant flex justify-between items-center">
                <span className="font-body-md text-body-md text-on-surface-variant">Account Status</span>
                <span className="px-3 py-1 rounded-full bg-secondary-container/20 text-secondary font-label-sm text-label-sm border border-secondary/20">Verified Tier 2</span>
              </div>
            </section>

            {/* Preferences Card */}
            <section className="bg-surface-container rounded-xl border border-outline-variant p-lg">
              <h3 className="font-heading-md text-heading-md text-on-surface mb-md">Preferences</h3>
              <div className="space-y-md">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Base Currency</label>
                  <div className="relative">
                    <select className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none">
                      <option>USD - US Dollar</option>
                      <option>EUR - Euro</option>
                      <option>BTC - Bitcoin</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                  </div>
                </div>
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
                        onClick={() => setActiveTheme(label)}
                        className={`flex-1 py-1.5 rounded font-label-sm text-label-sm flex items-center justify-center gap-2 transition-colors ${
                          activeTheme === label
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

          {/* Right Column: Security & API */}
          <div className="col-span-12 lg:col-span-8 space-y-layout-gutter">
            {/* Security Details */}
            <section className="bg-surface-container rounded-xl border border-outline-variant">
              <div className="p-lg border-b border-outline-variant flex justify-between items-center">
                <div>
                  <h3 className="font-heading-md text-heading-md text-on-surface">Security Details</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage your password and authentication methods.</p>
                </div>
              </div>
              <div className="p-lg space-y-xl">
                {/* Password Change */}
                <div>
                  <h4 className="font-data-mono text-data-mono text-on-surface mb-md">Change Password</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div className="space-y-xs md:col-span-2">
                      <label className="block font-label-sm text-label-sm text-on-surface-variant">Current Password</label>
                      <input
                        type="password"
                        defaultValue="********"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                    <div className="space-y-xs">
                      <label className="block font-label-sm text-label-sm text-on-surface-variant">New Password</label>
                      <input
                        type="password"
                        placeholder="Min 12 characters"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                    <div className="space-y-xs">
                      <label className="block font-label-sm text-label-sm text-on-surface-variant">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Repeat new password"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>
                  <div className="mt-md flex justify-end">
                    <button className="bg-primary-container text-on-primary-container px-lg py-sm rounded-lg font-label-sm text-label-sm hover:opacity-90 transition-opacity">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            </section>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Security;
