'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, Users, FileText, Settings, LogOut, Upload, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';

interface NavItem {
  href?: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { href: string; labelKey: string }[];
}

const navItems: NavItem[] = [
  { href: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/properties', labelKey: 'nav.properties', icon: Building2 },
  { href: '/tenants', labelKey: 'nav.tenants', icon: Users },
  { href: '/payments', labelKey: 'nav.payments', icon: FileText },
  { 
    labelKey: 'nav.reports', 
    icon: FileText,
    children: [
      { href: '/reports', labelKey: 'nav.reports.financial' },
      { href: '/reports/profit', labelKey: 'nav.reports.profit' },
    ]
  },
  { href: '/import', labelKey: 'nav.import', icon: Upload },
  { href: '/settings', labelKey: 'nav.settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">A</span>
        </div>
        <span className="font-semibold text-lg text-foreground">{t('app.title')}</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          // Handle items with children (dropdown)
          if (item.children) {
            const isExpanded = item.children.some(child => pathname.startsWith(child.href));
            
            return (
              <div key={item.labelKey} className="space-y-1">
                <div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors min-h-[44px]',
                    isExpanded
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {t(item.labelKey)}
                </div>
                <div className="ml-6 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors min-h-[44px]',
                        pathname === child.href
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      {t(child.labelKey)}
                    </Link>
                  ))}
                </div>
              </div>
            );
          }
          
          // Handle regular items
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors min-h-[44px]',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground min-h-[44px]"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {t('nav.logout')}
        </Button>
      </div>
    </aside>
  );
}
