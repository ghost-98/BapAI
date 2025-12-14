<template>
  <main class="mx-auto max-w-7xl px-6 py-12">
    <!-- Header -->
    <div class="mb-12">
      <h1 class="text-5xl font-bold text-gray-900 mb-3 tracking-tight">건강 대시보드</h1>
      <p class="text-gray-600 text-xl">AI가 분석한 {{ userName }}님의 건강 지수를 확인하세요</p>
    </div>

    <!-- Main Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <!-- Score -->
      <div class="bg-gradient-to-br from-orange-500 to-rose-600 rounded-2xl p-6 shadow-2xl shadow-orange-500/20 border border-orange-400/20">
        <div class="text-orange-100 text-sm font-medium mb-2">AI 건강 점수</div>
        <div class="text-6xl font-bold text-white mb-1">92</div>
        <div class="text-orange-100 text-sm">우수한 상태입니다</div>
      </div>

      <!-- Calories -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/80 hover:border-orange-400 transition-colors">
        <div class="text-gray-500 text-sm font-medium mb-2">칼로리</div>
        <div class="text-5xl font-bold text-gray-900 mb-1">1,680</div>
        <div class="text-orange-600 text-sm font-semibold">/ 2,200 kcal</div>
      </div>

      <!-- Protein -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/80 hover:border-amber-500 transition-colors">
        <div class="text-gray-500 text-sm font-medium mb-2">단백질</div>
        <div class="text-5xl font-bold text-gray-900 mb-1">95</div>
        <div class="text-amber-600 text-sm font-semibold">/ 120g</div>
      </div>

      <!-- Water -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/80 hover:border-rose-500 transition-colors">
        <div class="text-gray-500 text-sm font-medium mb-2">수분</div>
        <div class="text-5xl font-bold text-gray-900 mb-1">6</div>
        <div class="text-rose-600 text-sm font-semibold">/ 8 잔</div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Today's Meals -->
      <div class="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/80">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold text-gray-900">오늘의 식단</h2>
          <router-link to="/diet" class="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 transition-all">
            + 식사 추가
          </router-link>
        </div>

        <div class="space-y-4">
          <!-- Meal Item -->
          <div class="bg-gray-50/50 rounded-xl p-5 border border-gray-200/80 hover:border-orange-400 transition-colors">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span class="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-full">아침</span>
                  <span class="text-gray-500 text-sm">08:00</span>
                </div>
                <h3 class="text-gray-800 font-medium mb-1">스크램블 에그 & 아보카도 토스트</h3>
                <p class="text-gray-500 text-sm">달걀 2개, 통밀빵, 아보카도 1/2개</p>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-orange-600">420</div>
                <div class="text-gray-500 text-xs">kcal</div>
              </div>
            </div>
            <!-- Other meal items... -->
             <p class="text-center text-sm text-gray-500 pt-4">* 현재 이 식단 목록은 예시 데이터입니다.</p>
          </div>
        </div>
      </div>

      <!-- AI Analysis -->
      <div class="space-y-6">
        <!-- AI Card -->
        <div class="bg-gradient-to-br from-orange-500 to-rose-600 rounded-2xl p-6 shadow-2xl shadow-orange-500/20 border border-orange-400/20">
          <div class="flex items-center gap-3 mb-4">
            <div class="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span class="text-2xl">🤖</span>
            </div>
            <div>
              <h3 class="text-white font-bold text-lg">AI 분석</h3>
              <p class="text-orange-100 text-sm">실시간 업데이트</p>
            </div>
          </div>
          <p class="text-white/90 text-sm leading-relaxed mb-4">
            오늘 식단은 단백질과 섬유질이 풍부하여 매우 건강합니다! 저녁에는 생선이나 두부 요리를 추천드려요.
          </p>
          <button class="w-full py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors">
            상세 리포트
          </button>
        </div>

        <!-- Nutrition Chart -->
        <div class="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/80">
          <h3 class="text-gray-900 font-bold mb-6">영양소 분석</h3>
          <div class="space-y-5">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-gray-700 text-sm font-medium">탄수화물</span>
                <span class="text-orange-600 font-bold">180g</span>
              </div>
              <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style="width: 75%"></div>
              </div>
            </div>
             <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-gray-700 text-sm font-medium">단백질</span>
                <span class="text-rose-600 font-bold">95g</span>
              </div>
              <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full" style="width: 85%"></div>
              </div>
            </div>
             <p class="text-center text-xs text-gray-400 pt-4">* 현재 이 분석 차트는 예시 데이터입니다.</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const userName = ref('사용자');

onMounted(() => {
  const storedName = localStorage.getItem('name') || sessionStorage.getItem('name');
  if (storedName) {
    userName.value = storedName;
  }
});
</script>
