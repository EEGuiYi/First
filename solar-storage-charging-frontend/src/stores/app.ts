import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { 
  ParameterData, 
  OptimizationResult, 
  SolutionDetail, 
  EnergyManagementResult 
} from '@/services/api'

export const useAppStore = defineStore('app', () => {
  // 参数设置数据
  const parameters = ref<ParameterData | null>(null)
  
  // 容量优化结果
  const capacityOptimizationResult = ref<OptimizationResult | null>(null)
  const selectedSolution = ref<SolutionDetail | null>(null)
  
  // 能量管理结果
  const energyManagementResult = ref<EnergyManagementResult | null>(null)
  
  // 当前页面状态
  const currentStep = ref<'parameters' | 'capacity' | 'energy'>('parameters')
  
  // 加载状态
  const loading = ref(false)
  
  // 计算属性
  const hasParameters = computed(() => parameters.value !== null)
  const hasCapacityResult = computed(() => capacityOptimizationResult.value !== null)
  const hasSelectedSolution = computed(() => selectedSolution.value !== null)
  const hasEnergyResult = computed(() => energyManagementResult.value !== null)
  
  // 操作方法
  function setParameters(data: ParameterData) {
    parameters.value = data
  }
  
  function setCapacityOptimizationResult(result: OptimizationResult) {
    capacityOptimizationResult.value = result
  }
  
  function setSelectedSolution(solution: SolutionDetail) {
    selectedSolution.value = solution
  }
  
  function setEnergyManagementResult(result: EnergyManagementResult) {
    energyManagementResult.value = result
  }
  
  function setCurrentStep(step: 'parameters' | 'capacity' | 'energy') {
    currentStep.value = step
  }
  
  function setLoading(state: boolean) {
    loading.value = state
  }
  
  function resetCapacityResults() {
    capacityOptimizationResult.value = null
    selectedSolution.value = null
  }
  
  function resetEnergyResults() {
    energyManagementResult.value = null
  }
  
  function resetAll() {
    parameters.value = null
    capacityOptimizationResult.value = null
    selectedSolution.value = null
    energyManagementResult.value = null
    currentStep.value = 'parameters'
  }

  return {
    // 状态
    parameters,
    capacityOptimizationResult,
    selectedSolution,
    energyManagementResult,
    currentStep,
    loading,
    
    // 计算属性
    hasParameters,
    hasCapacityResult,
    hasSelectedSolution,
    hasEnergyResult,
    
    // 方法
    setParameters,
    setCapacityOptimizationResult,
    setSelectedSolution,
    setEnergyManagementResult,
    setCurrentStep,
    setLoading,
    resetCapacityResults,
    resetEnergyResults,
    resetAll
  }
})