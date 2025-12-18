<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="transform opacity-0 translate-y-full"
    enter-to-class="transform opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="transform opacity-100 translate-y-0"
    leave-to-class="transform opacity-0 translate-y-full"
  >
    <div
      v-if="notificationStore.isVisible"
      :class="notificationClasses"
      class="fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center space-x-3 z-50 max-w-sm w-full"
      role="alert"
    >
      <component :is="iconComponent" class="w-6 h-6 flex-shrink-0" />
      <p class="text-sm font-medium flex-grow">{{ notificationStore.message }}</p>
      <button @click="notificationStore.hideNotification()" class="p-1 rounded-full hover:bg-opacity-20 transition-colors">
        <X class="w-4 h-4" />
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';
import { useNotificationStore } from '../../stores/notification';
import { Info, CheckCircle, XCircle, AlertTriangle, X } from 'lucide-vue-next';

const notificationStore = useNotificationStore();

const notificationClasses = computed(() => {
  let baseClasses = [];
  let textClasses = [];
  let iconClasses = [];
  let buttonClasses = [];

  switch (notificationStore.type) {
    case 'success':
      baseClasses = ['bg-green-500'];
      textClasses = ['text-white'];
      iconClasses = ['text-white'];
      buttonClasses = ['text-white', 'hover:bg-green-600'];
      break;
    case 'error':
      baseClasses = ['bg-red-500'];
      textClasses = ['text-white'];
      iconClasses = ['text-white'];
      buttonClasses = ['text-white', 'hover:bg-red-600'];
      break;
    case 'warning':
      baseClasses = ['bg-yellow-500'];
      textClasses = ['text-white'];
      iconClasses = ['text-white'];
      buttonClasses = ['text-white', 'hover:bg-yellow-600'];
      break;
    case 'info':
    default:
      baseClasses = ['bg-blue-500'];
      textClasses = ['text-white'];
      iconClasses = ['text-white'];
      buttonClasses = ['text-white', 'hover:bg-blue-600'];
      break;
  }
  return [...baseClasses, ...textClasses, ...iconClasses, ...buttonClasses].join(' ');
});

const iconComponent = computed(() => {
  switch (notificationStore.type) {
    case 'success': return CheckCircle;
    case 'error': return XCircle;
    case 'warning': return AlertTriangle;
    case 'info':
    default: return Info;
  }
});
</script>

<style scoped>
/* No specific styles needed as Tailwind CSS handles most of it */
</style>
