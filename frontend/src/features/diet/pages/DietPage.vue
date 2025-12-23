<template>
    <main class="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-8">
    <!-- Header -->
    <!-- Main Content Container -->
    <div class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50 space-y-6">
      
      <!-- Streak -->
      <div v-if="dietStreak.current_streak !== null" class="p-1 bg-gradient-to-br from-orange-200 to-rose-200 rounded-3xl shadow-lg">
        <div class="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/50 flex items-center">
          <Trophy class="w-8 h-8 text-orange-500 mr-4 flex-shrink-0" />
          <div>
            <p class="text-base font-semibold text-gray-800">식단 기록 연속 {{ dietStreak.currentStreak }}일째!</p>
            <p class="text-sm text-gray-500">최고 기록: {{ dietStreak.longestStreak }}일</p>
          </div>
        </div>
      </div>

      <!-- View Options & Period Navigator -->
      <DietViewChanger 
        v-model:currentView="currentView" 
        :current-period="currentPeriod"
        @change-period="changePeriod"
      />

      <!-- Sub-section Tabs -->
      <div class="flex justify-start border-b border-gray-200/80">
        <button 
          v-for="tab in filteredSubTabs" 
          :key="tab.id" 
          @click="activeSubTab = tab.id"
          :class="[
            'px-4 py-2 text-sm font-medium transition-colors border-b-2',
            activeSubTab === tab.id ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
          ]"
        >
          {{ tab.name }}
        </button>
      </div>

      <!-- 요약 탭 -->
      <div v-if="activeSubTab === 'summary'">
        <!-- 일일 요약 -->
        <template v-if="currentView === 'daily'">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">일일 요약</h2>
          <DailySummaryOverview
            :daily-summary-data="dailySummaryData"
            :ai-diet-report="aiDietReport"
            :meal-recommendations="mealRecommendations"
            :date="toYYYYMMDD(currentDate)"
            @data-changed="fetchDietData"
          />
        </template>
        <!-- 주간 요약 -->
        <template v-if="currentView === 'weekly'">
            <div class="p-1 bg-gradient-to-br from-orange-200 to-rose-200 rounded-3xl shadow-lg">
                <div class="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 space-y-6">
                    <h2 class="text-2xl font-bold text-gray-800 mb-4">주간 요약</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div class="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-lg text-center">
                          <p class="text-sm text-gray-500">총 섭취 칼로리</p>
                          <p class="text-3xl font-bold text-orange-600">{{ weeklyData.totalCalories }} <span class="text-xl font-medium">kcal</span></p>
                      </div>
                      <div class="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-lg text-center">
                          <p class="text-sm text-gray-500">총 식사</p>
                          <p class="text-3xl font-bold text-gray-800">{{ weeklyData.totalMealCount }} <span class="text-xl font-medium">끼</span></p>
                      </div>
                      <div class="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-lg text-center">
                          <p class="text-sm text-gray-500">총 간식</p>
                          <p class="text-3xl font-bold text-gray-800">{{ weeklyData.totalSnackCount }} <span class="text-xl font-medium">회</span></p>
                      </div>
                      <div class="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-lg text-center">
                          <p class="text-sm text-gray-500">일 평균 칼로리</p>
                          <p class="text-3xl font-bold text-gray-800">{{ Math.round(weeklyData.totalCalories / 7) }} <span class="text-xl font-medium">kcal</span></p>
                      </div>
                    </div>
                    <div class="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-lg">
                    <h3 class="text-lg font-bold text-gray-800 mb-3">주간 다량 영양소</h3>
                    <div class="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200/80">
                        <div class="text-center">
                        <p class="font-semibold text-gray-700 text-sm">총 탄수화물</p>
                        <p class="text-lg font-bold text-gray-800">{{ weeklyData.totalCarbs.toFixed(0) }}g</p>
                        </div>
                        <div class="text-center">
                        <p class="font-semibold text-gray-700 text-sm">총 단백질</p>
                        <p class="text-lg font-bold text-gray-800">{{ weeklyData.totalProtein.toFixed(0) }}g</p>
                        </div>
                        <div class="text-center">
                        <p class="font-semibold text-gray-700 text-sm">총 지방</p>
                        <p class="text-lg font-bold text-gray-800">{{ weeklyData.totalFat.toFixed(0) }}g</p>
                        </div>
                    </div>
                    <h3 class="text-lg font-bold text-gray-800 mb-3">일 평균 다량 영양소</h3>
                    <div class="grid grid-cols-3 gap-4">
                        <div class="text-center">
                        <p class="font-semibold text-gray-700 text-sm">탄수화물</p>
                        <p class="text-lg font-bold text-gray-800">{{ (weeklyData.totalCarbs / 7).toFixed(0) }}g</p>
                        </div>
                        <div class="text-center">
                        <p class="font-semibold text-gray-700 text-sm">단백질</p>
                        <p class="text-lg font-bold text-gray-800">{{ (weeklyData.totalProtein / 7).toFixed(0) }}g</p>
                        </div>
                        <div class="text-center">
                        <p class="font-semibold text-gray-700 text-sm">지방</p>
                        <p class="text-lg font-bold text-gray-800">{{ (weeklyData.totalFat / 7).toFixed(0) }}g</p>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </template>
        <!-- 월간 요약 -->
        <template v-if="currentView === 'monthly'">
          <div class="p-1 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-3xl shadow-lg">
            <div class="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 space-y-6">
              <h2 class="text-2xl font-bold text-gray-800 mb-4">월간 요약</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-lg text-center">
                    <p class="text-sm text-gray-500">총 섭취 칼로리</p>
                    <p class="text-3xl font-bold text-blue-600">{{ monthlySummaryForUI.totalCalories }} <span class="text-xl font-medium">kcal</span></p>
                </div>
                <div class="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-lg text-center">
                    <p class="text-sm text-gray-500">총 식사</p>
                    <p class="text-3xl font-bold text-gray-800">{{ monthlySummaryForUI.totalMealCount }} <span class="text-xl font-medium">끼</span></p>
                </div>
                <div class="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-lg text-center">
                    <p class="text-sm text-gray-500">총 간식</p>
                    <p class="text-3xl font-bold text-gray-800">{{ monthlySummaryForUI.totalSnackCount }} <span class="text-xl font-medium">회</span></p>
                </div>
                <div class="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-lg text-center">
                    <p class="text-sm text-gray-500">일 평균 칼로리</p>
                    <p class="text-3xl font-bold text-gray-800">{{ monthlySummaryForUI.avgCalories }} <span class="text-xl font-medium">kcal</span></p>
                </div>
              </div>
              <div class="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-lg">
                <h3 class="text-lg font-bold text-gray-800 mb-3">월간 다량 영양소</h3>
                <div class="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200/80">
                  <div class="text-center">
                    <p class="font-semibold text-gray-700 text-sm">총 탄수화물</p>
                    <p class="text-lg font-bold text-gray-800">{{ monthlySummaryForUI.totalCarbs.toFixed(0) }}g</p>
                  </div>
                  <div class="text-center">
                    <p class="font-semibold text-gray-700 text-sm">총 단백질</p>
                    <p class="text-lg font-bold text-gray-800">{{ monthlySummaryForUI.totalProtein.toFixed(0) }}g</p>
                  </div>
                  <div class="text-center">
                    <p class="font-semibold text-gray-700 text-sm">총 지방</p>
                    <p class="text-lg font-bold text-gray-800">{{ monthlySummaryForUI.totalFat.toFixed(0) }}g</p>
                  </div>
                </div>
                <h3 class="text-lg font-bold text-gray-800 mb-3">일 평균 다량 영양소</h3>
                <div class="grid grid-cols-3 gap-4">
                  <div class="text-center">
                    <p class="font-semibold text-gray-700 text-sm">탄수화물</p>
                    <p class="text-lg font-bold text-gray-800">{{ monthlySummaryForUI.avgCarbs }}g</p>
                  </div>
                  <div class="text-center">
                    <p class="font-semibold text-gray-700 text-sm">단백질</p>
                    <p class="text-lg font-bold text-gray-800">{{ monthlySummaryForUI.avgProtein }}g</p>
                  </div>
                  <div class="text-center">
                    <p class="font-semibold text-gray-700 text-sm">지방</p>
                    <p class="text-lg font-bold text-gray-800">{{ monthlySummaryForUI.avgFat }}g</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Daily Records -->
      <div v-if="currentView === 'daily' && activeSubTab === 'records'">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-800">상세 식단 기록</h2>
          <button v-if="hasAnyRecordsToday" @click="shareDietPost" class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2 text-sm">
            <Share2 class="w-4 h-4" />
            식단 공유
          </button>
        </div>
        <DailyRecordList 
            :records="dailyFilteredRecords"
            :meal-types="mealTypes"
            @edit-record="openEditModal"
            @delete-record="handleDelete"
        />
      </div>
      
      <!-- Weekly Records -->
      <WeeklyRecordList
        v-if="currentView === 'weekly' && activeSubTab === 'daily_records_weekly'"
        :weekly-data="weeklyData"
        :meal-types="mealTypes"
        @edit-record="openEditModal"
        @delete-record="handleDelete"
      />

      <!-- Monthly Calendar -->
      <MonthlyCalendar
        v-if="currentView === 'monthly' && activeSubTab === 'calendar'"
        :monthly-data="monthlyData"
        @date-clicked="goToDate"
      />

      <!-- AI 분석 Section -->
      <div v-if="activeSubTab === 'ai_analysis'">
        <h2 class="text-xl font-bold text-gray-800 mb-4">{{ currentSubTabTitle }}</h2>
        
        <!-- Daily AI Analysis -->
        <div v-if="currentView === 'daily'" class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div v-if="isToday(currentDate) && mealRecommendations.length > 0" class="p-1 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-3xl shadow-lg">
              <div class="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50">
                <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Sparkles class="w-6 h-6 text-purple-500" />
                  다음 식사 추천
                </h3>
                <ul class="space-y-2">
                  <li v-for="(rec, index) in mealRecommendations" :key="index" class="text-sm">
                    <p class="font-semibold text-purple-800">{{ rec.mealType }}: <span class="font-normal text-gray-700">{{ rec.suggestion }}</span></p>
                  </li>
                </ul>
              </div>
            </div>
            <DietReportCard 
              v-if="isToday(currentDate)"
              :report="aiDietReport"
              :is-loading="isReportLoading"
              class="mb-0"
            />
          </div>
        </div>

        <!-- Weekly/Monthly AI Analysis Placeholder -->
        <div v-if="currentView === 'weekly' || currentView === 'monthly'" class="text-center py-16 bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
          <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2.25 2.25 0 003.182 0l-7.23-7.23a2.25 2.25 0 00-3.182 0l-7.23 7.23a2.25 2.25 0 003.182 3.182L12 11.818l7.428 3.61z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.364v11.272" />
          </svg>
          <h3 class="mt-2 text-sm font-semibold text-gray-900">분석 기능 준비중</h3>
          <p class="mt-1 text-sm text-gray-500">{{ currentView === 'weekly' ? '주간' : '월간' }} 리포트 기능은 현재 준비중입니다.</p>
        </div>
      </div>
    </div>

    <!-- Diet Record Modal -->
    <DietModal 
      :show="isModalOpen" 
      :diet-record="selectedRecord"
      @close="closeModal"
      @save-success="handleSaveSuccess"
    />
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import apiClient, { getDietLogs, fetchDietStreak, getMealRecommendations, getAIDietReport } from '../../../api'
import { Sunrise, Sunset, Moon, Utensils, Trophy, Share2, Sparkles, Flame, UtensilsCrossed, Cookie, Repeat, Wheat, Beef, Nut } from 'lucide-vue-next'
import DietModal from '../components/modal/DietModal.vue'
import DietReportCard from '../components/shared/DietReportCard.vue';
import DailySummaryOverview from '../components/shared/DailySummaryOverview.vue';
import DietHeader from '../components/page/DietHeader.vue';
import DietViewChanger from '../components/page/DietViewChanger.vue';
import DailyRecordList from '../components/page/DailyRecordList.vue';
import WeeklyRecordList from '../components/page/WeeklyRecordList.vue';
import MonthlyCalendar from '../components/page/MonthlyCalendar.vue';
import MonthRecordList from '../components/page/MonthRecordList.vue';
import { toYYYYMMDD } from '../../../utils/date';

const router = useRouter();
const isModalOpen = ref(false);
const selectedRecord = ref(null);
const dailySummaryData = ref(null);
const weeklySummaryData = ref(null);
const monthlySummaryData = ref(null);

const currentDate = ref(new Date());
const currentView = ref('daily');

const mealTypes = [
  { name: '아침', apiValue: 'BREAKFAST', icon: Sunrise, color: 'yellow' },
  { name: '점심', apiValue: 'LUNCH', icon: Sunset, color: 'orange' },
  { name: '저녁', apiValue: 'DINNER', icon: Moon, color: 'blue' },
  { name: '간식', apiValue: 'SNACK', icon: Utensils, color: 'green' },
];

const dietRecords = ref([]);
const dietStreak = ref({ current_streak: null, longest_streak: null });
const mealRecommendations = ref([]);
const aiDietReport = ref(null);
const isReportLoading = ref(false);

const activeSubTab = ref('summary');

const filteredSubTabs = computed(() => {
  if (currentView.value === 'daily') {
    return [
      { id: 'summary', name: '일일 요약' },
      { id: 'records', name: '식단 기록' },
      { id: 'ai_analysis', name: 'AI 요약' },
    ];
  }
  if (currentView.value === 'weekly') {
    return [
      { id: 'summary', name: '주간 요약' },
      { id: 'daily_records_weekly', name: '일별 기록' },
      { id: 'ai_analysis', name: 'AI 분석' },
    ];
  }
  if (currentView.value === 'monthly') {
    return [
      { id: 'summary', name: '월간 요약' },
      { id: 'calendar', name: '달력' },
      { id: 'ai_analysis', name: 'AI 분석' },
    ];
  }
  return [];
});

const currentSubTabTitle = computed(() => {
  const activeTab = filteredSubTabs.value.find(tab => tab.id === activeSubTab.value);
  return activeTab ? activeTab.name : '';
});

const isToday = (date) => toYYYYMMDD(date) === toYYYYMMDD(new Date());

const fetchDietData = async () => {
  try {
    let params = {};
    if (currentView.value === 'daily') {
      params = { date: toYYYYMMDD(currentDate.value) };
    } else if (currentView.value === 'weekly') {
      const startOfWeek = new Date(currentDate.value);
      const dayOfWeek = startOfWeek.getDay();
      const diff = (dayOfWeek === 0) ? 1 : (1 - dayOfWeek);
      startOfWeek.setDate(startOfWeek.getDate() + diff);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      params = { startDate: toYYYYMMDD(startOfWeek), endDate: toYYYYMMDD(endOfWeek) };
    } else if (currentView.value === 'monthly') {
      const year = currentDate.value.getFullYear();
      const month = (currentDate.value.getMonth() + 1).toString().padStart(2, '0');
      params = { month: `${year}-${month}` };
    }

    const responseData = await getDietLogs(params);
    console.log(`[fetchDietData] API 응답 (원본, view: ${currentView.value}):`, JSON.parse(JSON.stringify(responseData)));


    if (currentView.value === 'daily') {
        dailySummaryData.value = responseData;
        dietRecords.value = responseData.dietList || [];
        weeklySummaryData.value = null; 
        monthlySummaryData.value = null;
    } else {
        dailySummaryData.value = null;
        if (currentView.value === 'weekly') {
            weeklySummaryData.value = responseData;
            console.log('[fetchDietData] weeklySummaryData에 저장됨:', JSON.parse(JSON.stringify(weeklySummaryData.value)));
            monthlySummaryData.value = null;
        } else if (currentView.value === 'monthly') {
            monthlySummaryData.value = responseData;
            console.log('[fetchDietData] monthlySummaryData에 저장됨:', JSON.parse(JSON.stringify(monthlySummaryData.value)));
            weeklySummaryData.value = null;
        }

        let allDietLists = [];
        if (responseData && responseData.dailyLogs) {
            for (const dayKey in responseData.dailyLogs) {
                if (responseData.dailyLogs[dayKey] && responseData.dailyLogs[dayKey].dietList) {
                    allDietLists = allDietLists.concat(responseData.dailyLogs[dayKey].dietList);
                }
            }
        }
        dietRecords.value = allDietLists;
    }

    const streakResponse = await fetchDietStreak();
    dietStreak.value = streakResponse;

    mealRecommendations.value = [];
    aiDietReport.value = null;
    if (currentView.value === 'daily' && isToday(currentDate.value)) {
      const now = new Date();
      const eatenMeals = (dailySummaryData.value?.dietList || []).filter(record => new Date(`${record.date}T${record.time || '00:00:00'}`) <= now);

      const recommendations = await getMealRecommendations({
        current_date: toYYYYMMDD(now),
        current_time: now.toTimeString().slice(0, 5),
        eaten_meals: eatenMeals,
        user_goals: {},
        user_preferences: {}
      });
      mealRecommendations.value = recommendations.recommendations;

      isReportLoading.value = true;
      try {
        const report = await getAIDietReport(toYYYYMMDD(now));
        aiDietReport.value = report;
      } catch (reportError) {
        console.error('AI 식단 리포트 불러오기 실패:', reportError);
      } finally {
        isReportLoading.value = false;
      }
    }
  } catch (error) {
    console.error('식단 데이터를 불러오는 데 실패했습니다:', error);
  }
};

onMounted(fetchDietData);

watch([currentDate, currentView], () => {
  fetchDietData();
  const defaultTabs = {
    daily: 'summary',
    weekly: 'summary',
    monthly: 'summary'
  };
  activeSubTab.value = defaultTabs[currentView.value] || 'summary';
});

const currentPeriod = computed(() => {
    const date = currentDate.value;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    if (currentView.value === 'daily') return `${year}년 ${month}월 ${day}일`;
    if (currentView.value === 'weekly') {
        const startOfWeek = new Date(date);
        const dayOfWeek = startOfWeek.getDay();
        const diff = (dayOfWeek === 0) ? 1 : (1 - dayOfWeek);
        startOfWeek.setDate(startOfWeek.getDate() + diff);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${toYYYYMMDD(startOfWeek)} ~ ${toYYYYMMDD(endOfWeek)}`;
    }
    if (currentView.value === 'monthly') return `${year}년 ${month}월`;
    return '';
});

const dailyFilteredRecords = computed(() => {
    if (currentView.value === 'daily') {
        return dietRecords.value;
    }
    return [];
});

const hasAnyRecordsToday = computed(() => {
    if (currentView.value !== 'daily') return false;
    return dietRecords.value.length > 0;
});

const monthlySummaryForUI = computed(() => {
    if (!monthlySummaryData.value) {
        return { totalCalories: 0, totalMealCount: 0, totalSnackCount: 0, avgCalories: 0, totalCarbs: 0, totalProtein: 0, totalFat: 0, avgCarbs: 0, avgProtein: 0, avgFat: 0 };
    }
    const data = monthlySummaryData.value;
    const daysInMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0).getDate();
    return {
        totalCalories: data.totalCalories || 0,
        totalMealCount: data.totalMealCount || 0,
        totalSnackCount: data.totalSnackCount || 0,
        avgCalories: daysInMonth > 0 ? Math.round((data.totalCalories || 0) / daysInMonth) : 0,
        totalCarbs: data.totalCarbs || 0,
        totalProtein: data.totalProtein || 0,
        totalFat: data.totalFat || 0,
        avgCarbs: daysInMonth > 0 ? ((data.totalCarbs || 0) / daysInMonth).toFixed(0) : 0,
        avgProtein: daysInMonth > 0 ? ((data.totalProtein || 0) / daysInMonth).toFixed(0) : 0,
        avgFat: daysInMonth > 0 ? ((data.totalFat || 0) / daysInMonth).toFixed(0) : 0,
    };
});

const weeklyData = computed(() => {
    console.log('[weeklyData] 실행됨. 입력 데이터 (weeklySummaryData):', JSON.parse(JSON.stringify(weeklySummaryData.value)));
    if (currentView.value !== 'weekly' || !weeklySummaryData.value) {
        return { totalCalories: 0, totalCarbs: 0, totalProtein: 0, totalFat: 0, totalMealCount: 0, totalSnackCount: 0, dailyLogs: {} };
    }

    const apiData = weeklySummaryData.value;
    const weekDayNames = ['월', '화', '수', '목', '금', '토', '일'];
    const startOfWeek = apiData.startDate ? new Date(apiData.startDate + 'T00:00:00') : new Date();

    const processedDailyLogs = {};
    if (apiData.dailyLogs) {
        for (let i = 0; i < 7; i++) {
            const dayIndex = i + 1;
            const log = apiData.dailyLogs[dayIndex] || { dietList: [] };

            const currentDayInLoop = new Date(startOfWeek);
            currentDayInLoop.setDate(startOfWeek.getDate() + i);

            processedDailyLogs[dayIndex] = {
                ...log,
                dateString: log.date || toYYYYMMDD(currentDayInLoop),
                dateNum: currentDayInLoop.getDate(),
                dayName: weekDayNames[i],
                isToday: toYYYYMMDD(currentDayInLoop) === toYYYYMMDD(new Date()),
            };
        }
    }

    const result = {
        startDate: apiData.startDate,
        endDate: apiData.endDate,
        totalMealCount: apiData.totalMealCount || 0,
        totalSnackCount: apiData.totalSnackCount || 0,
        totalCalories: apiData.totalCalories || 0,
        totalCarbs: apiData.totalCarbs || 0,
        totalProtein: apiData.totalProtein || 0,
        totalFat: apiData.totalFat || 0,
        dailyLogs: processedDailyLogs
    };
    console.log('[weeklyData] 반환될 최종 데이터:', result);
    return result;
});

const monthlyData = computed(() => {
    console.log('[monthlyData] 실행됨. 입력 데이터 (monthlySummaryData):', JSON.parse(JSON.stringify(monthlySummaryData.value)));
    if (currentView.value !== 'monthly' || !monthlySummaryData.value?.dailyLogs) return [];
    
    const apiLogs = monthlySummaryData.value.dailyLogs;
    const date = new Date(currentDate.value);
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const calendarDays = [];
    
    const firstDayWeekday = firstDayOfMonth.getDay();
    for (let i = firstDayWeekday; i > 0; i--) {
        const d = new Date(firstDayOfMonth);
        d.setDate(firstDayOfMonth.getDate() - i);
        calendarDays.push({ dateString: toYYYYMMDD(d), dateNum: d.getDate(), isCurrentMonth: false, totalCalories: 0 });
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const dayData = apiLogs[i] || {};
        const d = new Date(year, month, i);
        const dateString = toYYYYMMDD(d);

        calendarDays.push({
            dateString,
            dateNum: i,
            isCurrentMonth: true,
            isToday: dateString === toYYYYMMDD(new Date()),
            totalCalories: dayData.totalCalories || 0
        });
    }

    const lastDayWeekday = lastDayOfMonth.getDay();
    if (lastDayWeekday !== 6) {
        for (let i = 1; i <= 6 - lastDayWeekday; i++) {
            const d = new Date(lastDayOfMonth);
            d.setDate(lastDayOfMonth.getDate() + i);
            calendarDays.push({ dateString: toYYYYMMDD(d), dateNum: d.getDate(), isCurrentMonth: false, totalCalories: 0 });
        }
    }
    console.log('[monthlyData] 반환될 최종 달력 배열:', calendarDays);
    return calendarDays;
});


const openAddModal = () => {
  selectedRecord.value = {
      date: toYYYYMMDD(currentDate.value)
  };
  isModalOpen.value = true;
};

const openEditModal = (record) => {
  selectedRecord.value = { ...record };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleSaveSuccess = async () => {
  await fetchDietData();
};

const handleDelete = async (id) => {
  if (confirm('이 식단 기록을 정말 삭제하시겠습니까?')) {
    try {
      await apiClient.delete(`/diet-logs/${id}`);
      await fetchDietData();
    } catch (error) {
      console.error('식단 기록 삭제 실패:', error);
      alert('식단 기록 삭제에 실패했습니다.');
    }
  }
};

const goToDate = (dateString) => {
    currentDate.value = new Date(dateString + 'T12:00:00');
    currentView.value = 'daily';
};

const changePeriod = (amount) => {
    const newDate = new Date(currentDate.value);
    if(currentView.value === 'daily') newDate.setDate(newDate.getDate() + amount);
    if(currentView.value === 'weekly') newDate.setDate(newDate.getDate() + (amount * 7));
    if(currentView.value === 'monthly') newDate.setMonth(newDate.getMonth() + amount);
    currentDate.value = newDate;
};

const shareDietPost = () => {
  if (currentView.value !== 'daily') return;

  const dateString = currentPeriod.value;
  const title = `[식단 공유] ${dateString} 식단 기록`;
  
  let content = `## ${dateString} 식단 요약\n\n`;
  if (dailySummaryData.value) {
    content += `**총 섭취 칼로리:** ${dailySummaryData.value.totalCalories} kcal\n\n`;
  }

  const dailyRecords = dietRecords.value;
  if (dailyRecords.length > 0) {
    content += `### 식단 상세\n`;
    mealTypes.forEach(mealType => {
      const recordsForMeal = dailyRecords.filter(r => r.mealType === mealType.apiValue);
      if (recordsForMeal.length > 0) {
        content += `* **${mealType.name}**\n`;
        recordsForMeal.forEach(record => {
          content += `  - ${record.foodName} (${record.kcal.toFixed(0)} kcal)\n`;
        });
      }
    });
    content += '\n';
  } else {
    content += `기록된 식단이 없습니다.\n\n`;
  }

  if (aiDietReport.value && aiDietReport.value.summary) {
    content += `### AI 분석\n`;
    content += `${aiDietReport.value.summary}\n\n`;
  }

  router.push({
    name: 'BoardWrite',
    query: {
      category: 'REVIEW',
      title: title,
      content: content
    }
  });
};
</script>
