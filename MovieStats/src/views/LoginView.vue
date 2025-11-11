<template>
  <!-- Componente principal de registro de usuario -->
  <!-- Contenedor principal con fondo negro -->
  <v-main class="register-bg">
      <!-- Contenedor fluido que ocupa toda la altura -->
      <v-container fluid class="fill-height pa-0">
        <!-- Sección del header con botón para volver al inicio -->
        <div class="back-button-container">
          <v-btn
            variant="text"
            color="grey-lighten-1"
            @click="goBack"
            class="back-btn"
            size="small"
          >
            ← Volver al inicio
          </v-btn>
        </div>

        <!-- Área principal del contenido centrada vertical y horizontalmente -->
        <div class="main-content">
          <!-- Fila que centra el contenido -->
          <v-row justify="center" class="fill-height" align="center">
            <!-- Columna responsive que contiene el formulario -->
            <v-col cols="12" sm="10" md="8" lg="6" xl="5">
              <!-- Sección del logo de la aplicación -->
              <div class="text-center mb-6">
                <h1 class="cinema-logo">MovieStats</h1>
              </div>

              <!-- Tarjeta que contiene el formulario de registro -->
              <v-card
                class="register-card"
                elevation="0"
                rounded="lg"
              >
                <!-- Contenido de la tarjeta con padding -->
                <v-card-text class="pa-6">
                  <!-- Título principal del formulario -->
                  <p class="form-title text-center mb-2">Iniciar Sesión</p>
                  <!-- Subtítulo descriptivo -->
                  <p class="form-subtitle text-center mb-6">
                    Ingresa tus credenciales para acceder a tu cuenta
                  </p>

                  <!-- Formulario -->
                  <v-form
                    ref="formRef"
                    v-model="isFormValid"
                    @submit.prevent="handleLogin"
                  >
                    <!-- Correo electrónico -->
                    <div class="mb-3">
                      <label class="field-label"><b>Correo electrónico</b></label>
                      <v-text-field
                        v-model="formData.email"
                        placeholder="tu@email.com"
                        type="email"
                        variant="outlined"
                        density="comfortable"
                        :rules="emailRules"
                        hide-details="auto"
                        class="custom-field"
                      />
                    </div>

                    <!-- Contraseña -->
                    <div class="mb-3">
                      <label class="field-label"><b>Contraseña</b></label>
                      <v-text-field
                        v-model="formData.password"
                        placeholder="Tu contraseña"
                        :type="showPassword ? 'text' : 'password'"
                        variant="outlined"
                        density="comfortable"
                        :rules="passwordRules"
                        hide-details="auto"
                        class="custom-field"
                        :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                        @click:append-inner="showPassword = !showPassword"
                      />
                    </div>

                    <!-- Botón iniciar sesión -->
                    <v-btn
                      type="submit"
                      block
                      size="large"
                      class="create-account-btn mb-4"
                      :loading="isLoading"
                      :disabled="!isFormValid"
                    >
                      Iniciar sesión
                    </v-btn>

                    <!-- Link iniciar sesión -->
                    <div class="text-center login-link">
                      <span class="login-text">¿No tienes una cuenta? </span>
                      <v-btn
                        variant="text"
                        class="login-btn pa-0"
                        @click="goToRegister"
                      >
                        Registrate aquí
                      </v-btn>
                    </div>
                  </v-form>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-container>

      <!-- Snackbar para notificaciones -->
      <v-snackbar
        v-model="notification.show"
        :color="notification.color"
        location="top"
        timeout="4000"
      >
        {{ notification.message }}
        <template v-slot:actions>
          <v-btn
            color="white"
            variant="text"
            @click="notification.show = false"
          >
            Cerrar
          </v-btn>
        </template>
      </v-snackbar>
    </v-main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

// Referencias reactivas
const formRef = ref(null)
const isFormValid = ref(false)
const isLoading = ref(false)
const showPassword = ref(false)

// Datos del formulario (solo email + password para login)
const formData = ref({
  email: '',
  password: ''
})

// Sistema de notificaciones
const notification = ref({
  show: false,
  message: '',
  color: 'success'
})

const emailRules = [
  (v: string) => !!v || 'El correo electrónico es requerido',
  (v: string) => /.+@.+\..+/.test(v) || 'Ingresa un correo electrónico válido'
]

const passwordRules = [
  (v: string) => !!v || 'La contraseña es requerida',
  (v: string) => (v && v.length >= 6) || 'La contraseña debe tener al menos 6 caracteres'
]

/**
 * handleLogin:
 * - Llama al endpoint del backend /api/auth/login
 * - Envía { correo, contrasenia } (nombres requeridos por el DTO del backend)
 * - Almacena el token JWT en localStorage bajo la key "token" si la autenticación es exitosa
 * - Muestra notificaciones de error cuando corresponda
 */
const handleLogin = async () => {
  if (!isFormValid.value) return

  isLoading.value = true

  try {
    const payload = {
      correo: formData.value.email,
      contrasenia: formData.value.password
    }

    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    // Si la respuesta es OK (200) normalmente devuelve { token: "..." }
    if (response.ok) {
      const data = await response.json().catch(async () => {
        // fallback si no se puede parsear como json
        const txt = await response.text()
        try { return JSON.parse(txt) } catch { return { token: null } }
      })

      console.log('✅ Login response data:', data)
      console.log('📋 Data structure:', {
        hasToken: !!data?.token,
        hasIdUsuario: !!data?.idUsuario,
        keys: Object.keys(data || {})
      })

      // El backend devuelve: { token: string, idUsuario: number }
      // PERO si solo viene el token, extraemos el idUsuario del JWT
      const token = data?.token || null
      let idUsuario = data?.idUsuario || null

      // Si no viene idUsuario en la respuesta, intentar extraerlo del token JWT
      if (token && !idUsuario) {
        try {
          // Decodificar el payload del JWT (segunda parte entre los puntos)
          const payload = JSON.parse(atob(token.split('.')[1]))
          console.log('📦 JWT Payload:', payload)

          // Buscar el ID en el payload del token
          idUsuario = payload.idUsuario || payload.id || payload.userId || null

          console.log('🔍 ID Usuario extraído del token:', idUsuario)
        } catch (e) {
          console.error('❌ Error al decodificar JWT:', e)
        }
      }

      if (token && idUsuario) {
        // Guardar token para uso en llamadas posteriores
        localStorage.setItem('token', token)
        localStorage.setItem('idUser', idUsuario.toString())

        console.log('✅ Token y usuario guardados en localStorage')

        showNotification('Inicio de sesión exitoso', 'success')

        // Redirigir al catálogo o página principal
        setTimeout(() => {
          router.push('/index')
        }, 700)
      } else {
        // Respuesta OK pero sin token (raro)
        console.error('❌ Respuesta sin token o idUsuario:', data)
        showNotification('No se pudo obtener las credenciales. Contacta al administrador.', 'error')
      }
    } else {
      // Manejar errores: backend devuelve JSON con { error: "mensaje" } o string JSON
      const text = await response.text()
      let parsed = null
      let errorMessage = 'Error al autenticar'

      try {
        parsed = JSON.parse(text)
        errorMessage = parsed.error || parsed.message || text
      } catch {
        // Si no se puede parsear como JSON, usar el texto directamente
        errorMessage = text || errorMessage
      }

      console.error('❌ Error en login:', errorMessage)
      showNotification(errorMessage.replace(/["{}\\]/g, ''), 'error')
    }
  } catch (error) {
    console.error('❌ Error de conexión en login:', error)
    showNotification('No se pudo conectar con el servidor', 'error')
  } finally {
    isLoading.value = false
  }
}

const showNotification = (message: string, color = 'success') => {
  notification.value = {
    show: true,
    message,
    color
  }
}

const goToRegister = () => {
  router.push('/register')
}

const goBack = () => {
  router.push('/')
}
</script>


<style scoped>
  /* Fondo principal */
  .register-bg {
    background-color: rgb(var(--v-theme-background));
    min-height: 100vh;
  }

  /* Botón volver */
  .back-button-container {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 10;
  }

  .back-btn {
    color: rgba(var(--v-theme-on-background), 0.7) !important;
    font-size: 14px !important;
    text-transform: none !important;
    font-weight: normal !important;
  }

  .back-btn:hover {
    color: rgba(var(--v-theme-on-background), 0.9) !important;
  }

  /* Contenido principal */
  .main-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 80px 20px 40px;
  }

  /* Logo */
  .cinema-logo {
    font-size: 2rem !important;
    font-weight: 700 !important;
    color: rgb(var(--v-theme-secondary)) !important;
    margin-bottom: 0 !important;
    letter-spacing: -0.5px;
  }

  /* Card principal */
  .register-card {
    background-color: rgb(var(--v-theme-surface)) !important;
    border: 1px solid rgba(75, 85, 99, 0.3);
    max-width: 500px;
    margin: 0 auto;
  }

  /* Títulos */
  .form-title {
    color: rgb(var(--v-theme-on-surface)) !important;
    font-size: 1.5rem !important;
    margin-bottom: 8px !important;
  }

  .form-subtitle {
    color: rgba(var(--v-theme-on-surface), 0.8) !important;
    font-size: 0.9rem !important;
    line-height: 1.3;
  }

  /* Labels de campos */
  .field-label {
    color: rgb(var(--v-theme-on-surface)) !important;
    font-size: 0.9rem !important;
    font-weight: 500 !important;
    margin-bottom: 8px;
    display: block;
  }

  /* Campos de texto personalizados */
  :deep(.custom-field .v-field) {
    background-color: rgb(var(--v-theme-surface)) !important;
    border-radius: 8px !important;
  }

  :deep(.custom-field .v-field__outline) {
    --v-field-border-color: rgba(75, 85, 99, 0.6);
    --v-field-border-width: 1px;
  }

  :deep(.custom-field .v-field--focused .v-field__outline) {
    --v-field-border-color: rgb(var(--v-theme-primary)) !important;
    --v-field-border-width: 2px;
  }

  :deep(.custom-field .v-field__input) {
    color: rgb(var(--v-theme-on-surface)) !important;
    font-size: 0.9rem !important;
    padding: 10px 14px !important;
    min-height: 44px !important;
  }

  :deep(.custom-field .v-field__input::placeholder) {
    color: rgba(var(--v-theme-on-surface), 0.5) !important;
  }

  :deep(.custom-field .v-field__append-inner) {
    color: rgba(var(--v-theme-on-surface), 0.7) !important;
    padding-right: 12px;
  }

  /* Override label color when input is filled or focused */
  :deep(.custom-field .v-label.v-label--active) {
    color: rgb(var(--v-theme-on-surface)) !important;
  }

  /* Override browser autofill background and text color */
  :deep(.custom-field input:-webkit-autofill) {
    box-shadow: 0 0 0px 1000px rgb(var(--v-theme-surface)) inset !important;
    -webkit-text-fill-color: rgb(var(--v-theme-on-surface)) !important;
  }

  /* Botón crear cuenta */
  .create-account-btn {
    background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%) !important;
    color: rgb(var(--v-theme-on-primary)) !important;
    font-weight: 600 !important;
    font-size: 0.95rem !important;
    text-transform: none !important;
    letter-spacing: 0.5px;
    height: 44px !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3) !important;
  }

  .create-account-btn:hover {
    background: linear-gradient(135deg, rgb(var(--v-theme-secondary)) 0%, rgb(var(--v-theme-primary)) 100%) !important;
    box-shadow: 0 6px 16px rgba(203, 156, 2, 0.4) !important;
    transform: translateY(-1px);
  }

  .create-account-btn:disabled {
    background: rgba(75, 85, 99, 0.5) !important;
    color: rgba(190, 197, 211, 0.8) !important;
    box-shadow: none !important;
    transform: none;
  }

  /* Link de login */
  .login-link {
    margin-top: 0;
  }

  .login-text {
    color: rgba(var(--v-theme-on-surface), 0.7) !important;
    font-size: 0.9rem !important;
  }

  .login-btn {
    color: rgb(var(--v-theme-primary)) !important;
    /* font-size: 0.9rem !important;
    font-weight: 600 !important; */
    text-transform: none !important;
    text-decoration: none !important;
    min-width: auto !important;
    height: auto !important;
    padding: 0 4px !important;
  }

  .login-btn:hover {
    color: rgb(var(--v-theme-secondary)) !important;
    text-decoration: underline !important;
    background: transparent !important;
  }

  /* Animaciones */
  .register-card {
    transition: all 0.3s ease;
  }

  .register-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  }

  /* Responsive */
  @media (max-width: 600px) {
    .main-content {
      padding: 80px 16px 30px;
    }

    .cinema-logo {
      font-size: 1.75rem !important;
    }

    .form-title {
      font-size: 1.3rem !important;
    }

    .register-card {
      margin: 0 8px;
    }

    :deep(.v-card-text) {
      padding: 20px !important;
    }
  }

</style>
