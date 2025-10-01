
import App from './App.vue'
import router from './router'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Iconos (opcional)
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives,
  // Personalizacion de paleta de colores segun nuestro prototipo
  theme: {
    defaultTheme: 'light',
    themes: {
      dark: {
        dark: true,
        colors: {
          primary: '#00CED1',
          secondary: '#1a237e',
          accent: '#FFD700',
          background: '#0D1117',
          surface: '#1f2937',
          'on-primary': '#000000',
          'on-secondary': '#FFFFFF',
          'on-accent': '#000000',
          'on-surface': '#FFFFFF',
          'on-background': '#FFFFFF'
        }
      },
      light: {
        dark: false,
        colors: {
          primary: '#00CED1',
          secondary: '#1a237e',
          accent: '#FFD700',
          background: '#FFFFFF',
          surface: '#F5F5F5',
          'on-primary': '#000000',
          'on-secondary': '#FFFFFF',
          'on-accent': '#000000',
          'on-surface': '#000000',
          'on-background': '#000000'
        }
      }
    }
  }
})

// createApp(App).use(vuetify).mount('#app')

const app = createApp(App)

app.use(vuetify)
app.use(createPinia())
app.use(router)

app.provide('vuetify', vuetify)

app.mount('#app')
