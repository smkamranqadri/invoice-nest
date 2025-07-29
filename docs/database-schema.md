# Database Schema Documentation

## Overview

This document describes the complete database schema for InvoiceNest, including all tables, relationships, constraints, and indexes. The schema is designed to support a comprehensive invoicing and financial management system.

## Database Technology

- **Development**: SQLite (for easy setup and development)
- **Production**: PostgreSQL (for scalability and advanced features)
- **ORM**: Prisma (type-safe database access)

## Schema Design Principles

1. **Normalization**: Proper normalization to avoid data redundancy
2. **Referential Integrity**: Foreign key constraints to maintain data consistency
3. **Audit Trail**: Timestamps and soft deletes for data tracking
4. **Scalability**: Efficient indexing for performance
5. **Flexibility**: Extensible design for future features

---

## Core Tables

### 1. User

Stores user account information and authentication details.

```sql
CREATE TABLE User (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'USER',
  preferences JSON,
  isActive BOOLEAN DEFAULT true,
  emailVerified BOOLEAN DEFAULT false,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Fields**:
- `id`: Unique identifier (UUID)
- `email`: User's email address (unique)
- `name`: Full name of the user
- `password`: Hashed password
- `role`: User role (ADMIN, USER)
- `preferences`: JSON object for user preferences
- `isActive`: Whether the user account is active
- `emailVerified`: Whether email has been verified
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

**Indexes**:
- `idx_user_email` on `email`
- `idx_user_role` on `role`
- `idx_user_active` on `isActive`

### 2. Company

Stores company information and settings.

```sql
CREATE TABLE Company (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'US',
  zipCode TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  taxId TEXT,
  registrationNumber TEXT,
  settings JSON,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Fields**:
- `id`: Unique identifier (UUID)
- `name`: Company name
- `logo`: URL to company logo
- `address`: Company address
- `city`: City
- `state`: State/Province
- `country`: Country (default: US)
- `zipCode`: Postal/ZIP code
- `phone`: Phone number
- `email`: Company email
- `website`: Company website
- `taxId`: Tax identification number
- `registrationNumber`: Business registration number
- `settings`: JSON object for company settings
- `createdAt`: Record creation timestamp
- `updatedAt`: Last update timestamp

**Indexes**:
- `idx_company_name` on `name`
- `idx_company_country` on `country`

### 3. Customer

Stores customer information and contact details.

```sql
CREATE TABLE Customer (
  id TEXT PRIMARY KEY,
  displayName TEXT NOT NULL,
  contactName TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'US',
  zipCode TEXT,

  status TEXT DEFAULT 'ACTIVE',
  isActive BOOLEAN DEFAULT true,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Fields**:
- `id`: Unique identifier (UUID)
- `displayName`: Customer display name
- `contactName`: Primary contact person
- `email`: Customer email
- `phone`: Phone number
- `website`: Customer website
- `address`: Customer address
- `city`: City
- `state`: State/Province
- `country`: Country (default: US)
- `zipCode`: Postal/ZIP code

- `status`: Customer status (ACTIVE, INACTIVE, ARCHIVED)
- `isActive`: Whether the customer is active
- `createdAt`: Record creation timestamp
- `updatedAt`: Last update timestamp

**Indexes**:
- `idx_customer_display_name` on `displayName`
- `idx_customer_email` on `email`
- `idx_customer_status` on `status`
- `idx_customer_active` on `isActive`
- `idx_customer_country` on `country`





### 4. Invoice

Stores invoice header information.

```sql
CREATE TABLE Invoice (
  id TEXT PRIMARY KEY,
  number TEXT UNIQUE NOT NULL,
  customerId TEXT NOT NULL,
  status TEXT DEFAULT 'DRAFT',
  issueDate DATE NOT NULL,
  dueDate DATE NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  taxAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discountAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  isActive BOOLEAN DEFAULT true,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customerId) REFERENCES Customer(id) ON DELETE RESTRICT
);
```

**Fields**:
- `id`: Unique identifier (UUID)
- `number`: Invoice number (unique)
- `customerId`: Reference to Customer table
- `status`: Invoice status (DRAFT, SENT, PAID, OVERDUE, CANCELLED)
- `issueDate`: Date when invoice was issued
- `dueDate`: Date when payment is due
- `subtotal`: Subtotal before taxes and discounts
- `taxAmount`: Total tax amount
- `discountAmount`: Total discount amount
- `total`: Final total amount
- `notes`: Additional notes
- `isActive`: Whether the invoice is active
- `createdAt`: Record creation timestamp
- `updatedAt`: Last update timestamp

**Indexes**:
- `idx_invoice_number` on `number`
- `idx_invoice_customer_id` on `customerId`
- `idx_invoice_status` on `status`
- `idx_invoice_issue_date` on `issueDate`
- `idx_invoice_due_date` on `dueDate`
- `idx_invoice_active` on `isActive`

### 5. InvoiceItem

Stores individual line items within invoices.

```sql
CREATE TABLE InvoiceItem (
  id TEXT PRIMARY KEY,
  invoiceId TEXT NOT NULL,

  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  taxRate DECIMAL(5,2) DEFAULT 0,
  taxAmount DECIMAL(10,2) DEFAULT 0,
  discountRate DECIMAL(5,2) DEFAULT 0,
  discountAmount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  sortOrder INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoiceId) REFERENCES Invoice(id) ON DELETE CASCADE,

);
```

**Fields**:
- `id`: Unique identifier (UUID)
- `invoiceId`: Reference to Invoice table

- `description`: Item description
- `quantity`: Quantity ordered
- `price`: Unit price
- `taxRate`: Tax rate percentage
- `taxAmount`: Tax amount for this item
- `discountRate`: Discount rate percentage
- `discountAmount`: Discount amount for this item
- `total`: Total amount for this item
- `sortOrder`: Display order within invoice
- `createdAt`: Record creation timestamp
- `updatedAt`: Last update timestamp

**Indexes**:
- `idx_invoice_item_invoice_id` on `invoiceId`

- `idx_invoice_item_sort_order` on `sortOrder`

### 6. Payment

Stores payment information.

```sql
CREATE TABLE Payment (
  id TEXT PRIMARY KEY,
  number TEXT UNIQUE NOT NULL,
  customerId TEXT NOT NULL,
  invoiceId TEXT,
  amount DECIMAL(10,2) NOT NULL,
  method TEXT NOT NULL,
  date DATE NOT NULL,
  reference TEXT,
  notes TEXT,
  status TEXT DEFAULT 'PENDING',
  isActive BOOLEAN DEFAULT true,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customerId) REFERENCES Customer(id) ON DELETE RESTRICT,
  FOREIGN KEY (invoiceId) REFERENCES Invoice(id) ON DELETE SET NULL
);
```

**Fields**:
- `id`: Unique identifier (UUID)
- `number`: Payment number (unique)
- `customerId`: Reference to Customer table
- `invoiceId`: Reference to Invoice table (optional)
- `amount`: Payment amount
- `method`: Payment method (CASH, CHECK, BANK_TRANSFER, CREDIT_CARD, etc.)
- `date`: Payment date
- `reference`: External reference number
- `notes`: Additional notes
- `status`: Payment status (PENDING, COMPLETED, FAILED, CANCELLED)
- `isActive`: Whether the payment is active
- `createdAt`: Record creation timestamp
- `updatedAt`: Last update timestamp

**Indexes**:
- `idx_payment_number` on `number`
- `idx_payment_customer_id` on `customerId`
- `idx_payment_invoice_id` on `invoiceId`
- `idx_payment_date` on `date`
- `idx_payment_status` on `status`
- `idx_payment_active` on `isActive`

### 7. TaxType

Stores tax type definitions.

```sql
CREATE TABLE TaxType (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rate DECIMAL(5,2) NOT NULL,
  isCompound BOOLEAN DEFAULT false,
  isActive BOOLEAN DEFAULT true,
  description TEXT,
  country TEXT,
  state TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Fields**:
- `id`: Unique identifier (UUID)
- `name`: Tax name (e.g., GST, PST, VAT)
- `rate`: Tax rate percentage
- `isCompound`: Whether this is a compound tax
- `isActive`: Whether the tax type is active
- `description`: Tax description
- `country`: Country where this tax applies
- `state`: State where this tax applies
- `createdAt`: Record creation timestamp
- `updatedAt`: Last update timestamp

**Indexes**:
- `idx_tax_type_name` on `name`
- `idx_tax_type_active` on `isActive`
- `idx_tax_type_country` on `country`

### 8. Setting

Stores system configuration settings.

```sql
CREATE TABLE Setting (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  type TEXT DEFAULT 'string',
  description TEXT,
  isPublic BOOLEAN DEFAULT false,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Fields**:
- `id`: Unique identifier (UUID)
- `key`: Setting key (unique)
- `value`: Setting value
- `type`: Value type (string, number, boolean, json)
- `description`: Setting description
- `isPublic`: Whether this setting is publicly accessible
- `createdAt`: Record creation timestamp
- `updatedAt`: Last update timestamp

**Indexes**:
- `idx_setting_key` on `key`
- `idx_setting_public` on `isPublic`

---

## Audit Tables

### 9. AuditLog

Stores audit trail for important actions.

```sql
CREATE TABLE AuditLog (
  id TEXT PRIMARY KEY,
  userId TEXT,
  action TEXT NOT NULL,
  entityType TEXT NOT NULL,
  entityId TEXT,
  oldValues JSON,
  newValues JSON,
  ipAddress TEXT,
  userAgent TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE SET NULL
);
```

**Fields**:
- `id`: Unique identifier (UUID)
- `userId`: Reference to User table
- `action`: Action performed (CREATE, UPDATE, DELETE, LOGIN, etc.)
- `entityType`: Type of entity affected
- `entityId`: ID of entity affected
- `oldValues`: Previous values (JSON)
- `newValues`: New values (JSON)
- `ipAddress`: IP address of the user
- `userAgent`: User agent string
- `createdAt`: Record creation timestamp

**Indexes**:
- `idx_audit_log_user_id` on `userId`
- `idx_audit_log_action` on `action`
- `idx_audit_log_entity` on `entityType`, `entityId`
- `idx_audit_log_created_at` on `createdAt`

---

## Relationships

### One-to-Many Relationships

1. **User → AuditLog**: One user can have many audit log entries
2. **Customer → Invoice**: One customer can have multiple invoices
3. **Customer → Payment**: One customer can have multiple payments
4. **Invoice → InvoiceItem**: One invoice can have multiple line items


### Many-to-One Relationships

1. **Invoice → Customer**: Multiple invoices belong to one customer
2. **Payment → Customer**: Multiple payments belong to one customer
3. **InvoiceItem → Invoice**: Multiple line items belong to one invoice

5. **Payment → Invoice**: Multiple payments can be linked to one invoice

---

## Constraints

### Foreign Key Constraints

- `Invoice.customerId` → `Customer.id` (RESTRICT DELETE)
- `Payment.customerId` → `Customer.id` (RESTRICT DELETE)
- `Payment.invoiceId` → `Invoice.id` (SET NULL DELETE)
- `InvoiceItem.invoiceId` → `Invoice.id` (CASCADE DELETE)

- `AuditLog.userId` → `User.id` (SET NULL DELETE)

### Unique Constraints

- `User.email` (unique)
- `Invoice.number` (unique)
- `Payment.number` (unique)
- `Setting.key` (unique)

### Check Constraints

- `User.role` IN ('ADMIN', 'USER')
- `Customer.status` IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')

- `Invoice.status` IN ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED')
- `Payment.status` IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')
- `Payment.method` IN ('CASH', 'CHECK', 'BANK_TRANSFER', 'CREDIT_CARD', 'PAYPAL', 'STRIPE')

---

## Indexes

### Performance Indexes

1. **Customer Search**: `idx_customer_display_name`, `idx_customer_email`
2. **Invoice Filtering**: `idx_invoice_status`, `idx_invoice_due_date`
3. **Payment Tracking**: `idx_payment_date`, `idx_payment_status`
4. **Audit Trail**: `idx_audit_log_created_at`, `idx_audit_log_entity`

### Composite Indexes

1. **Invoice by Customer and Date**: `idx_invoice_customer_date` on `customerId`, `issueDate`
2. **Payment by Customer and Date**: `idx_payment_customer_date` on `customerId`, `date`
3. **Invoice Items by Invoice**: `idx_invoice_item_invoice_sort` on `invoiceId`, `sortOrder`

---

## Data Types

### Decimal Precision

- **Money Fields**: `DECIMAL(10,2)` for currency amounts
- **Percentages**: `DECIMAL(5,2)` for tax rates and discounts
- **Quantities**: `DECIMAL(10,2)` for item quantities

### Text Fields

- **Short Text**: `TEXT` for names, codes, etc.
- **Long Text**: `TEXT` for descriptions, notes, etc.
- **JSON**: `JSON` for complex data structures

### Date/Time Fields

- **Dates**: `DATE` for dates only
- **Timestamps**: `DATETIME` for date and time
- **Default**: `CURRENT_TIMESTAMP` for creation and update times

---

## Migration Strategy

### Version Control

- Each schema change is versioned
- Migrations are applied sequentially
- Rollback scripts are provided for each migration

### Data Migration

- Existing data is preserved during schema changes
- Default values are provided for new required fields
- Data validation is performed after migration

### Testing

- Migrations are tested in development environment
- Sample data is used to verify relationships
- Performance impact is measured

---

## Backup Strategy

### Automated Backups

- Daily full backups
- Hourly incremental backups
- Point-in-time recovery capability

### Backup Storage

- Local backups for quick recovery
- Remote backups for disaster recovery
- Encrypted backup storage

### Recovery Testing

- Monthly recovery drills
- Backup integrity verification
- Recovery time objectives (RTO) measurement

---

This schema provides a solid foundation for the InvoiceNest application, supporting all core features while maintaining data integrity and performance. 