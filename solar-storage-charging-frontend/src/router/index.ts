import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/parameters',
      name: 'parameters',
      component: () => import('../views/ParameterSettings.vue'),
    },
    {
      path: '/capacity-optimization',
      name: 'capacity-optimization',
      component: () => import('../views/CapacityOptimization.vue'),
    },
    {
      path: '/energy-management',
      name: 'energy-management',
      component: () => import('../views/EnergyManagement.vue'),
    },
  ],
})

export default router
