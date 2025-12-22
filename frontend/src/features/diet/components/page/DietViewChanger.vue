<template>
  <div class="flex items-center justify-between bg-white/50 backdrop-blur-sm rounded-2xl p-2 border border-gray-200/80 shadow-sm mb-4">
    <div class="bg-gray-100 p-1 rounded-lg">
      <button
        v-for="view in views"
        :key="view.id"
        @click="$emit('update:currentView', view.id)"
        :class="[
          'px-4 py-1.5 rounded-md text-sm font-medium transition',
          currentView === view.id ? 'bg-white text-orange-600 shadow' : 'text-gray-600 hover:bg-gray-200'
        ]"
      >
        {{ view.name }}
      </button>
    </div>
    <div class="flex items-center space-x-2">
      <button @click="$emit('changePeriod', -1)" class="p-2 rounded-full hover:bg-gray-200 transition-colors">
        <ChevronLeft class="w-5 h-5 text-gray-600" />
      </button>
      <span class="text-lg font-semibold text-gray-700 w-48 text-center">{{ currentPeriod }}</span>
      <button @click="$emit('changePeriod', 1)" class="p-2 rounded-full hover:bg-gray-200 transition-colors">
        <ChevronRight class="w-5 h-5 text-gray-600" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

defineProps({
  currentView: {
    type: String,
    required: true
  },
  currentPeriod: {
    type: String,
    required: true
  }
});

defineEmits(['update:currentView', 'changePeriod']);

const views = [
  { id: 'daily', name: '일간' },
  { id: 'weekly', name: '주간' },
  { id: 'monthly', name: '월간' },
];
</script>
