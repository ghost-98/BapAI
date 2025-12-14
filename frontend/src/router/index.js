import { createRouter, createWebHistory } from 'vue-router'

// Layout
import MainLayout from '../layouts/MainLayout.vue'

// Main Pages (within MainLayout)
import HomePage from '../pages/HomePage.vue'
import DietPage from '../pages/diet/DietPage.vue'
import BoardPage from '../pages/board/BoardPage.vue'
import BoardDetailPage from '../pages/board/BoardDetailPage.vue'
import BoardWritePage from '../pages/board/BoardWritePage.vue'
import MyInfoPage from '../pages/profile/MyInfoPage.vue'
import GroupListPage from '../pages/group/GroupListPage.vue'
import GroupDetailPage from '../pages/group/GroupDetailPage.vue'

// Auth & Fullscreen Pages
import LoginPage from '../pages/auth/LoginPage.vue'
import SignupPage from '../pages/auth/SignupPage.vue'
import AdditionalInfoPage from '../pages/auth/AdditionalInfoPage.vue'
import FindUsernamePage from '../pages/auth/FindUsernamePage.vue'
import FindPasswordPage from '../pages/auth/FindPasswordPage.vue'
import ConfirmPasswordPage from '../pages/auth/ConfirmPasswordPage.vue'
import EditProfilePage from '../pages/profile/EditProfilePage.vue'
import ChangePasswordPage from '../pages/profile/ChangePasswordPage.vue'

// Social Login Callbacks
import NaverCallbackPage from '../pages/auth/callback/NaverCallbackPage.vue'
import KakaoCallbackPage from '../pages/auth/callback/KakaoCallbackPage.vue'
import GoogleCallbackPage from '../pages/auth/callback/GoogleCallbackPage.vue'
import GithubCallbackPage from '../pages/auth/callback/GithubCallbackPage.vue'


// --- Route Definitions ---

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
  // Social Callbacks
  { path: '/auth/naver/callback', name: 'NaverCallback', component: NaverCallbackPage },
  { path: '/auth/kakao/callback', name: 'KakaoCallback', component: KakaoCallbackPage },
  { path: '/auth/google/callback', name: 'GoogleCallback', component: GoogleCallbackPage },
  { path: '/auth/github/callback', name: 'GithubCallback', component: GithubCallbackPage },
];

const routes = [
  mainRoutes,
  ...authRoutes,
  // Catch-all route can be added here if needed
  // { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
})


// --- Navigation Guards ---

const handleTempPassword = (to, isTempPasswordLogin) => {
  if (isTempPasswordLogin && to.name !== 'ChangePassword') {
    // Allow logout, but force password change for everything else
    if (to.name !== 'Logout' && to.name !== 'Login') {
        sessionStorage.setItem('isReauthenticated', 'true'); // Consider re-authenticated for password change
        return { name: 'ChangePassword' };
    }
  }
  return null;
};

const handleUnauthenticated = (to, isLoggedIn) => {
  if (to.meta.requiresAuth && !isLoggedIn) {
    alert('로그인이 필요합니다.');
    return { name: 'Login' };
  }
  return null;
};

const handleLoggedIn = (to, isLoggedIn) => {
    if (isLoggedIn && (to.name === 'Login' || to.name === 'Signup')) {
        return { path: '/' };
    }
    return null;
}

const handleReauthentication = (to, isReauthenticated) => {
  if (to.meta.requiresReauth && !isReauthenticated) {
    alert('보안을 위해 비밀번호를 다시 확인해야 합니다.');
    return { name: 'ConfirmPassword', query: { redirect: to.path } };
  }
  return null;
};

const handleMultiStepSignup = (to, from, firstStepCompleted) => {
  if (to.name === 'AdditionalInfo' && !firstStepCompleted) {
    alert('잘못된 접근입니다. 회원가입을 먼저 진행해주세요.');
    return { name: 'Signup' };
  }
  return null;
};

const cleanupSessionFlags = (to, from) => {
    // Clean up reauth flag after navigating to the intended page
    if (sessionStorage.getItem('isReauthenticated') === 'true' && to.meta.requiresReauth) {
        sessionStorage.removeItem('isReauthenticated');
    }
    // Clean up signup flag after leaving the additional info page
    if (from.name === 'AdditionalInfo' && sessionStorage.getItem('firstStepCompleted') === 'true') {
        sessionStorage.removeItem('firstStepCompleted');
    }
}

router.beforeEach((to, from, next) => {
  const isLoggedIn = !!(localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken'));
  const isTempPasswordLogin = sessionStorage.getItem('isTempPasswordLogin') === 'true';
  const isReauthenticated = sessionStorage.getItem('isReauthenticated') === 'true';
  const firstStepCompleted = sessionStorage.getItem('firstStepCompleted') === 'true';

  // Execute guards in order of priority
  let redirect = handleTempPassword(to, isTempPasswordLogin);
  if (redirect) return next(redirect);

  redirect = handleUnauthenticated(to, isLoggedIn);
  if (redirect) return next(redirect);

  redirect = handleLoggedIn(to, isLoggedIn);
  if (redirect) return next(redirect);

  redirect = handleReauthentication(to, isReauthenticated);
  if (redirect) return next(redirect);

  redirect = handleMultiStepSignup(to, from, firstStepCompleted);
  if (redirect) return next(redirect);

  // Cleanup flags after checks
  cleanupSessionFlags(to, from);

  // If no redirects, proceed
  next();
});

export default router;
