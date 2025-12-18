<template>
  <div>
    <label class="block text-sm font-semibold text-gray-700 mb-2">{{ title }}</label>
    <div class="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
      <button
        v-for="option in options"
        :key="option.id"
        @click.prevent="toggleSelection(option.id)"
        :class="[
          'px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ease-in-out transform hover:scale-105',
          isSelected(option.id)
            ? 'bg-emerald-600 text-white shadow-md'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
        ]"
      >
        {{ option.name }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    required: true, // e.g., [{ id: 1, name: '땅콩' }, ...]
  },
  modelValue: {
    type: Array,
    required: true, // e.g., [1, 5, ...]
  },
});

const emit = defineEmits(['update:modelValue']);

const isSelected = (optionId) => {
  return props.modelValue.includes(optionId);
};

const toggleSelection = (optionId) => {
  const newSelection = [...props.modelValue];
  const index = newSelection.indexOf(optionId);

  if (index > -1) {
    newSelection.splice(index, 1); // Deselect
  } else {
    newSelection.push(optionId); // Select
  }
  emit('update:modelValue', newSelection);
};
</script>
