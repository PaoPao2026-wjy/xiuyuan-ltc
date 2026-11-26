# HiMorning API Server

基于 **NestJS + Prisma + MySQL** 构建的现代化后端服务脚手架，集成了用户管理、JWT 认证、全局异常处理、API 文档等企业级功能。

## 🚀 特性

- ✅ **现代架构**: NestJS + TypeScript
- ✅ **数据库**: Prisma ORM + MySQL
- ✅ **身份认证**: JWT + Passport
- ✅ **API文档**: Swagger/OpenAPI
- ✅ **数据验证**: class-validator + class-transformer
- ✅ **全局异常处理**: 统一错误响应格式
- ✅ **日志系统**: 请求/响应日志记录
- ✅ **CORS配置**: 跨域资源共享
- ✅ **环境配置**: dotenv 配置管理
- ✅ **数据库迁移**: Prisma Migrate
- ✅ **种子数据**: 数据库初始化

## 📁 项目结构

```
src/
├── modules/                 # 业务模块
│   ├── auth/               # 认证模块
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── jwt.strategy.ts
│   │   └── local.strategy.ts
│   └── user/               # 用户模块
│       ├── dto/
│       ├── user.controller.ts
│       ├── user.service.ts
│       └── user.module.ts
├── common/                 # 公共模块
│   ├── filters/           # 异常过滤器
│   ├── guards/            # 路由守卫
│   ├── interceptors/      # 拦截器
│   ├── utils/             # 工具函数
│   └── swagger/           # API文档配置
├── config/                # 配置模块
├── prisma/                # 数据库服务
├── app.module.ts
└── main.ts
```

## 🛠️ 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

复制环境变量模板文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接等信息：

```env
DATABASE_URL="mysql://username:password@localhost:3306/himorning_db"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=3000
```

### 3. 数据库设置

```bash
# 生成 Prisma 客户端
npm run db:generate

# 推送数据库架构
npm run db:push

# 或者使用迁移（推荐用于生产环境）
npm run db:migrate

# 初始化种子数据
npm run db:seed
```

### 4. 启动服务

```bash
# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

服务启动后，访问：
- API 服务: http://localhost:3000
- API 文档: http://localhost:3000/api-docs
- 数据库管理: `npm run db:studio`

## 📚 API 文档

启动服务后，访问 `http://localhost:3000/api-docs` 查看完整的 API 文档。

### 主要接口

#### 认证相关
- `POST /api/v1/auth/login` - 用户登录

#### 用户管理
- `POST /api/v1/users` - 创建用户
- `GET /api/v1/users` - 获取用户列表（需认证）

## 🗄️ 数据库

### 用户表 (User)
- `id` - 主键
- `email` - 邮箱（唯一）
- `password` - 密码（加密存储）
- `name` - 姓名（可选）
- `createdAt` - 创建时间
- `updatedAt` - 更新时间

### 默认测试账号
- 管理员: `admin@himorning.com` / `admin123456`
- 测试用户: `test@himorning.com` / `test123456`

## 🔧 开发指南

### 添加新模块

1. 使用 NestJS CLI 生成模块：
```bash
nest g module modules/example
nest g controller modules/example
nest g service modules/example
```

2. 在 `app.module.ts` 中注册模块

### 数据库模式变更

1. 修改 `prisma/schema.prisma`
2. 生成迁移文件：`npm run db:migrate`
3. 应用迁移：自动应用

### API 文档

使用 Swagger 装饰器为接口添加文档：

```typescript
@ApiOperation({ summary: '创建用户' })
@ApiResponse({ status: 201, description: '创建成功' })
@Post()
create(@Body() dto: CreateUserDto) {
  return this.service.create(dto);
}
```

## 📦 可用脚本

```bash
# 开发
npm run start:dev        # 开发模式启动
npm run start:debug      # 调试模式启动

# 构建
npm run build            # 构建项目
npm run start:prod       # 生产模式启动

# 测试
npm run test             # 单元测试
npm run test:e2e         # 端到端测试
npm run test:cov         # 测试覆盖率

# 数据库
npm run db:generate      # 生成 Prisma 客户端
npm run db:push          # 推送架构到数据库
npm run db:migrate       # 创建并应用迁移
npm run db:studio        # 打开 Prisma Studio
npm run db:seed          # 初始化种子数据

# 代码质量
npm run lint             # ESLint 检查
npm run format           # Prettier 格式化
```

## 🔒 安全特性

- JWT 令牌认证
- 密码 bcrypt 加密存储
- 请求参数验证
- CORS 跨域配置
- 全局异常处理

## 🎯 后续扩展建议

- [ ] 添加角色权限系统
- [ ] 集成 Redis 缓存
- [ ] 添加文件上传功能
- [ ] 集成第三方登录
- [ ] 添加邮件服务
- [ ] 实现数据分页
- [ ] 添加单元测试
- [ ] Docker 容器化部署

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！ 