<template>
  <div class="datetime-picker">
    <div class="flex gap-2">
      <!-- Date Picker -->
      <div class="flex-1">
        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">
          日期
        </label>
        <input
          v-model="selectedDate"
          type="date"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @change="updateValue"
        />
      </div>
      
      <!-- Hour Picker -->
      <div class="w-24">
        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">
          时间
        </label>
        <select
          v-model="selectedHour"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @change="updateValue"
        >
          <option
            v-for="hour in hours"
            :key="hour"
            :value="hour"
          >
            {{ hour.toString().padStart(2, '0') }}:00
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const hours = computed(() => {
  const h = []
  for (let i = 0; i < 24; i++) {
    h.push(i)
  }
  return h
})

const selectedDate = ref('')
const selectedHour = ref(0)

// Initialize from modelValue
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    const date = new Date(newVal)
    if (!isNaN(date.getTime())) {
      selectedDate.value = date.toISOString().split('T')[0]
      selectedHour.value = date.getHours()
    }
  } else {
    selectedDate.value = ''
    selectedHour.value = 0
  }
}, { immediate: true })

const updateValue = () => {
  if (selectedDate.value) {
    const date = new Date(selectedDate.value)
    date.setHours(selectedHour.value, 0, 0, 0)
    emit('update:modelValue', date.toISOString())
  } else {
    emit('update:modelValue', '')
  }
}
</script>
