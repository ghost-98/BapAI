<template>
  <main class="mx-auto max-w-7xl px-6 py-12">
    <!-- 페이지 헤더 -->
    <div class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50 mb-8">
      <h1 class="text-4xl font-bold text-gray-900">내 정보 관리</h1>
      <p class="mt-2 text-lg text-gray-600">개인 정보를 확인하고 관리할 수 있습니다.</p>
    </div>

    <div v-if="userStore.isLoading" class="text-center bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
      <p class="text-gray-600">사용자 정보를 불러오는 중...</p>
    </div>

    <div v-else class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50 space-y-6">
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 border-b border-gray-200/80 pb-6">
          <div class="flex items-baseline">
            <p class="text-sm font-semibold text-gray-600 w-28 flex-shrink-0">이메일</p>
            <p class="text-gray-900 font-medium">{{ userStore.email }}</p>
          </div>
          <div class="flex items-baseline">
            <p class="text-sm font-semibold text-gray-600 w-28 flex-shrink-0">닉네임</p>
            <p class="text-gray-900 font-medium">{{ userStore.nickname }}</p>
          </div>
          <div class="flex items-baseline">
            <p class="text-sm font-semibold text-gray-600 w-28 flex-shrink-0">이름</p>
            <p class="text-gray-900 font-medium">{{ userStore.name }}</p>
          </div>
          <div class="flex items-baseline">
            <p class="text-sm font-semibold text-gray-600 w-28 flex-shrink-0">성별</p>
            <p class="text-gray-900 font-medium">{{ userStore.genderText }}</p>
          </div>
          <div class="flex items-baseline">
            <p class="text-sm font-semibold text-gray-600 w-28 flex-shrink-0">출생 연도</p>
            <p class="text-gray-900 font-medium">{{ userStore.birth_year || '미입력' }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 border-b border-gray-200/80 pb-6">
           <div class="flex items-baseline">
            <p class="text-sm font-semibold text-gray-600 w-28 flex-shrink-0">키</p>
            <p class="text-gray-900 font-medium">{{ userStore.height ? `${userStore.height} cm` : '미입력' }}</p>
          </div>
          <div class="flex items-baseline">
            <p class="text-sm font-semibold text-gray-600 w-28 flex-shrink-0">몸무게</p>
            <p class="text-gray-900 font-medium">{{ userStore.weight ? `${userStore.weight} kg` : '미입력' }}</p>
          </div>
          <div class="flex items-baseline">
            <p class="text-sm font-semibold text-gray-600 w-28 flex-shrink-0">체중 목표</p>
            <p class="text-gray-900 font-medium">{{ userStore.dietGoalText }}</p>
          </div>
          <div class="flex items-baseline">
            <p class="text-sm font-semibold text-gray-600 w-28 flex-shrink-0">평소활동량</p>
            <p class="text-gray-900 font-medium">{{ userStore.activityLevelText }}</p>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <p class="text-sm font-semibold text-gray-600 mb-2">보유 질환</p>
            <div class="text-gray-800 bg-gray-50/50 p-4 rounded-lg text-sm min-h-[4rem]">
              {{ userStore.disease_codes.length ? userStore.disease_codes.join(', ') : '없음' }}
            </div>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-600 mb-2">알러지</p>
            <div class="text-gray-800 bg-gray-50/50 p-4 rounded-lg text-sm min-h-[4rem]">
              {{ userStore.allergy_codes.length ? userStore.allergy_codes.join(', ') : '없음' }}
            </div>
          </div>
        </div>

        <div class="pt-6 flex flex-wrap gap-4">
          <button
            @click="goToEditProfile"
            class="px-6 py-3 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600 transition-all font-semibold"
          >
            내 정보 수정
          </button>
          <button
            @click="goToChangePassword"
            class="px-6 py-3 bg-amber-500 text-white rounded-lg shadow hover:bg-amber-600 transition-all font-semibold"
          >
            비밀번호 변경
          </button>
          <button
            @click="handleDeleteAccount"
            class="px-6 py-3 bg-rose-600 text-white rounded-lg shadow hover:bg-rose-700 transition-all font-semibold"
          >
            회원 탈퇴
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../../../api'
import { useUserStore } from '../../../stores/user'
import { useAuthStore } from '../../../stores/auth'

const router = useRouter()
const userStore = useUserStore() // userStore 사용
const authStore = useAuthStore() // authStore 사용

onMounted(async () => {
  try {
    await userStore.fetchUserProfile()
  } catch (error) {
    console.error('사용자 정보 로딩 실패:', error)
    alert('사용자 정보를 불러오는 데 실패했습니다.')
    router.push('/login')
  }
})

const goToEditProfile = () => {
  router.push({ path: '/confirm-password', query: { redirect: '/edit-profile' } })
}

const goToChangePassword = () => {
  router.push({ path: '/confirm-password', query: { redirect: '/change-password' } })
}

const handleDeleteAccount = async () => {
  if (window.confirm('정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
    try {
      await apiClient.delete('/members/me')
      
      authStore.clearAuth() // Clear auth state
      userStore.clearUserProfile() // Clear user profile state

      alert('회원 탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.')
      router.push('/login')
    } catch (error) {
      console.error('회원 탈퇴 실패:', error)
      alert('회원 탈퇴 처리 중 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }
}
</script>
