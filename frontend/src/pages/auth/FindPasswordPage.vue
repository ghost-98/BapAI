<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">비밀번호 찾기</h1>
          <p class="text-gray-600">아이디와 이메일 인증을 통해 비밀번호를 재설정합니다.</p>
        </div>

        <form class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">아이디</label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="username"
                type="text"
                required
                placeholder="가입 시 사용한 아이디"
                :disabled="emailVerificationSent"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
              />
            </div>
          </div>

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
                :disabled="!username || !email"
                class="w-32 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {{ emailVerificationSent ? '재전송' : '인증 메일 발송' }}
              </button>
            </div>
          </div>

          <div v-if="emailVerificationSent" class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">인증코드</label>
            <div class="relative">
              <input
                v-model="verificationCode"
                type="text"
                required
                placeholder="이메일로 받은 인증코드"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              />
            </div>
            <!-- New "본인 확인" button -->
            <button
              @click="handleCodeVerification"
              type="button"
              :disabled="!username || !email || !verificationCode"
              class="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed mt-4"
            >
              비밀번호 재발급
            </button>
          </div>

          
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
import { useRouter } from 'vue-router'
import { Mail, User } from 'lucide-vue-next'
import apiClient from '../../api'

const router = useRouter()

const username = ref('')
const email = ref('')
const verificationCode = ref('')
const emailVerificationSent = ref(false)

const handleEmailVerification = async () => {
  if (!username.value || !email.value) {
    alert('아이디와 이메일을 모두 입력해주세요.')
    return
  }
  try {
    await apiClient.post('/auth/email/send', { username: username.value, email: email.value })
    alert('인증 메일이 발송되었습니다. 이메일을 확인해주세요.')
    emailVerificationSent.value = true
  } catch (error) {
    console.error('이메일 인증 요청 실패:', error.response ? error.response.data : error.message)
    alert('이메일 인증 요청에 실패했습니다. 아이디와 이메일이 일치하는지 확인해주세요.')
  }
}

const handleCodeVerification = async () => {
  if (!verificationCode.value) {
    alert('인증코드를 입력해주세요.')
    return
  }
  if (!username.value || !email.value) {
    alert('아이디와 이메일을 먼저 입력하고 인증 메일을 발송해주세요.')
    return
  }
  try {
    await apiClient.post('/auth/reset-password', {
      username: username.value,
      email: email.value,
      code: verificationCode.value
    })
    alert('본인 확인에 성공했습니다. 임시 비밀번호가 이메일로 발송되었습니다. 로그인 페이지로 이동합니다.')
    router.push('/login')
  } catch (error) {
    console.error('인증코드 확인 실패:', error.response ? error.response.data : error.message)
    alert('인증코드가 올바르지 않거나 만료되었거나, 아이디/이메일과 일치하지 않습니다.')
  }
}

</script>
