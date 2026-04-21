import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loadTodos, saveTodos } from '../utils/storage'

export const useTodosStore = defineStore('todos', () => {
  const todos = ref(loadTodos())
  const filter = ref({
    status: 'all', // all, active, completed
    priority: 'all', // all, high, medium, low, none
    category: 'all',
    search: '',
    sortBy: 'createdAt', // createdAt, dueDate, priority, custom
    sortOrder: 'desc' // asc, desc
  })

  // Generate unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Create todo
  const createTodo = (todoData) => {
    const newTodo = {
      id: generateId(),
      title: todoData.title,
      description: todoData.description || '',
      completed: false,
      priority: todoData.priority || 'none', // high, medium, low, none
      categories: todoData.categories || [],
      dueDate: todoData.dueDate || null,
      startDate: todoData.startDate || null,
      endDate: todoData.endDate || null,
      recurrence: todoData.recurrence || null, // daily, weekly, monthly, yearly, custom
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null
    }
    todos.value.push(newTodo)
    saveTodos(todos.value)
    return newTodo
  }

  // Update todo
  const updateTodo = (id, updates) => {
    const index = todos.value.findIndex(t => t.id === id)
    if (index !== -1) {
      todos.value[index] = {
        ...todos.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      saveTodos(todos.value)
    }
  }

  // Delete todo (soft delete - move to completed if not already)
  const deleteTodo = (id) => {
    const index = todos.value.findIndex(t => t.id === id)
    if (index !== -1) {
      todos.value.splice(index, 1)
      saveTodos(todos.value)
    }
  }

  // Toggle complete
  const toggleComplete = (id) => {
    const todo = todos.value.find(t => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
      todo.completedAt = todo.completed ? new Date().toISOString() : null
      todo.updatedAt = new Date().toISOString()

      // Handle recurrence
      if (todo.completed && todo.recurrence) {
        createNextOccurrence(todo)
      }

      saveTodos(todos.value)
    }
  }

  // Create next occurrence for recurring todo
  const createNextOccurrence = (todo) => {
    if (!todo.recurrence) return

    const nextTodo = { ...todo }
    nextTodo.id = generateId()
    nextTodo.completed = false
    nextTodo.completedAt = null
    nextTodo.createdAt = new Date().toISOString()
    nextTodo.updatedAt = new Date().toISOString()

    const getIntervalDays = () => {
      const interval = todo.recurrence.interval || 1
      switch (todo.recurrence.type) {
        case 'daily':
          return interval
        case 'weekly':
          return interval * 7
        case 'monthly':
          return interval * 30
        case 'yearly':
          return interval * 365
        default:
          return 1
      }
    }

    const addInterval = (date) => {
      if (!date) return null
      const newDate = new Date(date)
      const interval = todo.recurrence.interval || 1
      switch (todo.recurrence.type) {
        case 'daily':
          newDate.setDate(newDate.getDate() + interval)
          break
        case 'weekly':
          newDate.setDate(newDate.getDate() + interval * 7)
          break
        case 'monthly':
          newDate.setMonth(newDate.getMonth() + interval)
          break
        case 'yearly':
          newDate.setFullYear(newDate.getFullYear() + interval)
          break
      }
      return newDate.toISOString()
    }

    nextTodo.dueDate = addInterval(todo.dueDate)
    nextTodo.startDate = addInterval(todo.startDate)
    nextTodo.endDate = addInterval(todo.endDate)

    todos.value.push(nextTodo)
  }

  // Filtered and sorted todos
  const filteredTodos = computed(() => {
    let result = [...todos.value]

    // Filter by status
    if (filter.value.status === 'active') {
      result = result.filter(t => !t.completed)
    } else if (filter.value.status === 'completed') {
      result = result.filter(t => t.completed)
    }

    // Filter by priority
    if (filter.value.priority !== 'all') {
      result = result.filter(t => t.priority === filter.value.priority)
    }

    // Filter by category
    if (filter.value.category !== 'all') {
      result = result.filter(t => t.categories.includes(filter.value.category))
    }

    // Filter by search
    if (filter.value.search) {
      const search = filter.value.search.toLowerCase()
      result = result.filter(t =>
        t.title.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search)
      )
    }

    // Sort
    const priorityOrder = { high: 3, medium: 2, low: 1, none: 0 }

    result.sort((a, b) => {
      let comparison = 0

      switch (filter.value.sortBy) {
        case 'createdAt':
          comparison = new Date(a.createdAt) - new Date(b.createdAt)
          break
        case 'dueDate':
          comparison = (a.dueDate ? new Date(a.dueDate) : new Date('9999-01-01')) -
                       (b.dueDate ? new Date(b.dueDate) : new Date('9999-01-01'))
          break
        case 'priority':
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
      }

      return filter.value.sortOrder === 'desc' ? -comparison : comparison
    })

    return result
  })

  // Statistics
  const stats = computed(() => {
    const total = todos.value.length
    const completed = todos.value.filter(t => t.completed).length
    const active = total - completed
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    // By priority
    const byPriority = {
      high: todos.value.filter(t => t.priority === 'high' && !t.completed).length,
      medium: todos.value.filter(t => t.priority === 'medium' && !t.completed).length,
      low: todos.value.filter(t => t.priority === 'low' && !t.completed).length,
      none: todos.value.filter(t => t.priority === 'none' && !t.completed).length
    }

    // By category
    const categoriesMap = {}
    todos.value.forEach(t => {
      t.categories.forEach(cat => {
        categoriesMap[cat] = (categoriesMap[cat] || 0) + 1
      })
    })

    // Completed trend (last 7 days)
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const count = todos.value.filter(t =>
        t.completedAt && t.completedAt.startsWith(dateStr)
      ).length
      last7Days.push({ date: dateStr, count })
    }

    return { total, completed, active, completionRate, byPriority, categories: categoriesMap, last7Days }
  })

  return {
    todos,
    filter,
    filteredTodos,
    stats,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleComplete
  }
})
