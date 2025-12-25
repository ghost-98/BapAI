<template>
  <DashboardCard class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">식단 기록</h1>
    </div>
    <button @click="$emit('openAddModal')" class="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2 transform hover:scale-105">
      <Plus class="w-5 h-5" />
      새 식단
    </button>
  </DashboardCard>
</template>

<script setup>
import { Plus } from 'lucide-vue-next';

defineEmits(['openAddModal']);
</script>
