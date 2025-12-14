<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50">
    <!-- Navigation -->
    <nav class="border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-30">
      <div class="mx-auto max-w-7xl px-6">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <router-link to="/" class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-md shadow-orange-500/20">
              <span class="text-white font-bold text-xl">B</span>
            </div>
            <span class="text-gray-900 font-bold text-xl hidden sm:inline">밥알 (BapAI)</span>
          </router-link>

          <!-- Navigation Links -->
          <div class="hidden md:flex items-center gap-2">
            <router-link to="/" v-slot="{ href, navigate, isExactActive }">
              <a :href="href" @click="navigate" :class="['px-4 py-2 rounded-lg text-sm font-semibold transition-colors', isExactActive ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:bg-gray-100/70 hover:text-gray-900']">
                대시보드
              </a>
            </router-link>
            <router-link to="/diet" v-slot="{ href, navigate, isActive }">
              <a :href="href" @click="navigate" :class="['px-4 py-2 rounded-lg text-sm font-semibold transition-colors', isActive ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:bg-gray-100/70 hover:text-gray-900']">
                식단
              </a>
            </router-link>
            <router-link to="/board" v-slot="{ href, navigate, isActive }">
              <a :href="href" @click="navigate" :class="['px-4 py-2 rounded-lg text-sm font-semibold transition-colors', isActive ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:bg-gray-100/70 hover:text-gray-900']">
                게시판
              </a>
            </router-link>
            <router-link to="/group" v-slot="{ href, navigate, isActive }">
              <a :href="href" @click="navigate" :class="['px-4 py-2 rounded-lg text-sm font-semibold transition-colors', isActive ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:bg-gray-100/70 hover:text-gray-900']">
                그룹
              </a>
            </router-link>
          </div>

          <!-- User Menu -->
          <div class="flex items-center gap-4">
            <div v-if="isLoggedIn && userName" class="relative" ref="dropdownContainer">
              <!-- Dropdown Toggle -->
              <button @click="toggleDropdown" class="flex items-center gap-2 bg-orange-100/60 hover:bg-orange-100 transition-colors rounded-full py-2 px-4">
                <UserCircle class="w-5 h-5 text-orange-600" />
                <span class="text-sm font-medium text-orange-800 hidden sm:inline">
                  {{ userName }}님
                </span>
                <ChevronDown class="w-4 h-4 text-orange-700 transition-transform duration-200" :class="isDropdownOpen ? 'rotate-180' : ''" />
              </button>

              <!-- Dropdown Menu -->
              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div v-if="isDropdownOpen" class="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none py-2 z-40">
                  <div class="px-4 py-3 border-b">
                    <p class="text-sm font-semibold text-gray-800">{{ userName }}님</p>
                    <p class="text-xs text-gray-500">환영합니다!</p>
                  </div>
                  <div class="py-1">
                    <router-link to="/my-info" @click="closeDropdown" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Settings class="w-4 h-4" />
                      <span>내 정보 관리</span>
                    </router-link>
                  </div>
                  <div class="py-1 border-t">
                    <button @click="handleLogout" class="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <LogOut class="w-4 h-4" />
                      <span>로그아웃</span>
                    </button>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Page Content -->
    <main class="flex-1">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import apiClient from '../api'
import { UserCircle, ChevronDown, LogOut, Settings } from 'lucide-vue-next'

const router = useRouter()

const userName = ref(null)
const isLoggedIn = computed(() => !!(localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')))

const isDropdownOpen = ref(false)
const dropdownContainer = ref(null)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const handleClickOutside = (event) => {
  if (dropdownContainer.value && !dropdownContainer.value.contains(event.target)) {
    closeDropdown()
  }
}

onMounted(() => {
  userName.value = localStorage.getItem('name') || sessionStorage.getItem('name')
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

const handleLogout = async () => {
  closeDropdown()
  console.log('로그아웃 처리')
  
  try {
    const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken')
    if (refreshToken) {
      await apiClient.post('/auth/logout', { refreshToken })
    }
  } catch (error) {
    console.error('로그아웃 API 호출 실패:', error.response ? error.response.data : error.message)
  } finally {
    localStorage.clear()
    sessionStorage.clear()
    userName.value = null
    
    router.replace({ path: '/login', query: { logged_out: 'true' } })
  }
}
</script>


