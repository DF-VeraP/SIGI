# Módulo 04: Portal de Acceso y Gestión de Identidad

## 1. Identificación y Propósito
- **Rol:** Invitado (Transición a Usuario Autenticado)
- **Rutas Frontend:**
  - `/login` (`public/login/index.html`)
  - `/login/reset-password.html`
- **Archivos Clave:**
  - `controllers/auth.controller.js`
  - `routes/auth.routes.js`
  - `middleware/rateLimit.middleware.js`
  - `utils/mailer.js`
- **Propósito:** Proporcionar los mecanismos seguros de autenticación, prevención de ataques de fuerza bruta, recuperación de credenciales por correo electrónico mediante tokens de un solo uso y cumplimiento de la política de primer cambio obligatorio de clave.

---

## 2. Submódulos y Flujos de Seguridad

### 2.1. Inicio de Sesión y Protección contra Fuerza Bruta
- **Endpoint:** `POST /login`
- **Seguridad Perimetral (`loginLimiter`):** Máximo 5 intentos fallidos cada 15 minutos por dirección IP.
- **Regeneración de Sesión:** Tras validar credenciales exitosamente, se ejecuta `req.session.regenerate()` para prevenir ataques de Fijación de Sesión (*Session Fixation*).
- **Control de Estado:** Si el usuario se encuentra `inactivo` o `bloqueado`, el acceso es denegado de forma inmediata.
- **Detección de Primer Ingreso:** Si la bandera `debe_cambiar_password` es `true`, se bloquea el acceso al panel operativo y se exige el cambio de contraseña.

### 2.2. Solicitud de Recuperación de Contraseña
- **Endpoint:** `POST /api/auth/recuperar-password`
- **Protección contra Abuso (`recuperarPasswordLimiter`):** Máximo 3 solicitudes cada 15 minutos por IP.
- **Mecanismo Criptográfico:**
  - Se genera un token aleatorio criptográficamente seguro de 32 bytes (`crypto.randomBytes(32).toString('hex')`).
  - Se registra en la tabla `token` con tipo `'reset_password'` y fecha de expiración a 1 hora (`NOW() + INTERVAL '1 hour'`).
  - Se despacha un correo electrónico seguro con plantilla HTML mediante Gmail SMTP (`utils/mailer.js`).

### 2.3. Validación de Token y Restablecimiento Seguro
- **Endpoints:**
  - `GET /api/auth/validar-token-reset?token=...`: Comprueba que el token exista, no haya expirado y no haya sido utilizado.
  - `POST /api/auth/reset-password`: Recibe el token y la nueva contraseña.
- **Validación de Complejidad:**
  - Mínimo 8 caracteres.
  - Al menos una letra mayúscula.
  - Al menos una letra minúscula.
  - Al menos un número.
- **Consumo Atómico:** Una vez actualizada la clave con hash `bcrypt` (10 rondas), el token se marca como usado (`usado = true`) impidiendo cualquier reutilización.

### 2.4. Cambio Obligatorio en Primer Acceso
- **Endpoint:** `POST /api/auth/cambiar-password-primer-ingreso`
- **Flujo:** Obliga a los usuarios recién creados por el administrador a definir su propia contraseña personal antes de interactuar con cualquier módulo del sistema.

---

## 3. Matriz de Auditoría Asociada
Este módulo alimenta directamente la tabla de auditoría para el Superadmin:
- `LOGIN_EXITOSO`: Inicio de sesión correcto.
- `LOGIN_FALLIDO`: Credenciales incorrectas.
- `LOGIN_BLOQUEADO`: Intento de ingreso con cuenta suspendida/bloqueada.
- `RECUPERAR_PASSWORD`: Solicitud de recuperación radicada.
- `CAMBIO_PASSWORD`: Clave actualizada exitosamente.

---

## 4. Diagrama de Arquitectura y Flujo
El diagrama de este módulo se encuentra en:
👉 [`Invitado/diagramas/04_autenticacion_recuperacion_clave.drawio`](diagramas/04_autenticacion_recuperacion_clave.drawio)
