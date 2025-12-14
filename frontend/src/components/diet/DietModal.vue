<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-gray-800">{{ isEditing ? '식단 수정' : '새 식단 기록' }}</h2>
        <button @click="close" class="p-2 rounded-full hover:bg-gray-200">
          <X class="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <form @submit.prevent="handleSave">
        <div class="space-y-4">
          <div>
            <label for="date" class="block text-sm font-medium text-gray-700">날짜</label>
            <input type="date" id="date" v-model="form.date" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" required>
          </div>
          <div>
            <label for="mealType" class="block text-sm font-medium text-gray-700">식사 종류</label>
            <select id="mealType" v-model="form.mealType" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" required>
              <option>아침</option>
              <option>점심</option>
              <option>저녁</option>
              <option>간식</option>
            </select>
          </div>
          <div>
            <label for="food" class="block text-sm font-medium text-gray-700">음식 내용</label>
            <input type="text" id="food" v-model="form.food" placeholder="예: 닭가슴살 200g" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" required>
          </div>
          <div>
            <label for="calories" class="block text-sm font-medium text-gray-700">칼로리 (kcal)</label>
            <input type="number" id="calories" v-model.number="form.calories" placeholder="예: 350" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" required>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end space-x-3">
          <button type="button" @click="close" class="bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium px-4 py-2 rounded-lg transition">
            취소
          </button>
          <button type="submit" class="bg-emerald-600 text-white hover:bg-emerald-700 font-medium px-4 py-2 rounded-lg shadow-sm transition">
            저장
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  dietRecord: Object,
});

const emit = defineEmits(['close', 'save']);

const form = ref({
  id: null,
  date: new Date().toISOString().slice(0, 10),
  mealType: '아침',
  food: '',
  calories: null,
});

const isEditing = computed(() => !!props.dietRecord);

watch(() => props.dietRecord, (newRecord) => {
  if (newRecord) {
    form.value = { ...newRecord };
  } else {
    form.value = {
      id: null,
      date: new Date().toISOString().slice(0, 10),
      mealType: '아침',
      food: '',
      calories: null,
    };
  }
}, { immediate: true });

const close = () => {
  emit('close');
};

const handleSave = () => {
  emit('save', { ...form.value });
  close();
};
</script>
