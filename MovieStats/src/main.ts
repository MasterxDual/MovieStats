
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
  // Personalización de paleta de colores basada en los estilos de RegisterView.vue (modo oscuro con dorados)
  theme: {
    defaultTheme: 'dark',
    variations: false,
    themes: {
      dark: {
        dark: true,
        colors: { // Paleta basada en RegisterView.vue
          primary: '#D4AF37',      // Dorado principal para acentos
          secondary: '#B8941F',    // Dorado secundario
          accent: '#FFD700',       // Amarillo brillante para toques extra
          background: '#000000',   // Fondo negro
          surface: '#1a1a1a',      // Superficie para cards y campos
          'on-primary': '#000000',   // Texto negro sobre primario
          'on-secondary': '#FFFFFF', // Texto blanco sobre secundario
          'on-accent': '#000000',    // Texto negro sobre acento
          'on-surface': '#F9FAFB',   // Texto claro sobre superficies oscuras
          'on-background': '#F9FAFB'// Texto claro sobre fondo oscuro
        },
      },
      light: {
        dark: false,
        colors: {
          primary: '#B8941F',      // Dorado oscuro para contraste en claro
          secondary: '#D4AF37',    // Dorado más claro
          accent: '#E1A40C',       // Naranja/dorado para acentos
          background: '#F5F5F5',   // Fondo gris muy claro
          surface: '#FFFFFF',      // Superficie blanca para cards
          'on-primary': '#FFFFFF',   // Texto blanco sobre primario
          'on-secondary': '#000000', // Texto negro sobre secundario
          'on-accent': '#000000',    // Texto negro sobre acento
          'on-surface': '#000000',   // Texto negro sobre superficies claras
          'on-background': '#000000'// Texto negro sobre fondo claro
        },
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
