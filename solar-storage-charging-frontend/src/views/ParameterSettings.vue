<template>
  <div class="parameter-settings">
    <div class="header">
      <el-page-header @back="goBack" title="返回主页">
        <template #content>
          <span class="page-title">参数设置</span>
        </template>
      </el-page-header>
    </div>

    <div class="content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="150px"
        class="parameter-form"
      >
        <!-- 背景信息 -->
        <el-card class="form-section" shadow="never">
          <template #header>
            <div class="section-header">
              <el-icon><InfoFilled /></el-icon>
              <span>背景信息</span>
            </div>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="园区面积" prop="backgroundInfo.area">
                <el-input-number
                  v-model="formData.backgroundInfo.area"
                  :min="0"
                  :precision="2"
                  placeholder="请输入园区面积"
                  style="width: 100%"
                />
                <template #append>m²</template>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="电动汽车保有量" prop="backgroundInfo.evCount">
                <el-input-number
                  v-model="formData.backgroundInfo.evCount"
                  :min="0"
                  placeholder="请输入电动汽车保有量"
                  style="width: 100%"
                />
                <template #append>辆</template>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- 配置范围 -->
        <el-card class="form-section" shadow="never">
          <template #header>
            <div class="section-header">
              <el-icon><Setting /></el-icon>
              <span>配置范围</span>
            </div>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="8">
              <h4>直流侧光伏 (kW)</h4>
              <el-form-item label="最小值" prop="configRange.dcPv.min">
                <el-input-number
                  v-model="formData.configRange.dcPv.min"
                  :min="0"
                  :precision="1"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="最大值" prop="configRange.dcPv.max">
                <el-input-number
                  v-model="formData.configRange.dcPv.max"
                  :min="formData.configRange.dcPv.min"
                  :precision="1"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            
            <el-col :span="8">
              <h4>交流侧光伏 (kW)</h4>
              <el-form-item label="最小值" prop="configRange.acPv.min">
                <el-input-number
                  v-model="formData.configRange.acPv.min"
                  :min="0"
                  :precision="1"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="最大值" prop="configRange.acPv.max">
                <el-input-number
                  v-model="formData.configRange.acPv.max"
                  :min="formData.configRange.acPv.min"
                  :precision="1"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            
            <el-col :span="8">
              <h4>直流侧储能 (kWh)</h4>
              <el-form-item label="最小值" prop="configRange.dcStorage.min">
                <el-input-number
                  v-model="formData.configRange.dcStorage.min"
                  :min="0"
                  :precision="1"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="最大值" prop="configRange.dcStorage.max">
                <el-input-number
                  v-model="formData.configRange.dcStorage.max"
                  :min="formData.configRange.dcStorage.min"
                  :precision="1"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="8">
              <h4>交流侧储能 (kWh)</h4>
              <el-form-item label="最小值" prop="configRange.acStorage.min">
                <el-input-number
                  v-model="formData.configRange.acStorage.min"
                  :min="0"
                  :precision="1"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="最大值" prop="configRange.acStorage.max">
                <el-input-number
                  v-model="formData.configRange.acStorage.max"
                  :min="formData.configRange.acStorage.min"
                  :precision="1"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            
            <el-col :span="8">
              <h4>直流侧充电桩 (kW)</h4>
              <el-form-item label="最小值" prop="configRange.dcCharging.min">
                <el-input-number
                  v-model="formData.configRange.dcCharging.min"
                  :min="0"
                  :precision="1"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="最大值" prop="configRange.dcCharging.max">
                <el-input-number
                  v-model="formData.configRange.dcCharging.max"
                  :min="formData.configRange.dcCharging.min"
                  :precision="1"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            
            <el-col :span="8">
              <h4>交流侧充电桩 (kW)</h4>
              <el-form-item label="最小值" prop="configRange.acCharging.min">
                <el-input-number
                  v-model="formData.configRange.acCharging.min"
                  :min="0"
                  :precision="1"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="最大值" prop="configRange.acCharging.max">
                <el-input-number
                  v-model="formData.configRange.acCharging.max"
                  :min="formData.configRange.acCharging.min"
                  :precision="1"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- 曲线导入 -->
        <el-card class="form-section" shadow="never">
          <template #header>
            <div class="section-header">
              <el-icon><Upload /></el-icon>
              <span>曲线导入</span>
            </div>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="光照数据">
                <el-upload
                  class="upload-demo"
                  drag
                  accept=".xlsx,.xls"
                  :auto-upload="false"
                  :on-change="(file) => handleFileUpload(file, 'solarData')"
                  :file-list="fileList.solarData"
                  :limit="1"
                >
                  <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                  <div class="el-upload__text">
                    将文件拖到此处，或<em>点击上传</em>
                  </div>
                  <template #tip>
                    <div class="el-upload__tip">
                      只能上传xlsx/xls文件，且不超过5MB
                    </div>
                  </template>
                </el-upload>
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="车流量数据">
                <el-upload
                  class="upload-demo"
                  drag
                  accept=".xlsx,.xls"
                  :auto-upload="false"
                  :on-change="(file) => handleFileUpload(file, 'trafficData')"
                  :file-list="fileList.trafficData"
                  :limit="1"
                >
                  <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                  <div class="el-upload__text">
                    将文件拖到此处，或<em>点击上传</em>
                  </div>
                  <template #tip>
                    <div class="el-upload__tip">
                      只能上传xlsx/xls文件，且不超过5MB
                    </div>
                  </template>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="直流侧负荷数据">
                <el-upload
                  class="upload-demo"
                  drag
                  accept=".xlsx,.xls"
                  :auto-upload="false"
                  :on-change="(file) => handleFileUpload(file, 'dcLoadData')"
                  :file-list="fileList.dcLoadData"
                  :limit="1"
                >
                  <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                  <div class="el-upload__text">
                    将文件拖到此处，或<em>点击上传</em>
                  </div>
                  <template #tip>
                    <div class="el-upload__tip">
                      只能上传xlsx/xls文件，且不超过5MB
                    </div>
                  </template>
                </el-upload>
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="交流侧负荷数据">
                <el-upload
                  class="upload-demo"
                  drag
                  accept=".xlsx,.xls"
                  :auto-upload="false"
                  :on-change="(file) => handleFileUpload(file, 'acLoadData')"
                  :file-list="fileList.acLoadData"
                  :limit="1"
                >
                  <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                  <div class="el-upload__text">
                    将文件拖到此处，或<em>点击上传</em>
                  </div>
                  <template #tip>
                    <div class="el-upload__tip">
                      只能上传xlsx/xls文件，且不超过5MB
                    </div>
                  </template>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- 曲线预览 -->
        <el-card class="form-section" shadow="never" v-if="hasAnyChart">
          <template #header>
            <div class="section-header">
              <el-icon><TrendCharts /></el-icon>
              <span>数据预览</span>
            </div>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="12" v-if="charts.solarData.data.length > 0">
              <h4>光照数据</h4>
              <v-chart 
                :option="charts.solarData" 
                style="height: 300px;"
                autoresize
              />
            </el-col>
            
            <el-col :span="12" v-if="charts.trafficData.data.length > 0">
              <h4>车流量数据</h4>
              <v-chart 
                :option="charts.trafficData" 
                style="height: 300px;"
                autoresize
              />
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12" v-if="charts.dcLoadData.data.length > 0">
              <h4>直流侧负荷数据</h4>
              <v-chart 
                :option="charts.dcLoadData" 
                style="height: 300px;"
                autoresize
              />
            </el-col>
            
            <el-col :span="12" v-if="charts.acLoadData.data.length > 0">
              <h4>交流侧负荷数据</h4>
              <v-chart 
                :option="charts.acLoadData" 
                style="height: 300px;"
                autoresize
              />
            </el-col>
          </el-row>
        </el-card>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <el-button @click="resetForm">重置</el-button>
          <el-button type="primary" @click="saveParameters" :loading="loading">
            保存参数
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElForm } from 'element-plus'
import { InfoFilled, Setting, Upload, UploadFilled, TrendCharts } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { apiService } from '@/services/api'
import * as XLSX from 'xlsx'

const router = useRouter()
const appStore = useAppStore()
const formRef = ref<InstanceType<typeof ElForm>>()
const loading = ref(false)

// 表单数据
const formData = reactive({
  backgroundInfo: {
    area: 10000,
    evCount: 100
  },
  configRange: {
    dcPv: { min: 0, max: 1000 },
    acPv: { min: 0, max: 1000 },
    dcStorage: { min: 0, max: 2000 },
    acStorage: { min: 0, max: 2000 },
    dcCharging: { min: 0, max: 500 },
    acCharging: { min: 0, max: 500 }
  },
  curves: {
    solarData: { time: [], value: [] },
    trafficData: { time: [], value: [] },
    dcLoadData: { time: [], value: [] },
    acLoadData: { time: [], value: [] }
  }
})

// 文件列表
const fileList = reactive({
  solarData: [],
  trafficData: [],
  dcLoadData: [],
  acLoadData: []
})

// 图表配置
const charts = reactive({
  solarData: {
    title: { text: '光照强度', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', name: '时间(h)' },
    yAxis: { type: 'value', name: '光照强度(W/m²)' },
    series: [{ type: 'line', data: [], smooth: true }],
    data: []
  },
  trafficData: {
    title: { text: '车流量', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', name: '时间(h)' },
    yAxis: { type: 'value', name: '车流量(辆/h)' },
    series: [{ type: 'line', data: [], smooth: true }],
    data: []
  },
  dcLoadData: {
    title: { text: '直流侧负荷', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', name: '时间(h)' },
    yAxis: { type: 'value', name: '负荷(kW)' },
    series: [{ type: 'line', data: [], smooth: true }],
    data: []
  },
  acLoadData: {
    title: { text: '交流侧负荷', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', name: '时间(h)' },
    yAxis: { type: 'value', name: '负荷(kW)' },
    series: [{ type: 'line', data: [], smooth: true }],
    data: []
  }
})

// 表单验证规则
const rules = {
  'backgroundInfo.area': [
    { required: true, message: '请输入园区面积', trigger: 'blur' },
    { type: 'number', min: 0, message: '园区面积必须大于0', trigger: 'blur' }
  ],
  'backgroundInfo.evCount': [
    { required: true, message: '请输入电动汽车保有量', trigger: 'blur' },
    { type: 'number', min: 0, message: '电动汽车保有量必须大于等于0', trigger: 'blur' }
  ]
}

// 计算属性
const hasAnyChart = computed(() => {
  return Object.values(charts).some(chart => chart.data.length > 0)
})

// 方法
const goBack = () => {
  router.push('/')
}

const handleFileUpload = (file: any, type: keyof typeof fileList) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      
      // 处理数据，假设第一列是时间，第二列是数值
      const timeData: number[] = []
      const valueData: number[] = []
      
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[]
        if (row.length >= 2 && row[0] !== undefined && row[1] !== undefined) {
          timeData.push(Number(row[0]))
          valueData.push(Number(row[1]))
        }
      }
      
      formData.curves[type] = { time: timeData, value: valueData }
      updateChart(type, timeData, valueData)
      
      ElMessage.success(`${file.name} 上传成功`)
    } catch (error) {
      ElMessage.error('文件解析失败，请检查文件格式')
      console.error('File parsing error:', error)
    }
  }
  reader.readAsArrayBuffer(file.raw)
}

const updateChart = (type: keyof typeof charts, timeData: number[], valueData: number[]) => {
  const chartData = timeData.map((time, index) => [time, valueData[index]])
  charts[type].series[0].data = chartData
  charts[type].data = chartData
  charts[type].xAxis.data = timeData
}

const resetForm = () => {
  formRef.value?.resetFields()
  Object.keys(fileList).forEach(key => {
    fileList[key as keyof typeof fileList] = []
  })
  Object.keys(charts).forEach(key => {
    charts[key as keyof typeof charts].data = []
    charts[key as keyof typeof charts].series[0].data = []
  })
}

const saveParameters = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true
    
    // 调用API保存参数
    await apiService.saveParameters(formData)
    
    // 保存到store
    appStore.setParameters(formData)
    appStore.setCurrentStep('capacity')
    
    ElMessage.success('参数保存成功')
    
    // 跳转到容量优化页面
    setTimeout(() => {
      router.push('/capacity-optimization')
    }, 1000)
    
  } catch (error) {
    console.error('Save parameters error:', error)
    ElMessage.error('参数保存失败')
  } finally {
    loading.value = false
  }
}

// 如果已有参数，加载它们
if (appStore.hasParameters && appStore.parameters) {
  Object.assign(formData, appStore.parameters)
}
</script>

<style scoped>
.parameter-settings {
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
  max-width: 1200px;
  margin: 0 auto;
}

.parameter-form {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.form-section {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  font-weight: bold;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

:deep(.el-card__header) {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: 120px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1rem;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

@media (max-width: 768px) {
  .parameter-settings {
    padding: 10px;
  }
  
  .parameter-form {
    padding: 20px;
  }
}
</style>