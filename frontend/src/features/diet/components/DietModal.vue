<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-800">
          {{ currentStep === 0 ? '식단 기록 방식 선택' : currentStep === 1 ? '음식 사진 등록' : currentStep === 2 ? '음식명 확인' : '식단 정보 입력' }}
        </h2>
        <button @click="close" class="p-2 rounded-full hover:bg-gray-200 transition-colors">
          <X class="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <!-- Step 0: 입력 방식 선택 -->
      <div v-if="currentStep === 0" class="p-6 space-y-6">
        <InputMethodSelectionStep @method-selected="handleMethodSelected" />
      </div>

      <!-- Step 1: 음식 사진 등록 (이미지로 기록) -->
      <div v-if="currentStep === 1" class="p-6 space-y-6">
        <FoodRecognitionStep @image-recognized="handleImageRecognized" />
      </div>

      <!-- Step 10: 음식명 입력 (음식명으로 기록) -->
      <div v-if="currentStep === 10" class="p-6 space-y-6">
        <FoodNameInputStep @food-data-provided="handleFoodInput" />
      </div>

      <!-- Step 20: 음식명 및 이미지 입력 (이름 + 이미지로 기록) -->
      <div v-if="currentStep === 20" class="p-6 space-y-6">
        <FoodNameAndImageInputStep @food-and-image-provided="handleFoodInput" />
      </div>

      <!-- Step 2: 음식명 확인 (AI 인식 또는 수동 입력 후) -->
      <div v-if="currentStep === 2" class="p-6 space-y-6">
        <FoodConfirmationStep :recognizedFoodData="recognizedFoodData" @food-confirmed="handleFoodConfirmed" />
      </div>

      <!-- Step 3: 최종 식단 정보 입력 -->
      <div v-if="currentStep === 3" class="p-6 space-y-6">
        <p>최종 식단 정보 입력</p>
        <div v-if="finalFoodData">
          <p>확정된 음식: {{ finalFoodData.foodName }}</p>
          <p>칼로리: {{ finalFoodData.calories }} kcal</p>
          <p v-if="imageFileToUpload">첨부 이미지: {{ imageFileToUpload.name }}</p>
        </div>
        <div>
          <label for="date" class="block text-sm font-medium text-gray-700 mb-1">날짜</label>
          <input type="date" id="date" v-model="form.date" class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" required>
        </div>
        <div>
          <label for="mealType" class="block text-sm font-medium text-gray-700 mb-1">식사 종류</label>
          <select id="mealType" v-model="form.mealType" class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" required>
            <option>아침</option>
            <option>점심</option>
            <option>저녁</option>
            <option>간식</option>
          </select>
        </div>
        <div>
          <label for="servings" class="block text-sm font-medium text-gray-700 mb-1">인분</label>
          <input type="number" id="servings" v-model="form.servings" min="0.5" step="0.5" class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" required>
        </div>
      </div>
        
      <div class="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
        <button type="button" @click="close" class="bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold px-4 py-2 rounded-lg transition">
          취소
        </button>
        <button v-if="currentStep > 0 && currentStep !== 1 && currentStep !== 10 && currentStep !== 20" type="button" @click="currentStep--" class="bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold px-4 py-2 rounded-lg transition">
          이전
        </button>
        <button v-if="currentStep === 2" type="button" @click="currentStep++" class="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold px-4 py-2 rounded-lg shadow-sm transition">
          다음
        </button>
        <button v-if="currentStep === 3" type="button" :disabled="isLoading" @click="handleFinalSave()" class="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold px-4 py-2 rounded-lg shadow-sm transition disabled:bg-gray-400 disabled:cursor-not-allowed">
          {{ isLoading ? '저장 중...' : '저장' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { X } from 'lucide-vue-next'
import FoodRecognitionStep from './FoodRecognitionStep.vue'; // FoodRecognitionStep 컴포넌트 임포트
import FoodConfirmationStep from './FoodConfirmationStep.vue'; // FoodConfirmationStep 컴포넌트 임포트
import InputMethodSelectionStep from './InputMethodSelectionStep.vue'; // InputMethodSelectionStep 컴포넌트 임포트
import FoodNameInputStep from './FoodNameInputStep.vue'; // FoodNameInputStep 컴포넌트 임포트
import FoodNameAndImageInputStep from './FoodNameAndImageInputStep.vue'; // FoodNameAndImageInputStep 컴포넌트 임포트

import apiClient from '../../../api'; // 일반 API 클라이언트 임포트
import { apiClientForMultipart } from '../../../api'; // Multipart API 클라이언트 임포트 (handleFinalSave에서 이미지 첨부 시 사용)

import { useNotificationStore } from '../../../stores/notification'; // Notification store 임포트

const props = defineProps({
  show: Boolean,
  dietRecord: Object, // 기존 편집 기능 유지를 위해 남겨두지만, 현재 플로우는 생성에 중점
});

const emit = defineEmits(['close', 'save-success']);

const notificationStore = useNotificationStore();

const currentStep = ref(0); // 0: 입력 방식 선택, 1: 이미지 업로드, 2: 음식명 확인, 3: 최종 기록 (음식명으로 직접 입력 시 FoodNameInputStep 또는 FoodNameAndImageInputStep에서 바로 2로 이동)
const selectedInputMethod = ref(null); // 'imageOnly', 'nameOnly', 'nameAndImage'
const recognizedFoodData = ref(null); // AI가 인식한 음식 정보 (foodName, calories, carbs, protein, fat)
const finalFoodData = ref(null); // 사용자가 최종 확정한 음식 정보 (foodName, calories, carbs, protein, fat)
const imageFileToUpload = ref(null); // 'nameAndImage' 선택 시 업로드할 이미지 파일
const isLoading = ref(false); // 최종 저장 로딩 상태

const form = ref({
  date: new Date().toISOString().slice(0, 10),
  mealType: '아침',
  servings: 1, // 기본 1인분
});

// const isEditing = computed(() => props.dietRecord && props.dietRecord.id); // 현재는 생성 플로우에 집중

watch(() => props.show, (newVal) => {
  if (newVal) {
    // 모달이 열릴 때마다 초기화
    resetModal();
  }
});

const resetModal = () => {
  currentStep.value = 0; // 초기 스텝으로 리셋
  selectedInputMethod.value = null;
  recognizedFoodData.value = null;
  finalFoodData.value = null;
  imageFileToUpload.value = null;
  isLoading.value = false;
  form.value = {
    date: new Date().toISOString().slice(0, 10),
    mealType: '아침',
    servings: 1,
  };
  notificationStore.hideNotification(); // 모달 닫거나 리셋 시 알림 숨김
};

const close = () => {
  emit('close');
};

const handleMethodSelected = (method) => {
  selectedInputMethod.value = method;
  if (method === 'imageOnly') {
    currentStep.value = 1; // 이미지 업로드 스텝
  } else if (method === 'nameOnly') {
    currentStep.value = 10; // FoodNameInputStep (임시 스텝 번호)
  } else if (method === 'nameAndImage') {
    currentStep.value = 20; // FoodNameAndImageInputStep (임시 스텝 번호)
  }
  notificationStore.hideNotification();
};

// 스텝별 이벤트 핸들러
const handleImageRecognized = (data) => {
  recognizedFoodData.value = data;
  currentStep.value = 2; // 음식명 확인 스텝으로 이동
  notificationStore.hideNotification(); // 다음 스텝으로 넘어갈 때 알림 숨김
};

const handleFoodInput = (data) => { // FoodNameInputStep 또는 FoodNameAndImageInputStep에서 호출
  recognizedFoodData.value = data.foodData; // 이전에 recognizedFoodData가 AI에서 온 것과 동일하게 처리
  imageFileToUpload.value = data.imageFile || null; // 이미지 파일 있으면 저장
  currentStep.value = 2; // 음식명 확인 스텝으로 이동
  notificationStore.hideNotification();
};

const handleFoodConfirmed = (data) => {
  finalFoodData.value = data;
  currentStep.value = 3; // 최종 기록 스텝으로 이동
  notificationStore.hideNotification(); // 다음 스텝으로 넘어갈 때 알림 숨김
};

const handleFinalSave = async () => {
  if (!finalFoodData.value) {
    notificationStore.showNotification('음식 정보가 없습니다. 다시 시작해주세요.', 'error');
    return;
  }

  isLoading.value = true;
  notificationStore.hideNotification();

  // 인분 계산
  const totalCalories = finalFoodData.value.calories * form.value.servings;
  const totalCarbs = finalFoodData.value.carbs * form.value.servings;
  const totalProtein = finalFoodData.value.protein * form.value.servings;
  const totalFat = finalFoodData.value.fat * form.value.servings;

  const payload = {
    date: form.value.date,
    mealType: form.value.mealType,
    foodName: finalFoodData.value.foodName,
    servings: form.value.servings,
    calories: totalCalories,
    carbs: totalCarbs,
    protein: totalProtein,
    fat: totalFat,
    // image: imageFileToUpload.value ? imageFileToUpload.value : undefined // 추후 서버 저장 시 사용
  };

  try {
    if (imageFileToUpload.value) {
      // 이미지 파일이 있는 경우 (이름 + 이미지 케이스), FormData로 전송
      const formData = new FormData();
      for (const key in payload) {
        formData.append(key, payload[key]);
      }
      formData.append('image', imageFileToUpload.value);
      await apiClientForMultipart.post('/diet-logs', formData);
    } else {
      // 이미지 파일이 없는 경우 (이미지 온리, 이름 온리 케이스), JSON으로 전송
      await apiClient.post('/diet-logs', payload);
    }
    
    notificationStore.showNotification('식단 기록이 성공적으로 저장되었습니다.', 'success');
    emit('save-success');
    close();
  } catch (error) {
    console.error('식단 기록 저장 실패:', error); // 콘솔 에러는 유지하여 개발 중 디버깅 용이하게 함
    notificationStore.showNotification('식단 기록 저장에 실패했습니다. 다시 시도해주세요.', 'error');
  } finally {
    isLoading.value = false;
  }
};
</script>