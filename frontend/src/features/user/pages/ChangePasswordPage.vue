<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Organic blob shapes -->
    <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-orange-300/30 to-rose-300/30 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-amber-300/30 to-orange-300/30 rounded-full blur-3xl"></div>
    
    <div class="w-full max-w-md relative z-10">
      <div class="bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50">
        <div class="space-y-6">
          <div class="text-center space-y-2">
            <h2 class="text-3xl font-bold text-gray-900">비밀번호 변경</h2>
            <p class="text-gray-600">새로운 비밀번호를 입력해주세요.</p>
          </div>

          <form class="space-y-4" @submit.prevent="handleChangePassword">
            <div>
              <label for="new-password" class="block text-sm font-semibold text-gray-700 mb-2">새 비밀번호</label>
              <input
                v-model="newPassword"
                @blur="checkNewPasswordAgainstCurrent"
                id="new-password"
                name="new-password"
                type="password"
                autocomplete="new-password"
                required
                :class="[
                  'w-full px-4 py-3 rounded-xl border-2 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors bg-white/50',
                  !newPasswordStatus.isValid ? 'border-red-500' : 'border-gray-200'
                ]"
                placeholder="새 비밀번호"
              />
              <p v-if="newPasswordStatus.message" :class="['mt-1 text-sm', newPasswordStatus.isValid ? 'text-green-600' : 'text-red-600']">
                {{ newPasswordStatus.message }}
              </p>
            </div>
            
            <div>
              <label for="confirm-password" class="block text-sm font-semibold text-gray-700 mb-2">새 비밀번호 확인</label>
              <input
                v-model="confirmPassword"
                id="confirm-password"
                name="confirm-password"
                type="password"
                autocomplete="new-password"
                required
                class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors bg-white/50"
                placeholder="새 비밀번호 확인"
              />
              <p v-if="passwordMismatch" class="mt-2 text-sm text-red-600">
                비밀번호가 일치하지 않습니다.
              </p>
            </div>

            <div>
              <button
                type="submit"
                :disabled="passwordMismatch || !newPasswordStatus.isValid"
                class="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-lg hover:from-orange-600 hover:to-rose-600 transition-all transform hover:scale-[1.02] shadow-lg disabled:bg-gray-400 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:shadow-none"
              >
                비밀번호 변경
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../../../api'
import { useAuthStore } from '../../../stores/auth' // Pinia auth store 임포트

const router = useRouter()
const authStore = useAuthStore() // authStore 사용

const newPassword = ref('')
const confirmPassword = ref('')

// Add onMounted hook for reauthentication check
onMounted(() => {
  const isReauthenticated = sessionStorage.getItem('isReauthenticated');
  if (isReauthenticated !== 'true') {
    alert('보안을 위해 비밀번호를 다시 확인해야 합니다.');
    router.replace({ path: '/confirm-password', query: { redirect: '/change-password' } });
    return;
  }
  sessionStorage.removeItem('isReauthenticated'); // Consume the flag
});

const newPasswordStatus = ref({
  isValid: true,
  message: ''
})

const passwordMismatch = computed(() => {
  return newPassword.value !== confirmPassword.value && confirmPassword.value !== ''
})

const checkNewPasswordAgainstCurrent = async () => {
  if (!newPassword.value) {
    newPasswordStatus.value = { isValid: true, message: '' }
    return
  }

  try {
    await apiClient.post('/members/check-new-password', {
      newPassword: newPassword.value
    })
    
    newPasswordStatus.value = { isValid: true, message: '사용 가능한 새 비밀번호입니다.' }
  } catch (error) {
    if (error.response && error.response.status === 409) {
      newPasswordStatus.value = { isValid: false, message: '새 비밀번호는 현재 비밀번호와 같을 수 없습니다.' }
    } else {
      console.error('새 비밀번호 유효성 검사 실패:', error.response ? error.response.data : error.message)
      newPasswordStatus.value = { isValid: false, message: '비밀번호 유효성 검사 중 오류가 발생했습니다.' }
    }
  }
}

const handleChangePassword = async () => {
  if (newPassword.value === '') {
    alert('새 비밀번호를 입력해주세요.')
    return
  }
  if (passwordMismatch.value || newPassword.value !== confirmPassword.value) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }
  if (!newPasswordStatus.value.isValid) {
    alert(newPasswordStatus.value.message || '새 비밀번호가 현재 비밀번호와 동일합니다.')
    return
  }

  try {
    const payload = {
      newPassword: newPassword.value,
    }
    
    await apiClient.patch('/members/password', payload)

    alert('비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.')
    
    authStore.clearAuth() // Clear auth state

    router.push('/login')
  } catch (error) {
    console.error('비밀번호 변경 실패:', error)
    alert('비밀번호 변경에 실패했습니다. 다시 시도해주세요.')
  }
}
</script>