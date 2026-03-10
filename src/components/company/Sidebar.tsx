import {
  Building2,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  User,
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { title: 'Tổng quan', href: '/company', icon: LayoutDashboard },
  {
    title: 'Đơn hàng',
    href: '/company/orders',
    icon: ClipboardList,
    children: [
      { title: 'Đơn hàng của tôi', href: '/company/orders', icon: ClipboardList },
      { title: 'Tạo đơn hàng mới', href: '/company/orders/new', icon: PlusCircle },
    ],
  },
  { title: 'Tài khoản', href: '/company/account', icon: User },
];

export function CompanySidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <ShadcnSidebar
      collapsible="icon"
      style={{
        '--sidebar-background': 'transparent',
        '--sidebar-foreground': '#334155',
        '--sidebar-border': 'transparent',
        '--sidebar-accent': 'rgba(37,99,235,0.08)',
        '--sidebar-accent-foreground': '#0f172a',
        '--sidebar-ring': '#2563eb',
        background:
          'radial-gradient(120% 80% at 10% 10%, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0) 55%), linear-gradient(170deg, #f8fbff 0%, #eef4ff 45%, #e5eefc 100%)',
      } as React.CSSProperties}
      className="min-h-screen border-none"
    >
      {/* Logo */}
      <SidebarHeader className="h-20 border-b border-slate-200/80 px-4 py-3">
        <div className="flex h-full items-center gap-3 rounded-lg px-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm ring-1 ring-blue-200/70">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[24px] leading-none font-semibold tracking-tight text-slate-900">B2B Company</p>
            <p className="mt-1 truncate text-xs font-medium text-slate-500">Workspace Portal</p>
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-3 py-3">
        <SidebarMenu className="space-y-1.5">
          {navigation.map((item) => (
            <SidebarMenuItem key={item.title}>
              {!item.children ? (
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.href}
                  className="h-11 rounded-xl border border-transparent px-3 text-slate-600 transition-all duration-200 hover:border-slate-200 hover:bg-white/80 hover:text-slate-900 data-[active=true]:border-blue-200 data-[active=true]:bg-blue-600 data-[active=true]:text-white data-[active=true]:shadow-sm"
                >
                  <NavLink to={item.href} className="flex items-center gap-2.5">
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-base font-medium tracking-tight">{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              ) : (
                <Collapsible defaultOpen={location.pathname.startsWith(item.href)} className="group/collapsible">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="h-11 rounded-xl border border-transparent px-3 text-slate-600 transition-all duration-200 hover:border-slate-200 hover:bg-white/80 hover:text-slate-900">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-base font-medium tracking-tight">{item.title}</span>
                      <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="ml-3 mt-1.5 space-y-1 rounded-xl border border-slate-200 bg-white/70 p-2">
                      {item.children.map((sub) => (
                        <SidebarMenuSubItem key={sub.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location.pathname === sub.href}
                            className="h-9 rounded-lg px-2.5 text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700"
                          >
                            <NavLink to={sub.href} className="flex items-center gap-2">
                              <sub.icon className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="text-sm font-medium tracking-tight">{sub.title}</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-slate-200/70 p-3">
        <div className="mb-2 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white/80 px-2.5 py-2.5 shadow-sm">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
            {(user?.fullName || user?.name || 'C')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-semibold text-slate-900">
              {user?.fullName || user?.name || 'Company User'}
            </p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-200 hover:bg-white hover:text-slate-900"
        >
          <LogOut className="h-3.5 w-3.5" />
          Đăng xuất
        </button>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
