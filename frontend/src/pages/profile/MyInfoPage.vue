<template>
  <main class="mx-auto max-w-7xl px-6 py-12">
    <!-- 페이지 헤더 -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-gray-900">내 정보 관리</h1>
      <p class="mt-2 text-lg text-gray-600">개인 정보를 확인하고 관리할 수 있습니다.</p>
    </div>

    <div v-if="isLoading" class="text-center bg-white/80 backdrop-blur-xl rounded-2xl shadow-md border border-gray-200/80 p-12">
      <p class="text-gray-600">사용자 정보를 불러오는 중...</p>
    </div>

    <div v-else class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md border border-gray-200/80 p-8">
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 border-b border-gray-200/80 pb-6">
          <div class="flex items-baseline">
            <p class="text-sm font-semibold text-gray-600 w-28 flex-shrink-0">이메일</p>
            <p class="text-gray-900 font-medium">{{ email }}</p>
          </div>
          <div class="flex items-baseline">
            <p class="text-sm font-semibold text-gray-600 w-28 flex-shrink-0">닉네임</p>
            <p class="text-gray-900 font-medium">{{ nickname }}</p>
          </div>
          <div class="flex items-baseline">
            <p class="text-sm font-semibold text-gray-600 w-28 flex-shrink-0">이름</p>
            <p class="text-gray-900 font-medium">{{ name }}</p>
          </div>
          <div class="flex items-baseline">
            <p class="text-sm font-semibold text-gray-600 w-28 flex-shrink-0">성별</p>
            <p class="text-gray-900 font-medium">{{ genderText }}</p>
          </div>
          <div class="flex items-baseline">
            <p class="text-sm font-semibold text-gray-600 w-28 flex-shrink-0">출생 연도</p>
            <p class="text-gray-900 font-medium">{{ birth_year || '미입력' }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 border-b border-gray-200/80 pb-6">
           <div class="flex items-baseline">
            <p class="text-sm font-semibold text-gray-600 w-28 flex-shrink-0">키</p>
            <p class="text-gray-900 font-medium">{{ height ? `${height} cm` : '미입력' }}</p>
          </div>
          <div class="flex items-baseline">
            <p class="text-sm font-semibold text-gray-600 w-28 flex-shrink-0">몸무게</p>
            <p class="text-gray-900 font-medium">{{ weight ? `${weight} kg` : '미입력' }}</p>
          </div>
          <div class="flex items-baseline">
            <p class="text-sm font-semibold text-gray-600 w-28 flex-shrink-0">체중 목표</p>
            <p class="text-gray-900 font-medium">{{ dietGoalText }}</p>
          </div>
          <div class="flex items-baseline">
            <p class="text-sm font-semibold text-gray-600 w-28 flex-shrink-0">평소활동량</p>
            <p class="text-gray-900 font-medium">{{ activityLevelText }}</p>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <p class="text-sm font-semibold text-gray-600 mb-2">보유 질환</p>
            <div class="text-gray-800 bg-gray-50/50 p-4 rounded-lg text-sm min-h-[4rem]">
              {{ disease_codes.length ? disease_codes.join(', ') : '없음' }}
            </div>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-600 mb-2">알러지</p>
            <div class="text-gray-800 bg-gray-50/50 p-4 rounded-lg text-sm min-h-[4rem]">
              {{ allergy_codes.length ? allergy_codes.join(', ') : '없음' }}
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../../api'

const router = useRouter()

// 사용자 정보
const email = ref('')
const name = ref('')
const nickname = ref('')
const gender = ref('')
const birth_year = ref(null)
const height = ref(null)
const weight = ref(null)
const diet_goal = ref('')
const activity_level = ref('')
const disease_codes = ref([])
const allergy_codes = ref([])
const isLoading = ref(true)

const genderMap = {
  M: '남성',
  F: '여성'
}

const dietGoalMap = {
  LOSS: '체중 감량',
  MAINTAIN: '체중 유지',
  GAIN: '체중 증량'
}

const activityLevelMap = {
  LOW: '낮음',
  NORMAL: '보통',
  HIGH: '높음'
}

const genderText = computed(() => genderMap[gender.value] || '미입력')
const dietGoalText = computed(() => dietGoalMap[diet_goal.value] || '미입력')
const activityLevelText = computed(() => activityLevelMap[activity_level.value] || '미입력')

onMounted(async () => {
  try {
    const response = await apiClient.get('/members/me')
    const userData = response.data
    email.value = userData.email
    name.value = userData.name
    nickname.value = userData.nickname
    gender.value = userData.gender
    birth_year.value = userData.birth_year
    height.value = userData.height
    weight.value = userData.weight
    diet_goal.value = userData.diet_goal
    activity_level.value = userData.activity_level
    disease_codes.value = userData.disease_codes || []
    allergy_codes.value = userData.allergy_codes || []
  } catch (error) {
    console.error('사용자 정보 로딩 실패:', error)
    alert('사용자 정보를 불러오는 데 실패했습니다.')
    router.push('/login')
  } finally {
    isLoading.value = false
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
      
      localStorage.clear()
      sessionStorage.clear()

      alert('회원 탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.')
      router.push('/login')
    } catch (error) {
      console.error('회원 탈퇴 실패:', error)
      alert('회원 탈퇴 처리 중 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }
}
</script>
