<template>
  <main class="mx-auto max-w-7xl px-6 py-12">
    <!-- 페이지 헤더 -->
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-4xl font-bold text-gray-900">그룹 활동</h1>
      <button class="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2">
        <Users class="w-5 h-5" />
        그룹 초대
      </button>
    </div>

    <!-- 탭 네비게이션 -->
    <div class="mb-8">
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl p-2 border border-gray-200/80 shadow-sm inline-flex space-x-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-6 py-2.5 rounded-lg font-bold transition-all text-sm flex items-center gap-2',
            activeTab === tab.id
              ? 'bg-white text-orange-600 shadow'
              : 'bg-transparent text-gray-600 hover:bg-gray-50/50'
          ]"
        >
          <component :is="tab.icon" class="w-5 h-5" />
          <span>{{ tab.name }}</span>
        </button>
      </div>
    </div>

    <!-- 탭 컨텐츠 -->
    <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md border border-gray-200/80 p-8">
      <!-- 랭킹 탭 -->
      <div v-if="activeTab === 'ranking'">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">그룹 랭킹</h2>
        <ul class="space-y-3">
          <li 
            v-for="(member, index) in ranking" 
            :key="member.id"
            :class="[
              'flex items-center p-4 rounded-xl transition-all',
              member.isCurrentUser ? 'bg-gradient-to-r from-orange-100 to-amber-100 border-l-4 border-orange-500 shadow-sm' : 'bg-gray-50/50 hover:bg-gray-100'
            ]"
          >
            <div class="flex items-center w-16">
              <span class="text-2xl font-bold" :class="getRankColor(index + 1)">{{ index + 1 }}</span>
            </div>
            <div class="flex-1 flex items-center gap-4">
              <img :src="`https://i.pravatar.cc/150?u=${member.id}`" class="w-12 h-12 rounded-full object-cover border-2 border-white shadow">
              <div>
                <p class="font-semibold text-gray-800">{{ member.name }} <span v-if="member.isCurrentUser" class="text-sm text-orange-600">(나)</span></p>
                <p class="text-sm text-gray-500">식단 점수</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold text-orange-600">{{ member.score }}<span class="text-lg text-gray-500">점</span></p>
            </div>
          </li>
        </ul>
      </div>

      <!-- 챌린지 탭 -->
      <div v-if="activeTab === 'challenges'">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">공통 챌린지</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="challenge in challenges" :key="challenge.id" class="bg-gray-50/50 rounded-2xl p-6 border border-gray-200/80 hover:border-orange-400 transition-all duration-300 hover:shadow-lg">
            <h3 class="font-bold text-lg text-gray-800 mb-2">{{ challenge.title }}</h3>
            <p class="text-sm text-gray-600 mb-4 h-10">{{ challenge.description }}</p>
            <div class="mb-2">
              <div class="flex justify-between text-sm font-medium text-gray-600 mb-1">
                <span>진행률</span>
                <span>{{ challenge.progress }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div class="bg-gradient-to-r from-amber-500 to-orange-500 h-2.5 rounded-full" :style="{ width: challenge.progress + '%' }"></div>
              </div>
            </div>
            <p class="text-xs text-gray-500 text-right">참여인원: {{ challenge.participants }}명</p>
          </div>
        </div>
      </div>

      <!-- 채팅 탭 -->
      <div v-if="activeTab === 'chat'">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">그룹 채팅</h2>
        <div class="flex flex-col h-[60vh]">
          <!-- 메시지 목록 -->
          <div class="flex-1 space-y-4 p-4 overflow-y-auto bg-gray-50/50 rounded-t-xl border border-gray-200/80">
            <div v-for="message in chatMessages" :key="message.id" :class="['flex items-end gap-2', message.isMe ? 'justify-end' : 'justify-start']">
              <div v-if="!message.isMe" class="flex-shrink-0">
                <img :src="`https://i.pravatar.cc/150?u=${message.userId}`" class="w-8 h-8 rounded-full object-cover">
              </div>
              <div :class="['max-w-xs md:max-w-md p-3 rounded-2xl', message.isMe ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200/80 text-gray-800']">
                <p v-if="!message.isMe" class="text-xs font-semibold text-orange-700 mb-1">{{ message.sender }}</p>
                <p class="text-sm">{{ message.text }}</p>
              </div>
            </div>
          </div>
          <!-- 메시지 입력 -->
          <div class="p-4 bg-white rounded-b-xl border-x border-b border-gray-200/80">
            <div class="relative">
              <input type="text" placeholder="메시지를 입력하세요..." class="w-full pr-16 pl-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800">
              <button class="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg p-2 transition-all">
                <Send class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { Users, Trophy, ShieldCheck, MessageSquare, Send } from 'lucide-vue-next'

const activeTab = ref('ranking')

const tabs = [
  { id: 'ranking', name: '랭킹', icon: Trophy },
  { id: 'challenges', name: '챌린지', icon: ShieldCheck },
  { id: 'chat', name: '채팅', icon: MessageSquare },
]

// --- 예시 데이터 (Placeholder Data) ---

const ranking = ref([
  { id: 1, name: '열정적인 다이어터', score: 98, isCurrentUser: false },
  { id: 2, name: '건강지킴이', score: 95, isCurrentUser: false },
  { id: 3, name: '유지어터', score: 92, isCurrentUser: false },
  { id: 4, name: '김지원', score: 88, isCurrentUser: true },
  { id: 5, name: '식단초보', score: 85, isCurrentUser: false },
  { id: 6, name: '맛잘알', score: 76, isCurrentUser: false },
])

const challenges = ref([
  { id: 1, title: '일주일 샐러드 3회 이상 먹기', description: '신선한 채소로 건강을 챙겨요.', progress: 75, participants: 5 },
  { id: 2, title: '하루 물 2L 마시기', description: '충분한 수분 섭취는 필수!', progress: 90, participants: 6 },
  { id: 3, title: '주 3회 30분 이상 운동하기', description: '가벼운 산책부터 시작해보세요.', progress: 40, participants: 4 },
  { id: 4, title: '저녁 8시 이후 금식', description: '규칙적인 식사 시간으로 위를 편안하게.', progress: 60, participants: 6 },
])

const chatMessages = ref([
  { id: 1, userId: 2, sender: '건강지킴이', text: '오늘 점심 다들 뭐 드셨어요?', isMe: false },
  { id: 2, userId: 4, sender: '김지원', text: '저는 닭가슴살 샐러드 먹었어요! 챌린지 때문에...', isMe: true },
  { id: 3, userId: 1, sender: '열정적인 다이어터', text: '오~ 저도 샐러드 먹었는데! 같이 힘내요 🔥', isMe: false },
  { id: 4, userId: 5, sender: '식단초보', text: '다들 대단하시네요. 전 오늘 일반식 먹어서 점수가 낮아요 😭', isMe: false },
  { id: 5, userId: 4, sender: '김지원', text: '괜찮아요! 내일 다시 시작하면 되죠! 😄', isMe: true },
])

// --- Helper Functions ---

const getRankColor = (rank) => {
  if (rank === 1) return 'text-amber-500'
  if (rank === 2) return 'text-slate-500'
  if (rank === 3) return 'text-amber-700'
  return 'text-gray-500'
}
</script>
