<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">회원가입</h1>
          <p class="text-gray-600">식단관리를 시작하세요</p>
        </div>

        <form @submit.prevent="handleSignup" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">이름</label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="name"
                type="text"
                required
                placeholder="홍길동"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">아이디</label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="username"
                @blur="checkUsername"
                type="text"
                required
                placeholder="사용할 아이디"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              />
            </div>
            <p v-if="usernameMessage" :class="['mt-1 text-sm', usernameStatus === 'available' ? 'text-green-600' : 'text-red-600']">
              {{ usernameMessage }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">닉네임</label>
            <div class="relative">
              <UserCircle class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="nickname"
                @blur="checkNickname"
                type="text"
                required
                placeholder="사용할 닉네임"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              />
            </div>
            <p v-if="nicknameMessage" :class="['mt-1 text-sm', nicknameStatus === 'available' ? 'text-green-600' : 'text-red-600']">
              {{ nicknameMessage }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
            <div class="flex gap-2">
              <div class="relative grow">
                <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  v-model="email"
                  @blur="checkEmail"
                  type="email"
                  required
                  placeholder="your@email.com"
                  :disabled="isEmailVerified || emailStatus === 'checking'"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                />
              </div>
              <button
                @click="handleEmailVerification"
                type="button"
                :disabled="emailStatus !== 'available' || isEmailVerified"
                class="w-32 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {{ isEmailVerified ? '인증 완료' : (emailVerificationSent ? '재전송' : '이메일 인증') }}
              </button>
            </div>
            <p v-if="emailMessage" :class="['mt-1 text-sm', emailStatus === 'available' ? 'text-green-600' : 'text-red-600']">
              {{ emailMessage }}
            </p>
          </div>

          <div v-if="emailVerificationSent && !isEmailVerified" class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">인증코드</label>
            <div class="flex gap-2">
              <div class="relative grow">
                <input
                  v-model="verificationCode"
                  type="text"
                  required
                  placeholder="이메일로 받은 인증코드"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                />
              </div>
              <button
                @click="handleCodeVerification"
                type="button"
                class="w-32 bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-600 transition"
              >
                인증코드 확인
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="password"
                type="password"
                required
                placeholder="••••••••"
                :class="[
                  'w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 outline-none transition',
                  passwordMismatch ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-transparent'
                ]"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                :class="[
                  'w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 outline-none transition',
                  passwordMismatch ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-transparent'
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
            class="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            회원가입
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-gray-600">
          이미 계정이 있으신가요?
          <router-link to="/login" class="text-emerald-600 hover:text-emerald-700 font-semibold ml-1">
            로그인
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Lock, User, UserCircle } from 'lucide-vue-next'
import apiClient from '../../api'

const router = useRouter()

const name = ref('')
const username = ref('')
const nickname = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const usernameStatus = ref('') // 'checking', 'available', 'taken'
const usernameMessage = ref('')

const nicknameStatus = ref('') // 'checking', 'available', 'taken'
const nicknameMessage = ref('')

const emailStatus = ref('') // 'checking', 'available', 'taken'
const emailMessage = ref('')

const emailVerificationSent = ref(false)
const verificationCode = ref('')
const isEmailVerified = ref(false)

const passwordMismatch = computed(() => {
  return confirmPassword.value.length > 0 && password.value !== confirmPassword.value
})

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
    if (error.response && error.response.status === 409) { // Conflict
      emailStatus.value = 'taken'
      emailMessage.value = '이미 사용 중인 이메일입니다.'
    } else {
      emailStatus.value = 'error'
      emailMessage.value = '확인 중 에러가 발생했습니다.'
    }
  }
}

const handleEmailVerification = async () => {
  if (!email.value) {
    alert('이메일을 먼저 입력해주세요.')
    return
  }
  if (emailStatus.value === 'taken') {
    alert('이미 사용 중인 이메일입니다. 다른 이메일을 사용해주세요.')
    return
  }
  if (emailStatus.value !== 'available') {
    alert('이메일 중복 확인을 먼저 완료해주세요.')
    return
  }
  try {
    await apiClient.post('/auth/email/send', { email: email.value })
    alert('인증 메일이 발송되었습니다. 이메일을 확인해주세요.')
    emailVerificationSent.value = true
  } catch (error) {
    console.error('이메일 인증 요청 실패:', error.response ? error.response.data : error.message)
    alert('이메일 인증 요청에 실패했습니다.')
  }
}

const handleCodeVerification = async () => {
  if (!verificationCode.value) {
    alert('인증코드를 입력해주세요.')
    return
  }
  try {
    await apiClient.post('/auth/email/verify', { 
      email: email.value,
      code: verificationCode.value 
    })
    alert('이메일 인증이 완료되었습니다.')
    isEmailVerified.value = true
  } catch (error) {
    console.error('인증코드 확인 실패:', error.response ? error.response.data : error.message)
    alert('인증코드가 올바르지 않습니다.')
  }
}

const handleSignup = async () => {
  if (usernameStatus.value !== 'available') {
    alert('아이디 중복 확인을 완료해주세요.')
    return
  }
  if (nicknameStatus.value !== 'available') {
    alert('닉네임 중복 확인을 완료해주세요.')
    return
  }
  if (!isEmailVerified.value) {
    alert('이메일 인증을 먼저 완료해주세요.')
    return
  }
  if (passwordMismatch.value) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }

  try {
    await apiClient.post('/auth/signup', {
      name: name.value,
      username: username.value,
      nickname: nickname.value,
      email: email.value,
      password: password.value
    })
    alert('회원가입에 성공했습니다! 추가 정보 입력 페이지로 이동합니다.')
    sessionStorage.setItem('firstStepCompleted', 'true') // 1차 회원가입 완료 플래그 설정
    router.push('/additional-info') // 추가 정보 입력 페이지로 리다이렉트
  } catch (error) {
    console.error('회원가입 실패:', error.response ? error.response.data : error.message)
    alert('회원가입에 실패했습니다. 입력 내용을 확인해주세요.')
  }
}
</script>
