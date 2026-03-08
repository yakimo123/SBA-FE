import {
  Building, ChevronRight, FileText, Heart, LayoutDashboard,
  MessageSquare, Package, Settings, ShoppingBag, ShoppingCart,
  Star, Store, Tag, Truck, Users,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
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
    title: 'Products', href: '/admin/products', icon: Package,
    children: [
      { title: 'All Products',  href: '/admin/products',            icon: Package  },
      { title: 'Categories',    href: '/admin/products/categories', icon: Tag      },
      { title: 'Trademarks',   href: '/admin/products/trademarks', icon: Star     },
      { title: 'Suppliers',    href: '/admin/products/suppliers',  icon: Truck    },
      { title: 'Attributes',   href: '/admin/products/attributes', icon: FileText },
    ],
  },
  {
    title: 'Orders', href: '/admin/orders', icon: ShoppingCart,
    children: [
      { title: 'All Orders',  href: '/admin/orders',          icon: ShoppingCart },
      { title: 'Bulk Orders', href: '/admin/orders/bulk',     icon: ShoppingBag  },
      { title: 'Vouchers',    href: '/admin/orders/vouchers', icon: Tag          },
    ],
  },
  {
    title: 'Customers', href: '/admin/customers', icon: Users,
    children: [
      { title: 'All Customers', href: '/admin/customers',           icon: Users        },
      { title: 'Companies',     href: '/admin/customers/companies', icon: Building     },
      { title: 'Favorites',     href: '/admin/customers/favorites', icon: Heart        },
      { title: 'Feedback',      href: '/admin/customers/feedback',  icon: MessageSquare},
    ],
  },
  {
    title: 'Settings', href: '/admin/settings', icon: Settings,
    children: [
      { title: 'Store Branches', href: '/admin/settings/stores',     icon: Store    },
      { title: 'Guarantees',     href: '/admin/settings/guarantees', icon: FileText },
      { title: 'Media Library',  href: '/admin/settings/media',      icon: Package  },
    ],
  },
];

/* ─── Inline CSS injected once ─────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');

  /* ── Root variables ── */
  .sb-root {
    --sb-bg:        #1c1410;
    --sb-bg-2:      #251a13;
    --sb-border:    rgba(255,255,255,0.07);
    --sb-ink:       #f0ebe3;
    --sb-ink-2:     rgba(240,235,227,0.55);
    --sb-ink-3:     rgba(240,235,227,0.3);
    --sb-accent:    #c9521a;
    --sb-accent-2:  #e07040;
    --sb-hover:     rgba(255,255,255,0.06);
    --sb-active:    rgba(201,82,26,0.18);
    --sb-active-bd: rgba(201,82,26,0.5);
    width: 240px;
    min-height: 100vh;
    background: var(--sb-bg);
    display: flex;
    flex-direction: column;
    font-family: 'DM Sans', sans-serif;
    border-right: 1px solid var(--sb-border);
    position: relative;
    overflow: hidden;
  }

  /* subtle warm grain overlay */
  .sb-root::before {
    content: '';
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background:
      radial-gradient(ellipse 160% 60% at 50% -10%, rgba(201,82,26,0.12) 0%, transparent 65%),
      radial-gradient(ellipse 100% 40% at 80% 110%, rgba(74,63,143,0.08) 0%, transparent 60%);
  }

  .sb-root > * { position: relative; z-index: 1; }

  /* ── Header ── */
  .sb-header {
    height: 64px;
    display: flex; align-items: center; gap: 12px;
    padding: 0 20px;
    border-bottom: 1px solid var(--sb-border);
    flex-shrink: 0;
  }
  .sb-logo-mark {
    width: 34px; height: 34px; border-radius: 10px;
    background: linear-gradient(135deg, var(--sb-accent) 0%, var(--sb-accent-2) 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 3px 10px rgba(201,82,26,0.4);
    flex-shrink: 0;
  }
  .sb-logo-mark svg { color: white; width: 17px; height: 17px; }
  .sb-logo-text {
    font-family: 'DM Serif Display', serif;
    font-size: 1.15rem; font-weight: 400;
    color: var(--sb-ink); letter-spacing: -0.3px; line-height: 1;
  }
  .sb-logo-sub {
    font-family: 'DM Mono', monospace;
    font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--sb-ink-3); margin-top: 2px;
  }

  /* ── Nav ── */
  .sb-nav { flex: 1; padding: 12px 10px; overflow-y: auto; }
  .sb-nav::-webkit-scrollbar { width: 3px; }
  .sb-nav::-webkit-scrollbar-track { background: transparent; }
  .sb-nav::-webkit-scrollbar-thumb { background: var(--sb-border); border-radius: 2px; }

  /* ── Section label ── */
  .sb-section-label {
    font-family: 'DM Mono', monospace; font-size: 0.62rem;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--sb-ink-3); padding: 14px 10px 6px; display: block;
  }
  .sb-section-label:first-child { padding-top: 4px; }

  /* ── Top-level item ── */
  .sb-item { margin-bottom: 2px; }

  .sb-link {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 10px; border-radius: 9px;
    font-size: 0.875rem; font-weight: 500; color: var(--sb-ink-2);
    text-decoration: none; transition: all 0.15s; cursor: pointer;
    border: 1px solid transparent;
  }
  .sb-link svg { flex-shrink: 0; opacity: 0.7; transition: opacity 0.15s; }
  .sb-link:hover { background: var(--sb-hover); color: var(--sb-ink); }
  .sb-link:hover svg { opacity: 1; }
  .sb-link.active {
    background: var(--sb-active); color: var(--sb-ink);
    border-color: var(--sb-active-bd);
  }
  .sb-link.active svg { opacity: 1; color: var(--sb-accent); }

  /* ── Collapsible trigger ── */
  .sb-trigger {
    display: flex; align-items: center; gap: 10px; width: 100%;
    padding: 8px 10px; border-radius: 9px;
    font-size: 0.875rem; font-weight: 500; color: var(--sb-ink-2);
    background: none; border: none; cursor: pointer; text-align: left;
    transition: all 0.15s;
  }
  .sb-trigger svg.icon { flex-shrink: 0; opacity: 0.7; }
  .sb-trigger:hover { background: var(--sb-hover); color: var(--sb-ink); }
  .sb-trigger:hover svg { opacity: 1; }

  .sb-chevron {
    margin-left: auto; width: 14px; height: 14px; opacity: 0.4;
    transition: transform 0.2s ease, opacity 0.15s;
    flex-shrink: 0;
  }
  .sb-trigger[data-state='open'] .sb-chevron {
    transform: rotate(90deg); opacity: 0.7;
  }
  .sb-trigger[data-state='open'] { color: var(--sb-ink); }

  /* ── Sub items ── */
  .sb-sub { padding: 3px 0 4px 20px; }
  .sb-sub-line {
    margin-left: 10px;
    border-left: 1px solid var(--sb-border);
    padding-left: 14px;
  }
  .sb-sub-link {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 10px; border-radius: 7px;
    font-size: 0.825rem; font-weight: 400; color: var(--sb-ink-3);
    text-decoration: none; transition: all 0.15s; margin-bottom: 1px;
    border: 1px solid transparent;
  }
  .sb-sub-link svg { width: 13px; height: 13px; flex-shrink: 0; opacity: 0.6; }
  .sb-sub-link:hover { background: var(--sb-hover); color: var(--sb-ink-2); }
  .sb-sub-link:hover svg { opacity: 1; }
  .sb-sub-link.active {
    color: var(--sb-accent-2); font-weight: 500;
  }
  .sb-sub-link.active svg { opacity: 1; color: var(--sb-accent-2); }

  /* ── Active dot for sub ── */
  .sb-sub-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--sb-accent); margin-left: auto; flex-shrink: 0;
    opacity: 0;
  }
  .sb-sub-link.active .sb-sub-dot { opacity: 1; }

  /* ── Divider ── */
  .sb-divider {
    height: 1px; background: var(--sb-border);
    margin: 8px 10px;
  }

  /* ── Footer ── */
  .sb-footer {
    border-top: 1px solid var(--sb-border);
    padding: 14px 16px;
    flex-shrink: 0;
  }
  .sb-user {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 10px; border-radius: 9px;
    transition: background 0.15s; cursor: pointer;
  }
  .sb-user:hover { background: var(--sb-hover); }
  .sb-avatar {
    width: 32px; height: 32px; border-radius: 9px;
    background: linear-gradient(135deg, #3b2a60 0%, var(--sb-accent) 100%);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-family: 'DM Mono', monospace;
    font-size: 0.75rem; font-weight: 500; color: white; letter-spacing: 0.02em;
  }
  .sb-user-name {
    font-size: 0.85rem; font-weight: 500; color: var(--sb-ink); line-height: 1.2;
  }
  .sb-user-email {
    font-size: 0.72rem; color: var(--sb-ink-3); margin-top: 1px; line-height: 1;
    font-family: 'DM Mono', monospace;
  }
  .sb-user-chevron { margin-left: auto; color: var(--sb-ink-3); flex-shrink: 0; }
`;

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (href: string) => location.pathname === href;
  const isGroupActive = (item: NavigationItem) =>
    item.children?.some((c) => isActive(c.href)) || isActive(item.href);

  return (
    <ShadcnSidebar 
      collapsible="icon"
      style={{
        '--sidebar': '#59168B',
        '--sidebar-foreground': '#ffffff',
        '--sidebar-border': 'transparent',
        '--sidebar-accent': 'rgba(255, 255, 255, 0.15)',
        '--sidebar-accent-foreground': '#ffffff',
        '--sidebar-ring': '#f97316',
      } as React.CSSProperties}
      className="border-none text-white min-h-screen"
    >
      <SidebarHeader className="h-16 border-b border-white/20 px-6 justify-center">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-orange-400" />
          <span className="font-['Fira_Code'] text-lg font-semibold text-white">
            Admin Panel
          </span>
        </div>

        {/* ── Nav ── */}
        <nav className="sb-nav">
          {navigation.map((item, idx) => (
            <div key={item.title} className="sb-item">
              {/* Divider between sections */}
              {idx > 0 && idx < navigation.length && (
                <div className="sb-divider" />
              )}

              {!item.children ? (
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === item.href}
                  className="hover:bg-white/10 data-[active=true]:bg-orange-500 data-[active=true]:text-white text-white font-['Fira_Sans'] font-medium"
                >
                  <item.icon size={16} />
                  <span>{item.title}</span>
                </NavLink>
              ) : (
                /* ── Collapsible group ── */
                <Collapsible defaultOpen={isGroupActive(item)}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="hover:bg-white/10 font-['Fira_Sans'] font-medium text-white/80 hover:text-white">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                      <ChevronRight className="sb-chevron" />
                    </button>
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
                            <sub.icon size={13} />
                            <span>{sub.title}</span>
                            <span className="sb-sub-dot" />
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          ))}
        </nav>

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

      </aside>
    </>
  );
}