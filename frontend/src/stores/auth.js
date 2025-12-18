import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import router from '../router'; // Assuming router is accessible
import { useNotificationStore } from './notification'; // Import notification store

export const useAuthStore = defineStore('auth', () => {
  const notificationStore = useNotificationStore(); // Get instance of notification store

  // State
  const accessToken = ref(localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || null);
  const refreshToken = ref(localStorage.getItem('refreshToken') || null);
  const userId = ref(localStorage.getItem('userId') || sessionStorage.getItem('userId') || null);
  const userName = ref(localStorage.getItem('name') || sessionStorage.getItem('name') || null);
  const isTempPasswordLogin = ref(sessionStorage.getItem('isTempPasswordLogin') === 'true');
  const isReauthenticated = ref(sessionStorage.getItem('isReauthenticated') === 'true');
  const firstStepCompleted = ref(sessionStorage.getItem('firstStepCompleted') === 'true');

  // Getters
  const isLoggedIn = computed(() => !!accessToken.value);

  // Actions
  const setTokens = (access, refresh, rememberMe = false) => {
    accessToken.value = access;
    refreshToken.value = refresh;
    if (rememberMe) {
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
    } else {
      sessionStorage.setItem('accessToken', access);
      localStorage.removeItem('accessToken'); // Ensure only one is set
      localStorage.removeItem('refreshToken');
    }
  };

  const setUserInfo = (id, name, rememberMe = false) => {
    userId.value = id;
    userName.value = name;
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('userId', id);
    storage.setItem('name', name);
  };

  const clearAuth = () => {
    accessToken.value = null;
    refreshToken.value = null;
    userId.value = null;
    userName.value = null;
    isTempPasswordLogin.value = false;
    isReauthenticated.value = false;
    firstStepCompleted.value = false;

    localStorage.clear();
    sessionStorage.clear();
  };

  const setTempPasswordLogin = (value) => {
    isTempPasswordLogin.value = value;
    if (value) {
      sessionStorage.setItem('isTempPasswordLogin', 'true');
    } else {
      sessionStorage.removeItem('isTempPasswordLogin');
    }
  };

  const setReauthenticated = (value) => {
    isReauthenticated.value = value;
    if (value) {
      sessionStorage.setItem('isReauthenticated', 'true');
    } else {
      sessionStorage.removeItem('isReauthenticated');
    }
  };

  const setFirstStepCompleted = (value) => {
    firstStepCompleted.value = value;
    if (value) {
      sessionStorage.setItem('firstStepCompleted', 'true');
    } else {
      sessionStorage.removeItem('firstStepCompleted');
    }
  };

  const logout = () => {
    clearAuth();
    sessionStorage.setItem('show_logout_notification', 'true');
    router.push('/login');
  };

  return {
    accessToken,
    refreshToken,
    userId,
    userName,
    isTempPasswordLogin,
    isReauthenticated,
    firstStepCompleted,
    isLoggedIn,
    setTokens,
    setUserInfo,
    clearAuth,
    setTempPasswordLogin,
    setReauthenticated,
    setFirstStepCompleted,
    logout,
  };
});
