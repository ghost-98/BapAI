<template>
  <div class="p-1 bg-gradient-to-br from-orange-200 to-rose-200 rounded-3xl shadow-lg">
    <div class="w-full bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/50">
      <div class="grid grid-cols-7 text-center font-semibold text-sm text-gray-600 mb-2">
          <div v-for="day in ['일', '월', '화', '수', '목', '금', '토']" :key="day">{{ day }}</div>
      </div>
      <div class="grid grid-cols-7 gap-1">
          <div v-for="day in monthlyData" :key="day.dateString"
              @click="day.isCurrentMonth && $emit('date-clicked', day.dateString)"
              :class="[
                  'h-32 p-2 border rounded-lg flex flex-col', 
                  day.isCurrentMonth ? 'bg-white/50 cursor-pointer hover:border-orange-400' : 'bg-gray-50/20',
                  day.isToday ? 'border-orange-500 border-2' : 'border-transparent'
              ]">
              <p :class="['font-semibold', day.isCurrentMonth ? 'text-gray-700' : 'text-gray-400']">{{ day.dateNum }}</p>
              <div v-if="day.totalCalories > 0" class="mt-2 text-xs text-center">
                  <p class="font-bold text-orange-700">{{ day.totalCalories }}</p>
                  <p class="text-gray-500">kcal</p>
              </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  monthlyData: {
    type: Array,
    required: true
  }
});

defineEmits(['date-clicked']);
</script>
