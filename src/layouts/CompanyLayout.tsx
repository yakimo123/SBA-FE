import { Bell, Building2, ChevronRight } from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { CompanySidebar } from '../components/company/Sidebar';
import { SidebarInset, SidebarProvider } from '../components/ui/sidebar';
import { useAuth } from '../contexts/AuthContext';
import { BulkOrderProvider } from '../contexts/BulkOrderContext';

const breadcrumbMap: Record<string, string> = {
  '/company': 'Tổng quan',
  '/company/orders': 'Đơn hàng của tôi',
  '/company/orders/new': 'Tạo đơn hàng mới',
  '/company/account': 'Tài khoản',
};

export function CompanyLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent" />
          <p className="text-sm text-slate-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role?.toUpperCase() !== 'COMPANY') return <Navigate to="/unauthorized" replace />;

  const currentLabel = Object.entries(breadcrumbMap)
    .reverse()
    .find(([path]) => location.pathname.startsWith(path))?.[1] ?? '';

  return (
    <BulkOrderProvider>
    <SidebarProvider>
      <CompanySidebar />
      <SidebarInset className="bg-slate-50 min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
          <div className="flex h-14 items-center justify-between px-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <Building2 className="h-4 w-4 text-blue-500" />
              <span>B2B Portal</span>
              {currentLabel && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                  <span className="font-medium text-slate-700">{currentLabel}</span>
                </>
              )}
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <button className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                <Bell className="h-4.5 w-4.5 h-[18px] w-[18px]" />
              </button>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {(user?.fullName || user?.name || 'C')[0].toUpperCase()}
                </div>
                <span className="text-xs font-medium text-slate-700 max-w-[120px] truncate">
                  {user?.fullName || user?.name}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
    </BulkOrderProvider>
  );
}
