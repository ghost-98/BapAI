<template>
  <main class="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-8">
    <!-- Header -->
    <div class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50 flex items-center justify-between">
      <div>
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight">게시글 상세</h1>
        <p class="text-gray-600 text-lg md:text-xl">게시글의 자세한 내용을 확인하고 의견을 남겨주세요.</p>
      </div>
    </div>

    <div v-if="post" class="space-y-8">
      <!-- Post Card -->
      <div class="p-1 bg-gradient-to-br from-orange-200 to-rose-200 rounded-3xl shadow-lg">
        <section class="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 lg:p-10 border border-white/50">
          <!-- Post Header -->
          <header class="pb-6 mb-6 border-b border-gray-200">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ post.title }}</h2>
            <p class="text-sm font-medium text-orange-600 mb-4">{{ postCategoryName }}</p>
            <div class="flex flex-wrap items-center justify-between text-sm text-gray-500 gap-y-2">
              <div class="flex items-center gap-2">
                <UserCircle class="w-4 h-4 text-gray-500" />
                <span>작성자: <span class="font-semibold text-orange-600">{{ post.nickname }}</span></span>
                <span class="mx-1 text-gray-400">|</span>
                <span class="text-gray-500">{{ formatDateTime(post.createdAt) }}</span>
                <template v-if="post.updatedAt && post.updatedAt !== post.createdAt">
                  <span class="mx-1 text-gray-400">|</span>
                  <span class="text-gray-500">수정됨: {{ formatDateTime(post.updatedAt) }}</span>
                </template>
              </div>
              <div class="flex items-center gap-4">
              <div class="flex items-center gap-1 text-gray-500">
                <Eye class="w-4 h-4" />
                <span>{{ post.viewCount || 0 }}</span>
              </div>
              <div v-if="isAuthor" class="flex items-center gap-2">
                <button @click="goToEditPage" class="px-3 py-1 text-sm font-medium text-orange-600 bg-orange-100 rounded-full hover:bg-orange-200 transition-colors">수정</button>
                <button @click="handleDelete" class="px-3 py-1 text-sm font-medium text-red-600 bg-red-100 rounded-full hover:bg-red-200 transition-colors">삭제</button>
              </div>
            </div>
            </div>
          </header>

          <!-- Post Content -->
          <div class="mb-8">
            <div v-if="post.imgUrl" class="flex justify-center mb-6">
              <img :src="`${post.imgUrl}`" alt="게시글 이미지" class="w-full object-contain rounded-lg shadow-sm max-h-96">
            </div>
            <div class="prose max-w-none text-gray-800 leading-relaxed text-lg">
              <p>{{ post.content }}</p>
            </div>
          </div>

          <!-- Like/Dislike Buttons -->
          <div class="flex justify-center gap-4 pt-6 border-t border-gray-200">
            <button @click="handleReaction(post, 'LIKE')" :class="['flex items-center gap-2 px-6 py-3 rounded-full text-base font-semibold transition-all duration-200', post.userLiked ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']">
              <ThumbsUp class="w-5 h-5" />
              추천 ({{ post.likeCount || 0 }})
            </button>
            <button @click="handleReaction(post, 'DISLIKE')" :class="['flex items-center gap-2 px-6 py-3 rounded-full text-base font-semibold transition-all duration-200', post.userDisliked ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']">
              <ThumbsDown class="w-5 h-5" />
              비추천 ({{ post.dislikeCount || 0 }})
            </button>
          </div>
        </section>
      </div>

      <!-- Comment Section -->
      <div class="p-1 bg-gradient-to-br from-orange-200 to-rose-200 rounded-3xl shadow-lg">
        <div class="bg-white/50 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-sm space-y-6">
          <!-- Comment Input Form -->
          <div v-if="isLoggedIn">
            <h3 class="text-lg font-semibold text-gray-800 mb-3">댓글 작성</h3>
            <div class="flex gap-2 items-end">
              <textarea
                v-model="newCommentContent"
                placeholder="댓글을 입력하세요..."
                rows="3"
                class="flex-grow px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:ring-orange-500 focus:outline-none transition-colors bg-white/50 text-gray-800 shadow-sm"
              ></textarea>
              <button
                @click="addComment"
                class="px-5 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all font-semibold shadow-lg shadow-orange-500/30 flex-shrink-0 h-full"
              >
                작성
              </button>
            </div>
          </div>

          <!-- Comments Header -->
          <div class="flex justify-between items-center pt-4 border-t border-gray-200 mt-6">
            <h3 class="text-lg font-semibold text-gray-800">댓글 ({{ totalCount }})</h3>
            <select v-model="sortOption" class="px-3 py-1.5 text-sm border-gray-300 rounded-md focus:border-orange-500 focus:ring-orange-500">
              <option value="latest">최신순</option>
              <option value="oldest">오래된순</option>
              <option value="likes">추천순</option>
            </select>
          </div>

          <!-- Existing Comments -->
          <div v-if="comments.length > 0" class="space-y-4">
            <div v-for="comment in comments" :key="comment.commentId" class="bg-white/50 rounded-lg p-4 border border-white/50 shadow-sm">
              <!-- Parent Comment -->
              <div>
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <UserCircle class="w-4 h-4 text-gray-500" />
                    <span class="font-semibold text-gray-800">{{ comment.nickname }}</span>
                    <span v-if="post && comment.userId === post.userId" class="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-0.5 rounded-full">작성자</span>
                    <span class="text-xs text-gray-500">{{ formatDateTime(comment.createdAt) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button @click="handleReaction(comment, 'LIKE')" :class="['flex items-center gap-1 text-sm', comment.userLiked ? 'text-orange-600' : 'text-gray-500 hover:text-orange-600']">
                      <ThumbsUp class="w-4 h-4 text-gray-400" /> {{ comment.likeCount || 0 }}
                    </button>
                    <button @click="handleReaction(comment, 'DISLIKE')" :class="['flex items-center gap-1 text-sm', comment.userDisliked ? 'text-rose-600' : 'text-gray-500 hover:text-rose-600']">
                      <ThumbsDown class="w-4 h-4 text-gray-400" /> {{ comment.dislikeCount || 0 }}
                    </button>
                    
                    <!-- Action Menu (Kebab) -->
                    <div class="relative" v-if="isLoggedIn">
                      <button @click.stop="toggleActionMenu(comment.commentId)" class="p-1 rounded-full hover:bg-gray-200">
                        <MoreVertical class="w-4 h-4 text-gray-500" />
                      </button>
                      <div v-if="openMenuCommentId === comment.commentId" class="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10 border">
                        <button v-if="!comment.parentId" @click="toggleReplyForm(comment)" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">답글</button>
                        <template v-if="comment.userId === Number(currentUserId)">
                          <button @click="editComment(comment)" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">수정</button>
                          <button @click="deleteComment(comment.commentId)" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">삭제</button>
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
                <template v-if="!comment.isEditing">
                  <p class="text-gray-700 leading-relaxed">{{ comment.content }}</p>
                </template>
                <template v-else>
                  <textarea v-model="comment.editedContent" rows="3" class="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:ring-orange-500 focus:outline-none transition-colors bg-white/50 text-gray-800"></textarea>
                  <div class="flex justify-end mt-2 gap-2">
                    <button @click="cancelEdit(comment)" class="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-all font-medium">취소</button>
                    <button @click="saveEditedComment(comment)" class="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all font-semibold">저장</button>
                  </div>
                </template>
                <div v-if="comment.isReplying" class="mt-4">
                  <textarea v-model="comment.replyText" placeholder="답글을 입력하세요..." rows="2" class="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:ring-orange-500 focus:outline-none transition-colors bg-white/50 text-gray-800 shadow-sm"></textarea>
                  <div class="flex justify-end mt-2 gap-2">
                    <button @click="cancelReply(comment)" class="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-all font-medium">취소</button>
                    <button @click="addReply(comment)" class="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all font-semibold">답글 작성</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p v-if="!isLoading && totalCount === 0" class="text-center text-gray-500 py-6">아직 댓글이 없습니다.</p>

          <!-- Pagination Component -->
          <template v-if="totalPages > 1">
            <Pagination
              :key="currentPage"
              :currentPage="currentPage + 1"
              :totalPages="totalPages"
              @page-change="handlePageChange"
            />
          </template>

          
        </div>
      </div>
    </div>

    <div v-else class="text-center text-gray-500 py-20 bg-white/40 backdrop-blur-sm rounded-2xl p-8 border border-white/50">
      <p class="text-xl font-medium">게시글을 불러오는 중이거나 찾을 수 없습니다.</p>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '../../../api'
import { UserCircle, Eye, ThumbsUp, ThumbsDown, MoreVertical } from 'lucide-vue-next'
import { format, parse } from 'date-fns'
import { ko } from 'date-fns/locale'
import Pagination from '../../../components/common/Pagination.vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const IMAGE_BASE_URL = API_BASE_URL.replace('/api', '');

const route = useRoute()
const router = useRouter()

const post = ref(null)
const boardId = ref(null)
const comments = ref([])
const newCommentContent = ref('')
const openMenuCommentId = ref(null)

// Pagination and Sorting State
const sortOption = ref('latest');
const currentPage = ref(0);
const totalCount = ref(0);
const hasNext = ref(false);
const totalPages = ref(1);
const isLoading = ref(false);
const COMMENT_PAGE_SIZE = 10;

const categories = [
  { id: 'FREE', name: '자유게시판' },
  { id: 'REVIEW', name: '식단 공유' },
  { id: 'HEALTH_INFO', name: '건강 정보' },
]

const postCategoryName = computed(() => {
  if (!post.value) return '';
  const category = categories.find(cat => cat.id === post.value.category);
  return category ? category.name : '알 수 없음';
});

const currentUserId = computed(() => {
  return localStorage.getItem('userId') || sessionStorage.getItem('userId');
});
const isLoggedIn = computed(() => !!currentUserId.value);

const isAuthor = computed(() => {
  return post.value && post.value.userId === Number(currentUserId.value);
});

const closeAllMenus = () => {
  openMenuCommentId.value = null;
};

onMounted(() => {
  boardId.value = route.params.boardId
  if (boardId.value) {
    fetchPostDetail(boardId.value)
    fetchComments(0); // Initial fetch for page 0
  }
  window.addEventListener('click', closeAllMenus);
})

onBeforeUnmount(() => {
  window.removeEventListener('click', closeAllMenus);
});

watch(sortOption, () => {
  fetchComments(0, true); // Reset and fetch
});

const fetchPostDetail = async (id) => {
  try {
    const response = await apiClient.get(`/boards/${id}`)
    post.value = {
      ...response.data,
      userLiked: response.data.userLiked === 'LIKE',
      userDisliked: response.data.userLiked === 'DISLIKE',
    };
  } catch (error) {
    console.error('게시글 상세 불러오기 실패:', error);
    alert('게시글을 불러오는 데 실패했습니다.');
    router.push({ name: 'Board' })
  }
}

const processCommentData = (comment) => ({
  ...comment,
  userLiked: comment.userLiked === 'LIKE',
  userDisliked: comment.userLiked === 'DISLIKE',
  isEditing: false,
  originalContent: comment.content,
  isReplying: false,
  replyText: '',
});

const fetchComments = async (page = 0, isSortChange = false) => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    const response = await apiClient.get(`/comments/board/${boardId.value}`, {
      params: {
        page: page,
        size: COMMENT_PAGE_SIZE,
        sort: sortOption.value,
      }
    });
    const data = response.data;
    const processedComments = data.list.map(processCommentData);

    comments.value = processedComments;
    
    hasNext.value = data.hasNext;
    currentPage.value = page; // Update currentPage based on the requested page
    totalCount.value = data.totalElements;
    totalPages.value = data.totalPages;

    

  } catch (error) {
    console.error('댓글 불러오기 실패:', error.response ? error.response.data : error.message)
  } finally {
    isLoading.value = false;
  }
}

const handlePageChange = (page) => {
  fetchComments(page - 1); // Convert to 0-indexed for API call
};

const loadMoreComments = () => {
  if (hasNext.value) {
    fetchComments(currentPage.value + 1);
  }
};

const toggleActionMenu = (commentId) => {
  openMenuCommentId.value = openMenuCommentId.value === commentId ? null : commentId;
};

const handleReaction = async (item, reactionType) => {
  if (!isLoggedIn.value) {
    alert('로그인이 필요합니다.');
    return;
  }

  const isPost = !item.commentId;
  const url = isPost 
    ? `/boards/${boardId.value}/reaction` 
    : `/comments/${item.commentId}/reaction`;

  const isLiking = reactionType === 'LIKE';
  const wasLiked = item.userLiked;
  const wasDisliked = item.userDisliked;

  const originalState = { ...item };

  try {
    // Optimistic UI update
    if (isLiking) {
      item.userLiked = !wasLiked;
      item.likeCount += wasLiked ? -1 : 1;
      if (!wasLiked && wasDisliked) {
        item.userDisliked = false;
        item.dislikeCount -= 1;
      }
    } else { // Disliking
      item.userDisliked = !wasDisliked;
      item.dislikeCount += wasDisliked ? -1 : 1;
      if (!wasDisliked && wasLiked) {
        item.userLiked = false;
        item.likeCount -= 1;
      }
    }

    // API call
    if ((isLiking && wasLiked) || (!isLiking && wasDisliked)) {
      await apiClient.delete(url, { data: { type: reactionType } });
    } else {
      await apiClient.post(url, { type: reactionType });
    }
  } catch (error) {
    console.error('Reaction 처리 실패:', error.response ? error.response.data : error.message);
    alert('요청 처리에 실패했습니다.');
    // Revert UI on error
    Object.assign(item, originalState);
  }
};

const addComment = async () => {
  if (!newCommentContent.value.trim()) {
    alert('댓글 내용을 입력해주세요.');
    return;
  }
  try {
    await apiClient.post('/comments', {
      boardId: boardId.value,
      content: newCommentContent.value,
      parentId: null,
    });
    newCommentContent.value = '';
    alert('댓글이 성공적으로 작성되었습니다.');
    fetchComments(0, true); // Refresh comments
  } catch (error) {
    console.error('댓글 작성 실패:', error.response ? error.response.data : error.message);
    alert('댓글 작성에 실패했습니다.');
  }
};

const toggleReplyForm = (commentToReply) => {
  const currentlyReplying = commentToReply.isReplying;
  comments.value.forEach(c => { c.isReplying = false; c.replyText = ''; });
  commentToReply.isReplying = !currentlyReplying;
  closeAllMenus();
};

const cancelReply = (comment) => {
  comment.isReplying = false;
  comment.replyText = '';
};

const addReply = async (parentComment) => {
  if (!parentComment.replyText.trim()) {
    alert('답글 내용을 입력해주세요.');
    return;
  }
  try {
    await apiClient.post('/comments', {
      boardId: boardId.value,
      content: parentComment.replyText,
      parentId: parentComment.commentId,
    });
    parentComment.isReplying = false;
    parentComment.replyText = '';
    alert('답글이 성공적으로 작성되었습니다.');
    fetchComments(0, true); // Refresh comments
  } catch (error) {
    console.error('답글 작성 실패:', error.response ? error.response.data : error.message);
    alert('답글 작성에 실패했습니다.');
  }
};

const editComment = (comment) => {
  comment.isEditing = true;
  comment.editedContent = comment.content;
  closeAllMenus();
};

const saveEditedComment = async (comment) => {
  if (!comment.editedContent.trim()) {
    alert('댓글 내용을 입력해주세요.');
    return;
  }
  try {
    await apiClient.put(`/comments/${comment.commentId}`, { content: comment.editedContent });
    comment.content = comment.editedContent;
    comment.isEditing = false;
    alert('댓글이 수정되었습니다.');
  } catch (error) {
    console.error('댓글 수정 실패:', error.response ? error.response.data : error.message);
    alert('댓글 수정에 실패했습니다.');
  }
};

const cancelEdit = (comment) => {
  comment.editedContent = comment.originalContent;
  comment.isEditing = false;
};

const deleteComment = async (commentId) => {
  closeAllMenus();
  if (confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
    try {
      await apiClient.delete(`/comments/${commentId}`);
      alert('댓글이 삭제되었습니다.');
      fetchComments(0, true); // Refresh comments
    } catch (error) {
      console.error('댓글 삭제 실패:', error.response ? error.response.data : error.message);
      alert('댓글 삭제에 실패했습니다.');
    }
  }
};

const formatDateTime = (dateTime) => {
  if (!dateTime) return '날짜 정보 없음';
  try {
    const date = parse(dateTime, 'yyyy-MM-dd HH:mm:ss', new Date());
    return isNaN(date.getTime()) ? '날짜 형식 오류' : format(date, 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
  } catch (e) {
    console.error('날짜 파싱 오류:', e, '입력값:', dateTime);
    return '날짜 형식 오류';
  }
};

const goToEditPage = () => {
  router.push({ name: 'BoardEdit', params: { boardId: boardId.value } })
}

const handleDelete = async () => {
  if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
    try {
      await apiClient.delete(`/boards/${boardId.value}`)
      alert('게시글이 성공적으로 삭제되었습니다.')
      router.push({ name: 'Board' })
    } catch (error) {
      console.error('게시글 삭제 실패:', error.response ? error.response.data : error.message)
      alert('게시글 삭제에 실패했습니다.')
    }
  }
}
</script>

<style scoped>
.prose img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
}
</style>