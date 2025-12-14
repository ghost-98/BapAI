<template>
  <main class="mx-auto max-w-7xl px-6 py-12">
    <!-- 페이지 헤더 -->
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-4xl font-bold text-gray-900">식단 기록</h1>
      <button @click="openAddModal" class="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2">
        <Plus class="w-5 h-5" />
        새 식단 기록
      </button>
    </div>

    <!-- 보기 옵션 탭 -->
    <div class="flex items-center justify-between mb-8 bg-white/80 backdrop-blur-xl rounded-2xl p-2 border border-gray-200/80 shadow-sm">
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
        <button @click="changePeriod(-1)" class="p-2 rounded-full hover:bg-gray-200">
          <ChevronLeft class="w-5 h-5 text-gray-600" />
        </button>
        <span class="text-lg font-semibold text-gray-700 w-48 text-center">{{ currentPeriod }}</span>
        <button @click="changePeriod(1)" class="p-2 rounded-full hover:bg-gray-200">
          <ChevronRight class="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>

    <!-- 식단 기록 목록 (일간 보기) -->
    <div v-if="currentView === 'daily'" class="space-y-6">
      <div v-for="meal in mealTypes" :key="meal.name" class="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-md border border-gray-200/80">
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
          <li v-for="record in getRecordsByMealType(meal.name)" :key="record.id" class="flex justify-between items-center group p-2 -m-2 rounded-lg hover:bg-gray-50/50">
            <span class="text-gray-700">{{ record.food }}</span>
            <div class="flex items-center space-x-3">
              <span class="text-gray-600 font-medium">{{ record.calories }} kcal</span>
              <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="openEditModal(record)" class="text-gray-400 hover:text-orange-600 p-1">
                  <Pencil class="w-4 h-4" />
                </button>
                <button @click="handleDelete(record.id)" class="text-gray-400 hover:text-red-600 p-1">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </li>
          <li v-if="getRecordsByMealType(meal.name).length === 0" class="text-sm text-gray-400 text-center py-4">
            기록된 식단이 없습니다.
          </li>
        </ul>
      </div>
    </div>
    
    <!-- 주간 보기 -->
    <div v-if="currentView === 'weekly'" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div v-for="day in weeklyData" :key="day.dateString" 
            @click="goToDate(day.dateString)"
            class="bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-sm border flex flex-col cursor-pointer hover:border-orange-400 transition-all duration-300 hover:-translate-y-1">
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
    
    <!-- 월간 보기 -->
    <div v-if="currentView === 'monthly'" class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md border p-4">
        <div class="grid grid-cols-7 text-center font-semibold text-sm text-gray-600 mb-2">
            <div v-for="day in ['일', '월', '화', '수', '목', '금', '토']" :key="day">{{ day }}</div>
        </div>
        <div class="grid grid-cols-7 gap-1">
            <div v-for="day in monthlyData" :key="day.dateString"
                 @click="day.isCurrentMonth && goToDate(day.dateString)"
                 :class="[
                    'h-32 p-2 border rounded-lg flex flex-col', 
                    day.isCurrentMonth ? 'bg-white cursor-pointer hover:border-orange-400' : 'bg-gray-50/50',
                    day.isToday ? 'border-orange-500 border-2' : 'border-gray-200/80'
                 ]">
                <p :class="['font-semibold', day.isCurrentMonth ? 'text-gray-700' : 'text-gray-400']">{{ day.dateNum }}</p>
                <div v-if="day.totalCalories > 0" class="mt-2 text-xs text-center">
                    <p class="font-bold text-orange-700">{{ day.totalCalories }}</p>
                    <p class="text-gray-500">kcal</p>
                </div>
            </div>
        </div>
    </div>

    <!-- 식단 기록용 모달 -->
    <DietModal 
      :show="isModalOpen" 
      :diet-record="selectedRecord"
      @close="closeModal"
      @save="handleSave"
    />
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import apiClient from '../../api'
import { Plus, ChevronLeft, ChevronRight, Sunrise, Sunset, Moon, Utensils, Pencil, Trash2 } from 'lucide-vue-next'
import DietModal from '../../components/diet/DietModal.vue'

const isModalOpen = ref(false);
const selectedRecord = ref(null);

const currentDate = ref(new Date('2025-12-09T12:00:00'));
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

const dietRecords = ref([]);

const fetchDietLogs = async () => {
  try {
    const response = await apiClient.get(`/diet-logs`);
    dietRecords.value = response.data;
  } catch (error) {
    console.error('식단 기록을 불러오는 데 실패했습니다:', error);
  }
};

onMounted(() => {
  fetchDietLogs();
});

watch(currentDate, () => {
  fetchDietLogs();
});

const toYYYYMMDD = (date) => date.toISOString().slice(0, 10);

const currentPeriod = computed(() => {
    const date = currentDate.value;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    if (currentView.value === 'daily') return `${year}년 ${month}월 ${day}일`;
    if (currentView.value === 'weekly') {
        const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
        const weekOfMonth = Math.ceil((day + firstDayOfMonth -1) / 7);
        return `${year}년 ${month}월 ${weekOfMonth}주차`;
    }
    if (currentView.value === 'monthly') return `${year}년 ${month}월`;
    return '';
});

const getRecordsByMealType = (mealType) => {
  const todayStr = toYYYYMMDD(currentDate.value);
  return dietRecords.value.filter(r => r.mealType === mealType && r.date === todayStr);
};

const getMealTotalCalories = (mealType) => {
  return getRecordsByMealType(mealType).reduce((total, record) => total + record.calories, 0);
};

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

const handleSave = (recordToSave) => {
  if (recordToSave.id) {
    const index = dietRecords.value.findIndex(r => r.id === recordToSave.id);
    if (index !== -1) dietRecords.value[index] = recordToSave;
  } else {
    const newId = dietRecords.value.length > 0 ? Math.max(...dietRecords.value.map(r => r.id)) + 1 : 1;
    dietRecords.value.push({ ...recordToSave, id: newId });
  }
};

const handleDelete = (id) => {
  if (confirm('이 식단 기록을 정말 삭제하시겠습니까?')) {
    dietRecords.value = dietRecords.value.filter(r => r.id !== id);
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
</script>