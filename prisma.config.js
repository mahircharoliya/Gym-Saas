import { config } from "dotenv";
import { defineConfig } from "prisma/config";
import path from "path";

// Load environment variables from both .env and .env.local
config({ path: path.resolve(process.cwd(), ".env") });
config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env or .env.local file!");
  console.error("Please add DATABASE_URL to your .env or .env.local file");
  process.exit(1);
}

console.log("✅ DATABASE_URL loaded successfully");

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  migrations: {
    datasourceUrl: process.env.DATABASE_URL,
  },
});
