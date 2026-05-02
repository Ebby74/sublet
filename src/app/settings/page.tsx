'use client';

import { useSession } from 'next-auth/react';
import { TaxCalculator } from '@/components/settings/tax-calculator';
import { MarketingChannelsPanel } from '@/components/ui/marketing-channels-panel';

export default function SettingsPage() {
  const { data: session } = useSession();
  const userId = session?.user.id;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and marketing channels
        </p>
      </div>

      <div className="space-y-6">
        <MarketingChannelsPanel userId={userId} />
        <TaxCalculator />
      </div>
    </div>
  );
}
