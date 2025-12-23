<script setup>
import { ref, onMounted, computed } from 'vue';
import AIRecommender from '@/components/dashboard/AIRecommender.vue';
import TodayDiet from '@/components/dashboard/TodayDiet.vue';
import WaterTracker from '@/components/dashboard/WaterTracker.vue';
import NutritionAnalysis from '@/components/dashboard/NutritionAnalysis.vue';
import ScoreTrendChart from '@/components/dashboard/ScoreTrendChart.vue';
import DashboardCard from '@/components/common/DashboardCard.vue';
import { useAuthStore } from '../../../stores/auth';
import { getDietLogs } from '../../../api';
import { toYYYYMMDD } from '../../../utils/date';

const authStore = useAuthStore();
const myScores = ref([]);
const todaySummary = ref(null);
const todayDateString = toYYYYMMDD(new Date());

const fetchTodaySummary = async () => {
  try {
    const data = await getDietLogs({ date: todayDateString });
    todaySummary.value = data;
  } catch (error) {
    console.error("오늘의 요약 정보를 가져오는 데 실패했습니다:", error);
  }
};

const caloriesIntake = computed(() => todaySummary.value?.totalCalories || 0);
const caloriesGoal = computed(() => todaySummary.value?.caloriesGoal || 2200);
const aiScore = computed(() => todaySummary.value?.score || 0);

const aiScoreFeedback = computed(() => {
  if (aiScore.value >= 90) return "우수한 상태입니다";
  if (aiScore.value >= 70) return "좋은 상태입니다";
  if (aiScore.value >= 50) return "개선이 필요해요";
  return "관리가 필요해요";
});

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
  fetchTodaySummary();
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 py-12">
    <!-- Header -->
    <div class="mb-8 text-left">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight">건강 대시보드</h1>
      <p class="text-gray-600 text-lg md:text-xl">오늘의 식단과 영양 정보를 확인하고, AI 추천과 함께 건강 점수 추이를 관리해보세요.</p>
    </div>

    <!-- Main Dashboard Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-3 gap-6">
      
      <!-- Score Trend Chart (Main) -->
      <DashboardCard title="주간 건강 점수 추이" class="lg:col-span-2 lg:row-span-2">
        <ScoreTrendChart :scores="myScores" />
      </DashboardCard>

      <!-- Score & Calories (Sidebar) -->
      <DashboardCard class="lg:row-span-1">
        <div class="space-y-6">
          <div class="p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 text-white text-center shadow-lg">
            <div class="text-orange-100 text-sm font-medium mb-1">AI 건강 점수</div>
            <div class="text-6xl font-bold leading-tight">{{ aiScore }}</div>
            <div class="text-orange-100 text-sm">{{ aiScoreFeedback }}</div>
          </div>
          <div class="text-center p-4 bg-white/50 rounded-2xl">
            <div class="text-gray-500 text-sm font-medium mb-1">오늘 섭취 칼로리</div>
            <div class="text-5xl font-bold text-gray-900 leading-tight">{{ caloriesIntake }}</div>
            <div class="text-orange-600 text-sm font-semibold">/ {{ caloriesGoal }} kcal</div>
          </div>
        </div>
      </DashboardCard>

      <!-- Today's Diet -->
      <DashboardCard title="오늘의 식단" class="lg:col-span-2">
        <TodayDiet />
      </DashboardCard>

      <!-- Nutrition & Water (Sidebar) -->
      <DashboardCard title="영양소 및 수분 섭취" class="lg:row-span-1">
        <div class="space-y-4">
          <NutritionAnalysis />
          <WaterTracker 
            :intake="todaySummary?.waterCupCount || 0"
            :goal="todaySummary?.waterGoal || 8"
            :date="todayDateString"
            @data-changed="fetchTodaySummary"
          />
        </div>
      </DashboardCard>

      <!-- AI Recommender (Sidebar) -->
      <DashboardCard title="AI 식단 추천" class="lg:col-span-1">
        <AIRecommender />
      </DashboardCard>
    </div>

    <!-- Quick Add Floating Action Button -->
    <div class="fixed bottom-6 right-6 z-20">
      <button class="h-16 w-16 bg-gradient-to-br from-orange-500 to-rose-600 text-white rounded-full shadow-2xl shadow-orange-500/40 flex items-center justify-center transform hover:scale-110 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
          <path fill-rule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H3.75a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>