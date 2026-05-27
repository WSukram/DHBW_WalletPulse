import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { LIGHT, DARK, bodyFontFamily, usePrefersDark } from '../../theme/softStack';

const MainLayout = () => {
  const isDark = usePrefersDark();
  const t = isDark ? DARK : LIGHT;

  return (
    <div
      className="flex h-screen overflow-hidden antialiased"
      style={{
        background: t.PAPER,
        color: t.INK,
        fontFamily: bodyFontFamily,
      }}
    >
      <Sidebar t={t} />
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <TopNav t={t} />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[420px] rounded-full blur-3xl"
          style={{ background: t.BLOB_MINT, opacity: 0.55 }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-10 right-[-120px] w-[420px] h-[320px] rounded-full blur-3xl"
          style={{ background: t.BLOB_LAV, opacity: 0.45 }}
        />
        <div className="flex-1 overflow-auto relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
