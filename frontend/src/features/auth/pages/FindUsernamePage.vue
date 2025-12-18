<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">아이디 찾기</h1>
          <p class="text-gray-600">가입 시 사용한 이메일로 아이디를 찾아드립니다.</p>
        </div>

        <form @submit.prevent="handleFindUsername" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
            <div class="flex gap-2">
              <div class="relative grow">
                <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  v-model="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  :disabled="emailVerificationSent"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                />
              </div>
              <button
                @click="handleEmailVerification"
                type="button"
                :disabled="!email"
                class="w-32 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {{ emailVerificationSent ? '재전송' : '인증 메일 발송' }}
              </button>
            </div>
          </div>

          <div v-if="emailVerificationSent" class="space-y-2">
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
                :disabled="!verificationCode"
                class="w-32 bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                인증코드 확인
              </button>
            </div>
          </div>

          <div v-if="foundUsername" class="mt-6 p-4 bg-emerald-50 rounded-lg text-center">
            <p class="text-lg font-semibold text-emerald-800 mb-2">회원님의 아이디는 <span class="text-emerald-600">{{ foundUsername }}</span> 입니다.</p>
            <router-link to="/login" class="text-emerald-600 hover:text-emerald-700 font-semibold">
              로그인 페이지로 이동
            </router-link>
          </div>

          <button
            v-else
            type="submit"
            :disabled="!isEmailVerified"
            class="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            아이디 찾기
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-gray-600">
          <router-link to="/login" class="text-emerald-600 hover:text-emerald-700 font-semibold">
            로그인 페이지로 돌아가기
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Mail } from 'lucide-vue-next'
import apiClient from '../../../api'

const email = ref('')
const verificationCode = ref('')
const emailVerificationSent = ref(false)
const isEmailVerified = ref(false)
const foundUsername = ref('')

const handleEmailVerification = async () => {
  if (!email.value) {
    alert('이메일을 입력해주세요.')
    return
  }
  try {
    await apiClient.post('/auth/email/send', { email: email.value })
    alert('인증 메일이 발송되었습니다. 이메일을 확인해주세요.')
    emailVerificationSent.value = true
  } catch (error) {
    console.error('이메일 인증 요청 실패:', error.response ? error.response.data : error.message)
    alert('이메일 인증 요청에 실패했습니다. 가입된 이메일인지 확인해주세요.')
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
    alert('인증코드가 올바르지 않거나 만료되었습니다.')
  }
}

const handleFindUsername = async () => {
  if (!isEmailVerified.value) {
    alert('이메일 인증을 먼저 완료해주세요.')
    return
  }
  try {
    const response = await apiClient.post('/auth/find-username', {
      email: email.value,
      code: verificationCode.value
    })
    foundUsername.value = response.data.username
    alert(`회원님의 아이디는 ${foundUsername.value} 입니다.`)
  } catch (error) {
    console.error('아이디 찾기 실패:', error.response ? error.response.data : error.message)
    alert('아이디 찾기에 실패했습니다. 다시 시도해주세요.')
  }
}
</script>
