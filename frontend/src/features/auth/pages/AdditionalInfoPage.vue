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
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="gender" class="sr-only">성별</label>
            <select v-model="gender" id="gender" class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm" required>
              <option value="" disabled>성별을 선택하세요</option>
              <option value="M">남성</option>
              <option value="F">여성</option>
            </select>
          </div>
          <div>
            <label for="birthYear" class="sr-only">출생 연도</label>
            <input type="number" v-model="birthYear" id="birthYear" class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm" placeholder="출생 연도 (YYYY)" required />
          </div>
          <div>
            <label for="height" class="sr-only">키 (cm)</label>
            <input type="number" v-model="height" id="height" class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm" placeholder="키 (cm)" required min="1" />
          </div>
          <div>
            <label for="weight" class="sr-only">몸무게 (kg)</label>
            <input type="number" v-model="weight" id="weight" class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm" placeholder="몸무게 (kg)" required min="1" />
          </div>
          <div>
            <label for="dietGoal" class="sr-only">체중 목표</label>
            <select v-model="dietGoal" id="dietGoal" class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm" required>
              <option value="" disabled>체중 목표를 선택하세요</option>
              <option value="LOSS">체중 감량</option>
              <option value="MAINTAIN">체중 유지</option>
              <option value="GAIN">체중 증량</option>
            </select>
          </div>
          <div>
            <label for="activityLevel" class="sr-only">평소활동량</label>
            <select v-model="activityLevel" id="activityLevel" class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm" required>
              <option value="" disabled>평소활동량을 선택하세요</option>
              <option value="LOW">낮음</option>
              <option value="NORMAL">보통</option>
              <option value="HIGH">높음</option>
            </select>
          </div>
          
          <OptionSelector title="보유 질환" :options="optionsStore.diseases" v-model="diseaseIds" />
          <OptionSelector title="알레르기" :options="optionsStore.allergies" v-model="allergyIds" />

        </div>

        <div class="pt-4">
          <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
            정보 저장
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../../stores/user'
import { useAuthStore } from '../../../stores/auth'
import { useOptionsStore } from '../../../stores/options'
import OptionSelector from '../../../components/common/OptionSelector.vue'
import apiClient from '../../../api'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()
const optionsStore = useOptionsStore()

// Local state for form inputs
const gender = ref('');
const birthYear = ref('');
const height = ref('');
const weight = ref('');
const dietGoal = ref('');
const activityLevel = ref('');
const diseaseIds = ref([]);
const allergyIds = ref([]);

onMounted(async () => {
  try {
    const response = await apiClient.get('/members/options');
    optionsStore.setOptions(response.data.diseases, response.data.allergies);
  } catch (error) {
    console.error('질병 및 알레르기 옵션 로딩 실패:', error);
    alert('옵션을 불러오는 데 실패했습니다. 페이지를 새로고침해주세요.');
  }
});

const submitAdditionalInfo = async () => {
  try {
    const payload = {
      gender: gender.value,
      birthYear: Number(birthYear.value),
      height: Number(height.value),
      weight: Number(weight.value),
      dietGoal: dietGoal.value,
      activityLevel: activityLevel.value,
      diseaseIds: diseaseIds.value,
      allergyIds: allergyIds.value,
    }
    
    await userStore.updateUserProfile(payload);

    alert('추가 정보가 성공적으로 저장되었습니다.')
    authStore.setFirstStepCompleted(false)
    router.push('/')
  } catch (error) {
    console.error('추가 정보 저장 실패:', error)
    alert('추가 정보 저장에 실패했습니다. 다시 시도해주세요.')
  }
}
</script>
