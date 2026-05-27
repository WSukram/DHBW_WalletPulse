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

const DataRow = ({ label, value, t }) => (
  <div
    className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3"
    style={{ borderBottom: `1px solid ${t.HAIR_DIV}` }}
  >
    <span
      className="min-w-[180px]"
      style={{
        ...monoStyle,
        fontSize: 11,
        letterSpacing: '0.18em',
        color: t.SUBINK,
        textTransform: 'uppercase',
      }}
    >
      {label}
    </span>
    <span style={{ color: t.INK, fontSize: 14.5, lineHeight: 1.55 }}>
      {value}
    </span>
  </div>
);

const PrivacyPolicy = () => {
  usePageTitle('Privacy Policy');
  const isDark = usePrefersDark();
  const t = isDark ? DARK : LIGHT;

  const glanceItems = [
    {
      icon: 'lock',
      label: 'Passwords',
      value: 'Hashed with BCrypt, never stored in plain text',
      tint: t.TINT_MINT,
      ink: t.MINT_DEEP,
    },
    {
      icon: 'storage',
      label: 'Storage',
      value: 'PostgreSQL database, hosted on the project server',
      tint: t.TINT_LAV,
      ink: t.LAVENDER_DEEP,
    },
    {
      icon: 'block',
      label: 'No Data Sales',
      value: 'We never sell your data to third parties',
      tint: t.TINT_CREAM,
      ink: t.CREAM_DEEP,
    },
  ];

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
          LEGAL · PRIVACY POLICY
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
          Privacy Policy
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
            What data WalletPulse collects and how it is used.
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* At-a-glance card */}
        <div
          className="rounded-3xl px-8 md:px-10 py-8"
          style={{
            background: t.CARD,
            border: `1px solid ${t.HAIR_HEAVY}`,
            boxShadow: t.SH_CARD,
          }}
        >
          <div
            style={{
              ...monoStyle,
              fontSize: 10,
              letterSpacing: '0.22em',
              color: t.SUBINK,
              marginBottom: 8,
            }}
          >
            AT A GLANCE
          </div>
          <h2
            style={{
              ...headlineStyle,
              fontWeight: 600,
              fontSize: 24,
              letterSpacing: '-0.02em',
              color: t.INK,
              marginBottom: 20,
            }}
          >
            Privacy in three lines
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {glanceItems.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl p-5 flex flex-col gap-3"
                style={{
                  background: t.CARD_2,
                  border: `1px solid ${t.HAIR_DIV}`,
                }}
              >
                <span
                  className="w-10 h-10 rounded-xl inline-flex items-center justify-center"
                  style={{ background: item.tint }}
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{
                      color: t.ON_TINT,
                      fontVariationSettings: "'FILL' 1",
                    }}
                  >
                    {item.icon}
                  </span>
                </span>
                <p
                  style={{
                    ...monoStyle,
                    fontSize: 10,
                    letterSpacing: '0.22em',
                    color: t.SUBINK,
                    textTransform: 'uppercase',
                  }}
                >
                  {item.label}
                </p>
                <p style={{ color: t.INK, fontSize: 14, lineHeight: 1.5 }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Long-form sections */}
        <div
          className="rounded-3xl px-8 md:px-12 py-10 md:py-14"
          style={{
            background: t.CARD,
            border: `1px solid ${t.HAIR_HEAVY}`,
            boxShadow: t.SH_CARD,
          }}
        >
          <Section eyebrow="01 · COLLECTION" title="What Data We Collect" t={t}>
            <p>When you create an account and use WalletPulse, we collect and store the following information:</p>
            <div
              className="rounded-2xl p-5 mt-2"
              style={{
                background: t.CARD_2,
                border: `1px solid ${t.HAIR_DIV}`,
              }}
            >
              <DataRow t={t} label="Account data" value="First name, last name, email address" />
              <DataRow t={t} label="Credentials" value="Password (BCrypt-hashed — never stored in plain text)" />
              <DataRow t={t} label="Portfolio data" value="Wallet names, blockchain addresses, asset types" />
              <DataRow t={t} label="Transaction data" value="Transaction dates, amounts, purchase prices, transaction hashes" />
              <DataRow t={t} label="Preferences" value="Currency setting, theme preference" />
            </div>
            <p className="mt-3">We do not collect browser fingerprints, IP addresses, or behavioral tracking data.</p>
          </Section>

          <Section eyebrow="02 · USAGE" title="How We Use Your Data" t={t}>
            <p>All data you enter is used exclusively to provide the WalletPulse service to you:</p>
            <ul className="list-disc pl-6 space-y-1" style={{ color: t.SUBINK }}>
              <li>To calculate and display your portfolio value and P&amp;L</li>
              <li>To authenticate your sessions securely via JWT</li>
              <li>To import and deduplicate on-chain transactions</li>
              <li>To look up historical prices for your transactions</li>
            </ul>
            <p>Your data is never used for advertising, profiling, or shared with third parties for commercial purposes.</p>
          </Section>

          <Section eyebrow="03 · APIS" title="Third-Party APIs" t={t}>
            <p>WalletPulse sends limited data to third-party APIs to enrich your portfolio. No personally identifiable information is ever sent to these services:</p>
            <div
              className="rounded-2xl p-5 mt-2"
              style={{
                background: t.CARD_2,
                border: `1px solid ${t.HAIR_DIV}`,
              }}
            >
              <DataRow t={t} label="CoinGecko" value="Coin IDs only (e.g. 'bitcoin') — for live and historical price lookups" />
              <DataRow t={t} label="CryptoCompare" value="Coin symbols and dates — historical price fallback for older transactions" />
              <DataRow t={t} label="Etherscan" value="Your Ethereum wallet address — to import on-chain transaction history" />
              <DataRow t={t} label="Blockstream" value="Your Bitcoin wallet address — to import on-chain transaction history" />
              <DataRow t={t} label="Helius" value="Your Solana wallet address — to import on-chain transaction history" />
              <DataRow t={t} label="Frankfurter" value="No personal data — only a fixed EUR→USD rate query for currency display" />
            </div>
            <p className="mt-3">These services have their own privacy policies which we recommend reviewing.</p>
          </Section>

          <Section eyebrow="04 · RETENTION" title="Data Retention and Deletion" t={t}>
            <p>Your data is retained for as long as your account exists. You can delete individual transactions and wallets at any time through the app.</p>
            <p>To request full deletion of your account and all associated data, contact us via the project repository. We will process the request within a reasonable timeframe.</p>
          </Section>

          <Section eyebrow="05 · SECURITY" title="Security" t={t}>
            <p>We take reasonable technical measures to protect your data, including:</p>
            <ul className="list-disc pl-6 space-y-1" style={{ color: t.SUBINK }}>
              <li>BCrypt password hashing</li>
              <li>Stateless JWT authentication with expiry</li>
              <li>HTTPS-only communication in production</li>
              <li>No sensitive credentials stored in version control</li>
            </ul>
          </Section>

          <Section eyebrow="06 · CHANGES" title="Changes to This Policy" t={t}>
            <p>We may update this Privacy Policy from time to time. Changes will be reflected by the "Last updated" date above. Continued use of the service after changes constitutes acceptance of the revised policy.</p>
          </Section>

          <Section eyebrow="07 · CONTACT" title="Contact" t={t}>
            <p>For any privacy-related questions or data deletion requests, please reach out via the project repository.</p>
          </Section>
        </div>
      </div>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
