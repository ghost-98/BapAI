<template>
  <nav v-if="totalPages > 1" class="flex justify-center items-center space-x-2 mt-4" aria-label="Pagination">
    <button
      @click="goToPage(1)"
      :disabled="currentPage === 1"
      class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      처음
    </button>
    <button
      @click="goToPage(currentPage - 1)"
      :disabled="currentPage === 1"
      class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      이전
    </button>

    <template v-for="page in displayedPages" :key="page">
      <button
        @click="goToPage(page)"
        :class="['px-3 py-1.5 text-sm font-medium rounded-md',
                 page === currentPage ? 'bg-orange-500 text-white' : 'text-gray-700 bg-gray-100 hover:bg-gray-200']"
      >
        {{ page }}
      </button>
    </template>

    <button
      @click="goToPage(currentPage + 1)"
      :disabled="currentPage === totalPages"
      class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      다음
    </button>
    <button
      @click="goToPage(totalPages)"
      :disabled="currentPage === totalPages"
      class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      마지막
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  pageRange: {
    type: Number,
    default: 5, // Number of page buttons to display around the current page
  },
});

const emit = defineEmits(['page-change']);

const displayedPages = computed(() => {
  const pages = [];
  const startPage = Math.max(1, props.currentPage - Math.floor(props.pageRange / 2));
  const endPage = Math.min(props.totalPages, startPage + props.pageRange - 1);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
});

const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-change', page);
  }
};
</script>
