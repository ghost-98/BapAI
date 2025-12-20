<template>
  <div class="flex flex-col items-center justify-center space-y-6 p-4">
    <p class="text-lg font-semibold text-gray-700">음식명과 이미지를 입력해주세요.</p>
    
    <div class="w-full space-y-3">
      <div>
        <label for="foodName" class="block text-sm font-medium text-gray-700 mb-1">음식명</label>
        <input type="text" id="foodName" v-model="foodNameInput" class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm p-2" placeholder="예: 스테이크, 샐러드">
        <p class="mt-1 text-xs text-gray-500">정확한 영양 정보 조회를 위해 구체적인 음식명을 입력해주세요.</p>
      </div>
      
      <div>
        <label for="foodImage" class="block text-sm font-medium text-gray-700 mb-1">사진 첨부</label>
        <input type="file" id="foodImage" @change="handleFileChange" accept="image/*" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100">
        <div v-if="imagePreviewUrl" class="mt-4 w-48 h-48 border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 mx-auto">
          <img :src="imagePreviewUrl" alt="Selected food image" class="max-w-full max-h-full object-contain">
        </div>
      </div>
    </div>
    
    <button @click="submitFoodAndImage" :disabled="!foodNameInput.trim() || !selectedImage || isLoading" class="w-full bg-emerald-600 text-white hover:bg-emerald-700 font-semibold py-3 px-4 rounded-lg shadow-md transition disabled:bg-gray-400 disabled:cursor-not-allowed">
      {{ isLoading ? '정보 조회 중...' : '영양 정보 조회 및 이미지 첨부' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useNotificationStore } from '../../../stores/notification';

const emit = defineEmits(['data-provided']);

const notificationStore = useNotificationStore();

const foodNameInput = ref('');
const selectedImage = ref(null);
const imagePreviewUrl = ref('');
const isLoading = ref(false);

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedImage.value = file;
    imagePreviewUrl.value = URL.createObjectURL(file);
    notificationStore.hideNotification();
  } else {
    selectedImage.value = null;
    imagePreviewUrl.value = '';
  }
};

const submitFoodAndImage = async () => {
  if (!foodNameInput.value.trim()) {
    notificationStore.showNotification('음식명을 입력해주세요.', 'error');
    return;
  }
  // 이미지 선택은 필수가 아닐 수 있으므로, 없어도 전송
  emit('data-provided', { 
    foodName: foodNameInput.value.trim(), 
    imageFile: selectedImage.value 
  });
};
</script>