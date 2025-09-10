import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

export default createVuetify({
  components,    // Подключаем все компоненты Vuetify
  directives,    // Подключаем все директивы Vuetify
  theme: {
    defaultTheme: 'light'
  }
})