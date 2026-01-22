import { Building, ChevronRight,FileText, Heart, LayoutDashboard, MessageSquare, Package, Settings, ShoppingBag, ShoppingCart, Star, Store, Tag, Truck, Users } from 'lucide-react';
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
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package,
    children: [
      { title: 'All Products', href: '/admin/products', icon: Package },
      { title: 'Categories', href: '/admin/products/categories', icon: Tag },
      { title: 'Trademarks', href: '/admin/products/trademarks', icon: Star },
      { title: 'Suppliers', href: '/admin/products/suppliers', icon: Truck },
      { title: 'Attributes', href: '/admin/products/attributes', icon: FileText },
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
      { title: 'Companies', href: '/admin/customers/companies', icon: Building },
      { title: 'Favorites', href: '/admin/customers/favorites', icon: Heart },
      { title: 'Feedback', href: '/admin/customers/feedback', icon: MessageSquare },
    ],
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    children: [
      { title: 'Store Branches', href: '/admin/settings/stores', icon: Store },
      { title: 'Guarantees', href: '/admin/settings/guarantees', icon: FileText },
      { title: 'Media Library', href: '/admin/settings/media', icon: Package },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <ShadcnSidebar 
      collapsible="icon"
      style={{
        '--sidebar-background': 'transparent',
        '--sidebar-foreground': '#ffffff',
        '--sidebar-border': 'transparent',
        '--sidebar-accent': 'rgba(255, 255, 255, 0.1)',
        '--sidebar-accent-foreground': '#ffffff',
        '--sidebar-ring': '#f97316',
        background: 'linear-gradient(to bottom, #581c87, #3b0764)',
      } as React.CSSProperties}
      className="border-none text-white min-h-screen"
    >
      <SidebarHeader className="h-16 border-b border-purple-800 px-6 justify-center">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-orange-400" />
          <span className="font-['Fira_Code'] text-lg font-semibold">
            Admin Panel
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          {navigation.map((item) => (
            <SidebarMenuItem key={item.title}>
              {!item.children ? (
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === item.href}
                  className="hover:bg-purple-800/50 data-[active=true]:bg-orange-500 data-[active=true]:text-white font-['Fira_Sans'] font-medium"
                >
                  <NavLink to={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              ) : (
                <Collapsible defaultOpen className="group/collapsible">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="hover:bg-purple-800/50 font-['Fira_Sans'] font-medium text-purple-200 hover:text-white">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.children.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton 
                            asChild 
                            isActive={location.pathname === subItem.href}
                            className="hover:bg-purple-800/50 data-[active=true]:text-orange-400 text-purple-200"
                          >
                            <NavLink to={subItem.href}>
                              <subItem.icon className="h-4 w-4" />
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

      <SidebarFooter className="border-t border-purple-800 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-700">
            <Users className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="font-['Fira_Sans'] text-sm font-medium">Admin</p>
            <p className="font-['Fira_Sans'] text-xs text-purple-300">
              admin@example.com
            </p>
          </div>
        </div>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
