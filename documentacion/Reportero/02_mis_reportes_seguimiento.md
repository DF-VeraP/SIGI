# Módulo 02: Mis Reportes y Seguimiento de Estado

## 1. Identificación y Propósito
- **Rol:** Reportero
- **Ruta Frontend:** `/reportero` (Pestaña "Mis Reportes")
- **Archivos Clave:**
  - `public/reportero/reportero.js`
  - `public/reportero/reportero.css`
  - `controllers/incidentes.controller.js`
  - `routes/incidentes.routes.js`
- **Propósito:** Ofrecer al reportero de campo visibilidad total sobre los incidentes que ha radicado, permitiéndole conocer en tiempo real si sus reportes han sido revisados, aprobados o desestimados por los analistas.

---

## 2. Submódulos y Especificaciones

### 2.1. Listado Histórico Personalizado
- **Endpoint:** `GET /api/incidentes/mis-reportes`
- **Filtro de Seguridad:** El backend extrae el ID del usuario directamente desde la sesión en el servidor (`req.session.id_usuario`), impidiendo que un usuario consulte los reportes de otros agentes de campo.
- **Información Desplegada:**
  - Código único del incidente.
  - Tipo y modalidad.
  - Fecha y hora de captura.
  - Dirección / Comuna.
  - Miniatura de la evidencia fotográfica registrada.

### 2.2. Insignias de Estado Operativo (Badges)
- **Pendiente (Amarillo / Naranja):** El incidente está en la cola de validación a la espera de ser tomado por un analista.
- **Aprobado (Verde):** El reporte fue verificado y ya es visible en la cartografía pública de la ciudad.
- **Desestimado (Gris / Rojo):** El reporte fue rechazado (por inconsistencia de datos, falta de veracidad o duplicidad).

### 2.3. Modal de Inspección Detallada
- Permite abrir el reporte completo, ver la fotografía en alta resolución alojada en Cloudinary, la posición geográfica exacta y las observaciones dejadas por el equipo de validación.

---

## 3. Dependencias y Flujo de Interacción
- **Dependencia:** Depende directamente del **Módulo 01: Captura de Incidentes** para generar registros iniciales.
- **Sincronización:** Se actualiza automáticamente cada vez que el reportero radica un nuevo incidente o cambia de pestaña.

---

## 4. Diagrama de Arquitectura y Flujo
El diagrama de este módulo se encuentra en:
👉 [`Reportero/diagramas/02_mis_reportes_seguimiento.drawio`](diagramas/02_mis_reportes_seguimiento.drawio)
