import React from 'react';
import { Link } from 'react-router-dom';

const Section = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="font-heading-md text-heading-md text-inverse-surface mb-4 flex items-center gap-3">
      <span className="w-1 h-6 rounded-full bg-primary inline-block" />
      {title}
    </h2>
    <div className="space-y-3 font-body-md text-body-md text-on-surface-variant leading-relaxed">
      {children}
    </div>
  </section>
);

const TermsOfService = () => (
  <div className="bg-surface-container-lowest text-on-surface min-h-screen flex flex-col font-sans">
    {/* Nav */}
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
      <div className="flex justify-between items-center w-full px-6 h-16 max-w-[1440px] mx-auto">
        <Link to="/" className="text-xl font-bold tracking-tighter text-slate-50 hover:text-primary transition-colors">
          WalletPulse
        </Link>
        <Link to="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Home
        </Link>
      </div>
    </header>

    <main className="flex-grow max-w-3xl mx-auto w-full px-6 py-16">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase mb-6">
          <span className="material-symbols-outlined text-[14px]">gavel</span>
          Legal
        </div>
        <h1 className="font-display-xl text-display-xl text-inverse-surface mb-4 leading-tight">
          Terms of Service
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Last updated: May 2026 — Please read these terms carefully before using WalletPulse.
        </p>
      </div>

      <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-8 md:p-12">

        <Section title="Acceptance of Terms">
          <p>By accessing or using WalletPulse, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use the service.</p>
          <p>WalletPulse is a personal portfolio tracking tool developed as part of a university project. It is provided for educational and personal use only.</p>
        </Section>

        <Section title="Use of the Service">
          <p>WalletPulse is intended solely for personal, non-commercial use. You may use the service to track your own cryptocurrency holdings and review portfolio performance.</p>
          <p>You agree not to:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Use the service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to any part of the service</li>
            <li>Interfere with or disrupt the integrity of the service</li>
            <li>Use automated tools to scrape or overload the service</li>
          </ul>
        </Section>

        <Section title="Account Responsibility">
          <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.</p>
          <p>You are solely responsible for all activity that occurs under your account. WalletPulse cannot be held liable for any loss resulting from unauthorized use of your credentials.</p>
        </Section>

        <Section title="No Financial Advice">
          <div className="bg-error/10 border border-error/20 rounded-xl p-4 text-on-surface">
            <p className="font-semibold text-error mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              Important Disclaimer
            </p>
            <p>WalletPulse does not provide financial, investment, legal, or tax advice. All data displayed — including portfolio valuations, profit/loss figures, and price feeds — is for informational purposes only and should not be relied upon to make investment decisions.</p>
          </div>
        </Section>

        <Section title="Third-Party Data">
          <p>WalletPulse retrieves live and historical price data from third-party services including CoinGecko, CryptoCompare, Etherscan, Blockstream, and Helius. We do not guarantee the accuracy, completeness, or timeliness of any data provided by these services.</p>
          <p>Use of these third-party services is subject to their own terms of service and privacy policies.</p>
        </Section>

        <Section title="Data and Privacy">
          <p>Your account data — including email address, wallet names, and transaction records — is stored securely in our database. We do not sell or share your data with third parties for marketing purposes.</p>
          <p>Please refer to our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for full details on how your data is collected and used.</p>
        </Section>

        <Section title="Availability and Changes">
          <p>WalletPulse is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free operation of the service.</p>
          <p>We reserve the right to modify or discontinue the service at any time. We may also update these terms — continued use of the service after changes constitutes acceptance of the new terms.</p>
        </Section>

        <Section title="Contact">
          <p>For questions about these terms, please reach out via the project repository.</p>
        </Section>
      </div>
    </main>

    {/* Footer */}
    <footer className="border-t border-white/5 bg-slate-950">
      <div className="max-w-[1440px] mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm font-bold text-slate-300">WalletPulse</p>
        <p className="text-xs text-slate-500">© 2026 WalletPulse. For educational purposes only.</p>
        <div className="flex gap-6">
          <Link to="/terms" className="text-xs text-primary">Terms of Service</Link>
          <Link to="/privacy" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  </div>
);

export default TermsOfService;
