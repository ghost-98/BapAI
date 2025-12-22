<template>
  <div class="flex flex-col items-center justify-center space-y-6">
    <div class="text-center">
      <p class="text-lg font-semibold text-gray-700 mb-2">AI가 인식한 음식:</p>
      <p class="text-3xl font-bold text-emerald-600">{{ recognizedFoodData.foodName }}</p>
      <p class="text-sm text-gray-500 mt-2">
        (칼로리: {{ recognizedFoodData.kcal }} kcal)
      </p>
    </div>

    <div v-if="!editingFoodName" class="flex space-x-4">
      <button @click="confirmFood" class="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold px-6 py-3 rounded-lg shadow-md transition">
        네, 맞습니다!
      </button>
      <button @click="startEditingFoodName" class="bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold px-6 py-3 rounded-lg shadow-md transition">
        아니요, 수정할래요
      </button>
    </div>

    <div v-else class="w-full space-y-4 text-center">
      <label for="manualFoodName" class="block text-sm font-medium text-gray-700 mb-1">정확한 음식명을 입력해주세요:</label>
      <input type="text" id="manualFoodName" v-model="manualFoodNameInput" @keyup.enter="requestReanalysis" class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" placeholder="예: 비빔밥">
      <p class="text-xs text-gray-500 mt-1">수정된 이름으로 영양정보를 다시 조회합니다.</p>
      
      <div class="flex space-x-2 mt-4">
        <button @click="cancelEditingFoodName" class="w-full bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold py-3 rounded-lg transition">
          취소
        </button>
        <button @click="requestReanalysis" :disabled="!manualFoodNameInput.trim()" class="w-full bg-emerald-600 text-white hover:bg-emerald-700 font-semibold py-3 rounded-lg shadow-md transition disabled:bg-gray-400">
          정보 다시 조회
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useNotificationStore } from '../../../../stores/notification';

const props = defineProps({
  recognizedFoodData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['food-confirmed', 're-analyze']);

const notificationStore = useNotificationStore();

const editingFoodName = ref(false);
const manualFoodNameInput = ref('');

watch(() => props.recognizedFoodData, (newVal) => {
  if (newVal) {
    editingFoodName.value = false;
    manualFoodNameInput.value = '';
    notificationStore.hideNotification();
  }
}, { immediate: true });

const confirmFood = () => {
  notificationStore.hideNotification();
  emit('food-confirmed', props.recognizedFoodData);
};

const startEditingFoodName = () => {
  editingFoodName.value = true;
  manualFoodNameInput.value = props.recognizedFoodData.foodName;
  notificationStore.hideNotification();
};

const cancelEditingFoodName = () => {
  editingFoodName.value = false;
  manualFoodNameInput.value = '';
  notificationStore.hideNotification();
};

const requestReanalysis = () => {
  if (!manualFoodNameInput.value.trim()) {
    notificationStore.showNotification('음식명을 입력해주세요.', 'error');
    return;
  }
  // 부모에게 새 음식명으로 재분석 요청
  emit('re-analyze', manualFoodNameInput.value.trim());
};
</script>