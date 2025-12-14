<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Organic blob shapes -->
    <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-orange-300/30 to-rose-300/30 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-amber-300/30 to-orange-300/30 rounded-full blur-3xl"></div>
    
    <div class="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center relative z-10">
      <!-- Left side - Illustration & Message -->
      <div class="space-y-8 hidden md:block">
        <div class="space-y-4">
          <h1 class="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            건강한 식단,<br/>
            <span class="text-orange-600">AI가 함께</span><br/>
            관리합니다
          </h1>
          <p class="text-xl text-gray-600 leading-relaxed">
            당신의 식습관을 분석하고<br/>
            맞춤형 건강 리포트를 제공해요
          </p>
        </div>

        <!-- Feature cards -->
        <div class="space-y-3">
          <div class="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-orange-200/50">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center text-white font-bold text-lg">
              AI
            </div>
            <div>
              <p class="font-semibold text-gray-900">실시간 식단 분석</p>
              <p class="text-sm text-gray-600">AI가 즉시 영양 점수 계산</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-amber-200/50">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white font-bold text-lg">
              📊
            </div>
            <div>
              <p class="font-semibold text-gray-900">맞춤형 리포트</p>
              <p class="text-sm text-gray-600">나만의 건강 인사이트 제공</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side - Login form -->
      <div class="bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50">
        <div class="space-y-6">
          <div class="text-center space-y-2">
            <h2 class="text-3xl font-bold text-gray-900">시작하기</h2>
            <p class="text-gray-600">건강한 변화의 첫 걸음</p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label for="username" class="block text-sm font-semibold text-gray-700 mb-2">아이디</label>
              <div class="relative">
                <User class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  id="username"
                  v-model="username"
                  type="text" 
                  required
                  placeholder="아이디를 입력하세요"
                  class="w-full pl-12 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50"
                />
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">비밀번호</label>
              <div class="relative">
                <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  placeholder="••••••••"
                  class="w-full pl-12 pr-12 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50"
                />
                <button type="button" @click="toggleShowPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  <Eye v-if="!showPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between text-sm">
              <label class="flex items-center gap-2 text-gray-700 cursor-pointer">
                <input type="checkbox" id="saveUsername" v-model="saveUsername" class="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                <span>아이디 저장</span>
              </label>
              <label class="flex items-center gap-2 text-gray-700 cursor-pointer">
                <input type="checkbox" id="keepLoggedIn" v-model="keepLoggedIn" class="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                <span>로그인 유지</span>
              </label>
            </div>

            <button 
              type="submit"
              class="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-lg hover:from-orange-600 hover:to-rose-600 transition-all transform hover:scale-[1.02] shadow-lg"
            >
              로그인
            </button>
          </form>

          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-white/80 text-gray-500">또는</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <button @click="handleSocialLogin('google')" class="w-full py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button @click="handleSocialLogin('github')" class="w-full py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <Github class="w-5 h-5" />
              Github
            </button>
            <button @click="handleSocialLogin('naver')" class="w-full py-3 rounded-xl bg-[#03C75A] text-white font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
              Naver
            </button>
            <button @click="handleSocialLogin('kakao')" class="w-full py-3 rounded-xl bg-[#FEE500] text-black font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2">
              Kakao
            </button>
          </div>

          <div class="text-center text-sm text-gray-600">
            <router-link to="/find-username" class="text-orange-600 hover:text-orange-700 font-semibold">아이디 찾기</router-link>
            <span class="mx-2 text-gray-400">|</span>
            <router-link to="/find-password" class="text-orange-600 hover:text-orange-700 font-semibold">비밀번호 찾기</router-link>
          </div>
          <p class="text-center text-sm text-gray-600">
            계정이 없으신가요? <router-link to="/signup" class="text-orange-600 hover:text-orange-700 font-semibold">회원가입</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Lock, Github, Eye, EyeOff } from 'lucide-vue-next'
import apiClient from '../../api'

const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const saveUsername = ref(false)
const keepLoggedIn = ref(false)
const showPassword = ref(false)

// 비밀번호 표시/숨기기 토글 함수
const toggleShowPassword = () => {
  showPassword.value = !showPassword.value
}

onMounted(() => {
  // 로그아웃 후 리디렉션된 경우 알림 표시
  if (route.query.logged_out === 'true') {
    alert('로그아웃 되었습니다.');
    router.replace({ path: '/login' });
  }

  // 아이디 저장 기능: localStorage에서 저장된 아이디 불러오기
  const savedUsername = localStorage.getItem('saved_username')
  if (savedUsername) {
    username.value = savedUsername
    saveUsername.value = true
  }
})

const handleLogin = async () => {
  // 아이디 저장 기능: 로그인 성공 시 아이디 저장/삭제
  if (saveUsername.value) {
    localStorage.setItem('saved_username', username.value)
  } else {
    localStorage.removeItem('saved_username')
  }

  try {
    const response = await apiClient.post('/auth/login', {
      username: username.value,
      password: password.value,
    })

    console.log('로그인 성공:', response.data)
    
    const { accessToken, refreshToken, name, userId, isTempPassword } = response.data

    if (accessToken && refreshToken && name && userId) {
      // "로그인 유지" 선택 시 localStorage 사용, 미선택 시 sessionStorage 사용
      const storage = keepLoggedIn.value ? localStorage : sessionStorage;
      storage.setItem('accessToken', accessToken)
      storage.setItem('refreshToken', refreshToken)
      storage.setItem('name', name)
      storage.setItem('userId', userId)
      
      alert('로그인에 성공했습니다!')
      
      if (isTempPassword) {
        sessionStorage.setItem('isTempPasswordLogin', 'true')
        router.push('/change-password')
      } else {
        router.push('/')
      }
    } else {
      throw new Error('필수 응답 데이터(토큰, 이름 또는 사용자 ID)가 포함되지 않았습니다.')
    }

  } catch (error) {
    console.error('로그인 실패:', error.response ? error.response.data : error.message)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('refreshToken')
    alert('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.')
  }
}

const handleSocialLogin = (provider) => {
  console.log(`${provider} 로그인 시도`);

  let authUrl = '';
  const baseUrl = import.meta.env.VITE_FRONTEND_BASE_URL;

  switch (provider) {
    case 'naver': {
      const redirectUri = `${baseUrl}/auth/naver/callback`;
      const state = Math.random().toString(36).substring(2);
      sessionStorage.setItem('naver_state', state);
      authUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${import.meta.env.VITE_NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
      break;
    }
    case 'kakao': {
      const redirectUri = `${baseUrl}/auth/kakao/callback`;
      const state = Math.random().toString(36).substring(2);
      sessionStorage.setItem('kakao_state', state);
      authUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${import.meta.env.VITE_KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
      break;
    }
    case 'google': {
      const redirectUri = `${baseUrl}/auth/google/callback`;
      const state = Math.random().toString(36).substring(2);
      sessionStorage.setItem('google_state', state);
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20profile%20email&state=${state}`;
      break;
    }
    case 'github': {
      const redirectUri = `${baseUrl}/auth/github/callback`;
      const state = Math.random().toString(36).substring(2);
      sessionStorage.setItem('github_state', state);
      authUrl = `https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email&state=${state}`;
      break;
    }
    default:
      alert('지원하지 않는 소셜 로그인입니다.');
      return;
  }

  if (authUrl) {
    window.location.href = authUrl;
  }
};
</script>