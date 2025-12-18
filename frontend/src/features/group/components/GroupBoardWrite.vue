<template>
  <div class="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
      <form @submit.prevent="submitPost">
        <div class="p-8">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">새 게시글 작성</h2>
            <button @click="$emit('cancel')" type="button" class="text-gray-400 hover:text-gray-600">
              <X class="w-6 h-6" />
            </button>
          </div>

          <div class="space-y-6">
            <!-- Title -->
            <div>
              <label for="post-title" class="block text-sm font-medium text-gray-700 mb-1">제목</label>
              <input type="text" id="post-title" v-model="post.title" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" placeholder="게시글 제목">
            </div>

            <!-- Content -->
            <div>
              <label for="post-content" class="block text-sm font-medium text-gray-700 mb-1">내용</label>
              <textarea id="post-content" v-model="post.content" rows="8" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" placeholder="내용을 입력하세요..."></textarea>
            </div>
            
            <!-- Announcement Checkbox -->
            <div v-if="isLeader" class="flex items-center">
              <input type="checkbox" id="is-announcement" v-model="post.isAnnouncement" class="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500">
              <label for="is-announcement" class="ml-2 block text-sm text-gray-900">공지사항으로 등록</label>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="bg-gray-50 px-8 py-4 flex justify-end gap-4 rounded-b-2xl">
          <button type="button" @click="$emit('cancel')" class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300">
            취소
          </button>
          <button type="submit" class="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 shadow-lg shadow-orange-500/30">
            작성하기
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps({
  isLeader: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['cancel', 'submit']);

const post = reactive({
  title: '',
  content: '',
  isAnnouncement: false,
});

const submitPost = () => {
  if (!post.title.trim() || !post.content.trim()) {
    alert('제목과 내용을 모두 입력해주세요.');
    return;
  }
  emit('submit', { ...post });
};
</script>
