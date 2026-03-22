import {
  Building,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
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
          '--sidebar': '#ffffff',
          '--sidebar-foreground': '#1f2937',
          '--sidebar-border': '#f3f4f6',
          '--sidebar-accent': '#fff1f0',
          '--sidebar-accent-foreground': '#dc2626',
          '--sidebar-ring': '#dc2626',
        } as React.CSSProperties
      }
      className="border-r border-gray-100 text-gray-800 min-h-screen shadow-sm"
    >
      <SidebarHeader className="h-16 border-b border-gray-100 px-6 justify-center">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-[#dc2626]" />
          <span className="font-['Outfit'] text-lg font-semibold text-gray-900">
            Admin Panel
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navigation.map((item, idx) => (
            <SidebarMenuItem key={item.title}>
              {idx > 0 && idx < navigation.length && (
                <div className="h-px bg-gray-100 mx-4 my-2" />
              )}

              {!item.children ? (
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.href}
                  className="hover:bg-[#dc2626]/5 data-[active=true]:bg-[#dc2626]/10 data-[active=true]:text-[#dc2626] data-[active=true]:border-l-4 data-[active=true]:border-[#dc2626] text-gray-700 font-['Inter'] font-medium transition-colors"
                >
                  <NavLink to={item.href}>
                    <item.icon size={16} />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              ) : (
                <Collapsible defaultOpen={isGroupActive(item)}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="hover:bg-[#dc2626]/5 font-['Inter'] font-medium text-gray-700 hover:text-[#dc2626] transition-colors rounded-[8px]">
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
                            className="hover:bg-[#dc2626]/5 data-[active=true]:text-[#dc2626] data-[active=true]:bg-[#dc2626]/5 data-[active=true]:font-semibold text-gray-600 transition-colors rounded-[8px]"
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

      <SidebarFooter className="border-t border-gray-100 p-4 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dc2626]/10">
            <Users className="h-4 w-4 text-[#dc2626]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-['Inter'] text-sm font-medium text-gray-900">
              {user?.fullName || 'Admin'}
            </p>
            <p className="font-['Inter'] text-xs text-gray-500 truncate">
              {user?.email || 'admin@example.com'}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
