import App from './App.vue'
import router from './router'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { ref } from 'vue'

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
  // Se establece defaultTheme a 'system' para que Vuetify detecte automáticamente el esquema de color
  // del sistema operativo o navegador (modo claro u oscuro) y aplique el tema correspondiente.
  // Esto permite usar tus colores personalizados para modo claro y oscuro sin necesidad de cambiar manualmente.
  theme: {
    defaultTheme: 'system',
    variations: false,
    themes: {
      dark: {
        dark: true,
        colors: { // Paleta basada en RegisterView.vue
          primary: '#D4AF37',      // Dorado principal para acentos
          secondary: '#c59d1bff',    // Dorado secundario
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

// exportar helper para controlar el tema desde componentes
export const appTheme = ref<'light' | 'dark' | 'system'>('system')

type VuetifyWithTheme = {
  theme?: {
    global?: {
      name?: {
        value: 'light' | 'dark' | 'system'
      }
    }
  }
}

export function setAppTheme(name: 'light' | 'dark' | 'system') {
  appTheme.value = name
  // Intentar actualizar el theme API de Vuetify si está disponible (tipado seguro)
  try {
    const v = vuetify as unknown as VuetifyWithTheme
    if (v.theme?.global?.name) {
      v.theme.global.name.value = name
    }
  } catch {
    // no hacer nada si falla
  }
  // También sincronizamos un atributo en el DOM para estilos custom si los usas
  document.documentElement.setAttribute('data-theme', name)
}

app.mount('#app')
