# API Documentation

## Overview

This document provides API documentation for the InvoiceNest application. The API follows RESTful principles and uses JSON for data exchange.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

InvoiceNest uses Better Auth for authentication. All API endpoints (except authentication endpoints) require a valid session. Authentication is handled through cookies and sessions.

## Endpoints

### Authentication Endpoints ✅ IMPLEMENTED

#### GET /api/auth/session

Get current user session

#### POST /api/auth/sign-in

Sign in with email and password

#### POST /api/auth/sign-up

Create a new user account

#### POST /api/auth/sign-out

Sign out and clear session

### User Management Endpoints 🚧 PLANNED

#### GET /api/users

Get list of users (admin only)

**Query Parameters**:

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term for user name or email
- `status` (string): Filter by status (active, inactive)

#### POST /api/users

Create a new user (admin only)

#### PUT /api/users/[id]

Update user information

#### DELETE /api/users/[id]

Delete user (admin only)

### Customer Management Endpoints 🚧 PLANNED

#### GET /api/customers

Get list of customers with pagination

**Query Parameters**:

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term for customer name or email
- `status` (string): Filter by status (active, inactive)

#### POST /api/customers

Create a new customer

#### GET /api/customers/[id]

Get customer details by ID

#### PUT /api/customers/[id]

Update customer information

#### DELETE /api/customers/[id]

Delete customer (soft delete)

### Invoice Management Endpoints 🚧 PLANNED

#### GET /api/invoices

Get list of invoices with pagination

**Query Parameters**:

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term for invoice number
- `status` (string): Filter by status (draft, sent, paid, overdue, cancelled)
- `customer` (string): Filter by customer name

#### POST /api/invoices

Create a new invoice

#### GET /api/invoices/[id]

Get invoice details by ID

#### PUT /api/invoices/[id]

Update invoice information

#### DELETE /api/invoices/[id]

Delete invoice (soft delete)

#### GET /api/invoices/[id]/pdf

Generate PDF for invoice

### Payment Management Endpoints 🚧 PLANNED

#### GET /api/payments

Get list of payments with pagination

**Query Parameters**:

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term for invoice number
- `method` (string): Filter by method (cash, bank, online)
- `status` (string): Filter by status (pending, completed, failed, cancelled)
- `customer` (string): Filter by customer name

#### POST /api/payments

Record a new payment

#### GET /api/payments/[id]

Get payment details by ID

#### PUT /api/payments/[id]

Update payment information

#### DELETE /api/payments/[id]

Delete payment (soft delete)

### Reports Endpoints 🚧 PLANNED

#### GET /api/reports/sales

Get sales reports

**Query Parameters**:

- `startDate` (string): Start date (YYYY-MM-DD)
- `endDate` (string): End date (YYYY-MM-DD)
- `customer` (string): Filter by customer

#### GET /api/reports/payments

Get payment reports

**Query Parameters**:

- `startDate` (string): Start date (YYYY-MM-DD)
- `endDate` (string): End date (YYYY-MM-DD)
- `customer` (string): Filter by customer

#### GET /api/reports/dashboard

Get dashboard metrics

### Settings Endpoints 🚧 PLANNED

#### GET /api/settings

Get application settings

#### PUT /api/settings

Update application settings

#### GET /api/settings/company

Get company information

#### PUT /api/settings/company

Update company information

## Error Codes

| Code                    | Description                |
| ----------------------- | -------------------------- |
| `AUTHENTICATION_FAILED` | Invalid credentials        |
| `UNAUTHORIZED`          | Missing or invalid session |
| `FORBIDDEN`             | Insufficient permissions   |
| `NOT_FOUND`             | Resource not found         |
| `VALIDATION_ERROR`      | Invalid request data       |
| `INTERNAL_ERROR`        | Server error               |

## Implementation Status

### ✅ Implemented

- Authentication system with Better Auth
- Session management
- User registration and login

### 🚧 Planned (Phase 2)

- User management CRUD
- Customer management CRUD
- Invoice management CRUD
- Payment tracking CRUD
- Reports and analytics
- Settings management
- PDF generation

---

_Last updated: August 2025_
