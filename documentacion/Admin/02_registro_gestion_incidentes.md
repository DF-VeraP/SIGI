# Módulo 02: Registro y Gestión Administrativa de Incidentes

## 1. Identificación y Propósito
- **Rol:** Admin (y Superadmin)
- **Ruta Frontend:** `/admin` (Pestaña "Inicio" / Formulario administrativo y mapas)
- **Archivos Clave:**
  - `public/admin/index.html`
  - `public/admin/admin.js`
  - `controllers/incidentes.controller.js`
  - `routes/incidentes.routes.js`
- **Propósito:** Permitir a los analistas de seguridad registrar incidentes directamente con soporte cartográfico avanzado, geocodificación de direcciones y edición integral de incidentes ya existentes.

---

## 2. Submódulos y Especificaciones Técnicas

### 2.1. Entorno de Doble Cartografía (Mapa Base e Incidentes)
- **Mapa Primario (`#map`):** Permite hacer clic sobre cualquier coordenada del territorio para fijar la latitud y longitud del nuevo incidente con marcador interactivo.
- **Buscador Flotante con Autocompletado:** Input `#inputBusquedaMapa` conectado a la cartografía local para ubicar barrios y comunas con un clic y reubicar el visor.
- **Capa Alterna de Incidentes (`#mapa2` / `#ver`):** Permite encender o apagar la capa de incidentes preexistentes para contrastar patrones y no registrar duplicados.

### 2.2. Formulario de Captura Administrativa
- **Campos Estructurados:**
  - Tipo de incidente (Catálogo con autollenado).
  - Fecha y hora precisa.
  - Comuna y Barrio (asistidos por geocodificación inversa).
  - Modalidad, Gravedad (1 a 5).
  - Descripción narrativa detallada y campo de foto opcional.
- **Endpoint de Creación:** `POST /api/incidentes` (o `/registrarIncidente`)
  - A diferencia del reportero, un administrador puede marcar el incidente directamente como `Aprobado` si proviene de fuentes oficiales comprobadas.

### 2.3. Edición y Reubicación de Incidentes
- **Endpoints:**
  - `GET /api/incidentes/:id`: Obtiene todos los campos del incidente para precargar el modal de edición.
  - `PUT /api/incidentes/:id`: Actualiza campos alfanuméricos y posición espacial `ST_SetSRID(ST_MakePoint(lng, lat), 4326)`.

### 2.4. Eliminación de Registros
- **Endpoint:** `DELETE /api/incidentes/:id`
- **Permisos:** Requiere rol `admin` o `superadmin`. Se ejecuta con confirmación previa para evitar pérdidas accidentales.

---

## 3. Dependencias y Flujo de Interacción
- **Dependencia:** Utiliza los catálogos maestros (`GET /api/catalogos`) y la infraestructura de PostGIS.
- **Sincronización:** Cada nuevo registro o edición se refleja de inmediato en la tabla de datos y en los mapas analíticos.

---

## 4. Diagrama de Arquitectura y Flujo
El diagrama de este módulo se encuentra en:
👉 [`Admin/diagramas/02_registro_gestion_incidentes.drawio`](diagramas/02_registro_gestion_incidentes.drawio)
