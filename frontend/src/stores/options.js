import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useOptionsStore = defineStore('options', () => {
  // State
  const diseases = ref([]);
  const allergies = ref([]);

  // Actions
  const setOptions = (diseaseOptions, allergyOptions) => {
    diseases.value = diseaseOptions || [];
    allergies.value = allergyOptions || [];
  };

  return {
    diseases,
    allergies,
    setOptions,
  };
});
