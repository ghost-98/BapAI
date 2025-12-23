<script setup>
import { defineProps, computed } from 'vue';
import { Clock, Utensils } from 'lucide-vue-next';

const props = defineProps({
  meals: {
    type: Array,
    default: () => [],
  },
});

const getKoreanMealType = (mealType) => {
  switch (mealType) {
    case 'BREAKFAST': return '아침';
    case 'LUNCH': return '점심';
    case 'DINNER': return '저녁';
    case 'SNACK': return '간식';
    default: return mealType; // Fallback for unknown types
  }
};

const getTagClass = (mealType) => {
  const koreanMealType = getKoreanMealType(mealType);
  const baseClass = 'px-3 py-1 text-xs font-medium rounded-full'; // Removed text-white and bg-gradient
  switch (koreanMealType) {
    case '아침': return `${baseClass} bg-green-100 text-green-700`;
    case '점심': return `${baseClass} bg-amber-100 text-amber-700`;
    case '저녁': return `${baseClass} bg-blue-100 text-blue-700`;
    case '간식': return `${baseClass} bg-purple-100 text-purple-700`;
    default: return `${baseClass} bg-gray-200 text-gray-700`; // Fallback for unknown types
  }
};

const sortedMeals = computed(() => {
  if (!props.meals) return [];
  // Sort meals by time
  return [...props.meals].sort((a, b) => {
    if (!a.time || !b.time) return 0;
    const timeA = a.time.split(':').map(Number);
    const timeB = b.time.split(':').map(Number);
    return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
  });
});

const formattedServings = (servings) => {
  if (servings % 1 === 0) {
    return servings.toFixed(0); // Integer, show without decimals
  }
  return servings.toFixed(1); // Decimal, show one decimal
};

</script>

<template>
  <div class="space-y-4">
    <p v-if="!sortedMeals || sortedMeals.length === 0" class="text-center text-sm text-gray-500 pt-4">아직 기록된 식사가 없습니다.</p>
    
    <div v-for="meal in sortedMeals" :key="meal.dietId" class="bg-white/60 rounded-xl p-4 border border-white/50 hover:border-orange-300 transition-colors">
      <div class="flex gap-4 items-center">
        <!-- Image Section -->
        <img :src="meal.imgUrl || 'https://dummyimage.com/100x100/ccc/000&text=No+Image'" alt="음식 사진" class="w-24 h-24 rounded-lg object-cover shadow-sm">
        
        <!-- Details Section -->
        <div class="flex-grow space-y-1">
          <div class="flex items-center gap-3">
            <span :class="getTagClass(meal.mealType)">{{ getKoreanMealType(meal.mealType) }}</span>
            <div class="flex items-center gap-1 text-gray-500 text-sm">
              <Clock :size="14"/>
              <span>{{ meal.time }}</span>
            </div>
          </div>
          <h3 class="text-gray-900 font-bold text-lg pt-1">{{ meal.foodName }}</h3>
          <p class="flex items-center gap-1 text-sm text-gray-600">
            <Utensils :size="14" /> 
            <span>{{ formattedServings(meal.servings) }} 인분</span>
          </p>
          <div class="flex gap-4 text-xs text-gray-500 pt-1">
            <span>탄: <strong class="text-gray-700">{{ meal.carbs.toFixed(0) }}</strong>g</span>
            <span>단: <strong class="text-gray-700">{{ meal.protein.toFixed(0) }}</strong>g</span>
            <span>지: <strong class="text-gray-700">{{ meal.fat.toFixed(0) }}</strong>g</span>
          </div>
        </div>

        <!-- Calories Section -->
        <div class="text-right">
          <div class="text-3xl font-extrabold text-orange-600">{{ meal.kcal.toFixed(0) }}</div>
          <div class="text-gray-500 text-sm -mt-1">kcal</div>
        </div>
      </div>
    </div>
  </div>
</template>
