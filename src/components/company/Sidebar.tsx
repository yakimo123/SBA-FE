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
        '--sidebar-foreground': '#e2e8f0',
        '--sidebar-border': 'transparent',
        '--sidebar-accent': 'rgba(255,255,255,0.08)',
        '--sidebar-accent-foreground': '#ffffff',
        '--sidebar-ring': '#3b82f6',
        background: 'linear-gradient(160deg, #1e3a5f 0%, #1e3a8a 50%, #1d4ed8 100%)',
      } as React.CSSProperties}
      className="border-none min-h-screen"
    >
      {/* Logo */}
      <SidebarHeader className="h-14 border-b border-white/10 px-5 justify-center">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <span className="font-['Fira_Code'] text-sm font-bold tracking-wide text-white">
            B2B Portal
          </span>
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-3 py-4">
        <SidebarMenu className="space-y-0.5">
          {navigation.map((item) => (
            <SidebarMenuItem key={item.title}>
              {!item.children ? (
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.href}
                  className="h-9 rounded-lg text-blue-100 hover:bg-white/10 hover:text-white data-[active=true]:bg-white/15 data-[active=true]:text-white data-[active=true]:font-semibold font-medium transition-all"
                >
                  <NavLink to={item.href} className="flex items-center gap-2.5">
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              ) : (
                <Collapsible defaultOpen={location.pathname.startsWith(item.href)} className="group/collapsible">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="h-9 rounded-lg text-blue-100 hover:bg-white/10 hover:text-white font-medium transition-all">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">{item.title}</span>
                      <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="ml-6 border-l border-white/10 pl-3 mt-0.5 space-y-0.5">
                      {item.children.map((sub) => (
                        <SidebarMenuSubItem key={sub.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location.pathname === sub.href}
                            className="h-8 rounded-lg text-blue-200 hover:bg-white/10 hover:text-white data-[active=true]:text-white data-[active=true]:font-semibold transition-all"
                          >
                            <NavLink to={sub.href} className="flex items-center gap-2">
                              <sub.icon className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="text-xs">{sub.title}</span>
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
      <SidebarFooter className="border-t border-white/10 p-3">
        <div className="mb-2 flex items-center gap-2.5 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-bold text-white">
            {(user?.fullName || user?.name || 'C')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-semibold text-white">
              {user?.fullName || user?.name || 'Company User'}
            </p>
            <p className="truncate text-xs text-blue-300">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-blue-200 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Đăng xuất
        </button>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
