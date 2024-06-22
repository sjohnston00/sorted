import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const isDev = process.env.NODE_ENV !== "production";
installGlobals({
  nativeFetch: isDev,
});

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    remix({
      future: {
        unstable_singleFetch: isDev,
      },
    }),
    tsconfigPaths(),
  ],
});
