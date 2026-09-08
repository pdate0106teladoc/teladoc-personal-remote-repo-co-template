import { ConfigEnv, defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import vitePluginSingleSpa from "vite-plugin-single-spa";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import path from "path";
import svgr from "@svgr/rollup";

// https://vite.dev/config/
export default defineConfig((opts: ConfigEnv) => {
  const env = loadEnv(opts.mode, process.cwd(), "");
  return {
    plugins: [
      svgr(),
      react(),
      vitePluginSingleSpa({
        type: "mife",
        spaEntryPoints: "./src/spa-config/spa.tsx",
        serverPort: 9000,
      }),
      cssInjectedByJsPlugin(),
    ],
    base: env.VITE_BFF_URL || "/",
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true,
          additionalData: `@use "@/styles/variables.scss" as *;`,
        },
      },
    },
    resolve: {
      dedupe: ["react", "react-dom", "react-router-dom"],
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      hmr: false,
    },
    preview: {
      port: 9000,
      headers: { "Access-Control-Allow-Origin": "*" },
    },
    build: {
      manifest: true,
      outDir: "dist",
      rollupOptions: {
        input: "src/spa-config/spa.tsx",
        external: ["react", "react-dom", "react-router-dom", "react/jsx-runtime", "react-dom/client", "react-router", "@remix-run/router", "scheduler"],
      },
    },
    define: {
      __vite_serve__:
        opts.command === "serve" && env.MODE != "production" ? true : false,
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "src/test/setup.ts",
      coverage: {
        provider: "istanbul",
        reporter: ["text", "lcov"],
        reportsDirectory: "coverage",
        all: true,
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          "src/**/*.test.{ts,tsx}",
          "src/test/**",
          "src/spa-config",
          "src/types",
          "src/styles",
          "src/pages/org-detail/pages/HistoryLogs.tsx",
          "src/pages/org-detail/pages/Comments.tsx",
        ],
        statements: 80,
        branches: 70,
        functions: 75,
        lines: 80,
        reportOnFailure: true,
      },
    },
  };
});
