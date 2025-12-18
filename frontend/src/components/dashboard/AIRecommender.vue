<template>
  <div class="p-1 bg-gradient-to-br from-orange-400 to-rose-500 rounded-3xl shadow-2xl shadow-orange-500/30 transition-all duration-300 hover:shadow-orange-500/50 hover:scale-[1.01]">
    <div class="h-full w-full bg-gradient-to-br from-orange-500/80 to-rose-600/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <div class="flex items-center gap-3 mb-4">
        <div class="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <span class="text-2xl">🤖</span>
        </div>
        <div>
          <h3 class="text-white font-bold text-lg">AI 식단 코칭</h3>
          <p class="text-orange-100 text-sm">실시간 분석</p>
        </div>
      </div>
      <p class="text-white/90 text-base leading-relaxed mb-4">
        {{ recommendation }}
      </p>
      <div class="bg-black/10 rounded-lg p-3 text-xs text-orange-100/80">
        <p><strong>AI 분석:</strong> {{ analysis }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// This would be reactive in a real app
const currentHour = new Date().getHours();
const remainingCalories = ref(800);
const deficientNutrient = ref('단백질');

const recommendation = computed(() => {
  if (currentHour < 11) {
    return `점심 식사 시간이에요! ${deficientNutrient.value}이(가) 풍부한 메뉴로 하루의 활력을 더해보세요.`;
  } else if (currentHour < 17) {
    return `출출한 오후, 간식이 필요하신가요? ${deficientNutrient.value} 보충을 위해 그릭요거트나 견과류는 어떠세요?`;
  } else {
    return `저녁 식사 시간입니다. 남은 칼로리(${remainingCalories.value}kcal)에 맞춰 가벼운 식사를 추천합니다.`;
  }
});

const analysis = computed(() => {
  return `현재 ${deficientNutrient.value} 섭취량이 목표치의 60%이며, 남은 칼로리는 ${remainingCalories.value}kcal 입니다.`;
});
</script>