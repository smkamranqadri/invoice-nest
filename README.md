# InvoiceNest

An open-source, web-based invoicing and financial management system built with Next.js, TypeScript, and Prisma.

## 🚀 Features

### Core Features

#### ✅ Implemented (MVP Phase 1)
- **Authentication System**: First-time admin setup, JWT-based login/logout
- **User Management**: Admin and User roles with secure access control
- **Database Schema**: Complete data model for customers, invoices, payments
- **API Infrastructure**: RESTful API with error handling and validation
- **Testing Framework**: Unit and integration tests with 75% coverage
- **PWA Foundation**: Progressive Web App configuration and setup

#### 🚧 In Development (MVP Phase 2)
- **Customer Management**: Create, read, update, and delete customer records
- **Invoice Management**: Generate, edit, and manage invoices with tax calculations
- **Payment Tracking**: Record and track payments against invoices
- **Basic Reporting**: Sales and payment reports with data visualization
- **PDF Generation**: Export invoices as professional PDF documents

#### 📋 Planned (Future Phases)
- **Advanced Reporting**: Custom reports and analytics
- **Email Notifications**: Automated invoice and payment reminders
- **Multi-language Support**: Internationalization
- **Mobile Application**: Native mobile app
- **API Integrations**: Third-party service connections

### Technical Features

#### ✅ Implemented
- **TypeScript**: Full type safety across the application
- **Prisma ORM**: Type-safe database access with SQLite/PostgreSQL
- **Tailwind CSS**: Modern, responsive UI design
- **JWT Authentication**: Secure session management
- **Testing**: Jest + Testing Library with isolated test database
- **PWA Support**: Offline functionality and app-like experience
- **Code Quality**: ESLint, TypeScript strict mode

#### 🚧 In Development
- **React Hook Form**: Form handling with Zod validation
- **TanStack Query**: Server state management
- **PDF Generation**: PDFKit / Puppeteer integration

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: SQLite (development), PostgreSQL (production)
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Authentication**: JWT with jsonwebtoken
- **Testing**: Jest + Testing Library
- **PWA**: next-pwa

## 📋 Prerequisites

- Node.js 18.17.0 or higher
- npm, yarn, pnpm, or bun
- Git

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/invoice-nest.git
cd invoice-nest
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# PWA Configuration
PWA_NAME="InvoiceNest"
PWA_SHORT_NAME="InvoiceNest"
PWA_DESCRIPTION="Open-source invoicing and financial management system"
PWA_THEME_COLOR="#ffffff"
PWA_BACKGROUND_COLOR="#ffffff"
```

### 4. Set up the database
```bash
# Run database migrations
npm run db:migrate

# Seed the database with initial data
npm run db:seed
```

### 5. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### 6. Test the API endpoints
The authentication system is fully implemented and testable:

```bash
# Test the API endpoints
curl -X POST http://localhost:3000/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@example.com","password":"AdminPass123!"}'

curl -X GET http://localhost:3000/api/auth/setup/status

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"AdminPass123!"}'
```

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test suites
```bash
# Unit tests only
npm test -- src/utils/__tests__ src/lib/__tests__

# Integration tests only
npm test -- src/__tests__/api
```

## 📚 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset database

## 📁 Project Structure

```
invoice-nest/
├── 📁 docs/                    # Documentation
│   ├── plan.md                # Development plan
│   ├── spec.md                # Project specification
│   ├── database-schema.md     # Database schema
│   ├── api-documentation.md   # API documentation
│   └── development-setup.md   # Setup guide
├── 📁 src/
│   ├── 📁 app/               # Next.js App Router
│   │   ├── 📁 api/           # API routes (auth implemented)
│   │   └── 📁 (routes)/      # Page routes (default Next.js)
│   ├── 📁 components/        # React components (planned)
│   ├── 📁 lib/              # Core libraries
│   │   ├── auth.ts          # Authentication helpers ✅
│   │   └── prisma.ts        # Prisma client ✅
│   ├── 📁 utils/            # Utility functions ✅
│   ├── 📁 types/            # TypeScript types ✅
│   ├── 📁 hooks/            # Custom React hooks (planned)
│   └── 📁 __tests__/        # Test files ✅
├── 📁 prisma/               # Database schema and migrations ✅
├── 📁 public/               # Static assets
└── 📁 coverage/             # Test coverage reports
```

## 🔧 Development

### Code Quality
- **ESLint**: Code linting with Next.js configuration
- **TypeScript**: Strict type checking
- **Prettier**: Code formatting (via ESLint)

### Testing Strategy
- **Unit Tests**: Utilities and business logic ✅
- **Integration Tests**: API endpoints and database operations ✅
- **Test Database**: Isolated SQLite database for testing ✅

### Database
- **Development**: SQLite (`./prisma/dev.db`) ✅
- **Testing**: SQLite (`./test.db`) ✅
- **Production**: PostgreSQL (configurable)

## 📖 Documentation

- [Project Specification](docs/spec.md) - Detailed project requirements
- [Development Plan](docs/plan.md) - Step-by-step development roadmap
- [Database Schema](docs/database-schema.md) - Database structure and relationships
- [API Documentation](docs/api-documentation.md) - Complete API reference
- [Development Setup](docs/development-setup.md) - Detailed setup instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/invoice-nest/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/invoice-nest/discussions)
- **Documentation**: [Project Docs](docs/)

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Self-hosted
1. Build the application: `npm run build`
2. Set up PostgreSQL database
3. Configure environment variables
4. Run migrations: `npm run db:migrate`
5. Start the server: `npm start`

## 🔮 Roadmap

### v1 (Current - Phase 1) ✅
- ✅ Authentication system
- ✅ User management
- ✅ Database schema
- ✅ API infrastructure
- ✅ Testing framework
- ✅ PWA foundation

### v1 (Current - Phase 2) 🚧
- 🚧 Customer management UI
- 🚧 Invoice management UI
- 🚧 Payment tracking UI
- 🚧 Basic reporting UI
- 🚧 PDF generation

### v2 (Future)
- Multi-language support
- Advanced analytics
- Mobile application
- API for third-party integrations
- Advanced workflow automation
- Multi-tenant architecture

## 📊 Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication | ✅ Complete | JWT-based, admin setup, login/logout |
| Database Schema | ✅ Complete | All tables and relationships defined |
| API Infrastructure | ✅ Complete | Error handling, validation, middleware |
| Testing Framework | ✅ Complete | Unit + integration tests, 75% coverage |
| PWA Setup | ✅ Complete | Configuration and service worker |
| Customer Management | 🚧 Planned | API + UI implementation needed |
| Invoice Management | 🚧 Planned | API + UI implementation needed |
| Payment Tracking | 🚧 Planned | API + UI implementation needed |
| Reporting | 🚧 Planned | API + UI implementation needed |
| PDF Generation | 🚧 Planned | PDFKit integration needed |

---

**InvoiceNest** - Simplify your invoicing workflow with a modern, open-source solution.

*Currently in active development - Phase 1 (Infrastructure) complete, Phase 2 (Core Features) in progress.*
