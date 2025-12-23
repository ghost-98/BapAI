<template>
  <div class="mt-8 pt-6 border-t border-gray-200">
    <h3 class="text-xl font-bold text-gray-800 mb-3">그룹장 위임</h3>
    <p class="text-gray-600 mb-4">
      그룹장을 다른 멤버에게 위임합니다. 위임하는 즉시 당신은 일반 멤버가 되며, 이 작업은 되돌릴 수 없습니다.
    </p>
    <div v-if="isLoading" class="flex items-center text-gray-500">
      <Loader2 class="w-5 h-5 animate-spin mr-2" />
      <span>멤버 목록을 불러오는 중...</span>
    </div>
    <div v-else-if="members.length > 1">
      <div class="flex items-center gap-4">
        <select v-model="selectedNewLeaderId" class="flex-grow w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800">
          <option disabled value="">새로운 그룹장을 선택하세요</option>
          <option v-for="member in otherMembers" :key="member.userId" :value="member.userId">
            {{ member.nickname }}
          </option>
        </select>
        <button @click="delegateLeader" :disabled="!selectedNewLeaderId" class="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all font-semibold shadow-lg shadow-orange-500/30 disabled:bg-gray-400 disabled:shadow-none">
          위임하기
        </button>
      </div>
    </div>
    <div v-else class="text-gray-500">
      위임할 다른 멤버가 없습니다.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notification';
import { useAuthStore } from '@/stores/auth';
import { fetchGroupMembers, delegateGroupLeader } from '@/api';
import { Loader2 } from 'lucide-vue-next';

const props = defineProps({
  groupId: {
    type: [String, Number],
    required: true,
  },
});

const router = useRouter();
const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const currentUserId = computed(() => authStore.user?.userId);

const members = ref([]);
const isLoading = ref(true);
const selectedNewLeaderId = ref('');

const otherMembers = computed(() => {
  return members.value.filter(member => member.userId !== currentUserId.value);
});

onMounted(async () => {
  try {
    members.value = await fetchGroupMembers(props.groupId);
  } catch (error) {
    console.error('Failed to fetch group members:', error);
    notificationStore.showNotification('멤버 목록을 불러오는데 실패했습니다.', 'error');
  } finally {
    isLoading.value = false;
  }
});

const delegateLeader = async () => {
  if (!selectedNewLeaderId.value) {
    notificationStore.showNotification('새로운 그룹장을 선택해주세요.', 'warning');
    return;
  }

  const newLeader = members.value.find(m => m.userId === selectedNewLeaderId.value);
  if (!newLeader) return;

  if (confirm(`정말로 그룹장을 '${newLeader.nickname}'님에게 위임하시겠습니까?`)) {
    try {
      await delegateGroupLeader(props.groupId, selectedNewLeaderId.value);
      notificationStore.showNotification('그룹장이 성공적으로 위임되었습니다.', 'success');
      // Refresh the page or navigate away, as the user is no longer the leader
      router.go(0); // This will reload the current page.
    } catch (error) {
      console.error('Failed to delegate leader:', error);
      notificationStore.showNotification(error.response?.data?.message || '그룹장 위임에 실패했습니다.', 'error');
    }
  }
};
</script>
