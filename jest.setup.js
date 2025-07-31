require('@testing-library/jest-dom');

// Set test environment variables
process.env.DATABASE_URL = 'file:./test.db';
process.env.NODE_ENV = 'test';
process.env.BETTER_AUTH_SECRET = 'test-jwt-secret-key';
