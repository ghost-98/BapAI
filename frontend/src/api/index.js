import axios from 'axios'
import router from '../router' // 라우터 import
import { useAuthStore } from '../stores/auth' // Pinia auth store 임포트
import { useNotificationStore } from '../stores/notification' // Pinia notification store 임포트

// JSON용 Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420' // ngrok으로 서버 띄울때만
  }
})

// Multipart/form-data용 Axios 인스턴스 생성
export const apiClientForMultipart = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000, // 파일 업로드를 위해 타임아웃 시간 연장
  headers: {
    'Content-Type': 'multipart/form-data',
    'ngrok-skip-browser-warning': '69420'
  }
});

// 요청 인터셉터 (두 클라이언트에 모두 적용)
const requestInterceptor = (config) => {
  const authStore = useAuthStore();
  if (authStore.accessToken) {
    config.headers['Authorization'] = `Bearer ${authStore.accessToken}`
  }
  return config
};

apiClient.interceptors.request.use(requestInterceptor);
apiClientForMultipart.interceptors.request.use(requestInterceptor);


// 응답 인터셉터 (두 클라이언트에 모두 적용)
const responseInterceptor = async (error) => {
  const originalRequest = error.config
  const authStore = useAuthStore();
  const notificationStore = useNotificationStore();
  
  if (error.response && error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true

    try {
      const refreshToken = authStore.refreshToken
      if (!refreshToken) throw new Error('리프레시 토큰이 없습니다.')

      const response = await axios.post(import.meta.env.VITE_API_BASE_URL + '/auth/refresh', { refreshToken })
      
      const newAccessToken = response.data.access
      const newRefreshToken = response.data.refresh
      
      authStore.setTokens(newAccessToken, newRefreshToken, true);

      originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
      
      // 원래 요청을 다시 시도 (원래 사용했던 클라이언트로)
      if (originalRequest.headers['Content-Type'] === 'multipart/form-data') {
        return apiClientForMultipart(originalRequest)
      }
      return apiClient(originalRequest)

    } catch (refreshError) {
      console.error('토큰 재발급 실패:', refreshError)
      authStore.clearAuth();
      
      router.push('/login').then(() => {
        notificationStore.showNotification('세션이 만료되었습니다. 다시 로그인해주세요.', 'error');
      })

      return Promise.reject(refreshError)
    }
  }
  
  if (error.response && error.response.data && error.response.data.message) {
    notificationStore.showNotification(error.response.data.message, 'error');
  } else if (error.message) {
    notificationStore.showNotification('네트워크 오류가 발생했습니다: ' + error.message, 'error');
  }

  return Promise.reject(error)
};

apiClient.interceptors.response.use((response) => response, responseInterceptor);
apiClientForMultipart.interceptors.response.use((response) => response, responseInterceptor);


export const foodSearch = async (query) => {
  try {
    const response = await apiClient.get(`/food/search`, { params: { query } });
    return response.data;
  } catch (error) {
    console.error('음식 검색 실패:', error);
    throw error;
  }
};

export const fetchDietStreak = async () => {
  try {
    const response = await apiClient.get(`/diet-logs/streak`);
    return response.data;
  } catch (error) {
    console.error('식단 연속 기록 불러오기 실패:', error);
    throw error;
  }
};

export const getMealRecommendations = async (data) => {
  try {
    const response = await apiClient.post(`/ai/recommend-meals`, data);
    return response.data;
  } catch (error) {
    console.error('식단 추천 불러오기 실패:', error);
    throw error;
  }
};

export const getAIDietReport = async (date) => {
  try {
    const response = await apiClient.get(`/ai/diet-report`, { params: { date } });
    return response.data;
  } catch (error) {
    console.error('AI 식단 리포트 불러오기 실패:', error);
    throw error;
  }
};

export const fetchGroups = async (params) => {
  try {
    const response = await apiClient.get(`/groups`, { params });
    return response.data;
  } catch (error) {
    console.error('그룹 불러오기 실패:', error);
    throw error;
  }
};

export const updateGroup = async (groupId, groupData) => {
  try {
    const response = await apiClient.put(`/groups/${groupId}`, groupData);
    return response.data;
  } catch (error) {
    console.error('그룹 업데이트 실패:', error);
    throw error;
  }
};

export const createGroupApi = async (groupData) => {
  try {
    const response = await apiClient.post('/groups', groupData);
    return response.data;
  } catch (error) {
    console.error('그룹 생성 실패:', error);
    throw error;
  }
};

export default apiClient
