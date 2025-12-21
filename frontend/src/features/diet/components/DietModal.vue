<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-800">
          {{ 
            currentStep === 0 ? '식단 기록 방식 선택' : 
            currentStep === 1 || currentStep === 10 || currentStep === 20 ? '음식 정보 분석' :
            currentStep === 2 ? '음식 정보 확인' : 
            currentStep === 3 ? '세부 정보 입력' : '최종 확인 및 저장'
          }}
        </h2>
        <button @click="close" class="p-2 rounded-full hover:bg-gray-200 transition-colors">
          <X class="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <!-- Step 0: 입력 방식 선택 -->
      <div v-if="currentStep === 0" class="p-6 space-y-6">
        <InputMethodSelectionStep @method-selected="handleMethodSelected" />
      </div>

      <!-- Step 1, 10, 20: 분석 단계 (입력 컴포넌트) -->
      <div v-if="currentStep === 1" class="p-6 space-y-6">
        <FoodRecognitionStep @data-provided="handleDataProvided" />
      </div>
      <div v-if="currentStep === 10" class="p-6 space-y-6">
        <FoodNameInputStep @data-provided="handleDataProvided" />
      </div>
      <div v-if="currentStep === 20" class="p-6 space-y-6">
        <FoodNameAndImageInputStep @data-provided="handleDataProvided" />
      </div>

      <!-- Step 2: 음식명 확인 (AI 인식 후) -->
      <div v-if="currentStep === 2" class="p-6 space-y-6">
        <FoodConfirmationStep 
          :recognizedFoodData="recognizedFoodData" 
          @food-confirmed="handleFoodConfirmed"
          @re-analyze="handleReanalyze" 
        />
      </div>

      <!-- Step 3: 최종 식단 정보 입력 -->
      <div v-if="currentStep === 3" class="p-6 space-y-6">
        <div class="text-center mb-4">
          <p class="text-lg font-semibold text-gray-800">"{{ finalFoodData.foodName }}"</p>
          <p class="text-sm text-gray-500">(1인분 기준 {{ finalFoodData.kcal }} calories)</p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="date" class="block text-sm font-medium text-gray-700 mb-1">날짜</label>
            <input type="date" id="date" v-model="form.date" class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" required>
          </div>
          <div>
            <label for="time" class="block text-sm font-medium text-gray-700 mb-1">시간</label>
            <input type="time" id="time" v-model="form.time" class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" required>
          </div>
        </div>
        <div>
          <label for="mealType" class="block text-sm font-medium text-gray-700 mb-1">식사 종류</label>
          <select id="mealType" v-model="form.mealType" class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" required>
            <option v-for="meal in mealTypes" :key="meal.apiValue" :value="meal.apiValue">
              {{ meal.name }}
            </option>
          </select>
        </div>
        <div>
          <label for="servings" class="block text-sm font-medium text-gray-700 mb-1">인분</label>
          <input type="number" id="servings" v-model="form.servings" min="0.1" step="0.1" class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" required>
        </div>
      </div>

      <!-- Step 4: 최종 확인 -->
      <div v-if="currentStep === 4" class="p-6 space-y-4">
        <h3 class="text-lg font-bold text-center text-gray-800">아래 내용으로 기록할까요?</h3>
        <div class="bg-gray-50 rounded-lg p-4 space-y-3 border">
          <div class="flex justify-between items-baseline">
            <span class="font-semibold text-gray-600">날짜/시간:</span>
            <span class="font-bold text-gray-800">{{ form.date }} {{ form.time }}</span>
          </div>
          <div class="flex justify-between items-baseline">
            <span class="font-semibold text-gray-600">식사:</span>
            <span class="font-bold text-gray-800">{{ selectedMealTypeName }}</span>
          </div>
          <div class="flex justify-between items-baseline">
            <span class="font-semibold text-gray-600">음식:</span>
            <span class="font-bold text-gray-800">{{ finalFoodData.foodName }} ({{ form.servings }}인분)</span>
          </div>
          <div class="border-t my-2"></div>
          <div class="flex justify-between items-baseline">
            <span class="font-semibold text-gray-600">총 칼로리:</span>
            <span class="font-bold text-emerald-600 text-lg">{{ totalCalories.toFixed(1) }} kcal</span>
          </div>
          <div class="text-xs text-gray-500 space-y-1 text-right">
            <p>탄수화물: {{ totalCarbs.toFixed(1) }}g</p>
            <p>단백질: {{ totalProtein.toFixed(1) }}g</p>
            <p>지방: {{ totalFat.toFixed(1) }}g</p>
          </div>
        </div>
        <p v-if="imageFileToUpload" class="text-sm text-center text-gray-500">
          첨부 이미지: {{ imageFileToUpload.name }}
        </p>
      </div>
        
      <div class="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
        <button type="button" @click="close" class="bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold px-4 py-2 rounded-lg transition">
          취소
        </button>
        <button v-if="currentStep === 3 || currentStep === 4" type="button" @click="currentStep--" class="bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold px-4 py-2 rounded-lg transition">
          이전
        </button>
        <button v-if="currentStep === 2 || currentStep === 3" type="button" @click="handleNextStep" class="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold px-4 py-2 rounded-lg shadow-sm transition">
          다음
        </button>
        <button v-if="currentStep === 4" type="button" :disabled="isLoading" @click="handleFinalSave" class="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold px-4 py-2 rounded-lg shadow-sm transition disabled:bg-gray-400 disabled:cursor-not-allowed">
          {{ isLoading ? '저장 중...' : '기록하기' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { X } from 'lucide-vue-next'
import FoodRecognitionStep from './FoodRecognitionStep.vue';
import FoodConfirmationStep from './FoodConfirmationStep.vue';
import InputMethodSelectionStep from './InputMethodSelectionStep.vue';
import FoodNameInputStep from './FoodNameInputStep.vue';
import FoodNameAndImageInputStep from './FoodNameAndImageInputStep.vue';

import { apiClientForMultipart, analyzeFood } from '../../../api';
import { useNotificationStore } from '../../../stores/notification';

const props = defineProps({
  show: Boolean,
});

const emit = defineEmits(['close', 'save-success']);
const notificationStore = useNotificationStore();

const currentStep = ref(0);
const selectedInputMethod = ref(null);
const recognizedFoodData = ref(null);
const finalFoodData = ref(null);
const imageFileToUpload = ref(null);
const isLoading = ref(false);

const mealTypes = [
  { name: '아침', apiValue: 'BREAKFAST' },
  { name: '점심', apiValue: 'LUNCH' },
  { name: '저녁', apiValue: 'DINNER' },
  { name: '간식', apiValue: 'SNACK' },
];

const form = ref({
  date: new Date().toISOString().slice(0, 10),
  time: new Date().toTimeString().slice(0, 5),
  mealType: 'BREAKFAST',
  servings: 1,
});

const totalCalories = computed(() => (finalFoodData.value?.kcal || 0) * form.value.servings);
const totalCarbs = computed(() => (finalFoodData.value?.carbs || 0) * form.value.servings);
const totalProtein = computed(() => (finalFoodData.value?.protein || 0) * form.value.servings);
const totalFat = computed(() => (finalFoodData.value?.fat || 0) * form.value.servings);

const selectedMealTypeName = computed(() => {
  const selectedMeal = mealTypes.find(meal => meal.apiValue === form.value.mealType);
  return selectedMeal ? selectedMeal.name : '';
});

watch(() => props.show, (newVal) => {
  if (newVal) resetModal();
});

const resetModal = () => {
  currentStep.value = 0;
  selectedInputMethod.value = null;
  recognizedFoodData.value = null;
  finalFoodData.value = null;
  imageFileToUpload.value = null;
  isLoading.value = false;
  form.value = {
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 5),
    mealType: '아침',
    servings: 1,
  };
  notificationStore.hideNotification();
};

const close = () => emit('close');

const handleMethodSelected = (method) => {
  selectedInputMethod.value = method;
  if (method === 'imageOnly') currentStep.value = 1;
  else if (method === 'nameOnly') currentStep.value = 10;
  else if (method === 'nameAndImage') currentStep.value = 20;
  notificationStore.hideNotification();
};

const handleDataProvided = async ({ foodName, imageFile }) => {
  isLoading.value = true;
  notificationStore.showNotification('음식 정보를 분석 중입니다...', 'info');

  const formData = new FormData();
  if (foodName) formData.append('foodName', foodName);
  if (imageFile) {
    formData.append('image', imageFile);
    if (!foodName) imageFileToUpload.value = imageFile;
  }

  try {
    const analysisResult = await analyzeFood(formData);
    notificationStore.showNotification('음식 분석이 완료되었습니다.', 'success');

    if (selectedInputMethod.value === 'nameOnly' || selectedInputMethod.value === 'nameAndImage') {
      finalFoodData.value = analysisResult;
      currentStep.value = 3;
    } else {
      recognizedFoodData.value = analysisResult;
      currentStep.value = 2;
    }
  } catch (error) {
    notificationStore.showNotification('음식 분석에 실패했습니다. 다시 시도해주세요.', 'error');
  } finally {
    isLoading.value = false;
  }
};

const handleReanalyze = async (newFoodName) => {
  isLoading.value = true;
  notificationStore.showNotification('수정된 정보로 다시 분석 중입니다...', 'info');
  
  const formData = new FormData();
  formData.append('foodName', newFoodName);

  try {
    const analysisResult = await analyzeFood(formData);
    recognizedFoodData.value = analysisResult;
    notificationStore.showNotification('재분석 완료!', 'success');
  } catch (error) {
    notificationStore.showNotification('정보 조회에 실패했습니다. 다시 시도해주세요.', 'error');
  } finally {
    isLoading.value = false;
  }
};

const handleFoodConfirmed = (data) => {
  finalFoodData.value = data;
  currentStep.value = 3;
  notificationStore.hideNotification();
};

const handleNextStep = () => {
  if (currentStep.value === 3) {
    if (form.value.servings <= 0) {
      notificationStore.showNotification('인분은 0보다 커야 합니다.', 'error');
      return;
    }
  }
  currentStep.value++;
};

const handleFinalSave = async () => {
  if (!finalFoodData.value) {
    notificationStore.showNotification('음식 정보가 없습니다. 다시 시작해주세요.', 'error');
    return;
  }

  isLoading.value = true;
  notificationStore.hideNotification();

  const payload = {
    date: form.value.date,
    time: form.value.time,
    mealType: form.value.mealType,
    foodName: finalFoodData.value.foodName,
    servings: form.value.servings,
    calories: totalCalories.value,
    carbs: totalCarbs.value,
    protein: totalProtein.value,
    fat: totalFat.value,
  };

  try {
    const formData = new FormData();
    for (const key in payload) {
      formData.append(key, payload[key]);
    }

    if (imageFileToUpload.value) {
      formData.append('image', imageFileToUpload.value);
    }

    await apiClientForMultipart.post('/diet-logs', formData);
    
    notificationStore.showNotification('식단 기록이 성공적으로 저장되었습니다.', 'success');
    emit('save-success');
    close();
  } catch (error) {
    console.error('식단 기록 저장 실패:', error);
    notificationStore.showNotification('식단 기록 저장에 실패했습니다. 다시 시도해주세요.', 'error');
  } finally {
    isLoading.value = false;
  }
};
</script>