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
| **Tipo de Software** | Aplicación Web Transaccional y Analítica (WebGIS / Geoportal) |
| **Versión Oficial** | Versión 2.0 (Revisión Final de Producción) |
| **Fecha de Publicación** | Septiembre 2026 |
| **Licenciamiento** | Propietario / Académico Institucional (SENA) |

---

## 1. DESCRIPCIÓN GENERAL DEL PRODUCTO

**SIGI** es una solución tecnológica integral tipo **WebGIS** diseñada para la georreferenciación, captura en terreno, validación operativa y análisis estadístico de eventos que afectan la seguridad, convivencia y movilidad en el municipio de **Florencia, Caquetá**. 

La plataforma articula el trabajo de agentes de campo, analistas de seguridad y la ciudadanía mediante un entorno interactivo basado en mapas vectoriales, ingesta de evidencia fotográfica en la nube (Cloudinary), control de acceso por roles (RBAC) y un motor de validación con candado concurrente que erradica la duplicidad de dictámenes.

> **ESPACIO PARA DIAGRAMA:**  
> *(Insertar aquí Captura o Diagrama Representativo de la Vista Principal del Geoportal SIGI)*

---

## 2. FICHA RESUMEN DE CAPACIDADES Y MÓDULOS

```
+-------------------------------------------------------------------------------------------------+
|                                    ECOSISTEMA MODULAR SIGI                                      |
+--------------------------------+--------------------------------+-------------------------------+
|  MOD-01: GEOPORTAL PÚBLICO     |  MOD-02: CAPTURA EN TERRENO    |  MOD-03: MESA DE VALIDACIÓN   |
|  - Visor Leaflet multipolígono |  - GPS móvil de alta precisión |  - Cola compartida con lock   |
|  - Cobertura Barrios y Veredas |  - Carga evidencia Cloudinary  |  - Dictamen multi-criterio    |
|  - Filtros espacio-temporales  |  - Historial personal de casos |  - Prevención de colisiones   |
+--------------------------------+--------------------------------+-------------------------------+
|  MOD-04: ANALÍTICA Y KPIS      |  MOD-05: INGESTA MASIVA CSV    |  MOD-06: SEGURIDAD Y AUDITORÍA|
|  - Dashboards dinámicos Chart  |  - Streaming masivo en lote    |  - RBAC (4 Perfiles activos)  |
|  - Detección de zonas críticas |  - Rollback atómico de carga   |  - Hasheo Bcrypt + Rate-Limit |
|  - Horas pico y estacionalidad |  - Logs de descarte de filas   |  - Trazabilidad forense (Logs)|
+--------------------------------+--------------------------------+-------------------------------+
```

---

## 3. PERFILES DE USUARIO Y MATRIZ OPERATIVA

El sistema opera bajo un modelo estricto de **Control de Acceso Basado en Roles (RBAC)**:

| Perfil | Tipo de Acceso | Funcionalidades Principales Habilitadas |
| :--- | :--- | :--- |
| **Invitado** *(Ciudadano)* | Público (Sin credenciales) | Consulta interactiva del mapa, aplicación de filtros de fecha y categoría, visualización de estadísticas y solicitud de recuperación de contraseña. |
| **Reportero** *(Agente de Campo)* | Privado (Autenticado) | Captura de coordenadas GPS automáticas por hardware, carga de fotografías de evidencia a Cloudinary, radicación de novedades y seguimiento en "Mis Reportes". |
| **Administrador** *(Analista)* | Privado (Autenticado) | Acceso a la mesa de validación con candado de concurrencia (10 min), aprobación/desestimación de incidentes, edición avanzada, importación masiva de archivos CSV y rollback atómico. |
| **Superadministrador** *(Gobernanza)*| Privado (Autenticado) | Creación y activación/inactivación de usuarios con despacho de credenciales por email, auditoría forense inmutable de logs, gestión de catálogos y liberación forzosa de bloqueos. |

> **ESPACIO PARA DIAGRAMA:**  
> *(Insertar aquí Diagrama de Flujo del Ciclo de Vida del Incidente entre Roles)*

---

## 4. ESPECIFICACIONES TÉCNICAS Y STACK DE DESARROLLO

### 4.1 Arquitectura y Patrones
- **Patrón Arquitectónico:** Arquitectura en 3 Capas (*3-Tier Architecture*): Presentación, Lógica de Negocio y Persistencia Espacial.
- **Estilo de Comunicación:** API RESTful desacoplada con intercambio de cargas JSON y multipart/form-data.
- **Sistemas de Coordenadas:** EPSG:4326 - WGS84 (Latitud/Longitud en grados decimales).

### 4.2 Tecnologías de Implementación
| Componente | Tecnología Seleccionada | Versión | Propósito Técnico |
| :--- | :--- | :--- | :--- |
| **Frontend Base** | HTML5 + CSS3 Nativo + Vanilla JS | ES6+ | Interfaz ligera, reactiva, accesible y libre de sobrecargas de frameworks. |
| **Motor de Mapas** | Leaflet.js | 1.9.4 | Visualización y renderizado cartográfico de capas raster y vectoriales. |
| **Analítica Gráfica** | Chart.js | 4.4.x | Construcción de tableros gráficos de métricas y zonas calientes. |
| **Servidor de Aplicación** | Node.js | v20.x LTS+ | Entorno de ejecución JavaScript asíncrono y de alto rendimiento. |
| **Framework Backend** | Express | v5.2.1 | Ruteo modular, manejo de middleware y controladores REST. |
| **Base de Datos** | PostgreSQL | v15.x+ | Motor de base de datos relacional transaccional (ACID). |
| **Módulo Geoespacial** | PostGIS | v3.3.x+ | Cómputo espacial nativo, tipos `Point` y `MultiPolygon`, índices GiST. |
| **Almacenamiento Cloud**| Cloudinary SDK | v2.11.x | CDN de evidencia multimedia con optimización automática a WebP. |
| **Seguridad HTTP** | Helmet + Express-Rate-Limit | 8.x / 8.x | Hardening de cabeceras HTTP y protección contra fuerza bruta/DDoS. |
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

1. **Eficiencia en la Validación (Cero Colisiones):** La implementación de la mesa de validación con candado concurrente garantiza que un incidente solo sea intervenido por un analista a la vez, liberándose automáticamente tras 10 minutos de inactividad.
2. **Cero Consumo Local de Disco en Evidencias:** La integración en streaming de Cloudinary previene la saturación del servidor institucional y asegura la disponibilidad global de las fotografías mediante redes CDN seguras.
3. **Topología Municipal Real:** El sistema no utiliza aproximaciones cartográficas; opera con las delimitaciones vectoriales oficiales de barrios y veredas de Florencia provistas en formato PostGIS.
4. **Respaldo e Ingesta Masiva Flexible:** Posibilidad de cargar cientos de registros en segundos vía CSV con la capacidad inmediata de reversión atómica (*rollback*) si se detectan anomalías en el origen.
5. **Auditoría Forense Integral:** Todo evento crítico (creación, edición, cambio de estado, bloqueo, ingreso de usuario) queda registrado de forma inmutable con IP y agente de usuario.

---

## 7. DATOS DEL REGISTRO Y CONFORMIDAD ACADÉMICA

- **Dictamen Técnico:** Proyecto validado para sustentación y cumplimiento de la fase formativa del SENA.
- **Alineación Normativa:** Cumplimiento de la Ley 1581 de 2012 (Protección de Datos Personales en Colombia) y estándares OWASP Top 10 para aplicaciones web seguras.
- **Firma del Responsable del Proyecto:**
  
  _____________________________________________  
  **Daniel Felipe Vera Perdomo**  
  Desarrollador Principal — Aprendiz ADSO  
  Ficha Técnica 3142784 — SENA Regional Caquetá
