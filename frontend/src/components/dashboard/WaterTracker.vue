<template>
  <div class="p-1 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-3xl shadow-lg">
    <div class="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50">
      
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-gray-800">수분 섭취량</h3>
        <button @click="isEditing = !isEditing" class="h-7 w-7 rounded-full flex items-center justify-center transition-all" :class="isEditing ? 'bg-gray-300 text-gray-700' : 'text-gray-400 hover:bg-gray-200'">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
          </svg>
        </button>
      </div>

      <!-- Goal Editing UI -->
      <div v-if="isEditing" class="flex items-center justify-center gap-4 mb-4 p-3 bg-gray-100/70 rounded-xl transition-all duration-300">
        <span class="text-sm font-medium text-gray-600">목표 설정:</span>
        <button @click="changeTarget(-1)" class="h-8 w-8 rounded-full bg-white text-gray-600 hover:bg-gray-50 shadow-md text-xl font-bold disabled:opacity-50" :disabled="goal <= 1">-</button>
        <span class="text-lg font-bold text-gray-800 w-8 text-center">{{ goal }}</span>
        <button @click="changeTarget(1)" class="h-8 w-8 rounded-full bg-white text-gray-600 hover:bg-gray-50 shadow-md text-xl font-bold disabled:opacity-50" :disabled="goal >= 16">+</button>
      </div>

      <!-- Main Visual -->
      <div class="flex items-center justify-center gap-6 my-6">
        <!-- Minus Button -->
        <button @click="changeIntake(-1)" :disabled="intake <= 0" class="h-14 w-14 rounded-full bg-white text-blue-500 hover:bg-blue-50 shadow-lg text-3xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-90">-</button>
        
        <!-- Glass Visual -->
        <div class="relative w-24 h-40 bg-gray-200/70 rounded-t-xl rounded-b-md border-b-4 border-gray-300/80 overflow-hidden">
          <!-- Water -->
          <div 
            class="absolute bottom-0 w-full transition-all duration-500 ease-in-out"
            :class="intake > goal ? 'bg-gradient-to-t from-cyan-400 to-green-400' : 'bg-gradient-to-t from-blue-500 to-cyan-400'"
            :style="{ height: `${Math.min(100, (intake / goal) * 100)}%` }"
          >
             <!-- Spillover effect -->
            <div v-if="intake > goal" class="absolute -top-2 w-full h-4 bg-green-300 rounded-full animate-pulse"></div>
          </div>
        </div>

        <!-- Plus Button -->
        <button @click="changeIntake(1)" class="h-14 w-14 rounded-full bg-white text-blue-500 hover:bg-blue-50 shadow-lg text-3xl font-bold transition-all transform active:scale-90">+</button>
      </div>

      <!-- Stats Text -->
      <div class="text-center h-10">
        <p class="text-4xl font-bold" :class="intake > goal ? 'text-green-600' : 'text-blue-600'">
          {{ intake }}<span class="text-2xl text-gray-500 font-medium"> / {{ goal }} 잔</span>
        </p>
        <p v-if="intake > goal" class="text-green-600 font-semibold mt-2">
          +{{ intake - goal }}잔 초과 달성!
        </p>
        <p v-else-if="isComplete" class="text-blue-600 font-semibold mt-2 animate-pulse">
          🎉 목표 달성! 🎉
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Droplet } from 'lucide-vue-next';
import { updateWaterCount, updateWaterGoal } from '../../api';
import { useNotificationStore } from '../../stores/notification';

const props = defineProps({
  intake: { type: Number, default: 0 },
  goal: { type: Number, default: 8 },
  date: { type: String, required: true }
});

const emit = defineEmits(['data-changed']);
const notificationStore = useNotificationStore();

const isEditing = ref(false);

const isComplete = computed(() => props.intake >= props.goal);

const changeIntake = async (amount) => {
  if (props.intake === 0 && amount < 0) return; // 0 미만으로 내려가지 않도록 방지
  const type = amount > 0 ? 'plus' : 'minus';
  try {
    await updateWaterCount(props.date, type);
    emit('data-changed');
  } catch (error) {
    notificationStore.showNotification('섭취량 변경에 실패했습니다.', 'error');
  }
};

const changeTarget = async (amount) => {
  const newTarget = props.goal + amount;
  if (newTarget <= 0 || newTarget > 16) return;

  const type = amount > 0 ? 'plus' : 'minus';
  try {
    await updateWaterGoal(props.date, type);
    emit('data-changed');
  } catch (error) {
    notificationStore.showNotification('목표량 변경에 실패했습니다.', 'error');
  }
};
</script>
