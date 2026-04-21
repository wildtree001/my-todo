<template>
  <div
    :class="[
      'p-4 rounded-lg border transition-all duration-200',
      todo.completed
        ? 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
        : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-sm hover:shadow-md'
    ]"
  >
    <div class="flex items-start gap-3">
      <!-- Checkbox -->
      <button
        @click="$emit('toggle', todo.id)"
        :class="[
          'flex-shrink-0 w-5 h-5 rounded border transition-colors',
          todo.completed
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
        ]"
      >
        <Icon v-if="todo.completed" name="check" class="w-5 h-5" />
      </button>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <h3
            :class="[
              'font-medium text-gray-900 dark:text-white',
              todo.completed && 'line-through text-gray-500 dark:text-gray-400'
            ]"
          >
            {{ todo.title }}
          </h3>
          <PriorityBadge :priority="todo.priority" />
        </div>

        <p v-if="todo.description" class="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {{ todo.description }}
        </p>

        <!-- Meta info -->
        <div class="mt-2 flex items-center gap-4 flex-wrap text-sm text-gray-500 dark:text-gray-400">
          <!-- Time Period -->
          <span v-if="todo.startDate && todo.endDate">
            <Icon name="clock" class="w-4 h-4 inline" />
            {{ formatDate(todo.startDate) }} - {{ formatDate(todo.endDate) }}
          </span>
          <span v-else-if="todo.startDate">
            <Icon name="clock" class="w-4 h-4 inline" />
            开始: {{ formatDate(todo.startDate) }}
          </span>
          <span v-else-if="todo.endDate">
            <Icon name="clock" class="w-4 h-4 inline" />
            结束: {{ formatDate(todo.endDate) }}
          </span>
          
          <!-- Due Date -->
          <span v-if="todo.dueDate" :class="{ 'text-red-500': isOverdue }">
            <Icon name="calendar" class="w-4 h-4 inline" />
            截止: {{ formatDate(todo.dueDate) }}
            <span v-if="isOverdue" class="text-red-500">(已逾期)</span>
          </span>
          
          <!-- Categories -->
          <span v-if="todo.categories.length > 0" class="flex items-center gap-1">
            <Icon name="tag" class="w-4 h-4" />
            <span
              v-for="catId in todo.categories"
              :key="catId"
              class="px-2 py-0.5 rounded-full text-xs"
              :style="{ backgroundColor: getCategoryColor(catId) + '20', color: getCategoryColor(catId) }"
            >
              {{ getCategoryName(catId) }}
            </span>
          </span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-1">
        <button
          @click="$emit('edit', todo)"
          class="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
        >
          <Icon name="pencil" class="w-4 h-4" />
        </button>
        <button
          @click="$emit('delete', todo.id)"
          class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
        >
          <Icon name="trash" class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Icon from './Icon.vue'
import PriorityBadge from './PriorityBadge.vue'
import { useCategoriesStore } from '../stores/categories'

const props = defineProps({
  todo: {
    type: Object,
    required: true
  }
})

defineEmits(['toggle', 'edit', 'delete'])

const categoriesStore = useCategoriesStore()

const isOverdue = computed(() => {
  if (!props.todo.dueDate || props.todo.completed) return false
  return new Date(props.todo.dueDate) < new Date()
})

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const getCategoryName = (id) => {
  const cat = categoriesStore.categories.find(c => c.id === id)
  return cat ? cat.name : id
}

const getCategoryColor = (id) => {
  const cat = categoriesStore.categories.find(c => c.id === id)
  return cat ? cat.color : '#6B7280'
}
</script>
