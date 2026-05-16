import LegalLayout from '../components/layout/LegalLayout';
import { usePageTitle } from '../hooks/usePageTitle';

const Section = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="font-heading-md text-heading-md text-inverse-surface mb-4 flex items-center gap-3">
      <span className="w-1 h-6 rounded-full bg-secondary inline-block" />
      {title}
    </h2>
    <div className="space-y-3 font-body-md text-body-md text-on-surface-variant leading-relaxed">
      {children}
    </div>
  </section>
);

const DataRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-outline-variant/20 last:border-0">
    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase min-w-[160px]">{label}</span>
    <span className="font-body-md text-body-md text-on-surface">{value}</span>
  </div>
);

const PrivacyPolicy = () => {
  usePageTitle('Privacy Policy');
  return (
    <LegalLayout>
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary border border-secondary/20 rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase mb-6">
          <span className="material-symbols-outlined text-[14px]">shield</span>
          Privacy
        </div>
        <h1 className="font-display-xl text-display-xl text-inverse-surface mb-4 leading-tight">
          Privacy Policy
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Last updated: May 2026 — This policy explains what data WalletPulse collects and how it is used.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-6 md:p-8">
          <h2 className="font-heading-md text-heading-md text-inverse-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
            At a Glance
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: 'lock', label: 'Passwords', value: 'Hashed with BCrypt, never stored in plain text' },
              { icon: 'storage', label: 'Storage', value: 'PostgreSQL database, hosted on the project server' },
              { icon: 'block', label: 'Data Sales', value: 'We never sell your data to third parties' },
            ].map((item) => (
              <div key={item.label} className="bg-surface-container rounded-xl p-4 flex flex-col gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">{item.label}</p>
                <p className="font-body-md text-body-md text-on-surface text-sm">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-8 md:p-12">
          <Section title="What Data We Collect">
            <p>When you create an account and use WalletPulse, we collect and store the following information:</p>
            <div className="bg-surface-container-low rounded-xl p-4 mt-2">
              <DataRow label="Account data" value="First name, last name, email address" />
              <DataRow label="Credentials" value="Password (BCrypt-hashed — never stored in plain text)" />
              <DataRow label="Portfolio data" value="Wallet names, blockchain addresses, asset types" />
              <DataRow label="Transaction data" value="Transaction dates, amounts, purchase prices, transaction hashes" />
              <DataRow label="Preferences" value="Currency setting, theme preference" />
            </div>
            <p className="mt-3">We do not collect browser fingerprints, IP addresses, or behavioral tracking data.</p>
          </Section>

          <Section title="How We Use Your Data">
            <p>All data you enter is used exclusively to provide the WalletPulse service to you:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>To calculate and display your portfolio value and P&amp;L</li>
              <li>To authenticate your sessions securely via JWT</li>
              <li>To import and deduplicate on-chain transactions</li>
              <li>To look up historical prices for your transactions</li>
            </ul>
            <p>Your data is never used for advertising, profiling, or shared with third parties for commercial purposes.</p>
          </Section>

          <Section title="Third-Party APIs">
            <p>WalletPulse sends limited data to third-party APIs to enrich your portfolio. No personally identifiable information is ever sent to these services:</p>
            <div className="bg-surface-container-low rounded-xl p-4 mt-2">
              <DataRow label="CoinGecko" value="Coin IDs only (e.g. 'bitcoin') — for live and historical price lookups" />
              <DataRow label="CryptoCompare" value="Coin symbols and dates — historical price fallback for older transactions" />
              <DataRow label="Etherscan" value="Your Ethereum wallet address — to import on-chain transaction history" />
              <DataRow label="Blockstream" value="Your Bitcoin wallet address — to import on-chain transaction history" />
              <DataRow label="Helius" value="Your Solana wallet address — to import on-chain transaction history" />
              <DataRow label="Frankfurter" value="No personal data — only a fixed EUR→USD rate query for currency display" />
            </div>
            <p className="mt-3">These services have their own privacy policies which we recommend reviewing.</p>
          </Section>

          <Section title="Data Retention and Deletion">
            <p>Your data is retained for as long as your account exists. You can delete individual transactions and wallets at any time through the app.</p>
            <p>To request full deletion of your account and all associated data, contact us via the project repository. We will process the request within a reasonable timeframe.</p>
          </Section>

          <Section title="Security">
            <p>We take reasonable technical measures to protect your data, including:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>BCrypt password hashing</li>
              <li>Stateless JWT authentication with expiry</li>
              <li>HTTPS-only communication in production</li>
              <li>No sensitive credentials stored in version control</li>
            </ul>
          </Section>

          <Section title="Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. Changes will be reflected by the "Last updated" date above. Continued use of the service after changes constitutes acceptance of the revised policy.</p>
          </Section>

          <Section title="Contact">
            <p>For any privacy-related questions or data deletion requests, please reach out via the project repository.</p>
          </Section>
        </div>
      </div>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
