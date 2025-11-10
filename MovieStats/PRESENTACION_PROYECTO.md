# 🎬 MovieStats - Presentación del Proyecto Frontend

## Guía para Presentación con Filminas

---

## 📋 DIAPOSITIVA 1: Portada
**MovieStats - Sistema de Valoración de Películas**
- Frontend: Vue 3 + TypeScript + Vuetify 3
- Backend: Spring Boot + JWT
- Integración completa con autenticación

---

## 🎯 DIAPOSITIVA 2: Objetivo del Proyecto
**¿Qué construimos?**
- Aplicación web para visualizar y calificar películas
- Sistema de autenticación con JWT
- Catálogo de películas con filtros y búsqueda
- Vista detallada de cada película
- Sistema de votación protegido (solo usuarios autenticados)

---

## 🏗️ DIAPOSITIVA 3: Arquitectura General

**Stack Tecnológico:**
```
Frontend (Puerto 5174)
├── Vue 3 (Composition API)
├── TypeScript (tipado fuerte)
├── Vuetify 3 (Material Design)
└── Vue Router (navegación)

Backend (Puerto 8080)
├── Spring Boot
├── Spring Security + JWT
├── MySQL Database
└── API RESTful
```

**Comunicación:**
- Frontend → Backend: HTTP/HTTPS con fetch API
- Autenticación: JWT Bearer Token en headers
- CORS configurado para localhost:5174

---

## 📝 DIAPOSITIVA 4: Fase 1 - Vista de Catálogo (IndexView)

**Primer desarrollo: Pantalla principal**

**Archivo:** `src/views/IndexView.vue`

**Funcionalidades implementadas:**
1. **Listado de películas** desde API
   - Endpoint: `GET /api/v1/pelicula?page=1&size=8`
2. **Tarjetas con información:**
   - Poster, título, géneros, puntuación
3. **Navegación:**
   - Click en tarjeta → Vista de detalle
4. **Barra de búsqueda** (filtro por título)
5. **Filtros por género** (chips seleccionables)
6. **Paginación** (botones Anterior/Siguiente)

**Integración con Backend:**
```javascript
const response = await fetch(
  'http://localhost:8080/api/v1/pelicula?page=1&size=8'
)
const data = await response.json()
```

**Datos recibidos del backend:**
- Lista de películas con paginación
- Total de elementos
- Información completa de cada película

---

## 🎬 DIAPOSITIVA 5: Fase 2 - Vista Individual de Película

**Desarrollo: Pantalla de detalle**

**Archivo:** `src/views/MovieDetailView.vue`

**Desafío inicial:** Backend devolvía campos en español
- Frontend esperaba: `title`, `releaseDate`
- Backend enviaba: `nombre`, `fechaSalida`

**Solución implementada:**
```typescript
interface MovieDetail {
  idPelicula: number
  nombre: string          // ← español
  imagen: string
  fechaSalida: string     // ← español
  duracion: number
  idioma: string
  clasificacion: string
  puntuacion: number
  genero: Array<{ nombre: string }>
  sinopsis: string
  actor: string[]
  director: string
  votos: number
  puntuacionPromedio: number
}
```

**Componentes visuales:**
- Hero section con poster grande
- Chips de metadata (fecha, duración, idioma, clasificación)
- Tags de géneros
- Sinopsis completa
- Lista de actores principales
- Sistema de calificación con estrellas

**Endpoint usado:**
```
GET /api/v1/pelicula/{id}
```

---

## 🔐 DIAPOSITIVA 6: Fase 3 - Sistema de Autenticación

### **6.1 - Registro de Usuario**

**Archivo:** `src/views/RegisterView.vue`

**Formulario implementado:**
- Nombre
- Apellido
- Correo electrónico
- Contraseña (con validación)
- Confirmar contraseña

**Endpoint de registro:**
```javascript
POST /api/auth/register
Body: {
  name: string,
  last_name: string,
  email: string,
  password: string
}
```

**Validaciones:**
- Email con formato válido
- Contraseña mínimo 6 caracteres
- Confirmación de contraseña coincide
- Manejo de emails duplicados (error 400)

### **6.2 - Inicio de Sesión**

**Archivo:** `src/views/LoginView.vue`

**Endpoint de login:**
```javascript
POST /api/auth/login
Body: {
  correo: string,
  contrasenia: string
}

Response: {
  token: string,
  idUsuario: number
}
```

**JWT Token recibido contiene:**
```json
{
  "sub": "email@usuario.com",
  "nombre": "Juan",
  "apellido": "Pérez",
  "rol": "USER",
  "idUsuario": 7,
  "iat": 1699641600,
  "exp": 1699728000
}
```

**Almacenamiento:**
```javascript
localStorage.setItem('token', token)
localStorage.setItem('idUser', idUsuario)
```

---

## 🔒 DIAPOSITIVA 7: Fase 4 - Protección con JWT

**Problema inicial:** Backend no incluía `idUsuario` en el token

**Evolución del JWT:**

**Versión 1 (problema):**
```java
// JwtUtil.java - ANTES
.claim("nombre", usuario.getNombre())
.claim("apellido", usuario.getApellido())
.claim("rol", usuario.getRol())
// ❌ Faltaba idUsuario
```

**Versión 2 (solución):**
```java
// JwtUtil.java - DESPUÉS
.claim("nombre", usuario.getNombre())
.claim("apellido", usuario.getApellido())
.claim("rol", usuario.getRol())
.claim("idUsuario", usuario.getIdUsuario()) // ✅ Agregado
```

**Frontend decodifica el JWT:**
```javascript
const payload = JSON.parse(atob(token.split('.')[1]))
const idUsuario = payload.idUsuario
```

---

## ⭐ DIAPOSITIVA 8: Fase 5 - Sistema de Votación

**Funcionalidad:** Usuarios autenticados pueden calificar películas

**Componente:** Sistema de 10 estrellas en `MovieDetailView.vue`

### **8.1 - Endpoints de Votación**

**Obtener voto previo del usuario:**
```
GET /api/v1/voto/id-pelicula/{idPelicula}/id-usuario/{idUsuario}
Headers: Authorization: Bearer {token}

Response 200: { puntuacion: 8 }
Response 404: Usuario no ha votado
```

**Enviar/actualizar votación:**
```
POST /api/v1/voto/numero
Headers: 
  Authorization: Bearer {token}
  Content-Type: application/json

Body: {
  idUsuario: 7,
  idPelicula: 2,
  puntuacion: 9
}

Response 201: Voto creado
Response 302: Voto actualizado
```

### **8.2 - Flujo de Votación**

```
1. Usuario abre película
   ↓
2. Frontend verifica si está autenticado
   ↓
3. Si SÍ → Carga voto previo (GET)
   Si NO → Muestra mensaje "Debes iniciar sesión"
   ↓
4. Usuario hace click en estrellas
   ↓
5. Frontend envía voto (POST)
   ↓
6. Backend procesa y actualiza puntuación promedio
   ↓
7. Frontend recarga datos de película
```

**Protección implementada:**
```javascript
const isLoggedIn = computed(() => {
  const token = localStorage.getItem('token')
  const userId = localStorage.getItem('idUser')
  return !!(token && userId)
})

function setUserRating(rating: number) {
  if (!isLoggedIn.value) {
    showNotification('Debes iniciar sesión', 'warning')
    return
  }
  // ... enviar votación
}
```

---

## 🐛 DIAPOSITIVA 9: Desafíos y Soluciones

### **Problema 1: Error de CORS**
**Síntoma:** Peticiones bloqueadas desde frontend

**Solución en Backend:**
```java
// SecurityConfig.java
config.setAllowedOrigins(List.of(
  "http://localhost:5173", 
  "http://localhost:5174"
))
```

### **Problema 2: Error 403 Forbidden**
**Síntoma:** Backend rechazaba peticiones de votación

**Causa:** Spring Security bloqueando endpoint

**Solución:**
```java
.requestMatchers(HttpMethod.POST, "/api/v1/voto/numero")
  .permitAll()
```

### **Problema 3: Error 500 - NullPointerException**
**Síntoma:** 
```
Cannot invoke "Pelicula.getIdPelicula()" 
because "Voto.getPelicula()" is null
```

**Causa:** Backend esperaba objeto `Pelicula` completo, frontend enviaba solo `idPelicula`

**Solución propuesta (Backend):**
```java
// Crear VotoRequest DTO
public class VotoRequest {
  private Long idUsuario;
  private Long idPelicula;
  private Integer puntuacion;
}

// En el controlador
@PostMapping("/numero")
public ResponseEntity<?> add(@RequestBody VotoRequest request) {
  // Buscar Usuario por ID
  Usuario usuario = usuarioRepo.findById(request.getIdUsuario())...
  
  // Buscar Pelicula por ID
  Pelicula pelicula = peliculaRepo.findById(request.getIdPelicula())...
  
  // Crear Voto completo con relaciones
  Voto voto = new Voto();
  voto.setUsuario(usuario);
  voto.setPelicula(pelicula);
  voto.setPuntuacion(request.getPuntuacion());
  
  return votoBusiness.add(voto);
}
```

---

## 🎨 DIAPOSITIVA 10: UI/UX - Temas y Diseño

**Sistema de temas:** Light/Dark mode

**Paleta de colores personalizada:**
```javascript
// main.ts - Tema Oscuro
primary: '#D4AF37',      // Dorado principal
secondary: '#c59d1bff',  // Dorado secundario
background: '#000000',   // Negro
surface: '#1a1a1a',      // Gris oscuro

// Tema Claro
primary: '#B8941F',      // Dorado oscuro
background: '#F5F5F5',   // Gris claro
surface: '#FFFFFF'       // Blanco
```

**Componentes de UI:**
- Cards con elevation y hover effects
- Chips para metadata (género, clasificación)
- Sistema de rating visual (estrellas)
- Snackbars para notificaciones
- Loading states y spinners
- Responsive design (mobile-first)

---

## 🔄 DIAPOSITIVA 11: Gestión de Estado y Navegación

**Vue Router - Rutas configuradas:**
```javascript
// router/index.ts
const routes = [
  { path: '/', redirect: '/index' },
  { path: '/index', component: IndexView },
  { path: '/movie/:id', component: MovieDetailView },
  { path: '/login', component: LoginView },
  { path: '/register', component: RegisterView }
]
```

**LocalStorage para persistencia:**
```javascript
// Datos almacenados
- token: JWT para autenticación
- idUser: ID del usuario logueado
```

**Computeds reactivos:**
```javascript
const isLoggedIn = computed(() => {
  return !!(localStorage.getItem('token') && 
            localStorage.getItem('idUser'))
})
```

**Navegación condicional:**
- Login/Logout dinámico en app bar
- Redirección después de login exitoso
- Protección de acciones (votar requiere login)

---

## 🧪 DIAPOSITIVA 12: Testing con Postman

### **Colección de Endpoints:**

**1. Autenticación**
```
POST http://localhost:8080/api/auth/register
Body (JSON):
{
  "name": "Juan",
  "last_name": "Pérez",
  "email": "juan@test.com",
  "password": "123456"
}
```

```
POST http://localhost:8080/api/auth/login
Body (JSON):
{
  "correo": "juan@test.com",
  "contrasenia": "123456"
}
Response: Copiar el "token" para los siguientes requests
```

**2. Películas**
```
GET http://localhost:8080/api/v1/pelicula?page=1&size=8
Headers: (ninguno necesario - público)
```

```
GET http://localhost:8080/api/v1/pelicula/2
Headers: (ninguno necesario - público)
```

**3. Votación (requiere token)**
```
POST http://localhost:8080/api/v1/voto/numero
Headers:
  Authorization: Bearer {token_copiado_del_login}
  Content-Type: application/json
Body (JSON):
{
  "idUsuario": 7,
  "idPelicula": 2,
  "puntuacion": 9
}
```

```
GET http://localhost:8080/api/v1/voto/id-pelicula/2/id-usuario/7
Headers:
  Authorization: Bearer {token}
```

### **Casos de prueba importantes:**
- ✅ Login con credenciales correctas
- ❌ Login con credenciales incorrectas
- ❌ Registro con email duplicado
- ✅ Obtener películas sin autenticación
- ❌ Votar sin token (debe fallar)
- ✅ Votar con token válido
- ✅ Actualizar voto existente

---

## 📊 DIAPOSITIVA 13: Logs y Debugging

**Sistema de logs implementado en frontend:**

```javascript
// Logs para desarrollo
console.log('🎬 Fetching movies from:', url)
console.log('✅ Response data:', data)
console.log('📋 Data structure:', {...})
console.log('🔐 Verificando autenticación:', {...})
console.log('🎫 JWT Payload válido:', {...})
console.log('🎯 Enviando votación:', {...})
console.log('📤 Respuesta del servidor:', {...})
```

**Emojis para identificar tipos de log:**
- 🎬 Inicio de operación
- ✅ Operación exitosa
- ❌ Error
- 📋 Estructura de datos
- 🔐 Autenticación
- 🎫 Token JWT
- 🎯 Acción del usuario
- 📤/📥 Request/Response
- ⚠️ Advertencia
- ℹ️ Información

**DevTools - Network tab:**
- Ver todos los requests HTTP
- Verificar headers enviados
- Inspeccionar responses
- Detectar errores CORS

---

## 📁 DIAPOSITIVA 14: Estructura del Proyecto

```
MovieStats/
├── public/                    # Assets estáticos
├── src/
│   ├── views/                # Componentes de página
│   │   ├── IndexView.vue     # Catálogo de películas
│   │   ├── MovieDetailView.vue  # Detalle + votación
│   │   ├── LoginView.vue     # Inicio de sesión
│   │   └── RegisterView.vue  # Registro
│   │
│   ├── router/
│   │   └── index.ts          # Configuración de rutas
│   │
│   ├── stores/               # Pinia stores (state)
│   ├── components/           # Componentes reutilizables
│   ├── composables/          # Lógica reutilizable
│   ├── services/             # Servicios de API
│   ├── types/                # TypeScript types
│   │
│   ├── App.vue               # Componente raíz
│   └── main.ts               # Entry point + Vuetify config
│
├── package.json              # Dependencias
├── tsconfig.json             # TypeScript config
├── vite.config.ts            # Vite config
└── README.md                 # Documentación
```

**Dependencias principales:**
```json
{
  "vue": "^3.5.13",
  "vuetify": "^3.7.4",
  "vue-router": "^4.5.0",
  "typescript": "^5.6.3",
  "vite": "^6.0.1"
}
```

---

## 🚀 DIAPOSITIVA 15: Comandos de Desarrollo

**Instalación inicial:**
```bash
npm install
```

**Iniciar servidor de desarrollo:**
```bash
npm run dev
# Abre en http://localhost:5174
```

**Build para producción:**
```bash
npm run build
# Genera dist/ con archivos optimizados
```

**Preview de producción:**
```bash
npm run preview
```

**Linting:**
```bash
npm run lint
```

---

## ✨ DIAPOSITIVA 16: Características Destacadas

**1. Autenticación completa:**
- Registro de usuarios
- Login con JWT
- Persistencia de sesión
- Logout

**2. Interfaz moderna:**
- Material Design con Vuetify
- Tema claro/oscuro
- Animaciones suaves
- Responsive (móvil, tablet, desktop)

**3. Integración robusta:**
- Manejo de errores completo
- Validaciones en formularios
- Notificaciones al usuario
- Estados de carga

**4. Seguridad:**
- JWT en headers
- Validación en frontend y backend
- Rutas protegidas
- CORS configurado

**5. UX optimizada:**
- Feedback visual inmediato
- Mensajes de error claros
- Navegación intuitiva
- Carga de voto previo automática

---

## 🎓 DIAPOSITIVA 17: Aprendizajes Técnicos

**Frontend:**
- Vue 3 Composition API
- TypeScript para type safety
- Vuetify 3 components
- Manejo de estado con refs/computed
- Ciclo de vida (onMounted)
- Routing con Vue Router

**Integración Backend:**
- Consumo de API REST
- Autenticación JWT
- Manejo de CORS
- Headers de autorización
- Manejo de errores HTTP

**Debugging:**
- DevTools del navegador
- Network tab para requests
- Console logs estratégicos
- Postman para testing de API

**Resolución de problemas:**
- CORS issues
- JWT token management
- Error 500 debugging
- DTO mapping backend-frontend

---

## 🔮 DIAPOSITIVA 18: Futuras Mejoras

**Funcionalidades pendientes:**
1. **Perfil de usuario**
   - Ver votos propios
   - Editar información
   - Historial de actividad

2. **Búsqueda avanzada**
   - Filtros múltiples combinados
   - Ordenamiento personalizado
   - Autocompletado

3. **Comentarios y reseñas**
   - Escribir opiniones
   - Sistema de likes
   - Respuestas a comentarios

4. **Favoritos y listas**
   - Marcar películas favoritas
   - Crear listas personalizadas
   - Compartir listas

5. **Recomendaciones**
   - Algoritmo basado en votos
   - Películas similares
   - Tendencias

6. **Admin panel**
   - CRUD de películas
   - Gestión de usuarios
   - Moderación de contenido

---

## 📚 DIAPOSITIVA 19: Recursos y Documentación

**Documentación consultada:**
- [Vue 3 Official Docs](https://vuejs.org/)
- [Vuetify 3 Documentation](https://vuetifyjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Spring Boot REST](https://spring.io/guides/gs/rest-service/)
- [JWT.io](https://jwt.io/) - JWT debugger

**Herramientas utilizadas:**
- VS Code + Volar extension
- Chrome DevTools
- Postman
- Git/GitHub
- npm/Node.js

**Backend (Spring Boot):**
- Spring Security
- JWT (io.jsonwebtoken)
- Spring Data JPA
- MySQL

---

## 🎯 DIAPOSITIVA 20: Conclusiones

**Lo que logramos:**
✅ Sistema completo de autenticación con JWT  
✅ Catálogo de películas funcional con filtros  
✅ Vista detallada individual de películas  
✅ Sistema de votación protegido  
✅ Interfaz moderna y responsive  
✅ Integración frontend-backend completa  
✅ Manejo robusto de errores  

**Tecnologías dominadas:**
- Vue 3 + TypeScript
- Vuetify 3
- JWT Authentication
- REST API consumption
- CORS configuration
- Error handling

**Trabajo en equipo:**
- Comunicación frontend-backend
- Resolución colaborativa de problemas
- Debugging sistemático
- Testing integral

**Resultado final:**
Una aplicación web moderna, funcional y escalable para valorar películas con autenticación de usuarios.

---

## 🙏 DIAPOSITIVA 21: Agradecimientos

**Gracias por su atención**

**El equipo:**
- [Nombres de los integrantes]

**Tecnologías:**
- Vue 3, TypeScript, Vuetify
- Spring Boot, JWT, MySQL

**Contacto y repositorio:**
- GitHub: MasterxDual/MovieStats
- Branch: feature/unique_movie_screen

---

## 📌 NOTAS PARA EL PRESENTADOR

### Consejos para cada sección:

**Diapositivas 1-3 (Intro):**
- Mostrar capturas de pantalla de la app funcionando
- Diagrama de arquitectura simple
- Demo en vivo opcional

**Diapositivas 4-5 (Catálogo y Detalle):**
- Mostrar código del fetch
- Mostrar la interfaz en navegador
- Destacar el mapeo de campos en español

**Diapositivas 6-7 (Autenticación):**
- Demostrar login/registro en vivo
- Mostrar localStorage en DevTools
- Decodificar JWT en jwt.io

**Diapositiva 8 (Votación):**
- Demo de votación en vivo
- Mostrar request en Network tab
- Mostrar cambio de puntuación

**Diapositiva 9 (Desafíos):**
- Contar la historia del debugging
- Mostrar los errores que encontramos
- Explicar las soluciones implementadas

**Diapositivas 12-13 (Testing):**
- Demo en vivo con Postman
- Mostrar colección de requests
- Ejecutar algunos tests

**Diapositiva 20 (Conclusiones):**
- Resumen ejecutivo
- Destacar lo más importante
- Lecciones aprendidas

### Tiempo sugerido: 15-20 minutos
- Introducción: 2 min
- Desarrollo técnico: 10 min
- Testing y debugging: 3 min
- Conclusiones: 2 min
- Preguntas: 3 min
