<template>
  <form @submit.prevent="submitUpdate" class="space-y-8">
    <h3 class="text-xl font-bold text-gray-800">그룹 설정</h3>
    
    <!-- Group Name -->
    <div>
      <label for="group-name" class="block text-sm font-semibold text-gray-700 mb-2">그룹 이름</label>
      <input type="text" id="group-name" v-model="editableGroup.name" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800" />
    </div>

    <!-- Group Description -->
    <div>
      <label for="group-description" class="block text-sm font-semibold text-gray-700 mb-2">그룹 설명</label>
      <textarea id="group-description" v-model="editableGroup.description" rows="4" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800"></textarea>
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
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-200">
      <!-- Max Members -->
      <div>
        <label for="max-members" class="block text-sm font-semibold text-gray-700 mb-2">최대 인원</label>
        <input type="number" id="max-members" v-model.number="editableGroup.maxMember" min="2" max="100" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800" />
      </div>

      <!-- Public/Private -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">공개 설정</label>
        <div class="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl">
            <button type="button" @click="editableGroup.type = 'PUBLIC'" :class="['w-1/2 py-2.5 rounded-lg font-semibold text-sm transition-all', editableGroup.type === 'PUBLIC' ? 'bg-white text-orange-600 shadow' : 'text-gray-600']">공개</button>
            <button type="button" @click="editableGroup.type = 'PRIVATE'" :class="['w-1/2 py-2.5 rounded-lg font-semibold text-sm transition-all', editableGroup.type === 'PRIVATE' ? 'bg-white text-orange-600 shadow' : 'text-gray-600']">비공개</button>
        </div>
      </div>
    </div>

    <div class="text-right">
      <button type="submit" class="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium shadow-md transition-colors">
        변경사항 저장
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { fetchAvailableTags } from '@/api';
import { useNotificationStore } from '@/stores/notification';

const props = defineProps({
  group: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update-group']);
const notificationStore = useNotificationStore();

const originalGroup = ref(null);
const editableGroup = ref({ tags: [] });
const availableTags = ref([]);

watch(() => props.group, (newGroup) => {
  if (newGroup) {
    const type = typeof newGroup.isPublic === 'boolean' 
      ? (newGroup.isPublic ? 'PUBLIC' : 'PRIVATE') 
      : newGroup.type;

    const groupData = { ...newGroup, type, tags: [...(newGroup.tags || [])] };
    originalGroup.value = JSON.parse(JSON.stringify(groupData));
    editableGroup.value = groupData;
  }
}, { immediate: true, deep: true });

const toggleTag = (tag) => {
  const index = editableGroup.value.tags.indexOf(tag);
  if (index > -1) {
    editableGroup.value.tags.splice(index, 1);
  } else if (editableGroup.value.tags.length < 3) {
    editableGroup.value.tags.push(tag);
  } else {
    notificationStore.showNotification('태그는 최대 3개까지 선택할 수 있습니다.', 'warning');
  }
};

const submitUpdate = () => {
  const changedData = {};

  if (editableGroup.value.name !== originalGroup.value.name) {
    changedData.name = editableGroup.value.name;
  }
  if (editableGroup.value.description !== originalGroup.value.description) {
    changedData.description = editableGroup.value.description;
  }
  if (editableGroup.value.maxMember !== originalGroup.value.maxMember) {
    changedData.maxMember = editableGroup.value.maxMember;
  }
  if (editableGroup.value.type !== originalGroup.value.type) {
    changedData.type = editableGroup.value.type;
  }

  const originalTags = JSON.stringify(originalGroup.value.tags.slice().sort());
  const newTags = JSON.stringify(editableGroup.value.tags.slice().sort());
  if (originalTags !== newTags) {
    changedData.tags = editableGroup.value.tags;
  }

  if (Object.keys(changedData).length > 0) {
    emit('update-group', changedData);
  } else {
    notificationStore.showNotification('변경사항이 없습니다.', 'info');
  }
};

onMounted(async () => {
  try {
    availableTags.value = await fetchAvailableTags();
  } catch (error) {
    console.error('Failed to fetch available tags:', error);
    notificationStore.showNotification('태그 목록을 불러오는데 실패했습니다.', 'error');
  }
});
</script>
