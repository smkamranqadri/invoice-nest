# Development Setup Guide

## Overview

This guide provides step-by-step instructions for setting up the InvoiceNest development environment. It covers all prerequisites, installation steps, configuration, and development workflow.

## Prerequisites

### Required Software

1. **Node.js** (v18.0.0 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version` and `npm --version`

2. **Git** (v2.30.0 or higher)
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

3. **Code Editor**
   - **VS Code** (recommended) - Download from [code.visualstudio.com](https://code.visualstudio.com/)
   - **WebStorm** - JetBrains IDE
   - **Sublime Text** - Lightweight editor

### Optional Software

1. **Docker** (for containerized development)
   - Download from [docker.com](https://docker.com/)
   - Verify installation: `docker --version`

2. **PostgreSQL** (for production-like database)
   - Download from [postgresql.org](https://postgresql.org/)
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

3. **Redis** (for caching and sessions)
   - Download from [redis.io](https://redis.io/)
   - Or use Docker: `docker run --name redis -p 6379:6379 -d redis`

4. **PWA Testing Tools** (optional)
   - **Chrome DevTools** - Built into Chrome browser
   - **Lighthouse** - Chrome extension or CLI tool
   - **PWA Builder** - Online tool for app store optimization
   - **Service Worker Debugger** - Chrome extension

## Project Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/smkamranqadri/invoice-nest.git

# Navigate to project directory
cd invoice-nest

# Check current branch
git branch
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Or using yarn (if preferred)
yarn install

# Verify installation
npm run build
```

### 3. Environment Configuration

Create environment files:

```bash
# Copy environment template
cp .env.example .env.local

# Copy additional environment files
cp .env.example .env.development
cp .env.example .env.test
```

Edit `.env.local` with your configuration:

```env
# Database Configuration
DATABASE_URL="file:./dev.db"
# For PostgreSQL: DATABASE_URL="postgresql://username:password@localhost:5432/invoicenest"

# Authentication
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"

# Email Configuration (optional - for future versions)
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT="587"
# SMTP_USER="your-email@gmail.com"
# SMTP_PASS="your-app-password"

# File Storage (optional)
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="5242880" # 5MB in bytes

# Application Settings
NODE_ENV="development"
PORT="3000"

# PWA Configuration
PWA_NAME="InvoiceNest"
PWA_SHORT_NAME="InvoiceNest"
PWA_DESCRIPTION="Professional invoicing and financial management system"
PWA_THEME_COLOR="#6366F1"
PWA_BACKGROUND_COLOR="#FFFFFF"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with sample data
npm run db:seed

# Open Prisma Studio (optional)
npx prisma studio
```

### 5. PWA Configuration

```bash
# Install PWA dependencies
npm install next-pwa

# Generate PWA assets (icons, splash screens)
npm run pwa:generate

# Build PWA for production testing
npm run build
npm run start
```

**PWA Testing:**
- Open Chrome DevTools → Application tab
- Check "Manifest" and "Service Workers" sections
- Test offline functionality
- Verify app installation prompt
- Run Lighthouse audit for PWA score

### 6. Verify Installation

```bash
# Run development server
npm run dev

# In another terminal, run tests
npm test

# Check linting
npm run lint

# Check type checking
npm run type-check
```

## Development Workflow

### 1. Git Workflow

```bash
# Create a new feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ... edit files ...

# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: add customer management functionality"

# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
```

### 2. Code Quality

```bash
# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Run type checking
npm run type-check

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### 3. Database Management

```bash
# Create a new migration
npx prisma migrate dev --name description-of-changes

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma client after schema changes
npx prisma generate

# View database in Prisma Studio
npx prisma studio
```

### 4. API Development

```bash
# Start development server
npm run dev

# Test API endpoints
curl http://localhost:3000/api/health

# View API documentation
# Navigate to http://localhost:3000/api-docs
```

## Project Structure

```
invoice-nest/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── customers/         # Customer pages
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── invoices/          # Invoice pages
│   │   ├── items/             # Item pages
│   │   ├── payments/          # Payment pages
│   │   ├── reports/           # Report pages
│   │   ├── settings/          # Settings pages
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable components
│   │   ├── ui/               # Base UI components
│   │   ├── forms/            # Form components
│   │   ├── layout/           # Layout components
│   │   └── shared/           # Shared components
│   ├── lib/                  # Utility libraries
│   │   ├── auth.ts           # Authentication utilities
│   │   ├── db.ts             # Database utilities
│   │   ├── utils.ts          # General utilities
│   │   └── validations.ts    # Validation schemas
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript type definitions
│   └── styles/               # Additional styles
├── prisma/                   # Database schema and migrations
│   ├── schema.prisma         # Database schema
│   ├── migrations/           # Database migrations
│   └── seed.ts              # Database seeding
├── public/                   # Static assets
├── tests/                    # Test files
├── docs/                     # Documentation
├── .env.example             # Environment variables template
├── .eslintrc.js             # ESLint configuration
├── .prettierrc              # Prettier configuration
├── jest.config.js           # Jest configuration
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## Available Scripts

### Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
```

### Testing Scripts

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test-file.test.ts

# Run E2E tests
npm run test:e2e
```

### Database Scripts

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Reset database
npm run db:reset

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

### Build Scripts

```bash
# Build application
npm run build

# Analyze bundle
npm run analyze

# Export static files
npm run export
```

### PWA Scripts

```bash
# Generate PWA assets
npm run pwa:generate

# Build PWA for production
npm run pwa:build

# Test PWA functionality
npm run pwa:test

# Lighthouse audit
npm run lighthouse
```

## Development Tools

### VS Code Extensions (Recommended)

1. **ES7+ React/Redux/React-Native snippets**
2. **Tailwind CSS IntelliSense**
3. **Prisma**
4. **ESLint**
5. **Prettier**
6. **TypeScript Importer**
7. **Auto Rename Tag**
8. **Bracket Pair Colorizer**
9. **GitLens**
10. **Thunder Client** (API testing)

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  }
}
```

### Browser Extensions

1. **React Developer Tools**
2. **Redux DevTools** (if using Redux)
3. **JSON Viewer**
4. **ColorZilla** (for color picking)

## Debugging

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/next/dist/bin/next",
      "args": ["dev"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    },
    {
      "name": "Next.js: debug full stack",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/next/dist/bin/next",
      "args": ["dev"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"],
      "serverReadyAction": {
        "pattern": "started server on .+, url: (https?://.+)",
        "uriFormat": "%s",
        "action": "debugWithChrome"
      }
    }
  ]
}
```

### Console Logging

```typescript
// Development logging
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}

// Use debug package for better logging
import debug from 'debug';
const log = debug('app:api');
log('API call:', endpoint);
```

## Performance Monitoring

### Bundle Analysis

```bash
# Analyze bundle size
npm run analyze

# View bundle report
open .next/analyze/client.html
```

### Performance Testing

```bash
# Run Lighthouse CI
npm run lighthouse

# Performance testing with Playwright
npm run test:performance
```

## Security

### Environment Variables

- Never commit `.env` files to version control
- Use `.env.example` for documentation
- Validate environment variables at startup

### Dependencies

```bash
# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Find process using port 3000
   lsof -i :3000
   
   # Kill process
   kill -9 <PID>
   ```

2. **Database connection issues**
   ```bash
   # Check database status
   npx prisma db push
   
   # Reset database
   npx prisma migrate reset
   ```

3. **TypeScript errors**
   ```bash
   # Clear TypeScript cache
   rm -rf .next
   npm run type-check
   ```

4. **Build errors**
   ```bash
   # Clear build cache
   rm -rf .next
   npm run build
   ```

5. **PWA issues**
   ```bash
   # Clear service worker cache
   # In Chrome DevTools → Application → Storage → Clear storage
   
   # Regenerate PWA assets
   npm run pwa:generate
   
   # Check PWA manifest
   # In Chrome DevTools → Application → Manifest
   
   # Test service worker
   # In Chrome DevTools → Application → Service Workers
   ```

### Getting Help

1. Check the [documentation](./README.md)
2. Search existing [issues](https://github.com/your-username/invoice-nest/issues)
3. Create a new issue with:
   - Description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Error logs

## Deployment

### Local Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t invoice-nest .

# Run container
docker run -p 3000:3000 invoice-nest
```

### Environment-Specific Configurations

- **Development**: `.env.development`
- **Testing**: `.env.test`
- **Production**: `.env.production`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards

- Follow TypeScript best practices
- Use ESLint and Prettier
- Write meaningful commit messages
- Add JSDoc comments for complex functions
- Include tests for new features

---

This setup guide should get you started with development on the InvoiceNest project. If you encounter any issues, please refer to the troubleshooting section or create an issue on GitHub. 