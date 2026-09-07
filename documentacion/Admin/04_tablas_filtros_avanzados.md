# Módulo 04: Explorador Tabular y Filtros Administrativos

## 1. Identificación y Propósito
- **Rol:** Admin (y Superadmin)
- **Ruta Frontend:** `/admin` (Sección inferior y panel deslizable de filtros avanzados)
- **Archivos Clave:**
  - `public/admin/admin.js`
  - `public/admin/admin.css`
  - `controllers/tablas.controller.js`
  - `routes/tablas.routes.js`
- **Propósito:** Ofrecer una cuadrícula interactiva de datos (*Data Grid*) que permita auditar, ordenar, paginar y ejecutar búsquedas multicriterio sobre el universo total de incidentes almacenados.

---

## 2. Submódulos y Especificaciones

### 2.1. Cuadrícula de Datos Interactiva (Data Grid)
- **Endpoint Base:** `GET /incidentesTabla` (Protegido por `verificarSesion`)
- **Columnas Desplegadas:**
  - ID del Incidente / Código de referencia.
  - Tipo y Modalidad.
  - Fecha y Franja Horaria.
  - Comuna y Barrio.
  - Gravedad (con semáforo de colores).
  - Estado actual (Pendiente, Aprobado, Desestimado).
  - Botones de acción contextual: Editar, Cambiar Estado, Ver Evidencia Fotográfica, Eliminar.

### 2.2. Panel Deslizable de Filtros Administrativos
- **Componente:** `.panel-filtros-animado` con acordeón suave.
- **Endpoint:** `GET /incidentesFiltroAdmin`
- **Capacidades de Filtrado:**
  - Filtro por Estado Operativo (Todos, Solo Pendientes, Solo Aprobados, Solo Desestimados).
  - Rango de fechas calendario.
  - Filtro por Comuna o Barrio específico.
  - Filtro por Nivel de Criticidad/Gravedad.
  - Búsqueda por texto libre (palabras clave en la descripción del hecho).

### 2.3. Acciones Rápidas en Fila
- Modificación directa del estado de un incidente sin necesidad de abrir el flujo completo de validación.
- Apertura del visualizador de imagen en pop-up para inspección de evidencias.
- Salto directo a la ubicación en el mapa al hacer clic en las coordenadas.

---

## 3. Dependencias y Flujo de Interacción
- **Dependencia:** Trabaja de forma coordinada con la base de datos para ejecutar paginación eficiente (`LIMIT` y `OFFSET`).
- **Sincronización:** Cada cambio realizado en la **Cola de Validación (Módulo 01)** o en la **Importación Masiva (Módulo 03)** actualiza automáticamente esta tabla.

---

## 4. Diagrama de Arquitectura y Flujo
El diagrama de este módulo se encuentra en:
👉 [`Admin/diagramas/04_tablas_filtros_avanzados.drawio`](diagramas/04_tablas_filtros_avanzados.drawio)
