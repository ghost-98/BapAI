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

export const fetchMyGroups = async (params) => {
  try {
    const response = await apiClient.get(`/groups/me`, { params });
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
    const response = await apiClient.patch(`/groups/${groupId}`, groupData);
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

export const deleteGroup = async (groupId) => {
  try {
    const response = await apiClient.delete(`/groups/${groupId}`);
    return response.data;
  } catch (error) {
    console.error(`그룹 ${groupId} 삭제 실패:`, error);
    throw error;
  }
};

export const fetchGroupMembers = async (groupId) => {
  try {
    const response = await apiClient.get(`/groups/${groupId}/members`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch members for group ${groupId}:`, error);
    throw error;
  }
};

export const delegateGroupLeader = async (groupId, newLeaderId) => {
  try {
    const response = await apiClient.put(`/groups/${groupId}/delegate/${newLeaderId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delegate leader for group ${groupId} to user ${newLeaderId}:`, error);
    throw error;
  }
};

export const searchUsersForGroupInvite = async (groupId, nickname) => {
  try {
    const response = await apiClient.get(`/groups/${groupId}/search-users`, { params: { nickname } });
    return response.data;
  } catch (error) {
    console.error(`Failed to search users for group ${groupId}:`, error);
    throw error;
  }
}

export const inviteUserToGroup = async (groupId, targetUserId) => {
  try {
    const response = await apiClient.post(`/groups/${groupId}/invite/${targetUserId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to invite user ${targetUserId} to group ${groupId}:`, error);
    throw error;
  }
}

export const fetchGroupJoinRequests = async (groupId) => {
  try {
    const response = await apiClient.get(`/groups/${groupId}/pending`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch join requests for group ${groupId}:`, error);
    throw error;
  }
};

export const approveJoinRequest = async (groupId, userId) => {
  try {
    const response = await apiClient.post(`/groups/${groupId}/approve/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to approve join request for user ${userId} in group ${groupId}:`, error);
    throw error;
  }
};

export const rejectJoinRequest = async (groupId, userId) => {
  try {
    const response = await apiClient.post(`/groups/${groupId}/reject/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to reject join request for user ${userId} in group ${groupId}:`, error);
    throw error;
  }
};

export const kickGroupMember = async (groupId, userId) => {
  try {
    const response = await apiClient.delete(`/groups/${groupId}/kick/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to kick member ${userId} from group ${groupId}:`, error);
    throw error;
  }
};

export const fetchChatHistory = async (groupId) => {
  try {
    const response = await apiClient.get(`/chat/${groupId}/history`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch chat history for group ${groupId}:`, error);
    throw error;
  }
};

export const fetchOnlineUsers = async (groupId) => {
  try {
    const response = await apiClient.get(`/chat/${groupId}/online`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch online users for group ${groupId}:`, error);
    throw error;
  }
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