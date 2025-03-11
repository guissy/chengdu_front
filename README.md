# 业务系统管理平台 - 前端

这是业务系统管理平台的前端项目，使用 React、TypeScript、DaisyUI、Tailwind CSS 4、Zustand、Zod 和 OpenAPI TypeScript 等现代技术构建。

## 技术栈

- **React**: 用于构建用户界面的 JavaScript 库
- **TypeScript**: JavaScript 的类型超集，提供类型安全和更好的开发体验
- **Vite**: 现代前端构建工具，提供极速的开发体验
- **DaisyUI**: Tailwind CSS 组件库，提供美观的 UI 组件
- **Tailwind CSS 4**: 实用工具优先的 CSS 框架
- **Zustand**: 简单、快速的状态管理方案
- **Zod**: TypeScript 优先的模式声明和验证库
- **React Query**: 用于管理服务器状态的库
- **React Router**: React 应用的声明式路由
- **React Hook Form**: 高性能、灵活且可扩展的表单库
- **OpenAPI TypeScript**: 通过 OpenAPI 规范生成 TypeScript 类型

## 项目结构

```
business-system-frontend/
├── src/
│   ├── api/               # API 相关代码
│   │   ├── client.ts      # API 客户端
│   │   ├── gen/           # 生成的 API 类型
│   │   └── hooks/         # API Hooks
│   ├── components/        # 通用组件
│   │   ├── ui/            # UI 组件
│   │   └── layout/        # 布局组件
│   ├── features/          # 功能模块
│   │   ├── part/          # 物业分区
│   │   ├── position/      # 铺位
│   │   ├── shop/          # 店铺
│   │   └── space/         # 广告位
│   ├── pages/             # 页面组件
│   ├── router/            # 路由配置
│   ├── store/             # 全局状态管理
│   ├── utils/             # 工具函数
│   ├── App.tsx            # 应用入口组件
│   └── main.tsx           # 应用入口点
├── public/                # 静态资源
└── ...                    # 配置文件
```

## 功能模块

- **物业分区管理**: 创建和管理商圈内的物业分区
- **铺位管理**: 管理物业分区内的铺位信息
- **店铺管理**: 管理店铺详细信息和状态
- **广告位管理**: 管理各类广告位资源
- **商圈管理**: 管理商业中心和商圈信息
- **行政区划管理**: 管理城市和区域信息

## 安装与运行

### 前置条件

- Node.js 16.x 或更高版本
- 后端 API 服务运行中

### 安装步骤

1. 克隆仓库
```bash
git clone https://your-repository-url/business-system-frontend.git
cd business-system-frontend
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## API 文档生成

更新 OpenAPI 类型定义：

```bash
npm run generate-api
```

## 开发指南

### 添加新页面

1. 在 `src/pages` 目录下创建新页面组件
2. 在 `src/router/routes.tsx` 添加路由配置
3. 如果需要，在 `src/features` 下创建相应的功能模块

### 添加新组件

1. 在 `src/components/ui` 目录下创建通用 UI 组件
2. 在 `src/features/{feature}/components` 创建业务相关组件

### 添加新 API 集成

1. 在 OpenAPI 规范文件中添加 API 定义
2. 运行 `npm run generate-api` 生成 TypeScript 类型
3. 在 `src/api/hooks` 下创建相应的 API Hook

## 贡献

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建一个 Pull Request

## 许可证

[ISC](LICENSE)