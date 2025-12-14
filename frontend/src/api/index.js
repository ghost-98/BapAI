import axios from 'axios'
import router from '../router' // 라우터 import

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420' // ngrok으로 서버 띄울때만
  }
})

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = sessionStorage.getItem('accessToken')
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`
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
    
    // 401 에러이고, 재시도한 요청이 아닐 경우 (error.response가 존재할 때만 체크)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true // 재시도 플래그 설정 (무한 재시도 방지)

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) throw new Error('리프레시 토큰이 없습니다.')

        // 토큰 재발급 API 호출
        const response = await axios.post(import.meta.env.VITE_API_BASE_URL + '/auth/refresh', { refreshToken })
        
        const newAccessToken = response.data.access
        const newRefreshToken = response.data.refresh
        
        localStorage.setItem('accessToken', newAccessToken)
        localStorage.setItem('refreshToken', newRefreshToken)
        
        // 원래 요청의 헤더에 새로운 토큰을 설정
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
        
        // 원래 요청을 다시 시도
        return apiClient(originalRequest)

      } catch (refreshError) {
        console.error('토큰 재발급 실패:', refreshError)
        // 재발급 실패 시, 모든 토큰을 지우고 로그인 페이지로 리다이렉트
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        
        // router가 완전히 로드된 후에 push를 사용하기 위해 nextTick 사용 고려
        // 하지만 보통은 바로 이동해도 문제 없음
        router.push('/login').then(() => {
          alert('세션이 만료되었습니다. 다시 로그인해주세요.')
        })

        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
