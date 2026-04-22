import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import ws from 'ws';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  console.error('Please make sure DATABASE_URL is set in .env or .env.local');
  process.exit(1);
}

console.log('✅ DATABASE_URL found, connecting to database...\n');

// Configure Neon adapter
neonConfig.webSocketConstructor = ws;

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Check if admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (existingAdmin) {
    const gym = await prisma.tenant.findUnique({ 
      where: { id: existingAdmin.tenantId } 
    });
    
    console.log('ting Admin Credentials:');
    console.log('━⚠️  Admin user already exists!');
    console.log('\n📋 Exis━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Email:    ${existingAdmin.email}`);
    console.log(`   Password: (use your existing password)`);
    console.log(`   Role:     ${existingAdmin.role}`);
    console.log(`   Gym:      ${gym?.name || 'Unknown'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return; 
  }

  // Create a gym (tenant)
  console.log('📍 Creating gym...');
  const gym = await prisma.tenant.create({
    data: {
      name: 'Main Gym',
      slug: 'main-gym',
      address: '123 Fitness Street, Gym City',
      email: 'contact@maingym.com',
      phone: '+1 555-0100',
      timezone: 'America/New_York',
    },
  });
  console.log(`✅ Gym created: ${gym.name} (slug: ${gym.slug})\n`);

  // Create admin user
  console.log('👤 Creating admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.create({
    data: {
      tenantId: gym.id,
      email: 'admin@maingym.com',
      hashedPassword: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1 555-0101',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  console.log('✅ Admin user created!');
  console.log('\n📋 Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Email:    ${admin.email}`);
  console.log(`   Password: admin123`);
  console.log(`   Role:     ${admin.role}`);
  console.log(`   Gym:      ${gym.name}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🎉 Seed completed successfully!');
  console.log('\n💡 Next steps:');
  console.log('   1. Run: npm run dev');
  console.log('   2. Visit: http://localhost:3000/login');
  console.log('   3. Login with the credentials above\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:');
    console.error(e.message || e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
