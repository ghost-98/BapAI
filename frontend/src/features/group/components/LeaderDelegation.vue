<template>
  <div class="space-y-6">
    <h3 class="text-xl font-bold text-gray-800">그룹장 위임</h3>
    <div v-if="loading" class="text-center">
      <p>멤버 목록을 불러오는 중...</p>
    </div>
    <div v-else>
      <p class="text-sm text-gray-600 mb-4">그룹장을 위임할 멤버를 선택해주세요. 이 작업은 되돌릴 수 없습니다.</p>
      <div class="space-y-2">
        <select v-model="selectedMemberId" class="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800">
          <option disabled value="">멤버를 선택하세요</option>
          <option v-for="member in members" :key="member.userId" :value="member.userId">
            {{ member.nickname }}
          </option>
        </select>
      </div>
      <div class="mt-6 text-right">
        <button @click="handleDelegate" :disabled="!selectedMemberId" class="px-6 py-2 bg-yellow-500 text-white rounded-xl font-medium shadow-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
          그룹장 위임
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchGroupMembers, delegateGroupLeader } from '@/api';
import { useNotificationStore } from '@/stores/notification';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const props = defineProps({
  groupId: {
    type: [String, Number],
    required: true,
  },
});

const members = ref([]);
const loading = ref(true);
const selectedMemberId = ref('');
const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const router = useRouter();

const loadMembers = async () => {
  loading.value = true;
  try {
    const allMembers = await fetchGroupMembers(props.groupId);
    members.value = allMembers.filter(member => member.role !== 'LEADER');
  } catch (error) {
    console.error('Failed to fetch group members:', error);
    notificationStore.showNotification('멤버 목록을 불러오는데 실패했습니다.', 'error');
  } finally {
    loading.value = false;
  }
};

const handleDelegate = async () => {
  if (!selectedMemberId.value) {
    notificationStore.showNotification('위임할 멤버를 선택해주세요.', 'warn');
    return;
  }
  if (confirm('정말로 그룹장을 위임하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
    try {
      await delegateGroupLeader(props.groupId, selectedMemberId.value);
      notificationStore.showNotification('그룹장이 성공적으로 위임되었습니다. 그룹 목록 페이지로 이동합니다.', 'success');
      // After delegation, the current user is no longer the leader.
      // Redirect to the group list page.
      router.push({ name: 'GroupList' });
    } catch (error) {
      console.error('Failed to delegate leader:', error);
      notificationStore.showNotification('그룹장 위임에 실패했습니다.', 'error');
    }
  }
};

onMounted(loadMembers);
</script>