# InvoiceNest

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-green)](https://www.prisma.io/)

Simplify your invoicing workflow with a modern, open-source solution.

## 🚀 Features

### Core Features

#### ✅ Implemented (MVP Phase 1)

- **Authentication System**: Complete authentication with better-auth library
- **Database Schema**: Complete data model for customers, invoices, payments
- **API Infrastructure**: RESTful API with Better Auth integration
- **PWA Foundation**: Progressive Web App configuration and setup
- **Modern UI**: Beautiful landing page with Tailwind CSS

#### 🚧 In Development (MVP Phase 2)

- **User Management**: Admin and User roles with secure access control
- **Customer Management**: Create, read, update, and delete customer records
- **Invoice Management**: Generate, edit, and manage invoices with tax calculations
- **Payment Tracking**: Record and track payments against invoices
- **Basic Reporting**: Sales and payment reports with data visualization
- **PDF Generation**: Export invoices as professional PDF documents
- **Testing Framework**: Unit and integration tests with comprehensive coverage

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
- **Better Auth**: Secure authentication with session management
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
- **Authentication**: Better Auth
- **Testing**: Jest + Testing Library
- **PWA**: next-pwa
- **Forms**: React Hook Form + Zod
- **State Management**: TanStack Query

## 📋 Prerequisites

- Node.js 18.17.0 or higher
- npm, yarn, pnpm, or bun
- Git

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/smkamranqadri/invoice-nest.git
cd invoice-nest
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the `.env.example` file to `.env` and configure your environment variables.

### 4. Set up the database

```bash
# Run database migrations
npm run db:migrate
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

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

- **Issues**: [GitHub Issues](https://github.com/smkamranqadri/invoice-nest/issues)
- **Discussions**: [GitHub Discussions](https://github.com/smkamranqadri/invoice-nest/discussions)
- **Documentation**: [Project Docs](docs/)

## 🚀 Deployment

### Self-hosted

1. Build the application: `npm run build`
2. Set up PostgreSQL database
3. Configure environment variables
4. Run migrations: `npm run db:migrate`
5. Start the server: `npm start`

# Test comment
