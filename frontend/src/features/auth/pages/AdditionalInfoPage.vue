<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg z-10">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">추가 정보 입력</h2>
        <p class="mt-2 text-sm text-gray-600">
          회원가입을 완료하기 위해 추가 정보를 입력해주세요.
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="submitAdditionalInfo">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="gender" class="sr-only">성별</label>
            <select v-model="userStore.gender" id="gender" class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm" required>
              <option value="" disabled>성별을 선택하세요</option>
              <option value="M">남성</option>
              <option value="F">여성</option>
            </select>
          </div>
          <div class="mt-4">
            <label for="birth_year" class="sr-only">출생 연도</label>
            <input type="number" v-model="userStore.birth_year" id="birth_year" class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm" placeholder="출생 연도 (YYYY)" required />
          </div>
          <div class="mt-4">
            <label for="height" class="sr-only">키 (cm)</label>
            <input type="number" v-model="userStore.height" id="height" class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm" placeholder="키 (cm)" required min="1" />
          </div>
          <div class="mt-4">
            <label for="weight" class="sr-only">몸무게 (kg)</label>
            <input type="number" v-model="userStore.weight" id="weight" class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm" placeholder="몸무게 (kg)" required min="1" />
          </div>
          <div class="mt-4">
            <label for="diet_goal" class="sr-only">체중 목표</label>
            <select v-model="userStore.diet_goal" id="diet_goal" class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm" required>
              <option value="" disabled>체중 목표를 선택하세요</option>
              <option value="LOSS">체중 감량</option>
              <option value="MAINTAIN">체중 유지</option>
              <option value="GAIN">체중 증량</option>
            </select>
          </div>
          <div class="mt-4">
            <label for="activity_level" class="sr-only">평소활동량</label>
            <select v-model="userStore.activity_level" id="activity_level" class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm" required>
              <option value="" disabled>평소활동량을 선택하세요</option>
              <option value="LOW">낮음</option>
              <option value="NORMAL">보통</option>
              <option value="HIGH">높음</option>
            </select>
          </div>
          <div class="mt-4">
            <label for="disease_codes" class="sr-only">질병 코드 (쉼표로 구분)</label>
            <input type="text" v-model="userStore.disease_codes" id="disease_codes" class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm" placeholder="질병 코드 (예: DIABETES, HYPERTENSION)" />
          </div>
          <div class="mt-4">
            <label for="allergy_codes" class="sr-only">알러지 코드</label>
            <input type="text" v-model="userStore.allergy_codes" id="allergy_codes" class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm" placeholder="알러지 코드 (예: ALLERGY_PEANUT, ALLERGY_MILK)" />
          </div>
        </div>

        <div>
          <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
            정보 저장
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '../../../stores/user' // Pinia user store 임포트
import { useAuthStore } from '../../../stores/auth' // Pinia auth store 임포트

const router = useRouter()
const userStore = useUserStore() // userStore 사용
const authStore = useAuthStore() // authStore 사용

const submitAdditionalInfo = async () => {
  try {
    const payload = {
      gender: userStore.gender,
      birth_year: Number(userStore.birth_year),
      height: Number(userStore.height),
      weight: Number(userStore.weight),
      diet_goal: userStore.diet_goal,
      activity_level: userStore.activity_level,
    }

    const diseaseCodes = userStore.disease_codes.split(',').map(code => code.trim()).filter(Boolean);
    if (diseaseCodes.length > 0) {
      payload.disease_codes = diseaseCodes;
    }

    const allergyCodes = userStore.allergy_codes.split(',').map(code => code.trim()).filter(Boolean);
    if (allergyCodes.length > 0) {
      payload.allergy_codes = allergyCodes;
    }
    
    await userStore.updateUserProfile(payload) 

    alert('추가 정보가 성공적으로 저장되었습니다.')
    authStore.setFirstStepCompleted(false) // 추가 정보 입력 완료 플래그 해제
    router.push('/') // 정보 저장 후 홈으로 이동
  } catch (error) {
    console.error('추가 정보 저장 실패:', error)
    alert('추가 정보 저장에 실패했습니다. 다시 시도해주세요.')
  }
}
</script>

<style scoped>
</style>