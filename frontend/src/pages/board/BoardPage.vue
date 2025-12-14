<template>
  <main class="mx-auto max-w-7xl px-6 py-12">
    <!-- 페이지 헤더 -->
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-4xl font-bold text-gray-900">게시판</h1>
    </div>

    <!-- 카테고리 탭 및 글쓰기 버튼 -->
    <div class="flex items-center justify-between mb-8">
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl p-2 border border-gray-200/80 shadow-sm inline-flex space-x-2">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="currentCategory = category.id"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-all text-sm',
            currentCategory === category.id
              ? 'bg-white text-orange-600 shadow'
              : 'bg-transparent text-gray-600 hover:bg-gray-50/50'
          ]"
        >
          {{ category.name }}
        </button>
      </div>
      <button
        v-if="canWritePost"
        @click="goToWritePage"
        class="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2"
      >
        <Pencil class="w-5 h-5" />
        글쓰기
      </button>
    </div>

    <!-- 게시글 목록 -->
    <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md border border-gray-200/80 p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-semibold text-gray-800">{{ currentCategoryName }}</h2>
        <div class="flex items-center gap-4">
          <!-- Sort Buttons -->
          <div class="flex gap-2">
            <button @click="setSort('latest')" :class="['px-3 py-1 text-sm rounded-md', currentSort === 'latest' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300']">최신순</button>
            <button @click="setSort('views')" :class="['px-3 py-1 text-sm rounded-md', currentSort === 'views' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300']">조회수순</button>
            <button @click="setSort('likes')" :class="['px-3 py-1 text-sm rounded-md', currentSort === 'likes' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300']">좋아요순</button>
          </div>
          <!-- Layout Switcher -->
          <div class="flex gap-1 bg-gray-200 p-1 rounded-md">
            <button @click="layoutMode = 'list'" :class="['p-1.5 rounded', layoutMode === 'list' ? 'bg-white text-orange-600 shadow' : 'text-gray-500 hover:bg-white/50']">
              <List class="w-5 h-5" />
            </button>
            <button @click="layoutMode = 'grid'" :class="['p-1.5 rounded', layoutMode === 'grid' ? 'bg-white text-orange-600 shadow' : 'text-gray-500 hover:bg-white/50']">
              <LayoutGrid class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <ul v-if="sortedPosts.length > 0" :class="[
        layoutMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
          : 'space-y-4'
      ]">
        <li v-for="post in sortedPosts" :key="post.boardId">
          <router-link :to="{ name: 'BoardDetail', params: { boardId: post.boardId } }" class="block w-full h-full">
            <!-- 목록형 뷰 카드 -->
            <div v-if="layoutMode === 'list'" class="flex h-40 w-full gap-4 rounded-xl border border-gray-200/80 bg-gray-50/50 p-4 transition-colors duration-300 hover:border-orange-400">
              <div v-if="post.imgUrl" class="h-32 w-32 flex-shrink-0 rounded-lg bg-gray-100">
                <img :src="`${IMAGE_BASE_URL}${post.imgUrl}`" alt="게시글 이미지" class="h-full w-full rounded-lg object-cover">
              </div>
              <div class="flex flex-grow flex-col justify-between">
                <div>
                  <h3 class="line-clamp-1 mb-2 text-lg font-semibold text-orange-700">{{ post.title }}</h3>
                  <p class="line-clamp-2 text-sm leading-relaxed text-gray-600">{{ post.content }}</p>
                </div>
                <div class="mt-2 flex items-center justify-between border-t border-gray-200/80 pt-2 text-xs text-gray-500">
                  <div class="flex items-center gap-3">
                    <span>{{ post.nickname }}</span>
                    <span class="hidden sm:inline-block">{{ formatDateTime(post.createdAt) }}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="flex items-center gap-1"><Eye class="w-3 h-3" /><span>{{ post.viewCount || 0 }}</span></div>
                    <div class="flex items-center gap-1"><ThumbsUp class="w-3 h-3" /><span>{{ post.likeCount || 0 }}</span></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 격자형 뷰 카드 -->
            <div v-if="layoutMode === 'grid'" class="bg-gray-50/50 rounded-xl border border-gray-200/80 hover:border-orange-400 transition-colors duration-300 w-full h-full flex flex-col overflow-hidden">
              <div class="w-full aspect-square bg-gray-100">
                <img v-if="post.imgUrl" :src="`${IMAGE_BASE_URL}${post.imgUrl}`" alt="게시글 이미지" class="w-full h-full object-cover">
                <div v-else class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                  <ImageIcon class="w-12 h-12" />
                </div>
              </div>
              <div class="p-4 flex flex-col flex-grow">
                <h3 class="text-md font-semibold text-orange-700 mb-2 line-clamp-2 flex-grow">{{ post.title }}</h3>
                <div class="flex items-center justify-between text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200/80">
                  <span>{{ post.nickname }}</span>
                  <div class="flex items-center gap-1"><Eye class="w-3 h-3" /><span>{{ post.viewCount || 0 }}</span></div>
                </div>
              </div>
            </div>
          </router-link>
        </li>
      </ul>
      <p v-else class="text-gray-500 text-center py-10">게시글이 없습니다.</p>
    </div>

    <div v-if="totalPages > 1" class="flex justify-center items-center space-x-2 mt-8">
      <!-- Pagination... -->
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Pencil, Eye, ThumbsUp, ThumbsDown, LayoutGrid, List, ImageIcon } from 'lucide-vue-next'
import apiClient from '../../api'
import { format, parse } from 'date-fns'
import { ko } from 'date-fns/locale'

const layoutMode = ref('list'); // 'list' or 'grid'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const IMAGE_BASE_URL = API_BASE_URL.replace('/api', '');

const router = useRouter()

const categories = [
  { id: 'FREE', name: '자유게시판' },
  { id: 'REVIEW', name: '식단 리뷰' },
  { id: 'HEALTH_INFO', name: '건강 정보' },
]
const currentCategory = ref('FREE')
const currentSort = ref('latest'); // 'latest', 'views', 'likes'

const currentCategoryName = computed(() => {
  const category = categories.find(cat => cat.id === currentCategory.value)
  return category ? category.name : '게시판'
})

const posts = ref([])
const currentPage = ref(1);
const pageSize = ref(10);
const totalPages = ref(0);
const totalElements = ref(0);

const sortedPosts = computed(() => {
  const postsCopy = [...posts.value];
  if (currentSort.value === 'views') {
    return postsCopy.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
  }
  if (currentSort.value === 'likes') {
    return postsCopy.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
  }
  // 'latest' is default
  return postsCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});

const setSort = (sortType) => {
  currentSort.value = sortType;
};

const canWritePost = computed(() => {
  return currentCategory.value === 'FREE' || currentCategory.value === 'REVIEW'
})

const goToWritePage = () => {
  router.push({ name: 'BoardWrite', query: { category: currentCategory.value } })
}

const fetchPosts = async () => {
  try {
    const response = await apiClient.get(`/boards?category=${currentCategory.value}&page=${currentPage.value}&size=${pageSize.value}`)
    posts.value = response.data.list
    currentPage.value = response.data.page
    pageSize.value = response.data.size
    totalPages.value = response.data.totalPages
    totalElements.value = response.data.totalElements
  } catch (error) {
    console.error(`게시글 불러오기 실패 (${currentCategory.value}):`, error.response ? error.response.data : error.message)
    posts.value = []
    totalPages.value = 0
    totalElements.value = 0
  }
}

const goToPage = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= totalPages.value) {
    currentPage.value = pageNumber;
    fetchPosts();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchPosts();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchPosts();
  }
};

const formatDateTime = (dateTime) => {
  if (!dateTime) {
    return '날짜 정보 없음';
  }
  try {
    const date = parse(dateTime, 'yyyy-MM-dd HH:mm:ss', new Date());
    if (isNaN(date.getTime())) {
      console.log('Invalid Date detected. Input dateTime:', dateTime);
      return '날짜 형식 오류';
    }
    return format(date, 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
  } catch (e) {
    console.error('날짜 파싱 오류:', e, '입력값:', dateTime);
    return '날짜 형식 오류';
  }
};

onMounted(() => {
  fetchPosts()
})

watch(currentCategory, () => {
  // Reset to first page and default sort when category changes
  currentPage.value = 1;
  currentSort.value = 'latest';
  fetchPosts()
})
</script>

<style scoped>
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
