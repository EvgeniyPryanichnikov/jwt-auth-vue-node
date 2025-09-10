import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const accessToken = ref(null)
  const isAuthenticated = ref(false)

  // Настраиваем axios для API запросов
  const api = axios.create({
    baseURL: 'http://localhost:3001/api', // Адрес бэкенда
    withCredentials: true // Разрешаем отправку cookies
  })


  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      
      // Сохраняем данные
      accessToken.value = response.data.accessToken
      user.value = response.data.user
      isAuthenticated.value = true
      
      // Сохраняем токен в localStorage
      localStorage.setItem('accessToken', accessToken.value)
      
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Ошибка при входе')
    }
  }

  // Функция выхода
  const logout = () => {
    user.value = null
    accessToken.value = null
    isAuthenticated.value = false
    localStorage.removeItem('accessToken')
  }

  // Возвращаем всё что нужно использовать в компонентах
  return {
    user,
    accessToken, 
    isAuthenticated,
    login,
    logout
  }
})