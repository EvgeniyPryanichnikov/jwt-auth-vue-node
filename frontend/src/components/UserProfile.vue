<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark>
            <v-toolbar-title>Профиль пользователя</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="loadUserData" :loading="loading">
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </v-toolbar>

          <v-card-text>
            <!-- Загрузка -->
            <div v-if="loading" class="text-center py-4">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
              <p class="mt-2">Загрузка данных...</p>
            </div>

            <!-- Данные пользователя -->
            <div v-else-if="userData" class="profile-data">
              <v-list lines="two">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-identifier</v-icon>
                  </template>
                  <v-list-item-title>ID пользователя</v-list-item-title>
                  <v-list-item-subtitle>{{ userData.id }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-email</v-icon>
                  </template>
                  <v-list-item-title>Email</v-list-item-title>
                  <v-list-item-subtitle>{{ userData.email }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-account-key</v-icon>
                  </template>
                  <v-list-item-title>Роль</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip :color="getRoleColor(userData.role)" size="small">
                      {{ userData.role }}
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-clock</v-icon>
                  </template>
                  <v-list-item-title>Последний вход</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(userData.lastLogin) }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon :color="userData.isActive ? 'green' : 'red'">
                      mdi-account-{{ userData.isActive ? 'check' : 'cancel' }}
                    </v-icon>
                  </template>
                  <v-list-item-title>Статус аккаунта</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip :color="userData.isActive ? 'green' : 'red'" size="small">
                      {{ userData.isActive ? 'Активен' : 'Неактивен' }}
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </div>

            <!-- Ошибка -->
            <v-alert v-if="error" type="error" class="mt-3">
              {{ error }}
            </v-alert>
          </v-card-text>

          <v-card-actions>
            <v-btn color="primary" @click="loadUserData" :loading="loading">
              <v-icon>mdi-refresh</v-icon>
              Обновить
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn color="grey" @click="$emit('close')">
              <v-icon>mdi-close</v-icon>
              Закрыть
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const userData = ref(null)
const loading = ref(false)
const error = ref('')

const getRoleColor = (role) => {
  const colors = {
    admin: 'red',
    moderator: 'orange',
    user: 'green'
  }
  return colors[role] || 'grey'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('ru-RU')
}

const loadUserData = async () => {
  try {
    loading.value = true
    error.value = ''
    console.log('Загружаем данные пользователя...')
    
    const response = await authStore.getUserData()
    userData.value = response.user
    console.log('Данные пользователя получены:', userData.value.email)
    
  } catch (err) {
    error.value = err.response?.data?.error || 'Ошибка загрузки профиля'
    console.error('Ошибка загрузки профиля:', err)
  } finally {
    loading.value = false
  }
}

// ✅ Инициализируем хранилище перед использованием
authStore.init()

// Загружаем данные при монтировании компонента
onMounted(loadUserData)
</script>

<style scoped>
  .profile-data {
    padding: 16px 0;
  }
</style>