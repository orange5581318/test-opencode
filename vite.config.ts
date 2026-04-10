import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import { viteMockServe } from "vite-plugin-mock";

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    // viteMockServe({
    //   mockPath: "mock",
    //   enable: process.env.NODE_ENV !== "production",
    // }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://m1.apifoxmock.com/m1/8072013-7827592-default",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
