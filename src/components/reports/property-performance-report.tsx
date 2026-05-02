'use client';

import { useState, useEffect, useMemo } from 'react';
import { Download, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import type { PropertyBreakdown, PropertyTypeBreakdown } from '@/services/business-summary-service';

type SortField = 'name' | 'type' | 'status' | 'income' | 'expenses' | 'profit' | 'occupancy';
type SortOrder = 'asc' | 'desc';
type Period = 'this-year' | 'last-year';

interface PropertyPerformanceReportProps {
  userId?: string;
}

export function PropertyPerformanceReport({ userId = undefined }: PropertyPerformanceReportProps) {
  const [period, setPeriod] = useState<Period>('this-year');
  const [groupByType, setGroupByType] = useState(false);
  const [data, setData] = useState<PropertyBreakdown[] | PropertyTypeBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('income');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const year = period === 'this-year' ? new Date().getFullYear() : new Date().getFullYear() - 1;
        const params = new URLSearchParams({
          groupByType: groupByType.toString(),
          year: year.toString(),
        });
        const res = await fetch(`/api/v1/reports/property-breakdown?${params}`);
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch property breakdown:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [period, groupByType]);

  const sortedData = useMemo(() => {
    if (!data.length) return [];
    const sorted = [...data];
    sorted.sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (sortField) {
        case 'name':
          aVal = 'propertyName' in a ? a.propertyName : a.propertyType;
          bVal = 'propertyName' in b ? b.propertyName : b.propertyType;
          break;
        case 'type':
          aVal = a.propertyType;
          bVal = b.propertyType;
          break;
        case 'status':
          aVal = 'activeLease' in a ? (a.activeLease ? 1 : 0) : 0;
          bVal = 'activeLease' in b ? (b.activeLease ? 1 : 0) : 0;
          break;
        case 'income':
          aVal = a.totalIncome;
          bVal = b.totalIncome;
          break;
        case 'expenses':
          aVal = a.totalExpenses;
          bVal = b.totalExpenses;
          break;
        case 'profit':
          aVal = a.netProfit;
          bVal = b.netProfit;
          break;
        case 'occupancy':
          aVal = 'occupancyRate' in a ? a.occupancyRate : 0;
          bVal = 'occupancyRate' in b ? b.occupancyRate : 0;
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return sorted;
  }, [data, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const year = period === 'this-year' ? new Date().getFullYear() : new Date().getFullYear() - 1;
      const params = new URLSearchParams({ format: 'property-breakdown', year: year.toString() });
      const res = await fetch(`/api/v1/export?${params}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `property-performance-${year}.xlsx`;
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

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const isGrouped = groupByType && sortedData.length > 0 && 'propertyCount' in sortedData[0];

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Property Performance</h3>
          <p className="text-sm opacity-90">Income, expenses, and occupancy by property</p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExport} disabled={isExporting}>
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          <span className="ml-2">Export</span>
        </Button>
      </div>

      <div className="p-4 border-b flex gap-4 items-center flex-wrap">
        <div className="flex gap-2">
          <Button
            variant={period === 'this-year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('this-year')}
          >
            This Year
          </Button>
          <Button
            variant={period === 'last-year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('last-year')}
          >
            Last Year
          </Button>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={groupByType}
            onChange={(e) => setGroupByType(e.target.checked)}
            className="rounded"
          />
          Group by type
        </label>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : sortedData.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No property data available
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium cursor-pointer" onClick={() => handleSort('name')}>
                  <span className="flex items-center gap-1">
                    {isGrouped ? 'Type' : 'Property Name'} <SortIcon field="name" />
                  </span>
                </th>
                {isGrouped && (
                  <th className="text-right p-3 font-medium">Properties</th>
                )}
                {!isGrouped && (
                  <th className="text-left p-3 font-medium cursor-pointer" onClick={() => handleSort('type')}>
                    <span className="flex items-center gap-1">Type <SortIcon field="type" /></span>
                  </th>
                )}
                {!isGrouped && (
                  <th className="text-left p-3 font-medium cursor-pointer" onClick={() => handleSort('status')}>
                    <span className="flex items-center gap-1">Status <SortIcon field="status" /></span>
                  </th>
                )}
                <th className="text-right p-3 font-medium cursor-pointer" onClick={() => handleSort('income')}>
                  <span className="flex items-center justify-end gap-1">Income <SortIcon field="income" /></span>
                </th>
                <th className="text-right p-3 font-medium cursor-pointer" onClick={() => handleSort('expenses')}>
                  <span className="flex items-center justify-end gap-1">Expenses <SortIcon field="expenses" /></span>
                </th>
                <th className="text-right p-3 font-medium cursor-pointer" onClick={() => handleSort('profit')}>
                  <span className="flex items-center justify-end gap-1">Net Profit <SortIcon field="profit" /></span>
                </th>
                <th className="text-right p-3 font-medium cursor-pointer" onClick={() => handleSort('occupancy')}>
                  <span className="flex items-center justify-end gap-1">Occupancy <SortIcon field="occupancy" /></span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item) => (
                <tr key={'propertyId' in item ? item.propertyId : item.propertyType} className="border-t">
                  <td className="p-3 font-medium">
                    {'propertyName' in item ? item.propertyName : item.propertyType}
                  </td>
                  {'propertyCount' in item && (
                    <td className="p-3 text-right">{(item as PropertyTypeBreakdown).propertyCount}</td>
                  )}
                  {!isGrouped && <td className="p-3">{item.propertyType}</td>}
                  {!isGrouped && (
                    <td className="p-3">
                      {'activeLease' in item && (
                        <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                          item.activeLease ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.activeLease ? 'Occupied' : 'Vacant'}
                        </span>
                      )}
                    </td>
                  )}
                  <td className="p-3 text-right font-medium">{formatCurrency(item.totalIncome)}</td>
                  <td className="p-3 text-right">{formatCurrency(item.totalExpenses)}</td>
                  <td className={`p-3 text-right font-medium ${item.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(item.netProfit)}
                  </td>
                  <td className="p-3 text-right">
                    {'occupancyRate' in item ? (
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                        item.occupancyRate >= 80 ? 'bg-green-100 text-green-800' :
                        item.occupancyRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.occupancyRate}%
                      </span>
                    ) : (
                      `${item.averageOccupancyRate.toFixed(0)}%`
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
