# Vue3 商城后台管理系统 设计文档

**日期：** 2026-04-07
**项目：** vue3-ts-test
**定位：** 学习实战兼顾，Mock 数据驱动，无需真实后端

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Vue 3 + Vite + TypeScript |
| UI 组件库 | Element Plus |
| 路由 | Vue Router 4 |
| 状态管理 | Pinia |
| HTTP 请求 | Axios（封装拦截器） |
| Mock 数据 | mockjs + vite-plugin-mock |
| 图表 | ECharts |

---

## 项目结构

```
src/
├── api/                  # 接口请求函数，按模块拆分
│   ├── request.ts        # Axios 实例 + 拦截器封装
│   ├── dashboard.ts
│   ├── product.ts
│   ├── order.ts
│   └── user.ts
├── stores/               # Pinia stores
│   ├── user.ts           # 登录态、token、用户信息
│   ├── permission.ts     # 动态路由、菜单权限
│   └── app.ts            # 侧边栏折叠状态等全局 UI 状态
├── views/                # 页面组件
│   ├── login/
│   │   └── index.vue
│   ├── dashboard/
│   │   └── index.vue
│   ├── product/
│   │   ├── list.vue
│   │   └── category.vue
│   ├── order/
│   │   ├── list.vue
│   │   └── detail.vue
│   └── user/
│       ├── list.vue
│       ├── role.vue
│       └── menu.vue
├── layout/               # 整体布局组件
│   ├── AppLayout.vue
│   ├── AppSidebar.vue
│   ├── AppHeader.vue
│   └── AppMain.vue
├── components/           # 公共组件
│   └── SvgIcon.vue
├── composables/          # 可复用逻辑
│   └── usePermission.ts
├── directives/           # 自定义指令
│   └── permission.ts     # v-permission 按钮级权限
├── router/
│   ├── index.ts          # 路由实例 + 全局守卫
│   └── routes.ts         # 静态路由 + 动态路由模板
├── utils/
│   └── auth.ts           # token 读写工具
├── mock/                 # Mock 数据文件
│   ├── user.ts
│   ├── dashboard.ts
│   ├── product.ts
│   └── order.ts
└── main.ts
```

---

## 整体布局

可折叠侧边栏布局：

- **AppLayout.vue** — 外层容器，管理侧边栏展开/收起状态（存入 appStore）
- **AppSidebar.vue** — 左侧菜单，展开时显示图标+文字，收起时仅显示图标；菜单数据来自 permissionStore
- **AppHeader.vue** — 顶部面包屑导航 + 用户头像下拉（退出登录）
- **AppMain.vue** — `<router-view>` 内容区，支持 `<keep-alive>` 缓存

---

## 功能模块

### 1. 数据看板 Dashboard

- 统计卡片：总销售额、订单数、用户数、商品数
- 折线图：近 7 天 / 30 天销售趋势（ECharts）
- 柱状图：各分类商品销量对比（ECharts）
- 最新订单快速预览列表

### 2. 商品管理

- 商品列表：分页、关键词搜索、按分类/状态筛选
- 新增/编辑商品：名称、价格、库存、分类、图片上传、富文本描述
- 商品分类管理：树形结构，支持增删改
- 上架 / 下架操作

### 3. 订单管理

- 订单列表：分页、按状态筛选（待付款 / 待发货 / 已发货 / 已完成 / 已取消）
- 订单详情页：商品信息、收货地址、支付信息
- 发货操作：填写物流单号
- 退款处理：审核退款申请

### 4. 用户管理 + 权限（RBAC）

- 用户列表：搜索、启用/禁用、分配角色
- 角色管理：新增角色、分配菜单权限
- 菜单管理：树形菜单配置，控制侧边栏显示
- 动态路由：登录后根据角色动态 `addRoute()` 注册路由
- 按钮级权限：`v-permission` 自定义指令，无权限时隐藏操作按钮

---

## 数据流 & 核心机制

### 登录鉴权

1. 用户提交登录表单 → 调用 `/api/user/login`
2. Mock 返回 token → 存入 `localStorage` + `userStore`
3. Axios 请求拦截器自动在 header 中附加 `Authorization: Bearer <token>`
4. 响应拦截器统一处理：401 → 清除 token → 跳转 `/login`
5. 路由守卫 `beforeEach`：无 token 跳 `/login`，有 token 且未加载动态路由则先加载再放行

### 动态路由 + 权限

1. 登录成功后调用 `/api/user/menus` 获取当前用户可访问菜单
2. `permissionStore.generateRoutes()` 将菜单数据转换为路由配置
3. 调用 `router.addRoute()` 动态注册
4. 侧边栏菜单由 `permissionStore.menus` 驱动渲染

### Mock 数据

- `vite-plugin-mock` 在开发环境拦截所有 `/api/*` 请求
- 每个模块对应独立 mock 文件，使用 mockjs 生成随机数据
- 支持分页参数（`page` / `pageSize`）和搜索参数模拟
- 生产构建时 mock 自动关闭，无需修改业务代码

---

## 不在本次范围内

- 真实后端接口对接
- 单元测试 / E2E 测试
- 国际化（i18n）
- 主题切换（暗色模式）
