<template>
  <div class="space-y-6">
    <h3 class="text-xl font-bold text-gray-800">멤버 관리</h3>
    <div v-if="loading" class="text-center">
      <p>멤버 목록을 불러오는 중...</p>
    </div>
    <div v-else-if="members.length === 0" class="text-center text-gray-500 py-8">
      <p>관리할 멤버가 없습니다.</p>
    </div>
    <div v-else class="space-y-4">
      <div v-for="member in members" :key="member.userId" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p class="font-semibold text-gray-800">
            {{ member.nickname }}
            <span v-if="member.role === 'LEADER'" class="text-xs text-orange-500 font-semibold ml-2">그룹장</span>
          </p>
        </div>
        <div>
          <button
            @click="handleKick(member.userId, member.nickname)"
            :disabled="member.role === 'LEADER'"
            :class="[
              'px-4 py-2 text-sm text-white rounded-lg',
              member.role === 'LEADER' ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
            ]"
          >
            강퇴
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchGroupMembers, kickGroupMember } from '@/api';
import { useNotificationStore } from '@/stores/notification';
import { useAuthStore } from '@/stores/auth';

const props = defineProps({
  groupId: {
    type: [String, Number],
    required: true,
  },
});

const members = ref([]);
const loading = ref(true);
const notificationStore = useNotificationStore();

const loadMembers = async () => {
  loading.value = true;
  try {
    const allMembers = await fetchGroupMembers(props.groupId);
    members.value = allMembers;
  } catch (error) {
    console.error('Failed to fetch group members:', error);
    notificationStore.showNotification('멤버 목록을 불러오는데 실패했습니다.', 'error');
  } finally {
    loading.value = false;
  }
};

const handleKick = async (userId, nickname) => {
  if (confirm(`정말로 '${nickname}'님을 그룹에서 강퇴하시겠습니까?`)) {
    try {
      await kickGroupMember(props.groupId, userId);
      notificationStore.showNotification(`'${nickname}'님을 강퇴했습니다.`, 'success');
      // Refresh the member list
      await loadMembers();
    } catch (error) {
      console.error('Failed to kick member:', error);
      notificationStore.showNotification('멤버 강퇴에 실패했습니다.', 'error');
    }
  }
};

onMounted(loadMembers);
</script>
