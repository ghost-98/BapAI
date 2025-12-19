<template>
  <div class="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
        <h2 class="text-2xl font-bold text-gray-900">새 그룹 만들기</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition-colors">
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- Form Content -->
      <form @submit.prevent="createGroup" class="flex-grow overflow-y-auto">
        <div class="p-8 space-y-8">
          <!-- Group Name -->
          <div>
            <label for="group-name" class="block text-sm font-semibold text-gray-700 mb-2">그룹 이름 <span class="text-red-500">*</span></label>
            <input type="text" id="group-name" v-model="group.name" required class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800" :class="{'border-red-500': !group.name && formSubmitted}" placeholder="예: 매일 아침 샐러드 챌린지">
            <p v-if="!group.name && formSubmitted" class="text-red-500 text-xs mt-1">그룹 이름은 필수입니다.</p>
          </div>

          <!-- Group Description -->
          <div>
            <label for="group-description" class="block text-sm font-semibold text-gray-700 mb-2">그룹 설명 <span class="text-red-500">*</span></label>
            <textarea id="group-description" v-model="group.description" required rows="4" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800" :class="{'border-red-500': !group.description && formSubmitted}" placeholder="어떤 그룹인지 간단하게 설명해주세요."></textarea>
            <p v-if="!group.description && formSubmitted" class="text-red-500 text-xs mt-1">그룹 설명은 필수입니다.</p>
          </div>

          <!-- Tags -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">그룹 태그</label>
            <p class="text-sm text-gray-500 mb-3">그룹을 가장 잘 나타내는 태그를 최대 3개까지 선택해주세요.</p>
            <div class="flex flex-wrap gap-3">
              <button
                v-for="tag in availableTags"
                :key="tag"
                @click.prevent="toggleTag(tag)"
                :class="[
                  'px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border-2',
                  group.tags.includes(tag)
                    ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/30'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-orange-400 hover:text-orange-600'
                ]"
              >
                #{{ tag }}
              </button>
            </div>
            <p v-if="group.tags.length === 0 && formSubmitted" class="text-red-500 text-xs mt-1">태그를 하나 이상 선택해주세요.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-200">
            <!-- Max Members -->
            <div>
              <label for="max-members" class="block text-sm font-semibold text-gray-700 mb-2">최대 인원 <span class="text-red-500">*</span></label>
              <input type="number" id="max-members" v-model.number="group.maxMembers" min="2" max="100" required class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800" :class="{'border-red-500': group.maxMembers < 2 && formSubmitted}">
              <p v-if="group.maxMembers < 2 && formSubmitted" class="text-red-500 text-xs mt-1">최대 인원은 2명 이상이어야 합니다.</p>
            </div>

            <!-- Public/Private -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">공개 설정</label>
              <div class="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl">
                  <button type="button" @click="group.isPublic = true" :class="['w-1/2 py-2.5 rounded-lg font-semibold text-sm transition-all', group.isPublic ? 'bg-white text-orange-600 shadow' : 'text-gray-600']">공개</button>
                  <button type="button" @click="group.isPublic = false" :class="['w-1/2 py-2.5 rounded-lg font-semibold text-sm transition-all', !group.isPublic ? 'bg-white text-orange-600 shadow' : 'text-gray-600']">비공개</button>
              </div>
            </div>
          </div>
        </div>
      </form>
      
      <!-- Footer -->
      <div class="p-6 bg-gray-50 flex justify-end gap-4 rounded-b-2xl border-t border-gray-200 flex-shrink-0">
        <button type="button" @click="$emit('close')" class="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-all font-semibold">
          취소
        </button>
        <button type="submit" @click="createGroup" :disabled="isLoading" class="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all font-semibold shadow-lg shadow-orange-500/30">
          {{ isLoading ? '생성 중...' : '생성하기' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'create']);

const group = reactive({
  name: '',
  description: '',
  tags: [],
  maxMembers: 10,
  isPublic: true,
});

const formSubmitted = ref(false); // New state to track form submission for validation messages

const availableTags = ref([
  '다이어트', '아토피', '저탄고지', '비건', '운동', '레시피',
  '당뇨', '고혈압', '키토제닉', '간헐적단식', '식단일기', '체중감량',
  '근력증가', '유지어터', '프로필준비', '대회준비', '산후조리', '이유식'
]);

const toggleTag = (tag) => {
  const index = group.tags.indexOf(tag);
  if (index > -1) {
    group.tags.splice(index, 1);
  } else if (group.tags.length < 3) {
    group.tags.push(tag);
  } else {
    alert('태그는 최대 3개까지 선택할 수 있습니다.');
  }
};

const createGroup = () => {
  formSubmitted.value = true; // Set form as submitted to show validation messages

  // Basic validation
  if (!group.name.trim() || !group.description.trim() || group.tags.length === 0 || group.maxMembers < 2) {
    // alert('모든 필수 필드를 입력하고 태그를 선택해주세요.'); // Removed alert for better UX
    return;
  }
  emit('create', { ...group });
  // emit('close'); // Parent will close on success
};
</script>
