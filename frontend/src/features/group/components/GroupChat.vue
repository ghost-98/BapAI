<template>
  <div class="flex flex-col h-[600px] bg-white/80 backdrop-blur-xl rounded-2xl shadow-md border border-gray-200/80 p-6">
    <!-- Chat Header -->
    <div class="flex items-center justify-between pb-4 border-b border-gray-200">
      <h3 class="text-xl font-bold text-gray-800">그룹 채팅</h3>
      <span class="text-sm text-gray-500">온라인: {{ onlineUsers.length }}명</span>
    </div>

    <!-- Chat Messages Area -->
    <div ref="chatMessagesContainer" class="flex-1 overflow-y-auto py-4 space-y-4">
      <div v-for="message in messages" :key="message.id"
           :class="['flex', message.senderId === currentUserId ? 'justify-end' : 'justify-start']">
        <div :class="['flex items-end gap-2', message.senderId === currentUserId ? 'flex-row-reverse' : 'flex-row']">
          <!-- Avatar (only for others' messages) -->
          <img v-if="message.senderId !== currentUserId" :src="message.senderAvatar || 'https://i.pravatar.cc/150?img=3'"
               alt="Avatar" class="w-8 h-8 rounded-full object-cover">
          
          <div :class="['flex flex-col', message.senderId === currentUserId ? 'items-end' : 'items-start']">
            <span v-if="message.senderId !== currentUserId" class="text-xs text-gray-500 mb-1">{{ message.senderNickname }}</span>
            <div class="flex items-end gap-1">
              <span v-if="message.senderId === currentUserId" class="text-xs text-gray-500">{{ formatTime(message.timestamp) }}</span>
              <div :class="['p-3 rounded-xl max-w-xs relative',
                           message.senderId === currentUserId ? 'bg-orange-500 text-white message-bubble-sent' : 'bg-gray-200 text-gray-800 message-bubble-received']">
                {{ message.content }}
              </div>
              <span v-if="message.senderId !== currentUserId" class="text-xs text-gray-500">{{ formatTime(message.timestamp) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Input -->
    <div class="pt-4 border-t border-gray-200 flex items-center gap-3">
      <input v-model="newMessage" @keyup.enter="sendMessage" type="text"
             placeholder="메시지를 입력하세요..."
             class="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ease-in-out">
      <button @click="sendMessage"
              class="px-6 py-2 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors duration-200 ease-in-out shadow-md">
        전송
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { fetchChatHistory, fetchOnlineUsers } from '@/api'; // Assuming these are REST APIs
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const props = defineProps({
  groupId: {
    type: [String, Number],
    required: true,
  },
});

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const currentUserId = computed(() => authStore.userId);
const currentUserNickname = ref(authStore.userName);

const messages = ref([]);
const onlineUsers = ref([]);
const newMessage = ref('');
const chatMessagesContainer = ref(null);

let stompClient = null;
let reconnectInterval = null;

const connectStomp = () => {
  const socket = new SockJS(`${import.meta.env.VITE_API_BASE_URL}/ws`); // Adjust WebSocket endpoint if needed
  stompClient = Stomp.over(socket);
  stompClient.debug = null; // Disable STOMP debug logs

  stompClient.connect({
    Authorization: `Bearer ${authStore.accessToken}`,
    groupId: String(props.groupId),
    userId: String(authStore.userId)
  }, frame => {
    notificationStore.showNotification('채팅 서버에 연결되었습니다.', 'success');
    
    // Subscribe to public chat topic
    stompClient.subscribe(`/sub/chat/room/${props.groupId}`, message => {
      try {
        const receivedMessage = JSON.parse(message.body);
        messages.value.push(receivedMessage);
        scrollToBottom();
      } catch (e) {
        console.error('Error parsing received message:', e, message.body);
      }
    });

    // Subscribe to online users topic (if backend provides one)
    // Example: /topic/chat/{groupId}/online-users
    // stompClient.subscribe(`/topic/chat/${props.groupId}/online-users`, userListMessage => {
    //   onlineUsers.value = JSON.parse(userListMessage.body);
    // });

    // Clear any reconnect attempts
    if (reconnectInterval) {
      clearInterval(reconnectInterval);
      reconnectInterval = null;
    }

  }, error => {
    console.error('STOMP connection error:', error);
    console.log('STOMP client connected status after error:', stompClient?.connected);
    notificationStore.showNotification('채팅 서버 연결에 실패했습니다. 재연결 시도 중...', 'error');
    // Attempt to reconnect
    if (!reconnectInterval) {
      reconnectInterval = setInterval(() => {
        if (!stompClient.connected) {
          console.log('Attempting to reconnect to STOMP...');
          connectStomp();
        }
      }, 5000); // Reconnect every 5 seconds
    }
  });
};

const disconnectStomp = () => {
  if (stompClient && stompClient.connected) {
    stompClient.disconnect(() => {
      console.log('Disconnected from STOMP');
      notificationStore.showNotification('채팅 서버에서 연결 해제되었습니다.', 'info');
    });
  }
  if (reconnectInterval) {
    clearInterval(reconnectInterval);
    reconnectInterval = null;
  }
};

const loadChatHistory = async () => {
  try {
    const history = await fetchChatHistory(props.groupId);
    messages.value = history;
    scrollToBottom();
  } catch (error) {
    console.error('Failed to load chat history:', error);
    notificationStore.showNotification('채팅 기록을 불러오는데 실패했습니다.', 'error');
  }
};

const loadOnlineUsers = async () => {
  try {
    const users = await fetchOnlineUsers(props.groupId);
    onlineUsers.value = users;
  } catch (error) {
    console.error('Failed to load online users:', error);
    // notificationStore.showNotification('온라인 사용자 목록을 불러오는데 실패했습니다.', 'error');
  }
};

const sendMessage = () => {
  console.log('Attempting to send message. STOMP connected status:', stompClient?.connected);
  console.log('Current user ID:', currentUserId.value);
  console.log('Current user Nickname:', currentUserNickname.value);
  console.log('New message content:', newMessage.value.trim());

  if (stompClient && stompClient.connected && newMessage.value.trim()) {
    console.log('STOMP client is connected and message is valid. Attempting to send...');
    console.log('stompClient object:', stompClient);
    console.log('stompClient.ws.readyState:', stompClient.ws.readyState);
    const chatMessage = {
      groupId: props.groupId,
      senderId: currentUserId.value,
      senderNickname: currentUserNickname.value,
      content: newMessage.value.trim(),
      timestamp: new Date().toISOString(),
    };
    stompClient.send(`/app/chat/message`, {}, JSON.stringify(chatMessage)); // Backend @MessageMapping
    newMessage.value = '';
  } else if (!stompClient || !stompClient.connected) {
    notificationStore.showNotification('채팅 서버에 연결되지 않았습니다.', 'error');
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessagesContainer.value) {
      chatMessagesContainer.value.scrollTop = chatMessagesContainer.value.scrollHeight;
    }
  });
};

const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  loadChatHistory();
  loadOnlineUsers(); // Initial load
  connectStomp();
  // Optionally, poll online users if not handled by WebSocket subscription
  // setInterval(loadOnlineUsers, 10000); 
});

onUnmounted(() => {
  disconnectStomp();
});

// Watch for groupId changes to re-connect/re-load
watch(() => props.groupId, (newGroupId, oldGroupId) => {
  if (newGroupId !== oldGroupId) {
    disconnectStomp();
    messages.value = []; // Clear messages for new group
    onlineUsers.value = []; // Clear online users for new group
    loadChatHistory();
    loadOnlineUsers();
    connectStomp();
  }
});
</script>

<style scoped>
/* Custom scrollbar for chat messages container */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* Message bubble tails */
.message-bubble-sent {
  border-bottom-right-radius: 4px; /* Adjust to blend with tail */
}

.message-bubble-sent::after {
  content: '';
  position: absolute;
  right: -8px; /* Position the tail */
  bottom: 0px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-top: 8px solid #f97316; /* Tailwind orange-500 */
  filter: drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.05)); /* Optional subtle shadow */
}

.message-bubble-received {
  border-bottom-left-radius: 4px; /* Adjust to blend with tail */
}

.message-bubble-received::after {
  content: '';
  position: absolute;
  left: -8px; /* Position the tail */
  bottom: 0px;
  width: 0;
  height: 0;
  border-right: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-top: 8px solid #e5e7eb; /* Tailwind gray-200 */
  filter: drop-shadow(-1px 1px 0px rgba(0, 0, 0, 0.05)); /* Optional subtle shadow */
}
</style>