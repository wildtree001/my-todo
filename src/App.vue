<template>
  <div class="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors">
    <!-- Top Navigation -->
    <nav class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-none">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <RouterLink to="/" class="text-xl font-bold text-blue-500">
            MyTodo
          </RouterLink>

          <!-- Desktop Nav -->
          <div class="hidden md:flex items-center gap-1">
            <RouterLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                $route.path === item.to
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              {{ item.label }}
            </RouterLink>
          </div>

          <!-- Mobile Menu Button -->
          <button
            @click="showMobileMenu = !showMobileMenu"
            class="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Icon name="menu" class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Mobile Nav -->
      <div v-if="showMobileMenu" class="md:hidden border-t border-gray-200 dark:border-gray-700 px-4 py-2 space-y-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          @click="showMobileMenu = false"
          :class="[
            'block px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            $route.path === item.to
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          ]"
        >
          {{ item.label }}
        </RouterLink>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto">
      <div class="max-w-7xl mx-auto px-4 py-6">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import Icon from './components/Icon.vue'

const route = useRoute()
const showMobileMenu = ref(false)

const navItems = [
  { to: '/', label: '仪表盘' },
  { to: '/tasks', label: '任务' },
  { to: '/calendar', label: '日历' },
  { to: '/statistics', label: '统计' },
  { to: '/settings', label: '设置' }
]
</script>
