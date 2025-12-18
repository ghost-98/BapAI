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
                <input v-model="formData.name" id="name" type="text" required class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800" placeholder="이름" />
              </div>
              <!-- 닉네임 -->
              <div>
                <label for="nickname" class="block text-sm font-semibold text-gray-700 mb-2">닉네임</label>
                <input
                  v-model="formData.nickname"
                  @input="onNicknameInput"
                  @blur="checkNickname"
                  id="nickname"
                  type="text"
                  required
                  class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800"
                  placeholder="닉네임"
                />
                <p v-if="nicknameMessage" :class="['mt-1 text-sm', nicknameStatus === 'available' ? 'text-green-600' : 'text-red-600']">
                  {{ nicknameMessage }}
                </p>
              </div>
              <!-- 성별 -->
              <div>
                <label for="gender" class="block text-sm font-semibold text-gray-700 mb-2">성별</label>
                <select v-model="formData.gender" id="gender" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800">
                  <option value="">성별을 선택하세요</option>
                  <option value="M">남성</option>
                  <option value="F">여성</option>
                </select>
              </div>
              <!-- 출생 연도 -->
              <div>
                <label for="birth_year" class="block text-sm font-semibold text-gray-700 mb-2">출생 연도</label>
                <input v-model="formData.birth_year" id="birth_year" type="number" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800" placeholder="출생 연도 (YYYY)" />
              </div>
              <!-- 키 -->
              <div>
                <label for="height" class="block text-sm font-semibold text-gray-700 mb-2">키 (cm)</label>
                <input type="number" v-model="formData.height" id="height" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800" placeholder="키 (cm)" required min="1" />
              </div>
              <!-- 몸무게 -->
              <div>
                <label for="weight" class="block text-sm font-semibold text-gray-700 mb-2">몸무게 (kg)</label>
                <input type="number" v-model="formData.weight" id="weight" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800" placeholder="몸무게 (kg)" required min="1" />
              </div>
              <!-- 체중 목표 -->
              <div class="md:col-span-2">
                <label for="diet_goal" class="block text-sm font-semibold text-gray-700 mb-2">체중 목표</label>
                <select v-model="formData.diet_goal" id="diet_goal" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800">
                  <option value="" disabled>체중 목표를 선택하세요</option>
                  <option value="LOSS">체중 감량</option>
                  <option value="MAINTAIN">체중 유지</option>
                  <option value="GAIN">체중 증량</option>
                </select>
              </div>
              <!-- 평소활동량 -->
              <div class="md:col-span-2">
                <label for="activity_level" class="block text-sm font-semibold text-gray-700 mb-2">평소활동량</label>
                <select v-model="formData.activity_level" id="activity_level" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800">
                  <option value="" disabled>평소활동량을 선택하세요</option>
                  <option value="LOW">낮음</option>
                  <option value="NORMAL">보통</option>
                  <option value="HIGH">높음</option>
                </select>
              </div>
            </div>

            <OptionSelector title="보유 질환" :options="optionsStore.diseases" v-model="formData.diseaseIds" />
            <OptionSelector title="알레르기" :options="optionsStore.allergies" v-model="formData.allergyIds" />

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
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../../stores/user'
import { useOptionsStore } from '../../../stores/options'
import OptionSelector from '../../../components/common/OptionSelector.vue'
import apiClient from '../../../api'

const router = useRouter()
const userStore = useUserStore()
const optionsStore = useOptionsStore()

const formData = reactive({
  name: '',
  nickname: '',
  gender: '',
  birth_year: null,
  height: null,
  weight: null,
  diet_goal: '',
  activity_level: '',
  diseaseIds: [],
  allergyIds: [],
});

const originalNickname = ref('');
const nicknameStatus = ref(''); // '', 'checking', 'available', 'taken', 'available_self'
const nicknameMessage = ref('');

onMounted(async () => {
  const isReauthenticated = sessionStorage.getItem('isReauthenticated');
  if (isReauthenticated !== 'true') {
    alert('보안을 위해 비밀번호를 다시 확인해야 합니다.');
    router.replace({ path: '/confirm-password', query: { redirect: '/edit-profile' } });
    return;
  }
  sessionStorage.removeItem('isReauthenticated');

  try {
    const optionsPromise = apiClient.get('/members/options');
    const userProfilePromise = userStore.fetchUserProfile();

    const [optionsResponse] = await Promise.all([optionsPromise, userProfilePromise]);
    
    optionsStore.setOptions(optionsResponse.data.diseases, optionsResponse.data.allergies);

    // Populate form data from user store
    formData.name = userStore.name;
    formData.nickname = userStore.nickname;
    originalNickname.value = userStore.nickname;
    formData.gender = userStore.gender;
    formData.birth_year = userStore.birth_year;
    formData.height = userStore.height;
    formData.weight = userStore.weight;
    formData.diet_goal = userStore.diet_goal;
    formData.activity_level = userStore.activity_level;
    formData.diseaseIds = [...userStore.diseaseIds];
    formData.allergyIds = [...userStore.allergyIds];

  } catch (error) {
    console.error('사용자 정보 또는 옵션 로딩 실패:', error);
    alert('페이지를 로드하는 데 실패했습니다.');
    router.push('/my-info');
  }
});

const onNicknameInput = () => {
  // Reset status if user changes nickname
  if (formData.nickname !== originalNickname.value) {
    nicknameStatus.value = '';
    nicknameMessage.value = '';
  }
};

const checkNickname = async () => {
  if (!formData.nickname) {
    nicknameStatus.value = '';
    nicknameMessage.value = '닉네임을 입력해주세요.';
    return;
  }
  if (formData.nickname === originalNickname.value) {
    nicknameStatus.value = 'available_self';
    nicknameMessage.value = '';
    return;
  }

  nicknameStatus.value = 'checking';
  nicknameMessage.value = '닉네임 중복을 확인 중입니다...';
  try {
    await apiClient.get('/auth/check-nickname', { params: { nickname: formData.nickname } });
    nicknameStatus.value = 'available';
    nicknameMessage.value = '사용 가능한 닉네임입니다.';
  } catch (error) {
    if (error.response && error.response.status === 409) {
      nicknameStatus.value = 'taken';
      nicknameMessage.value = '이미 사용 중인 닉네임입니다.';
    } else {
      nicknameStatus.value = 'error';
      nicknameMessage.value = '확인 중 에러가 발생했습니다.';
    }
  }
};

const handleUpdateProfile = async () => {
  // Nickname validation
  if (formData.nickname !== originalNickname.value && nicknameStatus.value !== 'available') {
    alert('닉네임이 변경되었습니다. 중복 확인을 완료해주세요.');
    return;
  }

  try {
    // Create payload with only the changed fields
    const payload = {};
    for (const key in formData) {
      if (key === 'nickname') continue; // Skip nickname for now
      
      if (Array.isArray(formData[key])) {
        if (JSON.stringify(formData[key]) !== JSON.stringify(userStore[key])) {
          payload[key] = formData[key];
        }
      } else if (formData[key] !== userStore[key]) {
        payload[key] = formData[key];
      }
    }
    
    if (formData.nickname !== originalNickname.value) {
        payload.nickname = formData.nickname;
    }

    if (Object.keys(payload).length === 0) {
      alert('수정된 내용이 없습니다.');
      return;
    }

    await apiClient.patch('/members/me', payload);
    
    await userStore.fetchUserProfile();

    alert('회원 정보가 성공적으로 수정되었습니다.');
    router.push('/my-info');
  } catch (error) {
    console.error('회원 정보 수정 실패:', error);
    alert('회원 정보 수정에 실패했습니다. 다시 시도해주세요.');
  }
};
</script>
