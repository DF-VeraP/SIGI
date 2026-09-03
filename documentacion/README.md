# 📚 Documentación Técnica del Sistema SIGI

**SIGI (Sistema de Información Geográfica de Incidentes)** es una plataforma web y móvil para la recepción, georreferenciación, análisis espacial y gestión en tiempo real de incidentes de seguridad y emergencias en el territorio.

---

## 🗺️ Mapa de Documentación por Módulos

Haz clic en cualquiera de los siguientes módulos para acceder a su documentación técnica detallada con diagramas de arquitectura, secuencias, modelos de datos y manuales de API:

| Módulo | Nombre del Módulo | Descripción Principal | Enlace a Documentación |
| :---: | :--- | :--- | :---: |
| **01** | **Autenticacion y Usuarios** | Gestión de roles (RBAC: Superadmin, Admin, Reportero, Invitado), Login, control de sesiones y auditoría. | [Ver Módulo 01](./01_autenticacion_y_usuarios.md) |
| **02** | **Gestión de Incidentes & Cola Compartida** | Registro de incidentes, ciclo de vida, cola de verificación compartida y bloqueos atómicos (*Takeover*). | [Ver Módulo 02](./02_gestion_incidentes_y_cola_compartida.md) |
| **03** | **Geografía & Mapas Interactivos** | Capas GeoJSON (Barrios/Veredas), consultas espaciales en PostGIS (`ST_Contains`) y autocompletado unificado. | [Ver Módulo 03](./03_geografia_y_mapas_interactivos.md) |
| **04** | **Analítica, KPIs & Carga Masiva** | Dashboard analítico, KPIs contextuales (variación mensual ↑/↓), Top 10 zonas críticas e importación CSV con Undo. | [Ver Módulo 04](./04_analitica_y_reportes_kpi.md) |
| **05** | **Evidencia Fotográfica Cloudinary** | Integración CDN Cloudinary (`sigi_preset`), protocolo de resiliencia local (Fallback) y Visor Modal Lightbox. | [Ver Módulo 05](./05_evidencia_fotografica_cloudinary.md) |

---

## 🏛️ Arquitectura General del Sistema

```mermaid
graph TD
    subgraph Capa de Presentación (Frontend)
        MOB[📱 App Móvil Reportero - HTML5/CSS/JS]
        ADM[🖥️ Mesa de Control Admin - Dashboard/Leaflet]
        INV[👁️ Panel Invitado - Consulta Pública]
    end

    subgraph Capa de Servicios & Seguridad (Backend)
        EXP[⚡ Node.js / Express Web Server]
        AUT[🔒 Middleware RBAC & Control de Sesiones]
        MUL[📦 Middleware Multer (Archivos Multipart)]
        EXP --> AUT
        EXP --> MUL
    end

    subgraph Capa de Persistencia & Nube
        DB[(🗄️ PostgreSQL + Extension PostGIS)]
        CDN[☁️ Cloudinary CDN - Almacenamiento Fotos]
        LOC[📁 Fallback Local - /public/uploads/]
    end

    MOB -->|POST /api/incidentes| EXP
    ADM -->|REST APIs JSON| EXP
    INV -->|Consulta Read-only| EXP

    EXP --> DB
    MUL --> CDN
    MUL -->|Si falla la Nube| LOC
```

---

## 🛠️ Tecnologías Principales

* **Backend:** Node.js, Express.js.
* **Base de Datos:** PostgreSQL con extensión espacial PostGIS.
* **Frontend:** Javascript (Vanilla JS), HTML5, CSS3 (Glassmorphism & Mobile-first), Leaflet.js.
* **Almacenamiento Cloud:** Cloudinary API & CDN.
* **Pruebas:** Jest, Supertest.
