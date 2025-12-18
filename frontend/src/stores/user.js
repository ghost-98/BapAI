import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '../api'; // Assuming apiClient is correctly configured

export const useUserStore = defineStore('user', () => {
  // State
  const email = ref(null);
  const name = ref(null);
  const nickname = ref(null);
  const gender = ref(null);
  const birth_year = ref(null);
  const height = ref(null);
  const weight = ref(null);
  const diet_goal = ref(null);
  const activity_level = ref(null);
  const disease_codes = ref([]);
  const allergy_codes = ref([]);
  const isLoading = ref(false);

  // Getters
  const genderText = computed(() => {
    const genderMap = { M: '남성', F: '여성' };
    return genderMap[gender.value] || '미입력';
  });

  const dietGoalText = computed(() => {
    const dietGoalMap = { LOSS: '체중 감량', MAINTAIN: '체중 유지', GAIN: '체중 증량' };
    return dietGoalMap[diet_goal.value] || '미입력';
  });

  const activityLevelText = computed(() => {
    const activityLevelMap = { LOW: '낮음', NORMAL: '보통', HIGH: '높음' };
    return activityLevelMap[activity_level.value] || '미입력';
  });

  // Actions
  const fetchUserProfile = async () => {
    isLoading.value = true;
    try {
      const response = await apiClient.get('/members/me');
      const userData = response.data;
      email.value = userData.email;
      name.value = userData.name;
      nickname.value = userData.nickname;
      gender.value = userData.gender;
      birth_year.value = userData.birth_year;
      height.value = userData.height;
      weight.value = userData.weight;
      diet_goal.value = userData.diet_goal;
      activity_level.value = userData.activity_level;
      disease_codes.value = userData.disease_codes || [];
      allergy_codes.value = userData.allergy_codes || [];
      return userData;
    } catch (error) {
      console.error('사용자 프로필 불러오기 실패:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const updateUserProfile = async (payload) => {
    isLoading.value = true;
    try {
      await apiClient.patch('/members/me', payload);
      // Optionally refetch or update local state based on payload
      await fetchUserProfile(); // Re-fetch to ensure state is up-to-date
    } catch (error) {
      console.error('사용자 프로필 업데이트 실패:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const clearUserProfile = () => {
    email.value = null;
    name.value = null;
    nickname.value = null;
    gender.value = null;
    birth_year.value = null;
    height.value = null;
    weight.value = null;
    diet_goal.value = null;
    activity_level.value = null;
    disease_codes.value = [];
    allergy_codes.value = [];
  };

  return {
    email,
    name,
    nickname,
    gender,
    birth_year,
    height,
    weight,
    diet_goal,
    activity_level,
    disease_codes,
    allergy_codes,
    isLoading,
    genderText,
    dietGoalText,
    activityLevelText,
    fetchUserProfile,
    updateUserProfile,
    clearUserProfile,
  };
});
