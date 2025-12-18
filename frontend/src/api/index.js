import axios from 'axios'
import router from '../router' // 라우터 import
import { useAuthStore } from '../stores/auth' // Pinia auth store 임포트
import { useNotificationStore } from '../stores/notification' // Pinia notification store 임포트

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420' // ngrok으로 서버 띄울때만
  }
})

// 요청 인터셉터 (access token)
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore(); // 요청 시점에 스토어 사용
    if (authStore.accessToken) {
      config.headers['Authorization'] = `Bearer ${authStore.accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터
apiClient.interceptors.response.use(
  // 성공적인 응답은 그대로 반환
  (response) => {
    return response
  },
  // 에러 처리
  async (error) => {
    const originalRequest = error.config
    const authStore = useAuthStore(); // 응답 시점에 스토어 사용
    const notificationStore = useNotificationStore(); // 응답 시점에 스토어 사용
    
    // 401 에러이고, 재시도한 요청이 아닐 경우 (error.response가 존재할 때만 체크)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true // 재시도 플래그 설정 (무한 재시도 방지)

      try {
        const refreshToken = authStore.refreshToken
        if (!refreshToken) throw new Error('리프레시 토큰이 없습니다.')

        // 토큰 재발급 API 호출
        const response = await axios.post(import.meta.env.VITE_API_BASE_URL + '/auth/refresh', { refreshToken })
        
        const newAccessToken = response.data.access
        const newRefreshToken = response.data.refresh
        
        authStore.setTokens(newAccessToken, newRefreshToken, true); // 로그인 유지 여부는 알 수 없으므로 true로 가정

        // 원래 요청의 헤더에 새로운 토큰을 설정
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
        
        // 원래 요청을 다시 시도
        return apiClient(originalRequest)

      } catch (refreshError) {
        console.error('토큰 재발급 실패:', refreshError)
        // 재발급 실패 시, 모든 토큰을 지우고 로그인 페이지로 리다이렉트
        authStore.clearAuth();
        
        router.push('/login').then(() => {
          notificationStore.showNotification('세션이 만료되었습니다. 다시 로그인해주세요.', 'error');
        })

        return Promise.reject(refreshError)
      }
    }
    
    // 일반적인 API 에러 메시지 표시
    if (error.response && error.response.data && error.response.data.message) {
      notificationStore.showNotification(error.response.data.message, 'error');
    } else if (error.message) {
      notificationStore.showNotification('네트워크 오류가 발생했습니다: ' + error.message, 'error');
    }

    return Promise.reject(error)
  }
)

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

export default apiClient
