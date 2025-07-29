import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default tax types
  const taxTypes = [
    { name: 'Sales Tax', rate: 8.5, isCompound: false },
    { name: 'VAT', rate: 20.0, isCompound: true },
    { name: 'GST', rate: 10.0, isCompound: false },
  ];

  for (const taxType of taxTypes) {
    await prisma.taxType.upsert({
      where: { id: `tax-${taxType.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `tax-${taxType.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...taxType,
      },
    });
  }

  // Create default settings
  const settings = [
    { key: 'company_name', value: 'InvoiceNest', type: 'string', description: 'Default company name' },
    { key: 'currency', value: 'USD', type: 'string', description: 'Default currency' },
    { key: 'timezone', value: 'UTC', type: 'string', description: 'Default timezone' },
    { key: 'invoice_prefix', value: 'INV', type: 'string', description: 'Invoice number prefix' },
    { key: 'payment_prefix', value: 'PAY', type: 'string', description: 'Payment number prefix' },
    { key: 'invoice_sequence', value: '1', type: 'number', description: 'Next invoice sequence number' },
    { key: 'payment_sequence', value: '1', type: 'number', description: 'Next payment sequence number' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  // Create default company
  const company = await prisma.company.upsert({
    where: { id: 'default-company' },
    update: {},
    create: {
      id: 'default-company',
      name: 'InvoiceNest',
      country: 'US',
      email: 'admin@invoicenest.com',
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Created ${taxTypes.length} tax types`);
  console.log(`⚙️  Created ${settings.length} settings`);
  console.log(`🏢 Created default company: ${company.name}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 