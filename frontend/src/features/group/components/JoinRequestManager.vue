<template>
  <div class="space-y-6">
    <h3 class="text-xl font-bold text-gray-800">가입 요청 관리</h3>
    <div v-if="loading" class="text-center">
      <p>요청 목록을 불러오는 중...</p>
    </div>
    <div v-else-if="requests.length === 0" class="text-center text-gray-500 py-8">
      <p>대기 중인 가입 요청이 없습니다.</p>
    </div>
    <div v-else class="space-y-4">
      <div v-for="request in requests" :key="request.userId" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p class="font-semibold text-gray-800">{{ request.nickname }}</p>
          <p class="text-sm text-gray-500">{{ new Date(request.requestedAt).toLocaleString() }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="handleApprove(request.userId)" class="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600">승인</button>
          <button @click="handleReject(request.userId)" class="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">거절</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchGroupJoinRequests, approveJoinRequest, rejectJoinRequest } from '@/api';
import { useNotificationStore } from '@/stores/notification';

const props = defineProps({
  groupId: {
    type: [String, Number],
    required: true,
  },
});

const requests = ref([]);
const loading = ref(true);
const notificationStore = useNotificationStore();

const loadRequests = async () => {
  loading.value = true;
  try {
    requests.value = await fetchGroupJoinRequests(props.groupId);
  } catch (error) {
    console.error('Failed to fetch join requests:', error);
    notificationStore.showNotification('가입 요청 목록을 불러오는데 실패했습니다.', 'error');
  } finally {
    loading.value = false;
  }
};

const handleApprove = async (userId) => {
  try {
    await approveJoinRequest(props.groupId, userId);
    notificationStore.showNotification('가입 요청을 승인했습니다.', 'success');
    requests.value = requests.value.filter(req => req.userId !== userId);
  } catch (error) {
    console.error('Failed to approve join request:', error);
    notificationStore.showNotification('가입 요청 승인에 실패했습니다.', 'error');
  }
};

const handleReject = async (userId) => {
  try {
    await rejectJoinRequest(props.groupId, userId);
    notificationStore.showNotification('가입 요청을 거절했습니다.', 'info');
    requests.value = requests.value.filter(req => req.userId !== userId);
  } catch (error) {
    console.error('Failed to reject join request:', error);
    notificationStore.showNotification('가입 요청 거절에 실패했습니다.', 'error');
  }
};

onMounted(loadRequests);
</script>