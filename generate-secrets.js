#!/usr/bin/env node

const crypto = require('crypto');

console.log('\n🔐 Generated Secrets for .env file:\n');
console.log('Copy these to your .env file:\n');
console.log('JWT_SECRET="' + crypto.randomBytes(32).toString('base64') + '"');
console.log('NEXTAUTH_SECRET="' + crypto.randomBytes(32).toString('base64') + '"');
console.log('CRON_SECRET="' + crypto.randomBytes(32).toString('base64') + '"');
console.log('\n✅ Done! Add these to your .env file\n');
