<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-800">{{ isEditing ? '식단 수정' : '새 식단 기록' }}</h2>
        <button @click="close" class="p-2 rounded-full hover:bg-gray-200 transition-colors">
          <X class="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <form @submit.prevent="handleSave">
        <div class="p-6 space-y-6">
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
            <label for="image" class="block text-sm font-medium text-gray-700 mb-1">사진 첨부</label>
            <input type="file" id="image" @change="handleFileChange" accept="image/*" class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" :required="!isEditing">
            <p v-if="fileName" class="mt-2 text-sm text-gray-600">선택된 파일: {{ fileName }}</p>
          </div>
        </div>
        
        <div class="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
          <button type="button" @click="close" class="bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold px-4 py-2 rounded-lg transition">
            취소
          </button>
          <button type="submit" :disabled="isLoading" class="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold px-4 py-2 rounded-lg shadow-sm transition disabled:bg-gray-400 disabled:cursor-not-allowed">
            {{ isLoading ? '저장 중...' : '저장' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { X } from 'lucide-vue-next'
import { apiClientForMultipart } from '../../../api'; // Multipart 전용 클라이언트 임포트

const props = defineProps({
  show: Boolean,
  dietRecord: Object,
});

const emit = defineEmits(['close', 'save-success']);

const form = ref({
  id: null,
  date: new Date().toISOString().slice(0, 10),
  mealType: '아침',
});
const imageFile = ref(null);
const fileName = ref('');
const isLoading = ref(false);

const isEditing = computed(() => props.dietRecord && props.dietRecord.id);

watch(() => props.dietRecord, (newRecord) => {
  if (isEditing.value) {
    form.value = {
      id: newRecord.id,
      date: newRecord.date,
      mealType: newRecord.mealType,
    };
    imageFile.value = null;
    fileName.value = '';
  } else {
    form.value = {
      id: null,
      date: new Date().toISOString().slice(0, 10),
      mealType: '아침',
    };
    imageFile.value = null;
    fileName.value = '';
  }
}, { immediate: true });

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    imageFile.value = file;
    fileName.value = file.name;
  }
};

const close = () => {
  emit('close');
};

const handleSave = async () => {
  isLoading.value = true;
  const formData = new FormData();
  formData.append('date', form.value.date);
  formData.append('mealType', form.value.mealType);
  
  if (imageFile.value) {
    formData.append('image', imageFile.value);
  }

  try {
    if (isEditing.value) {
      // 수정 (PUT 또는 PATCH - 여기서는 PUT으로 가정)
      await apiClientForMultipart.put(`/diet-logs/${form.value.id}`, formData);
    } else {
      // 생성 (POST)
      await apiClientForMultipart.post('/diet-logs', formData);
    }
    emit('save-success');
    close();
  } catch (error) {
    console.error('식단 기록 저장 실패:', error);
    alert('식단 기록 저장에 실패했습니다.');
  } finally {
    isLoading.value = false;
  }
};
</script>
