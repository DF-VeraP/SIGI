# Módulo 01: Captura de Incidentes en Terreno (GPS + Cloudinary)

## 1. Identificación y Propósito
- **Rol:** Reportero (Agente de Campo / Cuadrante de Vigilancia / Ciudadano Verificado)
- **Ruta Frontend:** `/reportero` (`public/reportero/index.html` - Pestaña "Nuevo Reporte")
- **Archivos Clave:**
  - `public/reportero/reportero.js`
  - `public/reportero/reportero.css`
  - `controllers/incidentes.controller.js`
  - `routes/incidentes.routes.js`
  - `utils/cloudinary.js`
- **Propósito:** Facilitar la recolección rápida de incidentes desde dispositivos móviles en el punto exacto de los hechos, combinando geolocalización satelital con evidencia fotográfica digital alojada en la nube.

---

## 2. Submódulos y Especificaciones Técnicas

### 2.1. Geolocalización Asistida por GPS y Ajuste Fino
- **API del Navegador:** `navigator.geolocation.getCurrentPosition` con `enableHighAccuracy: true`.
- **Minimapa Interactivo:** 
  - Al presionar el botón *"Obtener mi ubicación GPS actual"*, se obtiene la latitud y longitud con alta precisión.
  - Se dibuja un marcador móvil sobre un mapa Leaflet centrado en la posición del reportero.
  - El usuario puede tocar o arrastrar el marcador para afinar la ubicación en caso de rebote de señal en zonas densas.

### 2.2. Formulario Operativo de Captura
- **Campos Estructurados:**
  - *Catálogo de Incidentes:* Selector dinámico alimentado por `GET /api/catalogos` (Hurto a personas, Vandalismo, Riña, Sospecha, etc.).
  - *Fecha y Hora:* Prellenado automático con el instante presente, editable si el hecho ocurrió horas antes.
  - *Nivel de Gravedad:* Escala del 1 (Muy baja) al 5 (Crítica).
  - *Modalidad y Descripción:* Detalle narrativo del hecho presenciado.
  - *Dirección o Referencia Urbana:* Texto orientador del sector.

### 2.3. Pipeline de Evidencia Fotográfica (Cloudinary + Local)
- **Carga de Archivo:** Procesado en memoria mediante `multer.memoryStorage()`.
- **Subida a Cloudinary (`utils/cloudinary.js`):**
  - La imagen se transmite vía stream seguro a la carpeta `sigi_incidentes`.
  - Se genera una URL HTTPS pública y optimizada con CDN.
  - *Mecanismo de Resiliencia / Fallback:* Si no hay conexión o falla el API de Cloudinary, el sistema almacena la fotografía localmente en `public/uploads/incidentes/` sin interrumpir el registro del incidente.

### 2.4. Radicación en Estado "Pendiente"
- **Endpoint:** `POST /api/incidentes` (o `/registrarIncidente`)
- **Autenticación:** Requiere sesión activa (`verificarSesion`) y cuenta activa (`verificarEstadoActivo`).
- **Estado Inicial:** Todo reporte ingresa con `estado = 'Pendiente'` y `id_usuario_reporta = req.session.id_usuario`.
- **Integración con Cola:** Se genera una notificación interna y se incrementa el contador de la cola compartida de los administradores.

---

## 3. Dependencias y Flujo de Interacción
- **Dependencia:** Requiere permisos de geolocalización en el navegador móvil y cámara/almacenamiento.
- **Flujo Hacia Otros Roles:** El incidente radicado fluye directamente hacia la **Mesa de Validación (Módulo 01 del Administrador)**.

---

## 4. Diagrama de Arquitectura y Flujo
El diagrama de este módulo se encuentra en:
👉 [`Reportero/diagramas/01_captura_incidente_gps.drawio`](diagramas/01_captura_incidente_gps.drawio)
