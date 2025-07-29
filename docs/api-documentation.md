# API Documentation

## Overview

This document provides comprehensive API documentation for the InvoiceNest application. The API follows RESTful principles and uses JSON for data exchange.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

All API endpoints (except authentication endpoints) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Endpoints

### Authentication Endpoints ✅ IMPLEMENTED

#### POST /api/auth/setup
**Status**: ✅ Implemented  
**Description**: Create the first admin user account (first-time setup)

**Request Body**:
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "AdminPass123!"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Admin account created successfully"
}
```

#### GET /api/auth/setup/status
**Status**: ✅ Implemented  
**Description**: Check if the application has been set up

**Response**:
```json
{
  "success": true,
  "data": {
    "isSetupComplete": true
  }
}
```

#### POST /api/auth/login
**Status**: ✅ Implemented  
**Description**: Authenticate user and get JWT token

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "AdminPass123!"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

### Customer Management Endpoints 🚧 PLANNED

#### GET /api/customers
**Status**: 🚧 Planned  
**Description**: Get list of customers with pagination and filtering

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term for customer name or email
- `status` (string): Filter by status (active, inactive)

**Response**:
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": "customer_123",
        "displayName": "Acme Corp",
        "contactName": "John Doe",
        "email": "john@acme.com",
        "phone": "+1234567890",
        "status": "ACTIVE",
        "createdAt": "2024-01-01T00:00:00Z"
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

#### POST /api/customers
**Status**: 🚧 Planned  
**Description**: Create a new customer

**Request Body**:
```json
{
  "displayName": "Acme Corp",
  "contactName": "John Doe",
  "email": "john@acme.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "country": "US",
  "zipCode": "10001"
}
```

#### GET /api/customers/[id]
**Status**: 🚧 Planned  
**Description**: Get customer details by ID

#### PUT /api/customers/[id]
**Status**: 🚧 Planned  
**Description**: Update customer information

#### DELETE /api/customers/[id]
**Status**: 🚧 Planned  
**Description**: Delete customer (soft delete)

### Invoice Management Endpoints 🚧 PLANNED

#### GET /api/invoices
**Status**: 🚧 Planned  
**Description**: Get list of invoices with pagination and filtering

#### POST /api/invoices
**Status**: 🚧 Planned  
**Description**: Create a new invoice

#### GET /api/invoices/[id]
**Status**: 🚧 Planned  
**Description**: Get invoice details by ID

#### PUT /api/invoices/[id]
**Status**: 🚧 Planned  
**Description**: Update invoice information

#### DELETE /api/invoices/[id]
**Status**: 🚧 Planned  
**Description**: Delete invoice (soft delete)

#### GET /api/invoices/[id]/pdf
**Status**: 🚧 Planned  
**Description**: Generate PDF for invoice

### Payment Management Endpoints 🚧 PLANNED

#### GET /api/payments
**Status**: 🚧 Planned  
**Description**: Get list of payments with pagination and filtering

#### POST /api/payments
**Status**: 🚧 Planned  
**Description**: Record a new payment

#### GET /api/payments/[id]
**Status**: 🚧 Planned  
**Description**: Get payment details by ID

#### PUT /api/payments/[id]
**Status**: 🚧 Planned  
**Description**: Update payment information

#### DELETE /api/payments/[id]
**Status**: 🚧 Planned  
**Description**: Delete payment (soft delete)

### Reports Endpoints 🚧 PLANNED

#### GET /api/reports/sales
**Status**: 🚧 Planned  
**Description**: Get sales reports with filtering

#### GET /api/reports/payments
**Status**: 🚧 Planned  
**Description**: Get payment reports with filtering

#### GET /api/reports/dashboard
**Status**: 🚧 Planned  
**Description**: Get dashboard metrics and KPIs

### Settings Endpoints 🚧 PLANNED

#### GET /api/settings
**Status**: 🚧 Planned  
**Description**: Get application settings

#### PUT /api/settings
**Status**: 🚧 Planned  
**Description**: Update application settings

#### GET /api/settings/company
**Status**: 🚧 Planned  
**Description**: Get company information

#### PUT /api/settings/company
**Status**: 🚧 Planned  
**Description**: Update company information

## Error Codes

| Code | Description |
|------|-------------|
| `AUTHENTICATION_FAILED` | Invalid credentials |
| `UNAUTHORIZED` | Missing or invalid token |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid request data |
| `INTERNAL_ERROR` | Server error |

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Authentication endpoints**: 5 requests per minute
- **Other endpoints**: 100 requests per minute

## Implementation Status

### ✅ Implemented
- Authentication system (setup, login, status)
- JWT token management
- Error handling middleware
- Request validation
- Database integration

### 🚧 Planned (Phase 3-6)
- Customer management CRUD
- Invoice management CRUD
- Payment tracking CRUD
- Reports and analytics
- Settings management
- PDF generation

### 📋 Future Enhancements (Phase 7+)
- Bulk operations
- Advanced filtering
- Real-time updates
- Webhook integrations
- API versioning

---

*Last updated: January 2024* 