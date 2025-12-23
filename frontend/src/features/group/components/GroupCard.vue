<template>
  <div @click="emitViewDetails" 
    :class="['group-card-outer', 'bg-gradient-to-br', group.type && group.type.toUpperCase() === 'PUBLIC' ? 'from-orange-200 to-red-200' : 'from-gray-400 to-gray-500']">
    <div class="group-card-inner flex flex-col justify-between h-full">
      <!-- Card Content -->
      <div class="flex-grow">
        <!-- Header: Title & Member Count -->
        <div class="border-b border-gray-300 pb-3 mb-3">
          <div class="flex items-start justify-between">
            <h3 :class="['text-2xl font-bold flex items-center gap-2 pr-2', group.type === 'PUBLIC' ? 'text-orange-700' : 'text-gray-800']">
              <Lock v-if="group.type === 'PRIVATE'" class="w-6 h-6 text-gray-700 flex-shrink-0" />
              <span class="truncate">{{ group.name }}</span>
            </h3>
            <div class="flex items-center gap-2 text-sm text-gray-600 flex-shrink-0">
              <Users class="w-4 h-4" />
              <span class="font-medium">{{ group.memberCount }} / {{ group.maxMember }}</span>
            </div>
          </div>
        </div>

        <!-- Description -->
        <p class="text-gray-600 italic text-sm line-clamp-3 mb-4">{{ group.description }}</p>
        
        <!-- Tags -->
        <div class="flex flex-wrap gap-2" v-if="group.tags && group.tags.length">
          <span v-for="tag in group.tags" :key="tag" class="px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-medium">
            #{{ tag }}
          </span>
        </div>
      </div>
      
      <!-- Footer: Action Button/Badge -->
      <div class="flex items-center justify-center pt-4 border-t border-gray-200/80 mt-auto">
        <span v-if="group.isOwner" class="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
          <Crown class="w-4 h-4" />
          방장
        </span>
        <span v-else-if="group.isJoined" class="text-green-600 font-semibold">참여중</span>
        <template v-else-if="!isMyGroupsView">
          <button 
            v-if="group.memberCount >= group.maxMember" 
            class="px-4 py-1.5 bg-gray-300 text-gray-600 rounded-full text-xs font-semibold cursor-not-allowed" 
            disabled
          >
            모집 마감
          </button>
          <button v-else @click.stop="emitJoin" class="px-4 py-1.5 bg-orange-500 text-white rounded-full text-xs font-semibold hover:bg-orange-600 transition-all">
            참여하기
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Users, Lock, Crown } from 'lucide-vue-next';

const props = defineProps({
  group: {
    type: Object,
    required: true
  },
  isMyGroupsView: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['join', 'view-details']);

const emitJoin = () => {
  emit('join', props.group.groupId);
};

const emitViewDetails = () => {
  emit('view-details', props.group.groupId);
};
</script>

<style scoped>
.group-card-outer {
  @apply p-1 rounded-3xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1;
}
.group-card-inner {
  @apply h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50;
}
</style>
