import { defineConfig } from "vitest/config";
import path from "node:path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    testTimeout: 15_000,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: [
        "src/entities/**/*.{ts,tsx}",
        "src/features/**/*.{ts,tsx}",
        "src/shared/api/**/*.{ts,tsx}",
        "src/shared/stores/**/*.{ts,tsx}",
        "src/shared/components/**/*.{ts,tsx}",
      ],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/test/**",
        "src/**/index.ts",
        "src/shared/components/ui/**",
        "src/shared/api/configMock/browser.ts",
        "src/shared/providers/**",
        "src/shared/components/pages/**",
        "src/shared/components/organisms/AppShell.tsx",
        "src/shared/components/atoms/FormDatePicker.tsx",
        "src/shared/adapters/**",
      ],
      thresholds: {
        lines: 85,
        functions: 80,
        branches: 76,
        statements: 85,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
