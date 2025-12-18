<template>
  <main class="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-8">
    <!-- Header -->
    <div class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
      <h1 class="text-4xl font-bold text-gray-900">{{ isEditMode ? '게시글 수정' : '새 게시글 작성' }}</h1>
      <p class="text-gray-600 mt-1">자유롭게 글을 작성하거나 수정해주세요.</p>
    </div>

    <!-- Main Content Container -->
    <div class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- 카테고리 선택 -->
        <div>
          <label for="category" class="block text-sm font-semibold text-gray-700 mb-2">카테고리</label>
          <select
            id="category"
            v-model="board.category"
            :disabled="isEditMode"
            class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800 disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="FREE">자유게시판</option>
            <option value="REVIEW">식단 공유</option>
            <option value="HEALTH_INFO">건강 정보</option>
          </select>
        </div>

        <!-- 제목 -->
        <div>
          <label for="title" class="block text-sm font-semibold text-gray-700 mb-2">제목</label>
          <input
            id="title"
            v-model="board.title"
            type="text"
            required
            class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800"
            placeholder="제목을 입력하세요"
          />
        </div>

        <!-- 내용 -->
        <div>
          <label for="content" class="block text-sm font-semibold text-gray-700 mb-2">내용</label>
          <textarea
            id="content"
            v-model="board.content"
            rows="10"
            required
            class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800"
            placeholder="내용을 입력하세요"
          ></textarea>
        </div>

        <!-- 이미지 업로드 -->
        <div>
          <label for="image" class="block text-sm font-semibold text-gray-700 mb-2">이미지</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            @change="handleImageUpload"
            class="w-full text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
          />
          <div v-if="board.imgUrl" class="mt-4 relative w-48 h-48 rounded-lg overflow-hidden border border-gray-200">
            <img :src="board.imgUrl" alt="업로드된 이미지" class="w-full h-full object-cover">
            <button @click="removeImage" type="button" class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition">
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- 버튼 -->
        <div class="flex justify-end space-x-4 pt-4 border-t border-gray-200/80">
          <button
            type="button"
            @click="router.go(-1)"
            class="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-all font-semibold"
          >
            취소
          </button>
          <button
            type="submit"
            class="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all font-semibold shadow-lg shadow-orange-500/30"
          >
            {{ isEditMode ? '수정 완료' : '작성 완료' }}
          </button>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue' // Added onBeforeUnmount
import { useRoute, useRouter } from 'vue-router'
import apiClient from '../../../api'
import { X } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const board = ref({
  boardId: null,
  category: 'FREE',
  title: '',
  content: '',
  imgUrl: null,
  imgFile: null,
})

const isEditMode = computed(() => !!route.params.boardId)

// Helper to revoke object URL
const revokeCurrentImageUrl = () => {
  if (board.value.imgUrl && board.value.imgUrl.startsWith('blob:')) {
    URL.revokeObjectURL(board.value.imgUrl);
  }
};

onMounted(async () => {
  if (isEditMode.value) {
    board.value.boardId = route.params.boardId
    await fetchBoardDetail(board.value.boardId)
  } else { // Not in edit mode
    if (route.query.category) {
      board.value.category = route.query.category;
    }
    if (route.query.title) {
      board.value.title = route.query.title;
    }
    if (route.query.content) {
      board.value.content = route.query.content;
    }
  }
})

onBeforeUnmount(() => { // Added onBeforeUnmount hook
  revokeCurrentImageUrl();
});

const fetchBoardDetail = async (id) => {
  try {
    const response = await apiClient.get(`/boards/${id}`)
    const data = response.data
    board.value.category = data.category
    board.value.title = data.title
    board.value.content = data.content
    // When fetching detail, if there's an existing imgUrl from server, it's not a blob URL
    // so no need to revoke here.
    board.value.imgUrl = data.imgUrl
  } catch (error) {
    console.error('게시글 상세 불러오기 실패:', error)
    alert('게시글을 불러오는 데 실패했습니다.')
    router.push({ name: 'Board' })
  }
}

const handleImageUpload = (event) => {
  revokeCurrentImageUrl(); // Revoke previous URL before creating a new one
  const file = event.target.files[0]
  if (file) {
    board.value.imgFile = file
    board.value.imgUrl = URL.createObjectURL(file) // 미리보기 URL 생성
  } else {
    board.value.imgFile = null; // Clear file if selection is cancelled
    board.value.imgUrl = null;
  }
}

const removeImage = () => {
  revokeCurrentImageUrl(); // Revoke URL before setting to null
  board.value.imgFile = null
  board.value.imgUrl = null
  const fileInput = document.getElementById('image')
  if (fileInput) fileInput.value = ''
}

const handleSubmit = async () => {
  const formData = new FormData()
  formData.append('category', board.value.category)
  formData.append('title', board.value.title)
  formData.append('content', board.value.content)
  if (board.value.imgFile) {
    formData.append('image', board.value.imgFile)
  } else if (board.value.imgUrl === null && isEditMode.value) {
    formData.append('removeImg', 'true')
  }

  try {
    if (isEditMode.value) {
      await apiClient.put(`/boards/${board.value.boardId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      alert('게시글이 성공적으로 수정되었습니다.')
    } else {
      await apiClient.post('/boards', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      alert('게시글이 성공적으로 작성되었습니다.')
    }
    router.push({ name: 'Board' })
  } catch (error) {
    console.error('게시글 저장 실패:', error.response ? error.response.data : error.message)
    alert('게시글 저장에 실패했습니다.')
  } finally {
    revokeCurrentImageUrl(); // Revoke URL after submission is complete
  }
}
</script>

<style scoped>
/* 필요한 경우 여기에 스타일을 추가합니다 */
</style>