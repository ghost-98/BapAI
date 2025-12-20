<template>
  <div class="flex flex-col items-center justify-center space-y-6 p-4">
    <p class="text-lg font-semibold text-gray-700">음식명을 입력해주세요.</p>
    <input type="text" v-model="foodNameInput" @keyup.enter="submitFoodName" class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm p-2" placeholder="예: 비빔밥, 닭가슴살 샐러드">
    <p class="text-xs text-gray-500 text-center">정확한 음식명을 입력하면 정확한 영양 정보를 얻을 수 있습니다.</p>
    
    <button @click="submitFoodName" :disabled="!foodNameInput.trim() || isLoading" class="w-full bg-emerald-600 text-white hover:bg-emerald-700 font-semibold py-3 px-4 rounded-lg shadow-md transition disabled:bg-gray-400 disabled:cursor-not-allowed">
      {{ isLoading ? '정보 조회 중...' : '영양 정보 조회' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useNotificationStore } from '../../../stores/notification';

const emit = defineEmits(['data-provided']);

const notificationStore = useNotificationStore();

const foodNameInput = ref('');
const isLoading = ref(false);

const submitFoodName = async () => {
  if (!foodNameInput.value.trim()) {
    notificationStore.showNotification('음식명을 입력해주세요.', 'error');
    return;
  }
  emit('data-provided', { foodName: foodNameInput.value.trim() });
};
</script>