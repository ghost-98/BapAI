<template>
  <main class="mx-auto max-w-7xl px-6 py-12">
    <!-- 페이지 헤더 -->
    <div class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50 mb-8">
      <h1 class="text-4xl font-bold text-gray-900">내 정보 관리</h1>
      <p class="mt-2 text-lg text-gray-600">개인 정보를 확인하고 관리할 수 있습니다.</p>
    </div>

    <div v-if="isLoading" class="text-center bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
      <p class="text-gray-600">사용자 정보를 불러오는 중...</p>
    </div>

    <form v-else @submit.prevent="handleUpdateProfile" class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50 space-y-6">
      <div class="space-y-6">
        <!-- 기본 정보 -->
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
            <p v-if="!isEditMode" class="text-gray-900 font-medium">{{ name }}</p>
            <div v-else class="w-full">
              <input v-model="editableUser.name" type="text" required class="form-input" />
            </div>
          </div>
          
          <div class="flex items-baseline">
            <p class="text-sm font-semibold text-gray-600 w-28 flex-shrink-0">성별</p>
            <p v-if="!isEditMode" class="text-gray-900 font-medium">{{ genderText }}</p>
            <div v-else class="w-full">
              <select v-model="editableUser.gender" class="form-input">
                <option value="M">남성</option>
                <option value="F">여성</option>
              </select>
            </div>
          </div>

          <div class="flex items-baseline">
            <p class="text-sm font-semibold text-gray-600 w-28 flex-shrink-0">출생 연도</p>
            <p v-if="!isEditMode" class="text-gray-900 font-medium">{{ birthYear || '미입력' }}</p>
            <div v-else class="w-full">
              <input v-model="editableUser.birthYear" type="number" class="form-input" placeholder="YYYY" />
            </div>
          </div>
        </div>

        <!-- 건강 정보 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 border-b border-gray-200/80 pb-6">
          <div class="flex items-baseline">
            <p class="text-sm font-semibold text-gray-600 w-28 flex-shrink-0">키</p>
            <p v-if="!isEditMode" class="text-gray-900 font-medium">{{ height ? `${height} cm` : '미입력' }}</p>
            <div v-else class="w-full">
              <input type="number" v-model="editableUser.height" class="form-input" placeholder="cm" required min="1" />
            </div>
          </div>

          <div class="flex items-baseline">
            <p class="text-sm font-semibold text-gray-600 w-28 flex-shrink-0">몸무게</p>
            <p v-if="!isEditMode" class="text-gray-900 font-medium">{{ weight ? `${weight} kg` : '미입력' }}</p>
            <div v-else class="w-full">
               <input type="number" v-model="editableUser.weight" class="form-input" placeholder="kg" required min="1" />
            </div>
          </div>

          <div class="flex items-baseline">
            <p class="text-sm font-semibold text-gray-600 w-28 flex-shrink-0">체중 목표</p>
            <p v-if="!isEditMode" class="text-gray-900 font-medium">{{ dietGoalText }}</p>
            <div v-else class="w-full">
              <select v-model="editableUser.dietGoal" class="form-input">
                <option value="LOSS">체중 감량</option>
                <option value="MAINTAIN">체중 유지</option>
                <option value="GAIN">체중 증량</option>
              </select>
            </div>
          </div>

          <div class="flex items-baseline">
            <p class="text-sm font-semibold text-gray-600 w-28 flex-shrink-0">평소활동량</p>
            <p v-if="!isEditMode" class="text-gray-900 font-medium">{{ activityLevelText }}</p>
            <div v-else class="w-full">
              <select v-model="editableUser.activityLevel" class="form-input">
                <option value="LOW">낮음</option>
                <option value="NORMAL">보통</option>
                <option value="HIGH">높음</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 질환 및 알레르기 정보 -->
        <div class="space-y-4">
          <template v-if="!isEditMode">
            <div>
              <p class="text-sm font-semibold text-gray-600 mb-2">보유 질환</p>
              <div class="text-gray-800 bg-gray-50/50 p-4 rounded-lg text-sm min-h-[4rem]">
                {{ diseaseNames.length ? diseaseNames.join(', ') : '없음' }}
              </div>
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-600 mb-2">알레르기</p>
              <div class="text-gray-800 bg-gray-50/50 p-4 rounded-lg text-sm min-h-[4rem]">
                {{ allergyNames.length ? allergyNames.join(', ') : '없음' }}
              </div>
            </div>
          </template>
          <template v-else>
            <OptionSelector title="보유 질환" :options="optionsStore.diseases" v-model="editableUser.diseaseIds" />
            <OptionSelector title="알레르기" :options="optionsStore.allergies" v-model="editableUser.allergyIds" />
          </template>
        </div>

        <!-- 버튼 영역 -->
        <div class="pt-6 flex flex-wrap gap-4">
          <template v-if="!isEditMode">
            <button @click.prevent="startEditMode" class="px-6 py-3 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600 transition-all font-semibold">내 정보 수정</button>
            <button @click.prevent="goToChangePassword" class="px-6 py-3 bg-amber-500 text-white rounded-lg shadow hover:bg-amber-600 transition-all font-semibold">비밀번호 변경</button>
            <button @click.prevent="handleDeleteAccount" class="px-6 py-3 bg-rose-600 text-white rounded-lg shadow hover:bg-rose-700 transition-all font-semibold">회원 탈퇴</button>
          </template>
          <template v-else>
            <button type="submit" class="px-6 py-3 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition-all font-semibold">저장</button>
            <button @click.prevent="cancelEditMode" class="px-6 py-3 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600 transition-all font-semibold">취소</button>
          </template>
        </div>
      </div>
    </form>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import apiClient from '../../../api';
import { useUserStore } from '../../../stores/user';
import { useAuthStore } from '../../../stores/auth';
import { useOptionsStore } from '../../../stores/options';
import OptionSelector from '../../../components/common/OptionSelector.vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const authStore = useAuthStore();
const optionsStore = useOptionsStore();

const { 
  email, name, nickname, gender, birthYear, height, weight, 
  dietGoal, activityLevel, diseaseIds, allergyIds, isLoading,
  genderText, dietGoalText, activityLevelText 
} = storeToRefs(userStore);

const isEditMode = ref(false);
const editableUser = reactive({});

const diseaseNames = computed(() => {
  if (!diseaseIds.value || !optionsStore.diseases.length) return [];
  const diseaseMap = new Map(optionsStore.diseases.map(d => [d.id, d.name]));
  return diseaseIds.value.map(id => diseaseMap.get(id)).filter(Boolean);
});

const allergyNames = computed(() => {
  if (!allergyIds.value || !optionsStore.allergies.length) return [];
  const allergyMap = new Map(optionsStore.allergies.map(a => [a.id, a.name]));
  return allergyIds.value.map(id => allergyMap.get(id)).filter(Boolean);
});

const resetEditableUser = () => {
  Object.assign(editableUser, {
    name: name.value,
    gender: gender.value,
    birthYear: birthYear.value,
    height: height.value,
    weight: weight.value,
    dietGoal: dietGoal.value,
    activityLevel: activityLevel.value,
    diseaseIds: [...diseaseIds.value],
    allergyIds: [...allergyIds.value],
  });
};

const startEditMode = () => {
  const isReauthenticated = sessionStorage.getItem('isReauthenticated');
  if (isReauthenticated !== 'true') {
    alert('보안을 위해 비밀번호를 다시 확인해야 합니다.');
    router.replace({ path: '/confirm-password', query: { redirect: '/my-info?edit=true' } });
    return;
  }
  sessionStorage.removeItem('isReauthenticated');
  resetEditableUser();
  isEditMode.value = true;
};

const cancelEditMode = () => {
  isEditMode.value = false;
};

const handleUpdateProfile = async () => {
  try {
    const payload = { ...editableUser };
    await userStore.updateUserProfile(payload);
    alert('회원 정보가 성공적으로 수정되었습니다.');
    isEditMode.value = false;
  } catch (error) {
    console.error('회원 정보 수정 실패:', error);
    alert('회원 정보 수정에 실패했습니다. 다시 시도해주세요.');
  }
};

onMounted(async () => {
  try {
    const optionsPromise = apiClient.get('/members/options').then(res => {
      optionsStore.setOptions(res.data.diseases, res.data.allergies);
    });
    const userProfilePromise = userStore.fetchUserProfile();
    
    await Promise.all([optionsPromise, userProfilePromise]);

    if (route.query.edit === 'true' && sessionStorage.getItem('isReauthenticated') === 'true') {
      startEditMode();
    }
  } catch (error) {
    console.error('사용자 정보 또는 옵션 로딩 실패:', error);
    alert('사용자 정보를 불러오는 데 실패했습니다.');
    router.push('/login');
  }
});

const goToChangePassword = () => router.push('/change-password');

const handleDeleteAccount = async () => {
  if (window.confirm('정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
    try {
      await apiClient.delete('/members/me');
      authStore.clearAuth();
      userStore.clearUserProfile();
      alert('회원 탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.');
      router.push('/login');
    } catch (error) {
      console.error('회원 탈퇴 실패:', error);
      alert('회원 탈퇴 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  }
};
</script>

<style>
.form-input {
  @apply w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50 text-gray-800 text-base;
}
</style>
