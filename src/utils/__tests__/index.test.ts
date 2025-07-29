import {
  formatDate,
  formatDateTime,
  formatCurrency,
  formatNumber,
  formatPercentage,
  generateId,
  generateInvoiceNumber,
  generatePaymentNumber,
  calculateInvoiceTotals,
  isValidEmail,
  isValidPhone,
} from '../index';

describe('utils', () => {
  test('formatDate returns correct format', () => {
    expect(formatDate('2024-01-01')).toBe('Jan 01, 2024');
  });

  test('formatDateTime returns correct format', () => {
    expect(formatDateTime('2024-01-01T12:34:00Z')).toContain('Jan 01, 2024');
  });

  test('formatCurrency returns USD by default', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  test('formatNumber returns correct decimals', () => {
    expect(formatNumber(1234.5678, 2)).toBe('1,234.57');
  });

  test('formatPercentage returns correct string', () => {
    expect(formatPercentage(12.3456)).toBe('12.35%');
  });

  test('generateId returns a string', () => {
    expect(typeof generateId()).toBe('string');
  });

  test('generateInvoiceNumber returns correct format', () => {
    expect(generateInvoiceNumber('INV', 42)).toBe('INV-000042');
  });

  test('generatePaymentNumber returns correct format', () => {
    expect(generatePaymentNumber('PAY', 7)).toBe('PAY-000007');
  });

  test('calculateInvoiceTotals returns correct totals', () => {
    const items = [
      { quantity: 2, price: 100, taxRate: 10, discount: 10 },
      { quantity: 1, price: 50, taxRate: 0 },
    ];
    const totals = calculateInvoiceTotals(items);
    expect(totals.subtotal).toBeCloseTo(240);
    expect(totals.taxAmount).toBeCloseTo(19);
    expect(totals.discountAmount).toBeCloseTo(10);
    expect(totals.total).toBeCloseTo(259);
  });

  test('isValidEmail validates emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
  });

  test('isValidPhone validates phone numbers', () => {
    expect(isValidPhone('+1234567890')).toBe(true);
    expect(isValidPhone('not-a-phone')).toBe(false);
  });
}); 