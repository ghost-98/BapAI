<template>
  <div>
    <!-- Board Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">그룹 게시판</h2>
      <button @click="showWriteForm = true" class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium shadow-md shadow-orange-500/20 transition-all flex items-center gap-2">
        <Pencil class="w-4 h-4" />
        <span>글쓰기</span>
      </button>
    </div>

    <!-- Write Form -->
    <GroupBoardWrite 
      v-if="showWriteForm"
      :is-leader="isLeader"
      @cancel="showWriteForm = false"
      @submit="handlePostSubmit"
    />

    <!-- Announcements -->
    <div v-if="announcements.length > 0" class="space-y-4 mb-6">
      <h3 class="semibold text-lg text-orange-600 border-b-2 border-orange-200 pb-2">📢 공지사항</h3>
      <div v-for="post in announcements" :key="post.id" class="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
        <GroupBoardPostItem :post="post" />
      </div>
    </div>

    <!-- Regular Posts -->
    <div class="space-y-4">
       <h3 class="semibold text-lg text-gray-700 border-b-2 border-gray-200 pb-2">전체 글</h3>
      <div v-if="posts.length > 0">
        <div v-for="(post, index) in posts" :key="post.id" class="post-card p-4" :class="{ 'border-t border-gray-200/80': index > 0 }">
          <GroupBoardPostItem :post="post" />
        </div>
      </div>
      <div v-else class="text-center py-10 text-gray-500">
        <p>아직 게시글이 없습니다.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Pencil } from 'lucide-vue-next';
import GroupBoardWrite from './GroupBoardWrite.vue';
import GroupBoardPostItem from './GroupBoardPostItem.vue';

const showWriteForm = ref(false);
const isLeader = ref(true); // Mocking user role as leader

// Mock Data
const currentUser = ref({ id: 1, name: '그룹장', role: 'Leader' }); // Mock current user

const announcements = ref([
  {
    id: 101,
    title: '그룹 필독! 챌린지 규칙 안내',
    content: '1. 매일 아침 식단 인증 필수!\n2. 주 3회 이상 운동 인증!\n3. 서로에게 긍정적인 피드백 주기',
    author: { id: 1, name: '그룹장', role: 'Leader' },
    createdAt: '2023-11-20T10:00:00Z',
    isAnnouncement: true,
    likes: 15,
    dislikes: 0,
    comments: 2,
    mealScore: null, // 공지사항은 식단 점수 없음
  }
]);

const posts = ref([
  {
    id: 1,
    title: '오늘 제 식단 어떤가요? 피드백 부탁드려요!',
    content: '점심으로 닭가슴살 샐러드와 현미밥 반 공기 먹었습니다. 저녁은 어떻게 먹는게 좋을까요?',
    author: { id: 4, name: '김지원', role: 'Member' },
    createdAt: '2023-11-21T12:30:00Z',
    isAnnouncement: false,
    likes: 5,
    dislikes: 1,
    comments: 3,
    mealScore: 92, // 식단 점수 추가
  },
  {
    id: 2,
    title: '다들 운동은 뭐하시나요?',
    content: '저는 주로 저녁에 헬스장에서 웨이트 트레이닝을 합니다. 다른 분들은 어떤 운동을 즐겨하시는지 궁금해요!',
    author: { id: 2, name: '건강지킴이', role: 'Member' },
    createdAt: '2023-11-20T18:00:00Z',
    isAnnouncement: false,
    likes: 12,
    dislikes: 0,
    comments: 8,
    mealScore: null, // 식단 관련 글이 아니므로 점수 없음
  }
]);

const handlePostSubmit = (newPostData) => {
  const newPost = {
    id: Date.now(), // temporary ID
    author: currentUser.value,
    createdAt: new Date().toISOString(),
    likes: 0,
    dislikes: 0,
    comments: 0,
    mealScore: Math.random() > 0.5 ? Math.floor(Math.random() * 30) + 70 : null, // 50% 확률로 70-99점 부여
    ...newPostData
  };

  if (newPost.isAnnouncement) {
    announcements.value.unshift(newPost);
  } else {
    posts.value.unshift(newPost);
  }
  
  showWriteForm.value = false;
};

</script>

<style scoped>
/* .post-card is now applied on the container div */
</style>
