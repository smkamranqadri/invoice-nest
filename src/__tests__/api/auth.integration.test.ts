import { createUser, authenticateUser, checkSetupStatus } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    // Ensure we're using the test database
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('Tests must run in test environment');
    }
    
    // Clean up only user table for auth tests
    await prisma.user.deleteMany();
  });

  beforeEach(async () => {
    // Clean up user table before each test
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Clean up user table after all tests
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('User Setup and Authentication', () => {
    it('should create the first admin user successfully', async () => {
      // Check initial setup status
      const initialSetupStatus = await checkSetupStatus();
      expect(initialSetupStatus).toBe(false);

      // Create admin user
      const user = await createUser(
        'admin@example.com',
        'AdminPass123!',
        'Admin User',
        'ADMIN'
      );

      expect(user.email).toBe('admin@example.com');
      expect(user.name).toBe('Admin User');
      expect(user.role).toBe('ADMIN');
      expect(user.isActive).toBe(true);

      // Check setup status after creation
      const finalSetupStatus = await checkSetupStatus();
      expect(finalSetupStatus).toBe(true);
    });

    it('should not allow creating duplicate users', async () => {
      // Create first user
      await createUser(
        'admin@example.com',
        'AdminPass123!',
        'Admin User',
        'ADMIN'
      );

      // Try to create duplicate user
      await expect(
        createUser(
          'admin@example.com',
          'AnotherPass123!',
          'Another Admin',
          'ADMIN'
        )
      ).rejects.toThrow('User with this email already exists');
    });

    it('should authenticate user with correct credentials', async () => {
      // Create user
      const createdUser = await createUser(
        'user@example.com',
        'UserPass123!',
        'Test User',
        'USER'
      );

      // Authenticate with correct credentials
      const authenticatedUser = await authenticateUser('user@example.com', 'UserPass123!');
      expect(authenticatedUser.id).toBe(createdUser.id);
      expect(authenticatedUser.email).toBe('user@example.com');
    });

    it('should reject authentication with wrong password', async () => {
      // Create user
      await createUser(
        'user@example.com',
        'UserPass123!',
        'Test User',
        'USER'
      );

      // Try to authenticate with wrong password
      await expect(
        authenticateUser('user@example.com', 'WrongPassword!')
      ).rejects.toThrow('Invalid password');
    });

    it('should reject authentication for non-existent user', async () => {
      await expect(
        authenticateUser('nonexistent@example.com', 'AnyPassword!')
      ).rejects.toThrow('User not found');
    });

    it('should handle multiple user creation and authentication', async () => {
      // Create multiple users
      const admin = await createUser(
        'admin@example.com',
        'AdminPass123!',
        'Admin User',
        'ADMIN'
      );

      const user1 = await createUser(
        'user1@example.com',
        'User1Pass123!',
        'User One',
        'USER'
      );

      const user2 = await createUser(
        'user2@example.com',
        'User2Pass123!',
        'User Two',
        'USER'
      );

      // Verify all users can authenticate
      const authAdmin = await authenticateUser('admin@example.com', 'AdminPass123!');
      const authUser1 = await authenticateUser('user1@example.com', 'User1Pass123!');
      const authUser2 = await authenticateUser('user2@example.com', 'User2Pass123!');

      expect(authAdmin.id).toBe(admin.id);
      expect(authUser1.id).toBe(user1.id);
      expect(authUser2.id).toBe(user2.id);

      // Verify setup status is true (admin exists)
      const setupStatus = await checkSetupStatus();
      expect(setupStatus).toBe(true);
    });
  });
}); 