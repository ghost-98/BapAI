<template>
  <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md border border-gray-200/80 p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">그룹 정보 수정</h2>
    <form @submit.prevent="submitUpdate">
      <div class="space-y-6">
        <!-- Group Name -->
        <div>
          <label for="edit-group-name" class="block text-sm font-semibold text-gray-700 mb-2">그룹 이름 <span class="text-red-500">*</span></label>
          <input type="text" id="edit-group-name" v-model="editableGroup.name" required class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800" :class="{'border-red-500': !editableGroup.name && formSubmitted}">
          <p v-if="!editableGroup.name && formSubmitted" class="text-red-500 text-xs mt-1">그룹 이름은 필수입니다.</p>
        </div>

        <!-- Group Description -->
        <div>
          <label for="edit-group-description" class="block text-sm font-semibold text-gray-700 mb-2">그룹 설명 <span class="text-red-500">*</span></label>
          <textarea id="edit-group-description" v-model="editableGroup.description" required rows="4" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800" :class="{'border-red-500': !editableGroup.description && formSubmitted}"></textarea>
          <p v-if="!editableGroup.description && formSubmitted" class="text-red-500 text-xs mt-1">그룹 설명은 필수입니다.</p>
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
                editableGroup.tags.includes(tag)
                  ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/30'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-orange-400 hover:text-orange-600'
              ]"
            >
              #{{ tag }}
            </button>
          </div>
          <p v-if="editableGroup.tags.length === 0 && formSubmitted" class="text-red-500 text-xs mt-1">태그를 하나 이상 선택해주세요.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-200">
          <!-- Max Members -->
          <div>
            <label for="edit-max-members" class="block text-sm font-semibold text-gray-700 mb-2">최대 인원 <span class="text-red-500">*</span></label>
            <input type="number" id="edit-max-members" v-model.number="editableGroup.maxMembers" min="2" max="100" required class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800" :class="{'border-red-500': editableGroup.maxMembers < 2 && formSubmitted}">
            <p v-if="editableGroup.maxMembers < 2 && formSubmitted" class="text-red-500 text-xs mt-1">최대 인원은 2명 이상이어야 합니다.</p>
          </div>

          <!-- Public/Private -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">공개 설정</label>
            <div class="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl">
                <button type="button" @click="editableGroup.isPublic = true" :class="['w-1/2 py-2.5 rounded-lg font-semibold text-sm transition-all', editableGroup.isPublic ? 'bg-white text-orange-600 shadow' : 'text-gray-600']">공개</button>
                <button type="button" @click="editableGroup.isPublic = false" :class="['w-1/2 py-2.5 rounded-lg font-semibold text-sm transition-all', !editableGroup.isPublic ? 'bg-white text-orange-600 shadow' : 'text-gray-600']">비공개</button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 flex justify-end gap-4">
        <button type="button" @click="resetForm" class="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-all font-semibold">
          초기화
        </button>
        <button type="submit" class="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all font-semibold shadow-lg shadow-orange-500/30">
          변경 사항 저장
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';

const props = defineProps({
  group: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update-group']);

const editableGroup = reactive({ ...props.group });
const formSubmitted = ref(false);

const availableTags = ref([
  '다이어트', '아토피', '저탄고지', '비건', '운동', '레시피',
  '당뇨', '고혈압', '키토제닉', '간헐적단식', '식단일기', '체중감량',
  '근력증가', '유지어터', '프로필준비', '대회준비', '산후조리', '이유식'
]);

const toggleTag = (tag) => {
  const index = editableGroup.tags.indexOf(tag);
  if (index > -1) {
    editableGroup.tags.splice(index, 1);
  } else if (editableGroup.tags.length < 3) {
    editableGroup.tags.push(tag);
  } else {
    alert('태그는 최대 3개까지 선택할 수 있습니다.');
  }
};

const submitUpdate = () => {
  formSubmitted.value = true;

  if (!editableGroup.name.trim() || !editableGroup.description.trim() || editableGroup.tags.length === 0 || editableGroup.maxMembers < 2) {
    return;
  }
  emit('update-group', { ...editableGroup });
  formSubmitted.value = false; // Reset after successful submission
};

const resetForm = () => {
  Object.assign(editableGroup, props.group);
  formSubmitted.value = false;
};

// Watch for changes in the prop.group and update editableGroup
watch(() => props.group, (newGroup) => {
  Object.assign(editableGroup, newGroup);
}, { deep: true });
</script>
