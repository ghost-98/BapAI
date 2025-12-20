<template>
  <main class="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-8">
    <!-- Header -->
    <div class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50 flex items-center justify-between">
      <div>
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight">커뮤니티 게시판</h1>
        <p class="text-gray-600 text-lg md:text-xl">자유롭게 소통하고 정보를 공유하는 공간입니다.</p>
      </div>
      <router-link to="/board/write" class="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2 transform hover:scale-105">
        <Plus class="w-5 h-5" />
        새 글
      </router-link>
    </div>

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
            <button 
              @click="sortCriteria = 'views'; handleSearch()"
              :class="[
                'px-4 py-1.5 rounded-md text-sm font-medium transition',
                sortCriteria === 'views' ? 'bg-white text-orange-600 shadow' : 'text-gray-600 hover:bg-gray-200'
              ]"
            >
              조회수순
            </button>
          </div>
          <button @click="isGridView = !isGridView" class="p-2 rounded-lg bg-white/50 border border-gray-300 shadow-sm hover:bg-gray-100/70 transition-colors">
            <LayoutGrid v-if="!isGridView" class="w-5 h-5 text-gray-600" />
            <List v-else class="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <!-- Post List -->
      <div :class="{'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4': isGridView, 'space-y-4': !isGridView}">
        <div v-if="posts.length > 0" v-for="post in posts" :key="post.id" 
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
              <div class="flex items-center gap-1">
                <Eye class="w-4 h-4" />
                <span>{{ post.viewCount || 0 }}</span>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, Search, User, ThumbsUp, ThumbsDown, MessageSquare, ChevronLeft, ChevronRight, LayoutGrid, List, ImageIcon, Eye } from 'lucide-vue-next';
import apiClient from '../../../api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const IMAGE_BASE_URL = API_BASE_URL.replace('/api', '');

const router = useRouter();

const posts = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const searchQuery = ref('');
const selectedCategory = ref('ALL');
const sortCriteria = ref('latest');
const isGridView = ref(false);

const categories = [
  { id: 'ALL', name: '전체 게시판' },
  { id: 'FREE', name: '자유 게시판' },
  { id: 'REVIEW', name: '식단 공유' },
  { id: 'HEALTH_INFO', name: '건강 정보' },
];

const getCategoryName = (id) => {
  const category = categories.find(cat => cat.id === id);
  return category ? category.name : id;
};

const fetchPosts = async () => {
  try {
    const params = {
      page: currentPage.value,
      category: selectedCategory.value === 'ALL' ? undefined : selectedCategory.value, // Add category filter
      sort: sortCriteria.value, // 정렬 기준
    };
    if (searchQuery.value) {
      params.word = searchQuery.value;
    }
    const response = await apiClient.get('/boards', { params });
    console.log('API Response for /boards:', response.data);
    posts.value = response.data.list;
    totalPages.value = response.data.totalPages;
  } catch (error) {
    console.error('게시물을 불러오는 데 실패했습니다:', error);
  }
};

onMounted(fetchPosts);

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

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const getCategoryClass = (category) => {
  switch (category) {
    case 'FREE': return 'bg-blue-100 text-blue-800';
    case 'REVIEW': return 'bg-green-100 text-green-800';
    case 'HEALTH_INFO': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const goToPost = (post) => {
  router.push(`/board/${post.boardId}`);
};
</script>