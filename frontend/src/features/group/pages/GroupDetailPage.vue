<template>
  <main class="mx-auto max-w-7xl px-6 py-12">
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-gray-500">
      <Loader2 class="w-10 h-10 animate-spin text-orange-500 mb-4" />
      <p class="text-lg font-semibold">그룹 정보를 불러오는 중...</p>
    </div>
    <div v-else-if="error" class="flex flex-col items-center justify-center py-20 text-red-500">
      <AlertCircle class="w-10 h-10 mb-4" />
      <p class="text-lg font-semibold">{{ error }}</p>
      <button @click="fetchGroupDetails" class="mt-6 px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
        다시 시도
      </button>
    </div>
    <div v-else-if="group">
      <!-- 페이지 헤더 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900">{{ group.name }}</h1>
        <p class="mt-2 text-lg text-gray-600">{{ group.description }}</p>
        <p v-if="group.ownerName" class="mt-1 text-base text-gray-700">그룹장: {{ group.ownerName }}</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <span v-for="tag in group.tags" :key="tag" class="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
            #{{ tag }}
          </span>
        </div>
        <div v-if="!isLeader" class="mt-6 flex flex-wrap gap-4 items-center">
            <button @click="handleLeaveGroup" class="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium shadow-lg shadow-red-500/30 transition-all flex items-center gap-2">
                <LogOut class="w-5 h-5" />
                <span>그룹 탈퇴</span>
            </button>
        </div>
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
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' // Active tab style
                : 'bg-transparent text-gray-600 hover:bg-gray-50/50' // Inactive tab style
            ]"
          >
            <component :is="tab.icon" class="w-5 h-5" />
            <span>{{ tab.name }}</span>
          </button>
        </div>
      </div>

      <!-- 탭 컨텐츠 -->
      <div>
        <!-- 대시보드 탭 -->
        <div v-if="activeTab === 'dashboard'">
          <GroupDashboard 
              :group="group"
              :recent-posts="recentPosts"
              :active-challenges="challenges.slice(0, 2)"
              :spotlight-members="spotlightMembers"
            />
        </div>
        
        <!-- 그룹 관리 탭 -->
        <div v-if="activeTab === 'management'">
          <GroupManagement :group-id="groupId" @group-updated="fetchGroupDetails" />
        </div>

        <!-- 채팅 탭 -->
        <div v-if="activeTab === 'chat'">
          <GroupChat :group-id="groupId" />
        </div>

        <!-- 랭킹 탭 -->
        <div v-if="activeTab === 'ranking'" class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md border border-gray-200/80 p-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">그룹 랭킹</h2>
          <ul class="space-y-3">
            <li v-for="(member, index) in ranking" :key="member.id" :class="['flex items-center p-4 rounded-xl transition-all', member.isCurrentUser ? 'bg-gradient-to-r from-orange-100 to-amber-100 border-l-4 border-orange-500 shadow-sm' : 'bg-gray-50/50 hover:bg-gray-100']">
              <div class="flex items-center w-16"><span class="text-2xl font-bold" :class="getRankColor(index + 1)">{{ index + 1 }}</span></div>
              <div class="flex-1 flex items-center gap-4">
                <img :src="`https://i.pravatar.cc/150?u=${member.id}`" class="w-12 h-12 rounded-full object-cover border-2 border-white shadow">
                <div>
                  <p class="font-semibold text-gray-800">{{ member.name }} <span v-if="member.isCurrentUser" class="text-sm text-orange-600">(나)</span></p>
                  <p class="text-sm text-gray-500">식단 점수</p>
                </div>
              </div>
              <div class="text-right"><p class="text-2xl font-bold text-orange-600">{{ member.score }}<span class="text-lg text-gray-500">점</span></p></div>
            </li>
          </ul>
        </div>

        <!-- 챌린지 탭 -->
        <div v-if="activeTab === 'challenges'" class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md border border-gray-200/80 p-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">그룹 챌린지</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="challenge in challenges" :key="challenge.id" 
              :class="[
                'rounded-2xl p-6 border-2 transition-all duration-300 flex flex-col',
                challenge.isJoined ? 'bg-orange-50/50 border-orange-400 shadow-lg' : 'bg-gray-50/50 border-gray-200/80 hover:border-orange-300'
              ]">
              <div class="flex-grow">
                <h3 class="font-bold text-lg text-gray-800 mb-2">{{ challenge.title }}</h3>
                <p class="text-sm text-gray-600 mb-4 h-10">{{ challenge.description }}</p>
                <div class="mb-2">
                  <div class="flex justify-between text-sm font-medium text-gray-600 mb-1">
                    <span>{{ challenge.isJoined ? '나의 진행률' : '그룹 평균' }}</span>
                    <span>{{ challenge.isJoined ? challenge.myProgress : challenge.progress }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-3">
                    <div class="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full" :style="{ width: (challenge.isJoined ? challenge.myProgress : challenge.progress) + '%' }"></div>
                  </div>
                </div>
                <p class="text-xs text-gray-500 text-right">참여인원: {{ challenge.participants }}명</p>
              </div>
              <button @click="toggleChallenge(challenge)" 
                :class="[
                  'w-full mt-4 py-2 rounded-lg font-semibold transition-colors',
                  challenge.isJoined ? 'bg-white text-orange-600 border border-orange-300 hover:bg-orange-100' : 'bg-orange-500 text-white hover:bg-orange-600'
                ]">
                {{ challenge.isJoined ? '포기하기' : '참여하기' }}
              </button>
            </div>
          </div>
          
          <!-- Suggested Challenges -->
          <div class="mt-12">
              <h3 class="text-xl font-bold text-gray-800 mb-4">💡 이런 챌린지는 어떠세요?</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div v-for="suggestion in suggestedChallenges" :key="suggestion.title" class="bg-gray-100/80 p-4 rounded-xl border border-gray-200/80 flex items-center justify-between">
                      <div>
                          <p class="font-semibold text-gray-800">{{ suggestion.title }}</p>
                          <p class="text-sm text-gray-600">{{ suggestion.description }}</p>
                      </div>
                      <button class="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold">추가</button>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { LayoutDashboard, MessageSquare, Trophy, ShieldCheck, Loader2, AlertCircle, Settings, LogOut } from 'lucide-vue-next';
import GroupDashboard from '@/features/group/components/GroupDashboard.vue';
import GroupManagement from '@/features/group/components/GroupManagement.vue';
import GroupChat from '@/features/group/components/GroupChat.vue';
import { fetchGroupById, updateGroup, leaveGroupApi } from '@/api';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';

const route = useRoute();
const router = useRouter();
const groupId = computed(() => route.params.groupId);
const activeTab = ref('dashboard');

const group = ref(null);
const loading = ref(true);
const error = ref(null);
const notificationStore = useNotificationStore();
const authStore = useAuthStore();

const isLeader = computed(() => {
  return group.value && group.value.role === 'LEADER';
});

const tabs = computed(() => {
  const baseTabs = [
    { id: 'dashboard', name: '대시보드', icon: LayoutDashboard },
    { id: 'chat', name: '채팅', icon: MessageSquare },
    { id: 'ranking', name: '랭킹', icon: Trophy },
    { id: 'challenges', name: '챌린지', icon: ShieldCheck },
  ];
  if (isLeader.value) {
    baseTabs.push({ id: 'management', name: '그룹 관리', icon: Settings });
  }
  return baseTabs;
});

const fetchGroupDetails = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetchGroupById(groupId.value);
    group.value = response;
    if (!group.value) {
      error.value = '그룹을 찾을 수 없습니다.';
    }
  } catch (err) {
    console.error('Failed to fetch group details:', err);
    error.value = '그룹 정보를 불러오는데 실패했습니다.';
  } finally {
    loading.value = false;
  }
};

const handleGroupUpdate = async (updatedGroupData) => {
  try {
    await updateGroup(groupId.value, updatedGroupData);
    notificationStore.showNotification('그룹 정보가 성공적으로 업데이트되었습니다.', 'success');
    fetchGroupDetails();
  } catch (err) {
    console.error('Failed to update group:', err);
    notificationStore.showNotification('그룹 정보 업데이트에 실패했습니다.', 'error');
  }
};

const handleLeaveGroup = async () => {
    if (confirm('정말로 그룹을 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        try {
            await leaveGroupApi(groupId.value);
            notificationStore.showNotification('그룹에서 성공적으로 탈퇴했습니다.', 'success');
            router.push({ name: 'GroupList' });
        } catch (err) {
            console.error('Failed to leave group:', err);
            notificationStore.showNotification('그룹 탈퇴에 실패했습니다. 다시 시도해주세요.', 'error');
        }
    }
};

// --- 예시 데이터 (Placeholder Data) ---
const ranking = ref([
  { id: 1, name: '열정적인 다이어터', score: 98, isCurrentUser: false },
  { id: 2, name: '건강지킴이', score: 95, isCurrentUser: false },
  { id: 3, name: '유지어터', score: 92, isCurrentUser: false },
  { id: 4, name: '김지원', score: 88, isCurrentUser: true },
  { id: 5, name: '식단초보', score: 85, isCurrentUser: false },
]);

const challenges = ref([
  { id: 1, title: '일주일 샐러드 3회 이상 먹기', description: '신선한 채소로 건강을 챙겨요.', progress: 75, participants: 5, isJoined: true, myProgress: 66 },
  { id: 2, title: '하루 물 2L 마시기', description: '충분한 수분 섭취는 필수!', progress: 90, participants: 6, isJoined: false, myProgress: 0 },
  { id: 3, title: '주 3회 30분 이상 운동하기', description: '가벼운 산책부터 시작해보세요.', progress: 40, participants: 4, isJoined: true, myProgress: 100 },
]);

const suggestedChallenges = ref([
    { title: '클린식단 5회/주', description: '가공식품을 줄여보세요.'},
    { title: '아침 식단 인증', description: '매일 아침을 건강하게!'},
]);

const recentPosts = ref([
    { id: 1, title: '오늘 제 식단 어떤가요? 피드백 부탁드려요!', author: '김지원' },
    { id: 2, title: '다들 운동은 뭐하시나요?', author: '건강지킴이' },
    { id: 3, title: '저탄고지 식단 꿀팁 공유합니다', author: '열정적인 다이어터' },
]);

const spotlightMembers = ref([
    { id: 1, name: '열정적인 다이어터', title: '주간 랭킹 1위', emoji: '🏆', value: '98점' },
    { id: 5, name: '식단초보', title: '가장 많이 발전했어요', emoji: '🚀', value: '+15점' },
]);

const toggleChallenge = (challengeToToggle) => {
  const challenge = challenges.value.find(c => c.id === challengeToToggle.id);
  if (challenge) {
    challenge.isJoined = !challenge.isJoined;
  }
};

const getRankColor = (rank) => {
  if (rank === 1) return 'text-amber-500';
  if (rank === 2) return 'text-slate-500';
  if (rank === 3) return 'text-amber-700';
  return 'text-gray-500';
};

onMounted(() => {
  fetchGroupDetails();
});

watch(groupId, fetchGroupDetails);
</script>
