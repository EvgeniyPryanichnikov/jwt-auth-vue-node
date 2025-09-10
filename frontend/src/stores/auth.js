import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const accessToken = ref(null)
  const isAuthenticated = ref(false)

  // Настраиваю axios для API запросов
  const api = axios.create({
    baseURL: 'http://localhost:3001/api', // Адрес бэкенда
    withCredentials: true // Разрешаем отправку cookies
  })

  const init = () => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      accessToken.value = token
      isAuthenticated.value = true
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      
      // Сохраняю данные
      accessToken.value = response.data.accessToken
      user.value = response.data.user
      isAuthenticated.value = true
      
      // Сохраняю токен в localStorage
      localStorage.setItem('accessToken', accessToken.value)
      
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Ошибка при входе')
    }
  }

  // Метод для получения данных пользователя
  const getUserData = async () => {
    try {
      const response = await api.get('/user/me')
      return response.data
    } catch (error) {
      console.error('Ошибка получения данных пользователя:', error)
      throw error
    }
  }

  // Функция выхода
  const logout = () => {
    user.value = null
    accessToken.value = null
    isAuthenticated.value = false
    localStorage.removeItem('accessToken')
  }

  return {
    api,
    init,
    user,
    accessToken, 
    isAuthenticated,
    getUserData,
    login,
    logout
  }
})