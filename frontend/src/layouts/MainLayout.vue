<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 relative overflow-hidden dot-pattern">
    <!-- Animated Organic Blob Shapes -->
    <div class="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-br from-orange-300/30 to-rose-300/30 rounded-full blur-3xl animate-pulse -z-10"></div>
    <div class="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-tr from-amber-300/30 to-orange-300/30 rounded-full blur-3xl animate-pulse animation-delay-2000 -z-10"></div>

    <div class="flex flex-col min-h-screen">
      <!-- Navigation -->
      <nav class="border-b border-white/50 bg-white/40 backdrop-blur-sm sticky top-0 z-30">
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
      <router-view class="flex-1" />
    </div>

    <!-- Global Notification Display -->
    <NotificationDisplay />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { UserCircle, ChevronDown, LogOut, Settings } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth' // Import auth store
import NotificationDisplay from '@/components/common/NotificationDisplay.vue' // Import NotificationDisplay

const router = useRouter()
const authStore = useAuthStore() // Instantiate auth store

const userName = ref(null)
const isLoggedIn = computed(() => authStore.isLoggedIn) // Use auth store's isLoggedIn getter

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
  // Get user name from auth store or local/session storage
  userName.value = authStore.userName || localStorage.getItem('name') || sessionStorage.getItem('name')
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

const handleLogout = async () => {
  closeDropdown()
  await authStore.logout()
}
</script>

<style>
.dot-pattern {
  background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0);
  background-size: 20px 20px;
}

.animation-delay-2000 {
  animation-delay: 2s;
}
</style>