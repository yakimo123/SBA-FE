import { Bell, Home, LogIn, Search } from 'lucide-react';
import { Outlet, useNavigate } from 'react-router-dom';

import { Sidebar } from '../components/admin/Sidebar';
import { SidebarInset, SidebarProvider } from '../components/ui/sidebar';
import { useAuth } from '../contexts/AuthContext';

export function AdminLayout() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <Sidebar />

      {/* Main Content */}
      <SidebarInset className="bg-purple-50">
        {/* Header */}
        <header className="sticky top-0 z-30 shadow-sm" style={{ backgroundColor: '#59168B' }}>
          <div className="flex h-16 items-center justify-between px-8">
            <div className="flex items-center gap-4 mx-4">              
              {/* Search */}
              <div className="flex-1 max-w-3xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                  <input
                    type="text"
                    placeholder="Search products, orders, customers..."
                    className="w-full rounded-lg border border-white/30 bg-white/10 py-2 pl-10 pr-4 font-['Fira_Sans'] text-sm text-white placeholder-white/60 outline-none transition-all focus:border-white/60 focus:ring-2 focus:ring-white/20"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* User Email */}
              {isAuthenticated && user?.email && (
                <span className="hidden md:inline-block max-w-[200px] truncate text-sm font-['Fira_Sans'] text-white/90">
                  User: {user.email}
                </span>
              )}

              {/* Notifications */}
              <button
                type="button"
                className="relative rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-orange-500"></span>
              </button>

              {/* Trang chủ */}
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 rounded-lg border border-white/40 px-3 py-1.5 text-sm font-['Fira_Sans'] font-medium text-white transition-colors hover:bg-white/10"
              >
                <Home className="h-4 w-4" />
                Trang chủ
              </button>

              {/* Login */}
              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-['Fira_Sans'] font-medium text-[#59168B] transition-colors hover:bg-white/90"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
