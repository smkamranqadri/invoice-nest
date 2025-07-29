# API Documentation

## Overview

This document provides comprehensive documentation for the InvoiceNest API. The API follows RESTful principles and uses JSON for data exchange. All endpoints require authentication unless otherwise specified.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

### JWT Token Authentication

All API endpoints (except authentication endpoints) require a valid JWT token in the Authorization header.

```http
Authorization: Bearer <your-jwt-token>
```

### Getting a Token

1. **First-time Setup**: `POST /api/auth/setup` (creates admin account)
2. **Login**: `POST /api/auth/login`

The response includes a JWT token that should be included in subsequent requests.

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error details
    }
  }
}
```

## Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

---

## Authentication Endpoints

### POST /api/auth/setup

Create the first admin account (first-time setup only).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "admin@company.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "admin@company.com",
      "role": "ADMIN",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "token": "jwt-token-here"
  },
  "message": "Admin account created successfully"
}
```

### GET /api/auth/setup/status

Check if first-time setup is required.

**Response:**
```json
{
  "success": true,
  "data": {
    "setupRequired": true
  }
}
```

### POST /api/auth/login

Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "ADMIN"
    },
    "token": "jwt-token-here"
  },
  "message": "Login successful"
}
```

### POST /api/auth/logout

Logout user (invalidate token).

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /api/auth/me

Get current user information.

**Response:**
```json
{
  "success": true,
  "data": {
          "user": {
        "id": "user-uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "ADMIN",
        "preferences": {
          "theme": "light",
          "language": "en"
        }
      }
  }
}
```

### POST /api/auth/forgot-password

Request password reset email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### POST /api/auth/reset-password

Reset password with token.

**Request Body:**
```json
{
  "token": "reset-token",
  "password": "newPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## Customer Endpoints

### GET /api/customers

Get list of customers with optional filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search by name or email
- `status` (string): Filter by status (ACTIVE, INACTIVE, ARCHIVED)
- `sortBy` (string): Sort field (name, email, createdAt)
- `sortOrder` (string): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": "customer-uuid",
        "displayName": "Acme Corp",
        "contactName": "John Smith",
        "email": "john@acme.com",
        "phone": "+1234567890",
        "website": "https://acme.com",
        "currency": "USD",
        "status": "ACTIVE",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### POST /api/customers

Create a new customer.

**Request Body:**
```json
{
  "displayName": "Acme Corp",
  "contactName": "John Smith",
  "email": "john@acme.com",
  "phone": "+1234567890",
  "website": "https://acme.com",
  "currency": "USD",
  "status": "ACTIVE",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "country": "US",
  "zipCode": "10001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customer": {
      "id": "customer-uuid",
      "displayName": "Acme Corp",
      "contactName": "John Smith",
      "email": "john@acme.com",
      "phone": "+1234567890",
      "website": "https://acme.com",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "US",
      "zipCode": "10001",
      "currency": "USD",
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  },
  "message": "Customer created successfully"
}
```

### GET /api/customers/[id]

Get customer by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "customer": {
      "id": "customer-uuid",
      "displayName": "Acme Corp",
      "contactName": "John Smith",
      "email": "john@acme.com",
      "phone": "+1234567890",
      "website": "https://acme.com",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "US",
      "zipCode": "10001",
      "currency": "USD",
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-00T00:00:00Z"
    }
  }
}
```

### PUT /api/customers/[id]

Update customer.

**Request Body:**
```json
{
  "displayName": "Acme Corporation",
  "contactName": "John Smith",
  "email": "john@acme.com",
  "phone": "+1234567890",
  "website": "https://acme.com",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "country": "US",
  "zipCode": "10001",
  "currency": "USD",
  "status": "ACTIVE"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customer": {
      "id": "customer-uuid",
      "displayName": "Acme Corporation",
      "contactName": "John Smith",
      "email": "john@acme.com",
      "phone": "+1234567890",
      "website": "https://acme.com",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "US",
      "zipCode": "10001",
      "currency": "USD",
      "status": "ACTIVE",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  },
  "message": "Customer updated successfully"
}
```

### DELETE /api/customers/[id]

Delete customer (soft delete).

**Response:**
```json
{
  "success": true,
  "message": "Customer deleted successfully"
}
```



---

## Item Endpoints

### GET /api/items

Get list of items with optional filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search by name or description
- `category` (string): Filter by category
- `isActive` (boolean): Filter by active status
- `sortBy` (string): Sort field (name, price, createdAt)
- `sortOrder` (string): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "item-uuid",
        "name": "Web Design Service",
        "description": "Professional web design services",
        "price": 500.00,
        "category": "Services",
        "subcategory": "Web Development",
        "image": "https://example.com/image.jpg",
        "isActive": true,
        "isService": true,
        "unit": "hour",
        "sku": "WEB-001",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2
    }
  }
}
```

### POST /api/items

Create a new item.

**Request Body:**
```json
{
  "name": "Web Design Service",
  "description": "Professional web design services",
  "price": 500.00,
  "category": "Services",
  "subcategory": "Web Development",
  "isService": true,
  "unit": "hour",
  "sku": "WEB-001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "item": {
      "id": "item-uuid",
      "name": "Web Design Service",
      "description": "Professional web design services",
      "price": 500.00,
      "category": "Services",
      "subcategory": "Web Development",
      "isActive": true,
      "isService": true,
      "unit": "hour",
      "sku": "WEB-001",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  },
  "message": "Item created successfully"
}
```

### GET /api/items/[id]

Get item by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "item": {
      "id": "item-uuid",
      "name": "Web Design Service",
      "description": "Professional web design services",
      "price": 500.00,
      "category": "Services",
      "subcategory": "Web Development",
      "image": "https://example.com/image.jpg",
      "isActive": true,
      "isService": true,
      "unit": "hour",
      "sku": "WEB-001",
      "barcode": "123456789",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### PUT /api/items/[id]

Update item.

**Request Body:**
```json
{
  "name": "Web Design Service",
  "description": "Updated description",
  "price": 550.00,
  "category": "Services",
  "subcategory": "Web Development",
  "isService": true,
  "unit": "hour",
  "sku": "WEB-001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "item": {
      "id": "item-uuid",
      "name": "Web Design Service",
      "description": "Updated description",
      "price": 550.00,
      "category": "Services",
      "subcategory": "Web Development",
      "isActive": true,
      "isService": true,
      "unit": "hour",
      "sku": "WEB-001",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  },
  "message": "Item updated successfully"
}
```

### DELETE /api/items/[id]

Delete item (soft delete).

**Response:**
```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

---

## Invoice Endpoints

### GET /api/invoices

Get list of invoices with optional filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search by invoice number or customer name
- `status` (string): Filter by status (DRAFT, SENT, PAID, OVERDUE, CANCELLED)
- `customerId` (string): Filter by customer ID
- `dateFrom` (string): Filter by issue date from (YYYY-MM-DD)
- `dateTo` (string): Filter by issue date to (YYYY-MM-DD)
- `sortBy` (string): Sort field (number, issueDate, dueDate, total)
- `sortOrder` (string): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": "invoice-uuid",
        "number": "INV-000001",
        "customerId": "customer-uuid",
        "customer": {
          "id": "customer-uuid",
          "displayName": "Acme Corp"
        },
        "status": "SENT",
        "issueDate": "2024-01-01",
        "dueDate": "2024-01-15",
        "subtotal": 1000.00,
        "taxAmount": 100.00,
        "discountAmount": 50.00,
        "total": 1050.00,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```



### POST /api/invoices

Create a new invoice.

**Request Body:**
```json
{
  "customerId": "customer-uuid",
  "issueDate": "2024-01-01",
  "dueDate": "2024-01-15",
  "notes": "Thank you for your business",
  "items": [
    {
      "itemId": "item-uuid",
      "description": "Web Design Service",
      "quantity": 10,
      "price": 100.00,
      "taxRate": 10.00,
      "discountRate": 5.00
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "invoice": {
      "id": "invoice-uuid",
      "number": "INV-000001",
      "customerId": "customer-uuid",
      "status": "DRAFT",
      "issueDate": "2024-01-01",
      "dueDate": "2024-01-15",
      "subtotal": 1000.00,
      "taxAmount": 100.00,
      "discountAmount": 50.00,
      "total": 1050.00,
      "notes": "Thank you for your business",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  },
  "message": "Invoice created successfully"
}
```

### GET /api/invoices/[id]

Get invoice by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "invoice": {
      "id": "invoice-uuid",
      "number": "INV-000001",
      "customerId": "customer-uuid",
      "customer": {
        "id": "customer-uuid",
        "displayName": "Acme Corp",
        "contactName": "John Smith",
        "email": "john@acme.com",
        "phone": "+1234567890",
        "address": "123 Main St",
        "city": "New York",
        "state": "NY",
        "country": "US",
        "zipCode": "10001"
      },
      "status": "SENT",
      "issueDate": "2024-01-01",
      "dueDate": "2024-01-15",
      "subtotal": 1000.00,
      "taxAmount": 100.00,
      "discountAmount": 50.00,
      "total": 1050.00,
      "notes": "Thank you for your business",

      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "items": [
        {
          "id": "item-uuid",
          "description": "Web Design Service",
          "quantity": 10,
          "price": 100.00,
          "taxRate": 10.00,
          "taxAmount": 100.00,
          "discountRate": 5.00,
          "discountAmount": 50.00,
          "total": 1050.00,
          "sortOrder": 1
        }
      ]
    }
  }
}
```

### PUT /api/invoices/[id]

Update invoice.

**Request Body:**
```json
{
  "customerId": "customer-uuid",
  "issueDate": "2024-01-01",
  "dueDate": "2024-01-15",
  "notes": "Updated notes",
  "items": [
    {
      "description": "Web Design Service",
      "quantity": 10,
      "price": 100.00,
      "taxRate": 10.00,
      "discountRate": 5.00
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "invoice": {
      "id": "invoice-uuid",
      "number": "INV-000001",
      "customerId": "customer-uuid",
      "status": "DRAFT",
      "issueDate": "2024-01-01",
      "dueDate": "2024-01-15",
      "subtotal": 1000.00,
      "taxAmount": 100.00,
      "discountAmount": 50.00,
      "total": 1050.00,
      "notes": "Updated notes",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  },
  "message": "Invoice updated successfully"
}
```

### DELETE /api/invoices/[id]

Delete invoice (soft delete).

**Response:**
```json
{
  "success": true,
  "message": "Invoice deleted successfully"
}
```



### GET /api/invoices/[id]/pdf

Generate PDF for invoice.

**Response:** PDF file download

---

## Payment Endpoints

### GET /api/payments

Get list of payments with optional filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search by payment number or customer name
- `status` (string): Filter by status (PENDING, COMPLETED, FAILED, CANCELLED)
- `customerId` (string): Filter by customer ID
- `invoiceId` (string): Filter by invoice ID
- `method` (string): Filter by payment method
- `dateFrom` (string): Filter by date from (YYYY-MM-DD)
- `dateTo` (string): Filter by date to (YYYY-MM-DD)
- `sortBy` (string): Sort field (number, date, amount)
- `sortOrder` (string): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "payment-uuid",
        "number": "PAY-000001",
        "customerId": "customer-uuid",
        "customer": {
          "id": "customer-uuid",
          "displayName": "Acme Corp"
        },
        "invoiceId": "invoice-uuid",
        "invoice": {
          "id": "invoice-uuid",
          "number": "INV-000001"
        },
        "amount": 1050.00,
        "method": "BANK_TRANSFER",
        "date": "2024-01-15",
        "reference": "REF123456",
        "status": "COMPLETED",
        "createdAt": "2024-01-15T00:00:00Z",
        "updatedAt": "2024-01-15T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2
    }
  }
}
```

### POST /api/payments

Create a new payment.

**Request Body:**
```json
{
  "customerId": "customer-uuid",
  "invoiceId": "invoice-uuid",
  "amount": 1050.00,
  "method": "BANK_TRANSFER",
  "date": "2024-01-15",
  "reference": "REF123456",
  "notes": "Payment received"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "payment-uuid",
      "number": "PAY-000001",
      "customerId": "customer-uuid",
      "invoiceId": "invoice-uuid",
      "amount": 1050.00,
      "method": "BANK_TRANSFER",
      "date": "2024-01-15",
      "reference": "REF123456",
      "notes": "Payment received",
      "status": "PENDING",
      "createdAt": "2024-01-15T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z"
    }
  },
  "message": "Payment created successfully"
}
```

### GET /api/payments/[id]

Get payment by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "payment-uuid",
      "number": "PAY-000001",
      "customerId": "customer-uuid",
      "customer": {
        "id": "customer-uuid",
        "displayName": "Acme Corp",
        "contactName": "John Smith",
        "email": "john@acme.com"
      },
      "invoiceId": "invoice-uuid",
      "invoice": {
        "id": "invoice-uuid",
        "number": "INV-000001",
        "total": 1050.00
      },
      "amount": 1050.00,
      "method": "BANK_TRANSFER",
      "date": "2024-01-15",
      "reference": "REF123456",
      "notes": "Payment received",
      "status": "COMPLETED",
      "createdAt": "2024-01-15T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z"
    }
  }
}
```

### PUT /api/payments/[id]

Update payment.

**Request Body:**
```json
{
  "amount": 1050.00,
  "method": "BANK_TRANSFER",
  "date": "2024-01-15",
  "reference": "REF123456",
  "notes": "Updated payment notes",
  "status": "COMPLETED"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "payment-uuid",
      "number": "PAY-000001",
      "amount": 1050.00,
      "method": "BANK_TRANSFER",
      "date": "2024-01-15",
      "reference": "REF123456",
      "notes": "Updated payment notes",
      "status": "COMPLETED",
      "updatedAt": "2024-01-15T00:00:00Z"
    }
  },
  "message": "Payment updated successfully"
}
```

### DELETE /api/payments/[id]

Delete payment (soft delete).

**Response:**
```json
{
  "success": true,
  "message": "Payment deleted successfully"
}
```

---

## Settings Endpoints

### GET /api/settings

Get all settings.

**Response:**
```json
{
  "success": true,
  "data": {
    "settings": [
      {
        "id": "setting-uuid",
        "key": "company.name",
        "value": "InvoiceNest",
        "type": "string",
        "description": "Company name",
        "isPublic": true
      },
      {
        "id": "setting-uuid",
        "key": "invoice.numbering",
        "value": "INV-{YYYY}-{0000}",
        "type": "string",
        "description": "Invoice numbering format",
        "isPublic": false
      }
    ]
  }
}
```

### PUT /api/settings

Update multiple settings.

**Request Body:**
```json
{
  "settings": [
    {
      "key": "company.name",
      "value": "InvoiceNest Corp"
    },
    {
      "key": "invoice.numbering",
      "value": "INV-{YYYY}-{0000}"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "settings": [
      {
        "id": "setting-uuid",
        "key": "company.name",
        "value": "InvoiceNest Corp",
        "type": "string",
        "description": "Company name",
        "isPublic": true,
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ]
  },
  "message": "Settings updated successfully"
}
```

### GET /api/settings/[key]

Get setting by key.

**Response:**
```json
{
  "success": true,
  "data": {
    "setting": {
      "id": "setting-uuid",
      "key": "company.name",
      "value": "InvoiceNest",
      "type": "string",
      "description": "Company name",
      "isPublic": true
    }
  }
}
```

### PUT /api/settings/[key]

Update setting by key.

**Request Body:**
```json
{
  "value": "InvoiceNest Corp"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "setting": {
      "id": "setting-uuid",
      "key": "company.name",
      "value": "InvoiceNest Corp",
      "type": "string",
      "description": "Company name",
      "isPublic": true,
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  },
  "message": "Setting updated successfully"
}
```

---

## Reports Endpoints

### GET /api/reports/sales

Get sales report.

**Query Parameters:**
- `dateFrom` (string): Start date (YYYY-MM-DD)
- `dateTo` (string): End date (YYYY-MM-DD)
- `customerId` (string): Filter by customer
- `groupBy` (string): Group by (day, week, month, customer)
- `format` (string): Export format (json, csv, excel)

**Response:**
```json
{
  "success": true,
  "data": {
    "report": {
      "period": {
        "from": "2024-01-01",
        "to": "2024-01-31"
      },
      "summary": {
        "totalSales": 50000.00,
        "totalInvoices": 25,
        "averageInvoice": 2000.00,
        "paidInvoices": 20,
        "outstandingAmount": 10000.00
      },
      "data": [
        {
          "date": "2024-01-01",
          "sales": 5000.00,
          "invoices": 3
        }
      ]
    }
  }
}
```

### GET /api/reports/payments

Get payment report.

**Query Parameters:**
- `dateFrom` (string): Start date (YYYY-MM-DD)
- `dateTo` (string): End date (YYYY-MM-DD)
- `customerId` (string): Filter by customer
- `groupBy` (string): Group by (day, week, month, customer)
- `format` (string): Export format (json, csv, excel)

**Response:**
```json
{
  "success": true,
  "data": {
    "report": {
      "period": {
        "from": "2024-01-01",
        "to": "2024-01-31"
      },
      "summary": {
        "totalPayments": 40000.00,
        "totalPaymentCount": 20,
        "averagePayment": 2000.00,
        "outstandingAmount": 10000.00,
        "collectionRate": 80.00
      },
      "data": [
        {
          "date": "2024-01-01",
          "payments": 5000.00,
          "paymentCount": 3
        }
      ],
      "paymentsByCustomer": [
        {
          "customerId": "customer-uuid",
          "customerName": "Acme Corp",
          "totalPayments": 8000.00,
          "paymentCount": 4,
          "outstandingAmount": 2000.00
        }
      ]
    }
  }
}
```


    "report": {
      "period": {
        "from": "2024-01-01",
        "to": "2024-01-31"
      },
      "summary": {
        "totalExpenses": 30000.00,
        "totalTransactions": 50
      },
      "data": [
        {
          "category": "Salaries",
          "amount": 20000.00,
          "transactions": 20
        }
      ]
    }
  }
}
```

### GET /api/reports/taxes

Get tax summary report.

**Query Parameters:**
- `dateFrom` (string): Start date (YYYY-MM-DD)
- `dateTo` (string): End date (YYYY-MM-DD)
- `taxType` (string): Filter by tax type
- `format` (string): Export format (json, csv, excel)

**Response:**
```json
{
  "success": true,
  "data": {
    "report": {
      "period": {
        "from": "2024-01-01",
        "to": "2024-01-31"
      },
      "summary": {
        "totalTaxCollected": 5000.00,
        "totalInvoices": 25
      },
      "data": [
        {
          "taxType": "GST",
          "rate": 10.00,
          "amount": 3000.00,
          "invoices": 15
        }
      ]
    }
  }
}
```

### GET /api/reports/export

Export report in specified format.

**Query Parameters:**
- `type` (string): Report type (sales, profit-loss, expenses, taxes)
- `format` (string): Export format (csv, excel, pdf)
- `filters` (string): JSON string of filters

**Response:** File download

---

## Error Codes

### Authentication Errors

- `AUTH_INVALID_CREDENTIALS`: Invalid email or password
- `AUTH_TOKEN_EXPIRED`: JWT token has expired
- `AUTH_TOKEN_INVALID`: Invalid JWT token
- `AUTH_INSUFFICIENT_PERMISSIONS`: User lacks required permissions

### Validation Errors

- `VALIDATION_REQUIRED_FIELD`: Required field is missing
- `VALIDATION_INVALID_FORMAT`: Field format is invalid
- `VALIDATION_UNIQUE_CONSTRAINT`: Field value must be unique
- `VALIDATION_INVALID_VALUE`: Field value is invalid

### Business Logic Errors

- `INVOICE_ALREADY_PAID`: Invoice has already been paid
- `INVOICE_CANNOT_DELETE`: Invoice cannot be deleted
- `PAYMENT_AMOUNT_EXCEEDS_INVOICE`: Payment amount exceeds invoice total
- `CUSTOMER_HAS_INVOICES`: Customer cannot be deleted (has invoices)

### System Errors

- `INTERNAL_SERVER_ERROR`: Unexpected server error
- `DATABASE_ERROR`: Database operation failed
- `FILE_UPLOAD_ERROR`: File upload failed
- `PDF_GENERATION_ERROR`: PDF generation failed

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **General endpoints**: 100 requests per minute
- **File upload endpoints**: 10 requests per minute

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Pagination

List endpoints support pagination with the following parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Pagination metadata is included in responses:

```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## File Uploads

File upload endpoints accept multipart/form-data:

- **Image uploads**: JPG, PNG, GIF (max 5MB)
- **Document uploads**: PDF, DOC, DOCX (max 10MB)
- **CSV/Excel imports**: CSV, XLS, XLSX (max 2MB)

Uploaded files are stored securely and accessible via generated URLs.

---

This API documentation provides comprehensive coverage of all endpoints, request/response formats, and usage examples for the InvoiceNest application. 