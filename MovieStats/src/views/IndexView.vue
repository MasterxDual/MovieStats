<template>
  <v-app>
    <v-app-bar flat class="index-app-bar" color="surface">
      <v-container fluid class="app-bar-container">
        <v-row align="center" no-gutters class="w-100 nav-row" justify="space-between">
          <!-- Left: brand with left margin -->
          <v-col cols="auto" class="d-flex align-center left-col">
            <!-- asegurar color usando la variable del tema -->
            <h3 class="brand ma-0" style="color: rgb(var(--v-theme-primary))">MovieStats</h3>
          </v-col>

          <!-- Center: search siempre centrada -->
          <v-col cols="auto" class="d-flex justify-center center-col">
            <v-text-field
              v-model="query"
              :loading="loading"
              clearable
              rounded
              dense
              hide-details
              prepend-inner-icon="mdi-magnify"
              placeholder="Buscar películas..."
              class="search-field"
            />
          </v-col>

          <!-- Right: acciones con margen a la derecha -->
          <v-col cols="auto" class="d-flex align-center actions-col right-col">
            <!-- Toggle tema: volver a añadir para que funcione -->
            <v-btn icon class="me-3 btn-icon" title="Cambiar tema" @click="toggleTheme">
              <v-icon>mdi-theme-light-dark</v-icon>
            </v-btn>

            <!-- Botón de login o menú de usuario -->
            <v-btn
              v-if="!isLoggedIn"
              class="login-btn"
              @click="onLogin"
            >
              Iniciar Sesión
            </v-btn>

            <v-menu v-else>
              <template v-slot:activator="{ props }">
                <v-btn
                  icon
                  v-bind="props"
                  class="btn-icon me-3"
                  size="large"
                >
                  <v-icon>mdi-account-circle</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item v-if="isAdmin" @click="onAdmin">
                  <template v-slot:prepend>
                    <v-icon>mdi-cog</v-icon>
                  </template>
                  <v-list-item-title>Administración</v-list-item-title>
                </v-list-item>
                <v-list-item @click="handleLogout">
                  <template v-slot:prepend>
                    <v-icon>mdi-logout</v-icon>
                  </template>
                  <v-list-item-title>Cerrar sesión</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
        </v-row>
      </v-container>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-4 content-container">
        <v-row>
          <!-- Left sidebar: filtros -->
          <v-col cols="12" md="3" class="mb-4">
            <v-card class="filters-card" elevation="2" color="surface">
              <v-card-text>
                <div class="filters-title">Filtros</div>

                <div class="filter-group">
                  <div class="filter-label">Género</div>
                  <v-select
                    v-model="selectedGenre"
                    :items="genres"
                    dense
                    hide-details
                    rounded
                    class="filter-select"
                    clearable
                  >
                  </v-select>
                </div>

                <div class="filter-group">
                  <div class="filter-label">Año</div>
                  <v-select
                    v-model="selectedYear"
                    :items="years"
                    dense
                    hide-details
                    rounded
                    class="filter-select"
                  />
                </div>

                <div class="filter-group">
                  <div class="filter-label">Puntuación Mínima</div>
                  <v-slider
                    v-model="minRating"
                    min="0"
                    max="10"
                    step="0.5"
                    hide-details
                    class="filter-slider"
                    thumb-color="primary"
                    track-color="secondary"
                  />
                  <div class="rating-value">{{ minRating }}</div>
                </div>

                <v-row class="mt-3" justify="space-between">
                  <v-btn text color="primary" @click="clearFilters">Limpiar</v-btn>
                  <v-btn color="primary" variant="tonal" @click="applyFilters">Aplicar</v-btn>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Main: catálogo más ancho -->
          <v-col cols="12" md="9">
            <v-row>
              <template v-if="loading && page === 1">
                <v-col cols="12" sm="6" md="4" lg="3" v-for="n in 8" :key="'skeleton-' + n">
                  <v-skeleton-loader type="card" />
                </v-col>
              </template>

              <template v-else-if="movies.length === 0">
                <v-col cols="12">
                  <v-alert type="info">No se encontraron películas.</v-alert>
                </v-col>
              </template>

              <template v-else>
                <v-col cols="12" sm="6" md="4" lg="3" v-for="movie in movies" :key="movie.id">
                  <v-card
                    class="movie-card"
                    elevation="2"
                    color="surface"
                    @click="goToMovieDetail(movie.id)"
                    style="cursor: pointer;"
                  >
                    <v-img :src="movie.poster" height="300" cover />
                    <v-card-title class="text-h6 movie-title">{{ movie.title }}</v-card-title>
                    <v-card-subtitle>{{ movie.year }} · ★ {{ movie.rating }}</v-card-subtitle>
                    <v-card-text class="text-body-2 movie-overview">
                      {{ movie.overview }}
                    </v-card-text>
                  </v-card>
                </v-col>
              </template>
            </v-row>

            <v-row class="mt-4" justify="center" v-if="!loading && movies.length && movies.length < total">
              <v-btn color="primary" variant="tonal" @click="loadMore">Cargar más</v-btn>
            </v-row>

            <v-row class="mt-4" justify="center" v-if="loading && page > 1">
              <v-progress-circular indeterminate color="primary" />
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'

const router = useRouter()
const vuetifyTheme = useTheme()

// Interface
interface Movie {
  id: number
  title: string
  year: number
  rating: number
  poster: string
  overview?: string
  genre?: string
  fav?: boolean
}

// Estado
const movies = ref<Movie[]>([])
const total = ref<number>(0)
const page = ref<number>(1)
const pageSize = ref<number>(8)
const query = ref<string>('')
const loading = ref<boolean>(false)

// Computed para verificar si el usuario está autenticado
const isLoggedIn = computed(() => {
  const token = localStorage.getItem('token')
  const userId = localStorage.getItem('idUser')
  return !!(token && userId)
})

// Computed para verificar si el usuario es administrador
const isAdmin = computed(() => {
  if (!isLoggedIn.value) return false

  const token = localStorage.getItem('token')
  if (!token) return false

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.rol === 'ADMIN' || payload.rol === 'admin'
  } catch (e) {
    console.error('Error al decodificar token:', e)
    return false
  }
})


// filtros
const selectedGenre = ref<string>('Todos')
const selectedYear = ref<string | number>('Todos')
const minRating = ref<number>(0)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

// Listas para los filtros (TODO: obtener del backend)
const genres = computed(() => [
  'Todos',
  'Acción',
  'Aventura',
  'Ciencia ficción',
  'Comedia',
  'Drama',
  'Misterio',
  'Suspenso',
  'Terror'
])

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  const yearsList: (string | number)[] = ['Todos']
  for (let year = currentYear; year >= 1900; year--) {
    yearsList.push(year)
  }
  return yearsList
})

// DTO que devuelve el backend
interface PeliculaDTO {
  id: number
  title: string
  year: number
  rating: number
  poster?: string | null
  overview?: string | null
  genres?: string[] | null
}

// Consulta simple al backend con paginación
async function fetchMoviesFromServer(
  page: number,
  size: number,
  q: string,
  genre: string,
  year: string | number,
  minR: number
) {
  const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

  // Construir parámetros de consulta
  const params = new URLSearchParams()
  params.append('page', String(page))
  params.append('size', String(size))

  // Parámetros opcionales (filtros)
  if (q && String(q).trim().length) params.append('q', String(q).trim())
  if (genre && genre !== 'Todos') params.append('genre', genre)
  if (year && year !== 'Todos') params.append('year', String(year))
  if (minR && minR > 0) params.append('minRating', String(minR))

  const url = `${apiBase}/api/v1/pelicula?${params.toString()}`

  console.log('🎬 Fetching movies from:', url)

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  })

  if (!response.ok) {
    console.error('❌ Error response:', response.status, response.statusText)
    throw new Error(`Error al obtener películas: ${response.status}`)
  }

  const json = await response.json()
  console.log('✅ Response data:', json)

  // Mapear el DTO del backend a nuestro modelo Movie
  const movies: Movie[] = (json.data ?? []).map((dto: PeliculaDTO) => ({
    id: dto.id,
    title: dto.title,
    year: dto.year,
    rating: dto.rating,
    poster: dto.poster ?? '',
    overview: dto.overview ?? '',
    genre: dto.genres?.[0] ?? undefined
  }))

  console.log(`📊 Mapped ${movies.length} movies, total: ${json.total}`)

  return {
    data: movies,
    total: json.total ?? 0
  }
}

// Cargar películas con paginación y filtros
async function loadMovies(reset = false) {
  if (reset) {
    page.value = 1
    movies.value = []
  }

  loading.value = true

  try {
    // ENVÍAR LOS FILTROS
    const result = await fetchMoviesFromServer(
      page.value,
      pageSize.value,
      query.value,           // ← búsqueda por texto
      selectedGenre.value,   // ← filtro género
      selectedYear.value,    // ← filtro año
      minRating.value        // ← filtro puntuación
    )

    total.value = result.total

    if (page.value === 1) {
      movies.value = result.data
    } else {
      movies.value = [...movies.value, ...result.data]
    }
  } catch (error) {
    console.error('Error cargando películas:', error)
    movies.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function loadMore() {
  if (movies.value.length < total.value) {
    page.value += 1
    loadMovies(false)
  }
}

function clearFilters() {
  selectedGenre.value = 'Todos'
  selectedYear.value = 'Todos'
  minRating.value = 0
  loadMovies(true)
}
function applyFilters() {
  loadMovies(true)
}

function onLogin() {
  router.push({ name: 'Login' }).catch(() => {})
}

function onAdmin() {
  router.push({ name: 'Admin' })
}

function toggleTheme() {
  const current = (vuetifyTheme.global?.name?.value as 'light' | 'dark' | 'system') ?? 'system'
  const next = current === 'dark' ? 'light' : 'dark'
  if (vuetifyTheme.global?.name) {
    vuetifyTheme.global.name.value = next
  }
  document.documentElement.setAttribute('data-theme', next)
}

function handleLogout() {
  // Limpiar el localStorage
  localStorage.removeItem('token')
  localStorage.removeItem('idUser')

  // Recargar la página para actualizar el estado de autenticación
  window.location.reload()
}

function goToMovieDetail(movieId: number) {
  router.push({ name: 'MovieDetail', params: { id: movieId } })

  /* Asi se puede obtener el usuario en cualquier parte con localstorage */
  // localStorage.getItem('idUser')

}

// Debounce búsqueda (se envía al "backend" por paginación)
watch(query, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    loadMovies(true)
  }, 500)
})

// vigilar cambios en filtros para recargar
watch([selectedGenre, selectedYear, minRating], () => {
  // aplica automáticamente con debounce breve
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    loadMovies(true)
  }, 250)
})

onMounted(() => {
  loadMovies(true)
})
</script>

<style scoped>
.index-app-bar {
  padding-top: 8px;
  padding-bottom: 8px;
}

/* Añadir algo de espacio en los bordes de la app-bar para que los elementos no queden pegados */
.app-bar-container {
  padding-left: 20px;
  padding-right: 20px;
}

/* Alineación: dejamos el search centrado y los extremos con margen */
.nav-row {
  align-items: center;
  gap: 16px;
}

/* Forzar que el search esté centrado en la barra */
.center-col {
  flex: 1 1 0;
  display: flex;
  justify-content: center;
}

/* Limitar ancho del search y centrarlo exactamente */
.search-field {
  width: 100%;
  max-width: 520px; /* reducido para ser más pequeño */
  margin: 0 auto;
  background: rgb(var(--v-theme-surface));
  border-radius: 8px;
  box-shadow: none;
  font-size: 0.95rem;
  padding-top: 4px;
  padding-bottom: 4px;
}

/* Margen en extremos para que no se vean pegados */
.left-col { padding-left: 8px; }
.right-col { padding-right: 8px; }

/* Ajustes para los botones de la derecha (login / admin) */
.actions-col > * { margin-left: 12px; }

/* Botón principal: relleno dorado, texto oscuro, pill */
.login-btn {
  background: linear-gradient(180deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);
  color: rgb(var(--v-theme-on-primary));
  border-radius: 24px;
  min-width: 150px;
  padding: 10px 18px;
  text-transform: none;
  font-weight: 700;
  box-shadow: none;
}

/* Botón administración: fondo oscuro/transparente con borde dorado y texto dorado */
.admin-btn {
  background: rgba(0,0,0,0.08); /* ligero fondo oscuro para destacar sobre surface */
  color: rgb(var(--v-theme-primary));
  border: 1px solid rgb(var(--v-theme-primary) / 0.22);
  border-radius: 24px;
  min-width: 160px;
  padding: 10px 14px;
  text-transform: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: none;
}

/* Icono dentro del botón admin */
.admin-icon {
  color: rgb(var(--v-theme-primary));
  font-size: 18px;
}

/* Hovers: sutiles */
.login-btn:hover { filter: brightness(0.95); }
.admin-btn:hover { background: rgba(0,0,0,0.12); }

/* Separación entre app-bar y contenido principal */
.content-container {
  margin-top: 20px; /* espacio base entre barra y catálogo */
  padding-top: 4px; /* pequeño espacio interior adicional */
}

/* Tarjeta de película con borde dorado más delgado */
.movie-card {
  border: 1px solid rgb(var(--v-theme-primary));
  border-radius: 12px;
  overflow: hidden;
  transition: transform 120ms ease, box-shadow 120ms ease;
}

/* Pequeño efecto hover para resaltar */
.movie-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.35);
}

/* Asegurar que el color del título y subtítulo se mantenga legible */
.movie-card .v-card-title,
.movie-card .v-card-subtitle {
  color: var(--v-theme-on-surface);
}

/* Ajustes responsivos: más separación en pantallas grandes */
@media (min-width: 960px) {
  .content-container {
    margin-top: 28px;
  }
}

/* Si quieres que el contenido siempre quede debajo de un app-bar fijo,
   usa margin-top mayor (ej. 72px) o calcula con la altura real del app-bar. */

.brand {
  color: rgb(var(--v-theme-primary));
  font-weight: 800;
  font-size: 2.6rem; /* aumentado */
  letter-spacing: 0.4px;
}

/* separación entre app-bar y contenido */
.content-container {
  margin-top: 20px;
  padding-top: 4px;
}

/* tarjeta película */
.movie-card {
  border: 1px solid rgb(var(--v-theme-primary));
  border-radius: 12px;
  overflow: hidden;
  transition: transform 120ms ease, box-shadow 120ms ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.movie-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.35);
}

/* Limitar el título a 2 líneas */
.movie-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
  max-height: 2.6em; /* 2 líneas */
}

/* Limitar la descripción a 3 líneas */
.movie-overview {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
  min-height: 4.5em; /* 3 líneas */
  max-height: 4.5em;
}

/* filtros: estilo similar a la foto */
.filters-card {
  border: 1px solid rgb(var(--v-theme-primary));
  border-radius: 12px;
  padding: 6px;
}
.filters-title {
  color: rgb(var(--v-theme-primary));
  font-weight: 800;
  font-size: 1.25rem;
  margin-bottom: 12px;
}
.filter-group { margin-bottom: 12px; }
.filter-label { color: rgb(var(--v-theme-primary)); font-weight: 700; margin-bottom: 6px; }
.filter-select { width: 100%; background: rgb(var(--v-theme-surface)); border-radius: 8px; }
.filter-slider { width: 100%; }
.rating-value { text-align: right; color: var(--v-theme-on-surface); font-weight: 600; }

/* botones */
.login-btn {
  background: linear-gradient(180deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);
  color: rgb(var(--v-theme-on-primary));
  border-radius: 24px;
  min-width: 150px;
  padding: 10px 18px;
  text-transform: none;
  font-weight: 700;
  box-shadow: none;
}
.admin-btn {
  background: rgba(0,0,0,0.08);
  color: rgb(var(--v-theme-primary));
  border: 1px solid rgb(var(--v-theme-primary) / 0.22);
  border-radius: 24px;
  min-width: 160px;
  padding: 10px 14px;
  text-transform: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: none;
}
.admin-icon { color: rgb(var(--v-theme-primary)); font-size: 18px; }
.btn-icon { color: rgb(var(--v-theme-on-surface)); cursor: pointer; font-size: 20px; }

/* responsivo: sidebar oculto en móviles y buscador más pequeño */
@media (max-width: 959px) {
  .filters-card { display: block; margin-bottom: 16px; }
  .brand { font-size: 2rem; }
  .search-field { max-width: 360px; }
}
</style>
