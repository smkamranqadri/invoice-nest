# Database Schema

## Overview

This document describes the database schema for InvoiceNest. The schema supports invoicing and financial management with Better Auth authentication.

## Database Technology

- **Development**: SQLite
- **Production**: PostgreSQL
- **ORM**: Prisma

## Tables

### User

Stores user account information.

**Key Fields**:

- `id`: Unique identifier (CUID)
- `email`: User's email address (unique)
- `name`: Full name
- `role`: User role (ADMIN, USER)
- `isActive`: Account status
- `createdAt`, `updatedAt`: Timestamps

### Session

Stores user session information for Better Auth.

**Key Fields**:

- `id`: Unique identifier
- `token`: Session token (unique)
- `expiresAt`: Session expiration
- `userId`: Reference to User

### Account

Stores OAuth account information for Better Auth.

**Key Fields**:

- `id`: Unique identifier
- `accountId`: Provider account ID
- `providerId`: Authentication provider
- `userId`: Reference to User
- `password`: Hashed password

### Verification

Stores email verification tokens.

**Key Fields**:

- `id`: Unique identifier
- `identifier`: Email or phone
- `value`: Verification token
- `expiresAt`: Token expiration

### Company

Stores company information.

**Key Fields**:

- `id`: Unique identifier
- `name`: Company name
- `address`, `city`, `state`, `country`: Location
- `phone`, `email`, `website`: Contact info
- `createdBy`: Reference to User

### Customer

Stores customer information.

**Key Fields**:

- `id`: Unique identifier
- `displayName`: Customer name
- `contactName`: Primary contact
- `email`, `phone`: Contact info
- `address`, `city`, `state`, `country`: Location
- `status`: Customer status (ACTIVE, INACTIVE, ARCHIVED)
- `createdBy`: Reference to User

### Invoice

Stores invoice information.

**Key Fields**:

- `id`: Unique identifier
- `number`: Invoice number (unique)
- `customerId`: Reference to Customer
- `status`: Invoice status (DRAFT, SENT, PAID, OVERDUE, CANCELLED)
- `issueDate`, `dueDate`: Dates
- `subtotal`, `taxAmount`, `discountAmount`, `total`: Amounts
- `createdBy`: Reference to User

### InvoiceItem

Stores invoice line items.

**Key Fields**:

- `id`: Unique identifier
- `invoiceId`: Reference to Invoice
- `description`: Item description
- `quantity`, `price`: Item details
- `taxRate`, `discount`: Calculations
- `total`: Item total
- `sortOrder`: Display order

### Payment

Stores payment information.

**Key Fields**:

- `id`: Unique identifier
- `number`: Payment number (unique)
- `customerId`: Reference to Customer
- `invoiceId`: Reference to Invoice (optional)
- `amount`: Payment amount
- `method`: Payment method
- `date`: Payment date
- `status`: Payment status (PENDING, COMPLETED, FAILED, CANCELLED)
- `createdBy`: Reference to User

### TaxType

Stores tax definitions.

**Key Fields**:

- `id`: Unique identifier
- `name`: Tax name
- `rate`: Tax rate percentage
- `isCompound`: Compound tax flag
- `createdBy`: Reference to User

### Setting

Stores system settings.

**Key Fields**:

- `id`: Unique identifier
- `key`: Setting key (unique)
- `value`: Setting value
- `type`: Value type
- `createdBy`: Reference to User

## Relationships

### User Relationships

- User → Session (one-to-many)
- User → Account (one-to-many)
- User → Company (one-to-many)
- User → Customer (one-to-many)
- User → Invoice (one-to-many)
- User → Payment (one-to-many)
- User → TaxType (one-to-many)
- User → Setting (one-to-many)

### Business Relationships

- Customer → Invoice (one-to-many)
- Customer → Payment (one-to-many)
- Invoice → InvoiceItem (one-to-many)
- Invoice → Payment (one-to-many)

## Constraints

### Foreign Keys

All tables with `createdBy` reference `users.id` with CASCADE DELETE.

- `invoices.customerId` → `customers.id` (CASCADE)
- `invoice_items.invoiceId` → `invoices.id` (CASCADE)
- `payments.customerId` → `customers.id` (CASCADE)
- `payments.invoiceId` → `invoices.id` (SET NULL)

### Unique Constraints

- `users.email`
- `session.token`
- `invoices.number`
- `payments.number`
- `settings.key`

### Enums

- `Role`: ADMIN, USER
- `CustomerStatus`: ACTIVE, INACTIVE, ARCHIVED
- `InvoiceStatus`: DRAFT, SENT, PAID, OVERDUE, CANCELLED
- `PaymentStatus`: PENDING, COMPLETED, FAILED, CANCELLED

## Data Types

- **IDs**: CUID (string)
- **Money**: Float (SQLite) / Decimal (PostgreSQL)
- **Dates**: DateTime
- **Booleans**: Boolean
- **JSON**: Json (for preferences and settings)

## Indexes

### Performance Indexes

- User: email, role, isActive
- Session: token, expiresAt
- Customer: displayName, email, status
- Invoice: number, status, dueDate
- Payment: number, date, status

---

_Last updated: August 2025_
