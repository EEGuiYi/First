<template>
  <div class="energy-management">
    <div class="header">
      <el-page-header @back="goBack" title="返回主页">
        <template #content>
          <span class="page-title">能量管理优化</span>
        </template>
      </el-page-header>
    </div>

    <div class="content">
      <!-- 优化配置 -->
      <el-card class="config-section" shadow="never" v-if="!optimizationResult">
        <template #header>
          <div class="section-header">
            <el-icon><Setting /></el-icon>
            <span>能量管理优化配置</span>
          </div>
        </template>
        
        <el-form
          ref="configFormRef"
          :model="energyConfig"
          :rules="configRules"
          label-width="150px"
          class="config-form"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="运行模式" prop="mode">
                <el-select 
                  v-model="energyConfig.mode" 
                  placeholder="请选择运行模式"
                  style="width: 100%"
                  @change="onModeChange"
                >
                  <el-option label="并网模式" value="grid-connected" />
                  <el-option label="离网模式" value="off-grid" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <div class="weights-section">
            <h3>优化指标权重设置</h3>
            <p class="weights-tip">请设置各优化指标的权重，权重总和应为1.0</p>
            
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="经济成本权重" prop="weights.cost">
                  <el-slider
                    v-model="energyConfig.weights.cost"
                    :min="0"
                    :max="1"
                    :step="0.01"
                    :precision="2"
                    show-input
                    @change="validateWeights"
                  />
                </el-form-item>
              </el-col>
              
              <el-col :span="8" v-if="energyConfig.mode === 'grid-connected'">
                <el-form-item label="碳排放权重" prop="weights.emission">
                  <el-slider
                    v-model="energyConfig.weights.emission"
                    :min="0"
                    :max="1"
                    :step="0.01"
                    :precision="2"
                    show-input
                    @change="validateWeights"
                  />
                </el-form-item>
              </el-col>
              
              <el-col :span="8" v-if="energyConfig.mode === 'grid-connected'">
                <el-form-item label="能效权重" prop="weights.efficiency">
                  <el-slider
                    v-model="energyConfig.weights.efficiency"
                    :min="0"
                    :max="1"
                    :step="0.01"
                    :precision="2"
                    show-input
                    @change="validateWeights"
                  />
                </el-form-item>
              </el-col>
              
              <el-col :span="8" v-if="energyConfig.mode === 'off-grid'">
                <el-form-item label="光伏消纳率权重" prop="weights.solarUtilization">
                  <el-slider
                    v-model="energyConfig.weights.solarUtilization"
                    :min="0"
                    :max="1"
                    :step="0.01"
                    :precision="2"
                    show-input
                    @change="validateWeights"
                  />
                </el-form-item>
              </el-col>
              
              <el-col :span="8" v-if="energyConfig.mode === 'off-grid'">
                <el-form-item label="系统缺电率权重" prop="weights.powerShortage">
                  <el-slider
                    v-model="energyConfig.weights.powerShortage"
                    :min="0"
                    :max="1"
                    :step="0.01"
                    :precision="2"
                    show-input
                    @change="validateWeights"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <div class="weights-summary">
              <el-alert
                :title="`当前权重总和: ${weightsSum.toFixed(2)} ${weightsSum === 1 ? '✓' : '(需要等于1.0)'}`"
                :type="weightsSum === 1 ? 'success' : 'warning'"
                show-icon
                :closable="false"
              />
            </div>
          </div>
          
          <div class="optimization-info">
            <el-alert
              :title="energyModeInfo.title"
              :description="energyModeInfo.description"
              type="info"
              show-icon
              :closable="false"
            />
          </div>
          
          <div class="form-actions">
            <el-button type="primary" @click="startOptimization" :loading="optimizing" :disabled="weightsSum !== 1">
              <el-icon><Play /></el-icon>
              开始优化
            </el-button>
          </div>
        </el-form>
      </el-card>

      <!-- 优化结果 -->
      <div v-if="optimizationResult" class="results-section">
        <!-- 优化指标总览 -->
        <el-card class="result-card" shadow="never">
          <template #header>
            <div class="section-header">
              <el-icon><DataAnalysis /></el-icon>
              <span>优化指标结果</span>
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
          
          <el-row :gutter="20">
            <el-col :span="8">
              <el-statistic title="经济成本" :value="optimizationResult.objectives.cost" precision="2" />
            </el-col>
            <el-col :span="8" v-if="optimizationResult.objectives.emission !== undefined">
              <el-statistic title="碳排放" :value="optimizationResult.objectives.emission" precision="2" />
            </el-col>
            <el-col :span="8" v-if="optimizationResult.objectives.efficiency !== undefined">
              <el-statistic title="能效" :value="optimizationResult.objectives.efficiency" precision="2" />
            </el-col>
            <el-col :span="8" v-if="optimizationResult.objectives.solarUtilization !== undefined">
              <el-statistic title="光伏消纳率 (%)" :value="optimizationResult.objectives.solarUtilization * 100" precision="2" />
            </el-col>
            <el-col :span="8" v-if="optimizationResult.objectives.powerShortage !== undefined">
              <el-statistic title="系统缺电率 (%)" :value="optimizationResult.objectives.powerShortage * 100" precision="2" />
            </el-col>
          </el-row>
        </el-card>

        <!-- 雷达图 -->
        <el-card class="result-card" shadow="never">
          <template #header>
            <div class="section-header">
              <el-icon><Radar /></el-icon>
              <span>优化指标雷达图</span>
            </div>
          </template>
          
          <div class="radar-chart">
            <v-chart 
              :option="radarChartOption" 
              style="height: 400px;"
              autoresize
            />
          </div>
        </el-card>

        <!-- 能量流曲线 -->
        <el-card class="result-card" shadow="never">
          <template #header>
            <div class="section-header">
              <el-icon><TrendCharts /></el-icon>
              <span>能量流曲线</span>
            </div>
          </template>
          
          <div class="energy-flow-charts">
            <!-- 离网模式图表 -->
            <div v-if="energyConfig.mode === 'off-grid'">
              <el-row :gutter="20">
                <el-col :span="12">
                  <h4>光伏发电与弃光功率</h4>
                  <v-chart 
                    :option="offGridSolarChartOption" 
                    style="height: 300px;"
                    autoresize
                  />
                </el-col>
                <el-col :span="12">
                  <h4>系统负荷与缺电功率</h4>
                  <v-chart 
                    :option="offGridLoadChartOption" 
                    style="height: 300px;"
                    autoresize
                  />
                </el-col>
              </el-row>
              <el-row :gutter="20" style="margin-top: 20px;">
                <el-col :span="24">
                  <h4>储能功率及SOC曲线</h4>
                  <v-chart 
                    :option="offGridStorageChartOption" 
                    style="height: 350px;"
                    autoresize
                  />
                </el-col>
              </el-row>
            </div>

            <!-- 并网模式图表 -->
            <div v-if="energyConfig.mode === 'grid-connected'">
              <el-row :gutter="20">
                <el-col :span="12">
                  <h4>储能功率及SOC曲线</h4>
                  <v-chart 
                    :option="gridConnectedStorageChartOption" 
                    style="height: 300px;"
                    autoresize
                  />
                </el-col>
                <el-col :span="12">
                  <h4>分时电价与盈亏曲线</h4>
                  <v-chart 
                    :option="gridConnectedPriceChartOption" 
                    style="height: 300px;"
                    autoresize
                  />
                </el-col>
              </el-row>
              <el-row :gutter="20" style="margin-top: 20px;">
                <el-col :span="12">
                  <h4>直流侧能量来源与去向</h4>
                  <v-chart 
                    :option="dcEnergyFlowChartOption" 
                    style="height: 300px;"
                    autoresize
                  />
                </el-col>
                <el-col :span="12">
                  <h4>交流侧能量来源与去向</h4>
                  <v-chart 
                    :option="acEnergyFlowChartOption" 
                    style="height: 300px;"
                    autoresize
                  />
                </el-col>
              </el-row>
            </div>
          </div>
        </el-card>

        <!-- 操作按钮 -->
        <div class="result-actions">
          <el-button type="success" size="large" @click="confirmResult">
            <el-icon><Check /></el-icon>
            确认方案
          </el-button>
          <el-button size="large" @click="reOptimize">
            <el-icon><Refresh /></el-icon>
            重新优化
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElForm } from 'element-plus'
import { Setting, Play, DataAnalysis, TrendCharts, Radar, Check, Refresh } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { apiService } from '@/services/api'
import type { EnergyManagementWeights, EnergyManagementResult } from '@/services/api'

const router = useRouter()
const appStore = useAppStore()
const configFormRef = ref<InstanceType<typeof ElForm>>()

// 状态变量
const optimizing = ref(false)
const optimizationResult = ref<EnergyManagementResult | null>(null)

// 能量管理配置
const energyConfig = reactive({
  mode: 'grid-connected' as 'grid-connected' | 'off-grid',
  weights: {
    cost: 0.4,
    emission: 0.3,
    efficiency: 0.3,
    solarUtilization: 0.5,
    powerShortage: 0.5
  } as EnergyManagementWeights
})

// 表单验证规则
const configRules = {
  mode: [{ required: true, message: '请选择运行模式', trigger: 'change' }]
}

// 计算属性
const weightsSum = computed(() => {
  if (energyConfig.mode === 'grid-connected') {
    return energyConfig.weights.cost + (energyConfig.weights.emission || 0) + (energyConfig.weights.efficiency || 0)
  } else {
    return energyConfig.weights.cost + (energyConfig.weights.solarUtilization || 0) + (energyConfig.weights.powerShortage || 0)
  }
})

const energyModeInfo = computed(() => {
  if (energyConfig.mode === 'grid-connected') {
    return {
      title: '并网模式能量管理',
      description: '优化目标：经济成本、碳排放、能效。系统可与电网进行双向能量交换，优化买卖电策略。'
    }
  } else {
    return {
      title: '离网模式能量管理',
      description: '优化目标：经济成本、光伏消纳率、系统缺电率。系统独立运行，重点优化能量平衡和供电可靠性。'
    }
  }
})

// 雷达图配置
const radarChartOption = computed(() => {
  if (!optimizationResult.value) return {}
  
  const indicators = []
  const data = []
  
  if (energyConfig.mode === 'grid-connected') {
    indicators.push(
      { name: '经济成本', max: 1 },
      { name: '碳排放', max: 1 },
      { name: '能效', max: 1 }
    )
    data.push(
      optimizationResult.value.objectives.cost || 0,
      optimizationResult.value.objectives.emission || 0,
      optimizationResult.value.objectives.efficiency || 0
    )
  } else {
    indicators.push(
      { name: '经济成本', max: 1 },
      { name: '光伏消纳率', max: 1 },
      { name: '系统缺电率', max: 1 }
    )
    data.push(
      optimizationResult.value.objectives.cost || 0,
      optimizationResult.value.objectives.solarUtilization || 0,
      1 - (optimizationResult.value.objectives.powerShortage || 0) // 转换为正向指标
    )
  }
  
  return {
    title: {
      text: '优化指标雷达图',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    radar: {
      indicator: indicators,
      radius: '70%'
    },
    series: [{
      type: 'radar',
      data: [{
        value: data,
        name: '优化结果',
        itemStyle: {
          color: '#409eff'
        },
        areaStyle: {
          opacity: 0.3
        }
      }]
    }]
  }
})

// 离网模式 - 光伏发电与弃光功率图表
const offGridSolarChartOption = computed(() => {
  if (!optimizationResult.value || energyConfig.mode !== 'off-grid') return {}
  
  return {
    title: { text: '光伏发电与弃光功率', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { top: 30 },
    xAxis: {
      type: 'category',
      data: optimizationResult.value.energyFlows.time,
      name: '时间(h)'
    },
    yAxis: {
      type: 'value',
      name: '功率(kW)'
    },
    series: [
      {
        name: '光伏发电功率',
        type: 'line',
        data: optimizationResult.value.energyFlows.solarPower,
        smooth: true,
        lineStyle: { color: '#e6a23c' }
      },
      {
        name: '弃光功率',
        type: 'line',
        data: optimizationResult.value.energyFlows.solarCurtailment,
        smooth: true,
        lineStyle: { color: '#f56c6c' }
      }
    ]
  }
})

// 离网模式 - 系统负荷与缺电功率图表
const offGridLoadChartOption = computed(() => {
  if (!optimizationResult.value || energyConfig.mode !== 'off-grid') return {}
  
  return {
    title: { text: '系统负荷与缺电功率', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { top: 30 },
    xAxis: {
      type: 'category',
      data: optimizationResult.value.energyFlows.time,
      name: '时间(h)'
    },
    yAxis: {
      type: 'value',
      name: '功率(kW)'
    },
    series: [
      {
        name: '系统负荷',
        type: 'line',
        data: optimizationResult.value.energyFlows.systemLoad,
        smooth: true,
        lineStyle: { color: '#67c23a' }
      },
      {
        name: '缺电功率',
        type: 'line',
        data: optimizationResult.value.energyFlows.powerShortage,
        smooth: true,
        lineStyle: { color: '#f56c6c' }
      }
    ]
  }
})

// 离网模式 - 储能功率及SOC曲线
const offGridStorageChartOption = computed(() => {
  if (!optimizationResult.value || energyConfig.mode !== 'off-grid') return {}
  
  return {
    title: { text: '储能功率及SOC曲线', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { top: 30 },
    xAxis: {
      type: 'category',
      data: optimizationResult.value.energyFlows.time,
      name: '时间(h)'
    },
    yAxis: [
      {
        type: 'value',
        name: '功率(kW)',
        position: 'left'
      },
      {
        type: 'value',
        name: 'SOC(%)',
        position: 'right',
        min: 0,
        max: 100
      }
    ],
    series: [
      {
        name: '直流储能功率',
        type: 'line',
        data: optimizationResult.value.energyFlows.dcStoragePower,
        smooth: true,
        lineStyle: { color: '#409eff' }
      },
      {
        name: '交流储能功率',
        type: 'line',
        data: optimizationResult.value.energyFlows.acStoragePower,
        smooth: true,
        lineStyle: { color: '#67c23a' }
      },
      {
        name: '直流储能SOC',
        type: 'line',
        yAxisIndex: 1,
        data: optimizationResult.value.energyFlows.dcSoc?.map(v => v * 100),
        smooth: true,
        lineStyle: { color: '#e6a23c', type: 'dashed' }
      },
      {
        name: '交流储能SOC',
        type: 'line',
        yAxisIndex: 1,
        data: optimizationResult.value.energyFlows.acSoc?.map(v => v * 100),
        smooth: true,
        lineStyle: { color: '#f56c6c', type: 'dashed' }
      }
    ]
  }
})

// 并网模式 - 储能功率及SOC曲线
const gridConnectedStorageChartOption = computed(() => {
  if (!optimizationResult.value || energyConfig.mode !== 'grid-connected') return {}
  
  return {
    title: { text: '储能功率及SOC曲线', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { top: 30 },
    xAxis: {
      type: 'category',
      data: optimizationResult.value.energyFlows.time,
      name: '时间(h)'
    },
    yAxis: [
      {
        type: 'value',
        name: '功率(kW)',
        position: 'left'
      },
      {
        type: 'value',
        name: 'SOC(%)',
        position: 'right',
        min: 0,
        max: 100
      }
    ],
    series: [
      {
        name: '直流储能功率',
        type: 'line',
        data: optimizationResult.value.energyFlows.dcStoragePower,
        smooth: true,
        lineStyle: { color: '#409eff' }
      },
      {
        name: '交流储能功率',
        type: 'line',
        data: optimizationResult.value.energyFlows.acStoragePower,
        smooth: true,
        lineStyle: { color: '#67c23a' }
      },
      {
        name: '直流储能SOC',
        type: 'line',
        yAxisIndex: 1,
        data: optimizationResult.value.energyFlows.dcSoc?.map(v => v * 100),
        smooth: true,
        lineStyle: { color: '#e6a23c', type: 'dashed' }
      },
      {
        name: '交流储能SOC',
        type: 'line',
        yAxisIndex: 1,
        data: optimizationResult.value.energyFlows.acSoc?.map(v => v * 100),
        smooth: true,
        lineStyle: { color: '#f56c6c', type: 'dashed' }
      }
    ]
  }
})

// 并网模式 - 分时电价与盈亏曲线
const gridConnectedPriceChartOption = computed(() => {
  if (!optimizationResult.value || energyConfig.mode !== 'grid-connected') return {}
  
  return {
    title: { text: '分时电价与盈亏曲线', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { top: 30 },
    xAxis: {
      type: 'category',
      data: optimizationResult.value.energyFlows.time,
      name: '时间(h)'
    },
    yAxis: [
      {
        type: 'value',
        name: '电价(元/kWh)',
        position: 'left'
      },
      {
        type: 'value',
        name: '盈亏(元)',
        position: 'right'
      }
    ],
    series: [
      {
        name: '分时电价',
        type: 'line',
        data: optimizationResult.value.energyFlows.electricityPrice,
        smooth: true,
        lineStyle: { color: '#909399' }
      },
      {
        name: '盈亏',
        type: 'bar',
        yAxisIndex: 1,
        data: optimizationResult.value.energyFlows.profitLoss,
        itemStyle: {
          color: (params: any) => params.value >= 0 ? '#67c23a' : '#f56c6c'
        }
      }
    ]
  }
})

// 并网模式 - 直流侧能量来源与去向
const dcEnergyFlowChartOption = computed(() => {
  if (!optimizationResult.value || energyConfig.mode !== 'grid-connected') return {}
  
  return {
    title: { text: '直流侧能量来源与去向', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { top: 30 },
    xAxis: {
      type: 'category',
      data: optimizationResult.value.energyFlows.time,
      name: '时间(h)'
    },
    yAxis: {
      type: 'value',
      name: '能量(kWh)'
    },
    series: [
      {
        name: '直流侧能量来源',
        type: 'bar',
        stack: 'source',
        data: optimizationResult.value.energyFlows.dcEnergySource,
        itemStyle: { color: '#409eff' }
      },
      {
        name: '直流侧能量去向',
        type: 'bar',
        stack: 'destination',
        data: optimizationResult.value.energyFlows.dcEnergyDestination?.map(v => -v),
        itemStyle: { color: '#f56c6c' }
      }
    ]
  }
})

// 并网模式 - 交流侧能量来源与去向
const acEnergyFlowChartOption = computed(() => {
  if (!optimizationResult.value || energyConfig.mode !== 'grid-connected') return {}
  
  return {
    title: { text: '交流侧能量来源与去向', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { top: 30 },
    xAxis: {
      type: 'category',
      data: optimizationResult.value.energyFlows.time,
      name: '时间(h)'
    },
    yAxis: {
      type: 'value',
      name: '能量(kWh)'
    },
    series: [
      {
        name: '交流侧能量来源',
        type: 'bar',
        stack: 'source',
        data: optimizationResult.value.energyFlows.acEnergySource,
        itemStyle: { color: '#67c23a' }
      },
      {
        name: '交流侧能量去向',
        type: 'bar',
        stack: 'destination',
        data: optimizationResult.value.energyFlows.acEnergyDestination?.map(v => -v),
        itemStyle: { color: '#e6a23c' }
      }
    ]
  }
})

// 方法
const goBack = () => {
  router.push('/')
}

const onModeChange = () => {
  // 切换模式时重置权重
  if (energyConfig.mode === 'grid-connected') {
    energyConfig.weights = {
      cost: 0.4,
      emission: 0.3,
      efficiency: 0.3,
      solarUtilization: undefined,
      powerShortage: undefined
    }
  } else {
    energyConfig.weights = {
      cost: 0.4,
      emission: undefined,
      efficiency: undefined,
      solarUtilization: 0.3,
      powerShortage: 0.3
    }
  }
}

const validateWeights = () => {
  // 权重验证已通过computed property实现
}

const startOptimization = async () => {
  try {
    await configFormRef.value?.validate()
    
    if (weightsSum.value !== 1) {
      ElMessage.warning('权重总和必须等于1.0')
      return
    }
    
    optimizing.value = true
    ElMessage.info('开始进行能量管理优化，请稍候...')
    
    // 调用后端API进行优化
    const result = await apiService.optimizeEnergyManagement(energyConfig.weights, energyConfig.mode)
    optimizationResult.value = result
    appStore.setEnergyManagementResult(result)
    
    ElMessage.success('能量管理优化完成')
    
  } catch (error) {
    console.error('Energy optimization error:', error)
    ElMessage.error('优化失败，请检查参数设置')
  } finally {
    optimizing.value = false
  }
}

const reOptimize = () => {
  optimizationResult.value = null
  appStore.resetEnergyResults()
}

const confirmResult = async () => {
  try {
    await ElMessageBox.confirm(
      '确定确认当前能量管理优化方案吗？',
      '确认方案',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success',
      }
    )
    
    ElMessage.success('方案确认成功！系统配置完成。')
    
    // 跳转回主页或其他页面
    setTimeout(() => {
      router.push('/')
    }, 1500)
    
  } catch {
    ElMessage.info('已取消确认')
  }
}

// 监听权重变化，自动调整
watch(() => energyConfig.weights, () => {
  // 可以在这里添加权重自动调整逻辑
}, { deep: true })

// 组件挂载时检查状态
onMounted(() => {
  if (!appStore.hasSelectedSolution) {
    ElMessage.warning('请先完成容量优化配置')
    router.push('/capacity-optimization')
    return
  }
  
  // 如果已有能量管理结果，恢复状态
  if (appStore.hasEnergyResult) {
    optimizationResult.value = appStore.energyManagementResult
  }
})
</script>

<style scoped>
.energy-management {
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

.weights-section {
  margin: 30px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.weights-section h3 {
  margin-bottom: 15px;
  color: #333;
  border-bottom: 2px solid #409eff;
  padding-bottom: 10px;
}

.weights-tip {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.weights-summary {
  margin-top: 20px;
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

.radar-chart {
  width: 100%;
  display: flex;
  justify-content: center;
}

.energy-flow-charts h4 {
  margin-bottom: 15px;
  color: #666;
  font-size: 1rem;
  text-align: center;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
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

:deep(.el-slider__input) {
  width: 80px;
}

@media (max-width: 768px) {
  .energy-management {
    padding: 10px;
  }
  
  .config-form {
    padding: 20px;
  }
  
  .weights-section {
    padding: 15px;
  }
}
</style>