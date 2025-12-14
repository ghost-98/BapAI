<template>
  <main class="mx-auto max-w-7xl px-6 py-12">
    <!-- 페이지 헤더 -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between mb-8">
      <div class="mb-4 sm:mb-0">
        <h1 class="text-4xl font-bold text-gray-900">그룹 탐색</h1>
        <p class="mt-2 text-lg text-gray-600">함께할 그룹을 찾거나, 새로운 그룹을 만들어보세요.</p>
      </div>
      <button class="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2">
        <PlusCircle class="w-5 h-5" />
        <span>새 그룹 만들기</span>
      </button>
    </div>

    <!-- 탭 네비게이션 -->
    <div class="mb-8">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.name" 
            @click="activeTab = tab.id"
            :class="[
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === tab.id 
                ? 'border-orange-500 text-orange-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>
    </div>

    <!-- 그룹 목록 -->
    <div>
      <div v-if="activeTab === 'all'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="group in allGroups" :key="group.id" @click="goToGroupDetail(group.id)" class="group-card">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-bold text-gray-800">{{ group.name }}</h3>
              <span :class="['px-3 py-1 text-xs font-semibold rounded-full', group.isPublic ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800']">
                {{ group.isPublic ? '공개' : '비공개' }}
              </span>
            </div>
            <p class="text-gray-600 text-sm mb-4 h-10">{{ group.description }}</p>
            <div class="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200/80">
              <div class="flex items-center gap-2">
                <Users class="w-4 h-4" />
                <span>{{ group.memberCount }} / {{ group.maxMembers }}명</span>
              </div>
              <button class="px-4 py-1.5 bg-orange-500 text-white rounded-full text-xs font-semibold hover:bg-orange-600 transition-all">
                참여하기
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'my'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="group in myGroups" :key="group.id" @click="goToGroupDetail(group.id)" class="group-card">
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4">{{ group.name }}</h3>
            <p class="text-gray-600 text-sm mb-4 h-10">{{ group.description }}</p>
            <div class="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200/80">
              <div class="flex items-center gap-2">
                <Users class="w-4 h-4" />
                <span>{{ group.memberCount }} / {{ group.maxMembers }}명</span>
              </div>
              <span class="text-green-600 font-semibold">참여중</span>
            </div>
          </div>
        </div>
         <p v-if="myGroups.length === 0" class="text-gray-500 text-center py-10 col-span-full">가입한 그룹이 없습니다.</p>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { PlusCircle, Users } from 'lucide-vue-next'

const router = useRouter()
const activeTab = ref('all')

const tabs = [
  { id: 'all', name: '전체 그룹' },
  { id: 'my', name: '내 그룹' },
]

// --- 예시 데이터 ---

const allGroups = ref([
  { id: 1, name: '아침 식단 챌린지', description: '매일 아침 건강하게 시작하는 사람들의 모임입니다.', memberCount: 8, maxMembers: 15, isPublic: true },
  { id: 2, name: '유지어터들의 수다방', description: '요요 없는 유지를 위한 꿀팁을 공유해요.', memberCount: 25, maxMembers: 30, isPublic: true },
  { id: 3, name: '비건 라이프 스타일', description: '비건 식단과 라이프 스타일에 대한 정보를 나눕니다.', memberCount: 12, maxMembers: 20, isPublic: true },
  { id: 4, name: '헬린이 PT 그룹', description: '운동 초보들 모여서 삼대 500 찍어봐요!', memberCount: 5, maxMembers: 10, isPublic: false },
])

const myGroups = ref([
  { id: 1, name: '아침 식단 챌린지', description: '매일 아침 건강하게 시작하는 사람들의 모임입니다.', memberCount: 8, maxMembers: 15, isPublic: true },
])

const goToGroupDetail = (groupId) => {
  router.push({ name: 'GroupDetail', params: { groupId } })
}
</script>

<style scoped>
.group-card {
  @apply bg-white/80 backdrop-blur-xl rounded-2xl shadow-md border border-gray-200/80 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-orange-300;
}
</style>
