<template>
  <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md border border-gray-200/80 p-6">
    <div v-if="loading" class="text-center">
      <Loader2 class="w-8 h-8 animate-spin inline-block text-orange-500" />
      <p class="mt-2 text-gray-600">그룹 정보를 불러오는 중...</p>
    </div>
    <div v-else-if="error" class="text-center text-red-500">
      <p>{{ error }}</p>
    </div>
    <div v-else-if="group">
      <!-- Management Tabs -->
      <div class="mb-6 border-b border-gray-200">
        <nav class="-mb-px flex space-x-6" aria-label="Tabs">
          <button v-for="tab in managementTabs" :key="tab.id" @click="activeManagementTab = tab.id"
            :class="[
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              activeManagementTab === tab.id
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]">
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div>
        <div v-if="activeManagementTab === 'settings'">
          <GroupSettingsForm :group="group" @update-group="handleGroupUpdate" />
        </div>
        <div v-if="activeManagementTab === 'members'">
          <MemberManagement :group-id="groupId" />
        </div>
        <div v-if="activeManagementTab === 'requests' && !group.isPublic">
          <JoinRequestManager :group-id="groupId" />
        </div>
        <div v-if="activeManagementTab === 'delegate'">
          <LeaderDelegation :group-id="groupId" />
        </div>
        <div v-if="activeManagementTab === 'delete'">
          <GroupDeletion :group-id="groupId" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { fetchGroupById, updateGroup } from '@/api';
import { useNotificationStore } from '@/stores/notification';
import GroupSettingsForm from './GroupSettingsForm.vue';
import MemberManagement from './MemberManagement.vue';
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
const activeManagementTab = ref('settings');

const managementTabs = computed(() => {
  const tabs = [
    { id: 'settings', name: '그룹 설정' },
    { id: 'members', name: '멤버 관리' },
  ];
  if (group.value && !group.value.isPublic) {
    tabs.push({ id: 'requests', name: '가입 요청' });
  }
  tabs.push({ id: 'delegate', name: '그룹장 위임' });
  tabs.push({ id: 'delete', name: '그룹 삭제' });
  return tabs;
});


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
