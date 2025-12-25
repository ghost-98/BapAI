<template>
  <div class="p-1 bg-gradient-to-br from-orange-200 to-rose-200 rounded-3xl shadow-lg">
    <div class="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 space-y-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">일별 기록</h2>
      <!-- Day Selector -->
      <div class="grid grid-cols-7 gap-2 mb-6">
        <div v-for="dayIndex in 7" :key="dayIndex"
             @click="selectedDayInWeeklyView = weeklyData.dailyLogs[dayIndex]"
             :class="[
               'p-3 rounded-xl text-center cursor-pointer transition-all duration-200',
               'bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm',
               selectedDayInWeeklyView?.dateString === weeklyData.dailyLogs[dayIndex]?.dateString ? 'ring-2 ring-orange-500 scale-105' : 'hover:scale-105 hover:shadow-md'
             ]">
          <p class="text-sm font-medium" :class="weeklyData.dailyLogs[dayIndex]?.isToday ? 'text-orange-600' : 'text-gray-600'">
            {{ weeklyData.dailyLogs[dayIndex]?.dayName }}
          </p>
          <p class="text-xl font-bold" :class="weeklyData.dailyLogs[dayIndex]?.isToday ? 'text-orange-700' : 'text-gray-800'">
            {{ weeklyData.dailyLogs[dayIndex]?.dateNum }}
          </p>
        </div>
      </div>

      <!-- Selected Day's Records -->
      <div v-if="selectedDayInWeeklyView">
        <h3 class="text-xl font-bold text-gray-800 mb-4">{{ selectedDayInWeeklyView.dateString }} 식단</h3>
        <template v-if="selectedDayInWeeklyView.dietList.length > 0">
          <div v-for="meal in mealTypes" :key="meal.name">
            <div v-if="getRecordsByMealType(meal.apiValue).length > 0"
                 class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50 space-y-4 h-full mb-4">
              <!-- Meal Header -->
              <div class="flex items-center justify-between pb-4 border-b border-gray-200/80">
                <h3 class="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <component :is="meal.icon" :class="`w-7 h-7 text-${meal.color}-600`" />
                  {{ meal.name }}
                  <span class="text-lg text-gray-500 font-medium ml-2">{{ getMealTotalCalories(meal.apiValue) }} kcal</span>
                </h3>
              </div>
              <!-- Record List -->
              <div class="space-y-3">
                <div v-for="record in getRecordsByMealType(meal.apiValue)" :key="record.dietId" 
                     class="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-between">
                  <div class="flex items-center gap-4 flex-grow">
                    <div class="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img v-if="record.imgUrl" :src="record.imgUrl" alt="식단 이미지" class="w-full h-full object-cover">
                      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div class="flex-grow">
                      <p class="font-bold text-gray-800 text-lg flex items-center gap-2">{{ record.foodName }} <span class="text-sm font-normal text-gray-500">{{ record.time }}</span></p>
                      <p class="text-sm text-gray-600 font-semibold">{{ record.kcal.toFixed(0) }} kcal ({{ record.servings }}인분)</p>
                      <div class="flex gap-3 text-xs text-gray-500 mt-1">
                        <p>탄: {{ record.carbs.toFixed(1) }}g</p>
                        <p>단: {{ record.protein.toFixed(1) }}g</p>
                        <p>지: {{ record.fat.toFixed(1) }}g</p>
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-col items-end ml-4">
                    <button @click="$emit('delete-record', record.dietId)" class="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"><Trash2 class="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="text-center py-16 bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-lg">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 class="mt-2 text-sm font-semibold text-gray-900">기록된 식단 없음</h3>
          <p class="mt-1 text-sm text-gray-500">선택된 날짜에 기록된 식단이 없습니다.</p>
        </div>
      </div>
      <div v-else class="text-center py-16 bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-lg">
        <h3 class="mt-2 text-xl font-semibold text-gray-900">요일을 선택하여 기록을 확인하세요.</h3>
        <p class="mt-1 text-sm text-gray-500">위에서 요일을 클릭하면 해당 날짜의 식단 기록을 볼 수 있습니다.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Trash2 } from 'lucide-vue-next';

const props = defineProps({
  weeklyData: {
    type: Object,
    required: true
  },
  mealTypes: {
    type: Array,
    required: true
  }
});

defineEmits(['edit-record', 'delete-record']);

const selectedDayInWeeklyView = ref(null);

watch(() => props.weeklyData, (newVal) => {
  if (newVal && newVal.dailyLogs) {
    // Find today's log or default to the first available day
    const todayLog = Object.values(newVal.dailyLogs).find(day => day.isToday);
    selectedDayInWeeklyView.value = todayLog || newVal.dailyLogs[1] || null;
  }
}, { immediate: true });

const getRecordsByMealType = (mealType) => {
  if (!selectedDayInWeeklyView.value) return [];
  return selectedDayInWeeklyView.value.dietList.filter(r => r.mealType === mealType);
};

const getMealTotalCalories = (mealType) => {
  if (!selectedDayInWeeklyView.value) return 0;
  return getRecordsByMealType(mealType).reduce((total, record) => total + (record.kcal || 0), 0);
};
</script>
