<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Вход в систему</v-toolbar-title>
          </v-toolbar>
          
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                required
                prepend-inner-icon="mdi-email"
                variant="outlined"
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Пароль"
                type="password"
                required
                prepend-inner-icon="mdi-lock"
                variant="outlined"
                class="mb-3"
              ></v-text-field>

              <v-btn 
                type="submit" 
                color="primary" 
                block 
                size="large"
                :loading="loading"
              >
                Войти
              </v-btn>

              <v-alert 
                v-if="error" 
                type="error" 
                class="mt-3"
                density="compact"
              >
                {{ error }}
              </v-alert>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const email = ref('user@mail.com')
const password = ref('')
const loading = ref(false)
const error = ref('')

const authStore = useAuthStore()

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''
    
    await authStore.login(email.value, password.value)
    
    console.log('Успешный вход!') 
  } catch (err) {
    error.value = err.message
    console.error('Ошибка при входе:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>