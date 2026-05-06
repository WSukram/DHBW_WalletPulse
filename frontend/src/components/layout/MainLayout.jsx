import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const MainLayout = () => {
  return (
    <div className="bg-background text-on-background flex h-screen overflow-hidden antialiased">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopNav />
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
