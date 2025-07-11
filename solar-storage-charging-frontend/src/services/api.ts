import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:8000', // 后端API地址
  timeout: 30000,
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export interface BackgroundInfo {
  area: number
  evCount: number
}

export interface ConfigRange {
  dcPv: { min: number; max: number }
  acPv: { min: number; max: number }
  dcStorage: { min: number; max: number }
  acStorage: { min: number; max: number }
  dcCharging: { min: number; max: number }
  acCharging: { min: number; max: number }
}

export interface CurveData {
  time: number[]
  value: number[]
}

export interface ParameterData {
  backgroundInfo: BackgroundInfo
  configRange: ConfigRange
  curves: {
    solarData: CurveData
    trafficData: CurveData
    dcLoadData: CurveData
    acLoadData: CurveData
  }
}

export interface OptimizationConfig {
  mode: 'grid-connected' | 'off-grid'
  populationSize: number
  maxIterations: number
}

export interface OptimizationResult {
  paretoFront: Array<{
    x: number
    y: number
    z: number
    solutionId: string
  }>
  solutions: Array<{
    id: string
    objectives: number[]
  }>
}

export interface SolutionDetail {
  id: string
  configParams: {
    dcPv: number
    acPv: number
    dcStorage: number
    acStorage: number
    dcCharging: number
    acCharging: number
  }
  objectives: {
    cost: number
    emission?: number
    solarCurtailment: number
    powerShortage?: number
  }
  energyFlows: {
    time: number[]
    dcSoc: number[]
    acSoc: number[]
    solarPower: number[]
    dcLoad: number[]
    acLoad: number[]
  }
}

export interface EnergyManagementWeights {
  cost: number
  emission?: number
  efficiency?: number
  solarUtilization?: number
  powerShortage?: number
}

export interface EnergyManagementResult {
  energyFlows: {
    time: number[]
    solarPower?: number[]
    solarCurtailment?: number[]
    systemLoad?: number[]
    powerShortage?: number[]
    dcStoragePower?: number[]
    acStoragePower?: number[]
    dcSoc?: number[]
    acSoc?: number[]
    electricityPrice?: number[]
    profitLoss?: number[]
    dcEnergySource?: number[]
    acEnergySource?: number[]
    dcEnergyDestination?: number[]
    acEnergyDestination?: number[]
  }
  objectives: {
    cost: number
    emission?: number
    efficiency?: number
    solarUtilization?: number
    powerShortage?: number
  }
}

// API接口
export const apiService = {
  // 参数设置相关
  saveParameters: (data: ParameterData) => 
    api.post('/api/parameters/save', data),
  
  // 容量优化相关
  optimizeCapacity: (config: OptimizationConfig) => 
    api.post<OptimizationResult>('/api/capacity/optimize', config),
  
  getSolutionDetail: (solutionId: string, mode: string) => 
    api.get<SolutionDetail>(`/api/capacity/solution/${solutionId}?mode=${mode}`),
  
  confirmSolution: (solutionId: string) => 
    api.post('/api/capacity/confirm', { solutionId }),
  
  // 能量管理相关
  optimizeEnergyManagement: (weights: EnergyManagementWeights, mode: string) => 
    api.post<EnergyManagementResult>('/api/energy/optimize', { weights, mode }),
}

export default api