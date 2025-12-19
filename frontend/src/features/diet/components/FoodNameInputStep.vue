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
import apiClient from '../../../api';
import { useNotificationStore } from '../../../stores/notification';

const emit = defineEmits(['food-data-provided']);

const notificationStore = useNotificationStore();

const foodNameInput = ref('');
const isLoading = ref(false);

const submitFoodName = async () => {
  if (!foodNameInput.value.trim()) {
    notificationStore.showNotification('음식명을 입력해주세요.', 'error');
    return;
  }

  isLoading.value = true;
  notificationStore.hideNotification();

  try {
    const response = await apiClient.get('/food/nutrition-info', {
      params: { foodName: foodNameInput.value.trim() }
    });
    // { foodName, calories, carbs, protein, fat }
    emit('food-data-provided', { foodData: response.data, imageFile: null }); // 이미지 파일은 null로 보냄
    notificationStore.showNotification('영양 정보 조회 완료!', 'success');
  } catch (err) {
    console.error('음식명 영양 정보 조회 실패:', err);
    notificationStore.showNotification('입력하신 음식에 대한 정보를 찾을 수 없습니다. 다시 확인해주세요.', 'error');
  } finally {
    isLoading.value = false;
  }
};
</script>