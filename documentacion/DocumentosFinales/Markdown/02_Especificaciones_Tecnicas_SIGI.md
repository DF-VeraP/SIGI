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
- **Versión:** 2.0 (Actualización integral multi-rol, micro-servicios multimedia y persistencia espacial)
- **Fecha de Emisión:** Septiembre 2026
- **Clasificación:** Documento Técnico Oficial

---

## ÍNDICE GENERAL

1. [INTRODUCCIÓN Y OBJETIVOS TÉCNICOS](#1-introducción-y-objetivos-técnicos)  
   1.1 [Propósito](#11-propósito)  
   1.2 [Alcance de las Especificaciones](#12-alcance-de-las-especificaciones)  
2. [ARQUITECTURA GENERAL DEL SISTEMA](#2-arquitectura-general-del-sistema)  
   2.1 [Estilo Arquitectónico y Desacoplamiento (3-Tier)](#21-estilo-arquitectónico-y-desacoplamiento-3-tier)  
   2.2 [Topología de Despliegue Físico y Lógico](#22-topología-de-despliegue-físico-y-lógico)  
   2.3 [Interacción de Componentes y Protocolos de Comunicación](#23-interacción-de-componentes-y-protocolos-de-comunicación)  
3. [STACK TECNOLÓGICO DETALLADO](#3-stack-tecnológico-detallado)  
   3.1 [Capa de Presentación (Frontend)](#31-capa-de-presentación-frontend)  
   3.2 [Capa de Lógica de Negocio y API (Backend)](#32-capa-de-lógica-de-negocio-y-api-backend)  
   3.3 [Capa de Datos Espaciales y Persistencia (Database)](#33-capa-de-datos-espaciales-y-persistencia-database)  
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
   7.1 [Estrategia de Pruebas Automatizadas (Jest & Supertest)](#71-estrategia-de-pruebas-automatizadas-jest--supertest)  
   7.2 [Políticas de Respaldo y Recuperación de la Base de Datos](#72-políticas-de-respaldo-y-recuperación-de-la-base-de-datos)  

---

## 1. INTRODUCCIÓN Y OBJETIVOS TÉCNICOS

### 1.1 Propósito
El propósito de este documento es definir con rigor técnico y formal los lineamientos de arquitectura, especificaciones de hardware, software, red, seguridad e integraciones en la nube que sostienen al **Sistema de Información Geográfica de Incidentes (SIGI)**. Este documento complementa la **Especificación de Requisitos de Software (ERS IEEE 830)** y sirve de guía técnica para auditores de infraestructura, administradores de sistemas y desarrolladores.

### 1.2 Alcance de las Especificaciones
Comprende la totalidad del ciclo de vida técnico del sistema:
- Definición formal de las tres capas físicas y lógicas del sistema (Frontend, Backend, Database).
- Modelado de flujos de integración con la nube para ingesta multimedia (Cloudinary) y transporte de mensajería transaccional (SMTP/Nodemailer).
- Especificación de las medidas de hardening de seguridad (Helmet, Rate Limiting, RBAC, Cifrado Bcrypt).
- Requerimientos de hardware para despliegue On-Premise o Cloud IaaS/PaaS.
- Estrategia de pruebas automatizadas y aseguramiento de la calidad del software.

---

## 2. ARQUITECTURA GENERAL DEL SISTEMA

### 2.1 Estilo Arquitectónico y Desacoplamiento (3-Tier)
SIGI implementa una arquitectura desacoplada en tres capas (*3-Tier Architecture*):

1. **Capa 1: Presentación / Cliente (Frontend):**  
   Aplicación de página web enriquecida construida sobre HTML5 semántico, CSS3 modular y JavaScript nativo asíncrono (Vanilla ES6+). Se comunica con el backend exclusivamente mediante peticiones asíncronas seguras (Fetch API / JSON / Multipart Form-Data).
2. **Capa 2: Aplicación y Servicios (Backend API REST):**  
   Servidor de alto rendimiento construido sobre **Node.js (v20+)** y el framework **Express (v5.x)**. Implementa enrutamiento modular, control de sesiones, mediación de subida de archivos en memoria (`multer.memoryStorage`), despacho de correos asíncronos y filtros de autorización RBAC.
3. **Capa 3: Datos y Cómputo Espacial (Database):**  
   Motor relacional **PostgreSQL 15+** potenciado por la extensión geoespacial **PostGIS 3.3+**. Gestiona relaciones transaccionales ACID y cálculo de topologías vectoriales (intersecciones de geometrías, cálculo de distancias, contención espacial en barrios y veredas).

```
+---------------------------------------------------------------------------------------+
|                                    CAPA DE CLIENTE                                    |
|   +--------------------------+  +--------------------------+  +-------------------+   |
|   |   Módulo Ciudadano       |  |   Módulo Reportero Móvil |  |  Módulo Gestión   |   |
|   |  - Visor Leaflet / KPIs  |  |  - Formulario GPS/Cámara |  |  - Mesa Admin     |   |
|   +-------------+------------+  +-------------+------------+  +---------+---------+   |
+-----------------|-----------------------------|-------------------------|-------------+
                  |                             |                         |
                  +-----------------------------+-------------------------+
                                                |
                                        HTTPS / JSON / TLS
                                                v
+---------------------------------------------------------------------------------------+
|                                    CAPA DE SERVIDOR                                   |
|   +-------------------------------------------------------------------------------+   |
|   |                  Node.js Runtime v20+ / Express v5.x Engine                   |   |
|   +-------------------------------------------------------------------------------+   |
|   | [Security Stack] Helmet | Express-Rate-Limit | Express-Session (HttpOnly)     |   |
|   +-------------------------------------------------------------------------------+   |
|   | [Routing Modular] /api/auth | /api/incidentes | /api/geografia | /api/usuarios|   |
|   +-------------------------------------------------------------------------------+   |
|   | [Middlewares] authGuard | verificarRol | verificarEstadoActivo | Multer Mem   |   |
+-------------------+-----------------------------------+-------------------------------+
                    |                                   |
           Pool PG (Puerto 5432)               HTTPS REST API (SDK v2)
                    v                                   v
+---------------------------------------+  +--------------------------------------------+
|            CAPA DE DATOS              |  |              SERVICIOS CLOUD               |
|  - PostgreSQL 15+ Engine              |  |  - Cloudinary Media CDN (Imágenes)         |
|  - PostGIS Extension (EPSG:4326)      |  |  - SMTP Relay / Nodemailer (Correos)       |
|  - Índices GiST (Polígonos & Puntos)  |  +--------------------------------------------+
+---------------------------------------+
```

> **ESPACIO PARA DIAGRAMA:**  
> *(Insertar aquí Diagrama de Arquitectura de 3 Capas de SIGI)*

### 2.2 Topología de Despliegue Físico y Lógico
El sistema está diseñado para operar bajo dos escenarios de despliegue:
- **Despliegue Local / Institucional (On-Premise):** Servidor físico o máquina virtual institucional ejecutando Linux o Windows Server, con PostgreSQL/PostGIS local y Node.js orquestado mediante PM2 o Docker.
- **Despliegue en la Nube (Cloud PaaS/IaaS):**
  - Servidor de Aplicación: Render / Railway / AWS EC2 ejecutando el contenedor Node.js.
  - Base de Datos Gestionada: Supabase / AWS RDS PostgreSQL con PostGIS activado.
  - Almacenamiento de Evidencias: Cloudinary Media Storage con CDN global.
  - Pasarela de Correo: SendGrid / Gmail Workspace SMTP.

> **ESPACIO PARA DIAGRAMA:**  
> *(Insertar aquí Diagrama de Despliegue Físico y Topología de Red de SIGI)*

### 2.3 Interacción de Componentes y Protocolos de Comunicación
- **Frontend <-> Backend:** Protocolo **HTTPS/1.1 o HTTP/2**. Intercambio de datos formateados en `application/json` y cargas binarias bajo `multipart/form-data`.
- **Backend <-> Base de Datos:** Protocolo nativo de PostgreSQL mediante sockets TCP/IP con pooling persistente gestionado por la librería `pg`.
- **Backend <-> Cloudinary:** Llamadas HTTPS firmadas mediante HMAC-SHA1/SHA256 para la subida directa de buffers de memoria sin escritura en disco.
- **Backend <-> Servidor SMTP:** Conexión cifrada **TLS/STARTTLS** sobre los puertos estándar 587 o 465.

---

## 3. STACK TECNOLÓGICO DETALLADO

### 3.1 Capa de Presentación (Frontend)
- **HTML5:** Marcado semántico para accesibilidad y SEO estructurado.
- **CSS3 Puro:** Diseño modular responsivo con CSS Custom Properties (variables CSS), Flexbox y CSS Grid. Sistema visual tipo *Glassmorphism* con paletas cromáticas contrastadas.
- **JavaScript (ES6+):** Programación asíncrona nativa (`async/await`, Fetch API), manipulación del DOM sin dependencia de jQuery ni frameworks pesados.
- **Motor Cartográfico:** **Leaflet.js v1.9.4**. Biblioteca ligera para representación de capas raster (OpenStreetMap, CartoDB Positron) y vectoriales GeoJSON con listeners de eventos y popups interactivos.
- **Motor de Analítica Visual:** **Chart.js v4.4**. Renderizado en lienzo `<canvas>` de gráficos de barras, líneas y sectores con adaptación a pantallas móviles.

### 3.2 Capa de Lógica de Negocio y API (Backend)
- **Entorno de Ejecución:** Node.js (v20.x LTS o v22.x).
- **Framework Web:** Express v5.2.1.
- **Seguridad HTTP:**
  - `helmet v8.3.0`: Establecimiento de directivas HTTP protectoras.
  - `express-rate-limit v8.7.0`: Prevención de ataques de denegación de servicio y fuerza bruta.
  - `cors v2.8.6`: Control granular de intercambio de recursos de origen cruzado.
- **Manejo de Sesión y Autenticación:**
  - `express-session v1.19.0`: Manejo de sesiones de usuario persistentes con cookies firmadas.
  - `bcrypt v6.0.0`: Algoritmo de hash de contraseñas de un solo sentido con salt automático.
- **Ingesta de Archivos y Parseo:**
  - `multer v2.2.0`: Procesamiento de multipart/form-data mediante almacenamiento en memoria (`memoryStorage`).
  - `csv-parser v3.2.1`: Streaming de alta velocidad para la importación masiva de incidentes.
- **Mensajería Transaccional:**
  - `nodemailer v10.0.1`: Cliente SMTP con soporte para plantillas HTML responsivas.

### 3.3 Capa de Datos Espaciales y Persistencia (Database)
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

> **ESPACIO PARA DIAGRAMA:**  
> *(Insertar aquí Diagrama de Seguridad en Capas: Hardening, Middlewares y Encriptación)*

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

### 5.4 Estrategia de Mitigación de Ataques
- **Ataques de Fuerza Bruta:** Limitación de peticiones con `express-rate-limit` en `/api/auth/login` (máximo 5 intentos fallidos consecutivos por IP cada 15 minutos).
- **Inyección SQL:** Ausencia total de concatenación directa de cadenas SQL. El 100% de las consultas se parametrizan (`$1`, `$2`, `$3...`) mediante el driver `pg`.
- **Carga Maliciosa de Archivos:** Las imágenes no se escriben en disco ni se ejecutan en el servidor web. Se validan extensiones y tipos MIME permitidos y se procesan en streaming directo a Cloudinary.

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

### 7.1 Estrategia de Pruebas Automatizadas (Jest & Supertest)
La estabilidad del backend y la cobertura de endpoints se certifican mediante pruebas automatizadas:
- **Herramientas:** **Jest v30.4+** como ejecutor de pruebas y aserciones, y **Supertest v7.2+** para pruebas de integración sobre peticiones HTTP.
- **Alcance de Pruebas:**
  - Pruebas unitarias de encriptación y validación de contraseñas.
  - Pruebas de integración de autenticación (login exitoso, bloqueo por credenciales erróneas, sesión persistente).
  - Pruebas de endpoints geográficos (`/api/geografia/barrios`, `/api/geografia/veredas`) verificando la estructura GeoJSON válida.
  - Pruebas de endpoints de incidentes y control de acceso (verificación de rechazo 401/403 a usuarios sin privilegios).
- **Comando de Ejecución:** `npm run test` con generación de reporte de cobertura (`--coverage`).

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
