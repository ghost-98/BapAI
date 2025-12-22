<template>
  <div class="p-1 bg-gradient-to-br from-orange-200 to-rose-200 rounded-3xl shadow-lg">
    <div class="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <template v-if="hasAnyRecords">
          <div v-for="meal in mealTypes" :key="meal.name" class="col-span-1">
            <div class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50 space-y-4 h-full">
              <!-- Meal Header -->
              <div class="flex items-center justify-between pb-4 border-b border-gray-200/80">
                <h3 class="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <component :is="meal.icon" :class="`w-7 h-7 text-${meal.color}-600`" />
                  {{ meal.name }}
                  <span class="text-lg text-gray-500 font-medium ml-2">{{ getMealTotalCalories(meal.apiValue) }} kcal</span>
                </h3>
              </div>
              <!-- Conditional content based on records -->
              <template v-if="getRecordsByMealType(meal.apiValue).length > 0">
                <!-- Record List -->
                <div class="space-y-3">
                  <div v-for="record in getRecordsByMealType(meal.apiValue)" :key="record.dietId" 
                       class="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-between">
                    <div class="flex items-center gap-4 flex-grow">
                      <div class="w-14 h-14 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                        <img v-if="record.imgUrl" :src="record.imgUrl" :alt="record.foodName" class="w-full h-full object-cover">
                        <div v-else class="w-full h-full flex items-center justify-center bg-gray-100">
                          <Utensils class="w-8 h-8 text-gray-400" />
                        </div>
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
                      <button @click="$emit('edit-record', record)" class="p-2 text-gray-400 hover:text-orange-600 rounded-full hover:bg-gray-100"><Pencil class="w-4 h-4" /></button>
                      <button @click="$emit('delete-record', record.dietId)" class="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"><Trash2 class="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="text-center py-4 text-gray-500">
                  <p>{{ meal.name }} 기록이 없습니다.</p>
                </div>
              </template>
            </div>
          </div>
        </template>
        <div v-else class="text-center py-16 col-span-full">
          <h3 class="mt-2 text-sm font-semibold text-gray-900">기록된 식단 없음</h3>
          <p class="mt-1 text-sm text-gray-500">새 식단 기록 버튼을 눌러 추가해보세요!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Pencil, Trash2, Utensils } from 'lucide-vue-next';

const props = defineProps({
  records: {
    type: Array,
    required: true
  },
  mealTypes: {
    type: Array,
    required: true
  }
});

defineEmits(['edit-record', 'delete-record']);

const hasAnyRecords = computed(() => {
  return props.records.length > 0;
});

const getRecordsByMealType = (mealType) => {
  return props.records.filter(r => r.mealType === mealType);
};

const getMealTotalCalories = (mealType) => {
  return getRecordsByMealType(mealType).reduce((total, record) => total + (record.kcal || 0), 0);
};
</script>
