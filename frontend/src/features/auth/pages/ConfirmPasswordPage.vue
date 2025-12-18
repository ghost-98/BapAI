<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Organic blob shapes -->
    <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-orange-300/30 to-rose-300/30 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-amber-300/30 to-orange-300/30 rounded-full blur-3xl"></div>
    
    <div class="w-full max-w-md relative z-10">
      <div class="bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50">
        <div class="space-y-6">
          <div class="text-center space-y-2">
            <h2 class="text-3xl font-bold text-gray-900">비밀번호 확인</h2>
            <p class="text-gray-600">회원님의 정보를 안전하게 보호하기 위해<br/>비밀번호를 다시 한번 입력해주세요.</p>
          </div>

          <form @submit.prevent="handleConfirm" class="space-y-4">
            <div>
              <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">비밀번호</label>
              <div class="relative">
                <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  id="password"
                  v-model="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  class="w-full pl-12 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50"
                />
              </div>
            </div>

            <button 
              type="submit"
              class="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-lg hover:from-orange-600 hover:to-rose-600 transition-all transform hover:scale-[1.02] shadow-lg"
            >
              확인
            </button>
          </form>
           <div class="text-center">
            <button @click="goBack" class="text-sm text-gray-600 hover:text-orange-600 transition">이전 페이지로 돌아가기</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Lock } from 'lucide-vue-next'
import apiClient from '../../../api'
import { useAuthStore } from '../../../stores/auth' // 1. 스토어 임포트

const router = useRouter()
const route = useRoute()
const password = ref('')
const authStore = useAuthStore() // 스토어 인스턴스 생성

const handleConfirm = async () => {
  try {
    await apiClient.post('/members/check-password', { password: password.value })
    
    // 2. sessionStorage를 직접 조작하는 대신, 스토어의 액션을 호출
    authStore.setReauthenticated(true)

    const redirectPath = route.query.redirect || '/'
    router.push(redirectPath)
  } catch (error) {
    console.error('비밀번호 확인 실패:', error)
    alert('비밀번호가 올바르지 않습니다.')
  }
}

const goBack = () => {
  router.back()
}
</script>