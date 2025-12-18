<template>
  <div class="p-1 bg-gradient-to-br from-orange-200 to-rose-200 rounded-3xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
    <div class="h-full w-full backdrop-blur-xl rounded-2xl p-6 border border-white/50 transition-all duration-500"
      :class="isComplete ? 'bg-gradient-to-br from-blue-500 to-cyan-400' : 'bg-white/80'">
      <div class="flex items-center justify-between mb-4">
        <div class="text-sm font-medium" :class="isComplete ? 'text-blue-100' : 'text-gray-500'">수분 섭취량</div>
        <div class="flex items-center gap-2">
          <div class="text-lg font-bold" :class="isComplete ? 'text-white' : 'text-gray-800'">
            {{ waterIntake }} / {{ waterTarget }} 잔
          </div>
          <button @click="isEditing = !isEditing" class="h-6 w-6 rounded-full flex items-center justify-center transition-colors" :class="isComplete ? 'text-white/70 hover:bg-white/20' : 'text-gray-400 hover:bg-gray-200'">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
              <path d="M10 3.75a2 2 0 100 4 2 2 0 000-4zM5.75 3.75a2 2 0 100 4 2 2 0 000-4zM14.25 3.75a2 2 0 100 4 2 2 0 000-4zM5.75 9.75a2 2 0 100 4 2 2 0 000-4zM10 9.75a2 2 0 100 4 2 2 0 000-4zM14.25 9.75a2 2 0 100 4 2 2 0 000-4zM5.75 15.75a2 2 0 100 4 2 2 0 000-4zM10 15.75a2 2 0 100 4 2 2 0 000-4zM14.25 15.75a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </button>
        </div>
      </div>

      <div v-if="isEditing" class="flex items-center justify-center gap-4 mb-4 p-3 bg-gray-100/70 rounded-lg">
        <span class="text-sm font-medium text-gray-600">목표 설정</span>
        <button @click="changeTarget(-1)" class="h-8 w-8 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300">-</button>
        <span class="text-lg font-bold text-gray-800">{{ waterTarget }}</span>
        <button @click="changeTarget(1)" class="h-8 w-8 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300">+</button>
      </div>

      <div v-if="isComplete" class="text-center mb-4">
        <p class="text-white font-bold text-lg animate-pulse">🎉 목표 달성! 수고하셨습니다! 🎉</p>
      </div>

      <div class="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-4 gap-2">
        <button
          v-for="i in waterTarget"
          :key="i"
          @click="setWater(i)"
          class="h-12 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center transform hover:scale-105"
          :class="i <= waterIntake ? (isComplete ? 'bg-white/90 text-blue-500' : 'bg-blue-500 text-white') : (isComplete ? 'bg-white/20 hover:bg-white/30 text-white/50' : 'bg-gray-200 hover:bg-gray-300 text-gray-400')"
        >
          <Droplet class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Droplet } from 'lucide-vue-next';

const waterIntake = ref(4);
const waterTarget = ref(8);
const isEditing = ref(false);

// Load saved target from localStorage on mount
onMounted(() => {
  const savedTarget = localStorage.getItem('waterTarget');
  if (savedTarget) {
    waterTarget.value = parseInt(savedTarget, 10);
  }
});

const isComplete = computed(() => waterIntake.value >= waterTarget.value);

const setWater = (amount) => {
  if (waterIntake.value === amount) {
    waterIntake.value = amount - 1;
  } else {
    waterIntake.value = amount;
  }
};

const changeTarget = (amount) => {
  const newTarget = waterTarget.value + amount;
  if (newTarget > 0 && newTarget <= 16) { // Set min/max target
    waterTarget.value = newTarget;
  }
};

// Save target to localStorage whenever it changes
watch(waterTarget, (newTarget) => {
  localStorage.setItem('waterTarget', newTarget);
  // Ensure intake doesn't exceed new target
  if (waterIntake.value > newTarget) {
    waterIntake.value = newTarget;
  }
});
</script>
