# Módulo 03: Gobernanza del Sistema y Parámetros Globales

## 1. Identificación y Propósito
- **Rol:** Superadmin (Exclusivo)
- **Alcance:** Configuración de seguridad perimetral, variables de entorno, políticas de sesión y gobernanza de datos en SIGI.
- **Archivos Clave:**
  - `server.js`
  - `middleware/rateLimit.middleware.js`
  - `middleware/error.middleware.js`
  - `.env` / `docker-compose.yml`
- **Propósito:** Definir y mantener las directrices de seguridad, rendimiento, mitigación de riesgos de infraestructura y disponibilidad de servicios para todos los actores del ecosistema.

---

## 2. Submódulos y Especificaciones Técnicas

### 2.1. Políticas de Sesión e Inactividad Global
- **Tiempo Límite:** 40 minutos de inactividad estricta para sesiones administrativas y de reportero.
- **Configuración Express:**
  ```javascript
  cookie: {
    maxAge: 40 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  },
  rolling: true
  ```
- **Regeneración de Sesión:** Ejecutada en cada login para neutralizar ataques de Fijación de Sesión.

### 2.2. Protección Perimetral y Mitigación de Denegación de Servicio (DoS)
- **Helmet.js:** Encabezados de seguridad HTTP (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`). Con `contentSecurityPolicy: false` para interoperabilidad con teselas cartográficas de OpenStreetMap y CartoDB.
- **Esquema de Rate Limiting Diferenciado (`express-rate-limit`):**
  - `loginLimiter`: 5 intentos por ventana de 15 minutos.
  - `recuperarPasswordLimiter`: 3 solicitudes por ventana de 15 minutos.
  - `apiGeneralLimiter`: 300 peticiones por ventana de 15 minutos por IP.

### 2.3. Sanitización de Errores y Fuga de Información
- **Middleware Global de Errores (`middleware/error.middleware.js`):**
  - En entorno de producción (`NODE_ENV=production`), los errores `500 Internal Server Error` ocultan los *stack traces*, consultas SQL crudas o rutas del servidor local, retornando mensajes limpios y estandarizados para evitar *Information Disclosure*.

### 2.4. Integración de Servicios Externos y Entornos
- **Almacenamiento en Nube:** Cloudinary (gestión de cuotas, carpetas seguras `sigi_incidentes`).
- **Mensajería Transaccional:** Gmail SMTP con autenticación por contraseñas de aplicación (puerto 587 con TLS).
- **Motor Geoespacial:** PostgreSQL con extensión PostGIS (SRID 4326 WGS 84).

---

## 3. Dependencias y Flujo de Interacción
- **Impacto Transversal:** Es el núcleo que resguarda a los módulos de **Admin**, **Reportero** e **Invitado**.

---

## 4. Diagrama de Arquitectura y Flujo
El diagrama de este módulo se encuentra en:
👉 [`Superadmin/diagramas/03_gobernanza_sistema.drawio`](diagramas/03_gobernanza_sistema.drawio)
