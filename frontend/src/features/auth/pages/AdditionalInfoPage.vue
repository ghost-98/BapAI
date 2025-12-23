<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Organic blob shapes -->
    <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-orange-300/30 to-rose-300/30 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-amber-300/30 to-orange-300/30 rounded-full blur-3xl"></div>
    
    <div class="w-full max-w-2xl relative z-10">
      <div class="bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50">
        <div class="space-y-6">
          <div class="text-center space-y-2">
            <h2 class="text-3xl font-bold text-gray-900">추가 정보 입력</h2>
            <p class="text-gray-600">정확한 AI 추천을 위해 추가 정보를 입력해주세요.</p>
          </div>

          <form @submit.prevent="submitAdditionalInfo" class="mt-8 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Left Column -->
              <div class="space-y-6">
                <div>
                  <label for="gender" class="block text-sm font-semibold text-gray-700 mb-2">성별</label>
                  <select v-model="gender" id="gender" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50" required>
                    <option value="" disabled>성별을 선택하세요</option>
                    <option value="M">남성</option>
                    <option value="F">여성</option>
                  </select>
                </div>
                <div>
                  <label for="height" class="block text-sm font-semibold text-gray-700 mb-2">키 (cm)</label>
                  <input type="number" v-model="height" id="height" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50" placeholder="키 (cm)" required min="1" />
                </div>
                <div>
                  <label for="dietGoal" class="block text-sm font-semibold text-gray-700 mb-2">체중 목표</label>
                  <select v-model="dietGoal" id="dietGoal" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50" required>
                    <option value="" disabled>체중 목표를 선택하세요</option>
                    <option value="LOSS">체중 감량</option>
                    <option value="MAINTAIN">체중 유지</option>
                    <option value="GAIN">체중 증량</option>
                  </select>
                </div>
                 <OptionSelector title="보유 질환" :options="optionsStore.diseases" v-model="diseaseIds" />
              </div>
              
              <!-- Right Column -->
              <div class="space-y-6">
                <div>
                  <label for="birthYear" class="block text-sm font-semibold text-gray-700 mb-2">출생 연도</label>
                  <input type="number" v-model="birthYear" id="birthYear" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50" placeholder="출생 연도 (YYYY)" required />
                </div>
                <div>
                  <label for="weight" class="block text-sm font-semibold text-gray-700 mb-2">몸무게 (kg)</label>
                  <input type="number" v-model="weight" id="weight" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50" placeholder="몸무게 (kg)" required min="1" />
                </div>
                <div>
                  <label for="activityLevel" class="block text-sm font-semibold text-gray-700 mb-2">평소 활동량</label>
                  <select v-model="activityLevel" id="activityLevel" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50" required>
                    <option value="" disabled>평소 활동량을 선택하세요</option>
                    <option value="LOW">낮음</option>
                    <option value="NORMAL">보통</option>
                    <option value="HIGH">높음</option>
                  </select>
                </div>
                <OptionSelector title="알레르기" :options="optionsStore.allergies" v-model="allergyIds" />
              </div>
            </div>

            <div class="pt-6">
              <button type="submit" class="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-lg hover:from-orange-600 hover:to-rose-600 transition-all transform hover:scale-[1.02] shadow-lg">
                정보 저장하고 시작하기
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../../stores/user';
import { useAuthStore } from '../../../stores/auth';
import { useOptionsStore } from '../../../stores/options';
import { useNotificationStore } from '../../../stores/notification';
import OptionSelector from '../../../components/common/OptionSelector.vue';
import apiClient from '../../../api';

const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();
const optionsStore = useOptionsStore();
const notificationStore = useNotificationStore();

const gender = ref('');
const birthYear = ref('');
const height = ref('');
const weight = ref('');
const dietGoal = ref('');
const activityLevel = ref('');
const diseaseIds = ref([]);
const allergyIds = ref([]);

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    notificationStore.showNotification('로그인이 필요한 페이지입니다.', 'warning');
    router.push('/login');
    return;
  }

  try {
    const response = await apiClient.get('/members/options');
    optionsStore.setOptions(response.data.diseases, response.data.allergies);
  } catch (error) {
    console.error('질병 및 알레르기 옵션 로딩 실패:', error);
    notificationStore.showNotification('옵션을 불러오는 데 실패했습니다. 페이지를 새로고침해주세요.', 'error');
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
    };
    
    await userStore.updateUserProfile(payload);

    notificationStore.showNotification('추가 정보가 성공적으로 저장되었습니다.', 'success');
    authStore.setFirstStepCompleted(false);
    router.push('/');
  } catch (error) {
    console.error('추가 정보 저장 실패:', error);
    notificationStore.showNotification(error.response?.data?.message || '추가 정보 저장에 실패했습니다.', 'error');
  }
};
</script>
