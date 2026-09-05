import { defineConfig } from "vitest/config";
export default defineConfig({
  resolve: { alias: { "@genbreedai/shared": new URL("../shared/src/index.ts", import.meta.url).pathname } },
  test: { include: ["src/__tests__/golden/**/*.test.ts"], environment: "node" },
});
