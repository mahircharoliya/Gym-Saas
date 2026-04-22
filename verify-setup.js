#!/usr/bin/env node

import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

console.log("\n🔍 Verifying Project Setup...\n");

let hasErrors = false;
let hasWarnings = false;

// Check environment variables
console.log("📋 Environment Variables:");
const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET", "NEXTAUTH_SECRET"];
requiredEnvVars.forEach((key) => {
  if (process.env[key]) {
    console.log(`  ✅ ${key}: Set`);
  } else {
    console.log(`  ❌ ${key}: Missing`);
    hasErrors = true;
  }
});

// Check critical files
console.log("\n📁 Critical Files:");
const criticalFiles = [
  "src/app/(auth)/signup/page.tsx",
  "src/app/(auth)/signup/owner/page.tsx",
  "src/app/(auth)/signup/member/page.tsx",
  "src/app/(auth)/signup/trainer/page.tsx",
  "src/app/api/auth/signup/route.ts",
  "src/app/api/gyms/route.ts",
  "prisma/schema.prisma",
  "prisma.config.js",
];

criticalFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file}: Missing`);
    hasErrors = true;
  }
});

// Check node_modules
console.log("\n📦 Dependencies:");
const criticalDeps = [
  "@prisma/client",
  "@prisma/adapter-neon",
  "@neondatabase/serverless",
  "next",
  "react",
  "bcryptjs",
  "dotenv",
];

criticalDeps.forEach((dep) => {
  const depPath = path.join("node_modules", dep);
  if (fs.existsSync(depPath)) {
    console.log(`  ✅ ${dep}`);
  } else {
    console.log(`  ⚠️  ${dep}: Not installed`);
    hasWarnings = true;
  }
});

// Check Prisma client
console.log("\n🔧 Prisma Setup:");
const prismaClientPath = "node_modules/@prisma/client";
if (fs.existsSync(prismaClientPath)) {
  console.log("  ✅ Prisma Client: Generated");
} else {
  console.log("  ❌ Prisma Client: Not generated (run: npx prisma generate)");
  hasErrors = true;
}

// Summary
console.log("\n" + "=".repeat(50));
if (hasErrors) {
  console.log("❌ Setup has ERRORS that need to be fixed!");
  console.log("\nTo fix:");
  console.log("  1. Add missing environment variables to .env or .env.local");
  console.log("  2. Run: npm install");
  console.log("  3. Run: npx prisma generate");
  process.exit(1);
} else if (hasWarnings) {
  console.log("⚠️  Setup has warnings but should work");
  console.log("\nRecommended:");
  console.log("  - Run: npm install");
} else {
  console.log("✅ All checks passed! Your setup is ready.");
  console.log("\n🚀 You can now:");
  console.log("  - Run: npm run dev (start development server)");
  console.log("  - Run: npm run studio (open Prisma Studio)");
  console.log("  - Visit: http://localhost:3000");
}
console.log("=".repeat(50) + "\n");
