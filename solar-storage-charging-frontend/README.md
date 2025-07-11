# 光储充一体化系统配置与能量管理优化平台

## 项目简介

本项目是一个基于Vue 3 + TypeScript的光储充一体化系统配置与能量管理优化平台，旨在为光伏发电、储能系统和充电桩的综合配置提供智能化的优化解决方案。

## 主要功能

### 1. 参数设置模块
- **背景信息配置**：园区面积、电动汽车保有量等基础参数设置
- **配置范围设置**：直流/交流侧光伏、储能、充电桩的容量范围配置
- **数据曲线导入**：支持Excel文件导入光照数据、车流量数据、负荷数据
- **数据可视化预览**：实时展示导入的数据曲线

### 2. 容量优化配置模块
- **NSGA多目标优化算法**：支持并网/离网两种运行模式
- **三维帕累托前沿图**：直观展示优化目标空间分布
- **方案对比分析**：详细展示各方案的配置参数和优化指标
- **能量流分析**：实时显示储能SOC、光伏发电、负荷曲线等

### 3. 能量管理优化模块
- **多目标权重设置**：用户自定义优化指标权重
- **能量流优化**：基于实际运行策略的能量管理优化
- **结果可视化**：雷达图展示优化指标，能量流曲线展示运行状态
- **方案确认**：支持方案确认和重新优化

## 技术栈

### 前端技术
- **Vue 3**：采用Composition API的现代化前端框架
- **TypeScript**：类型安全的JavaScript超集
- **Element Plus**：基于Vue 3的桌面端组件库
- **Vue Router 4**：Vue.js官方路由管理器
- **Pinia**：Vue.js状态管理库
- **ECharts & ECharts-GL**：数据可视化图表库，支持3D图表
- **Axios**：HTTP客户端库

### 构建工具
- **Vite**：快速的前端构建工具
- **ESLint**：代码质量检查工具

### 其他依赖
- **XLSX**：Excel文件读取处理
- **File-saver**：文件下载保存

## 项目结构

```
solar-storage-charging-frontend/
├── src/
│   ├── assets/                 # 静态资源
│   ├── components/             # 公共组件
│   ├── router/                 # 路由配置
│   ├── services/               # API服务
│   │   └── api.ts             # 后端接口定义
│   ├── stores/                 # 状态管理
│   │   ├── app.ts             # 应用主状态
│   │   └── counter.ts         # 示例状态
│   ├── views/                  # 页面组件
│   │   ├── HomeView.vue       # 主界面
│   │   ├── ParameterSettings.vue    # 参数设置界面
│   │   ├── CapacityOptimization.vue # 容量优化配置界面
│   │   └── EnergyManagement.vue     # 能量管理优化界面
│   ├── App.vue                # 根组件
│   └── main.ts                # 入口文件
├── public/                     # 公共静态资源
├── package.json               # 项目依赖配置
└── README.md                  # 项目说明文档
```

## 安装与运行

### 前置要求
- Node.js (版本 >= 16.0.0)
- npm 或 yarn

### 安装依赖
```bash
cd solar-storage-charging-frontend
npm install
```

### 开发环境运行
```bash
npm run dev
```

### 生产环境构建
```bash
npm run build
```

### 代码检查
```bash
npm run lint
```

## 后端接口说明

本前端项目需要配合Python后端使用，默认后端地址为 `http://localhost:8000`。

### 主要API接口

#### 1. 参数设置相关
```typescript
POST /api/parameters/save
// 保存系统参数配置
```

#### 2. 容量优化相关
```typescript
POST /api/capacity/optimize
// 执行容量优化算法

GET /api/capacity/solution/:id
// 获取优化方案详情

POST /api/capacity/confirm
// 确认选择的优化方案
```

#### 3. 能量管理相关
```typescript
POST /api/energy/optimize
// 执行能量管理优化
```

## 使用流程

### 1. 参数设置
1. 进入参数设置界面
2. 配置园区面积、电动汽车保有量等背景信息
3. 设置各设备的容量配置范围
4. 上传Excel数据文件（光照、车流量、负荷数据）
5. 查看数据预览图表
6. 保存参数配置

### 2. 容量优化配置
1. 选择微电网运行模式（并网/离网）
2. 设置NSGA算法参数（种群规模、迭代次数）
3. 启动优化计算
4. 查看三维帕累托前沿图
5. 选择合适的优化方案
6. 查看方案详情和能量流曲线
7. 确认选择的方案

### 3. 能量管理优化
1. 选择运行模式（并网/离网）
2. 设置优化指标权重（总和需为1.0）
3. 启动能量管理优化
4. 查看优化结果和指标雷达图
5. 分析能量流曲线
6. 确认最终方案

## 数据格式说明

### Excel数据文件格式
上传的Excel文件应包含以下格式：
- 第一列：时间点（0-23小时）
- 第二列：对应的数值
- 第一行可以是标题行，程序会自动跳过

### 示例数据格式
```
时间(h)    光照强度(W/m²)
0          0
1          0
2          0
...        ...
23         0
```

## 浏览器兼容性

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 开发说明

### 开发环境配置
1. 确保安装了推荐的VSCode扩展：
   - Vue Language Features (Volar)
   - TypeScript Vue Plugin (Volar)
   - ESLint

### 代码规范
- 使用TypeScript进行类型约束
- 遵循Vue 3 Composition API规范
- 使用ESLint进行代码检查

### 自定义配置
可以在 `src/services/api.ts` 中修改后端API地址：
```typescript
const api = axios.create({
  baseURL: 'http://your-backend-url', // 修改为实际后端地址
  timeout: 30000,
})
```

## 常见问题

### Q: 为什么上传Excel文件后没有显示图表？
A: 请检查Excel文件格式是否正确，确保第一列为时间数据，第二列为数值数据。

### Q: 优化算法运行时间很长怎么办？
A: 可以减少种群规模和迭代次数，或联系后端开发人员优化算法性能。

### Q: 权重设置时总是提示需要等于1.0？
A: 请确保所有权重的总和精确等于1.0，可以使用滑块或直接输入数值。

## 联系方式

如有技术问题或建议，请联系开发团队。

## 许可证

本项目采用 MIT 许可证。
