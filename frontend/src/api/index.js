import axios from 'axios';
import router from '../router'; // 라우터 import
import { useAuthStore } from '../stores/auth'; // Pinia auth store 임포트
import { useNotificationStore } from '../stores/notification'; // Pinia notification store 임포트

// JSON용 Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420' // ngrok으로 서버 띄울때만
  }
});

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
    config.headers['Authorization'] = `Bearer ${authStore.accessToken}`;
  }
  return config;
};

apiClient.interceptors.request.use(requestInterceptor);
apiClientForMultipart.interceptors.request.use(requestInterceptor);

// --- 토큰 갱신 로직 ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};
// --- /토큰 갱신 로직 ---

// 응답 인터셉터 (두 클라이언트에 모두 적용)
const responseInterceptor = async (error) => {
  const originalRequest = error.config;
  const notificationStore = useNotificationStore();

  if (error.response && error.response.status === 401 && !originalRequest._retry) {
    console.log('DEBUG: 401 에러 발생. 토큰 갱신 프로세스 시작.', originalRequest.url);
    if (isRefreshing) {
      console.log('DEBUG: 이미 토큰 갱신 진행 중. 요청을 큐에 추가.');
      return new Promise(function (resolve, reject) {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          console.log('DEBUG: 큐에서 꺼낸 요청 재시도.', originalRequest.url);
          // 원래 요청을 다시 시도 (원래 사용했던 클라이언트로)
          if (originalRequest.headers['Content-Type'] === 'multipart/form-data') {
            return apiClientForMultipart(originalRequest);
          }
          return apiClient(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const authStore = useAuthStore();
    const refreshTokenValue = authStore.refreshToken;

    if (!refreshTokenValue) {
      console.error('DEBUG: 리프레시 토큰이 없습니다. 강제 로그아웃.');
      authStore.clearAuth();
      router.push('/login').then(() => {
        notificationStore.showNotification('세션 정보가 없습니다. 다시 로그인해주세요.', 'error');
      });
      isRefreshing = false;
      return Promise.reject(new Error('No refresh token available'));
    }
    
    return new Promise((resolve, reject) => {
      axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, { refreshToken: refreshTokenValue })
        .then(response => {
          const newAccessToken = response.data.accessToken;
          const newRefreshToken = response.data.refreshToken;

          authStore.setTokens(newAccessToken, newRefreshToken, true);

          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          
          processQueue(null, newAccessToken);

          // 원래 요청을 다시 시도 (원래 사용했던 클라이언트로)
          if (originalRequest.headers['Content-Type'] === 'multipart/form-data') {
            resolve(apiClientForMultipart(originalRequest));
          } else {
            resolve(apiClient(originalRequest));
          }
        })
        .catch(refreshError => {
          console.error('DEBUG: 토큰 재발급 실패:', refreshError);
          processQueue(refreshError, null);
          authStore.clearAuth();
          router.push('/login').then(() => {
            notificationStore.showNotification('세션이 만료되었습니다. 다시 로그인해주세요.', 'error');
          });
          reject(refreshError);
        })
        .finally(() => {
          console.log('DEBUG: 토큰 갱신 프로세스 종료.');
          isRefreshing = false;
        });
    });
  }

  if (error.response && error.response.status === 401 && originalRequest._retry) {
    console.error('DEBUG: 토큰 갱신 후 재요청했으나 또 401 에러 발생!', originalRequest.url);
  }

  if (error.response && error.response.data && error.response.data.message) {
    // notificationStore.showNotification(error.response.data.message, 'error');
  } else if (error.message && !error.response) { // 응답이 없는 네트워크 오류 등
    notificationStore.showNotification('네트워크 오류가 발생했습니다: ' + error.message, 'error');
  }

  return Promise.reject(error);
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

export const analyzeFood = async (formData) => {
  try {
    const response = await apiClientForMultipart.post('/ai/analyze', formData);
    return response.data;
  } catch (error) {
    console.error('음식 분석 실패:', error);
    throw error;
  }
};

export const getDietLogs = async (params) => {
  try {
    console.log('API: getDietLogs called with params:', params);
    const response = await apiClient.get(`/diet-logs/me`, { params });
    console.log('API: getDietLogs raw response data:', response.data);
    return response.data; // Just return the data as-is
  } catch (error) {
    console.error('식단 기록 불러오기 실패:', error);
    throw error;
  }
};

export const deleteDietLog = async (logId) => {
  try {
    const response = await apiClient.delete(`/diet-logs/${logId}`);
    return response.data;
  } catch (error) {
    console.error(`식단 기록 ${logId} 삭제 실패:`, error);
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

export const fetchMyGroups = async () => {
  try {
    const response = await apiClient.get(`/groups/me`);
    return response.data;
  } catch (error) {
    console.error('내 그룹 목록 불러오기 실패:', error);
    throw error;
  }
};

export const fetchGroupById = async (groupId) => {
  try {
    const response = await apiClient.get(`/groups/${groupId}`);
    return response.data;
  } catch (error) {
    console.error(`그룹 ${groupId} 불러오기 실패:`, error);
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

export const joinGroupApi = async (groupId) => {
  try {
    const response = await apiClient.post(`/groups/${groupId}/join`);
    return response.data;
  } catch (error) {
    console.error('그룹 참여 실패:', error);
    throw error;
  }
};

export const leaveGroupApi = async (groupId) => {
  try {
    const response = await apiClient.delete(`/groups/${groupId}/leave`);
    return response.data;
  } catch (error) {
    console.error('그룹 탈퇴 실패:', error);
    throw error;
  }
};

// --- 추가된 그룹 관리 API 함수들 ---

export const deleteGroup = async (groupId) => {
  console.log(`[API MOCK] Deleting group ${groupId}`);
  // 실제 구현: return await apiClient.delete(`/groups/${groupId}`);
  return new Promise(resolve => setTimeout(() => {
    console.log(`[API MOCK] Group ${groupId} deleted successfully.`);
    resolve({ message: '그룹이 성공적으로 삭제되었습니다.' });
  }, 500));
};

export const fetchGroupMembers = async (groupId) => {
  console.log(`[API MOCK] Fetching members for group ${groupId}`);
  // 실제 구현: return await apiClient.get(`/groups/${groupId}/members`);
  return new Promise(resolve => setTimeout(() => {
    const members = [
      { userId: 1, nickname: '그룹장' },
      { userId: 4, nickname: '김지원' },
      { userId: 2, nickname: '건강지킴이' },
      { userId: 5, nickname: '식단초보' },
    ];
    console.log(`[API MOCK] Fetched members for group ${groupId}:`, members);
    resolve(members);
  }, 500));
};

export const delegateGroupLeader = async (groupId, newLeaderId) => {
  console.log(`[API MOCK] Delegating leader of group ${groupId} to user ${newLeaderId}`);
  // 실제 구현: return await apiClient.post(`/groups/${groupId}/delegate`, { newLeaderId });
  return new Promise(resolve => setTimeout(() => {
    console.log(`[API MOCK] Delegated leader for group ${groupId} successfully.`);
    resolve({ message: '그룹장 위임이 성공적으로 완료되었습니다.' });
  }, 500));
};

export const fetchGroupJoinRequests = async (groupId) => {
  console.log(`[API MOCK] Fetching join requests for group ${groupId}`);
   // 실제 구현: return await apiClient.get(`/groups/${groupId}/join-requests`);
  return new Promise(resolve => setTimeout(() => {
    const requests = [
      { userId: 10, nickname: '다이어트새내기', requestedAt: new Date() },
      { userId: 11, nickname: '도전하는유저', requestedAt: new Date(Date.now() - 3600000) },
    ];
    console.log(`[API MOCK] Fetched join requests for group ${groupId}:`, requests);
    resolve(requests);
  }, 500));
};

export const approveJoinRequest = async (groupId, userId) => {
  console.log(`[API MOCK] Approving join request for user ${userId} in group ${groupId}`);
  // 실제 구현: return await apiClient.post(`/groups/${groupId}/join-requests/approve`, { userId });
  return new Promise(resolve => setTimeout(() => {
    console.log(`[API MOCK] Approved join request for user ${userId}.`);
    resolve({ message: '가입 요청을 승인했습니다.' });
  }, 500));
};

export const rejectJoinRequest = async (groupId, userId) => {
  console.log(`[API MOCK] Rejecting join request for user ${userId} in group ${groupId}`);
  // 실제 구현: return await apiClient.post(`/groups/${groupId}/join-requests/reject`, { userId });
  return new Promise(resolve => setTimeout(() => {
    console.log(`[API MOCK] Rejected join request for user ${userId}.`);
    resolve({ message: '가입 요청을 거절했습니다.' });
  }, 500));
};

// --- /추가된 그룹 관리 API 함수들 ---

export const fetchAvailableTags = async () => {
  try {
    const response = await apiClient.get('/groups/tags');
    return response.data;
  } catch (error) {
    console.error('사용 가능한 태그 불러오기 실패:', error);
    throw error;
  }
};

export const updateWaterGoal = async (date, type) => {
  try {
    const response = await apiClient.post('/diet-logs/water/goal', { date, type });
    return response.data;
  } catch (error) {
    console.error('물 목표량 업데이트 실패:', error);
    throw error;
  }
};

export const updateWaterCount = async (date, type) => {
  try {
    const response = await apiClient.post('/diet-logs/water/count', { date, type });
    return response.data;
  } catch (error) {
    console.error('물 섭취량 업데이트 실패:', error);
    throw error;
  }
};

export const getHealthAnalysis = async () => {
  try {
    const response = await apiClient.get(`/health/analyze/me`);
    return response.data;
  } catch (error) {
    console.error('건강 분석 데이터 불러오기 실패:', error);
    throw error;
  }
};

export default apiClient;