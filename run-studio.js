#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

import { spawn } from 'child_process';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env or .env.local file');
  console.error('\nPlease add DATABASE_URL to your .env or .env.local file:');
  console.error('DATABASE_URL="postgresql://user:pass@host:5432/dbname"');
  process.exit(1);
}

console.log('✅ DATABASE_URL found, starting Prisma Studio...\n');

// Extract the URL and pass it directly to avoid config issues
const dbUrl = process.env.DATABASE_URL;

// Use array format to avoid shell injection warnings
const studio = spawn('npx', ['prisma', 'studio', '--url', dbUrl], {
  stdio: 'inherit',
  shell: false, // Changed to false to avoid deprecation warning
  env: { ...process.env, PATH: process.env.PATH }
});

studio.on('error', (error) => {
  console.error('Failed to start Prisma Studio:', error);
  console.error('\nTrying with shell mode...');
  
  // Fallback to shell mode if needed
  const studioShell = spawn('npx', ['prisma', 'studio', '--url', dbUrl], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env }
  });
  
  studioShell.on('error', (err) => {
    console.error('Failed to start Prisma Studio:', err);
    process.exit(1);
  });
});

studio.on('close', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`\nPrisma Studio exited with code ${code}`);
  }
});
