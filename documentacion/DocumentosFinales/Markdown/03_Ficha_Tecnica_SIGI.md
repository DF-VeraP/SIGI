# FICHA TÉCNICA DEL PRODUCTO DE SOFTWARE
## Sistema de Información Geográfica de Incidentes — SIGI
**Servicio Nacional de Aprendizaje (SENA) — Formación Profesional Integral**

---

### CONTROL DE IDENTIFICACIÓN
| Campo | Detalle Informativo |
| :--- | :--- |
| **Nombre del Software** | **SIGI** (Sistema de Información Geográfica de Incidentes) |
| **Código / Ficha SENA** | ADSO - Ficha 3142784 |
| **Autor y Desarrollador** | Daniel Felipe Vera Perdomo |
| **Programa de Formación** | Análisis y Desarrollo de Software (ADSO) |
| **Centro de Formación** | Regional Caquetá — Florencia, Colombia |
| **Despliegue Oficial en Producción** | [https://sigi.verapd.xyz](https://sigi.verapd.xyz) |
| **Tipo de Software** | Aplicación Web Transaccional, Analítica y Geoespacial (WebGIS / PWA) |
| **Versión Oficial** | Versión 2.1 (Revisión Final con Clean Architecture, IA, Realtime y PWA) |
| **Fecha de Publicación** | Octubre 2026 |
| **Licenciamiento** | Propietario / Académico Institucional (SENA) |

---

## 1. DESCRIPCIÓN GENERAL DEL PRODUCTO

**SIGI** es una solución tecnológica integral tipo **WebGIS** y **PWA** diseñada para la georreferenciación, captura en terreno, validación operativa y análisis estadístico de eventos que afectan la seguridad, convivencia y movilidad en el municipio de **Florencia, Caquetá**, desplegada en producción en **https://sigi.verapd.xyz**.

La plataforma articula el trabajo de agentes de campo, analistas de seguridad y la ciudadanía mediante un entorno interactivo basado en mapas vectoriales, ingesta de evidencia fotográfica en la nube (Cloudinary), control de acceso por roles (RBAC), candados concurrentes de validación, asistencia predictiva por Machine Learning (Naive Bayes y clustering espacial DBSCAN), comunicación push en tiempo real con WebSockets (Socket.io), resiliencia fuera de línea (PWA Offline) y compilación documental de informes oficiales en PDF (PDFKit).

---

## 2. FICHA RESUMEN DE CAPACIDADES Y MÓDULOS

```
+---------------------------------------------------------------------------------------------------+
|                                      ECOSISTEMA MODULAR SIGI                                      |
+----------------------------------+--------------------------------+-------------------------------+
|  MOD-01: GEOPORTAL PÚBLICO       |  MOD-02: CAPTURA EN TERRENO    |  MOD-03: MESA DE VALIDACIÓN   |
|  - Visor Leaflet multipolígono   |  - GPS móvil de alta precisión |  - Cola compartida con lock   |
|  - Cobertura Barrios y Veredas   |  - Evidencia Cloudinary WebP   |  - Dictamen multi-criterio    |
|  - Filtros espacio-temporales    |  - Historial "Mis Reportes"    |  - Prevención de colisiones   |
+----------------------------------+--------------------------------+-------------------------------+
|  MOD-04: ANALÍTICA Y KPIS        |  MOD-05: INGESTA MASIVA CSV    |  MOD-06: SEGURIDAD Y AUDITORÍA|
|  - Dashboards dinámicos Chart.js |  - Streaming masivo en lote    |  - RBAC (4 Perfiles activos)  |
|  - Detección de zonas críticas   |  - Rollback atómico de lote    |  - Hasheo Bcrypt + Rate-Limit |
|  - Horas pico y estacionalidad   |  - Logs de descarte de filas   |  - Trazabilidad forense (Logs)|
+----------------------------------+--------------------------------+-------------------------------+
|  MOD-07: MACHINE LEARNING & NLP  |  MOD-08: TIEMPO REAL & PWA     |  MOD-09: GENERACIÓN PDFKIT    |
|  - Clasificador Naive Bayes      |  - Push WebSockets (Socket.io) |  - Informes vectoriales PDF   |
|  - Clustering espacial DBSCAN    |  - Alertas sonoras Web Audio   |  - Descarga / Previsualización|
|  - Proyecciones temporales       |  - Captura Offline PWA y autosync| - KPIs y métricas del período|
+----------------------------------+--------------------------------+-------------------------------+
```

---

## 3. PERFILES DE USUARIO Y MATRIZ OPERATIVA

El sistema opera bajo un modelo estricto de **Control de Acceso Basado en Roles (RBAC)**:

| Perfil | Tipo de Acceso | Funcionalidades Principales Habilitadas |
| :--- | :--- | :--- |
| **Invitado** *(Ciudadano)* | Público (Sin credenciales) | Consulta interactiva del mapa, aplicación de filtros de fecha y categoría, visualización de estadísticas, alertas en vivo y solicitud de recuperación de contraseña. |
| **Reportero** *(Agente de Campo)* | Privado (Autenticado) | Captura de coordenadas GPS por hardware, carga de fotografías a Cloudinary, asistencia predictiva por IA en redacción, radicación en modo offline PWA y seguimiento en "Mis Reportes". |
| **Administrador** *(Analista)* | Privado (Autenticado) | Mesa de validación con candado concurrente (10 min), alertas push en vivo, sugerencias de IA para reclasificación, importación CSV con rollback, visualización de Hotspots DBSCAN y exportación de informes oficiales en PDF. |
| **Superadministrador** *(Gobernanza)*| Privado (Autenticado) | Gobernanza total, creación de usuarios con credenciales por email, bitácora forense de auditoría, control y desbloqueo perimetral de IPs con temporizador en vivo, gestión cromática perceptual (Redmean) de catálogos, reentrenamiento de IA y blindaje del último superadmin activo. |

---

## 4. ESPECIFICACIONES TÉCNICAS Y STACK DE DESARROLLO

### 4.1 Arquitectura y Patrones
- **Patrón Arquitectónico:** Arquitectura Limpia Multicapa (*Layered Clean Architecture*): Presentación/PWA -> Ruteo/Middlewares -> Controladores -> Servicios -> Capa de Modelos -> Base de Datos / Cloud.
- **Estilo de Comunicación:** API RESTful desacoplada con intercambio de cargas JSON, streams multipart/form-data y eventos push WSS/WebSockets.
- **Sistemas de Coordenadas:** EPSG:4326 - WGS84 (Latitud/Longitud en grados decimales).

### 4.2 Tecnologías de Implementación
| Componente | Tecnología Seleccionada | Versión | Propósito Técnico |
| :--- | :--- | :--- | :--- |
| **Frontend Base** | HTML5 + CSS3 Nativo + Vanilla JS | ES6+ | Interfaz ligera, reactiva, accesible y libre de sobrecargas de frameworks. |
| **Motor de Mapas** | Leaflet.js | 1.9.4 | Visualización y renderizado cartográfico de capas raster y vectoriales GeoJSON. |
| **Analítica Gráfica** | Chart.js | 4.4.x | Construcción de tableros gráficos de métricas y zonas calientes. |
| **Arquitectura Offline** | Service Worker + PWA Manifest | W3C API | Resiliencia operativa fuera de línea con encolamiento local en `localStorage`. |
| **Tiempo Real** | Socket.io + Web Audio API | 4.8.x | Sincronización push reactiva instantánea y síntesis sonora no dependiente de assets. |
| **Servidor de Aplicación** | Node.js | v20.x LTS+ | Entorno de ejecución JavaScript asíncrono y de alto rendimiento. |
| **Framework Backend** | Express | v5.2.1 | Ruteo modular, middlewares de seguridad y controladores REST. |
| **Inteligencia Artificial** | Machine Learning Nativo (NLP / Espacial) | Servicio Propio | Multinomial Naive Bayes, DBSCAN clustering espacial y forecasting de series de tiempo. |
| **Generador Documental** | PDFKit | v0.15.x | Emisión de informes vectorizados de alta resolución en PDF institucional. |
| **Capa de Modelos** | Clean Model Layer | JavaScript ES6 | Aislamiento de consultas SQL desacoplado de controladores en `models/`. |
| **Base de Datos** | PostgreSQL | v15.x+ | Motor de base de datos relacional transaccional (ACID). |
| **Módulo Geoespacial** | PostGIS | v3.3.x+ | Cómputo espacial nativo, tipos `Point` y `MultiPolygon`, índices GiST. |
| **Almacenamiento Cloud**| Cloudinary SDK | v2.11.x | CDN de evidencia multimedia con optimización automática a WebP. |
| **Seguridad HTTP** | Helmet + Express-Rate-Limit + GestorIps | 8.x / 8.x | Hardening de cabeceras HTTP, mitigación de fuerza bruta/DDoS, normalización IPv4/IPv6 y desbloqueo perimetral en tiempo real. |
| **Cifrado de Claves** | Bcrypt | v6.0.0 | Hasheo unidireccional con factor de trabajo de 10 iteraciones y salting. |
| **Correo Transaccional**| Nodemailer | v10.0.1 | Despacho de notificaciones y tokens de restablecimiento por SMTP. |

---

## 5. REQUERIMIENTOS MÍNIMOS Y RECOMENDADOS DEL ENTORNO

### 5.1 Servidor de Despliegue
- **Procesador (CPU):** 2 vCPU a 2.0 GHz (Mínimo) | 4 vCPU a 2.5 GHz o superior (Recomendado).
- **Memoria RAM:** 4 GB (Mínimo) | 8 GB DDR4 (Recomendado).
- **Almacenamiento:** 40 GB SSD (Mínimo) | 80 GB NVMe (Recomendado).
- **Sistema Operativo:** Linux (Ubuntu Server 22.04 LTS o superior) / Windows Server 2022.

### 5.2 Estaciones de Consulta y Dispositivos de Campo
- **Navegadores Homologados:** Google Chrome 110+, Mozilla Firefox 110+, Microsoft Edge 110+, Safari 16+.
- **Dispositivos Móviles (Reporteros):** Smartphone con Android 9+ o iOS 14+, navegador compatible con API de Geolocalización W3C, receptor GPS integrado y cámara fotográfica mínima de 8 MP.
- **Ancho de Banda:** Conexión a Internet fija de 10 Mbps o datos móviles 3G/4G/5G con cobertura en la zona de operación.

---

## 6. VENTAJAS DIFERENCIALES E IMPACTO INSTITUCIONAL

1. **Eficiencia en la Validación (Cero Colisiones):** La mesa de validación con candado concurrente garantiza que un incidente solo sea intervenido por un analista a la vez, liberándose automáticamente tras 10 minutos de inactividad.
2. **Asistencia Predictiva Inteligente:** El asistente NLP analiza el texto en tiempo real, sugiriendo la tipología y gravedad adecuadas con clasificación bayesiana, acelerando la toma de decisiones en campo y en la mesa técnica.
3. **Resiliencia Operativa Offline (PWA):** Los agentes en terreno pueden continuar radicando novedades en zonas rurales o urbanas sin conectividad, garantizando cero pérdida de datos gracias a la sincronización automática al volver a línea.
4. **Operación Reactiva en Tiempo Real:** Las novedades y dictámenes se transmiten instantáneamente vía WebSockets con feedback sonoro mediante Web Audio API, eliminando la necesidad de recargar la página.
5. **Cero Consumo Local de Disco en Evidencias:** La integración en streaming de Cloudinary previene la saturación del servidor institucional y asegura la disponibilidad global de las fotografías mediante redes CDN seguras.
6. **Topología Municipal Real:** El sistema opera con las delimitaciones vectoriales oficiales de barrios y veredas de Florencia provistas en formato PostGIS.
7. **Informes Ejecutivos Oficiales Automatizados:** Capacidad de generar informes formales mensuales en PDF vectorial con un solo clic, listos para comités de orden público y autoridades locales.
8. **Auditoría Forense Integral:** Todo evento crítico (creación, edición, cambio de estado, bloqueo, ingreso de usuario) queda registrado de forma inmutable con IP y agente de usuario.

---

## 7. DATOS DEL REGISTRO Y CONFORMIDAD ACADÉMICA

- **Dictamen Técnico:** Proyecto validado para sustentación y cumplimiento de la fase formativa del SENA.
- **Despliegue Verificado:** [https://sigi.verapd.xyz](https://sigi.verapd.xyz).
- **Alineación Normativa:** Cumplimiento de la Ley 1581 de 2012 (Protección de Datos Personales en Colombia) y estándares OWASP Top 10 para aplicaciones web seguras.
- **Firma del Responsable del Proyecto:**

  _____________________________________________
  **Daniel Felipe Vera Perdomo**
  Desarrollador Principal — Aprendiz ADSO
  Ficha Técnica 3142784 — SENA Regional Caquetá

