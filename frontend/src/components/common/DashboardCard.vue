<template>
  <div class="p-1 bg-gradient-to-br from-orange-200 to-rose-200 rounded-3xl shadow-lg h-full">
    <div class="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50">
      <h2 v-if="title" class="text-xl font-bold text-gray-800 mb-4">{{ title }}</h2>
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  }
})
</script>
