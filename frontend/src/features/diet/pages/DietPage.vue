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
              <p class="text-base font-semibold text-gray-800">식단 기록 연속 {{ dietStreak.currentStreak }}일째!</p>
              <p class="text-sm text-gray-500">최고 기록: {{ dietStreak.longestStreak }}일</p>
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

      <!-- 요약 탭 -->
      <div v-if="activeSubTab === 'summary'">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">일일 요약</h2>
        <div class="grid grid-cols-1">
          <!-- 일일 요약 -->
          <template v-if="currentView === 'daily'">
            <DailySummaryOverview
              :daily-summary-data="dailySummaryData"
              :ai-diet-report="aiDietReport"
              :meal-recommendations="mealRecommendations"
              :date="toYYYYMMDD(currentDate)"
              @data-changed="fetchDietData"
            />
          </template>
          <!-- 주간/월간 요약 -->
          <template v-else>
            <div class="lg:col-span-3 p-1 bg-gradient-to-br from-orange-200 to-rose-200 rounded-3xl shadow-lg">
              <div class="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 flex justify-around items-center">
                <div v-if="currentView === 'monthly'" class="text-center">
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
          <h2 class="text-xl font-bold text-gray-800">상세 식단 기록</h2>
          <button v-if="currentView === 'daily' && hasAnyRecordsToday" @click="shareDietPost" class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2 text-sm">
            <Share2 class="w-4 h-4" />
            식단 공유
          </button>
        </div>

        <!-- 일일 식단 기록 -->
        <div v-if="currentView === 'daily'" class="p-1 bg-gradient-to-br from-orange-200 to-rose-200 rounded-3xl shadow-lg">
          <div class="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <template v-if="hasAnyRecordsToday">
                <div v-for="meal in mealTypes" :key="meal.name" class="col-span-1">
                  <div class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50 space-y-4 h-full">
                    <!-- Meal Header -->
                    <div class="flex items-center justify-between pb-4 border-b border-gray-200/80">
                      <h3 class="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <component :is="meal.icon" :class="`w-7 h-7 text-${meal.color}-600`" />
                        {{ meal.name }}
                        <span class="text-lg text-gray-500 font-medium ml-2">{{ getMealTotalCalories(meal.apiValue) }} kcal</span>
                      </h3>
                    </div>
                    <!-- Conditional content based on records -->
                    <template v-if="getRecordsByMealType(meal.apiValue).length > 0">
                      <!-- Record List -->
                      <div class="space-y-3">
                        <div v-for="record in getRecordsByMealType(meal.apiValue)" :key="record.dietId" 
                             class="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-between">
                          <div class="flex items-center gap-4 flex-grow">
                            <div class="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <!-- Placeholder for food image or icon -->
                            </div>
                            <div class="flex-grow">
                              <p class="font-bold text-gray-800 text-lg flex items-center gap-2">{{ record.foodName }} <span class="text-sm font-normal text-gray-500">{{ record.time }}</span></p>
                              <p class="text-sm text-gray-600 font-semibold">{{ record.kcal.toFixed(0) }} kcal ({{ record.servings }}인분)</p>
                              <div class="flex gap-3 text-xs text-gray-500 mt-1">
                                <p>탄: {{ record.carbs.toFixed(1) }}g</p>
                                <p>단: {{ record.protein.toFixed(1) }}g</p>
                                <p>지: {{ record.fat.toFixed(1) }}g</p>
                              </div>
                            </div>
                          </div>
                          <div class="flex flex-col items-end ml-4">
                            <button @click="openEditModal(record)" class="p-2 text-gray-400 hover:text-orange-600 rounded-full hover:bg-gray-100"><Pencil class="w-4 h-4" /></button>
                            <button @click="handleDelete(record.dietId)" class="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"><Trash2 class="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <div class="text-center py-4 text-gray-500">
                        <p>{{ meal.name }} 기록이 없습니다.</p>
                      </div>
                    </template>
                  </div>
                </div>
              </template>
              <div v-else class="text-center py-16">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <h3 class="mt-2 text-sm font-semibold text-gray-900">기록된 식단 없음</h3>
                <p class="mt-1 text-sm text-gray-500">새 식단 기록 버튼을 눌러 추가해보세요!</p>
              </div>
            </div>
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

            
          </div>
        </div>
      </div>

      <!-- 주간 식단 기록 -->
      <div v-if="currentView === 'weekly'">
        <!-- Weekly Summary Tab Content -->
        <div v-if="activeSubTab === 'summary'" class="p-1 bg-gradient-to-br from-orange-200 to-rose-200 rounded-3xl shadow-lg">
          <div class="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 space-y-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">주간 요약</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Total Calories -->
              <div class="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-lg text-center">
                <p class="text-sm text-gray-500">총 섭취 칼로리</p>
                <p class="text-3xl font-bold text-orange-600">{{ weeklyData.totalCalories }} <span class="text-xl font-medium">kcal</span></p>
              </div>
              <!-- Total Meals -->
              <div class="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-lg text-center">
                <p class="text-sm text-gray-500">총 기록한 끼니</p>
                <p class="text-3xl font-bold text-gray-800">{{ weeklyData.totalMealCount }} <span class="text-xl font-medium">끼</span></p>
              </div>
              <!-- Average Daily Calories -->
              <div class="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-lg text-center">
                <p class="text-sm text-gray-500">일 평균 칼로리</p>
                <p class="text-3xl font-bold text-gray-800">{{ Math.round(weeklyData.totalCalories / 7) }} <span class="text-xl font-medium">kcal</span></p>
              </div>
            </div>
            <!-- Weekly Macronutrients -->
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

        <!-- Daily Records within Weekly Tab Content -->
        <div v-if="activeSubTab === 'daily_records_weekly'">
          <div class="p-1 bg-gradient-to-br from-orange-200 to-rose-200 rounded-3xl shadow-lg">
            <div class="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 space-y-6">
              <h2 class="text-2xl font-bold text-gray-800 mb-4">일별 기록</h2>
              <!-- Day Selector -->
              <div class="grid grid-cols-7 gap-2 mb-6">
                <div v-for="dayIndex in 7" :key="dayIndex"
                     @click="selectedDayInWeeklyView = weeklyData.dailyLogs[dayIndex]"
                     :class="[
                       'p-3 rounded-xl text-center cursor-pointer transition-all duration-200',
                       'bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm',
                       selectedDayInWeeklyView?.dateString === weeklyData.dailyLogs[dayIndex]?.dateString ? 'ring-2 ring-orange-500 scale-105' : 'hover:scale-105 hover:shadow-md'
                     ]">
                  <p class="text-sm font-medium" :class="weeklyData.dailyLogs[dayIndex]?.isToday ? 'text-orange-600' : 'text-gray-600'">
                    {{ weeklyData.dailyLogs[dayIndex]?.dayName }}
                  </p>
                  <p class="text-xl font-bold" :class="weeklyData.dailyLogs[dayIndex]?.isToday ? 'text-orange-700' : 'text-gray-800'">
                    {{ weeklyData.dailyLogs[dayIndex]?.dateNum }}
                  </p>
                </div>
              </div>

              <!-- Selected Day's Records -->
              <div v-if="selectedDayInWeeklyView">
                <h3 class="text-xl font-bold text-gray-800 mb-4">{{ selectedDayInWeeklyView.dateString }} 식단</h3>
                <template v-if="selectedDayInWeeklyView.dietList.length > 0">
                  <div v-for="meal in mealTypes" :key="meal.name">
                    <div v-if="selectedDayInWeeklyView.dietList.filter(r => r.mealType === meal.apiValue).length > 0"
                         class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50 space-y-4 h-full mb-4">
                      <!-- Meal Header -->
                      <div class="flex items-center justify-between pb-4 border-b border-gray-200/80">
                        <h3 class="text-2xl font-bold text-gray-800 flex items-center gap-3">
                          <component :is="meal.icon" :class="`w-7 h-7 text-${meal.color}-600`" />
                          {{ meal.name }}
                          <span class="text-lg text-gray-500 font-medium ml-2">{{ selectedDayInWeeklyView.dietList.filter(r => r.mealType === meal.apiValue).reduce((total, record) => total + (record.kcal || 0), 0) }} kcal</span>
                        </h3>
                      </div>
                      <!-- Record List -->
                      <div class="space-y-3">
                        <div v-for="record in selectedDayInWeeklyView.dietList.filter(r => r.mealType === meal.apiValue)" :key="record.dietId" 
                             class="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-between">
                          <div class="flex items-center gap-4 flex-grow">
                            <div class="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <!-- Placeholder for food image or icon -->
                            </div>
                            <div class="flex-grow">
                              <p class="font-bold text-gray-800 text-lg flex items-center gap-2">{{ record.foodName }} <span class="text-sm font-normal text-gray-500">{{ record.time }}</span></p>
                              <p class="text-sm text-gray-600 font-semibold">{{ record.kcal.toFixed(0) }} kcal ({{ record.servings }}인분)</p>
                              <div class="flex gap-3 text-xs text-gray-500 mt-1">
                                <p>탄: {{ record.carbs.toFixed(1) }}g</p>
                                <p>단: {{ record.protein.toFixed(1) }}g</p>
                                <p>지: {{ record.fat.toFixed(1) }}g</p>
                              </div>
                            </div>
                          </div>
                          <div class="flex flex-col items-end ml-4">
                            <button @click="openEditModal(record)" class="p-2 text-gray-400 hover:text-orange-600 rounded-full hover:bg-gray-100"><Pencil class="w-4 h-4" /></button>
                            <button @click="handleDelete(record.dietId)" class="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"><Trash2 class="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
                <div v-else class="text-center py-16 bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-lg">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  <h3 class="mt-2 text-sm font-semibold text-gray-900">기록된 식단 없음</h3>
                  <p class="mt-1 text-sm text-gray-500">선택된 날짜에 기록된 식단이 없습니다.</p>
                </div>
              </div>
              <div v-else class="text-center py-16 bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-lg">
                <h3 class="mt-2 text-xl font-semibold text-gray-900">요일을 선택하여 기록을 확인하세요.</h3>
                <p class="mt-1 text-sm text-gray-500">위에서 요일을 클릭하면 해당 날짜의 식단 기록을 볼 수 있습니다.</p>
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
import { useRouter } from 'vue-router'
import apiClient, { getDietLogs, fetchDietStreak, getMealRecommendations, getAIDietReport } from '../../../api'
import { Plus, ChevronLeft, ChevronRight, Sunrise, Sunset, Moon, Utensils, Pencil, Trash2, Trophy, Share2 } from 'lucide-vue-next'
import DietModal from '../components/DietModal.vue'
import WaterTracker from '@/components/dashboard/WaterTracker.vue';
import DietReportCard from '../components/DietReportCard.vue'; // Import DietReportCard
import AIRecommender from '@/components/dashboard/AIRecommender.vue'; // Import AIRecommender
import DailySummaryOverview from '../components/DailySummaryOverview.vue'; // Import new component

const router = useRouter();
const isModalOpen = ref(false);
const selectedRecord = ref(null);
const dailySummaryData = ref(null);
const selectedDayInWeeklyView = ref(null); // To store the selected day's data from weeklyData.dailyLogs

const currentDate = ref(new Date());
const currentView = ref('daily');
const views = [
  { id: 'daily', name: '일간' },
  { id: 'weekly', name: '주간' },
  { id: 'monthly', name: '월간' },
];

const mealTypes = [
  { name: '아침', apiValue: 'BREAKFAST', icon: Sunrise, color: 'yellow' },
  { name: '점심', apiValue: 'LUNCH', icon: Sunset, color: 'orange' },
  { name: '저녁', apiValue: 'DINNER', icon: Moon, color: 'blue' },
  { name: '간식', apiValue: 'SNACK', icon: Utensils, color: 'green' },
];

import { toYYYYMMDD } from '../../../utils/date';

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

  if (currentView.value === 'daily') {
    tabs.push({ id: 'summary', name: '일일 요약' });
    tabs.push({ id: 'records', name: '식단 기록' });
    tabs.push({ id: 'ai_analysis', name: 'AI 요약' });
  } else if (currentView.value === 'weekly') {
    tabs.push({ id: 'summary', name: '주간 요약' }); // Weekly Summary
    tabs.push({ id: 'daily_records_weekly', name: '일별 기록' }); // Daily Records within Weekly
    tabs.push({ id: 'ai_analysis', name: 'AI 분석' });
  } else if (currentView.value === 'monthly') {
    tabs.push({ id: 'summary', name: '월간 요약' });
    tabs.push({ id: 'records', name: '식단 기록' }); // Monthly records can still be a list
    tabs.push({ id: 'ai_analysis', name: 'AI 분석' });
  }

  return tabs;
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
      const dayOfWeek = startOfWeek.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
      const diff = (dayOfWeek === 0) ? 1 : (1 - dayOfWeek); // Adjust to start from Monday
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

    if (currentView.value === 'daily') {
        dailySummaryData.value = responseData;
        dietRecords.value = responseData.dietList || [];
    } else { // weekly or monthly
        dailySummaryData.value = null; // Clear daily summary
        console.log('Debug: Raw responseData from getDietLogs (non-daily):', responseData);
        
        // responseData에서 dailyLogs를 추출하고, 각 요일의 dietList를 합칩니다.
        let allDietLists = [];
        if (responseData && responseData.dailyLogs) {
            for (const dayKey in responseData.dailyLogs) {
                if (responseData.dailyLogs[dayKey].dietList) {
                    allDietLists = allDietLists.concat(responseData.dailyLogs[dayKey].dietList);
                }
            }
        }
        dietRecords.value = allDietLists;
        
    }

    const streakResponse = await fetchDietStreak();
    dietStreak.value = streakResponse;

    if (currentView.value === 'daily' && isToday(currentDate.value)) {
      const now = new Date();
      const eatenMeals = (dailySummaryData.value?.dietList || []).filter(record => new Date(`${record.date}T${record.time || '00:00:00'}`) <= now);
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
                    const dayOfWeek = startOfWeek.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
            const diff = (dayOfWeek === 0) ? 1 : (1 - dayOfWeek); // Adjust to start from Monday
            startOfWeek.setDate(startOfWeek.getDate() + diff);
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
  return getRecordsByMealType(mealType).reduce((total, record) => total + (record.kcal || 0), 0);
};

const dailySummary = computed(() => {
  if (currentView.value === 'daily' && dailySummaryData.value) {
    return {
      totalCalories: dailySummaryData.value.totalCalories || 0,
      totalMealCount: dailySummaryData.value.totalMealCount || 0,
      totalSnackCount: dailySummaryData.value.totalSnackCount || 0,
    };
  }
  // 일별 데이터가 없거나 다른 보기일 경우의 기본값
  return { totalCalories: 0, totalMealCount: 0, totalSnackCount: 0 };
});

const hasAnyRecordsToday = computed(() => {
  return dietRecords.value.length > 0;
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
    const dayOfWeek = date.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
    const startOfWeek = new Date(date);
    // Adjust to start from Monday (0=Sun, 1=Mon, ..., 6=Sat)
    // If current day is Sunday (0), go back 6 days to get Monday
    // Otherwise, go back (dayOfWeek - 1) days to get Monday
    const diff = (dayOfWeek === 0) ? 1 : (1 - dayOfWeek); // Adjust to start from Monday
    startOfWeek.setDate(date.getDate() + diff);

    let totalWeeklyCalories = 0;
    let totalWeeklyCarbs = 0;
    let totalWeeklyProtein = 0;
    let totalWeeklyFat = 0;
    let totalWeeklyMeals = 0;
    const dailyLogs = {}; // Object to store daily data

    const weekDayNames = ['월', '화', '수', '목', '금', '토', '일'];

    for(let i=0; i<7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        const dateString = toYYYYMMDD(d);
        const dayIndex = i + 1; // 1 for Monday, ..., 7 for Sunday

        // Filter all diet records for this specific day
        const recordsForThisDay = dietRecords.value.filter(r => r.date === dateString);

        const dailyTotalCalories = recordsForThisDay.reduce((sum, r) => sum + (r.kcal || 0), 0);
        const dailyTotalCarbs = recordsForThisDay.reduce((sum, r) => sum + (r.carbs || 0), 0);
        const dailyTotalProtein = recordsForThisDay.reduce((sum, r) => sum + (r.protein || 0), 0);
        const dailyTotalFat = recordsForThisDay.reduce((sum, r) => sum + (r.fat || 0), 0);
        const dailyMealCount = recordsForThisDay.length;

        totalWeeklyCalories += dailyTotalCalories;
        totalWeeklyCarbs += dailyTotalCarbs;
        totalWeeklyProtein += dailyTotalProtein;
        totalWeeklyFat += dailyTotalFat;
        totalWeeklyMeals += dailyMealCount;

        dailyLogs[dayIndex] = {
            dateString,
            dateNum: d.getDate(),
            dayName: weekDayNames[i], // Adjusted day names
            isToday: toYYYYMMDD(d) === toYYYYMMDD(new Date()),
            totalCalories: dailyTotalCalories,
            totalCarbs: dailyTotalCarbs,
            totalProtein: dailyTotalProtein,
            totalFat: dailyTotalFat,
            dietList: recordsForThisDay // Full daily records
        };
    }

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Calculate end of week based on startOfWeek

    return {
        startDate: toYYYYMMDD(startOfWeek),
        endDate: toYYYYMMDD(endOfWeek),
        totalMealCount: totalWeeklyMeals,
        totalCalories: totalWeeklyCalories,
        totalCarbs: totalWeeklyCarbs,
        totalProtein: totalWeeklyProtein,
        totalFat: totalWeeklyFat,
        dailyLogs: dailyLogs
    };
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
  const today = new Date();
  const formattedDate = toYYYYMMDD(today);
  console.log('Debug: Current Date object:', today);
  console.log('Debug: Formatted Date (YYYY-MM-DD):', formattedDate);

  selectedRecord.value = {
      date: formattedDate // Always use today's date for new records
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
