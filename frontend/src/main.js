import './style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia' // Pinia 임포트
import App from './App.vue'
import router from './router' // 라우터 임포트

const app = createApp(App)
const pinia = createPinia() // Pinia 인스턴스 생성

app.use(pinia) // Pinia 사용
app.use(router) // 라우터 사용
app.mount('#app')
