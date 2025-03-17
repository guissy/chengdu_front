import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  // OpenAPI 文档文件，可以是 JSON 或 YAML 文件，也可以是 URL
  input: './chengdu.openapi.json',
  // 指定生成代码的输出目录（建议将生成的代码当作依赖管理，不直接修改）
  output: './src/service',
  // 选择你喜欢的请求客户端插件，这里示例使用 fetch 客户端（也可以使用 axios 等）
  plugins: [
    {
      baseUrl: "/api",
      name: '@hey-api/client-fetch',
    },
    '@tanstack/react-query',
    '@hey-api/schemas',
    'zod',
    {
      dates: true,
      name: '@hey-api/transformers',
    },
    {
      enums: 'javascript',
      name: '@hey-api/typescript',
    },
    {
      name: '@hey-api/sdk',
      transformer: true,
    },
  ],
});
