<template>
  <div class="flex flex-col items-center justify-center space-y-6">
    <div class="text-center">
      <p class="text-lg font-semibold text-gray-700 mb-2">AI가 인식한 음식:</p>
      <p class="text-3xl font-bold text-emerald-600">{{ currentFoodName }}</p>
    </div>

    <div v-if="!editingFoodName" class="flex space-x-4">
      <button @click="confirmFood" :disabled="isLoading" class="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold px-6 py-3 rounded-lg shadow-md transition disabled:bg-gray-400 disabled:cursor-not-allowed">
        맞습니다!
      </button>
      <button @click="startEditingFoodName" :disabled="isLoading" class="bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold px-6 py-3 rounded-lg shadow-md transition disabled:bg-gray-400 disabled:cursor-not-allowed">
        다시 입력
      </button>
    </div>

    <div v-else class="w-full space-y-4">
      <label for="manualFoodName" class="block text-sm font-medium text-gray-700 mb-1">정확한 음식명을 입력해주세요:</label>
      <input type="text" id="manualFoodName" v-model="manualFoodNameInput" @keyup.enter="submitManualFoodName" class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" placeholder="예: 비빔밥">
      <p class="text-xs text-gray-500">정확한 음식명을 입력하면 정확한 영양 정보를 얻을 수 있습니다.</p>
      <button @click="submitManualFoodName" :disabled="!manualFoodNameInput.trim() || isLoading" class="w-full bg-emerald-600 text-white hover:bg-emerald-700 font-semibold px-6 py-3 rounded-lg shadow-md transition disabled:bg-gray-400 disabled:cursor-not-allowed">
        음식명 확정
      </button>
      <button @click="cancelEditingFoodName" :disabled="isLoading" class="w-full bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold px-6 py-3 rounded-lg shadow-md transition disabled:bg-gray-400 disabled:cursor-not-allowed">
        취소
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useNotificationStore } from '../../../stores/notification'; // Notification store 임포트
import apiClient from '../../../api'

const props = defineProps({
  recognizedFoodData: {
    type: Object,
    required: true,
    // 예시: { foodName: '불고기', calories: 500, carbs: 50, protein: 30, fat: 20 }
  },
});

const emit = defineEmits(['food-confirmed']);

const notificationStore = useNotificationStore();

const editingFoodName = ref(false);
const manualFoodNameInput = ref('');
const isLoading = ref(false);
// const error = ref(null); // notificationStore로 대체

const currentFoodName = computed(() => {
  return editingFoodName.value && manualFoodNameInput.value.trim() ? manualFoodNameInput.value.trim() : props.recognizedFoodData.foodName;
});

watch(() => props.recognizedFoodData, (newVal) => {
  if (newVal) {
    editingFoodName.value = false;
    manualFoodNameInput.value = '';
    // error.value = null;
    notificationStore.hideNotification();
  }
}, { immediate: true });

const confirmFood = () => {
  // error.value = null;
  notificationStore.hideNotification();
  // AI가 인식한 데이터를 그대로 전달
  emit('food-confirmed', props.recognizedFoodData);
};

const startEditingFoodName = () => {
  editingFoodName.value = true;
  manualFoodNameInput.value = props.recognizedFoodData.foodName; // 초기값으로 AI 인식값 설정
  // error.value = null;
  notificationStore.hideNotification();
};

const cancelEditingFoodName = () => {
  editingFoodName.value = false;
  manualFoodNameInput.value = '';
  // error.value = null;
  notificationStore.hideNotification();
};

const submitManualFoodName = async () => {
  if (!manualFoodNameInput.value.trim()) {
    // error.value = '음식명을 입력해주세요.';
    notificationStore.showNotification('음식명을 입력해주세요.', 'error');
    return;
  }

  isLoading.value = true;
  // error.value = null;
  notificationStore.hideNotification();

  try {
    // TODO: 음식명으로 영양 정보 조회 API 호출
    const response = await apiClient.get('/food/nutrition-info', {
      params: { foodName: manualFoodNameInput.value.trim() }
    });
    // 서버 응답 형식: { foodName, calories, carbs, protein, fat }
    emit('food-confirmed', response.data);
    notificationStore.showNotification('음식 정보 확인 완료!', 'success');
  } catch (err) {
    console.error('수동 음식명 영양 정보 조회 실패:', err);
    // error.value = '입력하신 음식에 대한 정보를 찾을 수 없습니다. 다시 확인해주세요.';
    notificationStore.showNotification('입력하신 음식에 대한 정보를 찾을 수 없습니다. 다시 확인해주세요.', 'error');
  } finally {
    isLoading.value = false;
  }
};
</script>