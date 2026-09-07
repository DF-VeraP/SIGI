# Módulo 02: Auditoría y Trazabilidad Forense del Sistema

## 1. Identificación y Propósito
- **Rol:** Superadmin (Exclusivo)
- **Ruta Frontend:** `/admin` (Pestaña "Auditoría" / `#btnAuditoria`)
- **Archivos Clave:**
  - `public/admin/admin.js`
  - `controllers/usuarios.controller.js` (`getAuditoriaLogs`)
  - `routes/usuarios.routes.js`
  - `utils/logger.js`
- **Propósito:** Ofrecer un registro inmutable y cronológico de todas las operaciones críticas de seguridad y administración ejecutadas en el sistema, permitiendo análisis forense ante incidentes de ciberseguridad o auditorías de cumplimiento institucional.

---

## 2. Submódulos y Eventos Auditados

### 2.1. Visor Central de Bitácora Forense
- **Endpoint:** `GET /api/usuarios/auditoria/logs`
- **Permisos:** Solo accesible por el rol `superadmin`.
- **Atributos de Cada Evento:**
  - Timestamp ISO con precisión de milisegundos.
  - Usuario responsable (o identificador de la cuenta afectada).
  - Tipo de Acción / Evento.
  - Dirección IP de origen (`req.ip` / `req.headers['x-forwarded-for']`).
  - Agente de usuario (Navegador y sistema operativo).
  - Detalles contextuales en formato JSON sanitizado.

### 2.2. Tipología de Eventos Auditados
1. **Seguridad de Acceso:**
   - `LOGIN_EXITOSO`: Inicio de sesión válido.
   - `LOGIN_FALLIDO`: Intento de autenticación con contraseña incorrecta (sin registrar contraseñas en texto claro).
   - `LOGIN_BLOQUEADO`: Intento de inicio desde cuenta inactiva o suspendida.
   - `LOGOUT`: Cierre de sesión voluntario o por inactividad.
2. **Ciclo de Vida de Identidades:**
   - `CREAR_USUARIO`: Nuevo usuario incorporado al sistema.
   - `EDITAR_USUARIO`: Modificación de rol, nombre o correo.
   - `CAMBIO_ESTADO_USUARIO`: Suspensión o reactivación de cuenta.
   - `ELIMINAR_USUARIO`: Supresión de cuenta.
3. **Gestión de Credenciales:**
   - `RECUPERAR_PASSWORD`: Generación y despacho de token de reseteo.
   - `CAMBIO_PASSWORD`: Restablecimiento o cambio forzoso de clave completado.

### 2.3. Búsqueda y Filtrado de Logs
- Filtrado por rango de fechas.
- Búsqueda por dirección IP sospechosa.
- Filtrado por tipo de evento específico para identificar ataques coordinados de fuerza bruta.

---

## 3. Dependencias y Flujo de Interacción
- **Dependencia:** Tabla `auditoria_logs` en PostgreSQL.
- **Transversalidad:** Es alimentada pasivamente por los controladores de autenticación (`auth.controller.js`) y de gestión de usuarios (`usuarios.controller.js`).

---

## 4. Diagrama de Arquitectura y Flujo
El diagrama de este módulo se encuentra en:
👉 [`Superadmin/diagramas/02_auditoria_seguridad.drawio`](diagramas/02_auditoria_seguridad.drawio)
