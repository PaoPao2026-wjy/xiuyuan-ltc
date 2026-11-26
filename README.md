# 休元项目仓库

本仓库包含两部分：

## 1. xiuyuan-ltc —— 休元外贸 LTC 数据池管理系统

零依赖 Python（`http.server` + `sqlite3`）实现的外贸全流程管理系统。

- 链路：客户 → 线索 → 机会点 → 评审 → 项目 → 报价 → 合同 → 生产 → 采购 → 发货 → 回款
- 22 个功能视图 / 10 个岗位定制工作台 / 前端菜单权限过滤
- 使用方式：双击 `启动外贸系统.bat`，浏览器访问 `http://127.0.0.1:8911/`
- 数据库 `ltc.db` 首次启动自动创建（空库），演示数据通过 `/api/seed` 导入
- ⚠️ `ltc.db` 含真实业务数据，**不纳入版本控制**

## 2. 恰云（qiayun）三端源码

| 目录 | 说明 |
|---|---|
| `qiayun-admin-main` | 后台管理前端（Vue） |
| `qiayun-server-develop` | 服务端（NestJS + Prisma） |
| `qiayun-uniapp-main` | 移动端（uni-app） |

## ⚠️ 安全说明

以下内容**已排除**，不纳入版本控制：

- SSL 证书私钥（`*.key` / `*.pem`）
- 环境变量文件（`.env*`）
- 数据库文件（`*.db`）
- 依赖与构建产物（`node_modules/` / `dist/` / `__pycache__/`）

部署时请自行准备 `.env` 与证书文件。
