<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Organic blob shapes -->
    <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-orange-300/30 to-rose-300/30 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-amber-300/30 to-orange-300/30 rounded-full blur-3xl"></div>
    
    <div class="w-full max-w-lg relative z-10">
      <div class="bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50">
        <div class="space-y-6">
          <div class="text-center space-y-2">
            <h2 class="text-3xl font-bold text-gray-900">회원가입</h2>
            <p class="text-gray-600">식단관리를 시작하고 건강한 삶을 만들어가세요!</p>
          </div>

          <form @submit.prevent="handleSignup" class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-semibold text-gray-700 mb-2">이름</label>
              <div class="relative">
                <User class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  v-model="name"
                  id="name"
                  type="text"
                  required
                  placeholder="홍길동"
                  class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50"
                />
              </div>
            </div>

            <div>
              <label for="username" class="block text-sm font-semibold text-gray-700 mb-2">아이디</label>
              <div class="relative">
                <User class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  v-model="username"
                  @blur="checkUsername"
                  id="username"
                  type="text"
                  required
                  placeholder="사용할 아이디"
                  class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50"
                />
              </div>
              <p v-if="usernameMessage" :class="['mt-1 text-sm', usernameStatus === 'available' ? 'text-green-600' : 'text-red-600']">
                {{ usernameMessage }}
              </p>
            </div>

            <div>
              <label for="nickname" class="block text-sm font-semibold text-gray-700 mb-2">닉네임</label>
              <div class="relative">
                <UserCircle class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  v-model="nickname"
                  @blur="checkNickname"
                  id="nickname"
                  type="text"
                  required
                  placeholder="사용할 닉네임"
                  class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50"
                />
              </div>
              <p v-if="nicknameMessage" :class="['mt-1 text-sm', nicknameStatus === 'available' ? 'text-green-600' : 'text-red-600']">
                {{ nicknameMessage }}
              </p>
            </div>

            <div>
              <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">이메일</label>
              <div class="flex gap-2">
                <div class="relative grow">
                  <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    v-model="email"
                    @blur="checkEmail"
                    id="email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    :disabled="isEmailVerified || emailStatus === 'checking' || countdown > 0"
                    class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50"
                  />
                </div>
                <button
                  @click="handleEmailVerification"
                  type="button"
                  :disabled="emailStatus !== 'available' || isEmailVerified || countdown > 0"
                  class="shrink-0 px-4 py-3 rounded-xl bg-gray-600 text-white font-semibold hover:bg-gray-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <span v-if="countdown > 0">({{ Math.floor(countdown / 60).toString().padStart(2, '0') }}:{{ (countdown % 60).toString().padStart(2, '0') }})</span>
                  <span v-else-if="isEmailVerified">인증 완료</span>
                  <span v-else-if="emailVerificationSent">재전송</span>
                  <span v-else>인증</span>
                </button>
              </div>
              <p v-if="emailMessage" :class="['mt-1 text-sm', emailStatus === 'available' ? 'text-green-600' : 'text-red-600']">
                {{ emailMessage }}
              </p>
            </div>

            <div v-if="emailVerificationSent && !isEmailVerified" class="space-y-2 !mt-4">
              <label for="verificationCode" class="block text-sm font-semibold text-gray-700 mb-2">인증코드</label>
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
              <button
                @click="handleCodeVerification"
                type="button"
                class="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold hover:from-orange-600 hover:to-rose-600 transition-all transform hover:scale-[1.02] shadow-lg"
              >
                인증코드 확인
              </button>
            </div>

            <div>
              <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">비밀번호</label>
              <div class="relative">
                <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  v-model="password"
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  :class="[
                    'w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:border-orange-400 focus:outline-none transition-colors bg-white/50',
                    passwordMismatch ? 'border-red-500' : 'border-gray-200'
                  ]"
                />
              </div>
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-semibold text-gray-700 mb-2">비밀번호 확인</label>
              <div class="relative">
                <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  v-model="confirmPassword"
                  id="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  :class="[
                    'w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:border-orange-400 focus:outline-none transition-colors bg-white/50',
                    passwordMismatch ? 'border-red-500' : 'border-gray-200'
                  ]"
                />
              </div>
              <p v-if="passwordMismatch" class="mt-1 text-sm text-red-600">
                비밀번호가 일치하지 않습니다
              </p>
            </div>

            <button
              type="submit"
              :disabled="passwordMismatch || !isEmailVerified || usernameStatus !== 'available' || nicknameStatus !== 'available' || emailStatus !== 'available'"
              class="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-lg hover:from-orange-600 hover:to-rose-600 transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50"
            >
              회원가입
            </button>
          </form>

          <div class="mt-6 text-center text-sm text-gray-600">
            이미 계정이 있으신가요?
            <router-link to="/login" class="text-orange-600 hover:text-orange-700 font-semibold ml-1">
              로그인
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Lock, User, UserCircle, KeyRound } from 'lucide-vue-next'
import apiClient from '../../../api'
import { useAuthStore } from '../../../stores/auth'
import { useNotificationStore } from '../../../stores/notification'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const name = ref('')
const username = ref('')
const nickname = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const usernameStatus = ref('')
const usernameMessage = ref('')

const nicknameStatus = ref('')
const nicknameMessage = ref('')

const emailStatus = ref('')
const emailMessage = ref('')

const emailVerificationSent = ref(false)
const verificationCode = ref('')
const isEmailVerified = ref(false)

const countdown = ref(0);
let timerIntervalId = null;

const passwordMismatch = computed(() => {
  return confirmPassword.value.length > 0 && password.value !== confirmPassword.value
})

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


const checkUsername = async () => {
  if (!username.value) {
    usernameStatus.value = ''
    usernameMessage.value = ''
    return
  }
  usernameStatus.value = 'checking'
  usernameMessage.value = '아이디 중복을 확인 중입니다...'
  try {
    await apiClient.get('/auth/check-username', { params: { username: username.value } })
    usernameStatus.value = 'available'
    usernameMessage.value = '사용 가능한 아이디입니다.'
  } catch (error) {
    if (error.response && error.response.status === 409) {
      usernameStatus.value = 'taken'
      usernameMessage.value = '이미 사용 중인 아이디입니다.'
    } else {
      usernameStatus.value = 'error'
      usernameMessage.value = '확인 중 에러가 발생했습니다.'
    }
    notificationStore.showNotification(error.response?.data?.message || '아이디 중복 확인 중 에러가 발생했습니다.', 'error');
  }
}

const checkNickname = async () => {
  if (!nickname.value) {
    nicknameStatus.value = ''
    nicknameMessage.value = ''
    return
  }
  nicknameStatus.value = 'checking'
  nicknameMessage.value = '닉네임 중복을 확인 중입니다...'
  try {
    await apiClient.get('/auth/check-nickname', { params: { nickname: nickname.value } })
    nicknameStatus.value = 'available'
    nicknameMessage.value = '사용 가능한 닉네임입니다.'
  } catch (error) {
    if (error.response && error.response.status === 409) {
      nicknameStatus.value = 'taken'
      nicknameMessage.value = '이미 사용 중인 닉네임입니다.'
    } else {
      nicknameStatus.value = 'error'
      nicknameMessage.value = '확인 중 에러가 발생했습니다.'
    }
    notificationStore.showNotification(error.response?.data?.message || '닉네임 중복 확인 중 에러가 발생했습니다.', 'error');
  }
}

const checkEmail = async () => {
  if (!email.value) {
    emailStatus.value = ''
    emailMessage.value = ''
    return
  }
  emailStatus.value = 'checking'
  emailMessage.value = '이메일 중복을 확인 중입니다...'
  try {
    await apiClient.get('/auth/check-email', { params: { email: email.value } })
    emailStatus.value = 'available'
    emailMessage.value = '사용 가능한 이메일입니다.'
  } catch (error) {
    if (error.response && error.response.status === 409) {
      emailStatus.value = 'taken'
      emailMessage.value = '이미 사용 중인 이메일입니다.'
    } else {
      emailStatus.value = 'error'
      emailMessage.value = '확인 중 에러가 발생했습니다.'
    }
    notificationStore.showNotification(error.response?.data?.message || '이메일 중복 확인 중 에러가 발생했습니다.', 'error');
  }
}

const handleEmailVerification = async () => {
  if (!email.value) {
    notificationStore.showNotification('이메일을 먼저 입력해주세요.', 'warning');
    return;
  }
  if (emailStatus.value === 'taken') {
    notificationStore.showNotification('이미 사용 중인 이메일입니다. 다른 이메일을 사용해주세요.', 'warning');
    return;
  }
  if (emailStatus.value !== 'available') {
    notificationStore.showNotification('이메일 중복 확인을 먼저 완료해주세요.', 'warning');
    return;
  }
  try {
    await apiClient.post('/auth/email/send', { email: email.value });
    notificationStore.showNotification('인증 메일이 발송되었습니다. 이메일을 확인해주세요.', 'success');
    emailVerificationSent.value = true;
    startCountdown(); // Start countdown on success
  } catch (error) {
    console.error('이메일 인증 요청 실패:', error.response ? error.response.data : error.message);
    notificationStore.showNotification(error.response?.data?.message || '이메일 인증 요청에 실패했습니다.', 'error');
  }
}

const handleCodeVerification = async () => {
  if (!verificationCode.value) {
    notificationStore.showNotification('인증코드를 입력해주세요.', 'warning');
    return;
  }
  try {
    await apiClient.post('/auth/email/verify', { 
      email: email.value,
      code: verificationCode.value 
    });
    notificationStore.showNotification('이메일 인증이 완료되었습니다.', 'success');
    isEmailVerified.value = true;
    clearInterval(timerIntervalId); // Stop countdown on successful verification
    timerIntervalId = null;
    countdown.value = 0;
  } catch (error) {
    console.error('인증코드 확인 실패:', error.response ? error.response.data : error.message);
    notificationStore.showNotification(error.response?.data?.message || '인증코드가 올바르지 않습니다.', 'error');
  }
}

const handleSignup = async () => {
  if (usernameStatus.value !== 'available') {
    notificationStore.showNotification('아이디 중복 확인을 완료해주세요.', 'warning');
    return;
  }
  if (nicknameStatus.value !== 'available') {
    notificationStore.showNotification('닉네임 중복 확인을 완료해주세요.', 'warning');
    return;
  }
  if (!isEmailVerified.value) {
    notificationStore.showNotification('이메일 인증을 먼저 완료해주세요.', 'warning');
    return;
  }
  if (passwordMismatch.value) {
    notificationStore.showNotification('비밀번호가 일치하지 않습니다.', 'warning');
    return;
  }

  try {
    await apiClient.post('/auth/signup', {
      name: name.value,
      username: username.value,
      nickname: nickname.value,
      email: email.value,
      password: password.value
    });

    // 회원가입 성공 후, 즉시 로그인 처리
    const loginResponse = await apiClient.post('/auth/login', {
      username: username.value,
      password: password.value,
    });

    const { accessToken, refreshToken, name: loggedInName, userId } = loginResponse.data;

    if (accessToken && refreshToken && loggedInName && userId) {
      authStore.setTokens(accessToken, refreshToken, false); // '로그인 유지' 안함
      authStore.setUserInfo(userId, loggedInName, false);
      
      notificationStore.showNotification('회원가입 성공 및 자동 로그인되었습니다. 추가 정보를 입력해주세요.', 'success');
      authStore.setFirstStepCompleted(true);
      router.push('/additional-info');
    } else {
      // 로그인 응답에 필수 데이터가 없을 경우
      throw new Error('자동 로그인 실패: 필수 응답 데이터가 부족합니다.');
    }
  } catch (error) {
    console.error('회원가입 또는 자동 로그인 실패:', error.response ? error.response.data : error.message);
    notificationStore.showNotification(error.response?.data?.message || '회원가입 또는 자동 로그인에 실패했습니다. 입력 내용을 확인해주세요.', 'error');
  }
}
</script>
