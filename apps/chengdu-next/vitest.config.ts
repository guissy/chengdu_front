import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // 测试相关配置
    environment: 'node', // 根据你的环境调整
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'), // 将 @ 映射到 src 目录
    },
  },
});
