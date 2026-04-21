<template>
  <div class="space-y-4 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">日历视图</h1>
      <button
        @click="showCreateForm = true"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
      >
        <Icon name="plus" class="w-5 h-5" />
        新建任务
      </button>
    </div>

    <!-- Calendar View -->
    <CalendarView @edit-todo="handleEditTodo" />

    <!-- Edit Modal -->
    <div v-if="editingTodo" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div class="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
          编辑任务
        </h2>
        <TodoForm
          :edit-todo="editingTodo"
          @submit="handleSubmit"
          @cancel="editingTodo = null"
        />
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateForm && !editingTodo" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div class="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
          新建任务
        </h2>
        <TodoForm
          @submit="handleCreateSubmit"
          @cancel="showCreateForm = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Icon from '../components/Icon.vue'
import { useTodosStore } from '../stores/todos'
import CalendarView from '../components/CalendarView.vue'
import TodoForm from '../components/TodoForm.vue'

const todosStore = useTodosStore()

const showCreateForm = ref(false)
const editingTodo = ref(null)

const handleEditTodo = (todo) => {
  editingTodo.value = todo
  showCreateForm.value = false
}

const handleSubmit = (todoData) => {
  if (editingTodo.value) {
    todosStore.updateTodo(editingTodo.value.id, todoData)
  }
  editingTodo.value = null
}

const handleCreateSubmit = (todoData) => {
  todosStore.createTodo(todoData)
  showCreateForm.value = false
}
</script>
