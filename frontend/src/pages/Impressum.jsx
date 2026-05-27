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

const Impressum = () => {
  usePageTitle('Impressum');
  const isDark = usePrefersDark();
  const t = isDark ? DARK : LIGHT;

  const linkStyle = { color: t.LAVENDER_DEEP };

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
          LEGAL · IMPRESSUM
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
          Impressum
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
            § 5 TMG
          </span>
          <span style={{ color: t.SUBINK, fontSize: 14 }}>
            Legal disclosure pursuant to the German Telemedia Act.
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
        <Section eyebrow="01 · RESPONSIBLE" title="Responsible Person" t={t}>
          <p>
            <strong style={{ ...headlineStyle, fontWeight: 600, color: t.INK }}>
              Markus Wenninger
            </strong>
          </p>
          <p>Student at DHBW Ravensburg Campus Friedrichshafen (Baden-Württemberg Cooperative State University)</p>
          <p>Programme: Angewandte Informatik</p>
        </Section>

        <Section eyebrow="02 · CONTACT" title="Contact" t={t}>
          <p>
            Email:{' '}
            <a
              href="mailto:wenninger.marku-25@stud.dhbw-ravensburg.de"
              className="underline underline-offset-2"
              style={linkStyle}
            >
              wenninger.marku-25@stud.dhbw-ravensburg.de
            </a>
          </p>
          <p>
            GitHub:{' '}
            <a
              href="https://github.com/WSukram/DHBW_WalletPulse"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
              style={linkStyle}
            >
              github.com/WSukram/DHBW_WalletPulse
            </a>
          </p>
        </Section>

        <Section eyebrow="03 · PROJECT" title="About This Project" t={t}>
          <p>
            WalletPulse is a student project developed as part of the{' '}
            <em>Web Engineering 2</em> course at DHBW Ravensburg Campus Friedrichshafen. It is not a commercial product
            and is provided for educational and demonstration purposes only.
          </p>
          <p>
            Data entered by users is stored in a PostgreSQL database on the project server.
            No data is shared with third parties for commercial purposes.
          </p>
        </Section>

        <Section eyebrow="04 · DISCLAIMER" title="Disclaimer" t={t}>
          <p>
            WalletPulse does not provide financial or investment advice. All price data is
            sourced from third-party APIs (CoinGecko, Etherscan, Helius, Blockstream) and
            is provided for informational purposes only. No guarantee is made for its
            accuracy or completeness.
          </p>
        </Section>

        <Section eyebrow="05 · LICENSE" title="License" t={t}>
          <p>
            The source code is released under the{' '}
            <a
              href="https://opensource.org/licenses/MIT"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
              style={linkStyle}
            >
              MIT License
            </a>{' '}
            and publicly available on GitHub. Third-party data providers (CoinGecko,
            Etherscan, Helius, Blockstream) are subject to their own respective terms of service.
          </p>
        </Section>
      </div>
    </LegalLayout>
  );
};

export default Impressum;
