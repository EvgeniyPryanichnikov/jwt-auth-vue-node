
import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { createPinia } from 'pinia'


const app = createApp(App)
const pinia = createPinia()

app.use(pinia)     // Подключаем Pinia для управления состоянием
app.use(vuetify)   // Подключаем Vuetify для UI компонентов

// Монтируем приложение
app.mount('#app')
