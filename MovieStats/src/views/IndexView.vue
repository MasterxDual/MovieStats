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

            <v-btn class="login-btn" @click="onLogin">Iniciar Sesión</v-btn>

            <v-btn class="admin-btn" @click="onAdmin">
              <v-icon class="admin-icon" left>mdi-cog</v-icon>
              Administración
            </v-btn>
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
                    item-title="text"
                    item-value="value"
                    :return-object="false"
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
                  <v-card class="movie-card" elevation="2" color="surface">
                    <v-img :src="movie.poster" height="300" cover />
                    <v-card-title class="text-h6">{{ movie.title }}</v-card-title>
                    <v-card-subtitle>{{ movie.year }} · ★ {{ movie.rating }}</v-card-subtitle>
                    <v-card-text class="text-body-2" style="min-height: 56px;">
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
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'

// Tipado de la entidad película
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

const router = useRouter()
const vuetifyTheme = useTheme()

// Mock ampliado con género para filtros
const allMockMovies: Movie[] = [
  { id: 1, title: 'Golden Dawn', year: 2021, rating: 7.8, poster: 'https://via.placeholder.com/400x600?text=Golden+Dawn', overview: 'Una aventura dorada.', genre: 'Aventura' },
  { id: 2, title: 'Night of Stars', year: 2019, rating: 8.1, poster: 'https://via.placeholder.com/400x600?text=Night+of+Stars', overview: 'Un thriller espacial.', genre: 'Ciencia ficción' },
  { id: 3, title: 'The Last Reel', year: 2020, rating: 7.0, poster: 'https://via.placeholder.com/400x600?text=The+Last+Reel', overview: 'Drama sobre cineastas.', genre: 'Drama' },
  { id: 4, title: 'Echoes', year: 2018, rating: 6.9, poster: 'https://via.placeholder.com/400x600?text=Echoes', overview: 'Misterio psicológico.', genre: 'Misterio' },
  { id: 5, title: 'Silver Lining', year: 2022, rating: 7.4, poster: 'https://via.placeholder.com/400x600?text=Silver+Lining', overview: 'Comedia dramática.', genre: 'Comedia' },
  { id: 6, title: 'Hidden Gold', year: 2017, rating: 6.8, poster: 'https://via.placeholder.com/400x600?text=Hidden+Gold', overview: 'Aventura de búsqueda.', genre: 'Aventura' },
  { id: 7, title: 'Moonlight Saga', year: 2015, rating: 8.5, poster: 'https://via.placeholder.com/400x600?text=Moonlight+Saga', overview: 'Epopeya de ciencia ficción.', genre: 'Ciencia ficción' },
  { id: 8, title: 'Silent Echo', year: 2016, rating: 6.5, poster: 'https://via.placeholder.com/400x600?text=Silent+Echo', overview: 'Suspenso minimalista.', genre: 'Suspenso' },
  { id: 9, title: 'Amber Road', year: 2023, rating: 7.9, poster: 'https://via.placeholder.com/400x600?text=Amber+Road', overview: 'Road movie.', genre: 'Drama' },
  { id: 10, title: 'The Gold Standard', year: 2024, rating: 8.2, poster: 'https://via.placeholder.com/400x600?text=The+Gold+Standard', overview: 'Comedia satírica.', genre: 'Comedia' },
  { id: 11, title: 'Hidden Stars', year: 2020, rating: 7.1, poster: 'https://via.placeholder.com/400x600?text=Hidden+Stars', overview: 'Historia íntima.', genre: 'Drama' },
  { id: 12, title: 'Deep Horizon', year: 2014, rating: 6.7, poster: 'https://via.placeholder.com/400x600?text=Deep+Horizon', overview: 'Aventura submarina.', genre: 'Aventura' }
]

// Estado
const movies = ref<Movie[]>([])
const total = ref<number>(0)
const page = ref<number>(1)
const pageSize = ref<number>(8)
const query = ref<string>('')
const loading = ref<boolean>(false)


// filtros
const selectedGenre = ref<string>('Todos')
const selectedYear = ref<string | number>('Todos')
const minRating = ref<number>(0)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

// obtener listas para selects
const genres = computed(() => {
  const set = new Set<string>()
  set.add('Todos')
  allMockMovies.forEach(m => m.genre && set.add(m.genre))
  return Array.from(set)
})
const years = computed(() => {
  const set = new Set<number | string>()
  set.add('Todos')
  allMockMovies.forEach(m => set.add(m.year))
  return Array.from(set).sort((a, b) => (b as number) - (a as number))
})

// Simula fetch al backend (acepta filtros)
function fetchMoviesFromServerMock(q: string, p: number, ps: number, genre: string, year: string | number, minR: number): Promise<{ data: Movie[], total: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowerQ = q.trim().toLowerCase()
      let filtered = allMockMovies.slice()
      if (lowerQ) {
        filtered = filtered.filter(m => m.title.toLowerCase().includes(lowerQ))
      }
      if (genre && genre !== 'Todos') {
        filtered = filtered.filter(m => m.genre === genre)
      }
      if (year && year !== 'Todos') {
        filtered = filtered.filter(m => m.year === Number(year))
      }
      if (minR && minR > 0) {
        filtered = filtered.filter(m => m.rating >= minR)
      }
      const start = (p - 1) * ps
      const end = start + ps
      const pageItems = filtered.slice(start, end)
      resolve({ data: pageItems, total: filtered.length })
    }, 420)
  })
}

async function loadMovies(reset = false) {
  if (reset) {
    page.value = 1
    movies.value = []
  }
  loading.value = true
  const currentPage = page.value
  try {
    const res = await fetchMoviesFromServerMock(query.value, currentPage, pageSize.value, selectedGenre.value, selectedYear.value, minRating.value)
    total.value = res.total
    if (currentPage === 1) {
      movies.value = res.data
    } else {
      movies.value = [...movies.value, ...res.data]
    }
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
  router.push({ name: 'Register' }).catch(() => {})
}
function onAdmin() {
  alert('Administración (ruta no implementada)')
}

function toggleTheme() {
  const current = (vuetifyTheme.global?.name?.value as 'light' | 'dark' | 'system') ?? 'system'
  const next = current === 'dark' ? 'light' : 'dark'
  if (vuetifyTheme.global?.name) {
    vuetifyTheme.global.name.value = next
  }
  document.documentElement.setAttribute('data-theme', next)
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
}
.movie-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.35);
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
