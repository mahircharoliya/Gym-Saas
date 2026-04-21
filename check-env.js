#!/usr/bin/env node

require('dotenv').config();

console.log('\n🔍 Checking Environment Configuration...\n');

const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'NEXTAUTH_SECRET'
];

const optional = [
  'NEXT_PUBLIC_APP_URL',
  'AUTHORIZENET_API_LOGIN_ID',
  'AUTHORIZENET_TRANSACTION_KEY',
  'SMTP_HOST',
  'SMTP_USER',
  'TWILIO_ACCOUNT_SID'
];

let hasErrors = false;

console.log('Required Variables:');
required.forEach(key => {
  if (process.env[key]) {
    console.log(`  ✅ ${key}: Set`);
  } else {
    console.log(`  ❌ ${key}: Missing`);
    hasErrors = true;
  }
});

console.log('\nOptional Variables:');
optional.forEach(key => {
  if (process.env[key]) {
    console.log(`  ✅ ${key}: Set`);
  } else {
    console.log(`  ⚠️  ${key}: Not set (optional)`);
  }
});

if (hasErrors) {
  console.log('\n❌ Missing required environment variables!');
  console.log('\nTo fix:');
  console.log('1. Make sure you have a .env file in the root directory');
  console.log('2. Add the missing variables to your .env file');
  console.log('3. Run: node generate-secrets.js (to generate JWT secrets)');
  console.log('4. Add DATABASE_URL (see SETUP.md for instructions)');
  console.log('\nExample .env:');
  console.log('DATABASE_URL="postgresql://user:pass@host:5432/dbname"');
  console.log('JWT_SECRET="your-secret-here"');
  console.log('NEXTAUTH_SECRET="your-secret-here"');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are set!');
  console.log('\nYou can now run:');
  console.log('  npx prisma studio    - Open database GUI');
  console.log('  npm run dev          - Start development server');
}
