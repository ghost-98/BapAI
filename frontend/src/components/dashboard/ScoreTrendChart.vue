<template>
  <div class="p-1 bg-gradient-to-br from-orange-200 to-rose-200 rounded-3xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
    <div class="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50">
      <h3 class="text-xl font-bold text-gray-800 mb-4">최근 7일 식단 점수 변화</h3>
      <div class="h-52 relative" ref="containerEl">
        <svg v-if="scores && scores.length" class="w-full h-full" :viewBox="`0 0 ${chartWidth} ${chartHeight}`">
          <!-- Grid Lines -->
          <g class="text-gray-200">
            <line v-for="y in gridLines" :key="y" x1="0" :y1="y" :x2="chartWidth" :y2="y" stroke="currentColor" stroke-width="1" stroke-dasharray="2,3" />
          </g>

          <!-- Line -->
          <path :d="linePath" fill="none" stroke="#f97316" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

          <!-- Points and Score Labels -->
          <g v-for="(point, index) in points" :key="`point-${index}`">
            <circle :cx="point.x" :cy="point.y" r="5" fill="white" stroke="#f97316" stroke-width="2" />
            <text :x="point.x" :y="point.y - 12" text-anchor="middle" font-size="12" font-weight="bold" fill="#c2410c">{{ scores[index].value }}</text>
          </g>

          <!-- X-Axis Labels (Date and Day) -->
          <g>
            <text
              v-for="(point, index) in points"
              :key="`label-${index}`"
              :x="point.x"
              :y="chartHeight - 5"
              text-anchor="middle"
              font-size="11"
              class="font-medium"
              :class="index === scores.length - 1 ? 'fill-rose-600 font-bold' : 'fill-gray-500'"
            >
              {{ scores[index].dateOfMonth }}({{ scores[index].day }})
            </text>
          </g>
        </svg>
        <div v-else class="h-full flex items-center justify-center text-gray-500">
          <p>점수 데이터가 없습니다.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  scores: {
    type: Array,
    required: true,
  }
});

const containerEl = ref(null);
const chartWidth = ref(500);
const chartHeight = ref(200);
const padding = 30;

let resizeObserver = null;

onMounted(() => {
  if (containerEl.value) {
    resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        chartWidth.value = entry.contentRect.width;
        chartHeight.value = entry.contentRect.height;
      }
    });
    resizeObserver.observe(containerEl.value);
  }
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

const points = computed(() => {
  if (!props.scores || props.scores.length === 0) return [];
  const maxScore = 105;
  const minScore = 0;
  const xPadding = 30;
  const yPadding = 30;

  const drawableWidth = chartWidth.value - (xPadding * 2);
  const drawableHeight = chartHeight.value - yPadding - 15;

  return props.scores.map((score, i) => {
    const x = xPadding + (i * drawableWidth / (props.scores.length - 1));
    const y = (chartHeight.value - yPadding) - ((score.value - minScore) / (maxScore - minScore)) * drawableHeight;
    return { x, y };
  });
});

const linePath = computed(() => {
  if (points.value.length < 2) return '';
  const path = points.value.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`);
  return path.join(' ');
});

const gridLines = computed(() => {
    const lines = [];
    for (let i = 0; i <= 4; i++) {
        lines.push(15 + i * (chartHeight.value - padding - 5) / 4);
    }
    return lines;
});
</script>