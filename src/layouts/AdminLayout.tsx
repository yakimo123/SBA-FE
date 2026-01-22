import { Bell, Search } from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { Sidebar } from '../components/admin/Sidebar';
import { SidebarInset, SidebarProvider } from '../components/ui/sidebar';

export function AdminLayout() {
  return (
    <SidebarProvider>
      <Sidebar />

      {/* Main Content */}
      <SidebarInset className="bg-purple-50">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-purple-200 bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-8">
            <div className="flex items-center gap-4 mx-4">              
              {/* Search */}
              <div className="flex-1 max-w-3xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products, orders, customers..."
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 font-['Fira_Sans'] text-sm outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button
                type="button"
                className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-purple-100 hover:text-purple-600"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-orange-500"></span>
              </button>
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
