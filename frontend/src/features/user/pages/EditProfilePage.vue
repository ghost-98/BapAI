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
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- 이름 -->
              <div>
                <label for="name" class="block text-sm font-semibold text-gray-700 mb-2">이름</label>
                <input v-model="userStore.name" id="name" type="text" required class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800" placeholder="이름" />
              </div>
              <!-- 닉네임 -->
              <div>
                <label for="nickname" class="block text-sm font-semibold text-gray-700 mb-2">닉네임</label>
                <input v-model="userStore.nickname" id="nickname" type="text" disabled class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-100 text-gray-500 focus:outline-none transition-colors" placeholder="닉네임" />
              </div>
              <!-- 성별 -->
              <div>
                <label for="gender" class="block text-sm font-semibold text-gray-700 mb-2">성별</label>
                <select v-model="userStore.gender" id="gender" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800">
                  <option value="">성별을 선택하세요</option>
                  <option value="M">남성</option>
                  <option value="F">여성</option>
                </select>
              </div>
              <!-- 출생 연도 -->
              <div>
                <label for="birth_year" class="block text-sm font-semibold text-gray-700 mb-2">출생 연도</label>
                <input v-model="userStore.birth_year" id="birth_year" type="number" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800" placeholder="출생 연도 (YYYY)" />
              </div>
              <!-- 키 -->
              <div>
                <label for="height" class="block text-sm font-semibold text-gray-700 mb-2">키 (cm)</label>
                <input type="number" v-model="userStore.height" id="height" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800" placeholder="키 (cm)" required min="1" />
              </div>
              <!-- 몸무게 -->
              <div>
                <label for="weight" class="block text-sm font-semibold text-gray-700 mb-2">몸무게 (kg)</label>
                <input type="number" v-model="userStore.weight" id="weight" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800" placeholder="몸무게 (kg)" required min="1" />
              </div>
              <!-- 체중 목표 -->
              <div class="md:col-span-2">
                <label for="diet_goal" class="block text-sm font-semibold text-gray-700 mb-2">체중 목표</label>
                <select v-model="userStore.diet_goal" id="diet_goal" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800" required>
                  <option value="" disabled>체중 목표를 선택하세요</option>
                  <option value="LOSS">체중 감량</option>
                  <option value="MAINTAIN">체중 유지</option>
                  <option value="GAIN">체중 증량</option>
                </select>
              </div>
              <!-- 평소활동량 -->
              <div class="md:col-span-2">
                <label for="activity_level" class="block text-sm font-semibold text-gray-700 mb-2">평소활동량</label>
                <select v-model="userStore.activity_level" id="activity_level" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800" required>
                  <option value="" disabled>평소활동량을 선택하세요</option>
                  <option value="LOW">낮음</option>
                  <option value="NORMAL">보통</option>
                  <option value="HIGH">높음</option>
                </select>
              </div>
            </div>

            <OptionSelector title="보유 질환" :options="optionsStore.diseases" v-model="userStore.diseaseIds" />
            <OptionSelector title="알레르기" :options="optionsStore.allergies" v-model="userStore.allergyIds" />

            <div class="pt-4">
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
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../../stores/user'
import { useOptionsStore } from '../../../stores/options'
import OptionSelector from '../../../components/common/OptionSelector.vue'
import apiClient from '../../../api'

const router = useRouter()
const userStore = useUserStore()
const optionsStore = useOptionsStore()

onMounted(async () => {
  const isReauthenticated = sessionStorage.getItem('isReauthenticated');
  if (isReauthenticated !== 'true') {
    alert('보안을 위해 비밀번호를 다시 확인해야 합니다.');
    router.replace({ path: '/confirm-password', query: { redirect: '/edit-profile' } });
    return;
  }
  // Consume the reauthentication flag immediately after check
  sessionStorage.removeItem('isReauthenticated');

  try {
    const optionsPromise = apiClient.get('/members/options');
    const userProfilePromise = userStore.fetchUserProfile();

    const [optionsResponse] = await Promise.all([optionsPromise, userProfilePromise]);
    
    optionsStore.setOptions(optionsResponse.data.diseases, optionsResponse.data.allergies);

  } catch (error) {
    console.error('사용자 정보 또는 옵션 로딩 실패:', error);
    alert('페이지를 로드하는 데 실패했습니다.');
    router.push('/my-info');
  }
});

const handleUpdateProfile = async () => {
  try {
    const payload = {
      name: userStore.name,
      gender: userStore.gender,
      birth_year: Number(userStore.birth_year),
      height: Number(userStore.height),
      weight: Number(userStore.weight),
      diet_goal: userStore.diet_goal,
      activity_level: userStore.activity_level,
      diseaseIds: userStore.diseaseIds,
      allergyIds: userStore.allergyIds,
    };

    await apiClient.patch('/members/me', payload);
    
    // After successful submission, re-fetch user profile to update the store
    await userStore.fetchUserProfile();

    alert('회원 정보가 성공적으로 수정되었습니다.');
    router.push('/my-info');
  } catch (error) {
    console.error('회원 정보 수정 실패:', error);
    alert('회원 정보 수정에 실패했습니다. 다시 시도해주세요.');
  }
};
</script>
