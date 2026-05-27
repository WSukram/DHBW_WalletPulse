import { Link } from 'react-router-dom';
import LegalLayout from '../components/layout/LegalLayout';
import { usePageTitle } from '../hooks/usePageTitle';
import {
  LIGHT,
  DARK,
  headlineStyle,
  monoStyle,
  usePrefersDark,
} from '../theme/softStack';

const Section = ({ eyebrow, title, t, children }) => (
  <section className="mb-12">
    <div
      style={{
        ...monoStyle,
        fontSize: 10,
        letterSpacing: '0.22em',
        color: t.SUBINK,
        marginBottom: 8,
      }}
    >
      {eyebrow}
    </div>
    <h2
      style={{
        ...headlineStyle,
        fontWeight: 600,
        fontSize: 28,
        letterSpacing: '-0.02em',
        color: t.INK,
        marginBottom: 16,
      }}
    >
      {title}
    </h2>
    <div
      className="space-y-3"
      style={{ color: t.INK, fontSize: 15.5, lineHeight: 1.65 }}
    >
      {children}
    </div>
  </section>
);

const TermsOfService = () => {
  usePageTitle('Terms of Service');
  const isDark = usePrefersDark();
  const t = isDark ? DARK : LIGHT;

  return (
    <LegalLayout>
      <div className="mb-12">
        <div
          style={{
            ...monoStyle,
            fontSize: 11,
            letterSpacing: '0.24em',
            color: t.SUBINK,
            marginBottom: 14,
          }}
        >
          LEGAL · TERMS OF SERVICE
        </div>
        <h1
          style={{
            ...headlineStyle,
            fontWeight: 600,
            fontSize: 'clamp(40px, 6vw, 56px)',
            lineHeight: 1.02,
            letterSpacing: '-0.03em',
            color: t.INK,
            marginBottom: 18,
          }}
        >
          Terms of Service
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{
              ...monoStyle,
              fontSize: 11,
              background: t.LAVENDER,
              color: t.LAVENDER_TEXT,
              border: `1px solid ${t.HAIR_DIV}`,
            }}
          >
            Last updated · May 2026
          </span>
          <span style={{ color: t.SUBINK, fontSize: 14 }}>
            Please read these terms carefully before using WalletPulse.
          </span>
        </div>
      </div>

      <div
        className="rounded-3xl px-8 md:px-12 py-10 md:py-14"
        style={{
          background: t.CARD,
          border: `1px solid ${t.HAIR_HEAVY}`,
          boxShadow: t.SH_CARD,
        }}
      >
        <Section eyebrow="01 · AGREEMENT" title="Acceptance of Terms" t={t}>
          <p>By accessing or using WalletPulse, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use the service.</p>
          <p>WalletPulse is a personal portfolio tracking tool developed as part of a university project. It is provided for educational and personal use only.</p>
        </Section>

        <Section eyebrow="02 · USAGE" title="Use of the Service" t={t}>
          <p>WalletPulse is intended solely for personal, non-commercial use. You may use the service to track your own cryptocurrency holdings and review portfolio performance.</p>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-1" style={{ color: t.SUBINK }}>
            <li>Use the service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to any part of the service</li>
            <li>Interfere with or disrupt the integrity of the service</li>
            <li>Use automated tools to scrape or overload the service</li>
          </ul>
        </Section>

        <Section eyebrow="03 · ACCOUNT" title="Account Responsibility" t={t}>
          <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.</p>
          <p>You are solely responsible for all activity that occurs under your account. WalletPulse cannot be held liable for any loss resulting from unauthorized use of your credentials.</p>
        </Section>

        <Section eyebrow="04 · DISCLAIMER" title="No Financial Advice" t={t}>
          <div
            className="rounded-2xl p-5"
            style={{
              background: t.RED_BG,
              border: `1px solid ${t.HAIR_DIV}`,
            }}
          >
            <p
              className="flex items-center gap-2 mb-1.5"
              style={{ ...headlineStyle, fontWeight: 600, color: t.RED_DEEP }}
            >
              <span className="material-symbols-outlined text-[18px]">warning</span>
              Important Disclaimer
            </p>
            <p style={{ color: t.INK, fontSize: 14.5, lineHeight: 1.6 }}>
              WalletPulse does not provide financial, investment, legal, or tax advice. All data displayed — including portfolio valuations, profit/loss figures, and price feeds — is for informational purposes only and should not be relied upon to make investment decisions.
            </p>
          </div>
        </Section>

        <Section eyebrow="05 · DATA" title="Third-Party Data" t={t}>
          <p>WalletPulse retrieves live and historical price data from third-party services including CoinGecko, CryptoCompare, Etherscan, Blockstream, and Helius. We do not guarantee the accuracy, completeness, or timeliness of any data provided by these services.</p>
          <p>Use of these third-party services is subject to their own terms of service and privacy policies.</p>
        </Section>

        <Section eyebrow="06 · PRIVACY" title="Data and Privacy" t={t}>
          <p>Your account data — including email address, wallet names, and transaction records — is stored securely in our database. We do not sell or share your data with third parties for marketing purposes.</p>
          <p>
            Please refer to our{' '}
            <Link
              to="/privacy"
              className="underline underline-offset-2"
              style={{ color: t.LAVENDER_DEEP }}
            >
              Privacy Policy
            </Link>{' '}
            for full details on how your data is collected and used.
          </p>
        </Section>

        <Section eyebrow="07 · SERVICE" title="Availability and Changes" t={t}>
          <p>WalletPulse is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free operation of the service.</p>
          <p>We reserve the right to modify or discontinue the service at any time. We may also update these terms — continued use of the service after changes constitutes acceptance of the new terms.</p>
        </Section>

        <Section eyebrow="08 · CONTACT" title="Contact" t={t}>
          <p>For questions about these terms, please reach out via the project repository.</p>
        </Section>
      </div>
    </LegalLayout>
  );
};

export default TermsOfService;
