<template>
  <div class="mt-8 pt-6 border-t border-gray-200">
    <h3 class="text-xl font-bold text-gray-800 mb-4">가입 요청 관리</h3>
    <div v-if="isLoading" class="flex items-center text-gray-500">
      <Loader2 class="w-5 h-5 animate-spin mr-2" />
      <span>요청 목록을 불러오는 중...</span>
    </div>
    <div v-else-if="requests.length === 0" class="text-gray-500 bg-gray-50/80 p-4 rounded-lg text-center">
      대기 중인 가입 요청이 없습니다.
    </div>
    <div v-else class="space-y-3">
      <div v-for="request in requests" :key="request.userId" class="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200/80 shadow-sm">
        <div class="flex items-center gap-3">
          <img :src="`https://i.pravatar.cc/150?u=${request.userId}`" class="w-10 h-10 rounded-full object-cover">
          <div>
            <p class="font-semibold text-gray-800">{{ request.nickname }}</p>
            <p class="text-sm text-gray-500">{{ new Date(request.requestedAt).toLocaleString() }}</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button @click="handleRequest(request.userId, 'approve')" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-sm">
            승인
          </button>
          <button @click="handleRequest(request.userId, 'reject')" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold text-sm">
            거절
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useNotificationStore } from '@/stores/notification';
import { fetchGroupJoinRequests, approveJoinRequest, rejectJoinRequest } from '@/api';
import { Loader2 } from 'lucide-vue-next';

const props = defineProps({
  groupId: {
    type: [String, Number],
    required: true,
  },
});

const notificationStore = useNotificationStore();
const requests = ref([]);
const isLoading = ref(true);

const loadRequests = async () => {
  isLoading.value = true;
  try {
    requests.value = await fetchGroupJoinRequests(props.groupId);
  } catch (error) {
    console.error('Failed to fetch join requests:', error);
    notificationStore.showNotification('가입 요청 목록을 불러오는데 실패했습니다.', 'error');
  } finally {
    isLoading.value = false;
  }
};

const handleRequest = async (userId, action) => {
  const isApproving = action === 'approve';
  const actionText = isApproving ? '승인' : '거절';

  try {
    if (isApproving) {
      await approveJoinRequest(props.groupId, userId);
    } else {
      await rejectJoinRequest(props.groupId, userId);
    }
    notificationStore.showNotification(`사용자 요청을 ${actionText}했습니다.`, 'success');
    // Refresh the list
    requests.value = requests.value.filter(req => req.userId !== userId);
  } catch (error) {
    console.error(`Failed to ${action} join request:`, error);
    notificationStore.showNotification(`요청 ${actionText} 처리에 실패했습니다.`, 'error');
  }
};

onMounted(loadRequests);
</script>
