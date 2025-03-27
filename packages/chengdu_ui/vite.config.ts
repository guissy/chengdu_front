import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import react from '@vitejs/plugin-react'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts', // 入口文件
      name: 'chengdu_ui', // UMD 全局变量名（可选）
      fileName: (format) => `index.${format}.js`, // 输出文件名
      formats: ['es'], // 输出格式
    },
    rollupOptions: {
      // 将 React 和 React DOM 标记为外部依赖
      external: ['react', 'react-dom', 'zustand'],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        banner: '"use client";', // 在输出文件顶部添加 "use client"
      },
    },
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext'
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  plugins: [
    react(),
    dts({
      insertTypesEntry: true, // 在 package.json 中添加 "types" 字段
      // declarationOnly: true, // 声明文件输出目录
    }),
  ],
});