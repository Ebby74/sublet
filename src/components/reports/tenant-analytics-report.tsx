'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Download, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import type { TenantAnalytics } from '@/services/business-summary-service';

type SortField = 'totalPaid' | 'name' | 'expiry' | 'punctuality';

interface TenantAnalyticsReportProps {
  userId?: string;
}

export function TenantAnalyticsReport({ userId = undefined }: TenantAnalyticsReportProps) {
  const [sortBy, setSortBy] = useState<SortField>('totalPaid');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<TenantAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ sortBy });
        const res = await fetch(`/api/v1/reports/tenant-analytics?${params}`);
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch tenant analytics:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [sortBy]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(
      (tenant) =>
        tenant.tenantName.toLowerCase().includes(query) ||
        tenant.tenantEmail?.toLowerCase().includes(query) ||
        tenant.propertyName?.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({ format: 'tenant-analytics', sortBy });
      const res = await fetch(`/api/v1/export?${params}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'tenant-analytics.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getPunctualityColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPunctualityLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Attention';
  };

  const getExpiryLabel = (days: number | null): { text: string; className: string } => {
    if (days === null) return { text: 'No lease', className: 'text-muted-foreground' };
    if (days < 0) return { text: `Expired ${Math.abs(days)}d ago`, className: 'text-red-600' };
    if (days <= 30) return { text: `${days}d remaining`, className: 'text-orange-600' };
    return { text: `${days}d remaining`, className: 'text-green-600' };
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Tenant Analytics</h3>
          <p className="text-sm opacity-90">Payment history and punctuality scores</p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExport} disabled={isExporting}>
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          <span className="ml-2">Export</span>
        </Button>
      </div>

      <div className="p-4 border-b flex gap-4 items-center flex-wrap">
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'totalPaid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('totalPaid')}
          >
            Revenue
          </Button>
          <Button
            variant={sortBy === 'name' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('name')}
          >
            Name
          </Button>
          <Button
            variant={sortBy === 'expiry' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('expiry')}
          >
            Expiry
          </Button>
          <Button
            variant={sortBy === 'punctuality' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('punctuality')}
          >
            Punctuality
          </Button>
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tenant..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-9"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {searchQuery ? 'No tenants match your search' : 'No tenant data available'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Tenant</th>
                <th className="text-left p-3 font-medium">Property</th>
                <th className="text-right p-3 font-medium">Total Paid</th>
                <th className="text-left p-3 font-medium">Expiry</th>
                <th className="text-left p-3 font-medium">Punctuality</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((tenant) => {
                const expiryInfo = getExpiryLabel(tenant.daysUntilExpiry);
                return (
                  <tr key={tenant.tenantId} className="border-t">
                    <td className="p-3">
                      <div className="font-medium">{tenant.tenantName}</div>
                      <div className="text-xs text-muted-foreground">{tenant.tenantEmail}</div>
                    </td>
                    <td className="p-3">
                      {tenant.propertyName || <span className="text-muted-foreground">No property</span>}
                    </td>
                    <td className="p-3 text-right font-medium">{formatCurrency(tenant.totalPaid)}</td>
                    <td className={`p-3 text-sm ${expiryInfo.className}`}>
                      {expiryInfo.text}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getPunctualityColor(tenant.punctualityScore)}`}
                            style={{ width: `${tenant.punctualityScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium w-16">
                          {tenant.punctualityScore}%
                        </span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          {getPunctualityLabel(tenant.punctualityScore)}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
