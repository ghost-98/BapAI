<template>
  <div>
    <!-- Motivational Message -->
    <div class="mb-6 text-center">
      <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-full shadow-sm">
        <span class="text-lg">💪</span>
        <span class="text-sm text-gray-600">{{ motivationalMessage }}</span>
      </div>
    </div>

    <!-- Main Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <!-- Score -->
      <div class="bg-gradient-to-br from-orange-500 to-rose-600 rounded-2xl p-6 shadow-2xl shadow-orange-500/20 border border-orange-400/20">
        <div class="text-orange-100 text-sm font-medium mb-2">AI 건강 점수</div>
        <div class="text-6xl font-bold text-white mb-1">92</div>
        <div class="text-orange-100 text-sm">우수한 상태입니다</div>
      </div>

      <!-- Calories -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/80 hover:border-orange-400 transition-colors">
        <div class="text-gray-500 text-sm font-medium mb-2">오늘 섭취 칼로리</div>
        <div class="text-5xl font-bold text-gray-900 mb-1">1,680</div>
        <div class="text-orange-600 text-sm font-semibold">/ 2,200 kcal</div>
      </div>

      <!-- Protein -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/80 hover:border-amber-500 transition-colors">
        <div class="text-gray-500 text-sm font-medium mb-2">총 단백질</div>
        <div class="text-5xl font-bold text-gray-900 mb-1">95</div>
        <div class="text-amber-600 text-sm font-semibold">/ 120g</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const motivationalMessage = ref('');
const messages = [
  "오늘도 건강한 하루를 시작해볼까요?",
  "꾸준함이 건강을 만듭니다. 오늘도 화이팅!",
  "어제보다 더 건강한 오늘을 만들어보세요.",
  "당신의 건강한 습관을 BapAI가 응원합니다!",
  "작은 습관 하나가 당신의 내일을 바꿉니다."
];

onMounted(() => {
  const randomIndex = Math.floor(Math.random() * messages.length);
  motivationalMessage.value = messages[randomIndex];
});

// In a real app, these values would be props or fetched from a store.
</script>