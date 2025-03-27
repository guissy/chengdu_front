import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import react from '@vitejs/plugin-react'
import { resolve } from 'path';
import * as path from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src"],
      exclude: ["src/**/*.test.tsx", "src/**/*.stories.tsx", "src/main.tsx"],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
    },

    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "react-icons/fi", "next/link",
        "next/navigation", "@radix-ui/react-slot", "@radix-ui/react-label", "@radix-ui/react-dialog",
      "@radix-ui/react-switch", "lucide-react"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        banner: '"use client";', // 在输出文件顶部添加 "use client"
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
});
