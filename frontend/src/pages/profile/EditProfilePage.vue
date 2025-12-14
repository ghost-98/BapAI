<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Organic blob shapes -->
    <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-orange-300/30 to-rose-300/30 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-amber-300/30 to-orange-300/30 rounded-full blur-3xl"></div>
    
    <div class="w-full max-w-2xl relative z-10">
      <div class="bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50">
        <div class="space-y-6">
          <div class="text-center space-y-2">
            <h2 class="text-3xl font-bold text-gray-900">내 정보 수정</h2>
            <p class="text-gray-600">회원 정보를 수정하고 저장할 수 있습니다.</p>
          </div>

          <form class="space-y-6" @submit.prevent="handleUpdateProfile">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- 이름 -->
              <div>
                <label for="name" class="block text-sm font-semibold text-gray-700 mb-2">이름</label>
                <input
                  v-model="name"
                  id="name"
                  type="text"
                  autocomplete="name"
                  required
                  class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800"
                  placeholder="이름"
                />
              </div>
              <!-- 닉네임 -->
              <div>
                <label for="nickname" class="block text-sm font-semibold text-gray-700 mb-2">닉네임</label>
                <input
                  v-model="nickname"
                  id="nickname"
                  type="text"
                  autocomplete="nickname"
                  disabled
                  class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-100 text-gray-500 focus:outline-none transition-colors"
                  placeholder="닉네임"
                />
              </div>
              <!-- 성별 -->
              <div>
                <label for="gender" class="block text-sm font-semibold text-gray-700 mb-2">성별</label>
                <select
                  v-model="gender"
                  id="gender"
                  class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800"
                >
                  <option value="">성별을 선택하세요</option>
                  <option value="M">남성</option>
                  <option value="F">여성</option>
                </select>
              </div>
              <!-- 출생 연도 -->
              <div>
                <label for="birth_year" class="block text-sm font-semibold text-gray-700 mb-2">출생 연도</label>
                <input
                  v-model="birth_year"
                  id="birth_year"
                  type="number"
                  class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800"
                  placeholder="출생 연도 (YYYY)"
                />
              </div>
              <!-- 키 -->
              <div>
                <label for="height" class="block text-sm font-semibold text-gray-700 mb-2">키 (cm)</label>
                <input type="number" v-model="height" id="height" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800" placeholder="키 (cm)" required min="1" />
              </div>
              <!-- 몸무게 -->
              <div>
                <label for="weight" class="block text-sm font-semibold text-gray-700 mb-2">몸무게 (kg)</label>
                <input type="number" v-model="weight" id="weight" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800" placeholder="몸무게 (kg)" required min="1" />
              </div>
              <!-- 체중 목표 -->
              <div>
                <label for="diet_goal" class="block text-sm font-semibold text-gray-700 mb-2">체중 목표</label>
                <select v-model="diet_goal" id="diet_goal" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800" required>
                  <option value="" disabled>체중 목표를 선택하세요</option>
                  <option value="LOSS">체중 감량</option>
                  <option value="MAINTAIN">체중 유지</option>
                  <option value="GAIN">체중 증량</option>
                </select>
              </div>
              <!-- 평소활동량 -->
              <div>
                <label for="activity_level" class="block text-sm font-semibold text-gray-700 mb-2">평소활동량</label>
                <select v-model="activity_level" id="activity_level" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800" required>
                  <option value="" disabled>평소활동량을 선택하세요</option>
                  <option value="LOW">낮음</option>
                  <option value="NORMAL">보통</option>
                  <option value="HIGH">높음</option>
                </select>
              </div>
            </div>

            <!-- 질병 코드 -->
            <div>
              <label for="disease_codes" class="block text-sm font-semibold text-gray-700 mb-2">보유 질환 (쉼표로 구분)</label>
              <input type="text" v-model="disease_codes" id="disease_codes" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800" placeholder="예: DIABETES, HYPERTENSION" />
            </div>
            <!-- 알러지 코드 -->
            <div>
              <label for="allergy_codes" class="block text-sm font-semibold text-gray-700 mb-2">알러지 (쉼표로 구분)</label>
              <input
                v-model="allergy_codes"
                id="allergy_codes"
                type="text"
                class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800"
                placeholder="예: ALLERGY_PEANUT, ALLERGY_MILK"
              />
            </div>

            <div>
              <button
                type="submit"
                class="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-lg hover:from-orange-600 hover:to-rose-600 transition-all transform hover:scale-[1.02] shadow-lg"
              >
                정보 저장
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../../api'

const router = useRouter()

const name = ref('')
const nickname = ref('')
const gender = ref('')
const birth_year = ref(null)
const height = ref(null)
const weight = ref(null)
const diet_goal = ref('')
const activity_level = ref('')
const disease_codes = ref('')
const allergy_codes = ref('')

const initialUserData = ref(null)

onMounted(async () => {
  try {
    const response = await apiClient.get('/members/me')
    const userData = response.data
    initialUserData.value = { ...userData }

    name.value = userData.name || ''
    nickname.value = userData.nickname || ''
    gender.value = userData.gender || ''
    birth_year.value = userData.birth_year || null
    height.value = userData.height || null
    weight.value = userData.weight || null
    diet_goal.value = userData.diet_goal || ''
    activity_level.value = userData.activity_level || ''
    
    disease_codes.value = (userData.disease_codes || []).join(', ')
    allergy_codes.value = (userData.allergy_codes || []).join(', ')
  } catch (error) {
    console.error('사용자 정보 로딩 실패:', error)
    alert('사용자 정보를 불러오는 데 실패했습니다.')
    router.push('/my-info')
  }
})

const handleUpdateProfile = async () => {
  const payload = {}
  const initialData = initialUserData.value

  if (name.value !== initialData.name) {
    payload.name = name.value
  }

  if (gender.value !== initialData.gender && !(gender.value === '' && (initialData.gender === '' || initialData.gender === null))) {
    payload.gender = gender.value
  }
  if (diet_goal.value !== initialData.diet_goal && !(diet_goal.value === '' && (initialData.diet_goal === '' || initialData.diet_goal === null))) {
    payload.diet_goal = diet_goal.value
  }
  if (activity_level.value !== initialData.activity_level && !(activity_level.value === '' && (initialData.activity_level === '' || initialData.activity_level === null))) {
    payload.activity_level = activity_level.value
  }

  const currentBirthYear = birth_year.value === '' || birth_year.value === null ? null : Number(birth_year.value)
  if (currentBirthYear !== initialData.birth_year) {
    payload.birth_year = currentBirthYear
  }

  const currentHeight = height.value === '' || height.value === null ? null : Number(height.value)
  if (currentHeight !== initialData.height) {
    payload.height = currentHeight
  }

  const currentWeight = weight.value === '' || weight.value === null ? null : Number(weight.value)
  if (currentWeight !== initialData.weight) {
    payload.weight = currentWeight
  }

  const newDiseaseCodes = disease_codes.value.split(',').map(c => c.trim()).filter(Boolean)
  if (JSON.stringify(newDiseaseCodes.sort()) !== JSON.stringify((initialData.disease_codes || []).sort())) {
    payload.disease_codes = newDiseaseCodes
  }

  const newAllergyCodes = allergy_codes.value.split(',').map(c => c.trim()).filter(Boolean)
  if (JSON.stringify(newAllergyCodes.sort()) !== JSON.stringify((initialData.allergy_codes || []).sort())) {
    payload.allergy_codes = newAllergyCodes
  }

  if (Object.keys(payload).length === 0) {
    alert('수정된 내용이 없습니다.')
    return
  }

  try {
    await apiClient.patch('/members/me', payload) 
    alert('회원 정보가 성공적으로 수정되었습니다.')
    router.push('/my-info')
  } catch (error) {
    console.error('회원 정보 수정 실패:', error)
    alert('회원 정보 수정에 실패했습니다. 다시 시도해주세요.')
  }
}
</script>
