// Common types for the application

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  rentAmountSen: number;
  status: 'vacant' | 'occupied' | 'maintenance';
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tenant {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  icNumber: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lease {
  id: string;
  startDate: Date;
  endDate: Date;
  monthlyRentSen: number;
  depositSen: number;
  status: 'active' | 'expired' | 'terminated';
  propertyId: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  type: 'income' | 'expense';
  amountSen: number;
  description: string | null;
  referenceNumber: string | null;
  paidAt: Date | null;
  dueDate: Date | null;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  leaseId: string | null;
  tenantId: string | null;
  category: string | null;
  incomeSource?: string | null;
  tenant?: { name: string; email?: string | null; phone?: string | null } | null;
  lease?: {
    room?: {
      floor?: { property?: { name?: string } | null } | null;
    } | null;
    tenant?: { name: string } | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Malaysian Tax & Zakat Types
// ============================================

/** Zakat calculation result */
export interface ZakatCalculationResult {
  netProfitSen: number;
  isLiable: boolean;
  calculation: string;
  amount: number; // in sen
}

/** Tax bracket definition */
export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
  baseTax: number;
}

/** Tax calculation result */
export interface TaxCalculationResult {
  taxableIncomeSen: number;
  taxBrackets: Array<{
    bracket: TaxBracket;
    taxableAmount: number;
    taxAtBracket: number;
  }>;
  totalTax: number; // in sen
  effectiveRate: number; // percentage
}

// ============================================
// Offer & Viewing Types
// ============================================

export interface Viewing {
  id: string;
  roomId: string;
  prospectId: string;
  scheduledAt: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
  result?: 'interested' | 'not_interested';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Offer {
  id: string;
  roomId: string;
  prospectId: string;
  amountSen: number;
  moveInDate: Date;
  status: 'pending' | 'accepted' | 'rejected';
  evaluatedBy?: 'rules_engine' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}
