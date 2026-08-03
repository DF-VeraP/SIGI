# SIGI — Sistema de Información Geográfica de Incidentes

Sistema web para el registro, geolocalización y análisis estadístico de incidentes de seguridad ciudadana. Permite a los usuarios reportar eventos, visualizarlos en un mapa interactivo y consultar estadísticas por zona, tipo y período.

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                    Cliente (HTML/JS)                 │
│  ┌─────────┐  ┌───────────┐  ┌──────────────────┐  │
│  │  Login   │  │ Dashboard │  │   Admin Panel    │  │
│  └────┬─────┘  └─────┬─────┘  └────────┬─────────┘  │
│       └───────────────┼─────────────────┘            │
└───────────────────────┼──────────────────────────────┘
                        │ HTTP / REST
┌───────────────────────┼──────────────────────────────┐
│              Express.js (Node.js)                    │
│  ┌────────────────────────────────────────────────┐  │
│  │  Middleware: auth · error · session            │  │
│  ├────────────────────────────────────────────────┤  │
│  │  Routes: auth · geografia · incidentes ·       │  │
│  │          estadisticas · tablas · filtros        │  │
│  ├────────────────────────────────────────────────┤  │
│  │  Controllers: auth · geografia · incidentes ·  │  │
│  │               estadisticas · tablas            │  │
│  └────────────────────┬───────────────────────────┘  │
└───────────────────────┼──────────────────────────────┘
                        │ SQL (pg)
┌───────────────────────┼──────────────────────────────┐
│           PostgreSQL 15 + PostGIS 3.4                │
│  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌───────────┐  │
│  │ usuario │ │incidente │ │ barrio │ │  vereda   │  │
│  └─────────┘ └──────────┘ └────────┘ └───────────┘  │
│  ┌────────────────┐ ┌──────────────────┐             │
│  │ tipo_incidente │ │  corregimiento   │             │
│  └────────────────┘ └──────────────────┘             │
└──────────────────────────────────────────────────────┘
```

## 📋 Requisitos previos

| Herramienta | Versión mínima |
|-------------|---------------|
| Node.js     | 18 LTS        |
| PostgreSQL  | 15            |
| PostGIS     | 3.4           |
| Docker *(opcional)* | 20+   |

## ⚙️ Variables de entorno

Copie `.env.example` a `.env` y complete los valores:

```env
DB_USER=          # Usuario de PostgreSQL
DB_HOST=          # Host de la base de datos (localhost o nombre del contenedor)
DB_NAME=          # Nombre de la base de datos
DB_PASSWORD=      # Contraseña del usuario de PostgreSQL
DB_PORT=          # Puerto de PostgreSQL (por defecto: 5432)
PORT=             # Puerto del servidor Express (por defecto: 3000)
SESSION_SECRET=   # Secreto para firmar cookies de sesión
```

## 🚀 Instalación y ejecución

### Desarrollo local

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/SIGI.git
cd SIGI

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Inicializar la base de datos
psql -U $DB_USER -d $DB_NAME -f sql/schema.sql

# 5. Ejecutar en modo desarrollo (con hot-reload)
npm run dev
```

El servidor estará disponible en `http://localhost:3000`.

### Docker Compose

```bash
# Levantar todos los servicios (app + PostgreSQL/PostGIS)
docker compose up -d

# Ver logs
docker compose logs -f app
```

## 📁 Estructura del proyecto

```
SIGI/
├── config/
│   └── db.config.js          # Configuración de conexión a PostgreSQL
├── controllers/
│   ├── auth.controller.js     # Autenticación (login, logout, sesión)
│   ├── estadisticas.controller.js  # Conteos, resúmenes, rankings
│   ├── geografia.controller.js     # Consultas geoespaciales (PostGIS)
│   ├── incidentes.controller.js    # CRUD de incidentes
│   └── tablas.controller.js        # Listados y filtros para admin
├── middleware/
│   ├── auth.middleware.js     # Verificación de sesión
│   └── error.middleware.js    # Manejador global de errores
├── public/
│   ├── admin/                 # Panel de administración
│   ├── dashboard/             # Dashboard con mapa interactivo
│   ├── login/                 # Página de inicio de sesión
│   └── assets/                # Recursos estáticos compartidos
├── routes/
│   ├── auth.routes.js         # /login, /logout, /admin, /usuario
│   ├── autocompletado.routes.js  # /buscarBarrios, /buscarVeredas
│   ├── estadisticas.routes.js    # /conteoIncidente, /resumen, /top-*
│   ├── filtros.routes.js      # /filtroAnio
│   ├── geografia.routes.js    # /incidentes, /poligonoBarrio, /poligonoVereda
│   ├── incidentes.routes.js   # CRUD /incidente, /registrarIncidente
│   └── tablas.routes.js       # /incidentesTabla, /incidentesFiltroAdmin
├── sql/
│   ├── schema.sql             # Esquema completo de la base de datos
│   └── migrate_passwords.sql  # Script de migración de contraseñas a bcrypt
├── tests/
│   ├── auth.test.js           # Pruebas de autenticación
│   ├── incidentes.test.js     # Pruebas de CRUD de incidentes
│   └── estadisticas.test.js   # Pruebas de estadísticas
├── .github/
│   └── workflows/
│       └── ci.yml             # Pipeline de integración continua
├── .env.example               # Plantilla de variables de entorno
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── jest.config.js             # Configuración de Jest
├── package.json
├── db.js                      # Pool de conexiones PostgreSQL
└── server.js                  # Punto de entrada de la aplicación
```

## 🔌 API Endpoints

### Autenticación

| Método | Ruta | Descripción | Protegido |
|--------|------|-------------|-----------|
| `POST` | `/login` | Iniciar sesión | No |
| `GET` | `/logout` | Cerrar sesión | No |
| `GET` | `/usuario` | Obtener usuario activo | No |
| `GET` | `/admin` | Servir panel de administración | Sí |

### Incidentes

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/registrarIncidente` | Registrar un nuevo incidente |
| `GET` | `/incidente/:id` | Obtener incidente por ID |
| `PUT` | `/incidente/:id` | Actualizar incidente |
| `DELETE` | `/incidente/:id` | Eliminar incidente |

### Geografía (PostGIS)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/incidentes` | Listar incidentes con coordenadas |
| `GET` | `/poligonoBarrio` | Obtener geometrías de barrios |
| `GET` | `/poligonoVereda` | Obtener geometrías de veredas |
| `GET` | `/buscarBarrioPorCoordenada` | Barrio/vereda por lat,lng |

### Estadísticas

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/conteoIncidente` | Total de incidentes |
| `GET` | `/conteoPorTipo` | Conteo agrupado por tipo |
| `GET` | `/resumen` | Resumen general (robos, agresiones, etc.) |
| `GET` | `/top-zonas` | Barrio y vereda con más incidentes |
| `GET` | `/top-incidentes` | Top tipos de incidente con colores |

### Autocompletado

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/buscarBarrios?q=` | Buscar barrios por nombre |
| `GET` | `/buscarVeredas?q=` | Buscar veredas por nombre |
| `GET` | `/tiposIncidente` | Listar tipos de incidente |

### Tablas (Admin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/incidentesTabla` | Listado completo para tabla admin |
| `GET` | `/incidentesFiltroAdmin` | Listado filtrado por tipo/fecha |

## 🧪 Pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar con reporte de cobertura
npm test -- --coverage
```

## 🐳 Despliegue con Docker

```bash
# Construir y levantar
docker compose up -d --build

# Inicializar la base de datos (se ejecuta automáticamente con docker-entrypoint-initdb.d)
# El archivo sql/schema.sql se ejecuta al crear el contenedor de BD por primera vez

# Verificar que los servicios están corriendo
docker compose ps
```

## 🔒 Seguridad

- Las contraseñas se almacenan hasheadas con **bcrypt** (salt rounds: 10).
- Las sesiones se manejan con `express-session` y cookie firmada.
- Las variables sensibles se gestionan mediante archivo `.env` (no versionado).

## 📄 Licencia

ISC
