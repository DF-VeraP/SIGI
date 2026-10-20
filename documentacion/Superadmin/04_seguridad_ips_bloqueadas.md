# Módulo 04: Seguridad Perimetral y Control de IPs Bloqueadas

## 1. Identificación y Propósito
- **Rol:** Superadmin (Exclusivo)
- **Ruta Frontend:** `/admin` (Pestaña "Seguridad IP" / `#btnSeguridadIps`)
- **Archivos Clave:**
  - `public/admin/admin.js` (`cargarIpsBloqueadas`, `renderizarTablaIps`, `solicitarDesbloqueoIp`, `confirmarDesbloqueoIp`)
  - `public/admin/admin.css` (`.badge-tiempo-ip`, `.btn-desbloquear-ip`, `.modal-info-card-suave`)
  - `controllers/seguridad.controller.js` (`obtenerIpsBloqueadas`, `desbloquearIp`)
  - `routes/seguridad.routes.js`
  - `utils/gestorIps.js` (`GestorIpsBloqueadas`)
  - `middleware/rateLimit.middleware.js` (`loginLimiter`)
- **Propósito:** Proporcionar al Superadministrador una consola de visualización en tiempo real y gobernanza sobre las direcciones IP suspendidas por superar el umbral de intentos fallidos de autenticación (fuerza bruta / credential stuffing), permitiendo monitorear el tiempo restante de bloqueo y ejecutar desbloqueos manuales inmediatos respaldados por trazabilidad forense.

---

## 2. Submódulos y Especificaciones Técnicas

### 2.1. Detección y Registro Automático de Bloqueos (Rate Limiting)
- **Umbral de Seguridad:** 5 intentos fallidos de inicio de sesión en una ventana móvil de 15 minutos (`windowMs = 15 * 60 * 1000`).
- **Normalización de Red:** El componente `gestorIps.normalizarIp()` estandariza direcciones IPv4 e IPv6 (transformando `::1` y prefijos `::ffff:` a `127.0.0.1`), garantizando que la clave de limitación en memoria coincida con el identificador registrado.
- **Estructura en Memoria (`GestorIpsBloqueadas`):**
  - `ip`: Dirección IP normalizada.
  - `rawIp`: Dirección IP cruda recibida en el socket HTTP.
  - `fecha_bloqueo`: Timestamp ISO del momento exacto del bloqueo.
  - `expira_en`: Epoch timestamp de expiración automática (ahora + 15 min).
  - `motivo`: Descripción técnica de la causal de bloqueo.
  - `intentos`: Conteo de solicitudes bloqueadas acumuladas.

### 2.2. Notificaciones Reactivas en Tiempo Real (WebSockets / Socket.io)
- **Canal Bidireccional:** Eventos emitidos en el canal global de administración para actualización instantánea de la interfaz sin requerir recarga manual:
  1. `ip_bloqueada`: Emitido cuando una IP sobrepasa el límite permitido; añade dinámicamente la fila a la tabla y notifica al Superadmin.
  2. `ip_desbloqueada`: Emitido tras el levantamiento del bloqueo; sincroniza la interfaz y remueve el registro en todas las sesiones administrativas abiertas.

### 2.3. Endpoints de la API RESTful

#### A. Consulta de IPs Bloqueadas y Métricas
- **Endpoint:** `GET /api/seguridad/ips-bloqueadas`
- **Autorización:** `verificarAutenticacion`, `verificarRol('superadmin')`.
- **Respuesta:**
  ```json
  {
    "exito": true,
    "ips": [
      {
        "ip": "127.0.0.1",
        "fecha_bloqueo": "2026-10-20T20:45:00.000Z",
        "expira_en": "2026-10-20T21:00:00.000Z",
        "segundos_restantes": 780,
        "minutos_restantes": 13,
        "motivo": "Exceso de intentos de acceso fallidos en inicio de sesión (5 intentos)",
        "intentos": 5
      }
    ],
    "estadisticas": {
      "activas": 1,
      "totalHistorico": 8,
      "ultimoBloqueo": "2026-10-20T20:45:00.000Z",
      "ventanaMinutos": 15
    }
  }
  ```

#### B. Desbloqueo Manual de Dirección IP
- **Endpoint:** `POST /api/seguridad/desbloquear-ip/:ip`
- **Autorización:** `verificarAutenticacion`, `verificarRol('superadmin')`, `csrfProtection`.
- **Proceso Interno:**
  1. Valida y decodifica la dirección IP especificada en la URL.
  2. Ejecuta `gestorIps.desbloquearIp(ip)`, purgando simultáneamente todas las claves de caché de `express-rate-limit` (`127.0.0.1`, `::1`, `::/56`, `::ffff:127.0.0.1`).
  3. Registra el evento inmutable en la bitácora de auditoría forense (`DESBLOQUEAR_IP`).
  4. Emite el evento WebSocket `ip_desbloqueada`.
  5. Retorna confirmación HTTP 200 con estado de éxito.

---

## 3. Experiencia de Usuario y Reglas de Diseño

1. **Diseño de Iconos Unificado:**
   - La columna de acción muestra el icono de candado cerrado (`bi-lock-fill`) dentro del botón estándar `.btn-icon-usr` (32×32 px, fondo neutro translúcido, sin tonalidades verdes descontextualizadas).
2. **Temporizador en Vivo:**
   - Badge `.badge-tiempo-ip` con cuenta regresiva en vivo formateada en minutos y segundos (`MM:SS`), recalculada cada 1000 ms. Al expirar el contador, la fila se actualiza o purga automáticamente.
3. **Ventana Emergente de Confirmación:**
   - Diálogo modal minimalista institucional sin emojis distractores, solicitando confirmación explícita antes de ejecutar el desbloqueo perimetral.
4. **Paginación Reactiva:**
   - Barra de navegación inferior que pagina de a 10 registros por vista con controles anterior/siguiente integrados.

---

## 4. Trazabilidad y Auditoría Forense
Cada desbloqueo manual queda registrado de forma inalterable en `auditoria_logs`:
- **Usuario:** Nombre y ID del Superadministrador ejecutante.
- **Acción:** `DESBLOQUEAR_IP`.
- **Entidad:** `seguridad`.
- **Detalle:** `Superadmin {nombre} desbloqueó la dirección IP {ip}`.
- **Metadatos:** IP del administrador y User-Agent de la sesión.

---

## 5. Diagrama de Arquitectura y Flujo
El diagrama detallado de este módulo se encuentra en:
- [`Superadmin/diagramas/04_seguridad_ips_bloqueadas.drawio`](diagramas/04_seguridad_ips_bloqueadas.drawio)
