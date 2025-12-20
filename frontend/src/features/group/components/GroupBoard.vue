<template>
  <main class="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-8">
    <!-- Header -->
    <div class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50 flex items-center justify-between">
      <div>
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight">그룹 게시판</h1>
        <p class="text-gray-600 text-lg md:text-xl">그룹원들과 자유롭게 소통하고 정보를 공유하는 공간입니다.</p>
      </div>
      <button @click="showWriteForm = true" class="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2 transform hover:scale-105">
        <Plus class="w-5 h-5" />
        새 글
      </button>
    </div>

    <!-- Write Form -->
    <GroupBoardWrite 
      v-if="showWriteForm"
      :is-leader="isLeader"
      @cancel="showWriteForm = false"
      @submit="handlePostSubmit"
    />

    <!-- Main Content Container -->
    <div class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
      <!-- Search, Filter, Sort, Layout Options -->
      <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <!-- Left: Category Filter & Search -->
        <div class="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <div class="bg-gray-100 p-1 rounded-lg flex">
            <button 
              v-for="category in categories" 
              :key="category.id" 
              @click="selectedCategory = category.id; handleSearch()"
              :class="[
                'px-4 py-1.5 rounded-md text-sm font-medium transition',
                selectedCategory === category.id ? 'bg-white text-orange-600 shadow' : 'text-gray-600 hover:bg-gray-200'
              ]"
            >
              {{ category.name }}
            </button>
          </div>
          <div class="relative w-full sm:w-auto">
            <input
              type="text"
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              placeholder="검색어를 입력하세요..."
              class="w-full pl-10 pr-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 bg-white/50 text-gray-800"
            />
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <button @click="handleSearch" class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md">검색</button>
        </div>

        <!-- Right: Sort & Layout Options -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <div class="bg-gray-100 p-1 rounded-lg flex">
            <button 
              @click="sortCriteria = 'latest'; handleSearch()"
              :class="[
                'px-4 py-1.5 rounded-md text-sm font-medium transition',
                sortCriteria === 'latest' ? 'bg-white text-orange-600 shadow' : 'text-gray-600 hover:bg-gray-200'
              ]"
            >
              최신순
            </button>
            <button 
              @click="sortCriteria = 'likes'; handleSearch()"
              :class="[
                'px-4 py-1.5 rounded-md text-sm font-medium transition',
                sortCriteria === 'likes' ? 'bg-white text-orange-600 shadow' : 'text-gray-600 hover:bg-gray-200'
              ]"
            >
              좋아요순
            </button>
            <button 
              @click="sortCriteria = 'comments'; handleSearch()"
              :class="[
                'px-4 py-1.5 rounded-md text-sm font-medium transition',
                sortCriteria === 'comments' ? 'bg-white text-orange-600 shadow' : 'text-gray-600 hover:bg-gray-200'
              ]"
            >
              댓글순
            </button>
          </div>
          <button @click="isGridView = !isGridView" class="p-2 rounded-lg bg-white/50 border border-gray-300 shadow-sm hover:bg-gray-100/70 transition-colors">
            <LayoutGrid v-if="!isGridView" class="w-5 h-5 text-gray-600" />
            <List v-else class="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <!-- Announcements -->
      <div v-if="announcements.length > 0" class="space-y-4 mb-6">
        <h3 class="semibold text-lg text-orange-600 border-b-2 border-orange-200 pb-2">📢 공지사항</h3>
        <div v-for="post in announcements" :key="post.boardId" class="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-400 p-4 rounded-r-lg cursor-pointer" @click="goToPost(post)">
          <GroupBoardPostItem :post="post" />
        </div>
      </div>

      <!-- Regular Posts -->
      <div :class="{'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4': isGridView, 'space-y-4': !isGridView}">
        <div v-if="posts.length > 0" v-for="post in posts" :key="post.boardId" 
             :class="['bg-white/60 p-5 rounded-2xl shadow-sm border border-white/50 transition-all duration-300 hover:shadow-md hover:border-orange-300 cursor-pointer', {'max-w-3xl mx-auto': !isGridView}]"
             @click="goToPost(post)">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-3">
              <span class="px-3 py-1 text-xs font-semibold rounded-full" :class="getCategoryClass(post.category)">{{ getCategoryName(post.category) }}</span>
              <h3 class="text-lg font-bold text-gray-800 truncate">{{ post.title }}</h3>
            </div>
            <span class="text-sm text-gray-500 flex-shrink-0">{{ formatDate(post.createdAt) }}</span>
          </div>
          <div class="mb-3 h-48 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
            <img v-if="post.imgUrl" :src="`${post.imgUrl}`" alt="게시글 이미지" class="w-full h-full object-cover">
            <ImageIcon v-else class="w-16 h-16 text-gray-400" />
          </div>
          <p class="text-gray-600 mb-3 truncate">
            {{ post.content }}
          </p>
          <div class="flex items-center justify-between text-sm text-gray-500">
            <div class="flex items-center gap-2">
              <User class="w-4 h-4" />
              <span>{{ post.nickname }}</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-1">
                <ThumbsUp class="w-4 h-4" />
                <span>{{ post.likeCount || 0 }}</span>
              </div>
              <div class="flex items-center gap-1">
                <ThumbsDown class="w-4 h-4" />
                <span>{{ post.dislikeCount || 0 }}</span>
              </div>
              <div class="flex items-center gap-1">
                <MessageSquare class="w-4 h-4" />
                <span>{{ post.commentCount || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-16 text-gray-500">
          <p>표시할 게시물이 없습니다.</p>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center items-center mt-8">
        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="p-2 rounded-full hover:bg-gray-200/70 disabled:opacity-50 disabled:cursor-not-allowed">
          <ChevronLeft class="w-5 h-5" />
        </button>
        <div class="flex items-center gap-2 mx-4">
          <button v-for="page in pageNumbers" :key="page" @click="changePage(page)"
                  :class="['w-9 h-9 rounded-full text-sm font-medium transition-colors', currentPage === page ? 'bg-orange-500 text-white shadow-md' : 'hover:bg-gray-200/70']">
            {{ page }}
          </button>
        </div>
        <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="p-2 rounded-full hover:bg-gray-200/70 disabled:opacity-50 disabled:cursor-not-allowed">
          <ChevronRight class="w-5 h-5" />
        </button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchGroupBoards, createGroupBoard } from '@/api';
import { useNotificationStore } from '@/stores/notification';
import { useAuthStore } from '@/stores/auth';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Plus, Search, LayoutGrid, List, ChevronLeft, ChevronRight, ImageIcon, User, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-vue-next';
import GroupBoardWrite from './GroupBoardWrite.vue';
import GroupBoardPostItem from './GroupBoardPostItem.vue';

const route = useRoute();
const router = useRouter();
const notificationStore = useNotificationStore();
const authStore = useAuthStore();

const groupId = computed(() => route.params.id);
const isLeader = computed(() => authStore.user?.isLeader); // 실제 리더 여부 확인 로직 필요

const showWriteForm = ref(false);
const posts = ref([]);
const announcements = ref([]);
const isLoading = ref(false);

const searchQuery = ref('');
const selectedCategory = ref('ALL');
const sortCriteria = ref('latest');
const isGridView = ref(true);

const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = 10;

const categories = [
  { id: 'ALL', name: '전체' },
  { id: 'FREE', name: '자유' },
  { id: 'DIET', name: '식단' },
  { id: 'WORKOUT', name: '운동' },
];

const getCategoryName = (id) => categories.find(c => c.id === id)?.name || '기타';
const getCategoryClass = (id) => {
  switch(id) {
    case 'DIET': return 'bg-green-100 text-green-800';
    case 'WORKOUT': return 'bg-blue-100 text-blue-800';
    case 'FREE': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString) => {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ko });
};

const fetchPosts = async () => {
  isLoading.value = true;
  try {
    const params = {
      page: currentPage.value,
      size: pageSize,
      category: selectedCategory.value === 'ALL' ? null : selectedCategory.value,
      search: searchQuery.value,
      sort: sortCriteria.value,
    };
    const response = await fetchGroupBoards(groupId.value, params);
    
    announcements.value = response.announcements || [];
    posts.value = response.posts || [];
    totalPages.value = response.totalPages || 1;

  } catch (error) {
    notificationStore.showNotification('게시물을 불러오는 데 실패했습니다.', 'error');
  } finally {
    isLoading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchPosts();
};

const changePage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
    fetchPosts();
  }
};

const pageNumbers = computed(() => {
  const pages = [];
  for (let i = 1; i <= totalPages.value; i++) {
    pages.push(i);
  }
  return pages;
});

const handlePostSubmit = async (newPostData) => {
  try {
    await createGroupBoard(groupId.value, newPostData);
    notificationStore.showNotification('게시물이 성공적으로 등록되었습니다.', 'success');
    showWriteForm.value = false;
    fetchPosts(); // Refresh list
  } catch (error) {
    notificationStore.showNotification('게시물 등록에 실패했습니다.', 'error');
  }
};

const goToPost = (post) => {
  router.push({ name: 'GroupBoardDetail', params: { groupId: groupId.value, boardId: post.boardId } });
};

onMounted(fetchPosts);

</script>

<style scoped>
/* .post-card is now applied on the container div */
</style>