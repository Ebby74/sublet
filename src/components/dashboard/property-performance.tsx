'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Building2, Home, Building, Warehouse, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

type ViewMode = 'property' | 'type';

interface PropertyData {
  id: string;
  name: string;
  type: 'condo' | 'apartment' | 'house' | 'commercial' | 'townhouse';
  status: 'vacant' | 'occupied' | 'maintenance';
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
}

interface PropertyPerformanceProps {
  userId?: string;
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-4 w-16 bg-muted rounded" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="h-3 w-20 bg-muted rounded" />
        <div className="h-3 w-20 bg-muted rounded" />
        <div className="h-3 w-20 bg-muted rounded" />
      </div>
    </div>
  );
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'condo':
      return Building2;
    case 'apartment':
      return Building;
    case 'house':
      return Home;
    case 'commercial':
      return Warehouse;
    default:
      return Building2;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'occupied':
      return { bg: 'bg-green-100', text: 'text-green-800', label: 'Occupied' };
    case 'vacant':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Vacant' };
    case 'maintenance':
      return { bg: 'bg-red-100', text: 'text-red-800', label: 'Maintenance' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
  }
}

function PropertyCard({ property }: { property: PropertyData }) {
  const statusStyle = getStatusBadge(property.status);
  const TypeIcon = getTypeIcon(property.type);

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm hover:bg-muted/30 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TypeIcon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-foreground">{property.name}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
          {statusStyle.label}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">Income</span>
          <p className="font-medium text-green-600">{formatCurrency(property.totalIncome)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Expenses</span>
          <p className="font-medium text-red-600">{formatCurrency(property.totalExpenses)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Net</span>
          <p className={`font-medium ${property.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(property.netProfit)}
          </p>
        </div>
      </div>
    </div>
  );
}

function TypeSummaryCard({ 
  type, 
  totalIncome, 
  totalExpenses, 
  count 
}: { 
  type: string;
  totalIncome: number;
  totalExpenses: number;
  count: number;
}) {
  const netProfit = totalIncome - totalExpenses;
  const TypeIcon = getTypeIcon(type);

  return (
    <div className="rounded-lg border-2 border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TypeIcon className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold text-foreground capitalize">{type}</span>
        </div>
        <span className="text-sm text-muted-foreground">{count} properties</span>
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Total Income</span>
          <p className="font-medium text-green-600">{formatCurrency(totalIncome)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Total Expenses</span>
          <p className="font-medium text-red-600">{formatCurrency(totalExpenses)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Net Profit</span>
          <p className={`font-medium ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(netProfit)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function PropertyPerformance({ userId }: PropertyPerformanceProps) {
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('property');

  useEffect(() => {
    async function fetchPropertyData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/v1/reports/property-breakdown`);
        const data = await response.json();
        if (data.data) {
          setProperties(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch property breakdown:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPropertyData();
  }, [userId]);

  const groupedByType = properties.reduce((acc, prop) => {
    if (!acc[prop.type]) {
      acc[prop.type] = { totalIncome: 0, totalExpenses: 0, count: 0 };
    }
    acc[prop.type].totalIncome += prop.totalIncome;
    acc[prop.type].totalExpenses += prop.totalExpenses;
    acc[prop.type].count += 1;
    return acc;
  }, {} as Record<string, { totalIncome: number; totalExpenses: number; count: number }>);

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-40 bg-muted rounded" />
        </div>
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Property Performance</h3>
        </div>
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted" />
            <p>No properties yet</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-lg font-semibold text-foreground hover:text-primary transition-colors"
        >
          {expanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          Property Performance
        </button>
        
        {expanded && (
          <div className="flex gap-1 bg-muted rounded-md p-1">
            <button
              onClick={() => setViewMode('property')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                viewMode === 'property'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              By Property
            </button>
            <button
              onClick={() => setViewMode('type')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                viewMode === 'type'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              By Type
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="space-y-3">
          {viewMode === 'property' ? (
            properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))
          ) : (
            Object.entries(groupedByType).map(([type, data]) => (
              <TypeSummaryCard
                key={type}
                type={type}
                totalIncome={data.totalIncome}
                totalExpenses={data.totalExpenses}
                count={data.count}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}