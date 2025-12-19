<template>
  <main class="mx-auto max-w-7xl px-6 py-12">
    <!-- 페이지 헤더 -->
    <div class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50 mb-8">
      <div class="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between">
        <div class="mb-4 sm:mb-0">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight">그룹 탐색</h1>
          <p class="text-gray-600 text-lg md:text-xl">함께할 그룹을 찾거나, 새로운 그룹을 만들어보세요.</p>
        </div>
        <button @click="openCreateModal" class="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2">
          <PlusCircle class="w-5 h-5" />
          <span>새 그룹 만들기</span>
        </button>
      </div>
    </div>

    <!-- 검색 및 필터링 -->
    <div v-if="activeTab === 'all'" class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50 mb-8">
      <div class="flex gap-2 mb-4">
        <div class="relative flex-grow">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="그룹명 또는 태그로 검색..."
            class="w-full px-5 py-3 pl-12 pr-10 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500 text-gray-800 bg-gray-50"
            @keyup.enter="fetchAllGroups"
          />
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
            <X class="w-5 h-5" />
          </button>
        </div>
        <button @click="fetchAllGroups" class="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2">
          <span>검색</span>
        </button>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="tag in availableTags"
          :key="tag"
          @click="toggleTag(tag)"
          :class="[
            'px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border',
            selectedTags.includes(tag)
              ? 'bg-orange-500 text-white border-orange-500 shadow-md'
              : 'bg-gray-100 text-gray-700 border-gray-200 hover:border-orange-400 hover:text-orange-600'
          ]"
        >
          #{{ tag }}
        </button>
        <button
          v-if="selectedTags.length > 0"
          @click="clearSelectedTags"
          class="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border bg-red-100 text-red-700 border-red-200 hover:border-red-400 hover:text-red-600"
        >
          태그 초기화
        </button>
      </div>
    </div>

    <!-- 메인 콘텐츠 컨테이너 -->
    <div class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
      <!-- 탭 네비게이션 -->
      <div class="flex justify-start border-b border-gray-200/80 mb-6">
        <button 
          v-for="tab in tabs" 
          :key="tab.id" 
          @click="activeTab = tab.id"
          :class="[
            'px-4 py-2 text-sm font-medium transition-colors border-b-2',
            activeTab === tab.id ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
          ]"
        >
          {{ tab.name }}
        </button>
      </div>

      <!-- 그룹 목록 -->
      <div>
        <div v-if="activeTab === 'all'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="group in allGroups" :key="group.id" @click="goToGroupDetail(group.id)" class="group-card-outer">
            <div class="group-card-inner flex flex-col justify-between h-full">
              <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Users class="w-6 h-6 text-orange-500" />
                    {{ group.name }}
                  </h3>
                  <span :class="['px-3 py-1 text-xs font-semibold rounded-full', group.type === 'PUBLIC' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800']">
                    {{ group.type === 'PUBLIC' ? '공개' : '비공개' }}
                  </span>
                </div>
                <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ group.description }}</p>
                <div class="flex flex-wrap gap-2 mt-2" v-if="group.tags && group.tags.length">
                  <span v-for="tag in group.tags" :key="tag" class="px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-medium">
                    #{{ tag }}
                  </span>
                </div>
              </div>
              
              <div class="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200/80 mt-auto">
                <div class="flex items-center gap-2">
                  <Users class="w-4 h-4" />
                  <span>{{ group.memberCount }} / {{ group.maxMember }}명</span>
                </div>
                <button v-if="!group.isJoined" @click.stop="joinGroup(group.id)" class="px-4 py-1.5 bg-orange-500 text-white rounded-full text-xs font-semibold hover:bg-orange-600 transition-all">
                  참여하기
                </button>
                <span v-else class="text-green-600 font-semibold">참여중</span>
              </div>
            </div>
          </div>
          <p v-if="allGroups.length === 0" class="text-gray-500 text-center py-10 col-span-full">검색 결과가 없습니다.</p>
        </div>

        <div v-if="activeTab === 'my'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="group in myGroups" :key="group.id" @click="goToGroupDetail(group.id)" class="group-card-outer">
            <div class="group-card-inner flex flex-col justify-between h-full">
              <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Users class="w-6 h-6 text-orange-500" />
                    {{ group.name }}
                  </h3>
                </div>
                <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ group.description }}</p>
                <div class="flex flex-wrap gap-2 mt-2" v-if="group.tags && group.tags.length">
                  <span v-for="tag in group.tags" :key="tag" class="px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-medium">
                    #{{ tag }}
                  </span>
                </div>
              </div>
              
              <div class="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200/80 mt-auto">
                <div class="flex items-center gap-2">
                  <Users class="w-4 h-4" />
                  <span>{{ group.memberCount }} / {{ group.maxMember }}명</span>
                </div>
                <span class="text-green-600 font-semibold">참여중</span>
              </div>
            </div>
          </div>
        </div>
          <p v-if="myGroups.length === 0" class="text-gray-500 text-center py-10 col-span-full">가입한 그룹이 없습니다.</p>
      </div>
    </div>
  </main>

  <GroupCreateModal
    v-if="isCreateModalVisible"
    @close="closeCreateModal"
    @create="handleCreateGroup"
  />
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { PlusCircle, Users, Search, X } from 'lucide-vue-next'
import GroupCreateModal from '@/features/group/components/GroupCreateModal.vue'
import { fetchGroups, createGroupApi, joinGroupApi, fetchAvailableTags } from '@/api' // Import the new API function fetchAvailableTags
import { useNotificationStore } from '@/stores/notification' // Import notification store

const router = useRouter()
const activeTab = ref('all')
const isCreateModalVisible = ref(false)
const isLoadingCreate = ref(false) // Loading state for group creation
const isLoadingJoin = ref(false) // Loading state for joining a group

const searchQuery = ref('')
const selectedTags = ref([])
const allGroups = ref([]) // Will be populated by API
const myGroups = ref([]) // Will be populated by API or filtered from allGroups
const availableTags = ref([]) // Dynamically fetched tags

const notificationStore = useNotificationStore()

// Mock current user ID for demonstration. Replace with actual auth store user ID.
const currentUserId = 1; 

// Removed hardcoded availableTags

const tabs = [
  { id: 'all', name: '전체 그룹' },
  { id: 'my', name: '내 그룹' },
]

const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag);
  if (index > -1) {
    selectedTags.value.splice(index, 1);
  } else {
    selectedTags.value.push(tag);
  }
  fetchAllGroups(); // Fetch groups immediately after tag change
};

const clearSelectedTags = () => {
  selectedTags.value = [];
  fetchAllGroups(); // Fetch groups immediately after clearing tags
};

const fetchAllGroups = async () => {
  const keywordParts = [];
  if (searchQuery.value) {
    keywordParts.push(searchQuery.value);
  }
  if (selectedTags.value.length > 0) {
    selectedTags.value.forEach(tag => keywordParts.push(`${tag}`));
  }

  const keywordString = keywordParts.join(' ').trim(); // Join parts with space and trim any leading/trailing space

  console.log('Fetching all groups with params:', { keyword: keywordString });
  try {
    const params = {};
    if (keywordString) {
      params.keyword = keywordString;
    }
    
    const response = await fetchGroups(params);
    console.log('API response for all groups:', response);
    // Add isJoined property based on currentUserId
    allGroups.value = response.map(group => ({
      ...group,
      isJoined: group.memberIds && group.memberIds.includes(currentUserId)
    }));
  } catch (error) {
    console.error('Failed to fetch groups:', error);
    notificationStore.showNotification('그룹 목록을 불러오는데 실패했습니다.', 'error');
    allGroups.value = []; // Clear groups on error
  }
};

const fetchMyGroups = async () => {
  console.log('Fetching my groups...');
  try {
    // In a real application, this would be a separate API call
    // For now, we'll fetch all groups without search/tag filters and then filter by memberIds
    const response = await fetchGroups({}); // Fetch all groups without search/tag filters
    console.log('API response for my groups (unfiltered):', response);
    // Assuming a user ID of 1 for demonstration. Replace with actual user ID.
    myGroups.value = response.filter(group => group.memberIds && group.memberIds.includes(currentUserId));
    console.log('Filtered my groups:', myGroups.value);
  } catch (error) {
    console.error('Failed to fetch my groups:', error);
    notificationStore.showNotification('내가 가입한 그룹 목록을 불러오는데 실패했습니다.', 'error');
    myGroups.value = [];
  }
};

// Remove debounce for search input as it's now triggered by button/enter
// watch([searchQuery, selectedTags], () => {
//   clearTimeout(searchTimeout);
//   searchTimeout = setTimeout(() => {
//     if (activeTab.value === 'all') {
//       fetchAllGroups();
//     }
//   }, 300); // 300ms debounce
// });

// Watch for activeTab changes to refetch groups
watch(activeTab, (newTab) => {
  if (newTab === 'all') {
    fetchAllGroups();
  } else if (newTab === 'my') {
    fetchMyGroups();
  }
});

const openCreateModal = () => {
  isCreateModalVisible.value = true
}

const closeCreateModal = () => {
  isCreateModalVisible.value = false
}

const handleCreateGroup = async (newGroupData) => {
  isLoadingCreate.value = true;
  notificationStore.hideNotification(); // Clear previous notifications

  try {
    const createdGroup = await createGroupApi(newGroupData); // Call the API
    console.log('Group created successfully:', createdGroup);
    
    // Add the created group to allGroups and myGroups
    // Assuming the API returns the full group object including ID, memberCount, etc.
    allGroups.value.unshift({
      ...createdGroup,
      isJoined: true // The creator is joined by default
    });
    myGroups.value.unshift({
      ...createdGroup,
      isJoined: true
    });

    notificationStore.showNotification('새 그룹이 성공적으로 생성되었습니다!', 'success');
    closeCreateModal(); // Close the modal on success
    activeTab.value = 'my'; // Optionally, switch to 'my' tab
  } catch (error) {
    console.error('Failed to create group:', error);
    notificationStore.showNotification('그룹 생성에 실패했습니다. 다시 시도해주세요.', 'error');
  } finally {
    isLoadingCreate.value = false;
  }
}

const joinGroup = async (groupId) => {
  isLoadingJoin.value = true;
  notificationStore.hideNotification();

  try {
    await joinGroupApi(groupId); // API call to join the group
    notificationStore.showNotification('그룹에 성공적으로 참여했습니다!', 'success');
    
    // Update local data
    const groupIndex = allGroups.value.findIndex(g => g.id === groupId);
    if (groupIndex !== -1) {
      const joinedGroup = { ...allGroups.value[groupIndex], isJoined: true, memberCount: allGroups.value[groupIndex].memberCount + 1 };
      allGroups.value.splice(groupIndex, 1, joinedGroup);
      myGroups.value.unshift(joinedGroup); // Add to myGroups
    }
  } catch (error) {
    console.error('그룹 참여 실패:', error);
    notificationStore.showNotification('그룹 참여에 실패했습니다. 다시 시도해주세요.', 'error');
  } finally {
    isLoadingJoin.value = false;
  }
};

const goToGroupDetail = (groupId) => {
  router.push({ name: 'GroupDetail', params: { groupId } })
}

// Initial fetch when component mounts
onMounted(async () => {
  // Fetch available tags first
  try {
    availableTags.value = await fetchAvailableTags();
  } catch (error) {
    console.error('Failed to fetch available tags:', error);
    notificationStore.showNotification('태그 목록을 불러오는데 실패했습니다.', 'error');
  }

  await fetchAllGroups();
  await fetchMyGroups();
});
</script>

<style scoped>
.group-card-outer {
  @apply p-1 bg-gradient-to-br from-orange-200 to-rose-200 rounded-3xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1;
}
.group-card-inner {
  @apply h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50;
}
</style>
