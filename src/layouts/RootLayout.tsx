import { Outlet } from 'react-router-dom';

import ScrollToTop from '../components/common/ScrollToTop';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';

export function RootLayout() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
