<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar flat class="movie-detail-app-bar" color="surface">
      <v-container fluid class="app-bar-container">
        <v-row align="center" no-gutters>
          <v-col cols="auto">
            <v-btn icon @click="goBack" class="back-btn">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
          </v-col>
          <v-col cols="auto" class="ml-4">
            <h3 class="brand ma-0" style="color: rgb(var(--v-theme-primary))">MovieStats</h3>
          </v-col>
          <v-spacer />
          <v-col cols="auto">
            <v-btn
              v-if="!isLoggedIn"
              variant="text"
              color="primary"
              @click="goToLogin"
              class="btn-icon"
            >
              Iniciar sesión
            </v-btn>
            <v-menu v-else>
              <template v-slot:activator="{ props }">
                <v-btn
                  icon
                  v-bind="props"
                  class="btn-icon"
                >
                  <v-icon>mdi-account-circle</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="handleLogout">
                  <template v-slot:prepend>
                    <v-icon>mdi-logout</v-icon>
                  </template>
                  <v-list-item-title>Cerrar sesión</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
          <v-col cols="auto">
            <v-btn icon class="btn-icon" title="Cambiar tema" @click="toggleTheme">
              <v-icon>mdi-theme-light-dark</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-app-bar>

    <v-main>
      <!-- Loading State -->
      <v-container v-if="loading" fluid class="pa-8">
        <v-row justify="center">
          <v-col cols="12" class="text-center">
            <v-progress-circular indeterminate color="primary" size="64" />
            <p class="mt-4 text-h6">Cargando película...</p>
          </v-col>
        </v-row>
      </v-container>

      <!-- Movie Content (se muestra incluso con error si hay datos de ejemplo) -->
      <v-container v-else-if="movie" fluid class="pa-0 movie-detail-container">
        <!-- Error banner si hay problemas con el backend -->
        <v-alert v-if="error" type="warning" variant="tonal" class="ma-4" closable>
          {{ error }}
        </v-alert>

        <!-- Hero Section with Poster -->
        <v-row class="hero-section">
          <v-col cols="12" md="5" lg="4" class="poster-col">
            <v-img
              :src="movie.imagen"
              :alt="movie.nombre"
              class="movie-poster"
              cover
            />
          </v-col>

          <v-col cols="12" md="7" lg="8" class="info-col">
            <div class="movie-info-wrapper">
              <!-- Title -->
              <h1 class="movie-title">{{ movie.nombre }}</h1>

              <!-- Metadata Row -->
              <div class="metadata-row">
                <v-chip
                  class="metadata-chip"
                  size="small"
                  variant="outlined"
                  color="primary"
                >
                  <v-icon start size="small">mdi-calendar</v-icon>
                  {{ movie.fechaSalida }}
                </v-chip>

                <v-chip
                  class="metadata-chip"
                  size="small"
                  variant="outlined"
                  color="primary"
                >
                  <v-icon start size="small">mdi-clock-outline</v-icon>
                  {{ movie.duracion }} min
                </v-chip>

                <v-chip
                  class="metadata-chip"
                  size="small"
                  variant="outlined"
                  color="primary"
                >
                  <v-icon start size="small">mdi-translate</v-icon>
                  {{ movie.idioma }}
                </v-chip>

                <v-chip
                  class="metadata-chip"
                  size="small"
                  variant="outlined"
                  color="primary"
                >
                  <v-icon start size="small">mdi-alert-circle-outline</v-icon>
                  {{ movie.clasificacion }}
                </v-chip>

                <v-chip
                  class="metadata-chip rating-chip"
                  size="small"
                  color="primary"
                >
                  <v-icon start size="small">mdi-star</v-icon>
                  {{ movie.puntuacion }}/10
                </v-chip>
              </div>

              <!-- Genre Tags -->
              <div class="genre-tags">
                <v-chip
                  v-for="genre in movie.genero"
                  :key="genre.nombre"
                  class="genre-chip"
                  size="small"
                  color="primary"
                  variant="flat"
                >
                  {{ genre.nombre }}
                </v-chip>
              </div>

              <!-- Synopsis Section -->
              <div class="synopsis-section">
                <h2 class="section-title">Sinopsis</h2>
                <p class="synopsis-text">{{ movie.sinopsis }}</p>
              </div>

              <!-- Cast Section -->
              <div class="cast-section">
                <h2 class="section-title">Reparto Principal</h2>
                <div class="cast-chips">
                  <v-chip
                    v-for="actor in movie.actor"
                    :key="actor"
                    class="cast-chip"
                    size="small"
                    variant="outlined"
                  >
                    {{ actor }}
                  </v-chip>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Rating Section -->
        <v-row class="rating-section-wrapper">
          <v-col cols="12">
            <v-card class="rating-card" color="surface" elevation="2">
              <v-card-text>
                <h2 class="section-title">Califica esta película</h2>
                <p class="rating-subtitle">Tu calificación:</p>

                <!-- Mensaje para usuarios no autenticados -->
                <v-alert
                  v-if="!isLoggedIn"
                  type="info"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
                >
                  <template v-slot:prepend>
                    <v-icon>mdi-information</v-icon>
                  </template>
                  <span>
                    Debes
                    <a @click="goToLogin" class="login-link-text">iniciar sesión</a>
                    para calificar esta película
                  </span>
                </v-alert>

                <div class="star-rating">
                  <v-btn
                    v-for="star in 10"
                    :key="star"
                    icon
                    size="large"
                    variant="text"
                    @click="setUserRating(star)"
                    class="star-btn"
                    :disabled="!isLoggedIn"
                  >
                    <v-icon
                      :color="star <= userRating ? 'primary' : 'grey'"
                      size="x-large"
                    >
                      {{ star <= userRating ? 'mdi-star' : 'mdi-star-outline' }}
                    </v-icon>
                  </v-btn>
                </div>
                <p class="rating-hint">
                  {{ isLoggedIn ? 'Haz clic en las estrellas para calificar' : 'Inicia sesión para calificar' }}
                </p>

                <!-- Average Rating -->
                <div class="average-rating-section">
                  <h3 class="section-title">Calificación promedio de usuarios:</h3>
                  <div class="average-rating-display">
                    <v-icon color="primary" size="large">mdi-star</v-icon>
                    <v-icon color="primary" size="large">mdi-star</v-icon>
                    <v-icon color="primary" size="large">mdi-star</v-icon>
                    <v-icon color="primary" size="large">mdi-star</v-icon>
                    <v-icon color="primary" size="large">mdi-star</v-icon>
                    <v-icon color="primary" size="large">mdi-star</v-icon>
                    <v-icon color="grey" size="large">mdi-star-outline</v-icon>
                    <v-icon color="grey" size="large">mdi-star-outline</v-icon>
                    <span class="average-rating-text">{{ movie.puntuacionPromedio || movie.puntuacion }}/10</span>
                  </div>
                  <p class="rating-count">Basado en {{ movie.votos }} calificaciones</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- Fallback: No movie data -->
      <v-container v-else fluid class="pa-8">
        <v-alert type="info" variant="tonal">
          No se pudo cargar la información de la película.
        </v-alert>
        <v-btn color="primary" class="mt-4" @click="goBack">
          Volver al catálogo
        </v-btn>
      </v-container>
    </v-main>

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
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from 'vuetify'

// Interfaces
interface MovieDetail {
  idPelicula: number
  nombre: string
  imagen: string
  fechaSalida: string
  duracion: number
  idioma: string
  clasificacion: string
  puntuacion: number
  genero: Array<{
    nombre: string
  }>
  sinopsis: string
  actor: string[]
  director: string
  votos: number
  puntuacionPromedio?: number
}

// Composables
const router = useRouter()
const route = useRoute()
const vuetifyTheme = useTheme()

// State
const movie = ref<MovieDetail | null>(null)
const loading = ref<boolean>(true)
const error = ref<string>('')
const userRating = ref<number>(0)
const isSubmittingRating = ref<boolean>(false)

// Sistema de notificaciones
const notification = ref({
  show: false,
  message: '',
  color: 'success'
})

// Computed para verificar si el usuario está autenticado
const isLoggedIn = computed(() => {
  const token = localStorage.getItem('token')
  const userId = localStorage.getItem('idUser')
  return !!(token && userId)
})

// Fetch movie details
async function fetchMovieDetail(movieId: number) {
  loading.value = true
  error.value = ''

  try {
    const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
    const url = `${apiBase}/api/v1/pelicula/${movieId}`

    console.log('🎬 Fetching movie detail from:', url)

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudo cargar la película`)
    }

    const data = await response.json()
    console.log('✅ Raw response data:', data)
    console.log('📋 Data structure:', {
      hasId: !!data.idPelicula,
      hasNombre: !!data.nombre,
      hasImagen: !!data.imagen,
      hasGenero: !!data.genero,
      generoType: Array.isArray(data.genero) ? 'array' : typeof data.genero,
      keys: Object.keys(data)
    })

    // Map backend data to MovieDetail usando los nombres correctos del backend
    movie.value = {
      idPelicula: data.idPelicula || movieId,
      nombre: data.nombre || 'Título desconocido',
      imagen: data.imagen || 'https://via.placeholder.com/400x600?text=Sin+Poster',
      fechaSalida: data.fechaSalida || 'Fecha desconocida',
      duracion: data.duracion || 154,
      idioma: data.idioma || 'Inglés',
      clasificacion: data.clasificacion || 'Sin clasificación',
      puntuacion: data.puntuacion || 0,
      genero: Array.isArray(data.genero) ? data.genero : [],
      sinopsis: data.sinopsis || 'Sin descripción disponible.',
      actor: Array.isArray(data.actor) ? data.actor : [],
      director: data.director || 'Desconocido',
      votos: data.votos || 0,
      puntuacionPromedio: data.puntuacionPromedio || data.puntuacion || 0
    }

    console.log('✅ Mapped movie data:', movie.value)

    // Si el usuario está autenticado, cargar su voto previo
    if (isLoggedIn.value) {
      await loadUserRating(movieId)
    }
  } catch (err) {
    console.error('❌ Error fetching movie detail:', err)

    // Mostrar datos de ejemplo si el backend falla (solo para desarrollo)
    console.warn('⚠️ Usando datos de ejemplo porque el backend no respondió')
    movie.value = {
      idPelicula: movieId,
      nombre: 'Pulp Fiction',
      imagen: 'https://via.placeholder.com/400x600?text=Pulp+Fiction',
      fechaSalida: '1994-10-14',
      duracion: 154,
      idioma: 'Inglés',
      clasificacion: '+18',
      puntuacion: 8.9,
      genero: [{ nombre: 'Crimen' }, { nombre: 'Drama' }],
      sinopsis: 'Película de culto que entrelaza varias historias criminales en Los Ángeles. Vincent Vega y Jules Winnfield son dos asesinos a sueldo con filosofías muy diferentes. Marsellus Wallace es un gángster que busca venganza contra quienes lo traicionaron. Butch Coolidge es un boxeador que se niega a perder una pelea arreglada. Estas historias se entrelazan de manera no lineal.',
      actor: ['John Travolta', 'Samuel L. Jackson', 'Uma Thurman', 'Bruce Willis'],
      director: 'Quentin Tarantino',
      votos: 956,
      puntuacionPromedio: 7.8
    }

    // También establecer el error para que el usuario sepa
    error.value = `No se pudo conectar con el servidor. Mostrando datos de ejemplo. Error: ${err instanceof Error ? err.message : 'Error desconocido'}`
  } finally {
    loading.value = false
  }
}

// Actions
function goBack() {
  router.back()
}

function toggleTheme() {
  const current = (vuetifyTheme.global?.name?.value as 'light' | 'dark' | 'system') ?? 'system'
  const next = current === 'dark' ? 'light' : 'dark'
  if (vuetifyTheme.global?.name) {
    vuetifyTheme.global.name.value = next
  }
  document.documentElement.setAttribute('data-theme', next)
}

// Cargar el voto previo del usuario
async function loadUserRating(movieId: number) {
  try {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('idUser')

    if (!token || !userId) {
      return
    }

    const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
    const url = `${apiBase}/api/v1/voto/id-pelicula/${movieId}/id-usuario/${userId}`

    console.log('🔍 Cargando voto previo del usuario:', { movieId, userId, url })

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    console.log('📥 Respuesta del servidor (GET voto):', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Voto previo encontrado:', data)

      // El backend puede devolver el voto directamente o dentro de un objeto
      const puntuacion = data.puntuacion || data.voto?.puntuacion || null

      if (puntuacion !== null && puntuacion !== undefined) {
        userRating.value = puntuacion
        console.log('⭐ Voto del usuario cargado:', userRating.value)
      }
    } else if (response.status === 404) {
      console.log('ℹ️ Usuario no ha votado esta película aún')
      userRating.value = 0
    } else {
      console.warn('⚠️ Respuesta inesperada al cargar voto:', response.status)
      userRating.value = 0
    }
  } catch (err) {
    console.error('⚠️ Error al cargar voto previo:', err)
    userRating.value = 0
    // No mostrar error al usuario, es opcional
  }
}

async function setUserRating(rating: number) {
  // Verificar si el usuario está autenticado
  if (!isLoggedIn.value) {
    showNotification('Debes iniciar sesión para calificar películas', 'warning')
    return
  }

  userRating.value = rating
  console.log('User rating set to:', rating)

  // Enviar la calificación al backend
  isSubmittingRating.value = true

  try {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('idUser')
    const movieId = movie.value?.idPelicula

    console.log('🔐 Verificando autenticación:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.substring(0, 20)}...${token.substring(token.length - 20)}` : null,
      userId,
      movieId
    })

    if (!token || !userId || !movieId) {
      throw new Error('Información de autenticación o película no disponible')
    }

    // Verificar que el token sea válido decodificando el payload
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      console.log('🎫 JWT Payload válido:', {
        sub: payload.sub,
        idUsuario: payload.idUsuario,
        rol: payload.rol,
        exp: payload.exp,
        expDate: new Date(payload.exp * 1000).toLocaleString()
      })
    } catch (e) {
      console.error('❌ Token JWT inválido o malformado:', e)
      throw new Error('Token de sesión inválido. Por favor, inicia sesión nuevamente.')
    }

    const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
    const url = `${apiBase}/api/v1/voto/numero`

    // Crear el objeto Voto según tu modelo del backend
    const voto = {
      idUsuario: parseInt(userId),
      idPelicula: movieId,
      puntuacion: rating
    }

    const votoJson = JSON.stringify(voto)
    console.log('🎯 Enviando votación:', {
      movieId,
      userId,
      rating,
      url,
      voto,
      votoJson,
      votoJsonLength: votoJson.length
    })

    // TEMPORAL: Probar sin Authorization header ya que el backend tiene permitAll()
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }

    // Solo agregar Authorization si tenemos un token válido
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
      console.log('🔑 Agregando header Authorization al request')
    } else {
      console.warn('⚠️ No se agregó header Authorization (token no disponible)')
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: votoJson
    })

    console.log('📤 Respuesta del servidor (POST voto):', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    })

    // Status 201 = CREATED (nuevo voto)
    // Status 302 = FOUND (voto actualizado - aunque tu backend usa 302, HTTP estándar es 200)
    if (response.ok || response.status === 201 || response.status === 302) {
      console.log('✅ Votación enviada exitosamente - Status:', response.status)

      if (response.status === 201) {
        showNotification('¡Calificación enviada exitosamente!', 'success')
      } else if (response.status === 302) {
        showNotification('¡Calificación actualizada exitosamente!', 'success')
      } else {
        showNotification('¡Calificación registrada!', 'success')
      }

      // Recargar los detalles de la película para obtener la puntuación actualizada
      // Pero sin recargar el voto del usuario para evitar loop
      const currentRating = userRating.value
      await fetchMovieDetail(movieId)
      userRating.value = currentRating // Mantener la calificación que acaba de dar
    } else {
      // Intentar leer el body del error
      let errorData: { message?: string; error?: string } = {}
      try {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json()
        } else {
          const text = await response.text()
          errorData = { message: text || `Error ${response.status}` }
        }
      } catch {
        errorData = { message: `Error ${response.status}` }
      }

      console.error('❌ Error del servidor:', errorData)

      // Mensajes de error específicos según el código HTTP
      if (response.status === 500) {
        throw new Error('Error interno del servidor. Por favor, verifica los logs del backend. El voto no pudo ser procesado.')
      } else if (response.status === 403) {
        throw new Error('Acceso denegado. Tu sesión puede haber expirado. Por favor, cierra sesión e inicia sesión nuevamente.')
      } else if (response.status === 401) {
        throw new Error('No estás autenticado. Por favor, inicia sesión nuevamente.')
      } else if (response.status === 400) {
        throw new Error(errorData.message || 'Datos inválidos. Verifica la información enviada.')
      } else {
        throw new Error(errorData.message || errorData.error || `Error ${response.status}`)
      }
    }
  } catch (err) {
    console.error('❌ Error al enviar votación:', err)
    showNotification(
      `Error al enviar la calificación: ${err instanceof Error ? err.message : 'Error desconocido'}`,
      'error'
    )
    // Revertir la calificación en caso de error
    await loadUserRating(movie.value?.idPelicula || 0)
  } finally {
    isSubmittingRating.value = false
  }
}

function showNotification(message: string, color: string = 'success') {
  notification.value = {
    show: true,
    message,
    color
  }
}

function goToLogin() {
  router.push('/login')
}

function handleLogout() {
  // Limpiar el localStorage
  localStorage.removeItem('token')
  localStorage.removeItem('idUser')

  showNotification('Sesión cerrada exitosamente', 'success')

  // Recargar la página para actualizar el estado de autenticación
  setTimeout(() => {
    window.location.reload()
  }, 1000)
}

// Lifecycle
onMounted(() => {
  const movieId = parseInt(route.params.id as string)
  console.log('🔍 Movie ID from route:', movieId)

  if (!isNaN(movieId)) {
    fetchMovieDetail(movieId)
  } else {
    console.error('❌ Invalid movie ID:', route.params.id)
    error.value = 'ID de película inválido'
    loading.value = false
  }
})
</script>

<style scoped>
/* App Bar */
.movie-detail-app-bar {
  padding: 8px 0;
}

.app-bar-container {
  padding: 0 20px;
}

.back-btn {
  color: rgb(var(--v-theme-primary));
}

.brand {
  font-weight: 800;
  font-size: 2rem;
  letter-spacing: 0.4px;
}

.btn-icon {
  color: rgb(var(--v-theme-on-surface));
}

/* Hero Section */
.hero-section {
  background: linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9));
  min-height: 600px;
}

.poster-col {
  padding: 40px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.movie-poster {
  border-radius: 16px;
  border: 2px solid rgb(var(--v-theme-primary));
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  max-height: 650px;
  width: 100%;
  max-width: 450px;
}

.info-col {
  padding: 40px 48px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.movie-info-wrapper {
  width: 100%;
}

.movie-title {
  color: rgb(var(--v-theme-primary));
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 24px;
  line-height: 1.3;
  word-wrap: break-word;
}

/* Metadata */
.metadata-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.metadata-chip {
  font-weight: 600;
  border-color: rgb(var(--v-theme-primary));
}

.rating-chip {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

/* Genre Tags */
.genre-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 32px;
}

.genre-chip {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  font-weight: 700;
}

/* Synopsis */
.synopsis-section {
  margin-bottom: 32px;
}

.section-title {
  color: rgb(var(--v-theme-primary));
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 16px;
  margin-top: 8px;
}

.synopsis-text {
  color: rgb(var(--v-theme-on-surface));
  font-size: 1.05rem;
  line-height: 1.8;
  text-align: justify;
}

/* Cast */
.cast-section {
  margin-bottom: 24px;
}

.cast-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cast-chip {
  border-color: rgb(var(--v-theme-primary));
}

/* Rating Section */
.rating-section-wrapper {
  padding: 48px;
  max-width: 1400px;
  margin: 0 auto;
}

.rating-card {
  border: 2px solid rgb(var(--v-theme-primary));
  border-radius: 16px;
  padding: 32px;
}

.rating-subtitle {
  color: rgb(var(--v-theme-on-surface));
  font-size: 1rem;
  margin-bottom: 16px;
}

.star-rating {
  display: flex;
  gap: 4px;
  justify-content: flex-start;
  margin-bottom: 8px;
}

.star-btn {
  transition: transform 0.2s ease;
}

.star-btn:hover {
  transform: scale(1.2);
}

.rating-hint {
  color: rgb(var(--v-theme-on-surface));
  font-size: 0.875rem;
  opacity: 0.7;
  margin-bottom: 32px;
}

.star-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.star-btn:disabled:hover {
  transform: none;
}

.login-link-text {
  color: rgb(var(--v-theme-primary));
  cursor: pointer;
  text-decoration: underline;
  font-weight: 600;
}

.login-link-text:hover {
  color: rgb(var(--v-theme-secondary));
}

/* Average Rating */
.average-rating-section {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid rgba(var(--v-theme-primary), 0.3);
}

.average-rating-display {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 16px 0;
}

.average-rating-text {
  color: rgb(var(--v-theme-primary));
  font-size: 1.5rem;
  font-weight: 700;
  margin-left: 16px;
}

.rating-count {
  color: rgb(var(--v-theme-on-surface));
  font-size: 0.875rem;
  opacity: 0.7;
}

/* Responsive */
@media (max-width: 959px) {
  .hero-section {
    min-height: auto;
  }

  .movie-title {
    font-size: 1.75rem;
  }

  .poster-col {
    padding: 24px;
  }

  .info-col {
    padding: 24px;
  }

  .rating-section-wrapper {
    padding: 24px;
  }

  .movie-poster {
    max-height: 500px;
  }

  .star-rating {
    justify-content: center;
  }

  .synopsis-text {
    text-align: left;
  }
}

@media (max-width: 599px) {
  .movie-title {
    font-size: 1.5rem;
  }

  .section-title {
    font-size: 1.25rem;
  }

  .metadata-row {
    justify-content: center;
  }

  .genre-tags {
    justify-content: center;
  }
}
</style>
