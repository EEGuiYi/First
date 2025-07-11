<template>
  <div class="capacity-optimization">
    <div class="header">
      <el-page-header @back="goBack" title="返回主页">
        <template #content>
          <span class="page-title">容量优化配置</span>
        </template>
      </el-page-header>
    </div>

    <div class="content">
      <!-- 优化配置 -->
      <el-card class="config-section" shadow="never" v-if="!optimizationResult">
        <template #header>
          <div class="section-header">
            <el-icon><Setting /></el-icon>
            <span>优化配置</span>
          </div>
        </template>
        
        <el-form
          ref="configFormRef"
          :model="optimizationConfig"
          :rules="configRules"
          label-width="150px"
          class="config-form"
        >
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="运行模式" prop="mode">
                <el-select 
                  v-model="optimizationConfig.mode" 
                  placeholder="请选择运行模式"
                  style="width: 100%"
                >
                  <el-option label="并网模式" value="grid-connected" />
                  <el-option label="离网模式" value="off-grid" />
                </el-select>
              </el-form-item>
            </el-col>
            
            <el-col :span="8">
              <el-form-item label="种群规模" prop="populationSize">
                <el-input-number
                  v-model="optimizationConfig.populationSize"
                  :min="10"
                  :max="500"
                  :step="10"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            
            <el-col :span="8">
              <el-form-item label="迭代次数" prop="maxIterations">
                <el-input-number
                  v-model="optimizationConfig.maxIterations"
                  :min="10"
                  :max="1000"
                  :step="10"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <div class="optimization-info">
            <el-alert
              :title="optimizationModeInfo.title"
              :description="optimizationModeInfo.description"
              type="info"
              show-icon
              :closable="false"
            />
          </div>
          
          <div class="form-actions">
            <el-button type="primary" @click="startOptimization" :loading="optimizing">
              <el-icon><Play /></el-icon>
              开始优化
            </el-button>
          </div>
        </el-form>
      </el-card>

      <!-- 优化结果 -->
      <div v-if="optimizationResult" class="results-section">
        <!-- 帕累托前沿图 -->
        <el-card class="result-card" shadow="never">
          <template #header>
            <div class="section-header">
              <el-icon><DataAnalysis /></el-icon>
              <span>三维帕累托前沿图</span>
              <el-button 
                type="primary" 
                size="small" 
                @click="reOptimize"
                style="margin-left: auto"
              >
                重新优化
              </el-button>
            </div>
          </template>
          
          <div class="pareto-chart">
            <v-chart 
              :option="paretoChartOption" 
              style="height: 500px;"
              autoresize
              @click="onParetoPointClick"
            />
          </div>
          
          <div class="objective-legend">
            <el-tag type="primary">X轴: {{ objectiveLabels.x }}</el-tag>
            <el-tag type="success">Y轴: {{ objectiveLabels.y }}</el-tag>
            <el-tag type="warning">Z轴: {{ objectiveLabels.z }}</el-tag>
          </div>
        </el-card>

        <!-- 方案列表 -->
        <el-card class="result-card" shadow="never">
          <template #header>
            <div class="section-header">
              <el-icon><List /></el-icon>
              <span>优化方案列表</span>
            </div>
          </template>
          
          <el-table
            :data="optimizationResult.solutions"
            style="width: 100%"
            highlight-current-row
            @current-change="onSolutionSelect"
            :current-row-key="selectedSolutionId"
            row-key="id"
          >
            <el-table-column prop="id" label="方案ID" width="120" />
            <el-table-column 
              :prop="`objectives[0]`" 
              :label="objectiveLabels.x" 
              width="150"
              :formatter="(row) => row.objectives[0].toFixed(4)"
            />
            <el-table-column 
              :prop="`objectives[1]`" 
              :label="objectiveLabels.y" 
              width="150"
              :formatter="(row) => row.objectives[1].toFixed(4)"
            />
            <el-table-column 
              :prop="`objectives[2]`" 
              :label="objectiveLabels.z" 
              width="150"
              :formatter="(row) => row.objectives[2].toFixed(4)"
            />
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="viewSolutionDetail(scope.row.id)"
                  :loading="loadingDetailId === scope.row.id"
                >
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 方案详情 -->
        <el-card class="result-card" shadow="never" v-if="solutionDetail">
          <template #header>
            <div class="section-header">
              <el-icon><InfoFilled /></el-icon>
              <span>方案详情 - {{ solutionDetail.id }}</span>
              <div style="margin-left: auto; display: flex; gap: 10px;">
                <el-button type="success" @click="confirmSolution">确认方案</el-button>
                <el-button @click="clearSolutionDetail">关闭详情</el-button>
              </div>
            </div>
          </template>
          
          <!-- 配置参数 -->
          <div class="solution-details">
            <h3>配置参数</h3>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-statistic title="直流侧光伏 (kW)" :value="solutionDetail.configParams.dcPv" />
              </el-col>
              <el-col :span="8">
                <el-statistic title="交流侧光伏 (kW)" :value="solutionDetail.configParams.acPv" />
              </el-col>
              <el-col :span="8">
                <el-statistic title="直流侧储能 (kWh)" :value="solutionDetail.configParams.dcStorage" />
              </el-col>
            </el-row>
            <el-row :gutter="20" style="margin-top: 20px;">
              <el-col :span="8">
                <el-statistic title="交流侧储能 (kWh)" :value="solutionDetail.configParams.acStorage" />
              </el-col>
              <el-col :span="8">
                <el-statistic title="直流侧充电桩 (kW)" :value="solutionDetail.configParams.dcCharging" />
              </el-col>
              <el-col :span="8">
                <el-statistic title="交流侧充电桩 (kW)" :value="solutionDetail.configParams.acCharging" />
              </el-col>
            </el-row>
          </div>

          <!-- 优化指标 -->
          <div class="solution-objectives">
            <h3>优化指标</h3>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-statistic title="经济成本" :value="solutionDetail.objectives.cost" precision="2" />
              </el-col>
              <el-col :span="8" v-if="solutionDetail.objectives.emission !== undefined">
                <el-statistic title="碳排放" :value="solutionDetail.objectives.emission" precision="2" />
              </el-col>
              <el-col :span="8">
                <el-statistic title="弃光率 (%)" :value="solutionDetail.objectives.solarCurtailment * 100" precision="2" />
              </el-col>
              <el-col :span="8" v-if="solutionDetail.objectives.powerShortage !== undefined">
                <el-statistic title="缺电率 (%)" :value="solutionDetail.objectives.powerShortage * 100" precision="2" />
              </el-col>
            </el-row>
          </div>

          <!-- 能量流曲线 -->
          <div class="energy-flows">
            <h3>能量流曲线</h3>
            <el-row :gutter="20">
              <el-col :span="12">
                <h4>储能SOC曲线</h4>
                <v-chart 
                  :option="socChartOption" 
                  style="height: 300px;"
                  autoresize
                />
              </el-col>
              <el-col :span="12">
                <h4>光伏发电功率曲线</h4>
                <v-chart 
                  :option="solarChartOption" 
                  style="height: 300px;"
                  autoresize
                />
              </el-col>
            </el-row>
            <el-row :gutter="20" style="margin-top: 20px;">
              <el-col :span="12">
                <h4>直流侧负荷曲线</h4>
                <v-chart 
                  :option="dcLoadChartOption" 
                  style="height: 300px;"
                  autoresize
                />
              </el-col>
              <el-col :span="12">
                <h4>交流侧负荷曲线</h4>
                <v-chart 
                  :option="acLoadChartOption" 
                  style="height: 300px;"
                  autoresize
                />
              </el-col>
            </el-row>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElForm } from 'element-plus'
import { Setting, Play, DataAnalysis, List, InfoFilled } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { apiService } from '@/services/api'
import type { OptimizationConfig, OptimizationResult, SolutionDetail } from '@/services/api'

const router = useRouter()
const appStore = useAppStore()
const configFormRef = ref<InstanceType<typeof ElForm>>()

// 状态变量
const optimizing = ref(false)
const loadingDetailId = ref<string | null>(null)
const selectedSolutionId = ref<string | null>(null)
const optimizationResult = ref<OptimizationResult | null>(null)
const solutionDetail = ref<SolutionDetail | null>(null)

// 优化配置
const optimizationConfig = reactive<OptimizationConfig>({
  mode: 'grid-connected',
  populationSize: 100,
  maxIterations: 50
})

// 表单验证规则
const configRules = {
  mode: [{ required: true, message: '请选择运行模式', trigger: 'change' }],
  populationSize: [
    { required: true, message: '请输入种群规模', trigger: 'blur' },
    { type: 'number', min: 10, max: 500, message: '种群规模应在10-500之间', trigger: 'blur' }
  ],
  maxIterations: [
    { required: true, message: '请输入迭代次数', trigger: 'blur' },
    { type: 'number', min: 10, max: 1000, message: '迭代次数应在10-1000之间', trigger: 'blur' }
  ]
}

// 计算属性
const optimizationModeInfo = computed(() => {
  if (optimizationConfig.mode === 'grid-connected') {
    return {
      title: '并网模式优化',
      description: '优化目标：经济成本、碳排放、弃光率。适用于与电网连接的场景，可以进行买卖电交易。'
    }
  } else {
    return {
      title: '离网模式优化',
      description: '优化目标：经济成本、弃光率、缺电率。适用于独立运行的场景，需要保证供电可靠性。'
    }
  }
})

const objectiveLabels = computed(() => {
  if (optimizationConfig.mode === 'grid-connected') {
    return {
      x: '经济成本标幺值',
      y: '碳排放标幺值',
      z: '弃光率标幺值'
    }
  } else {
    return {
      x: '经济成本标幺值',
      y: '弃光率标幺值',
      z: '缺电率标幺值'
    }
  }
})

// 帕累托前沿图配置
const paretoChartOption = computed(() => {
  if (!optimizationResult.value) return {}
  
  const data = optimizationResult.value.paretoFront.map(point => [point.x, point.y, point.z])
  
  return {
    title: {
      text: '三维帕累托前沿',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const point = optimizationResult.value?.paretoFront[params.dataIndex]
        return `方案ID: ${point?.solutionId}<br/>
                ${objectiveLabels.value.x}: ${params.value[0].toFixed(4)}<br/>
                ${objectiveLabels.value.y}: ${params.value[1].toFixed(4)}<br/>
                ${objectiveLabels.value.z}: ${params.value[2].toFixed(4)}`
      }
    },
    xAxis3D: {
      type: 'value',
      name: objectiveLabels.value.x
    },
    yAxis3D: {
      type: 'value',
      name: objectiveLabels.value.y
    },
    zAxis3D: {
      type: 'value',
      name: objectiveLabels.value.z
    },
    grid3D: {
      viewControl: {
        projection: 'perspective'
      }
    },
    series: [{
      type: 'scatter3D',
      data: data,
      symbolSize: 8,
      itemStyle: {
        color: '#409eff',
        opacity: 0.8
      },
      emphasis: {
        itemStyle: {
          color: '#f56c6c',
          opacity: 1
        }
      }
    }]
  }
})

// SOC曲线图配置
const socChartOption = computed(() => {
  if (!solutionDetail.value) return {}
  
  return {
    title: { text: '储能SOC变化', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { top: 30 },
    xAxis: {
      type: 'category',
      data: solutionDetail.value.energyFlows.time,
      name: '时间(h)'
    },
    yAxis: {
      type: 'value',
      name: 'SOC (%)',
      min: 0,
      max: 100
    },
    series: [
      {
        name: '直流侧储能SOC',
        type: 'line',
        data: solutionDetail.value.energyFlows.dcSoc.map(v => v * 100),
        smooth: true,
        lineStyle: { color: '#409eff' }
      },
      {
        name: '交流侧储能SOC',
        type: 'line',
        data: solutionDetail.value.energyFlows.acSoc.map(v => v * 100),
        smooth: true,
        lineStyle: { color: '#67c23a' }
      }
    ]
  }
})

// 光伏发电功率曲线配置
const solarChartOption = computed(() => {
  if (!solutionDetail.value) return {}
  
  return {
    title: { text: '光伏发电功率', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: solutionDetail.value.energyFlows.time,
      name: '时间(h)'
    },
    yAxis: {
      type: 'value',
      name: '功率(kW)'
    },
    series: [{
      name: '光伏发电功率',
      type: 'line',
      data: solutionDetail.value.energyFlows.solarPower,
      smooth: true,
      areaStyle: { opacity: 0.3 },
      lineStyle: { color: '#e6a23c' }
    }]
  }
})

// 直流侧负荷曲线配置
const dcLoadChartOption = computed(() => {
  if (!solutionDetail.value) return {}
  
  return {
    title: { text: '直流侧负荷需求', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: solutionDetail.value.energyFlows.time,
      name: '时间(h)'
    },
    yAxis: {
      type: 'value',
      name: '负荷(kW)'
    },
    series: [{
      name: '直流侧负荷',
      type: 'line',
      data: solutionDetail.value.energyFlows.dcLoad,
      smooth: true,
      lineStyle: { color: '#909399' }
    }]
  }
})

// 交流侧负荷曲线配置
const acLoadChartOption = computed(() => {
  if (!solutionDetail.value) return {}
  
  return {
    title: { text: '交流侧负荷需求', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: solutionDetail.value.energyFlows.time,
      name: '时间(h)'
    },
    yAxis: {
      type: 'value',
      name: '负荷(kW)'
    },
    series: [{
      name: '交流侧负荷',
      type: 'line',
      data: solutionDetail.value.energyFlows.acLoad,
      smooth: true,
      lineStyle: { color: '#f56c6c' }
    }]
  }
})

// 方法
const goBack = () => {
  router.push('/')
}

const startOptimization = async () => {
  try {
    await configFormRef.value?.validate()
    optimizing.value = true
    
    ElMessage.info('开始进行容量优化，请稍候...')
    
    // 调用后端API进行优化
    const result = await apiService.optimizeCapacity(optimizationConfig)
    optimizationResult.value = result
    appStore.setCapacityOptimizationResult(result)
    
    ElMessage.success('容量优化完成')
    
  } catch (error) {
    console.error('Optimization error:', error)
    ElMessage.error('优化失败，请检查参数设置')
  } finally {
    optimizing.value = false
  }
}

const reOptimize = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重新进行优化吗？这将清除当前结果。',
      '确认重新优化',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    optimizationResult.value = null
    solutionDetail.value = null
    selectedSolutionId.value = null
    appStore.resetCapacityResults()
    
  } catch {
    ElMessage.info('已取消重新优化')
  }
}

const onParetoPointClick = (params: any) => {
  if (optimizationResult.value) {
    const point = optimizationResult.value.paretoFront[params.dataIndex]
    selectedSolutionId.value = point.solutionId
    viewSolutionDetail(point.solutionId)
  }
}

const onSolutionSelect = (currentRow: any) => {
  if (currentRow) {
    selectedSolutionId.value = currentRow.id
  }
}

const viewSolutionDetail = async (solutionId: string) => {
  try {
    loadingDetailId.value = solutionId
    
    const detail = await apiService.getSolutionDetail(solutionId, optimizationConfig.mode)
    solutionDetail.value = detail
    
  } catch (error) {
    console.error('Get solution detail error:', error)
    ElMessage.error('获取方案详情失败')
  } finally {
    loadingDetailId.value = null
  }
}

const clearSolutionDetail = () => {
  solutionDetail.value = null
  selectedSolutionId.value = null
}

const confirmSolution = async () => {
  if (!solutionDetail.value) return
  
  try {
    await ElMessageBox.confirm(
      `确定选择方案 ${solutionDetail.value.id} 吗？确认后将进入能量管理优化阶段。`,
      '确认方案',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success',
      }
    )
    
    // 调用API确认方案
    await apiService.confirmSolution(solutionDetail.value.id)
    
    // 保存到store
    appStore.setSelectedSolution(solutionDetail.value)
    appStore.setCurrentStep('energy')
    
    ElMessage.success('方案确认成功')
    
    // 跳转到能量管理页面
    setTimeout(() => {
      router.push('/energy-management')
    }, 1000)
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Confirm solution error:', error)
      ElMessage.error('方案确认失败')
    } else {
      ElMessage.info('已取消确认')
    }
  }
}

// 组件挂载时检查是否有参数
onMounted(() => {
  if (!appStore.hasParameters) {
    ElMessage.warning('请先完成参数设置')
    router.push('/parameters')
    return
  }
  
  // 如果已有优化结果，恢复状态
  if (appStore.hasCapacityResult) {
    optimizationResult.value = appStore.capacityOptimizationResult
  }
})
</script>

<style scoped>
.capacity-optimization {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.content {
  max-width: 1400px;
  margin: 0 auto;
}

.config-section,
.result-card {
  margin-bottom: 20px;
}

.config-form {
  background: white;
  padding: 30px;
  border-radius: 8px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  font-weight: bold;
}

.optimization-info {
  margin: 20px 0;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.results-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pareto-chart {
  width: 100%;
  margin-bottom: 20px;
}

.objective-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
}

.solution-details,
.solution-objectives,
.energy-flows {
  margin-bottom: 30px;
}

.solution-details h3,
.solution-objectives h3,
.energy-flows h3 {
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #409eff;
  padding-bottom: 10px;
}

.energy-flows h4 {
  margin-bottom: 15px;
  color: #666;
  font-size: 1rem;
}

:deep(.el-card__header) {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-statistic__content) {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .capacity-optimization {
    padding: 10px;
  }
  
  .config-form {
    padding: 20px;
  }
}
</style>