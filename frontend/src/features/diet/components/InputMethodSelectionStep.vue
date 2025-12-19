<template>
  <div class="flex flex-col items-center justify-center space-y-8 p-4">
    <h2 class="text-2xl font-bold text-gray-800 text-center">식단 기록 방식을 선택해주세요!</h2>
    <p class="text-md text-gray-600 text-center">원하는 방식으로 편리하게 식단을 기록할 수 있습니다.</p>

    <div class="w-full space-y-4">
      <button @click="selectMethod('imageOnly')" class="w-full flex flex-col items-center justify-center p-5 bg-white text-emerald-700 border border-emerald-300 rounded-xl shadow-sm hover:bg-emerald-50 hover:border-emerald-500 transition-all duration-200 group">
        <Camera class="w-8 h-8 mb-2 text-emerald-500 group-hover:text-emerald-700 transition-colors" />
        <span class="text-lg font-semibold">이미지로 기록</span>
        <span class="text-sm text-gray-500 text-center mt-1">AI가 사진을 분석하여 음식 정보를 찾아드려요.</span>
      </button>

      <button @click="selectMethod('nameOnly')" class="w-full flex flex-col items-center justify-center p-5 bg-white text-blue-700 border border-blue-300 rounded-xl shadow-sm hover:bg-blue-50 hover:border-blue-500 transition-all duration-200 group">
        <FileText class="w-8 h-8 mb-2 text-blue-500 group-hover:text-blue-700 transition-colors" />
        <span class="text-lg font-semibold">음식명으로 기록</span>
        <span class="text-sm text-gray-500 text-center mt-1">음식 이름을 직접 입력하여 정보를 확인하고 기록합니다.</span>
      </button>

      <button @click="selectMethod('nameAndImage')" class="w-full flex flex-col items-center justify-center p-5 bg-white text-purple-700 border border-purple-300 rounded-xl shadow-sm hover:bg-purple-50 hover:border-purple-500 transition-all duration-200 group">
        <ImagePlus class="w-8 h-8 mb-2 text-purple-500 group-hover:text-purple-700 transition-colors" />
        <span class="text-lg font-semibold">이름 + 이미지로 기록</span>
        <span class="text-sm text-gray-500 text-center mt-1">음식 이름과 사진을 함께 첨부하여 기록합니다.</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { Camera, FileText, ImagePlus } from 'lucide-vue-next';

const emit = defineEmits(['method-selected']);

const selectMethod = (method) => {
  emit('method-selected', method);
};
</script>