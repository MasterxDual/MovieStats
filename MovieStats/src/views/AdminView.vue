<template>
    <v-main class="admin-bg">
      <v-container fluid class="pa-6">
        <v-row align="center" justify="space-between" class="mb-4">
          <v-col cols="12" md="6" class="d-flex align-center pa-0">
            <v-btn variant="text" class="back-btn pa-0" @click="goBack">
              <v-icon left>mdi-arrow-left</v-icon>
              Volver al catálogo
            </v-btn>
            <h2 class="ml-4 admin-title">Panel de Administración</h2>
          </v-col>

          <v-col cols="12" md="6" class="d-flex justify-end pa-0">
            <v-btn color="primary" class="ma-0" @click="openAddArea" elevation="2">
              <v-icon left>mdi-plus</v-icon>
              Agregar Película
            </v-btn>
          </v-col>
        </v-row>

        <!-- Estadísticas (puedes enlazar datos reales después) -->
        <v-row class="mb-6" dense>
          <v-col cols="12" sm="4">
            <v-card class="stat-card pa-4" outlined>
              <div class="stat-label">Total de Películas</div>
              <div class="stat-value">{{ movies.length }}</div>
              <div class="stat-sub">Total en catálogo</div>
            </v-card>
          </v-col>

          <v-col cols="12" sm="4">
            <v-card class="stat-card pa-4" outlined>
              <div class="stat-label">Géneros Activos</div>
              <div class="stat-value">{{ genresCount }}</div>
              <div class="stat-sub">Categorías disponibles</div>
            </v-card>
          </v-col>

          <v-col cols="12" sm="4">
            <v-card class="stat-card pa-4" outlined>
              <div class="stat-label">Películas Recientes</div>
              <div class="stat-value">{{ recentCount }}</div>
              <div class="stat-sub">Agregadas últimamente</div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Gestión de Películas -->
        <v-card outlined class="mb-6">
          <v-card-text>
            <div class="section-header">
              <div>
                <div class="section-title">Gestión de Películas</div>
                <div class="section-sub">Administra el catálogo de películas: agregar, editar o eliminar contenido</div>
              </div>
            </div>

            <v-divider class="my-4" />

            <v-list two-line>
              <v-list-item
                v-for="movie in movies"
                :key="movie.id"
                class="movie-item"
              >
                <v-row class="w-100" align="center" no-gutters>
                  <v-col cols="8">
                    <div class="movie-title">{{ movie.title }}</div>
                    <div class="movie-meta">{{ movie.year }} • {{ movie.genre }}</div>
                  </v-col>

                  <v-col cols="2" class="d-flex">
                    <v-chip
                      small
                      :color="movie.active ? 'warning' : 'grey lighten-2'"
                      :text-color="movie.active ? 'black' : 'black'"
                      class="ma-0"
                    >
                      {{ movie.active ? 'Activa' : 'Inactiva' }}
                    </v-chip>
                  </v-col>

                  <v-col cols="2" class="d-flex justify-end">
                    <v-btn variant="outlined" small class="mr-2" @click="editMovie(movie)">
                      <v-icon left>mdi-pencil</v-icon>
                      Editar
                    </v-btn>

                    <v-btn
                      variant="text"
                      color="error"
                      small
                      :disabled="movie.disableDelete"
                      @click="deleteMovie(movie)"
                    >
                      <v-icon left>mdi-delete</v-icon>
                      Eliminar
                    </v-btn>
                  </v-col>
                </v-row>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- Agregar nueva película -->
        <v-card outlined v-if="showAddArea">
          <v-card-text>
            <div class="add-header">
              <v-icon left color="primary">mdi-plus-circle</v-icon>
              <div>
                <div class="section-title">Agregar Nueva Película</div>
                <div class="section-sub">Añadir una nueva película al catálogo con toda su información</div>
              </div>
            </div>

            <v-row class="mt-4" align="center">
              <v-col cols="12" sm="6" md="4">
                <v-text-field label="Título" v-model="newMovie.title" />
              </v-col>
              <v-col cols="6" sm="3" md="2">
                <v-text-field label="Año" v-model="newMovie.year" type="number" />
              </v-col>
              <v-col cols="6" sm="3" md="3">
                <v-text-field label="Género" v-model="newMovie.genre" />
              </v-col>
              <v-col cols="12" sm="12" md="3" class="d-flex justify-end">
                <v-btn color="primary" @click="createMovie" :loading="isLoading">
                  Crear Pelicula
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Snackbar de notificaciones -->
        <v-snackbar v-model="notification.show" :color="notification.color" location="top" timeout="3500">
          {{ notification.message }}
          <template v-slot:actions>
            <v-btn variant="text" color="white" @click="notification.show = false">Cerrar</v-btn>
          </template>
        </v-snackbar>

        <!-- Dialogo editar -->
        <v-dialog v-model="editDialog" max-width="600px">
          <v-card>
            <v-card-title>Editar Película</v-card-title>
            <v-card-text>
              <v-text-field label="Título" v-model="editModel.title" />
              <v-text-field label="Año" v-model="editModel.year" type="number" />
              <v-text-field label="Género" v-model="editModel.genre" />
              <v-switch label="Activa" v-model="editModel.active" />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn variant="text" @click="editDialog = false">Cancelar</v-btn>
              <v-btn color="primary" @click="saveEdit" :loading="isLoading">Guardar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </v-main>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, computed } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()

  // Base URL del backend (usa variable de entorno VITE_API_BASE_URL si está definida)
  const API_BASE = (import.meta.env.VITE_API_BASE_URL) || 'http://localhost:8080'
  const MOVIES_ENDPOINT = `${API_BASE}/api/v1/peliculas`

  const movies = ref([])
  const isLoading = ref(false)
  const notification = reactive({ show: false, message: '', color: 'success' })

  const showAddArea = ref(false)
  const newMovie = reactive({ title: '', year: '', genre: '' })

  const editDialog = ref(false)
  const editModel = reactive({ id: null, title: '', year: '', genre: '', active: true })

  const goBack = () => router.push('/index')
  const openAddArea = () => showAddArea.value = !showAddArea.value

  function showNotification(message, color = 'success') {
    notification.message = message
    notification.color = color
    notification.show = true
  }

  // Fetch lista de películas desde backend
  async function fetchMovies() {
    isLoading.value = true
    try {
      const res = await fetch(`${MOVIES_ENDPOINT}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      // asume que el backend devuelve un array de { id, title, year, genre, active, disableDelete? }
      movies.value = data
    } catch (err) {
      console.error('Error fetching movies', err)
      showNotification('No se pudo obtener las películas. ¿El backend está corriendo?', 'error')
    } finally {
      isLoading.value = false
    }
  }

  // Crear película -> POST /api/movies
  async function createMovie() {
    if (!newMovie.title || !newMovie.year || !newMovie.genre) {
      showNotification('Completa todos los campos', 'error')
      return
    }

    isLoading.value = true
    try {
      const body = {
        title: newMovie.title,
        year: Number(newMovie.year),
        genre: newMovie.genre,
        active: true
      }

      const res = await fetch(MOVIES_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`HTTP ${res.status} - ${text}`)
      }

      const created = await res.json()
      // Si el backend devuelve el recurso creado, lo añadimos. Si no, refrescamos la lista:
      if (created && created.id) movies.value.push(created)
      else await fetchMovies()

      newMovie.title = ''
      newMovie.year = ''
      newMovie.genre = ''
      showAddArea.value = false
      showNotification('Película creada', 'success')
    } catch (err) {
      console.error('Error creating movie', err)
      showNotification('Error al crear la película', 'error')
    } finally {
      isLoading.value = false
    }
  }

  // Edit
  function editMovie(movie) {
    editModel.id = movie.id
    editModel.title = movie.title
    editModel.year = movie.year
    editModel.genre = movie.genre
    editModel.active = movie.active ?? true
    editDialog.value = true
  }

  async function saveEdit() {
    if (!editModel.id) {
      showNotification('Película inválida', 'error')
      return
    }

    isLoading.value = true
    try {
      const res = await fetch(`${MOVIES_ENDPOINT}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editModel.id,
          title: editModel.title,
          year: Number(editModel.year),
          genre: editModel.genre,
          active: editModel.active
        })
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`HTTP ${res.status} - ${text}`)
      }

      const updated = await res.json()
      // actualizar localmente
      const idx = movies.value.findIndex(m => m.id === updated.id)
      if (idx !== -1) movies.value[idx] = updated
      else await fetchMovies()

      showNotification('Cambios guardados', 'success')
    } catch (err) {
      console.error('Error updating movie', err)
      showNotification('Error al guardar cambios', 'error')
    } finally {
      isLoading.value = false
      editDialog.value = false
    }
  }

  // Delete
  async function deleteMovie(movie) {
    if (movie.disableDelete) {
      showNotification('No se puede eliminar esta película', 'error')
      return
    }

    const confirmed = window.confirm(`¿Eliminar "${movie.title}"?`)
    if (!confirmed) return

    isLoading.value = true
    try {
      const res = await fetch(`${MOVIES_ENDPOINT}/${movie.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`HTTP ${res.status} - ${text}`)
      }

      // actualizar lista local
      const idx = movies.value.findIndex(m => m.id === movie.id)
      if (idx !== -1) movies.value.splice(idx, 1)

      showNotification('Película eliminada', 'success')
    } catch (err) {
      console.error('Error deleting movie', err)
      showNotification('Error al eliminar la película', 'error')
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    fetchMovies()
  })

  // stats simples derivados
  const genresCount = computed(() => {
    const s = new Set(movies.value.map(m => m.genre).filter(Boolean))
    return s.size
  })
  const recentCount = computed(() => {
    // ejemplo: películas con year >= (actual - 1) como "recientes"
    const y = new Date().getFullYear()
    return movies.value.filter(m => m.year >= y - 1).length
  })
</script>

  <style scoped>
  .admin-bg {
    background-color: rgb(var(--v-theme-background));
    min-height: 100vh;
  }

  .back-btn {
    color: rgba(var(--v-theme-on-background), 0.75) !important;
    text-transform: none !important;
  }

  .admin-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: rgb(var(--v-theme-on-surface));
    margin: 0;
  }

  .stat-card .stat-label {
    color: rgba(var(--v-theme-on-surface), 0.7);
    font-size: 0.85rem;
  }
  .stat-card .stat-value {
    font-size: 1.6rem;
    font-weight: 700;
    margin-top: 6px;
    color: rgb(var(--v-theme-on-surface));
  }
  .stat-card .stat-sub {
    font-size: 0.85rem;
    color: rgba(var(--v-theme-on-surface), 0.6);
    margin-top: 4px;
  }

  .movie-item {
    border: 1px solid rgba(0,0,0,0.04);
    border-radius: 8px;
    margin-bottom: 10px;
    padding: 10px;
    background: rgb(var(--v-theme-surface));
  }

  .movie-title {
    font-weight: 600;
    color: rgb(var(--v-theme-on-surface));
  }
  .movie-meta {
    font-size: 0.85rem;
    color: rgba(var(--v-theme-on-surface), 0.7);
  }

  .section-title {
    font-weight: 600;
    color: rgb(var(--v-theme-on-surface));
  }
  .section-sub {
    font-size: 0.9rem;
    color: rgba(var(--v-theme-on-surface), 0.65);
  }

  .add-header {
    display: flex;
    align-items: center;
  }
  .add-header .section-title {
    margin-left: 8px;
  }

  @media (max-width: 600px) {
    .movie-item { padding: 8px; }
  }
  </style>
