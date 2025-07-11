<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Setting, DataAnalysis, TrendCharts, RefreshRight } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const appStore = useAppStore()

const currentStepIndex = computed(() => {
  if (appStore.hasEnergyResult) return 3
  if (appStore.hasSelectedSolution) return 2
  if (appStore.hasParameters) return 1
  return 0
})

const navigateToParameters = () => {
  router.push('/parameters')
}

const navigateToCapacity = () => {
  if (!appStore.hasParameters) {
    ElMessage.warning('请先完成参数设置')
    return
  }
  router.push('/capacity-optimization')
}

const navigateToEnergy = () => {
  if (!appStore.hasSelectedSolution) {
    ElMessage.warning('请先完成容量优化配置')
    return
  }
  router.push('/energy-management')
}

const resetSystem = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置整个系统吗？这将清除所有已配置的数据。',
      '确认重置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    appStore.resetAll()
    ElMessage.success('系统已重置')
  } catch {
    ElMessage.info('已取消重置')
  }
}
</script>

<template>
  <div class="home-container">
    <div class="header">
      <h1 class="title">光储充一体化系统配置与能量管理优化</h1>
      <p class="subtitle">Solar-Storage-Charging Integrated System Configuration and Energy Management Optimization</p>
    </div>
    
    <div class="modules-grid">
      <el-card 
        class="module-card" 
        shadow="hover"
        :class="{ 'completed': appStore.hasParameters }"
        @click="navigateToParameters"
      >
        <template #header>
          <div class="card-header">
            <el-icon class="module-icon"><Setting /></el-icon>
            <span class="module-title">参数设置</span>
            <el-tag v-if="appStore.hasParameters" type="success" size="small">已完成</el-tag>
          </div>
        </template>
        <div class="card-content">
          <p>设置系统背景信息、配置范围和导入基础数据曲线</p>
          <ul class="feature-list">
            <li>背景信息设置（园区面积、电动汽车保有量）</li>
            <li>配置范围设置（直交流侧光伏、储能、充电桩）</li>
            <li>曲线数据导入（光照、车流量、负荷数据）</li>
          </ul>
        </div>
      </el-card>

      <el-card 
        class="module-card" 
        shadow="hover"
        :class="{ 
          'completed': appStore.hasSelectedSolution,
          'disabled': !appStore.hasParameters 
        }"
        @click="navigateToCapacity"
      >
        <template #header>
          <div class="card-header">
            <el-icon class="module-icon"><DataAnalysis /></el-icon>
            <span class="module-title">容量优化配置</span>
            <el-tag v-if="appStore.hasSelectedSolution" type="success" size="small">已完成</el-tag>
            <el-tag v-else-if="!appStore.hasParameters" type="info" size="small">等待参数设置</el-tag>
          </div>
        </template>
        <div class="card-content">
          <p>基于NSGA算法进行容量配置优化</p>
          <ul class="feature-list">
            <li>选择微电网运行模式（并网/离网）</li>
            <li>设置种群规模和迭代次数</li>
            <li>三维帕累托前沿图展示</li>
            <li>方案对比与能量流分析</li>
          </ul>
        </div>
      </el-card>

      <el-card 
        class="module-card" 
        shadow="hover"
        :class="{ 
          'completed': appStore.hasEnergyResult,
          'disabled': !appStore.hasSelectedSolution 
        }"
        @click="navigateToEnergy"
      >
        <template #header>
          <div class="card-header">
            <el-icon class="module-icon"><TrendCharts /></el-icon>
            <span class="module-title">能量管理优化</span>
            <el-tag v-if="appStore.hasEnergyResult" type="success" size="small">已完成</el-tag>
            <el-tag v-else-if="!appStore.hasSelectedSolution" type="info" size="small">等待容量配置</el-tag>
          </div>
        </template>
        <div class="card-content">
          <p>基于多目标优化的能量管理策略</p>
          <ul class="feature-list">
            <li>优化指标权重设置</li>
            <li>能量流曲线展示</li>
            <li>优化指标雷达图分析</li>
            <li>方案确认与重新优化</li>
          </ul>
        </div>
      </el-card>
    </div>

    <div class="progress-section" v-if="appStore.hasParameters">
      <el-steps :active="currentStepIndex" finish-status="success" align-center>
        <el-step title="参数设置" description="系统基础参数配置"></el-step>
        <el-step title="容量优化" description="设备容量配置优化"></el-step>
        <el-step title="能量管理" description="运行策略优化"></el-step>
      </el-steps>
    </div>

    <div class="action-section">
      <el-button 
        type="danger" 
        :icon="RefreshRight" 
        @click="resetSystem"
        v-if="appStore.hasParameters"
      >
        重置系统
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  text-align: center;
  margin-bottom: 60px;
  color: white;
}

.title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
  max-width: 1400px;
  width: 100%;
  margin-bottom: 60px;
}

.module-card {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 280px;
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.module-card.completed {
  border-color: #67c23a;
}

.module-card.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.module-card.disabled:hover {
  transform: none;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.module-icon {
  font-size: 24px;
  color: #409eff;
}

.module-title {
  font-size: 1.3rem;
  font-weight: bold;
  flex: 1;
}

.card-content {
  height: 180px;
  overflow: hidden;
}

.card-content p {
  font-size: 1rem;
  color: #666;
  margin-bottom: 15px;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  color: #888;
  position: relative;
  padding-left: 20px;
}

.feature-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #409eff;
  font-weight: bold;
}

.progress-section {
  margin-bottom: 40px;
  width: 100%;
  max-width: 800px;
}

.action-section {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }
  
  .modules-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .module-card {
    height: auto;
    min-height: 250px;
  }
}
</style>
