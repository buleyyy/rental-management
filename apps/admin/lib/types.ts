// API Base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Type definitions based on backend API
export interface Property {
  id: number;
  code: string;
  name: string;
  address: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'UNDER_MAINTENANCE';
  createdAt: string;
  updatedAt: string;
  contracts?: Contract[];
}

export interface Tenant {
  id: number;
  fullName: string;
  phone: string;
  email?: string;
  identityNumber?: string;
  createdAt: string;
  updatedAt: string;
  contracts?: Contract[];
}

export interface Contract {
  id: number;
  propertyId: number;
  tenantId: number;
  startDate: string;
  endDate: string;
  rentAmount: string | number;
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'RENEWED';
  createdAt: string;
  updatedAt: string;
  previousContractId?: number;
  property?: Property;
  tenant?: Tenant;
  payments?: Payment[];
}

export interface Payment {
  id: number;
  contractId: number;
  amount: string | number;
  paymentDate: string;
  method?: string;
  status: 'PAID' | 'PARTIAL' | 'LATE';
  createdAt: string;
  updatedAt: string;
  contract?: Contract;
}

export interface MonthlyReport {
  period: {
    year: number;
    month: number;
    monthName: string;
  };
  summary: {
    totalIncome: number;
    paidPaymentsCount: number;
    totalPayments: number;
    unpaidContractsCount: number;
    activeContractsCount: number;
  };
  payments: Array<{
    id: number;
    amount: string;
    paymentDate: string;
    status: string;
    method?: string;
    contract: {
      id: number;
      property: {
        code: string;
        name: string;
      };
      tenant: {
        fullName: string;
      };
    };
  }>;
  unpaidContracts: Array<{
    contractId: number;
    property: {
      id: number;
      code: string;
      name: string;
    };
    tenant: {
      id: number;
      fullName: string;
      phone: string;
    };
    rentAmount: string;
    startDate: string;
    endDate: string;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  status: number;
}
