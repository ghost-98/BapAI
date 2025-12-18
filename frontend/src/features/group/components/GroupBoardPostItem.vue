<template>
  <article class="flex items-start gap-4">
    <img :src="`https://i.pravatar.cc/150?u=${post.author.id}`" class="w-10 h-10 rounded-full object-cover border-2 border-white shadow flex-shrink-0">
    <div class="flex-grow">
      <div class="flex items-center justify-between">
        <div>
          <p class="font-semibold text-gray-800">{{ post.author.name }}</p>
          <p class="text-xs text-gray-500">{{ formattedDate }}</p>
        </div>
        <div v-if="post.mealScore" :class="['px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5', getScoreColor(post.mealScore).bg, getScoreColor(post.mealScore).text]">
          <Sparkles class="w-4 h-4" />
          <span>{{ post.mealScore }}점</span>
        </div>
      </div>
      <div class="mt-2">
        <h4 class="font-bold text-lg text-gray-800">{{ post.title }}</h4>
        <p class="mt-1 text-gray-700 whitespace-pre-wrap">{{ post.content }}</p>
      </div>
      <!-- Actions: Like, Dislike, Comment -->
      <div class="mt-3 flex items-center gap-6 text-sm text-gray-600">
        <button class="flex items-center gap-1.5 hover:text-orange-600 transition-colors">
          <ThumbsUp class="w-4 h-4" />
          <span>{{ post.likes || 0 }}</span>
        </button>
        <button class="flex items-center gap-1.5 hover:text-gray-800 transition-colors">
          <ThumbsDown class="w-4 h-4" />
          <span>{{ post.dislikes || 0 }}</span>
        </button>
        <button class="flex items-center gap-1.5 hover:text-orange-600 transition-colors">
          <MessageSquare class="w-4 h-4" />
          <span>{{ post.comments || 0 }}</span>
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';
import { ThumbsUp, ThumbsDown, MessageSquare, Sparkles } from 'lucide-vue-next';

const props = defineProps({
  post: {
    type: Object,
    required: true,
  }
});

const formattedDate = computed(() => {
  if (!props.post.createdAt) return '';
  return new Date(props.post.createdAt).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});

const getScoreColor = (score) => {
  if (score >= 90) return { bg: 'bg-green-100', text: 'text-green-800' };
  if (score >= 80) return { bg: 'bg-blue-100', text: 'text-blue-800' };
  if (score >= 70) return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
  return { bg: 'bg-red-100', text: 'text-red-800' };
};
</script>
