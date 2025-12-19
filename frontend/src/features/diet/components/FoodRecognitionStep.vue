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

    <button @click="recognizeFood" :disabled="!selectedImage || isLoading" class="w-full bg-emerald-600 text-white hover:bg-emerald-700 font-semibold py-3 px-4 rounded-lg shadow-sm transition disabled:bg-gray-400 disabled:cursor-not-allowed">
      {{ isLoading ? '분석 중...' : '음식 인식 시작' }}
    </button>

    <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { UploadCloud } from 'lucide-vue-next';
import { apiClientForMultipart } from '../../../api'; // Multipart 전용 클라이언트 임포트
import { useNotificationStore } from '../../../stores/notification'; // Notification store 임포트

const emit = defineEmits(['image-recognized']);

const notificationStore = useNotificationStore();

const selectedImage = ref(null);
const imagePreviewUrl = ref('');
const fileName = ref('');
const isLoading = ref(false);
// const error = ref(null); // notificationStore로 대체

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedImage.value = file;
    fileName.value = file.name;
    imagePreviewUrl.value = URL.createObjectURL(file);
    // error.value = null; // Clear previous errors
    notificationStore.hideNotification(); // Clear previous errors
  } else {
    selectedImage.value = null;
    fileName.value = '';
    imagePreviewUrl.value = '';
  }
};

const recognizeFood = async () => {
  if (!selectedImage.value) {
    // error.value = '이미지를 선택해주세요.';
    notificationStore.showNotification('이미지를 선택해주세요.', 'error');
    return;
  }

  isLoading.value = true;
  // error.value = null;
  notificationStore.hideNotification(); // Clear previous errors

  const formData = new FormData();
  formData.append('image', selectedImage.value);

  try {
    const response = await apiClientForMultipart.post('/food/classify-image', formData);
    // 서버 응답 형식: { foodName, calories, carbs, protein, fat }
    emit('image-recognized', response.data);
    notificationStore.showNotification('음식 인식 완료!', 'success');
  } catch (err) {
    console.error('음식 인식 실패:', err);
    // error.value = '음식 인식에 실패했습니다. 다시 시도해주세요.';
    notificationStore.showNotification('음식 인식에 실패했습니다. 다시 시도해주세요.', 'error');
    // TODO: 상세 에러 처리 (예: 서버에서 특정 메시지를 보내는 경우)
  } finally {
    isLoading.value = false;
  }
};
</script>