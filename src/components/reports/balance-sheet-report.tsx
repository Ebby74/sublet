'use client';

import { useState, useEffect } from 'react';
import { Loader2, Wallet, CreditCard, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

interface BalanceSheetData {
  assets: {
    cash: number;
    receivables: number;
  };
  liabilities: {
    payables: number;
  };
  equity: {
    opening: number;
    netProfit: number;
    drawings: number;
  };
}

interface DateRange {
  startDate: string;
  endDate: string;
}

interface BalanceSheetReportProps {
  userId?: string;
}

const DATE_PRESETS = [
  { label: 'This Month', getRange: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
  }},
  { label: 'Last Month', getRange: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
  }},
  { label: 'This Quarter', getRange: () => {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3);
    const start = new Date(now.getFullYear(), quarter * 3, 1);
    const end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
    return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
  }},
  { label: 'Last Quarter', getRange: () => {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3) - 1;
    const start = new Date(now.getFullYear(), quarter * 3, 1);
    const end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
    return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
  }},
  { label: 'This Year', getRange: () => {
    const now = new Date();
    return { startDate: `${now.getFullYear()}-01-01`, endDate: `${now.getFullYear()}-12-31` };
  }},
  { label: 'Last Year', getRange: () => {
    const now = new Date();
    return { startDate: `${now.getFullYear() - 1}-01-01`, endDate: `${now.getFullYear() - 1}-12-31` };
  }},
];

export function BalanceSheetReport({ userId = undefined }: BalanceSheetReportProps) {
  const [data, setData] = useState<BalanceSheetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: '', endDate: '' });

  useEffect(() => {
    fetchData();
  }, [userId, dateRange]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (userId) params.set("userId", userId);
      if (dateRange.startDate && dateRange.endDate) {
        params.set('startDate', dateRange.startDate);
        params.set('endDate', dateRange.endDate);
      }
      const res = await fetch(`/api/v1/reports/balance-sheet?${params}`);
      const json = await res.json();
      setData(json.data);
    } catch (error) {
      console.error('Failed to fetch balance sheet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetChange = (presetLabel: string) => {
    const preset = DATE_PRESETS.find(p => p.label === presetLabel);
    if (preset) {
      setDateRange(preset.getRange());
    }
  };

  // Calculate totals
  const totalAssets = data ? data.assets.cash + data.assets.receivables : 0;
  const totalLiabilities = data ? data.liabilities.payables : 0;
  const totalEquity = data ? data.equity.opening + data.equity.netProfit - data.equity.drawings : 0;
  const isBalanced = data ? totalAssets === totalLiabilities + totalEquity : true;

  if (isLoading) {
    return (
      <div className="border rounded-lg p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Empty state
  if (!data || (totalAssets === 0 && totalLiabilities === 0 && totalEquity === 0)) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-medium">No transactions yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Add income and expenses to see your balance sheet.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Balance Check Warning */}
      {!isBalanced && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <span className="text-sm text-amber-800">
            Balance sheet does not balance: Assets ≠ Liabilities + Equity
          </span>
        </div>
      )}

      {/* Date Filter */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Period:</label>
          <select
            className="px-3 py-2 rounded-md border bg-background text-sm"
            onChange={(e) => {
              if (e.target.value === 'custom') return;
              handlePresetChange(e.target.value);
            }}
            defaultValue=""
          >
            <option value="" disabled>Select period...</option>
            {DATE_PRESETS.map(preset => (
              <option key={preset.label} value={preset.label}>{preset.label}</option>
            ))}
            <option value="custom">Custom Range</option>
          </select>
        </div>
        
        {dateRange.startDate && dateRange.endDate && (
          <div className="flex items-center gap-2 text-sm">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-2 py-1 rounded-md border bg-background text-sm"
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-2 py-1 rounded-md border bg-background text-sm"
            />
            {(dateRange.startDate || dateRange.endDate) && (
              <button
                onClick={() => setDateRange({ startDate: '', endDate: '' })}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Assets & Liabilities Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Assets Section */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-blue-600" />
            Assets
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Bank/Cash
              </span>
              <span className="font-medium">{formatCurrency(data.assets.cash)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Accounts Receivable
              </span>
              <span className="font-medium">{formatCurrency(data.assets.receivables)}</span>
            </div>
            <div className="pt-3 border-t flex justify-between items-center font-bold">
              <span>Total Assets</span>
              <span className="text-blue-600">{formatCurrency(totalAssets)}</span>
            </div>
          </div>
        </div>

        {/* Liabilities Section */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-red-600" />
            Liabilities
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Accounts Payable
              </span>
              <span className="font-medium">{formatCurrency(data.liabilities.payables)}</span>
            </div>
            <div className="pt-3 border-t flex justify-between items-center font-bold">
              <span>Total Liabilities</span>
              <span className="text-red-600">{formatCurrency(totalLiabilities)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Equity Section */}
      <div className="border rounded-lg p-4 mb-6">
        <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Equity
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Opening Balance</span>
            <span className="font-medium">{formatCurrency(data.equity.opening)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Net Profit</span>
            <span className="font-medium">{formatCurrency(data.equity.netProfit)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Drawings</span>
            <span className="font-medium">({formatCurrency(data.equity.drawings)})</span>
          </div>
          <div className="pt-3 border-t flex justify-between items-center font-bold">
            <span>Total Equity</span>
            <span className="text-green-600">{formatCurrency(totalEquity)}</span>
          </div>
        </div>
      </div>

      {/* Totals Row */}
      <div className="border rounded-lg p-4 bg-muted/30">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Assets</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(totalAssets)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">=</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Liabilities + Equity</p>
            <p className="text-xl font-bold">
              {formatCurrency(totalLiabilities + totalEquity)}
            </p>
          </div>
        </div>
        <div className={`mt-3 pt-3 border-t text-center ${isBalanced ? 'text-green-600' : 'text-amber-600'}`}>
          {isBalanced ? '✓ Balance sheet balances' : '⚠ Balance sheet does not balance'}
        </div>
      </div>
    </div>
  );
}