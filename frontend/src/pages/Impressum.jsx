import LegalLayout from '../components/layout/LegalLayout';
import { usePageTitle } from '../hooks/usePageTitle';

const Section = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="font-heading-md text-heading-md text-inverse-surface mb-4 flex items-center gap-3">
      <span className="w-1 h-6 rounded-full bg-tertiary inline-block" />
      {title}
    </h2>
    <div className="space-y-3 font-body-md text-body-md text-on-surface-variant leading-relaxed">
      {children}
    </div>
  </section>
);

const Impressum = () => {
  usePageTitle('Impressum');
  return (
    <LegalLayout>
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 bg-tertiary/10 text-tertiary border border-tertiary/20 rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase mb-6">
          <span className="material-symbols-outlined text-[14px]">info</span>
          Legal Notice
        </div>
        <h1 className="font-display-xl text-display-xl text-inverse-surface mb-4 leading-tight">
          Impressum
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Legal disclosure pursuant to § 5 TMG (German Telemedia Act)
        </p>
      </div>

      <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-8 md:p-12">
        <Section title="Responsible Person">
          <p><strong className="text-on-surface">Markus Wenninger</strong></p>
          <p>Student at DHBW Ravensburg Campus Friedrichshafen (Baden-Württemberg Cooperative State University)</p>
          <p>Programme: Angewandte Informatik</p>
        </Section>

        <Section title="Contact">
          <p>
            Email:{' '}
            <a
              href="mailto:wenninger.marku-25@stud.dhbw-ravensburg.de"
              className="text-primary hover:underline"
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
              className="text-primary hover:underline"
            >
              github.com/WSukram/DHBW_WalletPulse
            </a>
          </p>
        </Section>

        <Section title="About This Project">
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

        <Section title="Disclaimer">
          <p>
            WalletPulse does not provide financial or investment advice. All price data is
            sourced from third-party APIs (CoinGecko, Etherscan, Helius, Blockstream) and
            is provided for informational purposes only. No guarantee is made for its
            accuracy or completeness.
          </p>
        </Section>

        <Section title="License">
          <p>
            The source code is released under the{' '}
            <a
              href="https://opensource.org/licenses/MIT"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
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
