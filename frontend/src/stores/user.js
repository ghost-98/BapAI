import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '../api'; // Assuming apiClient is correctly configured

export const useUserStore = defineStore('user', () => {
  // State - Using camelCase convention
  const email = ref(null);
  const name = ref(null);
  const nickname = ref(null);
  const gender = ref(null);
  const birthYear = ref(null);
  const height = ref(null);
  const weight = ref(null);
  const dietGoal = ref(null);
  const activityLevel = ref(null);
  const diseaseIds = ref([]);
  const allergyIds = ref([]);
  const isLoading = ref(false);

  // Getters
  const genderText = computed(() => {
    const genderMap = { M: '남성', F: '여성' };
    return genderMap[gender.value] || '미입력';
  });

  const dietGoalText = computed(() => {
    const dietGoalMap = { LOSS: '체중 감량', MAINTAIN: '체중 유지', GAIN: '체중 증량' };
    return dietGoalMap[dietGoal.value] || '미입력';
  });

  const activityLevelText = computed(() => {
    const activityLevelMap = { LOW: '낮음', NORMAL: '보통', HIGH: '높음' };
    return activityLevelMap[activityLevel.value] || '미입력';
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
      birthYear.value = userData.birthYear; // Changed
      height.value = userData.height;
      weight.value = userData.weight;
      dietGoal.value = userData.dietGoal; // Changed
      activityLevel.value = userData.activityLevel; // Changed
      diseaseIds.value = userData.diseaseIds || [];
      allergyIds.value = userData.allergyIds || [];
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
    birthYear.value = null; // Changed
    height.value = null;
    weight.value = null;
    dietGoal.value = null; // Changed
    activityLevel.value = null; // Changed
    diseaseIds.value = [];
    allergyIds.value = [];
  };

  return {
    email,
    name,
    nickname,
    gender,
    birthYear, // Changed
    height,
    weight,
    dietGoal, // Changed
    activityLevel, // Changed
    diseaseIds,
    allergyIds,
    isLoading,
    genderText,
    dietGoalText,
    activityLevelText,
    fetchUserProfile,
    updateUserProfile,
    clearUserProfile,
  };
});

