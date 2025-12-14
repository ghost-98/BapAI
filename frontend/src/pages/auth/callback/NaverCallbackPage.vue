<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="text-center">
      <h1 class="text-2xl font-semibold text-gray-800 mb-4">네이버 로그인 처리 중...</h1>
      <p class="text-gray-600">잠시만 기다려주세요.</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '../../../api'; // 경로 수정

const route = useRoute();
const router = useRouter();

onMounted(async () => {
  const { code, state } = route.query;
  const storedState = sessionStorage.getItem('naver_state');

  // CSRF 공격 방지를 위해 state 값 비교
  if (!state || state !== storedState) {
    alert('잘못된 접근입니다.');
    router.replace('/login');
    return;
  }

  // 사용 후 state 값 제거
  sessionStorage.removeItem('naver_state');

  if (!code) {
    alert('로그인에 실패했습니다. (인증 코드 없음)');
    router.replace('/login');
    return;
  }

  try {
    // 백엔드에 인증 코드를 보내고 자체 토큰을 받아옵니다.
    // 백엔드 API 엔드포인트는 '/auth/social/callback'이고, provider로 'naver'를 전달합니다.
    const response = await apiClient.post('/auth/naver', {
      code,
      provider: 'naver'
    });

    const { accessToken, refreshToken, requiresAdditionalInfo, isTempPassword } = response.data;

    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      if (requiresAdditionalInfo) {
        alert('소셜 회원가입에 성공했습니다! 추가 정보 입력 페이지로 이동합니다.');
        sessionStorage.setItem('firstStepCompleted', 'true');
        router.replace('/additional-info');
      } else if (isTempPassword) {
        sessionStorage.setItem('isTempPasswordLogin', 'true');
        alert('소셜 로그인에 성공했습니다! 임시 비밀번호로 로그인되었습니다. 비밀번호 변경 페이지로 이동합니다.');
        router.replace('/change-password');
      } else {
        alert('네이버 로그인에 성공했습니다!');
        router.replace('/');
      }
    } else {
      throw new Error('서버로부터 토큰을 받지 못했습니다.');
    }
  } catch (error) {
    console.error('네이버 로그인 처리 실패:', error.response ? error.response.data : error.message);
    alert('로그인에 실패했습니다. 문제가 지속되면 관리자에게 문의하세요.');
    router.replace('/login');
  }
});
</script>
