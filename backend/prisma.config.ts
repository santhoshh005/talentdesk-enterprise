import { defineConfig } from "@prisma/config";

export default defineConfig({
  seed: "ts-node --transpile-only prisma/seed.ts",
});
