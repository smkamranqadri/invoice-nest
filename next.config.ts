import withPWA from 'next-pwa';

const nextConfig = {
  serverExternalPackages: ['@prisma/client'],
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})(nextConfig);
