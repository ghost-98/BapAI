<template>
  <div class="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[70vh]">
      <div class="flex justify-between items-center p-6 border-b border-gray-200">
        <h2 class="text-2xl font-bold text-gray-900">그룹에 멤버 초대</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <X class="w-6 h-6" />
        </button>
      </div>

      <div class="p-6 space-y-4">
        <div class="relative">
          <input
            type="text"
            v-model="searchKeyword"
            placeholder="초대할 사용자의 닉네임 검색"
            class="w-full px-4 py-3 pl-10 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none"
            @input="debouncedSearch"
          />
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div class="flex-grow overflow-y-auto px-6 pb-6">
        <div v-if="isLoading" class="text-center py-4">
          <p>검색 중...</p>
        </div>
        <div v-else-if="searchResults.length > 0" class="space-y-3">
          <div v-for="user in searchResults" :key="user.userId" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <p class="font-semibold">{{ user.nickname }}</p>
            <button @click="handleInvite(user.userId)" class="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600">
              초대
            </button>
          </div>
        </div>
        <div v-else-if="searchKeyword && !isLoading" class="text-center py-4 text-gray-500">
          <p>검색 결과가 없습니다.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Search, X } from 'lucide-vue-next';
import { searchUsersForGroupInvite, inviteUserToGroup } from '@/api';
import { useNotificationStore } from '@/stores/notification';

const props = defineProps({
  groupId: {
    type: [String, Number],
    required: true,
  },
});

const emit = defineEmits(['close']);

const searchKeyword = ref('');
const searchResults = ref([]);
const isLoading = ref(false);
const notificationStore = useNotificationStore();
let debounceTimer = null;

const debouncedSearch = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    searchUsers();
  }, 300);
};

const searchUsers = async () => {
  if (!searchKeyword.value.trim()) {
    searchResults.value = [];
    return;
  }
  isLoading.value = true;
  try {
    searchResults.value = await searchUsersForGroupInvite(props.groupId, searchKeyword.value);
  } catch (error) {
    console.error('Failed to search users:', error);
    notificationStore.showNotification('사용자 검색에 실패했습니다.', 'error');
  } finally {
    isLoading.value = false;
  }
};

const handleInvite = async (userId) => {
  try {
    await inviteUserToGroup(props.groupId, userId);
    notificationStore.showNotification('성공적으로 초대했습니다.', 'success');
    // Remove the invited user from the list
    searchResults.value = searchResults.value.filter(user => user.userId !== userId);
  } catch (error) {
    console.error('Failed to invite user:', error);
    notificationStore.showNotification(error.response?.data?.message || '초대에 실패했습니다.', 'error');
  }
};
</script>
