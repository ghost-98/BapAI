<template>
  <main class="mx-auto max-w-7xl px-4 sm:px-6 py-12">
    <!-- Header -->
    <div class="mb-8 bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight">건강 대시보드</h1>
      <p class="text-gray-600 text-lg md:text-xl">오늘의 식단과 영양 정보를 확인하고, AI 추천과 함께 건강 점수 추이를 관리해보세요.</p>
    </div>

    

    <!-- Main Dashboard Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Diet Group -->
      <div class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50 h-full">
        <h2 class="text-xl font-bold text-gray-800 mb-4">오늘의 식단과 AI 추천</h2>
        <div class="space-y-6">
          <TodayDiet />
          <AIRecommender />
        </div>
      </div>

      <!-- Intake Group -->
      <div class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50 h-full">
        <h2 class="text-xl font-bold text-gray-800 mb-4">오늘의 섭취량</h2>
        <div class="space-y-6">
          <!-- Calories Card -->
          <div class="p-1 bg-gradient-to-br from-orange-200 to-rose-200 rounded-3xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
            <div class="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50">
              <div class="text-gray-500 text-sm font-medium mb-2">오늘 섭취 칼로리</div>
              <div class="text-5xl font-bold text-gray-900 mb-1">1,680</div>
              <div class="text-orange-600 text-sm font-semibold">/ 2,200 kcal</div>
            </div>
          </div>
          <NutritionAnalysis />
          <WaterTracker />
        </div>
      </div>

      <!-- Score Group -->
      <div class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50 h-full">
        <h2 class="text-xl font-bold text-gray-800 mb-4">건강 점수</h2>
        <div class="space-y-6">
          <!-- AI Score Card -->
          <div class="p-1 bg-gradient-to-br from-orange-400 to-rose-500 rounded-3xl shadow-2xl shadow-orange-500/30">
            <div class="h-full w-full bg-gradient-to-br from-orange-500/90 to-rose-600/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div class="text-orange-100 text-sm font-medium mb-2">AI 건강 점수</div>
              <div class="text-6xl font-bold text-white mb-1">92</div>
              <div class="text-orange-100 text-sm">우수한 상태입니다</div>
            </div>
          </div>
          <ScoreTrendChart :scores="myScores" />
        </div>
      </div>
    </div>

    <!-- Quick Add Floating Action Button -->
    <div class="fixed bottom-6 right-6">
      <button class="h-16 w-16 bg-gradient-to-br from-orange-500 to-rose-600 text-white rounded-full shadow-2xl shadow-orange-500/40 flex items-center justify-center transform hover:scale-110 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
          <path fill-rule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H3.75a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AIRecommender from '@/components/dashboard/AIRecommender.vue';
import TodayDiet from '@/components/dashboard/TodayDiet.vue';
import WaterTracker from '@/components/dashboard/WaterTracker.vue';
import NutritionAnalysis from '@/components/dashboard/NutritionAnalysis.vue';
import ScoreTrendChart from '@/components/dashboard/ScoreTrendChart.vue';
import { useAuthStore } from '../../../stores/auth';

const authStore = useAuthStore();
const myScores = ref([]);

const generateLast7DaysScores = () => {
  const scores = [];
  const today = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    scores.push({
      date: date.toISOString().split('T')[0],
      day: days[date.getDay()],
      dateOfMonth: date.getDate(),
      value: Math.floor(Math.random() * 21) + 75,
    });
  }
  return scores;
};

onMounted(() => {
  myScores.value = generateLast7DaysScores();
});
</script>