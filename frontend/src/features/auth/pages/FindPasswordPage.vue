<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Organic blob shapes -->
    <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-orange-300/30 to-rose-300/30 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-amber-300/30 to-orange-300/30 rounded-full blur-3xl"></div>
    
    <div class="w-full max-w-lg relative z-10">
      <div class="bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50">
        <div class="space-y-6">
          <div class="text-center space-y-2">
            <h2 class="text-3xl font-bold text-gray-900">비밀번호 찾기</h2>
            <p class="text-gray-600">임시 비밀번호를 이메일로 발급해드립니다.</p>
          </div>

          <form @submit.prevent="handleCodeVerification" class="space-y-4">
            <div>
              <label for="username" class="block text-sm font-semibold text-gray-700 mb-2">아이디</label>
              <div class="relative">
                <User class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  v-model="username"
                  id="username"
                  type="text"
                  required
                  placeholder="가입 시 사용한 아이디"
                  :disabled="countdown > 0"
                  class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div>
              <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">이메일</label>
              <div class="flex gap-2">
                <div class="relative grow">
                  <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    v-model="email"
                    id="email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    :disabled="countdown > 0"
                    class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 disabled:bg-gray-100"
                  />
                </div>
                <button
                  @click="handleEmailVerification"
                  type="button"
                  :disabled="!username || !email || countdown > 0"
                  class="shrink-0 px-4 py-3 rounded-xl bg-gray-600 text-white font-semibold hover:bg-gray-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <span v-if="countdown > 0">({{ Math.floor(countdown / 60).toString().padStart(2, '0') }}:{{ (countdown % 60).toString().padStart(2, '0') }})</span>
                  <span v-else-if="emailVerificationSent">재전송</span>
                  <span v-else>인증</span>
                </button>
              </div>
            </div>

            <div v-if="emailVerificationSent" class="space-y-2 !mt-6">
              <label for="verificationCode" class="block text-sm font-semibold text-gray-700">인증코드</label>
              <div class="relative">
                <KeyRound class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  v-model="verificationCode"
                  id="verificationCode"
                  type="text"
                  required
                  placeholder="이메일로 받은 인증코드"
                  class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50"
                />
              </div>
            </div>
            
            <button
              v-if="emailVerificationSent"
              type="submit"
              class="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-lg hover:from-orange-600 hover:to-rose-600 transition-all transform hover:scale-[1.02] shadow-lg !mt-6"
            >
              임시 비밀번호 발급받기
            </button>
          </form>

          <div class="text-center">
            <router-link to="/login" class="text-sm text-gray-600 hover:text-orange-600 transition">로그인 페이지로 돌아가기</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { Mail, User, KeyRound } from 'lucide-vue-next';
import apiClient from '../../../api';
import { useNotificationStore } from '../../../stores/notification';

const router = useRouter();
const notificationStore = useNotificationStore();
const username = ref('');
const email = ref('');
const verificationCode = ref('');
const emailVerificationSent = ref(false);
const countdown = ref(0);
let timerIntervalId = null;

const startCountdown = () => {
  countdown.value = 300; // 5 minutes
  if (timerIntervalId) clearInterval(timerIntervalId);
  timerIntervalId = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(timerIntervalId);
      timerIntervalId = null;
      notificationStore.showNotification('인증 시간이 만료되었습니다. 다시 시도해주세요.', 'warning');
    }
  }, 1000);
};

onBeforeUnmount(() => {
  if (timerIntervalId) {
    clearInterval(timerIntervalId);
  }
});

const handleEmailVerification = async () => {
  if (!username.value || !email.value) {
    notificationStore.showNotification('아이디와 이메일을 모두 입력해주세요.', 'warning');
    return;
  }
  try {
    // API 요청 시 username도 함께 보냅니다.
    await apiClient.post('/auth/email/send', { 
      username: username.value, 
      email: email.value 
    });
    notificationStore.showNotification('인증 메일이 발송되었습니다. 이메일을 확인해주세요.', 'success');
    emailVerificationSent.value = true;
    startCountdown();
  } catch (error) {
    console.error('이메일 인증 요청 실패:', error.response ? error.response.data : error.message);
    notificationStore.showNotification(error.response?.data?.message || '이메일 인증 요청에 실패했습니다.', 'error');
  }
};

const handleCodeVerification = async () => {
  if (!verificationCode.value) {
    notificationStore.showNotification('인증코드를 입력해주세요.', 'warning');
    return;
  }
  if (!username.value || !email.value) {
    notificationStore.showNotification('아이디와 이메일을 먼저 입력하고 인증 메일을 발송해주세요.', 'warning');
    return;
  }
  try {
    await apiClient.post('/auth/reset-password', {
      username: username.value,
      email: email.value,
      code: verificationCode.value
    });
    notificationStore.showNotification('임시 비밀번호가 이메일로 발송되었습니다. 로그인 후 비밀번호를 변경해주세요.', 'success');
    clearInterval(timerIntervalId);
    timerIntervalId = null;
    countdown.value = 0;
    router.push('/login');
  } catch (error) {
    console.error('임시 비밀번호 발급 실패:', error.response ? error.response.data : error.message);
    notificationStore.showNotification(error.response?.data?.message || '임시 비밀번호 발급에 실패했습니다.', 'error');
  }
};

const goBack = () => {
  router.back();
};
</script>
