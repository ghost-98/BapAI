<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Organic blob shapes -->
    <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-orange-300/30 to-rose-300/30 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-amber-300/30 to-orange-300/30 rounded-full blur-3xl"></div>
    
    <div class="w-full max-w-lg relative z-10">
      <div class="bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50">
        <div class="space-y-6">
          <div class="text-center space-y-2">
            <h2 class="text-3xl font-bold text-gray-900">아이디 찾기</h2>
            <p class="text-gray-600">가입 시 사용한 이메일로 아이디를 찾아드립니다.</p>
          </div>

          <div v-if="foundUsername" class="mt-6 p-6 bg-orange-50/50 rounded-2xl text-center border border-orange-200">
            <p class="text-lg font-semibold text-gray-800 mb-2">회원님의 아이디는 <br/><span class="text-orange-600 text-2xl font-bold">{{ foundUsername }}</span> 입니다.</p>
            <router-link to="/login" class="w-full inline-block mt-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold hover:from-orange-600 hover:to-rose-600 transition-all transform hover:scale-[1.02] shadow-lg">
              로그인하기
            </router-link>
          </div>

          <form v-else @submit.prevent="handleFindUsername" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">이메일</label>
              <div class="relative">
                <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  v-model="email"
                  id="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  :disabled="emailVerificationSent"
                  class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 disabled:bg-gray-100"
                />
              </div>
            </div>

            <button
              @click="handleEmailVerification"
              type="button"
              :disabled="!email || emailVerificationSent"
              class="w-full py-3 rounded-xl bg-gray-600 text-white font-semibold hover:bg-gray-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {{ emailVerificationSent ? '인증 메일이 발송되었습니다' : '인증 메일 발송' }}
            </button>

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
              아이디 찾기
            </button>
          </form>

          <div class="text-center" v-if="!foundUsername">
            <router-link to="/login" class="text-sm text-gray-600 hover:text-orange-600 transition">로그인 페이지로 돌아가기</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Mail, KeyRound } from 'lucide-vue-next';
import apiClient from '../../../api';
import { useNotificationStore } from '../../../stores/notification';

const router = useRouter();
const notificationStore = useNotificationStore();
const email = ref('');
const verificationCode = ref('');
const emailVerificationSent = ref(false);
const foundUsername = ref('');

const handleEmailVerification = async () => {
  if (!email.value) {
    notificationStore.showNotification('이메일을 입력해주세요.', 'warning');
    return;
  }
  try {
    await apiClient.post('/auth/email/send', { email: email.value });
    notificationStore.showNotification('인증 메일이 발송되었습니다. 이메일을 확인해주세요.', 'success');
    emailVerificationSent.value = true;
  } catch (error) {
    console.error('이메일 인증 요청 실패:', error.response ? error.response.data : error.message);
    notificationStore.showNotification(error.response?.data?.message || '이메일 인증 요청에 실패했습니다.', 'error');
  }
};

const handleFindUsername = async () => {
  if (!verificationCode.value) {
    notificationStore.showNotification('인증코드를 입력해주세요.', 'warning');
    return;
  }
  try {
    const response = await apiClient.post('/auth/find-username', {
      email: email.value,
      code: verificationCode.value
    });
    foundUsername.value = response.data.username;
    notificationStore.showNotification('아이디를 성공적으로 찾았습니다.', 'success');
  } catch (error) {
    console.error('아이디 찾기 실패:', error.response ? error.response.data : error.message);
    notificationStore.showNotification(error.response?.data?.message || '아이디 찾기에 실패했습니다.', 'error');
  }
};

const goBack = () => {
  router.back();
};
</script>
