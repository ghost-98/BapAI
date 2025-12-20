<template>
  <div class="flex flex-col items-center justify-center space-y-4">
    <label for="foodImage" class="w-full cursor-pointer bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold py-3 px-4 rounded-lg border border-emerald-200 transition-colors duration-200 flex items-center justify-center space-x-2">
      <UploadCloud class="w-5 h-5" />
      <span>{{ selectedImage ? '사진 변경' : '음식 사진 선택' }}</span>
      <input type="file" id="foodImage" @change="handleFileChange" accept="image/*" class="hidden">
    </label>

    <div v-if="selectedImage" class="w-48 h-48 border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100">
      <img :src="imagePreviewUrl" alt="Selected food image" class="max-w-full max-h-full object-contain">
    </div>

    <p v-if="fileName" class="text-sm text-gray-600">선택된 파일: {{ fileName }}</p>

    <button @click="analyzeImage" :disabled="!selectedImage || isLoading" class="w-full bg-emerald-600 text-white hover:bg-emerald-700 font-semibold py-3 px-4 rounded-lg shadow-sm transition disabled:bg-gray-400 disabled:cursor-not-allowed">
      {{ isLoading ? '분석 중...' : '음식 분석 시작' }}
    </button>

    <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { UploadCloud } from 'lucide-vue-next';
import { useNotificationStore } from '../../../stores/notification'; // Notification store 임포트

const emit = defineEmits(['data-provided']);

const notificationStore = useNotificationStore();

const selectedImage = ref(null);
const imagePreviewUrl = ref('');
const fileName = ref('');
const isLoading = ref(false);

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedImage.value = file;
    fileName.value = file.name;
    imagePreviewUrl.value = URL.createObjectURL(file);
    notificationStore.hideNotification();
  } else {
    selectedImage.value = null;
    fileName.value = '';
    imagePreviewUrl.value = '';
  }
};

const analyzeImage = () => {
  if (!selectedImage.value) {
    notificationStore.showNotification('이미지를 선택해주세요.', 'error');
    return;
  }
  // API 호출 대신, 이미지 파일을 포함하는 객체를 emit
  emit('data-provided', { imageFile: selectedImage.value });
};
</script>