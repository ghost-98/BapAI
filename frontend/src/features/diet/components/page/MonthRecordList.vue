<template>
  <div class="space-y-6">
    <div v-for="group in groupedRecords" :key="group.date" class="p-1 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl shadow-lg">
      <div class="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50">
        <h3 class="text-xl font-bold text-gray-800 mb-4">{{ formatDate(group.date) }}</h3>
        <div class="space-y-3">
          <div v-for="record in group.records" :key="record.dietId" 
               class="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-between">
            <div class="flex items-center gap-4 flex-grow">
              <div class="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <!-- Placeholder for food image or icon -->
              </div>
              <div class="flex-grow">
                <p class="font-bold text-gray-800 text-lg flex items-center gap-2">
                  {{ record.foodName }} 
                  <span class="text-sm font-normal text-gray-500">{{ record.time }}</span>
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :class="getMealBadgeClass(record.mealType)">{{ getMealTypeName(record.mealType) }}</span>
                </p>
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
      </div>
    </div>
    <div v-if="!records || records.length === 0" class="text-center py-16">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        <h3 class="mt-2 text-sm font-semibold text-gray-900">기록된 식단 없음</h3>
        <p class="mt-1 text-sm text-gray-500">이 기간에 기록된 식단이 없습니다.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Pencil, Trash2 } from 'lucide-vue-next';

const props = defineProps({
  records: {
    type: Array,
    required: true
  }
});

defineEmits(['edit-record', 'delete-record']);

const mealTypeInfo = {
    BREAKFAST: { name: '아침', bg: 'bg-yellow-100', text: 'text-yellow-800' },
    LUNCH: { name: '점심', bg: 'bg-orange-100', text: 'text-orange-800' },
    DINNER: { name: '저녁', bg: 'bg-blue-100', text: 'text-blue-800' },
    SNACK: { name: '간식', bg: 'bg-green-100', text: 'text-green-800' },
};

const getMealTypeName = (apiValue) => mealTypeInfo[apiValue]?.name || apiValue;
const getMealBadgeClass = (apiValue) => [mealTypeInfo[apiValue]?.bg, mealTypeInfo[apiValue]?.text];

const groupedRecords = computed(() => {
  if (!props.records) return [];
  const groups = props.records.reduce((acc, record) => {
    const date = record.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(record);
    return acc;
  }, {});

  return Object.keys(groups)
    .sort((a, b) => new Date(b) - new Date(a)) // Sort dates descending
    .map(date => ({
      date,
      records: groups[date].sort((a, b) => a.time.localeCompare(b.time)) // Sort records by time
    }));
});

const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    return new Intl.DateTimeFormat('ko-KR', options).format(date);
}
</script>
