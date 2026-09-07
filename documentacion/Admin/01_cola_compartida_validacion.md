# Módulo 01: Mesa de Validación y Cola Compartida (Shared Queue)

## 1. Identificación y Propósito
- **Rol:** Admin (y Superadmin por herencia)
- **Ruta Frontend:** `/admin` (`public/admin/index.html` - Pestaña "Incidentes" / `#btnVerif`)
- **Archivos Clave:**
  - `public/admin/admin.js`
  - `public/admin/admin.css`
  - `controllers/incidentes.controller.js`
  - `routes/incidentes.routes.js`
- **Propósito:** Gestionar la bandeja de incidentes radicados por reporteros o ciudadanos que están a la espera de validación oficial, evitando que dos analistas modifiquen o aprueben el mismo incidente simultáneamente gracias a un protocolo estricto de concurrencia y bloqueo temporal (*locking*).

---

## 2. Submódulos y Protocolo de Concurrencia

### 2.1. Bandeja de Incidentes Pendientes y Contador en Tiempo Real
- **Endpoint:** `GET /api/incidentes/pendientes`
- **Contador Dinámico (`#badgePendientes`):** La interfaz consulta la cola y actualiza una insignia roja en la cabecera mostrando el número exacto de casos sin validar.

### 2.2. Toma de Control y Bloqueo Concurrente (*Locking*)
- **Endpoint:** `POST /api/incidentes/:id/tomar`
- **Lógica Transaccional:**
  - Cuando un administrador decide revisar un incidente, el servidor asigna las columnas:
    - `bloqueado_por = req.session.id_usuario`
    - `fecha_bloqueo = NOW()`
  - **Protección contra Carreras:** Si otro analista intenta tomar el mismo reporte, el backend responde `409 Conflict` informando el nombre del colega que lo está atendiendo actualmente.

### 2.3. Liberación Manual y Auto-Desbloqueo
- **Endpoint:** `POST /api/incidentes/:id/liberar`
- **Liberación Voluntaria:** El analista puede cerrar el modal o presionar "Liberar" para que el reporte regrese a la bolsa general.
- **Liberación Automática por Inactividad:** Si el analista mantiene el modal abierto sin interactuar por más de 15 minutos, el bloqueo expira automáticamente en la base de datos permitiendo que otro analista lo atienda.

### 2.4. Resolución Definitiva del Incidente
- **Aprobación Oficial:**
  - **Endpoint:** `POST /api/incidentes/:id/resolver` (o `PATCH /api/incidentes/:id/estado`)
  - **Parámetros:** `nuevo_estado: 'Aprobado'`, observaciones y ajustes si fueron necesarios.
  - **Efecto:** El incidente abandona la cola de pendientes y pasa a ser visible en el mapa ciudadano general.
- **Desestimación / Rechazo:**
  - **Endpoint:** `POST /api/incidentes/:id/cerrar`
  - **Parámetros:** `nuevo_estado: 'Desestimado'`, motivo de descarte obligatorio (duplicado, broma, información insuficiente).

---

## 3. Dependencias y Flujo de Interacción
- **Entrada:** Recibe los incidentes radicados por el rol **Reportero (Módulo 01)**.
- **Salida:** Al aprobarse, alimenta en tiempo real el **Visor Geográfico Público (Módulo 01 del Invitado)** y los tableros de analítica.

---

## 4. Diagrama de Arquitectura y Flujo
El diagrama de este módulo se encuentra en:
👉 [`Admin/diagramas/01_cola_compartida_validacion.drawio`](diagramas/01_cola_compartida_validacion.drawio)
