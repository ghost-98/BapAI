<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    
    <!-- Left Column -->
    <div class="lg:col-span-1 space-y-8">
      <!-- Group Info -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md border border-gray-200/80 p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">그룹 정보</h2>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between"><span class="font-semibold text-gray-600">상태</span><span :class="['font-bold', group.isPublic ? 'text-blue-600' : 'text-gray-800']">{{ group.isPublic ? '공개' : '비공개' }}</span></div>
          <div class="flex justify-between"><span class="font-semibold text-gray-600">멤버</span><span class="font-bold text-gray-800">{{ group.memberCount }} / {{ group.maxMember }} 명</span></div>
          <div class="flex justify-between"><span class="font-semibold text-gray-600">개설일</span><span class="font-bold text-gray-800">{{ group.createdAt }}</span></div>
        </div>
        <button class="mt-6 w-full px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2"><Users class="w-5 h-5" /><span>그룹 초대</span></button>
      </div>

      <!-- Member Spotlight -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md border border-gray-200/80 p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4">✨ 이주의 멤버</h3>
        <div class="space-y-4">
          <div v-for="member in spotlightMembers" :key="member.id" class="flex items-center gap-4 p-3 bg-gray-50/70 rounded-lg">
            <span class="text-2xl">{{ member.emoji }}</span>
            <div class="flex-grow">
              <p class="font-semibold text-gray-700">{{ member.title }}</p>
              <p class="text-sm text-gray-900 font-bold">{{ member.name }}</p>
            </div>
            <p class="text-sm text-orange-600 font-bold">{{ member.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column -->
    <div class="lg:col-span-2 space-y-8">

      <!-- Active Challenges -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md border border-gray-200/80 p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4">진행중인 챌린지</h3>
        <div class="space-y-4">
          <div v-for="challenge in activeChallenges" :key="challenge.id">
            <div class="flex justify-between text-sm font-medium text-gray-700 mb-1">
              <span class="font-semibold">{{ challenge.title }}</span>
              <span>{{ challenge.progress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div class="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full" :style="{ width: `${challenge.progress}%` }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Users } from 'lucide-vue-next';

// These props would be passed down from the main page
const props = defineProps({
  group: Object,
  recentPosts: Array,
  activeChallenges: Array,
  spotlightMembers: Array,
});

</script>
