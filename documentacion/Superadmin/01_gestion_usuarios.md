# Módulo 01: Gestión Integral de Usuarios y Control de Acceso (RBAC)

## 1. Identificación y Propósito
- **Rol:** Superadmin (Exclusivo)
- **Ruta Frontend:** `/admin` (Pestaña "Usuarios" / `#btnUsuarios` y Modal de Usuarios)
- **Archivos Clave:**
  - `public/admin/admin.js`
  - `public/admin/admin.css`
  - `controllers/usuarios.controller.js`
  - `routes/usuarios.routes.js`
  - `utils/mailer.js`
- **Propósito:** Brindar control total sobre el ciclo de vida de las cuentas de usuario de la plataforma: creación, asignación de roles (`superadmin`, `admin`, `reportero`), despacho automático de credenciales temporales por correo electrónico, activación/suspensión de acceso y eliminación segura.

---

## 2. Submódulos y Especificaciones Técnicas

### 2.1. Directorio Maestro de Cuentas
- **Endpoint:** `GET /api/usuarios`
- **Seguridad:** Requiere sesión activa, estado de cuenta activo y rol `superadmin` validado por `verificarRol('superadmin')`.
- **Datos Desplegados:** ID, Nombre completo, Nombre de usuario, Correo electrónico, Rol asignado, Estado actual (`activo` o `inactivo`), y fecha de creación.

### 2.2. Alta de Usuarios y Despacho de Bienvenida por Correo
- **Endpoint:** `POST /api/usuarios`
- **Campos Obligatorios:** `nombre`, `usuario`, `email` (único, normalizado con `LOWER()`), `contrasenia` (mínimo 6 caracteres en creación) y `rol`.
- **Mecanismos Automáticos:**
  - La contraseña se hashea con `bcrypt` (10 salt rounds).
  - Se activa la bandera `debe_cambiar_password = true` para exigir el cambio de clave en el primer inicio de sesión.
  - **Despacho Transaccional de Correo:** Mediante `utils/mailer.js`, se envía un correo de bienvenida profesional con las credenciales temporales y el enlace directo al portal de acceso.
  - **Auditoría:** Se registra el evento `CREAR_USUARIO` en la bitácora del sistema.

### 2.3. Edición de Perfiles y Reasignación de Roles
- **Endpoint:** `PUT /api/usuarios/:id`
- **Reglas de Negocio:**
  - Valida que el nuevo correo electrónico no colisione con el de otro usuario existente.
  - Si se proporciona una nueva contraseña opcional, se valida su longitud y se actualiza el hash; de lo contrario, se mantiene la clave existente.
  - Permite ascender o descender roles (`admin` <-> `reportero`).

### 2.4. Control de Estado Operativo (Activar / Suspender)
- **Endpoint:** `PATCH /api/usuarios/:id/estado`
- **Estados:** `activo`, `inactivo`.
- **Efecto Inmediato:** Un usuario marcado como `inactivo` ve revocado su acceso en la siguiente petición HTTP debido a la intervención del middleware `verificarEstadoActivo`.

### 2.5. Eliminación de Cuentas
- **Endpoint:** `DELETE /api/usuarios/:id`
- **Protección de Integridad:** Se valida que el superadmin no se elimine a sí mismo accidentalmente.

---

## 3. Dependencias y Flujo de Interacción
- **Dependencia:** Utiliza `nodemailer` para el despacho de correos y la tabla `usuario` de PostgreSQL.
- **Impacto Sistémico:** Las cuentas creadas aquí habilitan los accesos a los roles **Admin** y **Reportero**.

---

## 4. Diagrama de Arquitectura y Flujo
El diagrama de este módulo se encuentra en:
👉 [`Superadmin/diagramas/01_gestion_usuarios.drawio`](diagramas/01_gestion_usuarios.drawio)
