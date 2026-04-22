import { spawn } from "child_process";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
  override: true,
});

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not found");
  process.exit(1);
}

console.log("✅ DATABASE_URL found, pushing schema to database...\n");

const push = spawn("npx", ["prisma", "db", "push", "--skip-generate"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env },
});

push.on("close", (code) => {
  if (code === 0) {
    console.log("\n✅ Schema pushed successfully!");
    console.log("\nNow run: npm run db:seed");
  } else {
    console.error(`\n❌ Failed with exit code ${code}`);
    process.exit(code);
  }
});
