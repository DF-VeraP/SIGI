# ESPECIFICACIONES TÉCNICAS DEL SISTEMA (ETS)
## Sistema de Información Geográfica de Incidentes — SIGI
**Documento de Ingeniería y Arquitectura Tecnológica**

---

### Control del Documento
- **Proyecto:** SIGI - Sistema de Información Geográfica de Incidentes
- **Institución:** Servicio Nacional de Aprendizaje (SENA)
- **Programa:** Análisis y Desarrollo de Software (ADSO) - Ficha 3142784
- **Autor:** Daniel Felipe Vera Perdomo
- **Localización:** Florencia, Caquetá, Colombia
- **Despliegue Oficial en Producción:** [https://sigi.verapd.xyz](https://sigi.verapd.xyz)
- **Versión:** 2.1 (Actualización integral con Arquitectura Limpia, Capa de Modelos, Machine Learning, WebSockets y PWA)
- **Fecha de Emisión:** Octubre 2026
- **Clasificación:** Documento Técnico Oficial

---

## ÍNDICE GENERAL

1. [INTRODUCCIÓN Y OBJETIVOS TÉCNICOS](#1-introducción-y-objetivos-técnicos)
   1.1 [Propósito](#11-propósito)
   1.2 [Alcance de las Especificaciones](#12-alcance-de-las-especificaciones)
2. [ARQUITECTURA GENERAL DEL SISTEMA](#2-arquitectura-general-del-sistema)
   2.1 [Estilo Arquitectónico y Desacoplamiento (Clean Architecture)](#21-estilo-arquitectónico-y-desacoplamiento-clean-architecture)
   2.2 [Topología de Despliegue Físico y Lógico](#22-topología-de-despliegue-físico-y-lógico)
   2.3 [Interacción de Componentes y Protocolos de Comunicación](#23-interacción-de-componentes-y-protocolos-de-comunicación)
3. [STACK TECNOLÓGICO DETALLADO](#3-stack-tecnológico-detallado)
   3.1 [Capa de Presentación y PWA (Frontend)](#31-capa-de-presentación-y-pwa-frontend)
   3.2 [Capa de Lógica de Negocio, Machine Learning y API (Backend)](#32-capa-de-lógica-de-negocio-machine-learning-y-api-backend)
   3.3 [Capa de Modelos y Datos Espaciales (Database & ORM Layer)](#33-capa-de-modelos-y-datos-espaciales-database--orm-layer)
   3.4 [Servicios Externos y Cloud Integrados](#34-servicios-externos-y-cloud-integrados)
4. [ESPECIFICACIONES DE INFRAESTRUCTURA Y HARDWARE](#4-especificaciones-de-infraestructura-y-hardware)
   4.1 [Requerimientos del Servidor de Producción](#41-requerimientos-del-servidor-de-producción)
   4.2 [Requerimientos para Estaciones de Trabajo Administrativas](#42-requerimientos-para-estaciones-de-trabajo-administrativas)
   4.3 [Requerimientos para Dispositivos Móviles de Campo (Reportero)](#43-requerimientos-para-dispositivos-móviles-de-campo-reportero)
   4.4 [Requerimientos de Red y Conectividad](#44-requerimientos-de-red-y-conectividad)
5. [ARQUITECTURA DE SEGURIDAD Y PROTECCIÓN](#5-arquitectura-de-seguridad-y-protección)
   5.1 [Seguridad en Transporte y Cabeceras HTTP](#51-seguridad-en-transporte-y-cabeceras-http)
   5.2 [Modelo Criptográfico y Gestión de Sesiones](#52-modelo-criptográfico-y-gestión-de-sesiones)
   5.3 [Control de Acceso Basado en Roles (RBAC) y Guards](#53-control-de-acceso-basado-en-roles-rbac-y-guards)
   5.4 [Estrategia de Mitigación de Ataques (DDoS, Brute Force, Injection)](#54-estrategia-de-mitigación-de-ataques-ddos-brute-force-injection)
6. [ESPECIFICACIONES DE CONFIGURACIÓN Y VARIABLES DE ENTORNO](#6-especificaciones-de-configuración-y-variables-de-entorno)
   6.1 [Diccionario de Variables de Entorno (.env)](#61-diccionario-de-variables-de-entorno-env)
   6.2 [Gestión de Secretos y Fallbacks de Desarrollo](#62-gestión-de-secretos-y-fallbacks-de-desarrollo)
7. [ESTÁNDARES DE CALIDAD, PRUEBAS Y MANTENIMIENTO](#7-estándares-de-calidad-pruebas-y-mantenimiento)
   7.1 [Estrategia de Pruebas Automatizadas (Jest & Supertest - 70/70 Tests)](#71-estrategia-de-pruebas-automatizadas-jest--supertest---7070-tests)
   7.2 [Políticas de Respaldo y Recuperación de la Base de Datos](#72-políticas-de-respaldo-y-recuperación-de-la-base-de-datos)

---

## 1. INTRODUCCIÓN Y OBJETIVOS TÉCNICOS

### 1.1 Propósito
El propósito de este documento es definir con rigor técnico y formal los lineamientos de arquitectura, especificaciones de hardware, software, red, seguridad e integraciones en la nube que sostienen al **Sistema de Información Geográfica de Incidentes (SIGI)**. Este documento complementa la **Especificación de Requisitos de Software (ERS IEEE 830)** y sirve de guía técnica para auditores de infraestructura, administradores de sistemas y desarrolladores.

### 1.2 Alcance de las Especificaciones
Comprende la totalidad del ciclo de vida técnico del sistema:
- Definición formal de las capas físicas y lógicas del sistema bajo principios de Clean Architecture.
- Modelado de flujos de integración con la nube para ingesta multimedia (Cloudinary), transporte transaccional (SMTP/Nodemailer) y comunicación push (Socket.io).
- Especificación del motor de Inteligencia Artificial (Naive Bayes, DBSCAN, Series de Tiempo) y generación de reportes (PDFKit).
- Especificación de las medidas de hardening de seguridad (Helmet, Rate Limiting, RBAC, Cifrado Bcrypt, Redmean).
- Requerimientos de hardware para despliegue On-Premise y en la nube en **https://sigi.verapd.xyz**.
- Estrategia de pruebas automatizadas y aseguramiento de la calidad del software (100% pruebas unitarias e integración aprobadas).

---

## 2. ARQUITECTURA GENERAL DEL SISTEMA

### 2.1 Estilo Arquitectónico y Desacoplamiento (Clean Architecture)
SIGI implementa una arquitectura limpia desacoplada por capas (*Layered Clean Architecture*):

1. **Capa 1: Presentación y Cliente PWA (Frontend):**
   Aplicación web responsiva construida con HTML5 semántico, CSS3 modular y JavaScript nativo asíncrono (Vanilla ES6+). Incorpora soporte para Progressive Web App (PWA) con Service Worker (`sw.js`) y cola de almacenamiento local para contingencias sin conexión.
2. **Capa 2: Aplicación, WebSockets y Servicios (Backend API REST):**
   Servidor de alto rendimiento construido sobre **Node.js (v20+)** y el framework **Express (v5.x)**, articulado con el motor de eventos en tiempo real **Socket.io**. Desacopla la lógica de negocio en una capa de **Servicios** (`services/ml.service.js`, `utils/mailer.js`, `utils/cloudinary.js`) y orquesta los flujos mediante controladores limpios.
3. **Capa 3: Modelos de Dominio y Acceso a Datos (Model Layer):**
   Capa de abstracción que aísla las consultas SQL de los controladores (`models/incidente.model.js`, `models/usuario.model.js`, `models/catalogos.model.js`, `models/estadisticas.model.js`, `models/geografia.model.js`). Gestiona la interacción con el pool centralizado de conexiones PostgreSQL (`config/db.js`).
4. **Capa 4: Datos y Cómputo Espacial (Database):**
   Motor relacional **PostgreSQL 15+** potenciado por la extensión geoespacial **PostGIS 3.3+**. Gestiona relaciones transaccionales ACID y cálculo de topologías vectoriales (intersecciones de geometrías, cálculo de distancias, contención espacial en barrios y veredas).

```
+---------------------------------------------------------------------------------------------------+
|                                      CLIENTE (FRONTEND & PWA)                                     |
|   +--------------------------+  +--------------------------+  +-------------------------------+   |
|   |   Módulo Ciudadano       |  |   Módulo Reportero Móvil |  |  Módulo Gestión Admin/Super   |   |
|   |  - Visor Leaflet / KPIs  |  |  - Formulario GPS / PWA  |  |  - Mesa Validación / Candados |   |
|   |  - Alertas WebSocket     |  |  - Asistente IA Predictivo|  |  - Reportes PDF / Hotspots   |   |
|   +-------------+------------+  +-------------+------------+  +---------------+---------------+   |
+-----------------|-----------------------------|--------------------------------|------------------+
                  |                             |                                |
                  +-----------------------------+--------------------------------+
                                                |
                                    HTTPS / WSS / JSON / Multipart
                                                v
+---------------------------------------------------------------------------------------------------+
|                                      CAPA DE SERVIDOR BACKEND                                     |
|   +-------------------------------------------------------------------------------------------+   |
|   |                  Node.js Runtime v20+ / Express v5.x Engine + Socket.io Server            |   |
|   +-------------------------------------------------------------------------------------------+   |
|   | [Security Stack] Helmet | Express-Rate-Limit | Express-Session (HttpOnly) | CORS          |   |
|   +-------------------------------------------------------------------------------------------+   |
|   | [Controladores] auth | incidentes | catalogos | estadisticas | geografia | ml | reportes  |   |
|   +-------------------------------------------------------------------------------------------+   |
|   | [Servicios] ml.service (Naive Bayes/DBSCAN/Forecast) | mailer | cloudinary | pdfGenerator |   |
|   +-------------------------------------------------------------------------------------------+   |
|   | [Capa de Modelos] IncidenteModel | UsuarioModel | CatalogosModel | EstadisticasModel      |   |
|   +---------------------------------------------+---------------------------------------------+   |
+-------------------------------------------------|-------------------------------------------------+
                                                  |
                         Consultas Parametrizadas | Pool config/db.js
                                                  v
+-------------------------------------------------+   +---------------------------------------------+
|                  CAPA DE DATOS                  |   |               SERVICIOS CLOUD               |
|  - PostgreSQL 15+ Engine (Pool pg)              |   |  - Despliegue en https://sigi.verapd.xyz    |
|  - PostGIS Extension 3.3+ (EPSG:4326)           |   |  - Cloudinary Media CDN (Imágenes WebP)     |
|  - Índices GiST (Polígonos & Puntos)            |   |  - SMTP Relay / Nodemailer (Correos)        |
+-------------------------------------------------+   +---------------------------------------------+
```

### 2.2 Topología de Despliegue Físico y Lógico
El sistema opera en producción bajo la siguiente topología de infraestructura:
- **Despliegue Oficial en Producción:**
  - **Dominio Público FQDN:** **https://sigi.verapd.xyz**
  - **Servidor Web y Reverse Proxy:** Nginx con terminación SSL/TLS (Certificado Let's Encrypt), HTTP/2 habilitado y proxy passthrough para WebSockets (`Upgrade: websocket`).
  - **Servidor de Aplicación:** Node.js administrado como servicio Daemon o mediante PM2 con cluster de reinicio automático.
  - **Base de Datos:** PostgreSQL 15+ con extensión espacial PostGIS activada y pool optimizado de conexiones en `config/db.js`.
  - **CDN de Evidencias:** Cloudinary Media Storage con entrega optimizada WebP.
  - **Pasarela de Correo:** Servidor SMTP seguro con credenciales de aplicación.

### 2.3 Interacción de Componentes y Protocolos de Comunicación
- **Frontend <-> Backend (REST):** Protocolo **HTTPS/1.1 o HTTP/2**. Intercambio de datos formateados en `application/json` y cargas binarias bajo `multipart/form-data`.
- **Frontend <-> Backend (Tiempo Real):** Protocolo **WSS (WebSocket Seguro)** mediante Socket.io para emisión y escucha de eventos reactivos (`nuevo_incidente`, `incidente_actualizado`).
- **Backend <-> Base de Datos:** Protocolo nativo PostgreSQL sobre TCP/IP con pooling persistente gestionado por `config/db.js` y clases en `models/`.
- **Backend <-> Cloudinary:** Llamadas HTTPS firmadas mediante SDK v2 para subida directa de buffers de memoria sin guardado en disco local.
- **Backend <-> Servidor SMTP:** Conexión cifrada **TLS/STARTTLS** sobre los puertos 587 o 465 mediante Nodemailer.

---

## 3. STACK TECNOLÓGICO DETALLADO

### 3.1 Capa de Presentación y PWA (Frontend)
- **HTML5:** Marcado semántico para accesibilidad y SEO estructurado.
- **CSS3 Puro:** Diseño modular responsivo con CSS Custom Properties (variables CSS), Flexbox y CSS Grid. Sistema visual tipo *Glassmorphism* con paletas cromáticas contrastadas.
- **JavaScript (ES6+):** Programación asíncrona nativa (`async/await`, Fetch API), manipulación del DOM sin dependencia de jQuery ni frameworks pesados.
- **Motor Cartográfico:** **Leaflet.js v1.9.4**. Biblioteca ligera para representación de capas raster (OpenStreetMap, CartoDB Positron, Esri World Imagery) y vectoriales GeoJSON con listeners de eventos y popups interactivos.
- **Motor de Analítica Visual:** **Chart.js v4.4**. Renderizado en lienzo `<canvas>` de gráficos de barras, líneas y sectores con adaptación a pantallas móviles.
- **Arquitectura PWA y Modo Desconectado:**
  - `public/sw.js`: Service Worker que intercepta peticiones de red y cachea activos estáticos esenciales (HTML, CSS, JS, tiles base).
  - `public/js/pwa-offline.js`: Manejador de estado de red (`navigator.onLine`), persistencia no volátil en `localStorage` (`sigi_cola_incidentes_offline`) y auto-sincronización secuencial al detectar retorno de conectividad.
  - `public/manifest.json`: Manifiesto de aplicación web instalable en dispositivos móviles con iconos institucionales y orientación responsiva.
- **Tiempo Real y Síntesis Sonora en Cliente:**
  - `public/js/sigi-realtime.js`: Cliente Socket.io para escucha reactiva de eventos `nuevo_incidente` e `incidente_actualizado`.
  - **Web Audio API:** Generación procedural de osciladores de onda senoidal (frecuencias 587.33 Hz [D5] a 880.00 Hz [A5]) con decaimiento de ganancia exponencial para avisos sonoros sutiles sin requerir la descarga de archivos `.mp3` o `.wav`.
- **Asistente Inteligente en Cliente:**
  - `public/js/sigi-ml-assistant.js`: Detector de eventos de escritura con debouncing de 600 ms que consulta la API de Machine Learning y proyecta en tiempo real badges de tipología, severidad y servicios de emergencia sugeridos.

### 3.2 Capa de Lógica de Negocio, Machine Learning y API (Backend)
- **Entorno de Ejecución:** Node.js (v20.x LTS o v22.x).
- **Framework Web:** Express v5.2.1.
- **Motor de Eventos en Tiempo Real:** **Socket.io v4.8+**, implementando WebSockets bidireccionales con canal de broadcast hacia clientes administrativos y mapa cívico.
- **Motor de Inteligencia Artificial (NLP & Spatial ML):**
  - `services/ml.service.js`:
    1. *Clasificador NLP Supervisado:* **Multinomial Naive Bayes** con suavizado de Laplace y análisis léxico ponderado para tipologías delictivas colombianas.
    2. *Estimador de Gravedad y Heurística de Riesgo:* Detección de disparadores críticos (armas, fuego, sangre, menores de edad) en escala 1 a 5 y sugerencia de auxilio institucional (Policía, Ambulancia, Bomberos).
    3. *Clustering Espacial No Supervisado:* **DBSCAN** (*Density-Based Spatial Clustering of Applications with Noise*) para identificación matemática de núcleos de concentración (*Hotspots*) ignorando dispersiones aleatorias.
    4. *Forecasting Temporal:* Suavizado exponencial y análisis de medias móviles para predicción de volumen criminal del siguiente ciclo mensual.
- **Motor de Generación Documental:**
  - `pdfkit v0.15+`: Compilador nativo de documentos vectorizados PDF de tamaño carta con membrete institucional, balance estadístico, matrices de delitos y gráficos vectoriales entregados por streaming HTTP.
- **Seguridad HTTP:**
  - `helmet v8.3.0`: Establecimiento de directivas HTTP protectoras y políticas de cabecera.
  - `express-rate-limit v8.7.0`: Prevención de ataques de denegación de servicio y fuerza bruta en rutas de autenticación.
  - `cors v2.8.6`: Control granular de intercambio de recursos de origen cruzado.
- **Manejo de Sesión y Autenticación:**
  - `express-session v1.19.0`: Manejo de sesiones de usuario persistentes con cookies firmadas (`HttpOnly`, `SameSite=Lax`).
  - `bcrypt v6.0.0`: Algoritmo de hash de contraseñas de un solo sentido con salt automático (10 rounds).
- **Ingesta de Archivos y Parseo:**
  - `multer v2.2.0`: Procesamiento de multipart/form-data mediante almacenamiento en memoria (`memoryStorage`).
  - `csv-parser v3.2.1`: Streaming de alta velocidad para la importación masiva de incidentes.
- **Mensajería Transaccional:**
  - `nodemailer v10.0.1`: Cliente SMTP con soporte para plantillas HTML responsivas y modo simulador de desarrollo.

### 3.3 Capa de Modelos y Datos Espaciales (Database & ORM Layer)
- **Patrón de Capa de Modelos (Clean Architecture):**
  - `models/incidente.model.js`: Abstracción de persistencia, filtros geoespaciales, bloqueo concurrente (`id_admin_revisor`), dictamen y conteo de incidentes.
  - `models/usuario.model.js`: Gestión de usuarios, autenticación Bcrypt, tokens de recuperación, activación/inactivación y protección del último Superadministrador activo (`contarSuperadminsActivos`).
  - `models/catalogos.model.js`: Mantenimiento de tipos y categorías de incidentes, validación cromática perceptual (Redmean $\Delta C < 85$) e integridad referencial anti-borrado.
  - `models/estadisticas.model.js`: Consultas de agregación SQL para KPIs, distribución por tipologías y extracción de métricas para informes PDF.
  - `models/geografia.model.js`: Extracción de polígonos GeoJSON de barrios y veredas mediante funciones espaciales PostGIS.
  - `config/db.js`: Pool centralizado de conexiones PostgreSQL con proxies de compatibilidad regresiva (`db.js`).
- **Motor RDBMS:** PostgreSQL v15+ (Compatible con v16).
- **Extensión Espacial:** PostGIS v3.3+.
- **Sistemas de Coordenadas de Referencia (CRS):**
  - **SRID 4326 (WGS84):** Estándar global de coordenadas GPS (latitud y longitud) en grados decimales.
- **Indexación y Optimización:**
  - Índices espaciales **GiST (Generalized Search Tree)** sobre columnas geométricas (`geom`).
  - Índices B-Tree en llaves foráneas (`id_estado`, `id_usuario`, `fechaincidente`, `token`).
  - Transacciones con control de aislamiento `READ COMMITTED`.

### 3.4 Servicios Externos y Cloud Integrados
- **Cloudinary:** Gestión cloud de activos multimedia. Utilizado para recibir imágenes directamente del reportero, optimizarlas automáticamente a formato WebP, aplicar compresión sin pérdida y distribuirlas globalmente mediante URLs seguras con CDN.
- **Servidor SMTP (Simple Mail Transfer Protocol):** Relay de mensajería para alertas de bienvenida a nuevos usuarios, reseteo de claves y notificaciones del sistema.

---

## 4. ESPECIFICACIONES DE INFRAESTRUCTURA Y HARDWARE

### 4.1 Requerimientos del Servidor de Producción

| Parámetro | Requerimiento Mínimo | Requerimiento Recomendado |
| :--- | :--- | :--- |
| **Procesador (CPU)** | 2 Cores vCPU x86_64 a 2.0 GHz | 4 Cores vCPU a 2.5 GHz o superior |
| **Memoria RAM** | 4 GB DDR4 | 8 GB DDR4 o superior |
| **Almacenamiento en Disco** | 40 GB SSD (NVMe recomendado) | 80 GB SSD NVMe |
| **Sistema Operativo** | Ubuntu Server 22.04 LTS / Debian 12 | Ubuntu Server 24.04 LTS / Rocky Linux 9 |
| **Entorno de Red** | Conexión simétrica de 50 Mbps | Conexión simétrica de 100 Mbps o superior |
| **Dirección IP** | IP Pública Estática / Dominio FQDN | IP Estática con certificado SSL/TLS (Let's Encrypt) |

### 4.2 Requerimientos para Estaciones de Trabajo Administrativas (Admin / Superadmin)
- **Equipo:** Computador de escritorio o portátil.
- **CPU:** Intel Core i3 / AMD Ryzen 3 de 8ª generación o superior.
- **Memoria RAM:** 4 GB mínimo (8 GB recomendado).
- **Pantalla:** Resolución mínima 1366x768 píxeles (1920x1080 Full HD recomendado para panel cartográfico).
- **Navegador Web:** Google Chrome 115+, Mozilla Firefox 115+, Microsoft Edge 115+.

### 4.3 Requerimientos para Dispositivos Móviles de Campo (Reportero)
- **Dispositivo:** Smartphone o Tablet con sistema operativo Android 9.0+ o iOS 14.0+.
- **Hardware Integrado:** Módulo receptor GPS/GNSS con precisión de al menos 10 metros y Cámara digital de 8 Megapíxeles o superior.
- **Navegador Móvil:** Google Chrome Mobile, Safari Mobile, Samsung Internet o Firefox Mobile con permisos activos de geolocalización y acceso a cámara.
- **Conectividad:** Conexión de datos móviles 3G/4G/5G o red Wi-Fi.

### 4.4 Requerimientos de Red y Conectividad
- **Puertos de Red Requeridos en Servidor:**
  - Puerto 80 (HTTP): Redirección obligatoria a HTTPS.
  - Puerto 443 (HTTPS): Tráfico seguro web y API REST.
  - Puerto 5432 (PostgreSQL): Restringido estrictamente a `localhost` o red privada VPN.
  - Puertos 587 / 465 (Salida): Habilitados hacia el proveedor SMTP externo.
- **Salida hacia Cloudinary:** Habilitada hacia los endpoints `*.cloudinary.com` en puerto 443.

---

## 5. ARQUITECTURA DE SEGURIDAD Y PROTECCIÓN


### 5.1 Seguridad en Transporte y Cabeceras HTTP
La seguridad de borde y de transporte se implementa mediante la integración de **Helmet**:
- `X-Frame-Options: SAMEORIGIN` para evitar ataques de *Clickjacking*.
- `X-Content-Type-Options: nosniff` para evitar la alteración de tipos MIME.
- `Strict-Transport-Security (HSTS)` para forzar tráfico HTTPS permanente.
- Ocultación activa del encabezado `X-Powered-By: Express` para dificultar el reconocimiento y escaneo de vulnerabilidades específicas.

### 5.2 Modelo Criptográfico y Gestión de Sesiones
1. **Hash de Contraseñas:**
   Se aplica la función criptográfica `bcrypt.hash(password, 10)` generando una sal de 16 bytes que mitiga ataques de tablas arcoíris (*rainbow tables*).
2. **Gestión de Sesión:**
   Manejada por `express-session` con cookie identificadora firmada criptográficamente por la clave `SESSION_SECRET`.
   - Atributos de Cookie: `httpOnly: true` (inmune a robo por XSS), `sameSite: 'lax'` (protección contra CSRF), `maxAge: 2400000` (40 minutos de caducidad por inactividad), `rolling: true` (renovación en peticiones legítimas activas).
3. **Tokens Criptográficos de Seguridad:**
   Los tokens para restablecimiento de clave o invitación se generan mediante generadores pseudoaleatorios criptográficamente fuertes (`crypto.randomBytes(32).toString('hex')`), almacenados en la tabla `token` con vigencia temporal estricta de 60 minutos.

### 5.3 Control de Acceso Basado en Roles (RBAC) y Guards
El acceso a los recursos está gobernado por una cadena de middlewares de seguridad (*Guards*):
```
Petición Entrante
       │
       ▼
verificarSesion() ───────────► ¿Sesión válida y no expirada? ──► NO ──► HTTP 401 Unauthorized
       │
       ▼ (SÍ)
verificarEstadoActivo() ─────► ¿Usuario activo en BD? ─────────► NO ──► HTTP 403 Forbidden
       │
       ▼ (SÍ)
verificarRol('admin', ...) ──► ¿Posee el rol requerido? ───────► NO ──► HTTP 403 Forbidden
       │
       ▼ (SÍ)
Ejecución del Controlador
```

### 5.4 Estrategia de Mitigación de Ataques y Gobernanza de Red
- **Ataques de Fuerza Bruta y Credential Stuffing:** Limitación de peticiones con `express-rate-limit` en `/login` (máximo 5 intentos fallidos consecutivos por IP cada 15 minutos).
  - **Normalización de Claves:** El middleware implementa un `keyGenerator` unificado (`gestorIps.normalizarIp()`) que procesa direcciones IPv4 e IPv6 (`::1` y `::ffff:` a `127.0.0.1`), garantizando consistencia determinística entre el limitador y el catálogo de suspensiones.
  - **Consola de Gobernanza Perimetral (Superadmin):** Monitoreo en vivo de IPs bloqueadas (`GET /api/seguridad/ips-bloqueadas`) con temporizador dinámico decreciente (15 min).
  - **Desbloqueo Manual con Purga Integral:** El endpoint `POST /api/seguridad/desbloquear-ip/:ip` purga concurrentemente todas las variaciones de clave del limitador (`127.0.0.1`, `::1`, `::/56`, `::ffff:127.0.0.1`), registra la acción en la bitácora de auditoría (`DESBLOQUEAR_IP`) y notifica en tiempo real vía WebSockets (`ip_desbloqueada`).
- **Inyección SQL:** Ausencia total de concatenación directa de cadenas SQL. El 100% de las consultas se parametrizan (`$1`, `$2`, `$3...`) mediante el driver `pg`.
- **Carga Maliciosa de Archivos:** Las imágenes no se escriben en disco ni se ejecutan en el servidor web. Se validan extensiones y tipos MIME permitidos y se procesan en streaming directo a Cloudinary.
- **Protección contra CSRF:** Tokens criptográficos verificados en todas las mutaciones estatales sensibles mediante el middleware `csrfProtection`.

---

## 6. ESPECIFICACIONES DE CONFIGURACIÓN Y VARIABLES DE ENTORNO

### 6.1 Diccionario de Variables de Entorno (.env)
El comportamiento del sistema se parametriza externamente mediante un archivo `.env` en la raíz del backend:

| Variable | Tipo | Propósito y Valor Ejemplo | Obligatoria |
| :--- | :--- | :--- | :---: |
| `PORT` | Numérico | Puerto de escucha del servidor Express (Ej: `3000`). | No (Default: 3000) |
| `DB_USER` | Cadena | Usuario de la base de datos PostgreSQL (Ej: `postgres`). | **Sí** |
| `DB_HOST` | Cadena | Servidor de base de datos (Ej: `localhost` o IP externa). | **Sí** |
| `DB_NAME` | Cadena | Nombre de la base de datos (Ej: `db_mapeo` o `sigi_db`). | **Sí** |
| `DB_PASSWORD` | Cadena | Contraseña del usuario de base de datos. | **Sí** |
| `DB_PORT` | Numérico | Puerto del motor PostgreSQL (Ej: `5432`). | **Sí** |
| `SESSION_SECRET` | Cadena | Frase secreta de alta entropía para firma de cookies. | **Sí** |
| `APP_URL` | Cadena | URL canónica de la aplicación (Ej: `http://localhost:3000`). | No |
| `CLOUDINARY_CLOUD_NAME` | Cadena | Identificador de la nube Cloudinary de la organización. | Condicional (Evidencias) |
| `CLOUDINARY_API_KEY` | Cadena | Llave pública de acceso a la API de Cloudinary. | Condicional (Evidencias) |
| `CLOUDINARY_API_SECRET` | Cadena | Secreto privado de autenticación Cloudinary. | Condicional (Evidencias) |
| `CLOUDINARY_UPLOAD_PRESET`| Cadena | Preset de transformación y carga (Ej: `sigi_preset`). | Condicional (Evidencias) |
| `SMTP_HOST` | Cadena | Host del servidor de correo SMTP (Ej: `smtp.gmail.com`). | Condicional (Emails) |
| `SMTP_PORT` | Numérico | Puerto de transporte de correo (Ej: `587` o `465`). | Condicional (Emails) |
| `SMTP_USER` | Cadena | Cuenta de correo emisora institucional. | Condicional (Emails) |
| `SMTP_PASS` | Cadena | Contraseña de aplicación o token SMTP. | Condicional (Emails) |

### 6.2 Gestión de Secretos y Fallbacks de Desarrollo
- **Almacenamiento Local de Fallback:** Si las variables de Cloudinary no están definidas o el servicio no responde, el módulo `utils/cloudinary.js` activa un mecanismo de respaldo seguro guardando la evidencia en `public/uploads/incidentes` con nombres únicos generados criptográficamente.
- **Simulador de Correos de Desarrollo:** Si las variables SMTP no están configuradas, el módulo `utils/mailer.js` conmuta automáticamente a modo simulador, imprimiendo el enlace de recuperación y las credenciales en la consola de comandos sin interrumpir la operación.

---

## 7. ESTÁNDARES DE CALIDAD, PRUEBAS Y MANTENIMIENTO

### 7.1 Estrategia de Pruebas Automatizadas (Jest & Supertest — 70/70 Tests Aprobados)
La estabilidad del backend, la fiabilidad de los modelos y la cobertura de endpoints se certifican mediante pruebas automatizadas:
- **Herramientas:** **Jest v30.4+** como ejecutor de pruebas y aserciones, y **Supertest v7.2+** para pruebas de integración sobre peticiones HTTP.
- **Resultados de Ejecución:** **70 de 70 pruebas superadas exitosamente (100% de efectividad)**, distribuidas en 6 suites:
  - `tests/unit/models.test.js`: Pruebas exhaustivas de la capa de Modelos (`IncidenteModel`, `UsuarioModel`, `CatalogosModel`, `EstadisticasModel`, `GeografiaModel`).
  - `tests/unit/ml.service.test.js`: Validación del clasificador Naive Bayes, detección de severidad, extracción de hotspots DBSCAN y proyecciones temporales.
  - `tests/integration/auth.test.js`: Pruebas de autenticación segura (login, bloqueo de contraseñas erróneas, protección de sesiones).
  - `tests/integration/geografia.test.js`: Endpoints espaciales (`/api/geografia/barrios`, `/api/geografia/veredas`) y generación de GeoJSON.
  - `tests/integration/incidentes.test.js`: Ciclo de vida transaccional del incidente, candados de concurrencia y autorización RBAC.
  - `tests/integration/reportes.test.js`: Generación de informes PDF institucionales mediante streaming.
- **Comando de Ejecución:** `npm run test` con validación de cobertura (`--coverage`).

### 7.2 Políticas de Respaldo y Recuperación de la Base de Datos
- **Frecuencia de Copias de Seguridad:** Copias de seguridad lógicas diarias automatizadas mediante `pg_dump` con compresión `.dump` o `.sql.gz`.
- **Estrategia de Retención:** Esquema de retención de 7 días continuos, 4 semanales y 12 mensuales.
- **Comando de Respaldo:**
  ```bash
  pg_dump -U postgres -h localhost -p 5432 -F c -b -v -f "sigi_backup_$(date +%Y%m%d).dump" db_mapeo
  ```
- **Procedimiento de Restauración:**
  ```bash
  pg_restore -U postgres -h localhost -p 5432 -d db_mapeo -v "sigi_backup_archivo.dump"
  ```
