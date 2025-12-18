<template>
  <div class="p-1 bg-gradient-to-br from-orange-200 to-rose-200 rounded-3xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
    <div class="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900">오늘의 식단</h2>
        <span class="text-sm text-gray-500">타임라인</span>
      </div>

      <div class="space-y-4">
        <!-- Meal Item -->
        <div v-for="meal in meals" :key="meal.name" class="bg-white/40 rounded-xl p-5 border border-white/50 hover:border-orange-300 transition-colors">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span :class="meal.tagClass">{{ meal.type }}</span>
                <span class="text-gray-500 text-sm">{{ meal.time }}</span>
              </div>
              <h3 class="text-gray-800 font-medium mb-1">{{ meal.name }}</h3>
              <p class="text-gray-500 text-sm">{{ meal.description }}</p>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-orange-600">{{ meal.calories }}</div>
              <div class="text-gray-500 text-xs">kcal</div>
            </div>
          </div>
        </div>
        <p v-if="!meals.length" class="text-center text-sm text-gray-500 pt-4">아직 기록된 식사가 없습니다.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const meals = ref([
  {
    type: '점심',
    time: '12:30',
    name: '닭가슴살 샐러드',
    description: '닭가슴살 150g, 각종 채소, 올리브 오일 드레싱',
    calories: 350,
    tagClass: 'px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium rounded-full'
  }
]);
</script>