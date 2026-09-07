# Módulo 01: Visor Geográfico Público

## 1. Identificación y Propósito
- **Rol:** Invitado (Ciudadanía en general / Usuario no autenticado)
- **Ruta Frontend:** `/dashboard` o `/`
- **Archivos Clave:** 
  - `public/dashboard/index.html`
  - `public/dashboard/dashboard.js`
  - `public/dashboard/dashboard.css`
- **Propósito:** Permitir a cualquier ciudadano consultar de forma interactiva la georreferenciación de incidentes de seguridad y orden público validados por la administración, garantizando transparencia institucional y resguardando datos personales o sensibles.

---

## 2. Submódulos

### 2.1. Cartografía Base Interactiva
- **Tecnología:** Leaflet.js con proveedores de teselas de código abierto.
- **Capas Disponibles:**
  - *OpenStreetMap Estándar:* Ideal para navegación diurna y reconocimiento de calles y avenidas.
  - *CartoDB Dark Matter:* Modo noche/oscuro de alto contraste que resalta mapas de calor y clústeres de incidentes.
- **Controles:** Zoom táctil/rueda del ratón, paneo, botón de centrado y botón flotante para alternar entre tema claro y tema oscuro.

### 2.2. Renderizado Geoespacial de Incidentes
- **Endpoint Backend:** `GET /api/incidentes`
- **Lógica de Filtrado:** Solo se entregan incidentes cuyo estado sea `Aprobado` (validado por analistas o administradores). Los incidentes en estado `Pendiente` o `Desestimado` quedan ocultos para el público.
- **Simbología y Clústeres:**
  - Agrupación por proximidad mediante `Leaflet.markercluster` para evitar sobrecarga del DOM al visualizar miles de puntos.
  - Colores diferenciados por nivel de gravedad (1: Verde, 2: Azul, 3: Amarillo, 4: Naranja, 5: Rojo).

### 2.3. Inspección y Popups Informativos
- Al hacer clic sobre cualquier marcador individual, se despliega un popup informativo que contiene:
  - Tipo de Incidente (Ej. Hurto a personas, Vandalismo, Riña).
  - Fecha del suceso y franja horaria aproximada.
  - Barrio / Vereda / Localidad.
  - Nivel de gravedad percibida y modalidad.
  - *Protección de Privacidad:* Se omiten datos del denunciante, nombres de víctimas, números de contacto e identificadores internos del sistema.

---

## 3. Dependencias y Flujo de Interacción
- **Dependencia Previa:** Requiere que el catálogo de incidentes esté disponible (`GET /api/catalogos`) y que los analistas del rol `Admin` o `Superadmin` hayan aprobado reportes previamente.
- **Interacción con otros Módulos:**
  - Alimenta y sincroniza sus datos con el **Módulo 02: Analítica y Tableros KPI**.
  - Recibe parámetros de consulta desde el **Módulo 03: Motor de Filtros**.

---

## 4. Diagrama de Arquitectura y Flujo
El diagrama de este módulo se encuentra en:
👉 [`Invitado/diagramas/01_visor_geografico_publico.drawio`](diagramas/01_visor_geografico_publico.drawio)
