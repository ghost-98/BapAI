<template>
  <div class="p-1 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-3xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
    <div class="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50">
      <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Sparkles class="w-6 h-6 text-purple-500" />
        오늘의 AI 식단 리포트
      </h3>
      <div v-if="isLoading" class="text-center py-8 text-gray-500">
        <p>AI 식단 리포트를 불러오는 중입니다...</p>
      </div>
      <div v-else-if="report && report.summary" class="space-y-4">
        <p class="text-gray-700 leading-relaxed">{{ report.summary }}</p>
        <div v-if="report.insights && report.insights.length > 0">
          <h4 class="font-semibold text-gray-800 mb-2">주요 인사이트:</h4>
          <ul class="list-disc list-inside text-gray-600 space-y-1">
            <li v-for="(insight, index) in report.insights" :key="index">{{ insight }}</li>
          </ul>
        </div>
        <div v-if="report.recommendations && report.recommendations.length > 0">
          <h4 class="font-semibold text-gray-800 mb-2">개선 권장 사항:</h4>
          <ul class="list-disc list-inside text-gray-600 space-y-1">
            <li v-for="(rec, index) in report.recommendations" :key="index">{{ rec }}</li>
          </ul>
        </div>
      </div>
      <div v-else class="text-center py-8 text-gray-500">
        <p>아직 오늘의 식단 리포트가 없습니다.</p>
        <p class="mt-1 text-sm">식단을 기록하면 AI가 분석해드려요!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Sparkles } from 'lucide-vue-next';

const props = defineProps({
  report: {
    type: Object,
    default: () => null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});
</script>
