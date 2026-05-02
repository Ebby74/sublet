'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, Users, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet } from '@/components/ui/sheet';
import { useLanguage } from '@/lib/i18n';

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/properties', labelKey: 'nav.properties', icon: Building2 },
  { href: '/tenants', labelKey: 'nav.tenants', icon: Users },
  { href: '/settings', labelKey: 'nav.settings', icon: Settings },
];

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">A</span>
        </div>
        <span className="font-semibold text-lg text-foreground">{t('app.title')}</span>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onOpenChange(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors min-h-[44px]',
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

      <div className="mt-auto pt-6 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors min-h-[44px]"
        >
          <LogOut className="h-5 w-5" />
          {t('nav.logout')}
        </button>
      </div>
    </Sheet>
  );
}
