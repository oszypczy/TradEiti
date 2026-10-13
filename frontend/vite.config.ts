/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // Make the shared mixins available in every component stylesheet
        // (except the files that define them, to avoid a module loop).
        additionalData: (source: string, filename: string) =>
          /styles\/(mixins|breakpoints|extends)\.scss$/.test(filename)
            ? source
            : `@use "/src/styles/mixins.scss" as *;\n${source}`,
      },
    },
  },
  server: {
    proxy: {
      "/api": process.env.VITE_PROXY_TARGET ?? "http://localhost:8090",
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: false,
  },
});
