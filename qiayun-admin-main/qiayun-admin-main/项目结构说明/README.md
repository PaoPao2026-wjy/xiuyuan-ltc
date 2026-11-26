# qiayun-admin 项目结构说明文档

## 📚 文档概览

本文档详细介绍了 qiayun-admin 管理后台模版的项目架构、技术实现和核心功能。

## 📖 文档目录

### 1. [项目架构分析](./项目架构分析.md)

- **项目概览**：技术栈选择和整体架构介绍
- **目录结构**：详细的文件夹组织和功能说明
- **核心特性**：主要功能模块分析
- **开发亮点**：项目的技术优势和创新点

### 2. [动态路由权限实现](./动态路由权限实现.md)

- **权限系统概述**：整体设计思路和架构流程
- **权限数据获取**：API接口设计和数据结构
- **路由拦截机制**：守卫逻辑和验证流程
- **动态路由生成**：路由注册和组件懒加载
- **按钮级权限控制**：指令实现和Hooks封装

### 3. [技术栈详解](./技术栈详解.md)

- **核心技术栈**：Vue3、TypeScript、Vite等技术选型
- **开发工具链**：代码规范、构建优化、Git工作流
- **样式解决方案**：SCSS预处理、主题切换机制
- **工具库设计**：自定义Hooks和工具函数
- **响应式设计**：媒体查询和布局适配

## 🚀 快速开始

### 环境要求

- Node.js >= 16.18.0
- pnpm (推荐) / yarn / npm

### 安装依赖

```bash
pnpm install
```

### 开发运行

```bash
pnpm dev
```

### 项目构建

```bash
# 开发环境
pnpm build:dev

# 生产环境
pnpm build:pro
```

## 🏗️ 项目结构一览

```
qiayun-admin/
├── src/
│   ├── api/              # API接口管理
│   ├── assets/           # 静态资源
│   ├── components/       # 全局组件
│   ├── config/           # 全局配置
│   ├── directives/       # 自定义指令
│   ├── hooks/            # 组合式函数
│   ├── languages/        # 国际化配置
│   ├── layouts/          # 布局组件
│   ├── routers/          # 路由管理
│   ├── stores/           # 状态管理
│   ├── styles/           # 样式文件
│   ├── utils/            # 工具函数
│   └── views/            # 页面组件
├── public/               # 公共资源
├── build/                # 构建配置
└── 项目结构说明/          # 📚 本文档目录
```

## 🔑 核心功能

### 权限管理

- ✅ 基于角色的权限控制 (RBAC)
- ✅ 动态路由生成
- ✅ 菜单权限控制
- ✅ 按钮级权限控制

### 组件体系

- ✅ ProTable 超级表格
- ✅ 搜索表单组件
- ✅ 文件上传组件
- ✅ 图表组件封装
- ✅ 富文本编辑器

### 布局系统

- ✅ 4种布局模式
- ✅ 响应式设计
- ✅ 主题切换
- ✅ 暗黑模式

### 开发体验

- ✅ TypeScript 类型支持
- ✅ ESLint + Prettier 代码规范
- ✅ Husky + Commitlint 提交规范
- ✅ 热重载开发
- ✅ 组件懒加载

## 📝 开发规范

### 代码风格

- 使用 TypeScript 进行类型安全开发
- 遵循 Vue 3 Composition API 最佳实践
- 使用 `<script setup>` 语法糖
- 统一的代码格式化规范

### 命名规范

- **文件命名**：kebab-case (例：user-manage.vue)
- **组件命名**：PascalCase (例：UserManage)
- **函数命名**：camelCase (例：getUserInfo)
- **常量命名**：UPPER_SNAKE_CASE (例：API_BASE_URL)

### 目录结构规范

- **组件**：按功能模块组织，包含 .vue 和 .scss 文件
- **API**：按模块分组，统一的接口管理
- **类型定义**：集中在 typings 目录，按模块分类
- **工具函数**：通用工具放在 utils，业务相关放在对应模块

## 🔗 相关链接

- [Vue 3 官方文档](https://vuejs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [Element Plus 官方文档](https://element-plus.org/)
- [Pinia 官方文档](https://pinia.vuejs.org/)

## 📞 技术支持

如果您在使用过程中遇到问题，可以通过以下方式获取帮助：

1. 查阅本文档的详细说明
2. 查看项目的 README.md 文件
3. 阅读相关技术栈的官方文档
4. 在项目 GitHub Issues 中提出问题

## 🤝 贡献指南

欢迎贡献代码和完善文档：

1. Fork 项目到您的仓库
2. 创建功能分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -m 'Add new feature'`
4. 推送到分支：`git push origin feature/new-feature`
5. 创建 Pull Request

---

**注意**：本文档与项目代码同步更新，建议定期查看最新版本。
