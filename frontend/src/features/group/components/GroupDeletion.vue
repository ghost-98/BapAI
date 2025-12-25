<template>
  <div class="space-y-6">
    <h3 class="text-xl font-bold text-red-600">그룹 삭제</h3>
    <p class="text-sm text-gray-600">
      그룹을 삭제하면 모든 그룹 데이터와 게시물이 영구적으로 사라집니다. 이 작업은 되돌릴 수 없으니 신중하게 결정해주세요.
    </p>
    <div class="text-right">
      <button @click="handleDelete" class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-md transition-colors">
        그룹 삭제
      </button>
    </div>
  </div>
</template>

<script setup>
import { deleteGroup } from '@/api';
import { useNotificationStore } from '@/stores/notification';
import { useRouter } from 'vue-router';

const props = defineProps({
  groupId: {
    type: [String, Number],
    required: true,
  },
});

const notificationStore = useNotificationStore();
const router = useRouter();

const handleDelete = async () => {
  if (confirm('정말로 그룹을 삭제하시겠습니까? 모든 관련 데이터가 영구적으로 삭제됩니다.')) {
    try {
      await deleteGroup(props.groupId);
      notificationStore.showNotification('그룹이 성공적으로 삭제되었습니다.', 'success');
      router.push({ name: 'GroupList' });
    } catch (error) {
      console.error('Failed to delete group:', error);
      notificationStore.showNotification('그룹 삭제에 실패했습니다.', 'error');
    }
  }
};
</script>