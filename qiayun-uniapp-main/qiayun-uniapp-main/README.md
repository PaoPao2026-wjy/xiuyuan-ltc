# 恰云电力服务小程序

## 项目简介

恰云电力服务是一款基于 uni-app 框架开发的微信小程序，为电工技师提供工单管理、设备管理和客户服务等功能。该平台连接电工技师与客户，实现任务分配、接单、完成等全流程管理。

## 技术栈

- **开发框架**: uni-app
- **前端框架**: Vue 3
- **编译目标**: 微信小程序
- **开发工具**: HBuilderX / 微信开发者工具
- **API 通信**: 封装的 HTTP 客户端（基于 uni.request）
- **包管理**: npm

## 核心功能

### 1. 用户认证模块
- 微信一键登录/注册
- 个人信息完善（姓名、手机、身份证等）
- 企业信息录入（企业名称、资质证书等）
- 用户协议与隐私政策

### 2. 客户中心
- 客户信息管理
- 客户列表展示

### 3. 任务广场
- 浏览可接工单列表
- 工单详情查看
- 一键接单功能
- 工单状态跟踪

### 4. 工单管理
- 我的工单列表（待处理/处理中/已完成）
- 工单详情展示
- 工单完成操作
- 工单统计数据

### 5. 设备管理
- 我的设备列表
- 新增设备信息
- 设备详情查看
- 设备信息更新
- 设备模板查询

### 6. 个人中心
- 个人资料管理
- 更多功能入口

## 项目结构

```
qiayun-uniapp/
├── apis/                       # API 接口封装
│   ├── index.js               # HTTP 请求核心封装
│   └── modules/               # API 模块
│       ├── login.js          # 登录认证相关接口
│       ├── task.js           # 工单任务相关接口
│       └── equipment.js      # 设备管理相关接口
│
├── config/                    # 配置文件
│   └── index.js              # 环境配置（API 地址等）
│
├── pages/                     # 页面目录
│   ├── customer/             # 客户中心
│   │   └── index.vue        # 客户列表页
│   │
│   ├── task/                 # 任务模块
│   │   ├── index.vue        # 任务广场（首页）
│   │   ├── detail.vue       # 工单详情页
│   │   └── data.ts          # 任务相关数据类型
│   │
│   ├── mine/                 # 个人中心
│   │   ├── index.vue        # 更多页面
│   │   ├── task.vue         # 我的工单
│   │   ├── equipment.vue    # 我的设备
│   │   └── addEquipment.vue # 新增设备
│   │
│   ├── login/                # 登录注册
│   │   ├── guide.vue        # 引导页
│   │   ├── index.vue        # 登录页
│   │   ├── userInfo.vue     # 完善个人信息
│   │   ├── company.vue      # 完善公司信息
│   │   ├── agreement.vue    # 用户协议
│   │   └── privacy.vue      # 隐私政策
│   │
│   └── index/                # 初始页面
│       └── index.vue
│
├── static/                    # 静态资源
│   ├── icons/                # 图标资源
│   ├── logo.png             # 应用 Logo
│   └── avatar.png           # 默认头像
│
├── unpackage/                # 编译输出目录
│   └── dist/dev/mp-weixin/  # 微信小程序编译结果
│
├── App.vue                   # 应用入口组件
├── main.js                   # 应用入口文件
├── pages.json                # 页面路由配置
├── manifest.json             # 应用配置文件
├── uni.scss                  # 全局样式变量
└── package.json              # 项目依赖配置
```

## 技术架构

### 1. 网络请求层

项目封装了统一的 HTTP 请求模块（`apis/index.js`），提供以下核心能力：

- **统一请求配置**: 自动添加 baseURL、超时时间、请求头等
- **Token 管理**: 自动附带本地 token（Authorization: Bearer xxx）
- **拦截器机制**: 支持请求/响应拦截器
- **错误处理**: 统一的业务错误和网络错误处理
- **Token 过期处理**: 自动检测 401/403，清除 token 并跳转登录
- **Loading 控制**: 可选的全局 loading 提示
- **文件上传**: 封装的文件上传方法

**请求方法**:
```javascript
http.get(url, params, config)      // GET 请求
http.post(url, data, config)       // POST 请求
http.put(url, data, config)        // PUT 请求
http.delete(url, data, config)     // DELETE 请求
http.upload(filePath, formData)    // 文件上传
```

### 2. API 模块化

API 按业务模块拆分：

- **login.js**: 用户认证、个人信息、企业信息管理
- **task.js**: 工单列表、工单详情、接单、完成工单、工单统计
- **equipment.js**: 设备 CRUD、设备模板查询

### 3. 路由与导航

- **TabBar 导航**: 客户中心、任务广场、更多
- **全局样式**: 统一的导航栏样式配置
- **页面配置**: 通过 `pages.json` 集中管理

### 4. 环境配置

支持多环境配置（development、production、test），统一管理 API 地址等配置项。

```javascript
// config/index.js
const ENV = process.env.NODE_ENV || "development";
```

## 开发指南

### 环境要求

- Node.js >= 12.0
- npm 或 yarn
- HBuilderX（推荐）或 微信开发者工具

### 安装依赖

```bash
npm install
```

### 开发调试

**使用 HBuilderX**:
1. 使用 HBuilderX 打开项目
2. 运行 -> 运行到小程序模拟器 -> 微信开发者工具

**使用命令行**:
```bash
npm run dev:mp-weixin
```

编译结果输出到：`unpackage/dist/dev/mp-weixin/`

### 构建发布

```bash
npm run build:mp-weixin
```

### 配置说明

#### 1. API 配置

修改 `config/index.js` 中的 API 地址：

```javascript
const CONFIGS = {
  development: {
    API_BASE_URL: "http://101.132.251.43:3010",
  },
  production: {
    API_BASE_URL: "https://api.production.com",
  }
};
```

#### 2. 小程序配置

修改 `manifest.json` 中的小程序 AppID：

```json
{
  "mp-weixin": {
    "appid": "wxb655051cbd5c4688"
  }
}
```

## 代码规范

### 命名规范

- **文件命名**: 使用 camelCase（如 `userInfo.vue`）
- **组件命名**: 使用 PascalCase
- **变量命名**: 使用 camelCase
- **常量命名**: 使用 UPPER_CASE

### 代码风格

- 使用 2 空格缩进
- 使用单引号
- 函数使用 async/await 处理异步操作
- 统一使用 ES6+ 语法

### API 调用示例

```javascript
import { getTaskList, acceptTask } from "@/apis/modules/task.js";

// 获取任务列表
async function loadTasks() {
  try {
    const data = await getTaskList({ page: 1, pageSize: 10 });
    console.log(data.list);
  } catch (error) {
    console.error("加载失败", error);
  }
}

// 接受工单
async function handleAccept(workOrderId) {
  try {
    await acceptTask({ workOrderId });
    uni.showToast({ title: "接单成功", icon: "success" });
  } catch (error) {
    console.error("接单失败", error);
  }
}
```

## 核心流程

### 1. 用户登录流程

```
进入小程序 → 引导页 → 微信授权登录 → 完善个人信息 → 完善企业信息 → 进入首页
```

### 2. 工单接单流程

```
任务广场 → 浏览工单列表 → 查看工单详情 → 点击接单 → 我的工单（待处理）
```

### 3. 工单完成流程

```
我的工单 → 选择工单 → 查看详情 → 上传完成凭证 → 提交完成 → 工单状态变更
```

## API 接口说明

### 登录认证

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/app/auth/register-login` | POST | 注册/登录 |
| `/api/v1/app/technician/detail` | GET | 获取个人信息 |
| `/api/v1/app/technician/update` | PUT | 更新个人信息 |
| `/api/v1/app/enterprises/my` | GET | 查询企业信息 |
| `/api/v1/app/enterprises` | POST | 新增企业信息 |
| `/api/v1/app/enterprises/:id` | PUT | 更新企业信息 |

### 工单管理

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/app/work-order/plaza` | GET | 获取任务广场列表 |
| `/api/v1/app/work-order/detail` | GET | 获取工单详情 |
| `/api/v1/app/work-order/accept` | POST | 接受工单 |
| `/api/v1/app/work-order/complete` | POST | 完成工单 |
| `/api/v1/app/work-order/my-list` | GET | 我的工单列表 |
| `/api/v1/app/work-order/count` | GET | 工单统计 |

### 设备管理

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/app/equipments` | GET | 获取设备列表 |
| `/api/v1/app/equipments` | POST | 新增设备 |
| `/api/v1/app/equipments/:id` | GET | 获取设备详情 |
| `/api/v1/app/equipments/:id` | PUT | 更新设备信息 |
| `/api/v1/app/equipments/default/template` | GET | 获取默认模板 |

### 文件上传

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/app/oss/upload` | POST | 上传文件 |

## 常见问题

### 1. 如何修改 API 地址？

修改 `config/index.js` 文件中对应环境的 `API_BASE_URL`。

### 2. 如何添加新的 API 接口？

在 `apis/modules/` 目录下创建或编辑对应的模块文件，使用 `http.get/post/put/delete` 方法。

### 3. 如何处理 token 过期？

项目已内置 token 过期处理逻辑，当接口返回 401/403 时，会自动清除 token 并跳转到登录页。

### 4. 如何新增页面？

1. 在 `pages/` 目录下创建 `.vue` 文件
2. 在 `pages.json` 中添加页面配置
3. 使用 `uni.navigateTo` 或 `uni.redirectTo` 跳转

## 注意事项

1. **安全性**: 敏感信息（如 token）仅存储在本地，不要在代码中硬编码
2. **性能优化**: 列表使用分页加载，避免一次性加载大量数据
3. **错误处理**: 所有 API 调用都应使用 try-catch 处理异常
4. **用户体验**: 网络请求时提供适当的 loading 提示
5. **代码复用**: 相同的业务逻辑应抽取为公共方法

## 版本信息

- **当前版本**: v1.0.0
- **微信小程序 AppID**: wxb655051cbd5c4688
- **Vue 版本**: Vue 3
- **uni-app**: 最新版本

## 联系方式

如有问题或建议，请联系开发团队。

## 许可证

本项目为私有项目，未经授权不得复制、分发或修改。

---

**最后更新时间**: 2025-10-28

