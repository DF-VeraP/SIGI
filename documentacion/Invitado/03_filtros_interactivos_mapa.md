# Módulo 03: Motor de Filtros y Búsqueda Espacio-Temporal

## 1. Identificación y Propósito
- **Rol:** Invitado (Público General / No Autenticado)
- **Ruta Frontend:** Barra superior y panel de filtros en `/dashboard`
- **Archivos Clave:**
  - `public/dashboard/index.html`
  - `public/dashboard/dashboard.js`
  - `controllers/catalogos.controller.js`
  - `controllers/incidentes.controller.js`
- **Propósito:** Brindar al ciudadano capacidades avanzadas de segmentación y localización geográfica para analizar incidentes por periodos específicos, categorías delictivas, nivel de gravedad o barrios concretos.

---

## 2. Submódulos y Capacidades

### 2.1. Carga Dinámica de Catálogos
- **Endpoint:** `GET /api/catalogos`
- **Descripción:** Obtiene los tipos de incidentes, modalidades y categorías vigentes para poblar automáticamente los menús desplegables del panel de filtros sin requerir recargar la página.

### 2.2. Filtros Multidimensionales
- **Filtro Temporal:** Selector de fecha inicial y fecha final (permite análisis de fines de semana, meses o años particulares).
- **Filtro Categórico:** Selección de tipología (Homicidio, Hurto, Tránsito, etc.).
- **Filtro de Gravedad:** Escala de 1 a 5 con código visual de colores.
- **Filtro Geográfico Administrativo:** Selección por Comuna o Zona urbana/rural.

### 2.3. Búsqueda Espacial por Barrio o Vereda
- **Componente:** Input flotante con autocompletado en tiempo real.
- **Mecanismo:**
  - El usuario escribe el nombre de un sector (Ej. "Centro", "El Prado").
  - El mapa realiza un paneo suave y ajuste de zoom (`map.flyTo` o `fitBounds`) encuadrando automáticamente la zona seleccionada.

---

## 3. Dependencias y Flujo de Interacción
- **Dependencia:** Interactúa directamente con el **Módulo 01: Visor Geográfico**, ya que cada cambio en los filtros recalcula y re-renderiza la capa de clústeres en pantalla.
- **Eficiencia:** Las peticiones envían parámetros Query String (Ej: `GET /api/incidentes?fecha_inicio=...&tipo=...`) optimizadas con índices geoespaciales `GIST` y B-Tree en PostgreSQL.

---

## 4. Diagrama de Arquitectura y Flujo
El diagrama de este módulo se encuentra en:
👉 [`Invitado/diagramas/03_filtros_interactivos_mapa.drawio`](diagramas/03_filtros_interactivos_mapa.drawio)
