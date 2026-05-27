import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { LIGHT, DARK, headlineStyle, monoStyle, bodyFontFamily, usePrefersDark } from '../theme/softStack';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
const SPEC_URL = `${API_BASE}/v3/api-docs`;

export default function Docs() {
  usePageTitle('API Docs');
  const isDark = usePrefersDark();
  const t = isDark ? DARK : LIGHT;

  let configuration;
  try {
    configuration = {
      url: SPEC_URL,
      theme: 'default',
      darkMode: isDark,
    };
  } catch {
    configuration = { url: SPEC_URL };
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: t.PAPER, color: t.INK, fontFamily: bodyFontFamily }}
    >
      <header
        className="sticky top-0 z-50"
        style={{
          backgroundColor: t.HEADER_BG,
          backdropFilter: 'saturate(140%) blur(14px)',
          WebkitBackdropFilter: 'saturate(140%) blur(14px)',
          borderBottom: `1px solid ${t.HAIR_HEAVY}`,
        }}
      >
        <div className="flex items-center justify-between w-full px-6 lg:px-10 h-[68px] max-w-[1240px] mx-auto">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/wp-icon.svg"
              alt=""
              className="w-9 h-9"
              style={{ boxShadow: t.SH_NAV_LOGO, borderRadius: 11 }}
            />
            <span className="text-[19px] font-semibold" style={headlineStyle}>
              WalletPulse
            </span>
          </Link>
          <span
            style={{
              ...monoStyle,
              fontSize: 11,
              letterSpacing: '0.22em',
              color: t.SUBINK,
            }}
          >
            DOCS · API REFERENCE
          </span>
        </div>
      </header>

      <main className="flex-grow">
        <ApiReferenceReact configuration={configuration} />
      </main>
    </div>
  );
}
