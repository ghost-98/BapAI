<template>
  <div class="mt-8 pt-6 border-t border-gray-200">
    <h3 class="text-xl font-bold text-red-600 mb-3">그룹 삭제</h3>
    <p class="text-gray-600 mb-4">
      그룹을 삭제하면 모든 그룹 데이터, 게시물, 멤버 정보가 영구적으로 사라집니다. 이 작업은 되돌릴 수 없습니다.
    </p>
    <button @click="confirmDelete" class="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold shadow-lg shadow-red-500/40">
      그룹 삭제하기
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notification';
import { deleteGroup as deleteGroupApi } from '@/api';

const props = defineProps({
  groupId: {
    type: [String, Number],
    required: true,
  },
});

const router = useRouter();
const notificationStore = useNotificationStore();

const confirmDelete = async () => {
  const groupName = prompt('그룹 삭제를 확인하려면 그룹 이름을 입력하세요.');
  if (groupName === null) return; // User cancelled

  // In a real app, you'd fetch the group name to compare.
  // For now, we'll just require some input.
  if (groupName.trim() === '') {
      notificationStore.showNotification('그룹 이름을 정확하게 입력해주세요.', 'warning');
      return;
  }

  if (confirm(`정말로 그룹을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
    try {
      await deleteGroupApi(props.groupId);
      notificationStore.showNotification('그룹이 성공적으로 삭제되었습니다.', 'success');
      router.push({ name: 'GroupList' });
    } catch (error) {
      console.error('Failed to delete group:', error);
      notificationStore.showNotification(error.response?.data?.message || '그룹 삭제에 실패했습니다.', 'error');
    }
  }
};
</script>
