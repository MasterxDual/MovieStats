
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
    defaultTheme: 'moviestats',
    themes: {
      moviestats: {
        dark: true,
        colors: {
          primary: '#00CED1', // Tu cyan
          secondary: '#1a237e', // Tu azul marino
          background: '#0D1117', // Tu negro noche
          surface: '#1a237e',
          'on-primary': '#FFFFFF',
          'on-surface': '#F8F9FA'
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

app.mount('#app')
