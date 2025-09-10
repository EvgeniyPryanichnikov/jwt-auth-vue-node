<template>
  <v-app>
    <v-app-bar color="primary" dark v-if="authStore.isAuthenticated">
      <v-toolbar-title>JWT Auth System</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn @click="showProfile = true" :loading="loading">
        <v-icon>mdi-account</v-icon>
        Мой профиль
      </v-btn>
      <v-btn @click="handleLogout" class="ml-2">
        <v-icon>mdi-logout</v-icon>
        Выйти
      </v-btn>
    </v-app-bar>

    <v-main>
      <login-form v-if="!authStore.isAuthenticated" />
      
      <div v-else>
        <user-profile 
          v-if="showProfile" 
          @close="showProfile = false" 
        />
        
        <v-container v-else class="text-center">
          <v-icon size="100" color="success">mdi-check-circle</v-icon>
          <h2 class="mt-4">Добро пожаловать!</h2>
          <p class="text-grey">Вы успешно авторизованы в системе</p>
          
          <v-btn color="primary" class="mt-4" @click="showProfile = true">
            <v-icon>mdi-account</v-icon>
            Посмотреть мой профиль
          </v-btn>

          <div class="mt-6">
            <v-alert type="info" variant="outlined">
              <strong>Access Token работает!</strong>
            </v-alert>
          </div>
        </v-container>
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import LoginForm from '@/components/LoginForm.vue'
import UserProfile from '@/components/UserProfile.vue'

const authStore = useAuthStore()
const showProfile = ref(false)
const loading = ref(false)

authStore.init()

const handleLogout = () => {
  authStore.logout()
  showProfile.value = false
}

watch(() => authStore.isAuthenticated, (newVal) => {
  if (!newVal) {
    showProfile.value = false
  }
})
</script>