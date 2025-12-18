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
  const diseaseIds = ref([]); // Changed from disease_codes
  const allergyIds = ref([]); // Changed from allergy_codes
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
      diseaseIds.value = userData.diseaseIds || []; // Changed
      allergyIds.value = userData.allergyIds || []; // Changed
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
      // Re-fetch to ensure state is up-to-date
      await fetchUserProfile();
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
    diseaseIds.value = []; // Changed
    allergyIds.value = []; // Changed
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
    diseaseIds, // Changed
    allergyIds, // Changed
    isLoading,
    genderText,
    dietGoalText,
    activityLevelText,
    fetchUserProfile,
    updateUserProfile,
    clearUserProfile,
  };
});
