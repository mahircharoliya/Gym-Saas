import "dotenv/config";
import { defineConfig } from "prisma/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrate: {
    adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
  },
});
