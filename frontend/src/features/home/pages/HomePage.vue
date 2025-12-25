<script setup>
import { ref, onMounted, computed } from 'vue';
import { Utensils, Droplets, Soup, BrainCircuit, TrendingUp, BarChart3, Scale, CalendarDays, ClipboardList } from 'lucide-vue-next';
import TodayDiet from '@/components/dashboard/TodayDiet.vue';
import WaterTracker from '@/components/dashboard/WaterTracker.vue';
import ScoreTrendChart from '@/components/dashboard/ScoreTrendChart.vue';
import DashboardCard from '@/components/common/DashboardCard.vue';
import { useAuthStore } from '../../../stores/auth';
import apiClient from '../../../api';
import { toYYYYMMDD, getRecent7DaysRange } from '../../../utils/date';

const authStore = useAuthStore();

// State
const todaySummary = ref(null);
const aiDietCoachingMessage = ref('');
const healthAnalysis = ref(null);
const weeklySummary = ref(null);
const myScores = ref([]);
const todayDateString = toYYYYMMDD(new Date());
const activeTab = ref('scoreTrend');

// Computed for Display
const formattedDate = computed(() => {
  const today = new Date();
  const fullDate = toYYYYMMDD(today); // e.g., "YYYY-MM-DD"
  const year = fullDate.substring(0, 4);
  const month = fullDate.substring(5, 7);
  const date = fullDate.substring(8, 10);
  const day = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()];
  return `${year}년 ${month}월 ${date}일 ${day}요일`;
});

// Daily Data Computeds
const caloriesIntake = computed(() => todaySummary.value?.totalCalories || 0);
const caloriesGoal = computed(() => healthAnalysis.value?.recCalories || 0);
const mealsEaten = computed(() => (todaySummary.value?.totalMealCount || 0));
const snacksEaten = computed(() => todaySummary.value?.totalSnackCount || 0);
const waterIntake = computed(() => todaySummary.value?.waterCupCount || 0);
const waterGoal = computed(() => todaySummary.value?.waterGoal || 8);
const aiScore = 73;
const dietList = computed(() => todaySummary.value?.dietList || []);

// Macronutrient Computeds
const carbsIntake = computed(() => todaySummary.value?.totalCarbs || 0);
const proteinIntake = computed(() => todaySummary.value?.totalProtein || 0);
const fatIntake = computed(() => todaySummary.value?.totalFat || 0);
const carbsGoal = computed(() => healthAnalysis.value?.recCarbs || 0);
const proteinGoal = computed(() => healthAnalysis.value?.recProtein || 0);
const fatGoal = computed(() => healthAnalysis.value?.recFat || 0);

const carbProgress = computed(() => carbsGoal.value > 0 ? Math.min((carbsIntake.value / carbsGoal.value) * 100, 100) : 0);
const proteinProgress = computed(() => proteinGoal.value > 0 ? Math.min((proteinIntake.value / proteinGoal.value) * 100, 100) : 0);
const fatProgress = computed(() => fatGoal.value > 0 ? Math.min((fatIntake.value / fatGoal.value) * 100, 100) : 0);



// Weekly Data Computeds
const weeklyTotalCalories = computed(() => weeklySummary.value?.totalCalories || 0);
const weeklyTotalCarbs = computed(() => weeklySummary.value?.totalCarbs || 0);
const weeklyTotalProtein = computed(() => weeklySummary.value?.totalProtein || 0);
const weeklyTotalFat = computed(() => weeklySummary.value?.totalFat || 0);
const weeklyTotalMeals = computed(() => (weeklySummary.value?.totalMealCount || 0));
const weeklyTotalSnacks = computed(() => (weeklySummary.value?.totalSnackCount || 0));

const weeklyDetailLog = computed(() => {
  if (!weeklySummary.value?.dailyLogs) return [];
  
  const { startDate } = getRecent7DaysRange();
  const start = new Date(startDate);
  const result = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const dayData = weeklySummary.value.dailyLogs[i + 1] || {};
    
    result.push({
      date: toYYYYMMDD(date).slice(5).replace('-', '/'),
      day: new Date(date).toLocaleDateString('ko-KR', { weekday: 'short' }),
      calories: (dayData.totalCalories || 0).toFixed(0),
      carbs: (dayData.totalCarbs || 0).toFixed(0),
      protein: (dayData.totalProtein || 0).toFixed(0),
      fat: (dayData.totalFat || 0).toFixed(0),
      meals: (dayData.totalMealCount || 0) + (dayData.totalSnackCount || 0),
    });
  }
  return result;
});


// --- Data Fetching and Transformation ---
const fetchTodaySummary = async () => {
  try {
    const response = await apiClient.get('/diet-logs/me', { params: { date: todayDateString} });
    todaySummary.value = response.data;
    console.log("fetchTodaySummary received:", response.data);
  } catch (error) {
    console.error("오늘의 요약 정보를 가져오는 데 실패했습니다:", error);
    todaySummary.value = {};
  }
};

const fetchHealthAnalysis = async () => {
  try {
    const response = await apiClient.get('/health/analyze/me');
    healthAnalysis.value = response.data;
    console.log("fetchHealthAnalysis received:", response.data);
  } catch (error) {
    console.error("건강 분석 정보를 가져오는 데 실패했습니다:", error);
    healthAnalysis.value = {};
  }
};

const transformWeeklyDataForChart = (weeklyData) => {
  const scores = [];
  const { startDate } = getRecent7DaysRange();
  const start = new Date(startDate);

  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const dayData = weeklyData?.dailyLogs ? weeklyData.dailyLogs[i + 1] : null;

    scores.push({
      date: toYYYYMMDD(date),
      day: new Date(date).toLocaleDateString('ko-KR', { weekday: 'short' }),
      dateOfMonth: date.getDate(),
      value: dayData?.score || 0,
    });
  }
  return scores;
}

const fetchWeeklySummary = async () => {
  try {
    const { startDate, endDate } = getRecent7DaysRange();
    const response = await apiClient.get('/diet-logs/me', { params: { startDate, endDate } });
    weeklySummary.value = response.data;
    myScores.value = transformWeeklyDataForChart(response.data);
  } catch (error) {
    console.error("주간 요약 정보를 가져오는 데 실패했습니다:", error);
    weeklySummary.value = {};
    myScores.value = transformWeeklyDataForChart(null);
  }
};

const fetchAiDietCoaching = async () => {
  try {
    const response = await apiClient.get('/ai/recommend');
    // Assuming the response data is directly the message or has a 'message' key
    aiDietCoachingMessage.value = response.data?.message || response.data || 'AI 식단 코칭을 불러오지 못했습니다.';
    console.log("fetchAiDietCoaching received:", response.data);
  } catch (error) {
    console.error("AI 식단 코칭을 가져오는 데 실패했습니다:", error);
    aiDietCoachingMessage.value = 'AI 식단 코칭을 불러오는 중 오류가 발생했습니다.';
  }
};

onMounted(async () => {
  await Promise.all([
    fetchTodaySummary(),
    fetchHealthAnalysis(),
    fetchWeeklySummary(),
    fetchAiDietCoaching()
  ]);
});
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">안녕하세요, <span class="text-orange-600">{{ authStore.userName }}님!</span></h1>
      <!-- Mini Dashboard in Header -->
      <div class="hidden md:flex items-center gap-3">
        <div class="w-24 h-24 p-3 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-200 flex flex-col justify-center items-center text-center shadow-lg border border-white/50">
          <BrainCircuit :size="24" class="text-orange-600 mb-1" />
          <p class="text-xs text-orange-900/70 font-semibold">AI 점수</p>
          <p class="text-lg font-bold text-orange-900">{{ aiScore }}<span class="text-sm font-medium">점</span></p>
        </div>
        <div class="w-24 h-24 p-3 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-200 flex flex-col justify-center items-center text-center shadow-lg border border-white/50">
          <Scale :size="24" class="text-emerald-600 mb-1" />
          <p class="text-xs text-emerald-900/70 font-semibold">칼로리</p>
          <p class="text-lg font-bold text-emerald-900">{{ caloriesIntake.toFixed(0) }}kcal</p>
        </div>
        <div class="w-24 h-24 p-3 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-200 flex flex-col justify-center items-center text-center shadow-lg border border-white/50">
          <Droplets :size="24" class="text-sky-600 mb-1" />
          <p class="text-xs text-sky-900/70 font-semibold">수분</p>
          <p class="text-lg font-bold text-sky-900">{{ waterIntake }}<span class="text-sm font-medium">잔</span></p>
        </div>
        <div class="w-24 h-24 p-3 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-200 flex flex-col justify-center items-center text-center shadow-lg border border-white/50">
          <Utensils :size="24" class="text-violet-600 mb-1" />
          <p class="text-xs text-violet-900/70 font-semibold">식사/간식</p>
          <p class="text-lg font-bold text-violet-900">{{ mealsEaten }}끼/{{ snacksEaten }}회</p>
        </div>
      </div>
    </div>
    
    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <!-- Main Column -->
      <DashboardCard class="lg:col-span-2">
        <div class="flex justify-between items-start mb-4">
          <!-- 날짜와 타이틀 통합 -->
          <h3 class="text-xl font-bold text-gray-800 bg-gradient-to-r from-orange-100 to-amber-100 px-4 py-2 rounded-full shadow-sm border border-white">
            오늘의 식단 - <span class="text-orange-600">{{ formattedDate }}</span>
          </h3>
          <!-- 섭취량 표시 개선 -->
          <div class="flex gap-4 items-center">
            <div class="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">
              <Utensils :size="16" />
              <span>식사 <span class="font-bold text-lg">{{ mealsEaten }}</span></span>
            </div>
            <div class="flex items-center gap-1 bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-sm font-semibold">
              <Soup :size="16" />
              <span>간식 <span class="font-bold text-lg">{{ snacksEaten }}</span></span>
            </div>
          </div>
        </div>
        <div class="bg-gray-50/50 p-2 rounded-lg max-h-[320px] overflow-y-auto pr-2">
           <TodayDiet :meals="dietList" />
        </div>
        <!-- Daily Summary section -->
        <div class="mt-6 border-t border-gray-200 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-4 bg-orange-50 rounded-2xl border border-orange-200/80">
              <h4 class="font-bold text-gray-800 flex items-center gap-2 mb-2"><Soup :size="20" class="text-orange-600"/>AI 식단 코칭</h4>
              <p class="text-sm text-gray-600">{{ aiDietCoachingMessage }}</p>
          </div>
          <div class="bg-white/60 rounded-xl p-4 border border-white/50">
              <h4 class="font-bold text-gray-800 mb-4">일일 영양소 분석</h4>
              <div class="space-y-4">
                  <div class="text-sm">
                    <div class="flex justify-between items-baseline mb-1">
                      <span class="font-medium text-gray-700">총 섭취 칼로리</span>
                      <span class="font-bold text-orange-600 text-base">{{ caloriesIntake.toFixed(0) }} / {{ caloriesGoal.toFixed(0) }} kcal</span>
                    </div>
                  </div>
                  <hr/>
                  <div>
                      <div class="flex items-center justify-between mb-2 text-sm">
                        <span class="font-medium text-gray-700">탄수화물</span>
                        <span class="font-bold">{{ carbsIntake.toFixed(0) }}g / {{ carbsGoal.toFixed(0) }}g</span>
                      </div>
                      <div class="h-2 bg-gray-200 rounded-full"><div class="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" :style="{ width: carbProgress + '%' }"></div></div>
                  </div>
                  <div>
                      <div class="flex items-center justify-between mb-2 text-sm">
                        <span class="font-medium text-gray-700">단백질</span>
                        <span class="font-bold">{{ proteinIntake.toFixed(0) }}g / {{ proteinGoal.toFixed(0) }}g</span>
                      </div>
                      <div class="h-2 bg-gray-200 rounded-full"><div class="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full" :style="{ width: proteinProgress + '%' }"></div></div>
                  </div>
                  <div>
                      <div class="flex items-center justify-between mb-2 text-sm">
                        <span class="font-medium text-gray-700">지방</span>
                        <span class="font-bold">{{ fatIntake.toFixed(0) }}g / {{ fatGoal.toFixed(0) }}g</span>
                      </div>
                      <div class="h-2 bg-gray-200 rounded-full"><div class="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" :style="{ width: fatProgress + '%' }"></div></div>
                  </div>
              </div>
          </div>
        </div>
      </DashboardCard>

      <!-- Sidebar Column -->
      <div class="lg:col-span-1 space-y-8">
        <DashboardCard>
          <div class="flex border-b border-gray-200">
            <button @click="activeTab = 'scoreTrend'" :class="['flex-1 py-3 text-center text-sm font-semibold transition-colors', activeTab === 'scoreTrend' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-800']">
              <span class="flex items-center justify-center gap-2"><TrendingUp :size="16"/>주간 점수 변화</span>
            </button>
            <button @click="activeTab = 'summary'" :class="['flex-1 py-3 text-center text-sm font-semibold transition-colors', activeTab === 'summary' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-800']">
              <span class="flex items-center justify-center gap-2"><CalendarDays :size="16"/>주간 요약</span>
            </button>
          </div>
          
          <div v-if="activeTab === 'scoreTrend'" class="py-6 px-2 space-y-6">
            <ScoreTrendChart :scores="myScores" />
          </div>

          <div v-if="activeTab === 'summary'" class="py-6 px-2 space-y-6">
            <h3 class="text-lg font-semibold text-gray-800">주간 총계</h3>
            <div class="text-sm text-gray-600 space-y-2 bg-gray-50 p-3 rounded-lg">
                <p class="flex justify-between"><span>총 섭취 칼로리:</span> <span class="font-semibold text-gray-800">{{ weeklyTotalCalories.toFixed(0) }} kcal</span></p>
                <p class="flex justify-between"><span>총 식사/간식:</span> <span class="font-semibold text-gray-800">{{ weeklyTotalMeals }} 끼 / {{ weeklyTotalSnacks }} 회</span></p>
            </div>
            <hr/>
            <h3 class="text-lg font-semibold text-gray-800">주간 상세 기록</h3>
            <div class="text-sm text-gray-600 space-y-2 max-h-48 overflow-y-auto">
              <div class="grid grid-cols-5 gap-2 font-semibold text-gray-800 border-b pb-2 mb-2 sticky top-0 bg-white/80 backdrop-blur-sm">
                <span class="col-span-1">날짜</span>
                <span class="text-right">칼로리</span>
                <span class="text-right">탄</span>
                <span class="text-right">단</span>
                <span class="text-right">지</span>
              </div>
              <div v-for="day in weeklyDetailLog" :key="day.date" class="grid grid-cols-5 gap-2 p-2 rounded-lg hover:bg-gray-100">
                <span class="font-semibold text-gray-800 col-span-1">{{day.date}}({{day.day}})</span>
                <span class="text-right">{{day.calories}}</span>
                <span class="text-right">{{day.carbs}}</span>
                <span class="text-right">{{day.protein}}</span>
                <span class="text-right">{{day.fat}}</span>
              </div>
            </div>
          </div>
        </DashboardCard>
        <WaterTracker
            :intake="waterIntake" :goal="waterGoal" :date="todayDateString"
            @data-changed="() => { fetchTodaySummary(); fetchHealthAnalysis(); }"
        />
      </div>
    </div>

    <!-- Quick Add Floating Action Button -->
    <div class="fixed bottom-6 right-6 z-20">
      <button class="h-16 w-16 bg-gradient-to-br from-orange-500 to-rose-600 text-white rounded-full shadow-2xl shadow-orange-500/40 flex items-center justify-center transform hover:scale-110 transition-transform">
        <Soup :size="32" />
      </button>
    </div>
  </div>
</template>