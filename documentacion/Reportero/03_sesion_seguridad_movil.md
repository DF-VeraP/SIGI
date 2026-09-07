# Módulo 03: Sesión Móvil y Seguridad en Campo

## 1. Identificación y Propósito
- **Rol:** Reportero
- **Ruta Frontend:** Cabecera y guardias cliente en `/reportero`
- **Archivos Clave:**
  - `public/js/session-timer.js`
  - `middleware/auth.middleware.js`
  - `server.js` (Configuración de sesión express-session)
- **Propósito:** Proteger los dispositivos de campo contra accesos no autorizados en caso de extravío, descuido o robo del teléfono inteligente o tableta, mediante control estricto de inactividad y políticas de sesión seguras.

---

## 2. Submódulos y Especificaciones de Seguridad

### 2.1. Temporizador de Inactividad de 40 Minutos
- **Lógica de Cliente (`public/js/session-timer.js`):**
  - Monitorea eventos de usuario activos: `mousemove`, `mousedown`, `keypress`, `touchstart`, `scroll`.
  - Cada interacción reinicia el contador local.
  - **Advertencia Temprana (Minuto 38):** Despliega un toast o alerta flotante informando que la sesión expirará en 2 minutos por inactividad.
  - **Auto-Logout Forzoso (Minuto 40):** Redirige inmediatamente a `/login?motivo=inactividad` destruyendo el estado local.

### 2.2. Parámetros de Cookies y Sesión en Servidor
- **`cookie.maxAge`:** 40 minutos (`40 * 60 * 1000` ms).
- **`rolling: true`:** Cada petición HTTP válida desde el dispositivo renueva el ciclo de vida de la cookie en el servidor.
- **`httpOnly: true`:** La cookie de sesión no es accesible vía scripts (`document.cookie`), mitigando vectores de robo por ataques XSS.
- **`sameSite: 'lax'`:** Protección contra ataques CSRF en solicitudes entre sitios.

### 2.3. Cierre Voluntario y Destrucción de Credenciales
- **Endpoint:** `GET /logout`
- **Acción:** Destruye `req.session.destroy()`, elimina la cookie `connect.sid` del navegador y redirige a la pantalla de login.

---

## 3. Dependencias y Flujo de Interacción
- **Dependencia:** Protege tanto la captura de datos (Módulo 01) como la consulta de reportes (Módulo 02).
- **Gobernanza:** Las políticas y tiempos son definidos a nivel global por el Superadmin.

---

## 4. Diagrama de Arquitectura y Flujo
El diagrama de este módulo se encuentra en:
👉 [`Reportero/diagramas/03_sesion_seguridad_movil.drawio`](diagramas/03_sesion_seguridad_movil.drawio)
