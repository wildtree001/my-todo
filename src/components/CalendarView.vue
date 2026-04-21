<template>
  <div class="calendar-view bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
    <!-- Calendar Header -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <button
          @click="navigate(-1)"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Icon name="chevron-left" class="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <button
          @click="navigate(1)"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Icon name="chevron-right" class="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ currentPeriodLabel }}
        </h2>
        <button
          @click="goToToday"
          class="px-3 py-1 text-sm text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          今天
        </button>
      </div>
      
      <div class="flex items-center gap-2">
        <!-- View Toggle -->
        <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            @click="viewMode = 'month'"
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              viewMode === 'month'
                ? 'bg-white dark:bg-gray-600 text-blue-500 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            ]"
          >
            月
          </button>
          <button
            @click="viewMode = 'week'"
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              viewMode === 'week'
                ? 'bg-white dark:bg-gray-600 text-blue-500 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            ]"
          >
            周
          </button>
        </div>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="p-4">
      <!-- Day Headers -->
      <div class="grid grid-cols-7 mb-2">
        <div
          v-for="day in weekDays"
          :key="day"
          class="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
        >
          {{ day }}
        </div>
      </div>

      <!-- Calendar Cells -->
      <div
        v-if="viewMode === 'month'"
        class="grid grid-cols-7 gap-1"
      >
        <div
          v-for="(day, index) in monthDays"
          :key="index"
          class="min-h-24 border border-gray-200 dark:border-gray-700 rounded-lg p-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          :class="{
            'bg-gray-50 dark:bg-gray-800/50': !day.isCurrentMonth,
            'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800': day.isToday,
            'bg-blue-100 dark:bg-blue-900/40': day.isSelected
          }"
          @click="selectDate(day)"
        >
          <div class="flex justify-between items-start mb-1">
            <span
              :class="[
                'text-sm font-medium',
                day.isToday ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300',
                !day.isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : ''
              ]"
            >
              {{ day.dayNumber }}
            </span>
            <span v-if="day.todos.length > 0" class="text-xs text-gray-500 dark:text-gray-400">
              {{ day.todos.length }}
            </span>
          </div>
          <div class="space-y-1">
            <div
              v-for="todo in day.todos.slice(0, 3)"
              :key="todo.id"
              class="text-xs p-1 rounded cursor-move"
              :class="[
                'hover:opacity-80',
                todo.completed ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 line-through' :
                todo.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                todo.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                todo.priority === 'low' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              ]"
              draggable="true"
              @dragstart="handleDragStart($event, todo)"
              @dragover.prevent
              @drop="handleDrop($event, day)"
              @click.stop="handleTodoClick(todo)"
            >
              <div class="font-medium truncate">{{ todo.title }}</div>
              <div v-if="todo.startDate" class="text-xs opacity-75 truncate">
                <Icon name="clock" class="w-3 h-3 inline" />
                {{ formatTime(todo.startDate) }}
                <span v-if="todo.endDate"> - {{ formatTime(todo.endDate) }}</span>
              </div>
            </div>
            <div v-if="day.todos.length > 3" class="text-xs text-gray-500 dark:text-gray-400 text-center">
              +{{ day.todos.length - 3 }} 更多
            </div>
          </div>
        </div>
      </div>

      <!-- Week View -->
      <div
        v-else
        class="overflow-x-auto"
      >
        <div class="min-w-[800px]">
          <!-- Day Headers -->
          <div class="grid grid-cols-8 gap-1 mb-2">
            <div class="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
              时间
            </div>
            <div
              v-for="day in weekDaysData"
              :key="day.dateStr"
              class="text-center text-sm font-medium py-2"
              :class="[
                day.isToday ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300',
                day.isSelected ? 'bg-blue-100 dark:bg-blue-900/40 rounded-lg' : ''
              ]"
            >
              <div>{{ day.dayName }}</div>
              <div :class="day.isToday ? 'font-bold' : ''">{{ day.dayNumber }}</div>
            </div>
          </div>

          <!-- Time Grid with Absolute Positioned Tasks -->
          <div class="grid grid-cols-8 gap-1">
            <!-- Time Labels Column -->
            <div class="space-y-1">
              <div
                v-for="hour in timeSlots"
                :key="hour"
                class="h-14 flex items-center justify-end pr-2"
              >
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ hour.toString().padStart(2, '0') }}:00
                </span>
              </div>
            </div>

            <!-- Day Columns -->
            <div
              v-for="(day, dayIndex) in weekDaysData"
              :key="day.dateStr"
              class="relative"
              @dragover.prevent
              @drop="handleWeekViewDrop($event, day)"
            >
              <!-- Grid Background Cells -->
              <div class="space-y-1">
                <div
                  v-for="hour in timeSlots"
                  :key="hour"
                  class="h-14 border border-gray-200 dark:border-gray-700 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  :class="[
                    day.isToday ? 'bg-blue-50 dark:bg-blue-900/20' : '',
                    day.isSelected ? 'bg-blue-100 dark:bg-blue-900/40' : ''
                  ]"
                  @click="selectDate(day, hour)"
                >
                </div>
              </div>

              <!-- Tasks Layer (Absolute Positioned) -->
              <div class="absolute inset-0 pointer-events-none">
                <div
                  v-for="todo in getTasksForDay(day)"
                  :key="todo.id"
                  class="pointer-events-auto absolute left-0.5 right-0.5 rounded px-1 py-0.5 cursor-move text-xs z-10 overflow-hidden"
                  :class="[
                    'hover:opacity-90 transition-all shadow-sm',
                    todo.completed ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 line-through' :
                    todo.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' :
                    todo.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800' :
                    todo.priority === 'low' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                  ]"
                  :style="getTaskPositionStyle(todo)"
                  draggable="true"
                  @dragstart="handleDragStart($event, todo)"
                  @click.stop="handleTodoClick(todo)"
                >
                  <div class="font-medium truncate">{{ todo.title }}</div>
                  <div v-if="todo.startDate && todo.endDate && getTaskDuration(todo) >= 1" class="text-xs opacity-75 truncate">
                    {{ formatTime(todo.startDate) }} - {{ formatTime(todo.endDate) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Detail Modal -->
    <div v-if="showTaskModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div class="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">任务详情</h3>
          <button
            @click="closeTaskModal"
            class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Icon name="x" class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div v-if="selectedTodo" class="space-y-4">
          <div>
            <h4
              :class="[
                'text-xl font-medium',
                selectedTodo.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'
              ]"
            >
              {{ selectedTodo.title }}
            </h4>
            <p v-if="selectedTodo.description" class="mt-1 text-gray-600 dark:text-gray-400">
              {{ selectedTodo.description }}
            </p>
          </div>
          
          <div class="space-y-2 text-sm">
            <div v-if="selectedTodo.startDate || selectedTodo.endDate" class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Icon name="clock" class="w-4 h-4" />
              <span>
                <span v-if="selectedTodo.startDate">{{ formatDateTime(selectedTodo.startDate) }}</span>
                <span v-if="selectedTodo.startDate && selectedTodo.endDate"> - </span>
                <span v-if="selectedTodo.endDate">{{ formatDateTime(selectedTodo.endDate) }}</span>
              </span>
            </div>
            
            <div v-if="selectedTodo.dueDate" class="flex items-center gap-2" :class="isOverdue ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'">
              <Icon name="calendar" class="w-4 h-4" />
              <span>截止: {{ formatDateTime(selectedTodo.dueDate) }}</span>
              <span v-if="isOverdue" class="text-red-500">(已逾期)</span>
            </div>
            
            <div class="flex items-center gap-2">
              <span class="text-gray-600 dark:text-gray-400">优先级:</span>
              <PriorityBadge :priority="selectedTodo.priority" />
            </div>
            
            <div v-if="selectedTodo.categories.length > 0" class="flex items-center gap-2">
              <Icon name="tag" class="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="catId in selectedTodo.categories"
                  :key="catId"
                  class="px-2 py-0.5 rounded-full text-xs"
                  :style="{ backgroundColor: getCategoryColor(catId) + '20', color: getCategoryColor(catId) }"
                >
                  {{ getCategoryName(catId) }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="flex gap-2 pt-4 border-t dark:border-gray-700">
            <button
              @click="toggleTodoComplete"
              :class="[
                'flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2',
                selectedTodo.completed
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  : 'bg-green-500 text-white hover:bg-green-600'
              ]"
            >
              <Icon name="check" class="w-4 h-4" />
              {{ selectedTodo.completed ? '标记未完成' : '标记完成' }}
            </button>
            <button
              @click="editTodo"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Icon name="pencil" class="w-4 h-4" />
              编辑
            </button>
            <button
              @click="deleteTodo"
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <Icon name="trash" class="w-4 h-4" />
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Task Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div class="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          新建任务 - {{ selectedDateLabel }}
        </h3>
        <TodoForm
          @submit="handleCreateSubmit"
          @cancel="showCreateModal = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useTodosStore } from '../stores/todos'
import { useCategoriesStore } from '../stores/categories'
import Icon from './Icon.vue'
import PriorityBadge from './PriorityBadge.vue'
import TodoForm from './TodoForm.vue'

const emit = defineEmits(['edit-todo'])

const todosStore = useTodosStore()
const categoriesStore = useCategoriesStore()

// View mode: 'month' or 'week'
const viewMode = ref('month')

// Current date
const currentDate = ref(new Date())

// Selected date
const selectedDate = ref(null)
const selectedHour = ref(null)

// Modals
const showTaskModal = ref(false)
const showCreateModal = ref(false)
const selectedTodo = ref(null)

// Drag and drop
const draggedTodo = ref(null)
const dragOffsetPixels = ref(0)
const hourHeight = 60 // px (h-14 = 56px + 4px gap)

// Week days
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// Time slots for week view
const timeSlots = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]

// Current period label
const currentPeriodLabel = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  if (viewMode.value === 'month') {
    return `${year}年${month + 1}月`
  } else {
    const weekStart = getWeekStart(currentDate.value)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    const startMonth = weekStart.getMonth() + 1
    const endMonth = weekEnd.getMonth() + 1
    if (startMonth === endMonth) {
      return `${year}年${startMonth}月 第${getWeekNumber(currentDate.value)}周`
    } else {
      return `${year}年${startMonth}月-${endMonth}月 第${getWeekNumber(currentDate.value)}周`
    }
  }
})

// Get week start (Sunday)
const getWeekStart = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

// Get week number
const getWeekNumber = (date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
}

// Month days for calendar
const monthDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  // First day of the month
  const firstDay = new Date(year, month, 1)
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0)
  
  // Start from the Sunday before the first day of the month
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < 42; i++) {
    const currentDay = new Date(startDate)
    currentDay.setDate(startDate.getDate() + i)
    
    const dateStr = currentDay.toISOString().split('T')[0]
    const isCurrentMonth = currentDay.getMonth() === month
    const isToday = currentDay.toDateString() === today.toDateString()
    const isSelected = selectedDate.value && 
      currentDay.toDateString() === selectedDate.value.toDateString()
    
    // Get todos for this day
    const dayTodos = todosStore.todos.filter(todo => {
      const todoDate = todo.startDate || todo.dueDate
      if (!todoDate) return false
      const todoDateStr = new Date(todoDate).toISOString().split('T')[0]
      return todoDateStr === dateStr
    })
    
    days.push({
      date: currentDay,
      dateStr,
      dayNumber: currentDay.getDate(),
      dayName: weekDays[currentDay.getDay()],
      isCurrentMonth,
      isToday,
      isSelected,
      todos: dayTodos
    })
  }
  
  return days
})

// Week days data for week view
const weekDaysData = computed(() => {
  const weekStart = getWeekStart(currentDate.value)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const days = []
  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(weekStart)
    currentDay.setDate(weekStart.getDate() + i)
    
    const dateStr = currentDay.toISOString().split('T')[0]
    const isToday = currentDay.toDateString() === today.toDateString()
    const isSelected = selectedDate.value && 
      currentDay.toDateString() === selectedDate.value.toDateString()
    
    // Get todos for this day
    const dayTodos = todosStore.todos.filter(todo => {
      const todoDate = todo.startDate || todo.dueDate
      if (!todoDate) return false
      const todoDateStr = new Date(todoDate).toISOString().split('T')[0]
      return todoDateStr === dateStr
    })
    
    days.push({
      date: currentDay,
      dateStr,
      dayNumber: currentDay.getDate(),
      dayName: weekDays[currentDay.getDay()],
      isToday,
      isSelected,
      todos: dayTodos
    })
  }
  
  return days
})

// Selected date label
const selectedDateLabel = computed(() => {
  if (!selectedDate.value) return ''
  const date = selectedDate.value
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dayName = weekDays[date.getDay()]
  if (selectedHour.value !== null) {
    return `${year}年${month}月${day}日 周${dayName} ${selectedHour.value.toString().padStart(2, '0')}:00`
  }
  return `${year}年${month}月${day}日 周${dayName}`
})

// Is overdue
const isOverdue = computed(() => {
  if (!selectedTodo.value || !selectedTodo.value.dueDate || selectedTodo.value.completed) return false
  return new Date(selectedTodo.value.dueDate) < new Date()
})

// Navigate
const navigate = (direction) => {
  if (viewMode.value === 'month') {
    currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth() + direction,
      1
    )
  } else {
    currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth(),
      currentDate.value.getDate() + direction * 7
    )
  }
}

// Go to today
const goToToday = () => {
  currentDate.value = new Date()
}

// Select date
const selectDate = (day, hour = null) => {
  selectedDate.value = day.date
  selectedHour.value = hour
  
  // Show create modal
  showCreateModal.value = true
}

// Handle todo click
const handleTodoClick = (todo) => {
  selectedTodo.value = todo
  showTaskModal.value = true
}

// Close task modal
const closeTaskModal = () => {
  showTaskModal.value = false
  selectedTodo.value = null
}

// Toggle todo complete
const toggleTodoComplete = () => {
  if (selectedTodo.value) {
    todosStore.toggleComplete(selectedTodo.value.id)
    closeTaskModal()
  }
}

// Edit todo
const editTodo = () => {
  if (selectedTodo.value) {
    emit('edit-todo', selectedTodo.value)
    closeTaskModal()
  }
}

// Delete todo
const deleteTodo = () => {
  if (selectedTodo.value && confirm('确定要删除这个任务吗？')) {
    todosStore.deleteTodo(selectedTodo.value.id)
    closeTaskModal()
  }
}

// Handle create submit
const handleCreateSubmit = (todoData) => {
  // If we have a selected date, use it as default
  if (selectedDate.value) {
    if (!todoData.startDate && selectedHour.value !== null) {
      const startDate = new Date(selectedDate.value)
      startDate.setHours(selectedHour.value, 0, 0, 0)
      todoData.startDate = startDate.toISOString()
      
      // Default end time is 1 hour later
      const endDate = new Date(startDate)
      endDate.setHours(endDate.getHours() + 1)
      todoData.endDate = endDate.toISOString()
    } else if (!todoData.startDate) {
      todoData.startDate = selectedDate.value.toISOString()
    }
  }
  
  todosStore.createTodo(todoData)
  showCreateModal.value = false
  selectedDate.value = null
  selectedHour.value = null
}

// Drag and drop handlers
const handleDragStart = (event, todo) => {
  draggedTodo.value = todo
  event.dataTransfer.effectAllowed = 'move'
  
  // Calculate mouse offset within the task element
  // This helps when dragging a multi-hour task - the grab point should be preserved
  const rect = event.target.getBoundingClientRect()
  dragOffsetPixels.value = event.clientY - rect.top
}

// Handle drop for month view
const handleDrop = (event, day, hour = null) => {
  if (!draggedTodo.value) return
  
  const todo = draggedTodo.value
  const updates = {}
  
  // Update start date
  if (hour !== null) {
    const newStartDate = new Date(day.date)
    newStartDate.setHours(hour, 0, 0, 0)
    updates.startDate = newStartDate.toISOString()
    
    // Calculate duration and update end date
    if (todo.startDate && todo.endDate) {
      const duration = new Date(todo.endDate) - new Date(todo.startDate)
      const newEndDate = new Date(newStartDate.getTime() + duration)
      updates.endDate = newEndDate.toISOString()
    }
  } else {
    // For month view, update the date and keep time precision to hour
    const newStartDate = new Date(day.date)
    if (todo.startDate) {
      const oldStart = new Date(todo.startDate)
      newStartDate.setHours(oldStart.getHours(), 0, 0, 0)
    } else {
      // Default to current hour if no start time
      newStartDate.setMinutes(0, 0, 0)
    }
    updates.startDate = newStartDate.toISOString()
    
    // Update end date if exists - keep duration, precision to hour
    if (todo.endDate) {
      const oldEnd = new Date(todo.endDate)
      const oldStart = new Date(todo.startDate || Date.now())
      const duration = oldEnd - oldStart
      
      const newEndDate = new Date(newStartDate.getTime() + duration)
      // Ensure precision to hour
      newEndDate.setMinutes(0, 0, 0)
      updates.endDate = newEndDate.toISOString()
    }
  }
  
  todosStore.updateTodo(todo.id, updates)
  draggedTodo.value = null
}

// Get todos for time slot (for compatibility)
const getTodosForTimeSlot = (day, hour) => {
  return day.todos.filter(todo => {
    if (!todo.startDate) return false
    const startHour = new Date(todo.startDate).getHours()
    return startHour === hour
  })
}

// Get all tasks for a specific day
const getTasksForDay = (day) => {
  return day.todos.filter(todo => todo.startDate)
}

// Get task duration in hours
const getTaskDuration = (todo) => {
  if (!todo.startDate || !todo.endDate) return 1
  const start = new Date(todo.startDate)
  const end = new Date(todo.endDate)
  const durationMs = end - start
  const durationHours = durationMs / (1000 * 60 * 60)
  return Math.max(durationHours, 1)
}

// Calculate task position style for week view
const getTaskPositionStyle = (todo) => {
  if (!todo.startDate) return {}
  
  const startHour = new Date(todo.startDate).getHours()
  const duration = getTaskDuration(todo)
  
  const top = startHour * hourHeight
  const height = duration * hourHeight - 4 // subtract one gap
  
  return {
    top: `${top}px`,
    height: `${height}px`
  }
}

// Handle drop for week view (with position-based hour calculation)
const handleWeekViewDrop = (event, day) => {
  if (!draggedTodo.value) return
  
  const todo = draggedTodo.value
  
  // Get the column container element
  const columnEl = event.currentTarget
  const rect = columnEl.getBoundingClientRect()
  
  // Calculate mouse position relative to the column top
  // The position includes the gap between time slots
  const relativeY = event.clientY - rect.top
  
  // Calculate which hour the mouse is over
  // Each hour slot is hourHeight pixels (including gap)
  const mouseHour = Math.floor(relativeY / hourHeight)
  
  // Calculate the offset in hours (where the user grabbed the task)
  const offsetHours = dragOffsetPixels.value / hourHeight
  
  // Calculate new start hour: mouse hour minus the grab offset
  // This ensures the grab point aligns with the mouse position
  let newStartHour = mouseHour - offsetHours
  
  // Clamp to valid range (0-23)
  newStartHour = Math.max(0, Math.min(23, Math.round(newStartHour)))
  
  // Calculate duration
  let durationHours = 1
  if (todo.startDate && todo.endDate) {
    const start = new Date(todo.startDate)
    const end = new Date(todo.endDate)
    const durationMs = end - start
    durationHours = durationMs / (1000 * 60 * 60)
    durationHours = Math.max(durationHours, 1)
  }
  
  // Calculate new end hour (clamped to 24 for end of day)
  let newEndHour = newStartHour + durationHours
  
  // Create new dates
  const newStartDate = new Date(day.date)
  newStartDate.setHours(newStartHour, 0, 0, 0)
  
  const updates = {
    startDate: newStartDate.toISOString()
  }
  
  if (todo.endDate) {
    const newEndDate = new Date(day.date)
    // If end hour exceeds 24, it will roll over to next day
    // But we keep it within the same day for simplicity
    newEndDate.setHours(Math.min(newEndHour, 24), 0, 0, 0)
    updates.endDate = newEndDate.toISOString()
  }
  
  todosStore.updateTodo(todo.id, updates)
  draggedTodo.value = null
  dragOffsetPixels.value = 0
}

// Format time (hour only)
const formatTime = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format date time
const formatDateTime = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Get category name
const getCategoryName = (id) => {
  const cat = categoriesStore.categories.find(c => c.id === id)
  return cat ? cat.name : id
}

// Get category color
const getCategoryColor = (id) => {
  const cat = categoriesStore.categories.find(c => c.id === id)
  return cat ? cat.color : '#6B7280'
}
</script>
