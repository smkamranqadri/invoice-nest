import { format, parseISO } from 'date-fns';

// Date formatting utilities
export const formatDate = (date: Date | string, formatStr: string = 'MMM dd, yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

// Currency formatting
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Number formatting
export const formatNumber = (num: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

// Percentage formatting
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

// Generate unique IDs
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Generate invoice number
export const generateInvoiceNumber = (prefix: string = 'INV', sequence: number = 1): string => {
  const paddedSequence = sequence.toString().padStart(6, '0');
  return `${prefix}-${paddedSequence}`;
};

// Generate payment number
export const generatePaymentNumber = (prefix: string = 'PAY', sequence: number = 1): string => {
  const paddedSequence = sequence.toString().padStart(6, '0');
  return `${prefix}-${paddedSequence}`;
};

// Calculate invoice totals
export const calculateInvoiceTotals = (items: Array<{
  quantity: number;
  price: number;
  taxRate: number;
  discount?: number;
}>): {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
} => {
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.price;
    const discount = item.discount || 0;
    return sum + (itemTotal - discount);
  }, 0);

  const taxAmount = items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.price;
    const discount = item.discount || 0;
    const taxableAmount = itemTotal - discount;
    return sum + (taxableAmount * (item.taxRate / 100));
  }, 0);

  const discountAmount = items.reduce((sum, item) => {
    return sum + (item.discount || 0);
  }, 0);

  const total = subtotal + taxAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Debounce utility
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Local storage utilities
export const getFromStorage = (key: string): unknown => {
  if (typeof window === 'undefined') return null;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

export const setToStorage = (key: string, value: unknown): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

export const removeFromStorage = (key: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}; 