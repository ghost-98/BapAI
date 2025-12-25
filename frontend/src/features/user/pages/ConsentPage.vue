<template>
  <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 p-4">
    <DashboardCard class="w-full max-w-3xl p-8 space-y-6">
      <h1 class="text-3xl font-bold text-gray-900 text-center mb-6">건강 정보 수집 및 이용 동의</h1>
      
      <p class="text-gray-700 text-sm leading-relaxed">
        저희 서비스는 사용자에게 맞춤형 건강 관리 및 식단 추천 서비스를 제공하기 위해 다음과 같은 건강 정보를 수집하고 이용합니다. 
        정보통신망법, 개인정보보호법 등 관련 법규에 따라 귀하의 개인정보를 안전하게 보호하고 있습니다.
      </p>

      <div class="space-y-4 text-gray-800">
        <h2 class="text-xl font-semibold text-orange-600">1. 수집 목적</h2>
        <ul class="list-disc list-inside text-sm space-y-1">
          <li>개인 맞춤형 식단 및 운동 추천 서비스 제공</li>
          <li>건강 상태 분석 및 리포트 생성</li>
          <li>서비스 개선 및 신규 서비스 개발</li>
          <li>통계 분석 및 연구 (개인 식별 불가능한 형태로 가공)</li>
        </ul>

        <h2 class="text-xl font-semibold text-orange-600">2. 수집 항목</h2>
        <ul class="list-disc list-inside text-sm space-y-1">
          <li>**개인 식별 정보:** 사용자 ID, 닉네임 (회원가입 시 수집)</li>
          <li>**신체 정보:** 키, 몸무게, 성별, 연령, 활동량 (회원가입 또는 추가 정보 입력 시 수집)</li>
          <li>**건강 관련 정보:** 질병 유무, 알레르기, 식단 선호도, 운동 기록 (서비스 이용 중 입력 시 수집)</li>
          <li>**식단 기록 정보:** 섭취 음식, 칼로리, 영양소 정보, 식사 시간 (서비스 이용 중 입력 시 수집)</li>
        </ul>

        <h2 class="text-xl font-semibold text-orange-600">3. 이용 및 보유 기간</h2>
        <ul class="list-disc list-inside text-sm space-y-1">
          <li>수집된 정보는 서비스 제공 기간 동안 이용 및 보유됩니다.</li>
          <li>회원 탈퇴 시 지체 없이 파기됩니다. 단, 관련 법령에 따라 보존할 필요가 있는 경우 해당 법령에서 정한 기간 동안 보존합니다.</li>
        </ul>

        <h2 class="text-xl font-semibold text-orange-600">4. 동의 거부 시 불이익</h2>
        <p class="text-sm">
          귀하는 건강 정보 수집 및 이용에 대한 동의를 거부할 수 있습니다. 다만, 동의를 거부하실 경우 맞춤형 식단 추천, 건강 분석 리포트 등 서비스의 일부 또는 전부 이용이 제한될 수 있습니다.
        </p>

        <h2 class="text-xl font-semibold text-orange-600">5. 동의 철회</h2>
        <p class="text-sm">
          동의하신 내용은 언제든지 철회할 수 있으며, 철회 방법은 [마이페이지 > 개인정보 설정]을 통해 가능합니다.
        </p>
      </div>

      <div class="flex items-center mt-6">
        <input type="checkbox" id="consentCheckbox" v-model="isAgreed" class="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded">
        <label for="consentCheckbox" class="ml-2 text-base text-gray-900 font-medium">
          건강 정보 수집 및 이용에 동의합니다.
        </label>
      </div>

      <button 
        @click="handleConsent" 
        :disabled="!isAgreed"
        class="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        동의하고 계속하기
      </button>

      <p class="text-xs text-gray-500 text-center mt-4">
        본 동의 내용은 법률 전문가의 검토를 거쳐야 합니다. 위 내용은 예시이며, 실제 서비스에 맞게 수정해야 합니다.
      </p>
    </DashboardCard>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import DashboardCard from '@/components/common/DashboardCard.vue';
import { useAuthStore } from '@/stores/auth'; // Import auth store
// import apiClient from '@/api'; // 백엔드 API 연동 시 필요

const router = useRouter();
const authStore = useAuthStore(); // Instantiate auth store
const isAgreed = ref(false);

const handleConsent = async () => {
  if (isAgreed.value) {
    // TODO: 여기에 백엔드 API를 호출하여 사용자 동의 상태를 저장하는 로직을 추가합니다.
    // 예: await apiClient.post('/user/consent', { userId: authStore.userId, agreed: true });
    console.log('사용자가 건강 정보 수집 및 이용에 동의했습니다.');
    alert('동의가 완료되었습니다. 서비스 이용을 시작합니다.');
    authStore.setHasGivenConsent(true); // Set consent status in store
    router.push('/additional-info'); // 동의 후 추가 정보 입력 페이지로 이동
  } else {
    alert('건강 정보 수집 및 이용에 동의해야 서비스를 이용할 수 있습니다.');
  }
};
</script>

<style scoped>
/* 추가적인 스타일이 필요하면 여기에 작성 */
</style>
