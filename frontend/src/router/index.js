import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Layout (상단 네비게이션)
import MainLayout from '../layouts/MainLayout.vue'

// 메인 페이지 (기능별)
import HomePage from '../features/home/pages/HomePage.vue'
import DietPage from '../features/diet/pages/DietPage.vue'
import BoardPage from '../features/board/pages/BoardPage.vue'
import BoardDetailPage from '../features/board/pages/BoardDetailPage.vue'
import BoardWritePage from '../features/board/pages/BoardWritePage.vue'
import MyInfoPage from '../features/user/pages/MyInfoPage.vue'
import GroupListPage from '../features/group/pages/GroupListPage.vue'
import GroupDetailPage from '../features/group/pages/GroupDetailPage.vue'

// Auth 관련 페이지
import LoginPage from '../features/auth/pages/LoginPage.vue'
import SignupPage from '../features/auth/pages/SignupPage.vue'
import AdditionalInfoPage from '../features/auth/pages/AdditionalInfoPage.vue'
import FindUsernamePage from '../features/auth/pages/FindUsernamePage.vue'
import FindPasswordPage from '../features/auth/pages/FindPasswordPage.vue'
import ConfirmPasswordPage from '../features/auth/pages/ConfirmPasswordPage.vue'
import EditProfilePage from '../features/user/pages/EditProfilePage.vue'
import ChangePasswordPage from '../features/user/pages/ChangePasswordPage.vue'

// 소셜 로그인 콜백 페이지
import NaverCallbackPage from '../features/auth/pages/callback/NaverCallbackPage.vue'
import KakaoCallbackPage from '../features/auth/pages/callback/KakaoCallbackPage.vue'
import GoogleCallbackPage from '../features/auth/pages/callback/GoogleCallbackPage.vue'
import GithubCallbackPage from '../features/auth/pages/callback/GithubCallbackPage.vue'


// -- Route 정의

const mainRoutes = {
  path: '/',
  component: MainLayout,
  meta: { requiresAuth: true },
  children: [
    { path: '', name: 'Home', component: HomePage },
    { path: 'diet', name: 'Diet', component: DietPage },
    { path: 'board', name: 'Board', component: BoardPage },
    { path: 'board/write', name: 'BoardWrite', component: BoardWritePage },
    { path: 'board/edit/:boardId', name: 'BoardEdit', component: BoardWritePage, props: true },
    { path: 'board/:boardId', name: 'BoardDetail', component: BoardDetailPage, props: true },
    { path: 'group', name: 'GroupList', component: GroupListPage },
    { path: 'groups/:groupId', name: 'GroupDetail', component: GroupDetailPage, props: true },
    { path: 'my-info', name: 'MyInfo', component: MyInfoPage, meta: { requiresReauth: true } },
    { path: 'edit-profile', name: 'EditProfile', component: EditProfilePage, meta: { requiresReauth: true } },
    { path: 'change-password', name: 'ChangePassword', component: ChangePasswordPage, meta: { requiresAuth: true } },
  ],
};

const authRoutes = [
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/signup', name: 'Signup', component: SignupPage },
  { path: '/additional-info', name: 'AdditionalInfo', component: AdditionalInfoPage, meta: { requiresFirstStep: true } },
  { path: '/find-username', name: 'FindUsername', component: FindUsernamePage },
  { path: '/find-password', name: 'FindPassword', component: FindPasswordPage },
  { path: '/confirm-password', name: 'ConfirmPassword', component: ConfirmPasswordPage, meta: { requiresAuth: true } },
  // 소셜 콜백
  { path: '/auth/naver/callback', name: 'NaverCallback', component: NaverCallbackPage },
  { path: '/auth/kakao/callback', name: 'KakaoCallback', component: KakaoCallbackPage },
  { path: '/auth/google/callback', name: 'GoogleCallback', component: GoogleCallbackPage },
  { path: '/auth/github/callback', name: 'GithubCallback', component: GithubCallbackPage },
];

const routes = [
  mainRoutes,
  ...authRoutes,
  // { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
})


// -- 네비게이션 가드

router.beforeEach((to, from) => {
  const authStore = useAuthStore();

  const handleTempPassword = (to) => {
    if (authStore.isTempPasswordLogin && to.name !== 'ChangePassword') {
      if (to.name !== 'Logout' && to.name !== 'Login') {
          authStore.setReauthenticated(true);
          return { name: 'ChangePassword' };
      }
    }
    return null;
  };

  const handleUnauthenticated = (to) => {
    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
      alert('로그인이 필요합니다.');
      return { name: 'Login' };
    }
    return null;
  };

  const handleLoggedIn = (to) => {
      if (authStore.isLoggedIn && (to.name === 'Login' || to.name === 'Signup')) {
          return { path: '/' };
      }
      return null;
  }

  const handleReauthentication = (to) => {
    if (to.meta.requiresReauth && !authStore.isReauthenticated) {
      alert('보안을 위해 비밀번호를 다시 확인해야 합니다.');
      return { name: 'ConfirmPassword', query: { redirect: to.path } };
    }
    return null;
  };

  const handleMultiStepSignup = (to) => {
    if (to.name === 'AdditionalInfo' && !authStore.firstStepCompleted) {
      alert('잘못된 접근입니다. 회원가입을 먼저 진행해주세요.');
      return { name: 'Signup' };
    }
    return null;
  };

  const cleanupSessionFlags = (to, from) => {
      // Clean up signup flag after leaving the additional info page
      if (from.name === 'AdditionalInfo' && authStore.firstStepCompleted) {
          authStore.setFirstStepCompleted(false);
      }
  }

  // 우선순위에 따라 가드 실행
  let redirect = handleTempPassword(to);
  if (redirect) return redirect;

  redirect = handleUnauthenticated(to);
  if (redirect) return redirect;

  redirect = handleLoggedIn(to);
  if (redirect) return redirect;

  redirect = handleReauthentication(to);
  if (redirect) return redirect;

  redirect = handleMultiStepSignup(to);
  if (redirect) return redirect;

  // Cleanup flags after checks
  cleanupSessionFlags(to, from);

  // If no redirects, proceed
  return true; // Proceed with navigation
});

export default router;