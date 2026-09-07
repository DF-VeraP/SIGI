# Módulo 02: Analítica y Tableros KPI Ciudadanos

## 1. Identificación y Propósito
- **Rol:** Invitado (Público General / No Autenticado)
- **Ruta Frontend:** Sección lateral y de métricas en `/dashboard`
- **Archivos Clave:**
  - `public/dashboard/index.html`
  - `public/dashboard/dashboard.js`
  - `controllers/estadisticas.controller.js`
  - `routes/estadisticas.routes.js`
- **Propósito:** Ofrecer a la ciudadanía indicadores cuantitativos claros y visuales sobre la situación de seguridad, frecuencias delictivas y focos de atención urbana, facilitando la toma de decisiones informada.

---

## 2. Submódulos y Endpoints Asociados

### 2.1. Métricas de Resumen Global (Tarjetas KPI)
- **Endpoint:** `GET /resumen`
- **Descripción:** Calcula en tiempo real el total de incidentes aprobados en la base de datos, clasificados por periodos recientes (último mes, última semana).
- **Indicadores Visuales:**
  - Total incidentes registrados.
  - Indicador de tendencia o variación porcentual.

### 2.2. Distribución por Tipología de Incidente (Gráfico de Barras / Pastel)
- **Endpoint:** `GET /conteoPorTipo`
- **Tecnología:** Chart.js
- **Descripción:** Agrupa y totaliza los eventos por tipo (Hurto, Homicidio, Extorsión, Lesiones, Accidentes). Proporciona porcentajes de participación relativa sobre el total general.

### 2.3. Detección de Zonas Críticas (Top Barrios y Comunas)
- **Endpoint:** `GET /top-zonas`
- **Descripción:** Agrupación espacial por barrio y comuna que lista las 5 áreas con mayor concentración de reportes aprobados.
- **Utilidad Ciudadana:** Permite identificar rápidamente sectores con mayor frecuencia de incidentes para prevención comunitaria.

### 2.4. Ranking de Incidentes Recurrentes y Timestamp de Actualización
- **Endpoints:**
  - `GET /top-incidentes`: Ranking de las modalidades o subtipos más frecuentes.
  - `GET /ultima-actualizacion`: Retorna la fecha y hora exacta del último reporte aprobado incorporado al sistema, asegurando la vigencia de la información.

---

## 3. Dependencias y Flujo de Datos
- **Dependencia de Origen:** Depende de la base de datos relacional PostgreSQL con la vista o tabla de `incidente`.
- **Dependencia de Validación:** Las consultas excluyen estrictamente incidentes pendientes de validación o desestimados.
- **Interacción con el Mapa:** Al hacer clic sobre una tipología o barrio en los gráficos de analítica, se puede disparar un filtro que actualiza los marcadores en el **Módulo 01: Visor Geográfico**.

---

## 4. Diagrama de Arquitectura y Flujo
El diagrama de este módulo se encuentra en:
👉 [`Invitado/diagramas/02_analitica_kpis_ciudadanos.drawio`](diagramas/02_analitica_kpis_ciudadanos.drawio)
