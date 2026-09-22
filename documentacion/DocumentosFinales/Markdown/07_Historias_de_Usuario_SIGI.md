# HISTORIAS DE USUARIO Y CRITERIOS DE ACEPTACIÓN
## Sistema de Información Geográfica de Incidentes — SIGI
**Documento Ágil de Requisitos con Sintaxis Gherkin (Dado / Cuando / Entonces)**

---

### Control del Documento
- **Proyecto:** SIGI - Sistema de Información Geográfica de Incidentes
- **Institución:** Servicio Nacional de Aprendizaje (SENA) — Regional Caquetá
- **Programa:** Análisis y Desarrollo de Software (ADSO) - Ficha 3142784
- **Autor:** Daniel Felipe Vera Perdomo
- **Localización:** Florencia, Caquetá, Colombia
- **Versión del Documento:** 2.0 (Desglose Exhaustivo por Roles con Criterios de Aceptación)
- **Fecha:** Septiembre 2026
- **Total de Historias de Usuario:** 29 Historias Formalizadas

---

## ÍNDICE GENERAL

1. [MARCO METODOLÓGICO Y CONVENCIONES](#1-marco-metodológico-y-convenciones)  
   1.1 [Estructura de la Ficha de Historia de Usuario](#11-estructura-de-la-ficha-de-historia-de-usuario)  
   1.2 [Priorización MoSCoW y Estimación en Puntos de Historia (Story Points)](#12-priorización-moscow-y-estimación-en-puntos-de-historia-story-points)  
   1.3 [Sintaxis de Criterios de Aceptación (Gherkin)](#13-sintaxis-de-criterios-de-aceptación-gherkin)  
2. [ÉPICA 1: GEOVISUALIZACIÓN Y CONSULTA CIUDADANA (ROL INVITADO)](#2-épica-1-geovisualización-y-consulta-ciudadana-rol-invitado)  
   - [HU-INV-01: Carga y Exploración Cartográfica de Florencia](#hu-inv-01-carga-y-exploración-cartográfica-de-florencia)  
   - [HU-INV-02: Visualización de Límites Poligonales de Barrios y Veredas](#hu-inv-02-visualización-de-límites-poligonales-de-barrios-y-veredas)  
   - [HU-INV-03: Consulta Detallada de Incidentes mediante Popups en Mapa](#hu-inv-03-consulta-detallada-de-incidentes-mediante-popups-en-mapa)  
   - [HU-INV-04: Filtrado Espacio-Temporal Cruzado de Casos](#hu-inv-04-filtrado-espacio-temporal-cruzado-de-casos)  
   - [HU-INV-05: Tableros de Indicadores y Gráficos Estadísticos (KPIs)](#hu-inv-05-tableros-de-indicadores-y-gráficos-estadísticos-kpis)  
   - [HU-INV-06: Solicitud de Restablecimiento de Contraseña por Correo](#hu-inv-06-solicitud-de-restablecimiento-de-contraseña-por-correo)  
3. [ÉPICA 2: CAPTURA EN TERRENO Y REPORTE MÓVIL (ROL REPORTERO)](#3-épica-2-captura-en-terreno-y-reporte-móvil-rol-reportero)  
   - [HU-REP-01: Autenticación en Dispositivos Móviles](#hu-rep-01-autenticación-en-dispositivos-móviles)  
   - [HU-REP-02: Forzado de Cambio Obligatorio de Clave en Primer Ingreso](#hu-rep-02-forzado-de-cambio-obligatorio-de-clave-en-primer-ingreso)  
   - [HU-REP-03: Captura de Coordenadas Geográficas mediante GPS del Teléfono](#hu-rep-03-captura-de-coordenadas-geográficas-mediante-gps-del-teléfono)  
   - [HU-REP-04: Ajuste Manual de Precisión Espacial en Mini-Mapa](#hu-rep-04-ajuste-manual-de-precisión-espacial-en-mini-mapa)  
   - [HU-REP-05: Captura y Carga Directa de Fotografía a Cloudinary](#hu-rep-05-captura-y-carga-directa-de-fotografía-a-cloudinary)  
   - [HU-REP-06: Radicación de Incidente y Autolocalización de Barrio/Vereda](#hu-rep-06-radicación-de-incidente-y-autolocalización-de-barriovereda)  
   - [HU-REP-07: Seguimiento de Estados en el Módulo "Mis Reportes"](#hu-rep-07-seguimiento-de-estados-en-el-módulo-mis-reportes)  
4. [ÉPICA 3: MESA DE VALIDACIÓN Y GESTIÓN DE CASOS (ROL ADMINISTRADOR)](#4-épica-3-mesa-de-validación-y-gestión-de-casos-rol-administrador)  
   - [HU-ADM-01: Consulta de la Cola Compartida de Casos Pendientes](#hu-adm-01-consulta-de-la-cola-compartida-de-casos-pendientes)  
   - [HU-ADM-02: Adquisición de Candado Concurrente (Locking de 10 min)](#hu-adm-02-adquisición-de-candado-concurrente-locking-de-10-min)  
   - [HU-ADM-03: Liberación Voluntaria del Candado de Revisión](#hu-adm-03-liberación-voluntaria-del-candado-de-revisión)  
   - [HU-ADM-04: Inspección de Evidencias y Metadatos en Alta Resolución](#hu-adm-04-inspección-de-evidencias-y-metadatos-en-alta-resolución)  
   - [HU-ADM-05: Ajuste y Reclasificación de Tipología o Severidad](#hu-adm-05-ajuste-y-reclasificación-de-tipología-o-severidad)  
   - [HU-ADM-06: Dictamen de Aprobación y Publicación en Geoportal Oficial](#hu-adm-06-dictamen-de-aprobación-y-publicación-en-geoportal-oficial)  
   - [HU-ADM-07: Desestimación de Incidente con Justificación Obligatoria](#hu-adm-07-desestimación-de-incidente-con-justificación-obligatoria)  
   - [HU-ADM-08: Ingesta Masiva de Incidentes mediante Archivo CSV](#hu-adm-08-ingesta-masiva-de-incidentes-mediante-archivo-csv)  
   - [HU-ADM-09: Reversión Atómica (Rollback) de la Última Carga Masiva](#hu-adm-09-reversión-atómica-rollback-de-la-última-carga-masiva)  
5. [ÉPICA 4: GOBERNANZA, AUDITORÍA Y SEGURIDAD (ROL SUPERADMINISTRADOR)](#5-épica-4-gobernanza-auditoría-y-seguridad-rol-superadministrador)  
   - [HU-SUP-01: Registro de Usuarios Institucionales y Despacho de Correo](#hu-sup-01-registro-de-usuarios-institucionales-y-despacho-de-correo)  
   - [HU-SUP-02: Modificación de Roles y Privilegios en el Modelo RBAC](#hu-sup-02-modificación-de-roles-y-privilegios-en-el-modelo-rbac)  
   - [HU-SUP-03: Inactivación de Cuentas y Destrucción de Sesiones Concurrente](#hu-sup-03-inactivación-de-cuentas-y-destrucción-de-sesiones-concurrente)  
   - [HU-SUP-04: Prevención de Auto-Inactivación y Auto-Degradación](#hu-sup-04-prevención-de-auto-inactivación-y-auto-degradación)  
   - [HU-SUP-05: Liberación Forzosa de Candados Concurrente Abandonados](#hu-sup-05-liberación-forzosa-de-candados-concurrente-abandonados)  
   - [HU-SUP-06: Inspección y Filtrado Forense de la Bitácora de Auditoría](#hu-sup-06-inspección-y-filtrado-forense-de-la-bitácora-de-auditoría)  
   - [HU-SUP-07: Parametrización y Mantenimiento de Catálogos Maestros](#hu-sup-07-parametrización-y-mantenimiento-de-catálogos-maestros)  
6. [MATRIZ DE TRAZABILIDAD (HISTORIAS DE USUARIO VS REQUISITOS ERS)](#6-matriz-de-trazabilidad-historias-de-usuario-vs-requisitos-ers)  

---

## 1. MARCO METODOLÓGICO Y CONVENCIONES

### 1.1 Estructura de la Ficha de Historia de Usuario
Cada Historia de Usuario (HU) responde a la estructura estándar de la metodología ágil Scrum y los lineamientos del SENA:
- **Identificador y Título:** Código unívoco (`HU-[ROL]-[NÚMERO]`) y título descriptivo.
- **Rol / Actor:** Perfil autorizado para ejecutar la acción.
- **Prioridad MoSCoW:** Nivel de obligatoriedad dentro del desarrollo del producto.
- **Estimación en Story Points (SP):** Puntos de complejidad según la serie de Fibonacci (1, 2, 3, 5, 8, 13).
- **Narrativa de Usuario:** Formulación canónica (**Como... Quiero... Para...**).
- **Precondiciones:** Estado necesario del sistema para posibilitar el evento.
- **Criterios de Aceptación:** Escenarios estructurados bajo el estándar formal **Gherkin**.
- **Requisito ERS Trazado:** Identificador del Requisito Funcional en la ERS IEEE 830.

### 1.2 Priorización MoSCoW y Estimación en Puntos de Historia (Story Points)
- **Must Have (Debe tenerse):** Funcionalidad crítica sin la cual el sistema no puede operar legal o técnicamente.
- **Should Have (Debería tenerse):** Funcionalidad de gran valor que mejora ostensiblemente la operación pero con alternativas de contingencia.
- **Could Have (Podría tenerse):** Funcionalidad deseable o de comodidad añadida.
- **Won't Have (No tendrá en esta versión):** Aplazado para versiones futuras.

### 1.3 Sintaxis de Criterios de Aceptación (Gherkin)
- **Dado (Given):** Define el contexto inicial y las condiciones previas.
- **Cuando (When):** Especifica la acción detonante ejecutada por el usuario o evento del sistema.
- **Entonces (Then):** Establece el resultado esperado y el comportamiento observable del software.

---

## 2. ÉPICA 1: GEOVISUALIZACIÓN Y CONSULTA CIUDADANA (ROL INVITADO)

### HU-INV-01: Carga y Exploración Cartográfica de Florencia
- **Rol:** Invitado (Ciudadano)
- **Prioridad:** Must Have
- **Estimación:** 3 Story Points
- **Requisito ERS:** `RF-GIS-01`
- **Narrativa:**
  - **Como** ciudadano o habitante de Florencia,
  - **Quiero** acceder a la URL principal del Geoportal y ver el mapa base interactivo centrado en el municipio,
  - **Para** familiarizarme con el entorno espacial y ubicar los sectores de mi interés sin necesidad de registrarme.
- **Precondiciones:** Acceso a internet y navegador web compatible.
- **Criterios de Aceptación:**
  - **Escenario 1 (Carga inicial exitosa del mapa):**  
    *Dado* que un usuario ingresa a `/dashboard/index.html`,  
    *Cuando* la página termina de cargar sus componentes en el navegador,  
    *Entonces* el mapa Leaflet se renderiza automáticamente centrado en Florencia, Caquetá (latitud ~1.614, longitud ~-75.606) con un nivel de zoom inicial adecuado (zoom 12-13).
  - **Escenario 2 (Interactividad fluida del mapa):**  
    *Dado* que el mapa está visible en pantalla,  
    *Cuando* el usuario utiliza el scroll del mouse, gestos táctiles o los controles `+` / `-`,  
    *Entonces* el mapa responde con zoom y desplazamiento suave sin recargar la página.

---

### HU-INV-02: Visualización de Límites Poligonales de Barrios y Veredas
- **Rol:** Invitado (Ciudadano)
- **Prioridad:** Must Have
- **Estimación:** 5 Story Points
- **Requisito ERS:** `RF-GIS-01`
- **Narrativa:**
  - **Como** ciudadano,
  - **Quiero** encender y apagar las capas vectoriales de barrios urbanos y veredas rurales,
  - **Para** conocer con precisión los límites topológicos oficiales de cada sector de la ciudad.
- **Precondiciones:** El mapa base debe estar renderizado.
- **Criterios de Aceptación:**
  - **Escenario 1 (Activación de capa de barrios):**  
    *Dado* que el usuario está visualizando el Geoportal,  
    *Cuando* marca la casilla de verificación "Barrios Urbanos" en el control de capas,  
    *Entonces* el sistema consulta `/api/geografia/barrios` y dibuja los polígonos GeoJSON con bordes destacados y nombres legibles.
  - **Escenario 2 (Activación de capa de veredas):**  
    *Dado* que el usuario se encuentra en la zona periférica o rural,  
    *Cuando* selecciona la capa "Veredas Rurales",  
    *Entonces* el sistema consulta `/api/geografia/veredas` y proyecta las geometrías de las veredas con un color diferenciado (verde).

---

### HU-INV-03: Consulta Detallada de Incidentes mediante Popups en Mapa
- **Rol:** Invitado (Ciudadano)
- **Prioridad:** Must Have
- **Estimación:** 3 Story Points
- **Requisito ERS:** `RF-GIS-02`
- **Narrativa:**
  - **Como** ciudadano que consulta el mapa,
  - **Quiero** hacer clic en cualquier marcador de incidente,
  - **Para** conocer los detalles públicos del suceso (tipo de delito, fecha, hora, sector y breve descripción).
- **Precondiciones:** Existen incidentes validados y aprobados visibles en el mapa.
- **Criterios de Aceptación:**
  - **Escenario 1 (Despliegue del popup informativo):**  
    *Dado* que se visualizan chinchetas en el mapa,  
    *Cuando* el usuario hace clic sobre un marcador de incidente,  
    *Entonces* se abre una ventana emergente (*popup*) mostrando: código radicado, tipología, fecha del hecho, hora aproximada, barrio/vereda y la descripción sintetizada.
  - **Escenario 2 (Privacidad de datos personales):**  
    *Dado* que se abre el popup informativo,  
    *Cuando* el usuario lee los detalles expuestos,  
    *Entonces* el sistema **nunca** revela el nombre del denunciante, números de teléfono o identidades de víctimas, cumpliendo la Ley 1581 de Habeas Data.

---

### HU-INV-04: Filtrado Espacio-Temporal Cruzado de Casos
- **Rol:** Invitado (Ciudadano)
- **Prioridad:** Should Have
- **Estimación:** 5 Story Points
- **Requisito ERS:** `RF-GIS-03`
- **Narrativa:**
  - **Como** ciudadano o investigador cívico,
  - **Quiero** filtrar los incidentes por rango de fechas, tipo de delito y sector específico,
  - **Para** analizar el comportamiento de la seguridad en mi comunidad durante un período determinado.
- **Precondiciones:** Formulario de filtros visible en el panel lateral.
- **Criterios de Aceptación:**
  - **Escenario 1 (Aplicación de filtros exitosa):**  
    *Dado* que el usuario selecciona una fecha inicial, una fecha final y la categoría "Hurto a Personas",  
    *Cuando* pulsa el botón "Aplicar Filtros",  
    *Entonces* el sistema ejecuta la consulta parametrizada a `/api/incidentes` y refresca el mapa mostrando únicamente los marcadores que cumplen las tres condiciones.
  - **Escenario 2 (Filtro sin coincidencias):**  
    *Dado* que el usuario introduce criterios que no arrojan resultados,  
    *Cuando* se procesa el filtro,  
    *Entonces* el sistema muestra un mensaje informativo toast indicando: "No se encontraron incidentes que coincidan con los criterios seleccionados", sin generar errores en consola.

---

### HU-INV-05: Tableros de Indicadores y Gráficos Estadísticos (KPIs)
- **Rol:** Invitado (Ciudadano)
- **Prioridad:** Should Have
- **Estimación:** 5 Story Points
- **Requisito ERS:** `RF-KPI-01`, `RF-KPI-02`, `RF-KPI-03`
- **Narrativa:**
  - **Como** usuario interesado en la analítica cívica,
  - **Quiero** acceder a la sección de analítica y ver gráficos consolidados de incidentes,
  - **Para** comprender las tendencias delictivas, las horas de mayor riesgo y los barrios más afectados.
- **Precondiciones:** Acceso a la pestaña "Estadísticas / KPIs".
- **Criterios de Aceptación:**
  - **Escenario 1 (Renderizado de métricas y gráficos):**  
    *Dado* que el usuario hace clic en "Estadísticas",  
    *Cuando* el módulo carga la información desde `/api/estadisticas/kpis`,  
    *Entonces* se visualizan las tarjetas de totales y los gráficos Chart.js (distribución por tipo de incidente, evolución temporal y ranking de Top 10 barrios críticos).
  - **Escenario 2 (Adaptabilidad visual responsive):**  
    *Dado* que el usuario consulta los gráficos desde un teléfono celular,  
    *Cuando* se visualiza el lienzo `<canvas>`,  
    *Entonces* las gráficas se ajustan proporcionalmente al ancho de la pantalla sin deformarse ni desbordar la interfaz.

---

### HU-INV-06: Solicitud de Restablecimiento de Contraseña por Correo
- **Rol:** Invitado / Funcionario Institucional
- **Prioridad:** Must Have
- **Estimación:** 5 Story Points
- **Requisito ERS:** `RF-AUTH-03`
- **Narrativa:**
  - **Como** usuario registrado que olvidó su clave de acceso,
  - **Quiero** digitar mi correo electrónico institucional para solicitar un enlace de restablecimiento,
  - **Para** recuperar mi acceso al sistema de forma segura y autónoma.
- **Precondiciones:** Poseer una cuenta activa con correo institucional registrado en la tabla `usuario`.
- **Criterios de Aceptación:**
  - **Escenario 1 (Generación de token y despacho de correo):**  
    *Dado* que el usuario está en `/login/index.html` y digita un correo electrónico válido existente,  
    *Cuando* pulsa el botón "Recuperar Contraseña",  
    *Entonces* el backend genera un token criptográfico en la tabla `token`, despacha un correo electrónico con el enlace `/login/reset-password.html?token=...` y muestra mensaje de éxito.
  - **Escenario 2 (Token expirado o inválido):**  
    *Dado* que el usuario abre un enlace de recuperación con más de 60 minutos de antigüedad o ya utilizado,  
    *Cuando* intenta enviar la nueva contraseña,  
    *Entonces* el sistema rechaza la solicitud con mensaje: "El token de recuperación ha expirado o no es válido" y no altera la contraseña.

---

## 3. ÉPICA 2: CAPTURA EN TERRENO Y REPORTE MÓVIL (ROL REPORTERO)

### HU-REP-01: Autenticación en Dispositivos Móviles
- **Rol:** Reportero de Campo
- **Prioridad:** Must Have
- **Estimación:** 3 Story Points
- **Requisito ERS:** `RF-AUTH-01`
- **Narrativa:**
  - **Como** agente de cuadrante o reportero móvil,
  - **Quiero** iniciar sesión con mi usuario y contraseña institucional desde el navegador de mi teléfono,
  - **Para** acceder a las herramientas privadas de radicación de incidentes en vía pública.
- **Precondiciones:** Tener cuenta creada con rol `reportero` y estado `activo`.
- **Criterios de Aceptación:**
  - **Escenario 1 (Inicio de sesión exitoso):**  
    *Dado* que el reportero ingresa usuario y contraseña correctos en `/login/index.html`,  
    *Cuando* presiona "Ingresar",  
    *Entonces* el servidor valida el hash Bcrypt, crea la sesión en cookie segura `HttpOnly` y lo redirige automáticamente a `/reportero/index.html`.
  - **Escenario 2 (Rechazo por credenciales incorrectas):**  
    *Dado* que el reportero digita una contraseña equivocada,  
    *Cuando* envía el formulario,  
    *Entonces* el sistema responde código HTTP 401 con el mensaje "Credenciales inválidas" y no inicia sesión.

---

### HU-REP-02: Forzado de Cambio Obligatorio de Clave en Primer Ingreso
- **Rol:** Reportero de Campo
- **Prioridad:** Must Have
- **Estimación:** 3 Story Points
- **Requisito ERS:** `RF-AUTH-02`
- **Narrativa:**
  - **Como** reportero con credencial temporal recién asignada,
  - **Quiero** ser guiado obligatoriamente a definir mi contraseña definitiva,
  - **Para** garantizar que nadie más conozca mis credenciales de acceso a la plataforma.
- **Precondiciones:** La cuenta tiene el flag `debe_cambiar_password = true`.
- **Criterios de Aceptación:**
  - **Escenario 1 (Bloqueo y modal forzado de cambio de clave):**  
    *Dado* que el usuario recién autenticado tiene `debe_cambiar_password = true`,  
    *Cuando* intenta ingresar a cualquier módulo operativo,  
    *Entonces* el sistema bloquea la navegación y despliega el formulario modal de actualización de contraseña sin opción de cierre.
  - **Escenario 2 (Actualización exitosa de contraseña):**  
    *Dado* que el usuario digita una nueva clave que cumple las políticas (mínimo 8 caracteres) y la confirma,  
    *Cuando* pulsa "Actualizar Contraseña",  
    *Entonces* el backend guarda el nuevo hash Bcrypt, actualiza `debe_cambiar_password = false` y le permite continuar normalmente.

---

### HU-REP-03: Captura de Coordenadas Geográficas mediante GPS del Teléfono
- **Rol:** Reportero de Campo
- **Prioridad:** Must Have
- **Estimación:** 5 Story Points
- **Requisito ERS:** `RF-REP-01`
- **Narrativa:**
  - **Como** agente ubicado en el sitio de los hechos,
  - **Quiero** presionar un botón que obtenga mi ubicación GPS precisa,
  - **Para** georreferenciar el incidente al instante sin tener que buscar manualmente la calle o dirección.
- **Precondiciones:** Dispositivo móvil con sensor GPS activo y permisos concedidos en el navegador.
- **Criterios de Aceptación:**
  - **Escenario 1 (Captura satelital exitosa):**  
    *Dado* que el reportero pulsa el botón "Obtener Mi Ubicación (GPS)",  
    *Cuando* la API de geolocalización de HTML5 retorna la posición del hardware,  
    *Entonces* los campos de formulario `lat` y `lng` se autocompletan con las coordenadas en formato decimal (WGS84) y se muestra el radio de precisión estimado.
  - **Escenario 2 (Permiso de ubicación denegado):**  
    *Dado* que el usuario tiene bloqueados los permisos de GPS en su navegador,  
    *Cuando* presiona el botón de geolocalización,  
    *Entonces* el sistema despliega una alerta explicativa: "No se pudo acceder al GPS. Por favor active los permisos de ubicación en la configuración del navegador".

---

### HU-REP-04: Ajuste Manual de Precisión Espacial en Mini-Mapa
- **Rol:** Reportero de Campo
- **Prioridad:** Should Have
- **Estimación:** 3 Story Points
- **Requisito ERS:** `RF-REP-01`
- **Narrativa:**
  - **Como** agente que reporta a pocos metros del lugar exacto del suceso,
  - **Quiero** arrastrar el marcador en el mini-mapa interactivo de apoyo,
  - **Para** corregir visualmente la ubicación exacta de la novedad si el GPS presenta desvío.
- **Precondiciones:** Coordenadas GPS fijadas previamente en el formulario.
- **Criterios de Aceptación:**
  - **Escenario 1 (Arrastre y actualización de coordenadas):**  
    *Dado* que el mini-mapa muestra el marcador de posición actual,  
    *Cuando* el reportero arrastra el marcador a la esquina de la manzana contigua,  
    *Entonces* los campos numéricos de latitud y longitud del formulario se actualizan automáticamente en tiempo real con las nuevas coordenadas del punto soltado.

---

### HU-REP-05: Captura y Carga Directa de Fotografía a Cloudinary
- **Rol:** Reportero de Campo
- **Prioridad:** Must Have
- **Estimación:** 8 Story Points
- **Requisito ERS:** `RF-REP-02`
- **Narrativa:**
  - **Como** agente en terreno,
  - **Quiero** tomar una fotografía con la cámara de mi celular y adjuntarla al formulario,
  - **Para** anexar evidencia gráfica verídica procesada en la nube (Cloudinary) sin saturar la memoria de mi teléfono ni el disco duro del servidor local.
- **Precondiciones:** Dispositivo móvil con cámara funcional.
- **Criterios de Aceptación:**
  - **Escenario 1 (Previsualización de imagen):**  
    *Dado* que el reportero selecciona "Tomar Foto",  
    *Cuando* captura o selecciona la imagen,  
    *Entonces* se visualiza de inmediato una miniatura de confirmación en la interfaz antes de radicar.
  - **Escenario 2 (Subida en streaming sin guardado local):**  
    *Dado* que el formulario es enviado con la foto adjunta,  
    *Cuando* el servidor recibe el buffer binario en memoria vía Multer,  
    *Entonces* el módulo `utils/cloudinary.js` sube la imagen directamente a Cloudinary en formato WebP optimizado y retorna una URL segura HTTPS que se persiste en la BD.
  - **Escenario 3 (Fallback automático por contingencia):**  
    *Dado* que Cloudinary presenta problemas de red o cuota agotada,  
    *Cuando* se procesa la imagen,  
    *Entonces* el sistema conmuta al almacenamiento local en `public/uploads/incidentes/` sin interrumpir la creación del incidente.

---

### HU-REP-06: Radicación de Incidente y Autolocalización de Barrio/Vereda
- **Rol:** Reportero de Campo
- **Prioridad:** Must Have
- **Estimación:** 5 Story Points
- **Requisito ERS:** `RF-REP-03`, `RF-GIS-01`
- **Narrativa:**
  - **Como** reportero de cuadrante,
  - **Quiero** enviar el formulario completo con tipología, relato, coordenadas y afectaciones,
  - **Para** que el incidente quede registrado con código único y el sistema le asocie automáticamente el barrio o vereda correspondiente.
- **Precondiciones:** Formulario diligenciado con los campos obligatorios.
- **Criterios de Aceptación:**
  - **Escenario 1 (Inserción transaccional y autolocalización PostGIS):**  
    *Dado* que el reportero envía coordenadas situadas dentro de la Comuna Occidental de Florencia,  
    *Cuando* el backend ejecuta el INSERT en `incidente`,  
    *Entonces* ejecuta la consulta espacial `ST_Contains` asociando el `idbarrio` correspondiente, asigna el código `INC-XXXX`, establece el estado en "Reportado (1)" y retorna respuesta exitosa.
  - **Escenario 2 (Validación de campos obligatorios):**  
    *Dado* que el reportero omitió la tipología o la fecha del incidente,  
    *Cuando* pulsa "Radicar Incidente",  
    *Entonces* el sistema bloquea el envío y resalta en rojo los campos faltantes mostrando un mensaje toast de advertencia.

---

### HU-REP-07: Seguimiento de Estados en el Módulo "Mis Reportes"
- **Rol:** Reportero de Campo
- **Prioridad:** Should Have
- **Estimación:** 3 Story Points
- **Requisito ERS:** `RF-REP-04`
- **Narrativa:**
  - **Como** agente que radica incidentes en campo,
  - **Quiero** acceder a una lista con el historial de todos los reportes que he realizado,
  - **Para** verificar cuáles han sido aprobados, cuáles siguen en revisión y cuáles fueron rechazados por el analista.
- **Precondiciones:** Estar autenticado como reportero.
- **Criterios de Aceptación:**
  - **Escenario 1 (Listado personalizado y badges de color):**  
    *Dado* que el usuario ingresa a "Mis Reportes",  
    *Cuando* el sistema consulta `/api/incidentes/mis-reportes`,  
    *Entonces* despliega únicamente los incidentes radicados por su usuario, clasificados con badges cromáticos: Amarillo (Pendiente), Azul (En evaluación), Verde (Resuelto/Aprobado) y Gris (Cerrado/Desestimado).
  - **Escenario 2 (Inspección de observaciones del validador):**  
    *Dado* que un caso aparece con estado "Desestimado",  
    *Cuando* el reportero toca la tarjeta del caso,  
    *Entonces* se abre un modal donde puede leer las observaciones y justificación técnica dejada por el analista.

---

## 4. ÉPICA 3: MESA DE VALIDACIÓN Y GESTIÓN DE CASOS (ROL ADMINISTRADOR)

### HU-ADM-01: Consulta de la Cola Compartida de Casos Pendientes
- **Rol:** Administrador (Analista)
- **Prioridad:** Must Have
- **Estimación:** 5 Story Points
- **Requisito ERS:** `RF-VAL-01`
- **Narrativa:**
  - **Como** analista de la mesa de validación de seguridad,
  - **Quiero** consultar una bandeja centralizada con todos los incidentes que esperan validación,
  - **Para** organizar el trabajo de revisión por orden de llegada, severidad o cuadrante emisor.
- **Precondiciones:** Sesión activa con rol `admin` o `superadmin`.
- **Criterios de Aceptación:**
  - **Escenario 1 (Despliegue de la cola de trabajo):**  
    *Dado* que el analista ingresa a `/admin/index.html` en la pestaña "Mesa de Validación",  
    *Cuando* se invoca el endpoint `/api/incidentes/pendientes`,  
    *Entonces* la tabla muestra todos los incidentes en estado "Reportado" ordenados cronológicamente, indicando si tienen foto adjunta y si están libres o bloqueados por otro analista.

---

### HU-ADM-02: Adquisición de Candado Concurrente (Locking de 10 min)
- **Rol:** Administrador (Analista)
- **Prioridad:** Must Have
- **Estimación:** 8 Story Points
- **Requisito ERS:** `RF-VAL-02`
- **Narrativa:**
  - **Como** analista de validación,
  - **Quiero** tomar el control exclusivo de un caso pendiente al abrirlo para revisión,
  - **Para** impedir que otro analista trabaje, edite o emita un dictamen sobre el mismo reporte al mismo tiempo.
- **Precondiciones:** El incidente se encuentra en la cola y no está bloqueado por otro analista activo.
- **Criterios de Aceptación:**
  - **Escenario 1 (Bloqueo concedido exitosamente):**  
    *Dado* que un incidente está libre (`locked_by IS NULL`),  
    *Cuando* el analista hace clic en "Revisar Incidente",  
    *Entonces* el sistema ejecuta `POST /api/incidentes/:id/tomar`, actualiza en base de datos `locked_by = idusuario` y `locked_at = CURRENT_TIMESTAMP`, y abre el modal de validación en modo editable.
  - **Escenario 2 (Caso ocupado por otro analista):**  
    *Dado* que el analista B intenta tomar un incidente que ya fue tomado por el analista A hace 2 minutos,  
    *Cuando* el analista B pulsa "Revisar Incidente",  
    *Entonces* el sistema rechaza la solicitud con mensaje: "Este incidente se encuentra actualmente en revisión por otro analista", desactivando las acciones.
  - **Escenario 3 (Auto-expiración de candado tras 10 minutos):**  
    *Dado* que un analista tomó un incidente pero pasaron 10 minutos sin actividad,  
    *Cuando* cualquier otro analista solicita tomar el caso,  
    *Entonces* el sistema detecta que el bloqueo caducó y le transfiere el control de forma atómica.

---

### HU-ADM-03: Liberación Voluntaria del Candado de Revisión
- **Rol:** Administrador (Analista)
- **Prioridad:** Should Have
- **Estimación:** 2 Story Points
- **Requisito ERS:** `RF-VAL-04`
- **Narrativa:**
  - **Como** analista que abrió un caso pero no puede resolverlo en el momento,
  - **Quiero** presionar un botón de "Liberar Bloqueo",
  - **Para** devolver el caso inmediatamente a la cola y permitir que otro compañero lo revise sin esperar a que expiren los 10 minutos.
- **Precondiciones:** Tener el bloqueo activo del incidente.
- **Criterios de Aceptación:**
  - **Escenario 1 (Liberación voluntaria exitosa):**  
    *Dado* que el analista tiene el modal de revisión abierto,  
    *Cuando* hace clic en "Liberar / Cancelar Revisión",  
    *Entonces* el sistema invoca `POST /api/incidentes/:id/liberar`, limpia `locked_by = NULL` y `locked_at = NULL` en la BD y cierra el modal, quedando el caso libre en la cola.

---

### HU-ADM-04: Inspección de Evidencias y Metadatos en Alta Resolución
- **Rol:** Administrador (Analista)
- **Prioridad:** Must Have
- **Estimación:** 3 Story Points
- **Requisito ERS:** `RF-REP-02`, `RF-VAL-01`
- **Narrativa:**
  - **Como** analista que evalúa un reporte,
  - **Quiero** visualizar la fotografía de evidencia en alta definición y cotejar la ubicación en un mapa detallado,
  - **Para** comprobar la autenticidad y gravedad real del suceso antes de emitir un veredicto.
- **Precondiciones:** El caso tomado cuenta con URL de evidencia en Cloudinary.
- **Criterios de Aceptación:**
  - **Escenario 1 (Visualización de evidencia multimedia):**  
    *Dado* que el caso contiene imagen,  
    *Cuando* el analista hace clic sobre la miniatura en el modal de validación,  
    *Entonces* la fotografía se amplía en un lightbox de alta resolución servida a través de la CDN de Cloudinary.
  - **Escenario 2 (Verificación de coherencia espacial):**  
    *Dado* que el modal presenta un mini-mapa con el punto reportado,  
    *Cuando* el analista visualiza la capa del barrio,  
    *Entonces* corrobora que las coordenadas correspondan a la nomenclatura y descripción textual aportada.

---

### HU-ADM-05: Ajuste y Reclasificación de Tipología o Severidad
- **Rol:** Administrador (Analista)
- **Prioridad:** Should Have
- **Estimación:** 5 Story Points
- **Requisito ERS:** `RF-VAL-03`
- **Narrativa:**
  - **Como** analista experto en seguridad,
  - **Quiero** rectificar el tipo de delito, el nivel de gravedad o la modalidad si el reportero cometió un error de apreciación en campo,
  - **Para** garantizar que las estadísticas municipales reflejen la calificación jurídica y técnica correcta.
- **Precondiciones:** Tener el bloqueo activo del incidente.
- **Criterios de Aceptación:**
  - **Escenario 1 (Reclasificación exitosa):**  
    *Dado* que un incidente fue radicado como "Hurto Simple" pero la evidencia fotográfica demuestra fractura de cerraduras,  
    *Cuando* el analista cambia la modalidad a "Fuerza sobre las cosas" y la gravedad a "Alta",  
    *Entonces* el formulario almacena los valores corregidos antes de la aprobación definitiva.

---

### HU-ADM-06: Dictamen de Aprobación y Publicación en Geoportal Oficial
- **Rol:** Administrador (Analista)
- **Prioridad:** Must Have
- **Estimación:** 5 Story Points
- **Requisito ERS:** `RF-VAL-03`
- **Narrativa:**
  - **Como** analista de seguridad,
  - **Quiero** pulsar el botón "Aprobar y Publicar",
  - **Para** oficializar el incidente, haciéndolo visible al instante en el mapa público y sumándolo a las métricas delictivas de la ciudad.
- **Precondiciones:** Haber revisado el caso y tener el bloqueo activo.
- **Criterios de Aceptación:**
  - **Escenario 1 (Aprobación y publicación inmediata):**  
    *Dado* que el analista pulsa "Aprobar Incidente",  
    *Cuando* el backend procesa la petición en `POST /api/incidentes/:id/resolver`,  
    *Entonces* actualiza `id_estado = 5` (Resuelto/Aprobado), guarda `id_admin_revisor = idusuario`, libera el bloqueo (`locked_by = NULL`), registra la acción en `logs_actividad` y el incidente aparece de inmediato en las consultas públicas.

---

### HU-ADM-07: Desestimación de Incidente con Justificación Obligatoria
- **Rol:** Administrador (Analista)
- **Prioridad:** Must Have
- **Estimación:** 5 Story Points
- **Requisito ERS:** `RF-VAL-03`
- **Narrativa:**
  - **Como** analista de seguridad,
  - **Quiero** rechazar un reporte falso, duplicado o con evidencia no concluyente, ingresando obligatoriamente una justificación técnica,
  - **Para** depurar la información y dar retroalimentación clara al reportero que originó el caso.
- **Precondiciones:** Tener el bloqueo activo del incidente.
- **Criterios de Aceptación:**
  - **Escenario 1 (Rechazo con justificación):**  
    *Dado* que el analista ingresa en el campo de observaciones: "Reporte duplicado con el radicado INC-2026-4821",  
    *Cuando* pulsa el botón "Desestimar Incidente",  
    *Entonces* el sistema cambia el estado a "Cerrado sin resolver (6)", persiste la justificación, libera el bloqueo y oculta el incidente del mapa público.
  - **Escenario 2 (Intento de rechazo sin justificación):**  
    *Dado* que el analista deja el campo de motivo vacío,  
    *Cuando* intenta presionar "Desestimar Incidente",  
    *Entonces* el sistema bloquea la acción y le exige: "Debe ingresar una justificación técnica para poder desestimar el caso".

---

### HU-ADM-08: Ingesta Masiva de Incidentes mediante Archivo CSV
- **Rol:** Administrador (Analista)
- **Prioridad:** Should Have
- **Estimación:** 8 Story Points
- **Requisito ERS:** `RF-DAT-01`
- **Narrativa:**
  - **Como** analista institucional,
  - **Quiero** subir un archivo CSV con cientos de registros históricos de incidentes,
  - **Para** alimentar masivamente la base de datos sin tener que digitar los casos uno a uno.
- **Precondiciones:** Disponer de un archivo `.csv` con las cabeceras normalizadas.
- **Criterios de Aceptación:**
  - **Escenario 1 (Importación masiva exitosa con streaming):**  
    *Dado* que el administrador arrastra un archivo CSV válido de 200 filas,  
    *Cuando* el servidor procesa el archivo mediante `csv-parser`,  
    *Entonces* valida las coordenadas y fechas de cada fila, inserta los registros en una transacción asignándoles un identificador de lote común (`LOTE_...`), y responde con un resumen: "200 registros importados con éxito".
  - **Escenario 2 (Reporte de filas con errores de formato):**  
    *Dado* que 5 filas contienen coordenadas fuera de rango o fechas inválidas,  
    *Cuando* finaliza la importación,  
    *Entonces* el sistema inserta las 195 filas válidas y despliega una bitácora detallando los números de fila descartadas y su error específico.

---

### HU-ADM-09: Reversión Atómica (Rollback) de la Última Carga Masiva
- **Rol:** Administrador (Analista)
- **Prioridad:** Should Have
- **Estimación:** 5 Story Points
- **Requisito ERS:** `RF-DAT-02`
- **Narrativa:**
  - **Como** analista que ejecutó una carga masiva y detectó un error en el archivo original,
  - **Quiero** presionar un botón de "Deshacer Última Importación",
  - **Para** eliminar exclusivamente los incidentes de ese lote sin tocar los registros ingresados previamente en el sistema.
- **Precondiciones:** Se ha ejecutado al menos una importación masiva previa con identificador de lote.
- **Criterios de Aceptación:**
  - **Escenario 1 (Rollback exitoso del lote más reciente):**  
    *Dado* que el administrador pulsa "Deshacer Última Importación" y confirma en el cuadro de diálogo,  
    *Cuando* el backend atiende la petición `DELETE /api/incidentes/importados/ultimo`,  
    *Entonces* borra todos los registros asociados al último `lote_importacion`, registra la novedad en auditoría y notifica: "Se han eliminado exitosamente los registros del lote".

---

## 5. ÉPICA 4: GOBERNANZA, AUDITORÍA Y SEGURIDAD (ROL SUPERADMINISTRADOR)

### HU-SUP-01: Registro de Usuarios Institucionales y Despacho de Correo
- **Rol:** Superadministrador (Gobernanza)
- **Prioridad:** Must Have
- **Estimación:** 5 Story Points
- **Requisito ERS:** `RF-ADM-01`
- **Narrativa:**
  - **Como** director técnico de la plataforma,
  - **Quiero** crear nuevas cuentas de usuario para funcionarios y cuadrantes,
  - **Para** otorgarles acceso institucional generando automáticamente una clave aleatoria que se envía a su correo electrónico.
- **Precondiciones:** Sesión iniciada con rol `superadmin`.
- **Criterios de Aceptación:**
  - **Escenario 1 (Creación y envío por correo exitoso):**  
    *Dado* que el Superadmin digita nombre, usuario único, correo institucional y selecciona el rol "Reportero",  
    *Cuando* presiona "Crear Usuario",  
    *Entonces* el backend genera una clave de alta entropía, guarda el hash Bcrypt con `debe_cambiar_password = true`, despacha un correo de bienvenida vía Nodemailer con los accesos y muestra confirmación en pantalla.
  - **Escenario 2 (Validación de duplicidad de usuario o correo):**  
    *Dado* que ya existe un usuario registrado con ese mismo correo,  
    *Cuando* se intenta registrar nuevamente,  
    *Entonces* el sistema rechaza la operación con código HTTP 400 informando: "El correo electrónico ya se encuentra registrado".

---

### HU-SUP-02: Modificación de Roles y Privilegios en el Modelo RBAC
- **Rol:** Superadministrador (Gobernanza)
- **Prioridad:** Must Have
- **Estimación:** 3 Story Points
- **Requisito ERS:** `RF-ADM-02`
- **Narrativa:**
  - **Como** Superadministrador,
  - **Quiero** cambiar el rol asignado a un usuario (de Reportero a Admin o viceversa),
  - **Para** reflejar promociones o traslados de cargo en las facultades operativas del sistema.
- **Precondiciones:** Acceso a la consola `/admin/index.html` en la pestaña "Usuarios".
- **Criterios de Aceptación:**
  - **Escenario 1 (Cambio de rol efectivo):**  
    *Dado* que un usuario tiene rol `reportero`,  
    *Cuando* el Superadmin selecciona en la grilla el nuevo rol `admin` y confirma,  
    *Entonces* el registro en la tabla `usuario` se actualiza y en la siguiente petición el usuario cuenta con los nuevos permisos sin necesidad de recrear la cuenta.

---

### HU-SUP-03: Inactivación de Cuentas y Destrucción de Sesiones Concurrente
- **Rol:** Superadministrador (Gobernanza)
- **Prioridad:** Must Have
- **Estimación:** 5 Story Points
- **Requisito ERS:** `RF-ADM-02`, `RF-AUTH-04`
- **Narrativa:**
  - **Como** Superadministrador de seguridad,
  - **Quiero** cambiar el estado de un usuario a "Inactivo" con un solo clic,
  - **Para** bloquear de inmediato su acceso y revocar sus sesiones si se presenta un retiro de la entidad o vulneración de seguridad.
- **Precondiciones:** El usuario objetivo se encuentra activo.
- **Criterios de Aceptación:**
  - **Escenario 1 (Inactivación y revocación en tiempo real):**  
    *Dado* que un usuario está conectado trabajando en el sistema,  
    *Cuando* el Superadmin cambia su estado a `inactivo`,  
    *Entonces* el middleware `verificarEstadoActivo` intercepta la siguiente petición de ese usuario, responde HTTP 403 Forbidden y destruye su sesión forzando el cierre de su pantalla.

---

### HU-SUP-04: Prevención de Auto-Inactivación y Auto-Degradación
- **Rol:** Superadministrador (Gobernanza)
- **Prioridad:** Must Have
- **Estimación:** 2 Story Points
- **Requisito ERS:** `RF-ADM-02`
- **Narrativa:**
  - **Como** Superadministrador del sistema,
  - **Quiero** que el sistema bloquee cualquier intento accidental de inactivar o cambiar de rol mi propia cuenta activa,
  - **Para** evitar un bloqueo administrativo irreversible que deje a la plataforma sin ningún administrador general.
- **Precondiciones:** Tener la sesión activa de Superadmin.
- **Criterios de Aceptación:**
  - **Escenario 1 (Bloqueo de auto-inactivación):**  
    *Dado* que el Superadmin logueado intenta seleccionar el estado "Inactivo" para su propio usuario,  
    *Cuando* envía la petición,  
    *Entonces* el backend rechaza la acción con mensaje: "No puede inactivar ni modificar los privilegios de su propia cuenta de Superadministrador".

---

### HU-SUP-05: Liberación Forzosa de Candados Concurrente Abandonados
- **Rol:** Superadministrador (Gobernanza)
- **Prioridad:** Should Have
- **Estimación:** 3 Story Points
- **Requisito ERS:** `RF-VAL-04`
- **Narrativa:**
  - **Como** Superadministrador,
  - **Quiero** forzar la liberación inmediata del candado de un incidente bloqueado por cualquier analista,
  - **Para** desatascar la mesa de validación si un analista perdió la conexión o abandonó su puesto de trabajo antes de concluir los 10 minutos de expiración.
- **Precondiciones:** El incidente se encuentra en estado bloqueado por un analista.
- **Criterios de Aceptación:**
  - **Escenario 1 (Liberación administrativa forzada):**  
    *Dado* que un caso aparece "Bloqueado por Analista 1",  
    *Cuando* el Superadmin presiona el botón de acción "Forzar Desbloqueo",  
    *Entonces* el sistema limpia los campos `locked_by` y `locked_at` de inmediato, registra el evento en auditoría y devuelve el caso al estado disponible para todos los operadores.

---

### HU-SUP-06: Inspección y Filtrado Forense de la Bitácora de Auditoría
- **Rol:** Superadministrador (Gobernanza)
- **Prioridad:** Must Have
- **Estimación:** 5 Story Points
- **Requisito ERS:** `RF-SEC-01`, `RF-ADM-03`
- **Narrativa:**
  - **Como** oficial de seguridad o auditor institucional,
  - **Quiero** consultar una bitácora inmutable de eventos con filtros por fecha, usuario, acción y dirección IP,
  - **Para** realizar investigaciones forenses ante cualquier irregularidad o modificación en los datos del sistema.
- **Precondiciones:** Existencia de registros en la tabla `logs_actividad`.
- **Criterios de Aceptación:**
  - **Escenario 1 (Consulta y filtrado de logs):**  
    *Dado* que el Superadmin accede a la consola de "Auditoría de Logs",  
    *Cuando* filtra por la acción `APROBACION_INCIDENTE` y selecciona una fecha,  
    *Entonces* el sistema lista con precisión de milisegundos: fecha/hora exacta, usuario responsable, tabla afectada, ID del caso intervenido, dirección IP del cliente y navegador utilizado.
  - **Escenario 2 (Inmutabilidad de los registros):**  
    *Dado* que se visualizan los registros de auditoría,  
    *Cuando* se inspecciona la API,  
    *Entonces* no existe ningún endpoint que permita modificar (`UPDATE`) o eliminar (`DELETE`) filas de la tabla `logs_actividad`, garantizando su integridad pericial.

---

### HU-SUP-07: Parametrización y Mantenimiento de Catálogos Maestros
- **Rol:** Superadministrador (Gobernanza)
- **Prioridad:** Should Have
- **Estimación:** 5 Story Points
- **Requisito ERS:** `RF-GIS-03`
- **Narrativa:**
  - **Como** Superadministrador,
  - **Quiero** crear, editar o habilitar/deshabilitar categorías de delitos, gravedades y modalidades,
  - **Para** adaptar el sistema a nuevas directrices de la Policía Nacional o del Ministerio de Defensa sin tener que alterar el código fuente.
- **Precondiciones:** Acceso al módulo de catálogos del sistema.
- **Criterios de Aceptación:**
  - **Escenario 1 (Creación de nueva categoría delictiva):**  
    *Dado* que el Superadmin ingresa a la configuración de tipologías,  
    *Cuando* añade una nueva tipología (ej: "Extorsión Digital / Cibercrimen") con su nivel de riesgo y la guarda,  
    *Entonces* la nueva opción aparece de inmediato en las listas desplegables del formulario de reporte de campo y en los filtros del geoportal.

---

## 6. MATRIZ DE TRAZABILIDAD (HISTORIAS DE USUARIO VS REQUISITOS ERS)

| Código HU | Título Sintético | Rol Responsable | Prioridad MoSCoW | Story Points | Requisito ERS Asociado |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **HU-INV-01** | Carga y exploración cartográfica | Invitado | Must Have | 3 SP | `RF-GIS-01` |
| **HU-INV-02** | Visualización capas barrios y veredas | Invitado | Must Have | 5 SP | `RF-GIS-01` |
| **HU-INV-03** | Consulta de incidentes en popups | Invitado | Must Have | 3 SP | `RF-GIS-02` |
| **HU-INV-04** | Filtro espacio-temporal cruzado | Invitado | Should Have | 5 SP | `RF-GIS-03` |
| **HU-INV-05** | Tableros de indicadores y KPIs | Invitado | Should Have | 5 SP | `RF-KPI-01` / `02` / `03` |
| **HU-INV-06** | Reset de contraseña por correo | Invitado / Todos | Must Have | 5 SP | `RF-AUTH-03` |
| **HU-REP-01** | Autenticación móvil de cuadrantes | Reportero | Must Have | 3 SP | `RF-AUTH-01` |
| **HU-REP-02** | Cambio forzado de clave inicial | Reportero | Must Have | 3 SP | `RF-AUTH-02` |
| **HU-REP-03** | Captura de coordenadas GPS hardware | Reportero | Must Have | 5 SP | `RF-REP-01` |
| **HU-REP-04** | Ajuste fino de punto en mini-mapa | Reportero | Should Have | 3 SP | `RF-REP-01` |
| **HU-REP-05** | Carga de foto directa a Cloudinary | Reportero | Must Have | 8 SP | `RF-REP-02` |
| **HU-REP-06** | Radicación con autolocalización PostGIS| Reportero | Must Have | 5 SP | `RF-REP-03` |
| **HU-REP-07** | Seguimiento en "Mis Reportes" | Reportero | Should Have | 3 SP | `RF-REP-04` |
| **HU-ADM-01** | Consulta cola compartida de casos | Administrador | Must Have | 5 SP | `RF-VAL-01` |
| **HU-ADM-02** | Adquisición candado concurrente (10 min)| Administrador | Must Have | 8 SP | `RF-VAL-02` |
| **HU-ADM-03** | Liberación voluntaria de candado | Administrador | Should Have | 2 SP | `RF-VAL-04` |
| **HU-ADM-04** | Inspección de fotos en alta resolución | Administrador | Must Have | 3 SP | `RF-REP-02` / `VAL-01` |
| **HU-ADM-05** | Reclasificación de tipología y gravedad | Administrador | Should Have | 5 SP | `RF-VAL-03` |
| **HU-ADM-06** | Dictamen de aprobación y publicación | Administrador | Must Have | 5 SP | `RF-VAL-03` |
| **HU-ADM-07** | Desestimación con motivo obligatorio | Administrador | Must Have | 5 SP | `RF-VAL-03` |
| **HU-ADM-08** | Ingesta masiva CSV con streaming | Administrador | Should Have | 8 SP | `RF-DAT-01` |
| **HU-ADM-09** | Rollback atómico de última importación| Administrador | Should Have | 5 SP | `RF-DAT-02` |
| **HU-SUP-01** | Creación usuarios y envío credenciales | Superadmin | Must Have | 5 SP | `RF-ADM-01` |
| **HU-SUP-02** | Modificación de roles en modelo RBAC | Superadmin | Must Have | 3 SP | `RF-ADM-02` |
| **HU-SUP-03** | Inactivación y revocación de sesión | Superadmin | Must Have | 5 SP | `RF-ADM-02` / `AUTH-04` |
| **HU-SUP-04** | Bloqueo de auto-inactivación | Superadmin | Must Have | 2 SP | `RF-ADM-02` |
| **HU-SUP-05** | Liberación forzosa de candados | Superadmin | Should Have | 3 SP | `RF-VAL-04` |
| **HU-SUP-06** | Inspección forense de auditoría (logs) | Superadmin | Must Have | 5 SP | `RF-SEC-01` / `ADM-03` |
| **HU-SUP-07** | Parametrización catálogos delictivos | Superadmin | Should Have | 5 SP | `RF-GIS-03` |
| **TOTALES** | **29 Historias de Usuario Formalizadas**| — | — | **132 SP** | **100% Cobertura ERS** |

---

### Dictamen de Conformidad y Calidad Ágil
Este documento formaliza la totalidad de los flujos de interacción del usuario con el software SIGI, garantizando trazabilidad completa con los requisitos de la ERS IEEE 830 y sirviendo como guía de aceptación para las pruebas de entrega y evaluación del SENA.
