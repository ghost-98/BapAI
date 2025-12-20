<template>
  <main class="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-8">
    <!-- Header -->
    <div class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50 flex items-center justify-between">
      <div>
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight">그룹 게시글 상세</h1>
        <p class="text-gray-600 text-lg md:text-xl">그룹 게시글의 자세한 내용을 확인하고 의견을 남겨주세요.</p>
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
              <img :src="`${IMAGE_BASE_URL}${post.imgUrl}`" alt="게시글 이미지" class="w-full object-contain rounded-lg shadow-sm max-h-96">
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
        <div class="space-y-6">
          <!-- Comment Input Form -->
          <div v-if="isLoggedIn" class="bg-white/50 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-800 mb-3">댓글 작성</h3>
            <textarea
              v-model="newCommentContent"
              placeholder="댓글을 입력하세요..."
              rows="3"
              class="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:ring-orange-500 focus:outline-none transition-colors bg-white/50 text-gray-800 shadow-sm"
            ></textarea>
            <div class="flex justify-end mt-3">
              <button
                @click="addComment"
                class="px-5 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all font-semibold shadow-lg shadow-orange-500/30"
              >
                댓글 작성
              </button>
            </div>
          </div>

          <!-- Existing Comments -->
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

              <!-- Toggle Replies Button -->
              <div v-if="comment.children && comment.children.length > 0" class="mt-4">
                <button @click="toggleRepliesVisibility(comment)" class="text-sm font-semibold text-orange-600 hover:underline">
                  답글 {{ comment.children.length }}개 {{ comment.areChildrenVisible ? '숨기기' : '보기' }}
                </button>
              </div>

              <!-- Nested Replies (Children) -->
              <div v-if="comment.areChildrenVisible && comment.children && comment.children.length > 0" class="ml-6 md:ml-10 mt-4 space-y-4">
                <div v-for="reply in comment.children" :key="reply.commentId" class="bg-white/70 rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                      <UserCircle class="w-4 h-4 text-gray-500" />
                      <span class="font-semibold text-gray-800">{{ reply.nickname }}</span>
                      <span v-if="post && reply.userId === post.userId" class="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-0.5 rounded-full">작성자</span>
                      <span class="text-xs text-gray-500">{{ formatDateTime(reply.createdAt) }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <button @click="handleReaction(reply, 'LIKE')" :class="['flex items-center gap-1 text-sm', reply.userLiked ? 'text-orange-600' : 'text-gray-500 hover:text-orange-600']">
                        <ThumbsUp class="w-4 h-4 text-gray-400" /> {{ reply.likeCount || 0 }}
                      </button>
                      <button @click="handleReaction(reply, 'DISLIKE')" :class="['flex items-center gap-1 text-sm', reply.userDisliked ? 'text-rose-600' : 'text-gray-500 hover:text-rose-600']">
                        <ThumbsDown class="w-4 h-4 text-gray-400" /> {{ reply.dislikeCount || 0 }}
                      </button>
                      <!-- Action Menu (Kebab) for Replies -->
                      <div class="relative" v-if="isLoggedIn && reply.userId === Number(currentUserId)">
                        <button @click.stop="toggleActionMenu(reply.commentId)" class="p-1 rounded-full hover:bg-gray-200">
                          <MoreVertical class="w-4 h-4 text-gray-500" />
                        </button>
                        <div v-if="openMenuCommentId === reply.commentId" class="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10 border">
                          <button @click="editComment(reply)" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">수정</button>
                          <button @click="deleteComment(reply.commentId)" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">삭제</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <template v-if="!reply.isEditing">
                    <p class="text-gray-700 leading-relaxed">{{ reply.content }}</p>
                  </template>
                  <template v-else>
                    <textarea v-model="reply.editedContent" rows="3" class="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:ring-orange-500 focus:outline-none transition-colors bg-white/50 text-gray-800"></textarea>
                    <div class="flex justify-end mt-2 gap-2">
                      <button @click="cancelEdit(reply)" class="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-all font-medium">취소</button>
                      <button @click="saveEditedComment(reply)" class="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all font-semibold">저장</button>
                    </div>
                  </template>
                </div>
              </div>
            <p v-if="!comments || comments.length === 0" class="text-center text-gray-500 py-6">아직 댓글이 없습니다.</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-gray-500 py-20 bg-white/40 backdrop-blur-sm rounded-2xl p-8 border border-white/50">
      <p class="text-xl font-medium">게시글을 불러오는 중이거나 찾을 수 없습니다.</p>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchGroupBoardById, updateGroupBoard, deleteGroupBoard } from '../../../api' // 그룹 게시판 API 임포트
import apiClient from '../../../api' // 댓글 API는 아직 그룹 전용이 없으므로 기존 apiClient 사용
import { UserCircle, Eye, ThumbsUp, ThumbsDown, MoreVertical } from 'lucide-vue-next'
import { format, parse } from 'date-fns'
import { ko } from 'date-fns/locale'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const IMAGE_BASE_URL = API_BASE_URL.replace('/api', '');

const route = useRoute()
const router = useRouter()

const post = ref(null)
const groupId = ref(null) // groupId 추가
const boardId = ref(null)
const comments = ref([])
const newCommentContent = ref('')
const openMenuCommentId = ref(null)

const topLevelCommentCount = computed(() => comments.value.length);

const categories = [
  { id: 'FREE', name: '자유 게시판' },
  { id: 'CHALLENGE', name: '챌린지 인증' },
  { id: 'QNA', name: '질문과 답변' },
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
  groupId.value = route.params.groupId; // groupId 가져오기
  boardId.value = route.params.boardId;
  if (groupId.value && boardId.value) {
    fetchPostDetail(groupId.value, boardId.value);
    fetchComments(groupId.value, boardId.value);
  }
  window.addEventListener('click', closeAllMenus);
})

onBeforeUnmount(() => {
  window.removeEventListener('click', closeAllMenus);
});

const fetchPostDetail = async (groupId, boardId) => {
  try {
    const response = await fetchGroupBoardById(groupId, boardId); // 그룹 게시판 API 사용
    // Map server's userLiked string/null to boolean flags
    post.value = {
      ...response.data,
      userLiked: response.data.userLiked === 'LIKE',
      userDisliked: response.data.userLiked === 'DISLIKE',
    };
  } catch (error) {
    console.error('그룹 게시글 상세 불러오기 실패:', error);
    alert('그룹 게시글을 불러오는 데 실패했습니다.');
    router.push(`/group/${groupId}/board`); // 그룹 게시판 목록으로 이동
  }
}

const processComments = (commentList) => {
  if (!commentList) return [];
  return commentList.map(comment => {
    const processedComment = {
      ...comment,
      // Map server's userLiked string/null to boolean flags
      userLiked: comment.userLiked === 'LIKE',
      userDisliked: comment.userLiked === 'DISLIKE',
      isEditing: false,
      originalContent: comment.content,
      isReplying: false,
      replyText: '',
      areChildrenVisible: false
    };
    if (comment.children && comment.children.length > 0) {
      processedComment.children = processComments(comment.children);
    }
    return processedComment;
  });
};

const fetchComments = async (groupId, boardId) => {
  try {
    // TODO: 그룹 게시판 댓글 API가 따로 있다면 변경해야 함. 현재는 일반 게시판 댓글 API 사용
    const response = await apiClient.get(`/boards/${boardId}/comments`); 
    comments.value = processComments(response.data);
  } catch (error) {
    console.error('댓글 불러오기 실패:', error.response ? error.response.data : error.message)
  }
}

const toggleRepliesVisibility = (comment) => {
  comment.areChildrenVisible = !comment.areChildrenVisible;
};

const toggleActionMenu = (commentId) => {
  if (openMenuCommentId.value === commentId) {
    openMenuCommentId.value = null;
  } else {
    openMenuCommentId.value = commentId;
  }
};

const handleReaction = async (item, reactionType) => {
  if (!isLoggedIn.value) {
    alert('로그인이 필요합니다.');
    return;
  }

  const isPost = !item.commentId;
  // TODO: 그룹 게시판 반응 API가 따로 있다면 변경해야 함. 현재는 일반 게시판 반응 API 사용
  const url = isPost 
    ? `/boards/${boardId.value}/reaction` 
    : `/comments/${item.commentId}/reaction`;

  const isLiking = reactionType === 'LIKE';
  const wasLiked = item.userLiked;
  const wasDisliked = item.userDisliked;

  const originalState = {
    userLiked: item.userLiked,
    userDisliked: item.userDisliked,
    likeCount: item.likeCount,
    dislikeCount: item.dislikeCount,
  };

  try {
    if (isLiking) {
      if (wasLiked) {
        item.userLiked = false;
        item.likeCount--;
        await apiClient.delete(url, { data: { type: 'LIKE' } });
      } else {
        item.userLiked = true;
        item.likeCount++;
        if (wasDisliked) {
          item.userDisliked = false;
          item.dislikeCount--;
          await apiClient.delete(url, { data: { type: 'DISLIKE' } });
        }
        await apiClient.post(url, { type: 'LIKE' });
      }
    } else {
      if (wasDisliked) {
        item.userDisliked = false;
        item.dislikeCount--;
        await apiClient.delete(url, { data: { type: 'DISLIKE' } });
      } else {
        item.userDisliked = true;
        item.dislikeCount++;
        if (wasLiked) {
          item.userLiked = false;
          item.likeCount--;
          await apiClient.delete(url, { data: { type: 'LIKE' } });
        }
        await apiClient.post(url, { type: 'DISLIKE' });
      }
    }
  } catch (error) {
    console.error('Reaction 처리 실패:', error.response ? error.response.data : error.message);
    alert('요청 처리에 실패했습니다.');
    item.userLiked = originalState.userLiked;
    item.userDisliked = originalState.userDisliked;
    item.likeCount = originalState.likeCount;
    item.dislikeCount = originalState.dislikeCount;
  }
};

const addComment = async () => {
  if (!newCommentContent.value.trim()) {
    alert('댓글 내용을 입력해주세요.');
    return;
  }
  try {
    // TODO: 그룹 게시판 댓글 API가 따로 있다면 변경해야 함. 현재는 일반 게시판 댓글 API 사용
    await apiClient.post('/comments', {
      boardId: boardId.value,
      content: newCommentContent.value,
      parentId: null,
    });
    newCommentContent.value = '';
    alert('댓글이 성공적으로 작성되었습니다.');
    fetchComments(groupId.value, boardId.value);
  } catch (error) {
    console.error('댓글 작성 실패:', error.response ? error.response.data : error.message);
    alert('댓글 작성에 실패했습니다.');
  }
};

const toggleReplyForm = (commentToReply) => {
  const currentlyReplying = commentToReply.isReplying;
  const closeAllReplies = (commentList) => {
    commentList.forEach(c => {
      c.isReplying = false;
      c.replyText = '';
      if (c.children) closeAllReplies(c.children);
    });
  };
  closeAllReplies(comments.value);
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
    // TODO: 그룹 게시판 댓글 API가 따로 있다면 변경해야 함. 현재는 일반 게시판 댓글 API 사용
    await apiClient.post('/comments', {
      boardId: boardId.value,
      content: parentComment.replyText,
      parentId: parentComment.commentId,
    });
    parentComment.isReplying = false;
    parentComment.replyText = '';
    alert('답글이 성공적으로 작성되었습니다.');
    fetchComments(groupId.value, boardId.value);
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
    // TODO: 그룹 게시판 댓글 API가 따로 있다면 변경해야 함. 현재는 일반 게시판 댓글 API 사용
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
  if (confirm('정말로 이 댓글을 삭제하시겠습니까? 대댓글이 있는 경우 함께 삭제될 수 있습니다.')) {
    try {
      // TODO: 그룹 게시판 댓글 API가 따로 있다면 변경해야 함. 현재는 일반 게시판 댓글 API 사용
      await apiClient.delete(`/comments/${commentId}`);
      alert('댓글이 삭제되었습니다.');
      fetchComments(groupId.value, boardId.value);
    } catch (error) {
      console.error('댓글 삭제 실패:', error.response ? error.response.data : error.message);
      alert('댓글 삭제에 실패했습니다.');
    }
  }
};

const formatDateTime = (dateTime) => {
  if (!dateTime) {
    return '날짜 정보 없음';
  }
  try {
    const date = parse(dateTime, 'yyyy-MM-dd HH:mm:ss', new Date());
    if (isNaN(date.getTime())) {
      return '날짜 형식 오류';
    }
    return format(date, 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
  } catch (e) {
    console.error('날짜 파싱 오류:', e, '입력값:', dateTime);
    return '날짜 형식 오류';
  }
};

const goToEditPage = () => {
  // TODO: 그룹 게시판 수정 페이지 라우트 정의 필요
  router.push(`/group/${groupId.value}/board/${boardId.value}/edit`);
}

const handleDelete = async () => {
  if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
    try {
      await deleteGroupBoard(groupId.value, boardId.value); // 그룹 게시판 API 사용
      alert('게시글이 성공적으로 삭제되었습니다.');
      router.push(`/group/${groupId.value}/board`); // 그룹 게시판 목록으로 이동
    } catch (error) {
      console.error('게시글 삭제 실패:', error.response ? error.response.data : error.message);
      alert('게시글 삭제에 실패했습니다.');
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
