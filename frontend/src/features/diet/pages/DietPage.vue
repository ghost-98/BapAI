<template>
  <main class="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-8">
    <!-- Header -->
    <div class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50 flex items-center justify-between">
      <div>
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight">식단 기록</h1>
        <p class="text-gray-600 text-lg md:text-xl">기록된 식단을 확인하고 관리합니다.</p>
      </div>
      <button @click="openAddModal" class="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2 transform hover:scale-105">
        <Plus class="w-5 h-5" />
        새 식단
      </button>
    </div>

    <!-- Main Content Container -->
    <div class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50 space-y-6">
      
      <!-- Streak and Add Button -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div v-if="dietStreak.current_streak !== null" class="p-1 bg-gradient-to-br from-orange-200 to-rose-200 rounded-3xl shadow-lg">
          <div class="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/50 flex items-center">
            <Trophy class="w-8 h-8 text-orange-500 mr-4 flex-shrink-0" />
            <div>
              <p class="text-base font-semibold text-gray-800">식단 기록 연속 {{ dietStreak.current_streak }}일째!</p>
              <p class="text-sm text-gray-500">최고 기록: {{ dietStreak.longest_streak }}일</p>
            </div>
          </div>
        </div>
      </div>

      <!-- View Options & Period Navigator -->
      <div class="flex items-center justify-between bg-white/50 backdrop-blur-sm rounded-2xl p-2 border border-gray-200/80 shadow-sm mb-4">
        <div class="bg-gray-100 p-1 rounded-lg">
          <button 
            v-for="view in views" 
            :key="view.id" 
            @click="currentView = view.id"
            :class="[
              'px-4 py-1.5 rounded-md text-sm font-medium transition',
              currentView === view.id ? 'bg-white text-orange-600 shadow' : 'text-gray-600 hover:bg-gray-200'
            ]"
          >
            {{ view.name }}
          </button>
        </div>
        <div class="flex items-center space-x-2">
          <button @click="changePeriod(-1)" class="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <ChevronLeft class="w-5 h-5 text-gray-600" />
          </button>
          <span class="text-lg font-semibold text-gray-700 w-48 text-center">{{ currentPeriod }}</span>
          <button @click="changePeriod(1)" class="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <ChevronRight class="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

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

      <!-- Summary Section -->
      <div v-if="activeSubTab === 'summary'">
        <h2 class="text-xl font-bold text-gray-800 mb-4">{{ currentSubTabTitle }}</h2>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Daily Summary -->
          <template v-if="currentView === 'daily'">
            <div class="lg:col-span-2 p-1 bg-gradient-to-br from-orange-200 to-rose-200 rounded-3xl shadow-lg">
              <div class="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50">
                <div class="grid grid-cols-2 gap-6">
                  <div class="text-center">
                    <p class="text-sm text-gray-500">총 칼로리</p>
                    <p class="text-3xl font-bold text-orange-600">{{ dailySummary.totalCalories }} <span class="text-lg font-medium">kcal</span></p>
                  </div>
                  <div class="text-center">
                    <p class="text-sm text-gray-500">기록한 끼니</p>
                    <p class="text-3xl font-bold text-gray-800">{{ dailySummary.mealCount }}끼</p>
                  </div>
                </div>
                <div class="border-t my-4"></div>
                <div>
                  <h3 class="text-lg font-bold text-gray-700 mb-3">섭취 영양</h3>
                  <div class="space-y-4">
                    <div>
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-gray-700 text-sm font-medium">탄수화물</span>
                        <span class="text-orange-600 font-bold text-sm">{{ currentCarbs }}g / {{ targetCarbs }}g</span>
                      </div>
                      <div class="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" :style="{ width: carbProgress + '%' }"></div>
                      </div>
                    </div>
                    <div>
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-gray-700 text-sm font-medium">단백질</span>
                        <span class="text-rose-600 font-bold text-sm">{{ currentProtein }}g / {{ targetProtein }}g</span>
                      </div>
                      <div class="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full" :style="{ width: proteinProgress + '%' }"></div>
                      </div>
                    </div>
                    <div>
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-gray-700 text-sm font-medium">지방</span>
                        <span class="text-blue-600 font-bold text-sm">{{ currentFat }}g / {{ targetFat }}g</span>
                      </div>
                      <div class="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" :style="{ width: fatProgress + '%' }"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <WaterTracker />
          </template>
          <!-- Weekly/Monthly Summary -->
          <template v-else>
            <div class="lg:col-span-3 p-1 bg-gradient-to-br from-orange-200 to-rose-200 rounded-3xl shadow-lg">
              <div class="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 flex justify-around items-center">
                <div class="text-center">
                  <p class="text-sm text-gray-500">기간</p>
                  <p class="text-2xl font-bold text-gray-800">{{ periodSummary.periodDays }}일</p>
                </div>
                <div class="text-center">
                  <p class="text-sm text-gray-500">일 평균 칼로리</p>
                  <p class="text-2xl font-bold text-orange-600">{{ periodSummary.avgCalories }} <span class="text-lg font-medium">kcal</span></p>
                </div>
                <div class="text-center">
                  <p class="text-sm text-gray-500">총 기록한 끼니</p>
                  <p class="text-2xl font-bold text-gray-800">{{ periodSummary.totalMeals }} <span class="text-lg font-medium">끼</span></p>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Detailed Records Section -->
      <div v-if="activeSubTab === 'records'">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-800">식단 기록</h2>
          <button v-if="currentView === 'daily' && hasAnyRecordsToday" @click="shareDietPost" class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2 text-sm">
            <Share2 class="w-4 h-4" />
            식단 공유
          </button>
        </div>

        <!-- Daily View (contains meal records) -->
        <div v-if="currentView === 'daily'" class="space-y-6">
          <template v-if="hasAnyRecordsToday">
            <div v-for="meal in mealTypes" :key="meal.name">
              <div v-if="getRecordsByMealType(meal.name).length > 0" class="p-1 bg-gradient-to-br from-orange-200 to-rose-200 rounded-3xl shadow-lg">
                <div class="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50">
                  <div class="flex items-center mb-4">
                    <div :class="`w-12 h-12 rounded-full flex items-center justify-center mr-4 bg-${meal.color}-100`">
                      <component :is="meal.icon" :class="`w-6 h-6 text-${meal.color}-600`" />
                    </div>
                    <div>
                      <h3 class="text-xl font-semibold text-gray-800">{{ meal.name }}</h3>
                      <p class="text-sm text-gray-500">{{ getMealTotalCalories(meal.name) }} kcal</p>
                    </div>
                  </div>
                  <ul class="space-y-3">
                    <li v-for="record in getRecordsByMealType(meal.name)" :key="record.id" class="flex justify-between items-center group p-2 -m-2 rounded-lg hover:bg-white/50">
                      <span class="text-gray-700">{{ record.food }}</span>
                      <div class="flex items-center space-x-3">
                        <span class="text-gray-600 font-medium">{{ record.calories }} kcal</span>
                        <div class="transition-opacity">
                          <button @click="openEditModal(record)" class="text-gray-400 hover:text-orange-600 p-1">
                            <Pencil class="w-4 h-4" />
                          </button>
                          <button @click="handleDelete(record.id)" class="text-gray-400 hover:text-red-600 p-1">
                            <Trash2 class="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </template>
          <div v-else class="text-center py-12 text-gray-500">
            <p>오늘 기록된 식단이 없습니다.</p>
            <p class="mt-2 text-sm">새 식단 기록 버튼을 눌러 추가해보세요!</p>
          </div>
        </div>
      </div>

      <!-- AI 분석 Section -->
      <div v-if="currentView === 'daily' && activeSubTab === 'ai_analysis'">
        <h2 class="text-xl font-bold text-gray-800 mb-4">{{ currentSubTabTitle }}</h2>
        <div class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- AI 식단 추천 -->
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

            <!-- AI 식단 리포트 -->
            <DietReportCard 
              v-if="isToday(currentDate)"
              :report="aiDietReport"
              :is-loading="isReportLoading"
              class="mb-0"
            />

            <!-- AIRecommender (식단 점수) -->
            <div class="p-1 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-3xl shadow-lg">
              <div class="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50">
                <h3 class="text-lg font-bold text-gray-800 mb-4">식단 점수</h3>
                <AIRecommender />
              </div>
            </div>
          </div>
        </div>
      </div>

        <!-- Weekly View -->
        <div v-if="currentView === 'weekly'" class="p-1 bg-gradient-to-br from-orange-200 to-rose-200 rounded-3xl shadow-lg">
          <div class="w-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div v-for="day in weeklyData" :key="day.dateString" 
                  @click="goToDate(day.dateString)"
                  class="bg-white/50 p-4 rounded-2xl shadow-sm border flex flex-col cursor-pointer hover:border-orange-400 transition-all duration-300 hover:scale-105 hover:shadow-md">
                  <div class="text-center mb-3">
                      <p class="text-sm font-medium" :class="day.isToday ? 'text-orange-600' : 'text-gray-500'">{{ day.dayName }}</p>
                      <p class="text-2xl font-bold" :class="day.isToday ? 'text-orange-700' : 'text-gray-800'">{{ day.dateNum }}</p>
                  </div>
                  <div class="flex-grow space-y-2 mb-3">
                      <div v-for="meal in day.meals" :key="meal.type" class="flex items-center text-xs">
                          <component :is="meal.icon" :class="`w-4 h-4 mr-2 text-${meal.color}-500`" />
                          <span class="text-gray-600 truncate">{{ meal.food }}</span>
                      </div>
                      <p v-if="day.meals.length === 0" class="text-xs text-gray-400 text-center pt-4">기록 없음</p>
                  </div>
                  <div class="text-center">
                      <p class="text-sm font-semibold text-gray-800">{{ day.totalCalories }} kcal</p>
                      <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div class="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full" :style="{ width: `${(day.totalCalories / 2500) * 100}%` }"></div>
                      </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Monthly View -->
        <div v-if="currentView === 'monthly'" class="p-1 bg-gradient-to-br from-orange-200 to-rose-200 rounded-3xl shadow-lg">
          <div class="w-full bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/50">
            <div class="grid grid-cols-7 text-center font-semibold text-sm text-gray-600 mb-2">
                <div v-for="day in ['일', '월', '화', '수', '목', '금', '토']" :key="day">{{ day }}</div>
            </div>
            <div class="grid grid-cols-7 gap-1">
                <div v-for="day in monthlyData" :key="day.dateString"
                    @click="day.isCurrentMonth && goToDate(day.dateString)"
                    :class="[
                        'h-32 p-2 border rounded-lg flex flex-col', 
                        day.isCurrentMonth ? 'bg-white/50 cursor-pointer hover:border-orange-400' : 'bg-gray-50/20',
                        day.isToday ? 'border-orange-500 border-2' : 'border-transparent'
                    ]">
                    <p :class="['font-semibold', day.isCurrentMonth ? 'text-gray-700' : 'text-gray-400']">{{ day.dateNum }}</p>
                    <div v-if="day.totalCalories > 0" class="mt-2 text-xs text-center">
                        <p class="font-bold text-orange-700">{{ day.totalCalories }}</p>
                        <p class="text-gray-500">kcal</p>
                    </div>
                </div>
            </div>
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
import apiClient, { fetchDietStreak, getMealRecommendations, getAIDietReport } from '../../../api'
import { Plus, ChevronLeft, ChevronRight, Sunrise, Sunset, Moon, Utensils, Pencil, Trash2, Trophy, Sparkles, Share2 } from 'lucide-vue-next'
import DietModal from '../components/DietModal.vue'
import WaterTracker from '@/components/dashboard/WaterTracker.vue';
import DietReportCard from '../components/DietReportCard.vue'; // Import DietReportCard
import AIRecommender from '@/components/dashboard/AIRecommender.vue'; // Import AIRecommender

const isModalOpen = ref(false);
const selectedRecord = ref(null);

const currentDate = ref(new Date());
const currentView = ref('daily');
const views = [
  { id: 'daily', name: '일간' },
  { id: 'weekly', name: '주간' },
  { id: 'monthly', name: '월간' },
];

const mealTypes = [
  { name: '아침', icon: Sunrise, color: 'yellow' },
  { name: '점심', icon: Sunset, color: 'orange' },
  { name: '저녁', icon: Moon, color: 'blue' },
  { name: '간식', icon: Utensils, color: 'green' },
];

const toYYYYMMDD = (date) => date.toISOString().slice(0, 10);

const dietRecords = ref([]);
const dietStreak = ref({ current_streak: null, longest_streak: null });
const mealRecommendations = ref([]);
const aiDietReport = ref(null); // New ref for AI Diet Report
const isReportLoading = ref(false); // New ref for report loading state

const activeSubTab = ref('summary'); // Default active sub-tab
const subTabs = [
  { id: 'summary', name: '기간별 요약' },
  { id: 'records', name: '식단 기록' },
  { id: 'ai_analysis', name: 'AI 분석' },
];

const filteredSubTabs = computed(() => {
  let tabs = [];

  // Add Summary tab with dynamic name
  if (currentView.value === 'daily') {
    tabs.push({ id: 'summary', name: '일일 요약' });
  } else if (currentView.value === 'weekly') {
    tabs.push({ id: 'summary', name: '주간 요약' });
  } else if (currentView.value === 'monthly') {
    tabs.push({ id: 'summary', name: '월간 요약' });
  }

  // Add Records tab (static name)
  tabs.push({ id: 'records', name: '식단 기록' });

  // Add AI Analysis tab with dynamic name for daily, and static for others
  if (currentView.value === 'daily') {
    tabs.push({ id: 'ai_analysis', name: 'AI 요약' });
  } else { // For weekly and monthly
    tabs.push({ id: 'ai_analysis', name: 'AI 분석' });
  }

  return tabs;
});

const currentSubTabTitle = computed(() => {
  const activeTab = filteredSubTabs.value.find(tab => tab.id === activeSubTab.value);
  return activeTab ? activeTab.name : '';
});

// Nutrient data (placeholders)
const currentCarbs = ref(180);
const targetCarbs = ref(250);
const currentProtein = ref(95);
const targetProtein = ref(120);
const currentFat = ref(40);
const targetFat = ref(60);

const carbProgress = computed(() => (currentCarbs.value / targetCarbs.value) * 100);
const proteinProgress = computed(() => (currentProtein.value / targetProtein.value) * 100);
const fatProgress = computed(() => (currentFat.value / targetFat.value) * 100);


const isToday = (date) => toYYYYMMDD(date) === toYYYYMMDD(new Date());

const fetchDietData = async () => {
  try {
    let params = {};
    if (currentView.value === 'daily') {
      params = { date: toYYYYMMDD(currentDate.value) };
    } else if (currentView.value === 'weekly') {
      const startOfWeek = new Date(currentDate.value);
      startOfWeek.setDate(currentDate.value.getDate() - currentDate.value.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      params = { startDate: toYYYYMMDD(startOfWeek), endDate: toYYYYMMDD(endOfWeek) };
    } else if (currentView.value === 'monthly') {
      const startOfMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1);
      const endOfMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0);
      params = { startDate: toYYYYMMDD(startOfMonth), endDate: toYYYYMMDD(endOfMonth) };
    }
    const response = await apiClient.get(`/diet-logs`, { params });
    
    if (response.data && response.data.length === 0 && isToday(currentDate.value) && currentView.value === 'daily') {
      dietRecords.value = [
        {
          id: 999,
          date: toYYYYMMDD(new Date()),
          mealType: '점심',
          food: '닭가슴살 샐러드 (더미)',
          calories: 350,
          time: '12:30'
        }
      ];
    } else {
      dietRecords.value = response.data || [];
    }

    const streakResponse = await fetchDietStreak();
    dietStreak.value = streakResponse;

    if (currentView.value === 'daily' && isToday(currentDate.value)) {
      const now = new Date();
      const eatenMeals = dietRecords.value.filter(record => new Date(`${record.date}T${record.time || '00:00:00'}`) <= now);
      // Fetch Meal Recommendations
      const recommendations = await getMealRecommendations({
        current_date: toYYYYMMDD(now),
        current_time: now.toTimeString().slice(0, 5),
        eaten_meals: eatenMeals,
        user_goals: {},
        user_preferences: {}
      });
      mealRecommendations.value = recommendations.recommendations;

      // Fetch AI Diet Report
      isReportLoading.value = true;
      try {
        const report = await getAIDietReport(toYYYYMMDD(now));
        aiDietReport.value = report;
      } catch (reportError) {
        console.error('AI 식단 리포트 불러오기 실패:', reportError);
        aiDietReport.value = null;
      } finally {
        isReportLoading.value = false;
      }

    } else {
      mealRecommendations.value = [];
      aiDietReport.value = null; // Clear report if not daily and today
    }
  } catch (error) {
    console.error('식단 데이터를 불러오는 데 실패했습니다:', error);
  }
};

onMounted(() => {
  fetchDietData();
});

watch([currentDate, currentView], () => {
  fetchDietData();
  activeSubTab.value = 'summary'; // Reset active sub-tab when main view changes
});

const currentPeriod = computed(() => {
    const date = currentDate.value;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    if (currentView.value === 'daily') return `${year}년 ${month}월 ${day}일`;
    if (currentView.value === 'weekly') {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${toYYYYMMDD(startOfWeek)} ~ ${toYYYYMMDD(endOfWeek)}`;
    }
    if (currentView.value === 'monthly') return `${year}년 ${month}월`;
    return '';
});

const getRecordsByMealType = (mealType) => {
  return dietRecords.value.filter(r => r.mealType === mealType && r.date === toYYYYMMDD(currentDate.value));
};

const getMealTotalCalories = (mealType) => {
  return getRecordsByMealType(mealType).reduce((total, record) => total + record.calories, 0);
};

const dailySummary = computed(() => {
  const dailyRecords = dietRecords.value.filter(r => r.date === toYYYYMMDD(currentDate.value));
  const totalCalories = dailyRecords.reduce((sum, r) => sum + r.calories, 0);
  const mealCount = new Set(dailyRecords.map(r => r.mealType)).size;
  return { totalCalories, mealCount };
});

const hasAnyRecordsToday = computed(() => {
  return dietRecords.value.filter(r => r.date === toYYYYMMDD(currentDate.value)).length > 0;
});

const periodSummary = computed(() => {
  const totalMeals = dietRecords.value.length;
  const totalCalories = dietRecords.value.reduce((sum, r) => sum + r.calories, 0);
  
  let periodDays = 1;
  if (currentView.value === 'weekly') {
    periodDays = 7;
  } else if (currentView.value === 'monthly') {
    periodDays = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0).getDate();
  }
  
  const uniqueDays = new Set(dietRecords.value.map(r => r.date)).size;
  const avgCalories = uniqueDays > 0 ? Math.round(totalCalories / uniqueDays) : 0;
  return { periodDays, avgCalories, totalMeals };
});

const weeklyData = computed(() => {
    const date = new Date(currentDate.value);
    const dayOfWeek = date.getDay();
    const startDate = new Date(date);
    const dayDiff = (dayOfWeek === 0) ? -6 : 1 - dayOfWeek;
    startDate.setDate(date.getDate() + dayDiff);

    const week = [];
    for(let i=0; i<7; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        const dateString = toYYYYMMDD(d);
        const dailyRecords = dietRecords.value.filter(r => r.date === dateString);
        const totalCalories = dailyRecords.reduce((sum, r) => sum + r.calories, 0);
        const mealsSummary = mealTypes.map(mealType => {
            const mealRecords = dailyRecords.filter(r => r.mealType === mealType.name);
            if (mealRecords.length > 0) return { type: mealType.name, icon: mealType.icon, color: mealType.color, food: mealRecords.map(r => r.food).join(', ') };
            return null;
        }).filter(m => m !== null);

        week.push({
            dateString,
            dateNum: d.getDate(),
            dayName: ['일', '월', '화', '수', '목', '금', '토'][d.getDay()],
            isToday: toYYYYMMDD(d) === toYYYYMMDD(new Date()),
            totalCalories,
            meals: mealsSummary.slice(0, 3) 
        });
    }
    return week;
});

const monthlyData = computed(() => {
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
        const d = new Date(year, month, i);
        const dateString = toYYYYMMDD(d);
        const dailyRecords = dietRecords.value.filter(r => r.date === dateString);
        const totalCalories = dailyRecords.reduce((sum, r) => sum + r.calories, 0);

        calendarDays.push({
            dateString,
            dateNum: i,
            isCurrentMonth: true,
            isToday: dateString === toYYYYMMDD(new Date()),
            totalCalories: totalCalories
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
  const dateString = currentPeriod.value; // e.g., "2025년 12월 16일"
  const title = `[식단 공유] ${dateString} 식단 기록`;

  let content = `## ${dateString} 식단 요약\n\n`;
  content += `**총 섭취 칼로리:** ${dailySummary.value.totalCalories} kcal\n\n`;

  const dailyRecords = dietRecords.value.filter(r => r.date === toYYYYMMDD(currentDate.value));
  if (dailyRecords.length > 0) {
    content += `### 식단 상세\n`;
    mealTypes.forEach(mealType => {
      const recordsForMeal = dailyRecords.filter(r => r.mealType === mealType.name);
      if (recordsForMeal.length > 0) {
        content += `* **${mealType.name}**\n`;
        recordsForMeal.forEach(record => {
          content += `  - ${record.food} (${record.calories} kcal)\n`;
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
      category: 'REVIEW', // Use 'REVIEW' as the ID for '식단 공유'
      title: title,
      content: content
    }
  });
};
</script>
