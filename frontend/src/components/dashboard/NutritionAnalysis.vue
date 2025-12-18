<template>
  <div class="p-1 bg-gradient-to-br from-orange-200 to-rose-200 rounded-3xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
    <div class="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50">
      <h3 class="text-gray-900 font-bold mb-6">영양소 분석</h3>
      <div class="space-y-5">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-gray-700 text-sm font-medium">탄수화물</span>
            <span class="text-orange-600 font-bold">{{ currentCarbs }}g / {{ targetCarbs }}g</span>
          </div>
          <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" :style="{ width: carbProgress + '%' }"></div>
          </div>
        </div>
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-gray-700 text-sm font-medium">단백질</span>
            <span class="text-rose-600 font-bold">{{ currentProtein }}g / {{ targetProtein }}g</span>
          </div>
          <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full" :style="{ width: proteinProgress + '%' }"></div>
          </div>
        </div>
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-gray-700 text-sm font-medium">지방</span>
            <span class="text-blue-600 font-bold">{{ currentFat }}g / {{ targetFat }}g</span>
          </div>
          <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" :style="{ width: fatProgress + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Placeholder data
const currentCarbs = ref(180);
const targetCarbs = ref(250);
const currentProtein = ref(95);
const targetProtein = ref(120);
const currentFat = ref(40);
const targetFat = ref(60);

const carbProgress = computed(() => (currentCarbs.value / targetCarbs.value) * 100);
const proteinProgress = computed(() => (currentProtein.value / targetProtein.value) * 100);
const fatProgress = computed(() => (currentFat.value / targetFat.value) * 100);
</script>