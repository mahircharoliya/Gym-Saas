import { prisma } from "../src/lib/prisma";

async function testConnection() {
  try {
    // Simple query to test connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("Database connection successful:", result);
  } catch (error) {
    console.error("Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
