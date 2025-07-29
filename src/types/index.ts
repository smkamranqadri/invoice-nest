// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  preferences?: Record<string, unknown>;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Company types
export interface Company {
  id: string;
  name: string;
  logo?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  registrationNumber?: string;
  settings?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Customer types
export interface Customer {
  id: string;
  displayName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  zipCode?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Invoice types
export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  issueDate: Date;
  dueDate: Date;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  customer?: Customer;
  items?: InvoiceItem[];
}

// Invoice Item types
export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  price: number;
  taxRate: number;
  discount?: number;
  total: number;
  sortOrder: number;
}

// Payment types
export interface Payment {
  id: string;
  number: string;
  customerId: string;
  invoiceId?: string;
  amount: number;
  method: string;
  date: Date;
  notes?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  customer?: Customer;
  invoice?: Invoice;
}

// Tax Type types
export interface TaxType {
  id: string;
  name: string;
  rate: number;
  isCompound: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Setting types
export interface Setting {
  id: string;
  key: string;
  value: string;
  type: string;
  description?: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} 