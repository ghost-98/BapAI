<template>
  <div class="space-y-10">
    <div v-if="loading" class="text-center">
      <Loader2 class="w-8 h-8 animate-spin inline-block text-orange-500" />
      <p class="mt-2 text-gray-600">그룹 정보를 불러오는 중...</p>
    </div>
    <div v-else-if="error" class="text-center text-red-500">
      <p>{{ error }}</p>
    </div>
    <div v-else-if="group">
      <!-- Group Settings Form -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md border border-gray-200/80 p-6">
        <GroupSettingsForm :group="group" @update-group="handleGroupUpdate" />
      </div>
      
      <!-- Join Request Manager (for private groups) -->
      <div v-if="!group.isPublic" class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md border border-gray-200/80 p-6">
        <JoinRequestManager :group-id="groupId" />
      </div>

      <!-- Leader Delegation -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md border border-gray-200/80 p-6">
        <LeaderDelegation :group-id="groupId" />
      </div>

      <!-- Group Deletion -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md border border-gray-200/80 p-6">
        <GroupDeletion :group-id="groupId" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchGroupById, updateGroup } from '@/api';
import { useNotificationStore } from '@/stores/notification';
import GroupSettingsForm from './GroupSettingsForm.vue';
import JoinRequestManager from './JoinRequestManager.vue';
import LeaderDelegation from './LeaderDelegation.vue';
import GroupDeletion from './GroupDeletion.vue';
import { Loader2 } from 'lucide-vue-next';

const props = defineProps({
  groupId: {
    type: [String, Number],
    required: true,
  },
});

const emit = defineEmits(['group-updated']);

const group = ref(null);
const loading = ref(true);
const error = ref(null);
const notificationStore = useNotificationStore();

const fetchGroupData = async () => {
  loading.value = true;
  error.value = null;
  try {
    group.value = await fetchGroupById(props.groupId);
  } catch (err) {
    console.error('Failed to fetch group data for management:', err);
    error.value = '그룹 정보를 가져오는 데 실패했습니다.';
  } finally {
    loading.value = false;
  }
};

const handleGroupUpdate = async (updatedGroupData) => {
  try {
    await updateGroup(props.groupId, updatedGroupData);
    notificationStore.showNotification('그룹 정보가 성공적으로 업데이트되었습니다.', 'success');
    await fetchGroupData(); // Re-fetch data to reflect changes
    emit('group-updated'); // Notify parent component
  } catch (err) {
    console.error('Failed to update group:', err);
    notificationStore.showNotification('그룹 정보 업데이트에 실패했습니다.', 'error');
  }
};

onMounted(fetchGroupData);
</script>
