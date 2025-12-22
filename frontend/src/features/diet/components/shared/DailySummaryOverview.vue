<template>
  <div class="p-1 bg-gradient-to-br from-orange-200 to-rose-200 rounded-3xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
    <div class="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Left Column -->
        <div class="space-y-6">
          <!-- Meal/Snack Counts (Moved to top-left) -->
          <div class="p-6 bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl shadow-lg">
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center">
                <p class="text-md font-semibold text-gray-600">식사</p>
                <p class="text-4xl font-bold text-gray-800">{{ totalMealCount }}<span class="text-2xl text-gray-400">끼</span></p>
              </div>
              <div class="text-center">
                <p class="text-md font-semibold text-gray-600">간식</p>
                <p class="text-4xl font-bold text-gray-800">{{ totalSnackCount }}<span class="text-2xl text-gray-400">회</span></p>
              </div>
            </div>
          </div>

          <!-- Combined Calorie & Macronutrient Visualization -->
          <div class="p-6 bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl shadow-lg">
            <h3 class="text-lg font-bold text-gray-800 mb-4">오늘의 영양</h3>
            
            <div class="flex flex-col items-center justify-center mb-6">
              <div class="relative w-48 h-48">
                <!-- Outer circle for target -->
                <svg class="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    class="text-gray-200 stroke-current"
                    stroke-width="8"
                    cx="50"
                    
                    cy="50"
                    r="40"
                    fill="transparent"
                  ></circle>
                  <!-- Inner circle for current calories -->
                  <circle
                    class="text-orange-500 progress-ring__circle stroke-current"
                    stroke-width="8"
                    stroke-linecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    :stroke-dasharray="circumference"
                    :stroke-dashoffset="calorieDashoffset"
                  ></circle>
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <div class="flex flex-col items-center justify-center"> <!-- New wrapper div -->
                    <p class="text-5xl font-extrabold text-gray-800">{{ totalCalories }}</p>
                    <p class="text-sm text-gray-500">/ {{ targetCalories }} kcal</p>
                  </div>
                  <p class="text-sm font-bold mt-1">
                    <span v-if="totalCalories < targetCalories * 0.9" class="text-blue-500">미달</span>
                    <span v-else-if="totalCalories >= targetCalories * 0.9 && totalCalories <= targetCalories * 1.1" class="text-green-500">달성</span>
                    <span v-else-if="totalCalories > targetCalories * 1.1" class="text-red-500">초과!</span>
                  </p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4 mt-4">
              <div v-for="macro in macronutrients" :key="macro.name" class="text-center">
                <component :is="macro.icon" :class="`w-6 h-6 mx-auto mb-1 text-${macro.color}-500`" />
                <p class="font-semibold text-gray-700 text-sm">{{ macro.name }}</p>
                <p class="text-lg font-bold text-gray-800">{{ macro.current.toFixed(0) }}<span class="text-sm text-gray-500">/{{ macro.target }}g</span>
                  <span v-if="macro.current < macro.target * 0.9" class="text-blue-500 text-xs font-bold ml-1">미달</span>
                  <span v-else-if="macro.current >= macro.target * 0.9 && macro.current <= macro.target * 1.1" class="text-green-500 text-xs font-bold ml-1">달성</span>
                  <span v-else-if="macro.current > macro.target * 1.1" class="text-red-500 text-xs font-bold ml-1">초과</span>
                </p>
                <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div 
                    class="h-1.5 rounded-full transition-all duration-500" 
                    :class="`bg-${macro.color}-500`"
                    :style="{ width: `${Math.min(100, (macro.current / macro.target) * 100)}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          <WaterTracker 
            :intake="waterCupCount"
            :goal="waterGoal"
            :date="date"
            @data-changed="$emit('data-changed')" 
          />
          <div class="p-6 bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl shadow-lg">
            <h3 class="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2"><Sparkles class="w-5 h-5 text-purple-500" />AI 분석</h3>
            <div class="flex items-center justify-between">
              <span class="font-semibold text-gray-600">오늘의 식단 점수</span>
              <span class="text-2xl font-bold text-indigo-600">{{ aiDietReport?.score || 'N/A' }} 점</span>
            </div>
            <div class="mt-2 pt-2 border-t">
              <p class="text-sm font-semibold text-gray-600 mb-1">다음 식사 추천</p>
              <p v-if="mealRecommendations.length > 0" class="text-center font-bold text-gray-800">"{{ mealRecommendations[0].suggestion }}"</p>
              <p v-else class="text-center text-sm text-gray-500">데이터가 부족합니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import WaterTracker from '@/components/dashboard/WaterTracker.vue';
import { Sparkles, Wheat, Beef, Nut } from 'lucide-vue-next'; // Icons for macros
import { getHealthAnalysis } from '@/api';

const props = defineProps({
  dailySummaryData: Object,
  aiDietReport: Object,
  mealRecommendations: Array,
  date: String, // YYYY-MM-DD format
});

const emit = defineEmits(['data-changed']);

// Extracting data from dailySummaryData prop
const totalCalories = computed(() => props.dailySummaryData?.totalCalories || 0);
const currentCarbs = computed(() => props.dailySummaryData?.totalCarbs || 0);
const currentProtein = computed(() => props.dailySummaryData?.totalProtein || 0);
const currentFat = computed(() => props.dailySummaryData?.totalFat || 0);
const waterCupCount = computed(() => props.dailySummaryData?.waterCupCount || 0);
const waterGoal = computed(() => props.dailySummaryData?.waterGoal || 8);
const totalMealCount = computed(() => props.dailySummaryData?.totalMealCount || 0);
const totalSnackCount = computed(() => props.dailySummaryData?.totalSnackCount || 0);

// Reactive refs for target nutrients
const targetCalories = ref(2000); // Default value
const targetCarbs = ref(250); // Default value
const targetProtein = ref(120); // Default value
const targetFat = ref(60); // Default value

// Fetch target nutrients on component mount
onMounted(async () => {
  try {
    const data = await getHealthAnalysis();
    if (data) {
      targetCalories.value = data.recCalories || targetCalories.value;
      targetCarbs.value = data.recCarbs || targetCarbs.value;
      targetProtein.value = data.recProtein || targetProtein.value;
      targetFat.value = data.recFat || targetFat.value;
    }
  } catch (error) {
    console.error("Failed to fetch health analysis data:", error);
    // Keep default values on error
  }
});


// Circular progress bar calculations
const radius = 40;
const circumference = 2 * Math.PI * radius;
const calorieProgress = computed(() => {
  if (targetCalories.value === 0) return 0;
  return Math.min(100, (totalCalories.value / targetCalories.value) * 100)
});
const calorieDashoffset = computed(() => circumference - (calorieProgress.value / 100) * circumference);

const macronutrients = computed(() => [
  { name: '탄수화물', current: currentCarbs.value, target: targetCarbs.value, icon: Wheat, color: 'amber' },
  { name: '단백질', current: currentProtein.value, target: targetProtein.value, icon: Beef, color: 'rose' },
  { name: '지방', current: currentFat.value, target: targetFat.value, icon: Nut, color: 'blue' },
]);
</script>

<style scoped>
.progress-ring__circle {
  transition: stroke-dashoffset 0.5s ease-in-out;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
}
</style>
