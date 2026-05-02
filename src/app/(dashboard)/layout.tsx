'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileMenu } from '@/components/layout/mobile-menu';
import { LanguageProvider } from '@/lib/i18n';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Mobile Menu */}
        <MobileMenu
          open={mobileMenuOpen}
          onOpenChange={setMobileMenuOpen}
        />

        {/* Main Content */}
        <div className="flex flex-col lg:pl-64">
          <Header onMenuClick={() => setMobileMenuOpen(true)} />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </LanguageProvider>
  );
}
