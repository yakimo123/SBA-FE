import {
  Building,
  ChevronRight,
  FileText,
  Heart,
  Image as ImageIcon,
  LayoutDashboard,
  MessageSquare,
  MinusCircle,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Star,
  Store,
  Tag,
  Truck,
  Users,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

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

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package,
    children: [
      { title: 'All Products', href: '/admin/products', icon: Package },
      { title: 'Categories', href: '/admin/products/categories', icon: Tag },
      { title: 'Trademarks', href: '/admin/products/trademarks', icon: Star },
      { title: 'Suppliers', href: '/admin/products/suppliers', icon: Truck },
      {
        title: 'Attributes',
        href: '/admin/products/attributes',
        icon: FileText,
      },
      {
        title: 'Price Tiers',
        href: '/admin/products/price-tiers',
        icon: Tag,
      },
    ],
  },
  {
    title: 'Warehouse',
    href: '/admin/inventory',
    icon: Store,
    children: [
      { title: 'Inventory', href: '/admin/inventory', icon: Package },
      { title: 'Stock Import', href: '/admin/inventory/import', icon: Plus },
      {
        title: 'Stock Export',
        href: '/admin/inventory/export',
        icon: MinusCircle,
      },
    ],
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    children: [
      { title: 'All Orders', href: '/admin/orders', icon: ShoppingCart },
      { title: 'Bulk Orders', href: '/admin/orders/bulk', icon: ShoppingBag },
      { title: 'Vouchers', href: '/admin/orders/vouchers', icon: Tag },
    ],
  },
  {
    title: 'Customers',
    href: '/admin/customers',
    icon: Users,
    children: [
      { title: 'All Customers', href: '/admin/customers', icon: Users },
      {
        title: 'Companies',
        href: '/admin/customers/companies',
        icon: Building,
      },
      { title: 'Favorites', href: '/admin/customers/favorites', icon: Heart },
      {
        title: 'Feedback',
        href: '/admin/customers/feedback',
        icon: MessageSquare,
      },
      {
        title: 'Reviews',
        href: '/admin/customers/reviews',
        icon: Star,
      },
    ],
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    children: [
      { title: 'Store Branches', href: '/admin/settings/stores', icon: Store },
      {
        title: 'Guarantees',
        href: '/admin/settings/guarantees',
        icon: FileText,
      },
      { title: 'Banners', href: '/admin/settings/banners', icon: ImageIcon },
      { title: 'Media Library', href: '/admin/settings/media', icon: Package },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (href: string) => location.pathname === href;
  const isGroupActive = (item: NavigationItem) =>
    item.children?.some((c) => isActive(c.href)) || isActive(item.href);

  return (
    <ShadcnSidebar
      collapsible="icon"
      style={
        {
          '--sidebar': '#59168B',
          '--sidebar-foreground': '#ffffff',
          '--sidebar-border': 'transparent',
          '--sidebar-accent': 'rgba(255, 255, 255, 0.15)',
          '--sidebar-accent-foreground': '#ffffff',
          '--sidebar-ring': '#f97316',
        } as React.CSSProperties
      }
      className="border-none text-white min-h-screen"
    >
      <SidebarHeader className="h-16 border-b border-white/20 px-6 justify-center">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-orange-400" />
          <span className="font-['Fira_Code'] text-lg font-semibold text-white">
            Admin Panel
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navigation.map((item, idx) => (
            <SidebarMenuItem key={item.title}>
              {idx > 0 && idx < navigation.length && (
                <div className="h-px bg-white/10 mx-4 my-2" />
              )}

              {!item.children ? (
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.href}
                  className="hover:bg-white/10 data-[active=true]:bg-orange-500 data-[active=true]:text-white text-white font-['Fira_Sans'] font-medium"
                >
                  <NavLink to={item.href}>
                    <item.icon size={16} />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              ) : (
                <Collapsible defaultOpen={isGroupActive(item)}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="hover:bg-white/10 font-['Fira_Sans'] font-medium text-white/80 hover:text-white">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                      <ChevronRight className="h-4 w-4 ml-auto opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.children.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location.pathname === subItem.href}
                            className="hover:bg-white/10 data-[active=true]:text-orange-400 text-white/70"
                          >
                            <NavLink to={subItem.href}>
                              <subItem.icon size={13} />
                              <span>{subItem.title}</span>
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

      <SidebarFooter className="border-t border-white/20 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <Users className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-['Fira_Sans'] text-sm font-medium text-white">
              {user?.fullName || 'Admin'}
            </p>
            <p className="font-['Fira_Sans'] text-xs text-white/70 truncate">
              {user?.email || 'admin@example.com'}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
