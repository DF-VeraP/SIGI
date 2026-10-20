# MANUAL DE USUARIO INTEGRAL
## Sistema de Información Geográfica de Incidentes — SIGI
**Guía Operativa Paso a Paso para Ciudadanía, Personal de Terreno, Analistas y Administradores**

---

### Control del Documento
- **Proyecto:** SIGI — Sistema de Información Geográfica de Incidentes
- **Institución:** Servicio Nacional de Aprendizaje (SENA)
- **Programa:** Análisis y Desarrollo de Software (ADSO) — Ficha 3142784
- **Autor:** Daniel Felipe Vera Perdomo
- **Localización:** Florencia, Caquetá, Colombia
- **Versión:** 2.1 (Edición Integral por Roles & Nuevas Capacidades Tecnológicas PWA / IA)
- **Fecha:** Octubre 2026
- **Dominio Oficial de Producción:** [https://sigi.verapd.xyz](https://sigi.verapd.xyz)
- **Entorno de Pruebas y Desarrollo Local:** `http://localhost:3000`

---

## ÍNDICE GENERAL

1. [INTRODUCCIÓN Y GUÍA DE NAVEGACIÓN](#1-introducción-y-guía-de-navegación)
   - 1.1 [Propósito y Alcance del Manual](#11-propósito-y-alcance-del-manual)
   - 1.2 [Estructura Modular por Roles de Usuario](#12-estructura-modular-por-roles-de-usuario)
   - 1.3 [Direcciones de Acceso y Compatibilidad Tecnológica](#13-direcciones-de-acceso-y-compatibilidad-tecnológica)
2. [MÓDULO 1: GUÍA DEL CIUDADANO (ROL INVITADO)](#2-módulo-1-guía-del-ciudadano-rol-invitado)
   - 2.1 [Acceso al Geoportal Cartográfico Público](#21-acceso-al-geoportal-cartográfico-público)
   - 2.2 [Exploración Cartográfica (Capas de Barrios y Veredas)](#22-exploración-cartográfica-capas-de-barrios-y-veredas)
   - 2.3 [Uso del Motor de Filtros Espacio-Temporales](#23-uso-del-motor-de-filtros-espacio-temporales)
   - 2.4 [Consulta de Indicadores y Tableros KPI Ciudadanos](#24-consulta-de-indicadores-y-tableros-kpi-ciudadanos)
   - 2.5 [Proceso de Recuperación de Contraseña Olvidada](#25-proceso-de-recuperación-de-contraseña-olvidada)
3. [MÓDULO 2: GUÍA DE OPERACIÓN EN CAMPO (ROL REPORTERO)](#3-módulo-2-guía-de-operación-en-campo-rol-reportero)
   - 3.1 [Instalación de la Aplicación Móvil (PWA)](#31-instalación-de-la-aplicación-móvil-pwa)
   - 3.2 [Inicio de Sesión Móvil y Cambio Obligatorio de Contraseña](#32-inicio-de-sesión-móvil-y-cambio-obligatorio-de-contraseña)
   - 3.3 [Captura de Incidente con Autolocalización GPS de Alta Precisión](#33-captura-de-incidente-con-autolocalización-gps-de-alta-precisión)
   - 3.4 [Asistente Predictivo con Inteligencia Artificial (NLP & Emergencias)](#34-asistente-predictivo-con-inteligencia-artificial-nlp--emergencias)
   - 3.5 [Adjuntar Evidencia Fotográfica con Optimización Cloudinary](#35-adjuntar-evidencia-fotográfica-con-optimización-cloudinary)
   - 3.6 [Operación en Modo Fuera de Línea (PWA Offline) y Sincronización](#36-operación-en-modo-fuera-de-línea-pwa-offline-y-sincronización)
   - 3.7 [Seguimiento y Estados en "Mis Reportes"](#37-seguimiento-y-estados-en-mis-reportes)
4. [MÓDULO 3: GUÍA DE LA MESA DE VALIDACIÓN Y ANALÍTICA (ROL ADMINISTRADOR)](#4-módulo-3-guía-de-la-mesa-de-validación-y-analítica-rol-administrador)
   - 4.1 [Entorno del Panel de Control Administrativo](#41-entorno-del-panel-de-control-administrativo)
   - 4.2 [Alertas Push en Tiempo Real (WebSockets) y Sonido Web Audio](#42-alertas-push-en-tiempo-real-websockets-y-sonido-web-audio)
   - 4.3 [Mesa de Validación: Toma de Control con Candado Concurrente](#43-mesa-de-validación-toma-de-control-con-candado-concurrente)
   - 4.4 [Dictamen Técnico Asistido por Inteligencia Artificial](#44-dictamen-técnico-asistido-por-inteligencia-artificial)
   - 4.5 [Analítica Espacial Avanzada: Hotspots DBSCAN y Proyección Predictiva](#45-analítica-espacial-avanzada-hotspots-dbscan-y-proyección-predictiva)
   - 4.6 [Generación y Descarga de Reportes Ejecutivos en PDF Oficial](#46-generación-y-descarga-de-reportes-ejecutivos-en-pdf-oficial)
   - 4.7 [Importación Masiva de Incidentes mediante CSV y Rollback](#47-importación-masiva-de-incidentes-mediante-csv-y-rollback)
   - 4.8 [Explorador Tabular Avanzado con Exportación](#48-explorador-tabular-avanzado-con-exportación)
5. [MÓDULO 4: GOBERNANZA, AUDITORÍA Y PARÁMETROS (ROL SUPERADMINISTRADOR)](#5-módulo-4-gobernanza-auditoría-y-parámetros-rol-superadministrador)
   - 5.1 [Creación de Usuarios y Envío Automatizado de Credenciales](#51-creación-de-usuarios-y-envío-automatizado-de-credenciales)
   - 5.2 [Gestión de Cuentas y Salvaguarda de Disponibilidad Institucional](#52-gestión-de-cuentas-y-salvaguarda-de-disponibilidad-institucional)
   - 5.3 [Consola de Auditoría Forense y Monitoreo de Trazabilidad](#53-consola-de-auditoría-forense-y-monitoreo-de-trazabilidad)
   - 5.4 [Gestión de Catálogos con Validación Cromática Perceptual (Redmean)](#54-gestión-de-catálogos-con-validación-cromática-perceptual-redmean)
   - 5.5 [Consola de Reentrenamiento del Modelo de Machine Learning](#55-consola-de-reentrenamiento-del-modelo-de-machine-learning)
6. [PREGUNTAS FRECUENTES Y RESOLUCIÓN DE PROBLEMAS (FAQ)](#6-preguntas-frecuentes-y-resolución-de-problemas-faq)
7. [MATRIZ DE TRAZABILIDAD OPERATIVA (MANUAL VS ERS VS HU)](#7-matriz-de-trazabilidad-operativa-manual-vs-ers-vs-hu)

---

## 1. INTRODUCCIÓN Y GUÍA DE NAVEGACIÓN

### 1.1 Propósito y Alcance del Manual
El presente manual tiene como objetivo guiar paso a paso, con instrucciones didácticas y criterios operativos rigurosos, a todos los actores que interactúan con el **Sistema de Información Geográfica de Incidentes (SIGI)**. 

El sistema atiende tanto a la ciudadanía abierta como al personal técnico e institucional de seguridad ciudadana y gestión del riesgo en el municipio de **Florencia, Caquetá**. Ha sido diseñado bajo estándares modernos de usabilidad, accesibilidad móvil PWA (*Progressive Web App*), procesamiento en tiempo real con WebSockets y asistencia predictiva basada en Inteligencia Artificial.

### 1.2 Estructura Modular por Roles de Usuario
Para agilizar su consulta diaria, el manual se desglosa en cuatro módulos operativos especializados:

```
                                      [PORTAL SIGI]
                                 https://sigi.verapd.xyz
                                            │
         ┌──────────────────┬───────────────┴───────────────┬──────────────────┐
         ▼                  ▼                               ▼                  ▼
   [ROL INVITADO]     [ROL REPORTERO]                [ROL ADMIN]        [ROL SUPERADMIN]
   - Geoportal        - PWA Móvil Offline            - Mesa Validación  - Gestión Cuentas
   - Capas Carto      - Captura GPS Precisa          - Candado Concurr. - Blindaje Superadmin
   - Filtros Espac.   - Asistente IA (NLP)           - WebSockets Push  - Catálogo Redmean
   - Estadísticas     - Foto Cloudinary CDN          - Hotspots DBSCAN  - Reentrenar ML
   - Recuperar Clave  - Cola "Mis Reportes"          - Reportes PDFKit  - Auditoría Forense
```

### 1.3 Direcciones de Acceso y Compatibilidad Tecnológica
El sistema se encuentra desplegado para producción en el dominio seguro:
- **Portal Oficial de Producción:** [https://sigi.verapd.xyz](https://sigi.verapd.xyz)
  - *Geoportal Ciudadano:* `https://sigi.verapd.xyz/dashboard/index.html`
  - *Inicio de Sesión Institucional:* `https://sigi.verapd.xyz/login/index.html`
  - *Módulo Móvil Reportero:* `https://sigi.verapd.xyz/reportero/index.html`
  - *Panel Administrativo:* `https://sigi.verapd.xyz/admin/index.html`
  - *Consola Superadministrador:* `https://sigi.verapd.xyz/superadmin/index.html`

**Compatibilidad de Navegadores:**
- **Escritorio:** Google Chrome 90+, Mozilla Firefox 88+, Microsoft Edge 90+, Apple Safari 14+.
- **Dispositivos Móviles:** Chrome para Android 90+, Safari en iOS 14.3+ (compatibles con Service Workers y Web Push).
- **Resoluciones recomendadas:** Desde teléfonos móviles compactos (360×640 px) hasta pantallas de alta resolución (1920×1080 px y superiores).

---

## 2. MÓDULO 1: GUÍA DEL CIUDADANO (ROL INVITADO)

El rol de **Invitado** no exige inicio de sesión ni registro previo. Otorga libre acceso a la información cartográfica consolidada y a las cifras estadísticas públicas de incidentes en Florencia, Caquetá (*Cobertura: RF-GEO-01, RF-GEO-02, RF-GEO-03, RF-DASH-01, RF-DASH-02; HU-INV-01, HU-INV-02, HU-INV-03, HU-INV-04*).

### 2.1 Acceso al Geoportal Cartográfico Público
1. Abra su navegador web de preferencia e ingrese a [https://sigi.verapd.xyz](https://sigi.verapd.xyz).
2. Automáticamente será dirigido a la interfaz principal del Geoportal (`/dashboard/index.html`).
3. El sistema desplegará el mapa base de Florencia, Caquetá, con los marcadores representativos de los incidentes que han sido aprobados y oficializados por las autoridades competentes.

### 2.2 Exploración Cartográfica (Capas de Barrios y Veredas)
- **Desplazamiento y Zoom:** Arrastre con el mouse (o deslice el dedo en dispositivos móviles) para navegar por la geografía municipal. Use los botones `+` y `-` en pantalla o la rueda del ratón para ampliar o reducir la visual.
- **Control de Capas Territoriales (Esquina Superior Derecha):**
  - **Capa Barrios Urbanos:** Dibuja los límites poligonales de los barrios de la zona urbana con una tonalidad azul cian translúcida.
  - **Capa Veredas Rurales:** Dibuja los límites perimetrales de las veredas y corregimientos con tonalidad verde esmeralda.
- **Detalle de un Incidente:** Haga clic o toque cualquier chincheta en el mapa para abrir la ventana informativa (*popup*), que muestra:
  - Código único radicado (Ej: `INC-2026-0142`).
  - Tipo de evento (Hurto, Riña, Accidente de Tránsito, Homicidio, etc.).
  - Fecha y hora exacta del suceso.
  - Sector geográfico (Comuna, Barrio o Vereda identificada).
  - Breve descripción de los hechos y nivel de gravedad.

### 2.3 Uso del Motor de Filtros Espacio-Temporales
En el panel lateral izquierdo desplegable (accesible mediante el botón de embudo o filtros):
1. **Filtro Temporal:** Defina una *Fecha Inicial* y una *Fecha Final* (por ejemplo, últimos 15 días o último trimestre).
2. **Filtro por Tipo de Evento:** Seleccione una o varias tipologías delictivas o contravencionales.
3. **Filtro Geográfico:** Digite el nombre del barrio o selecciónelo en la lista desplegable asistida por búsqueda predictiva.
4. **Filtro por Severidad:** Filtre por niveles de gravedad de 1 (Leve) a 5 (Crítico).
5. **Acción de Aplicación:** Pulse el botón **"Filtrar Incidentes"**. El mapa redibujará únicamente los puntos coincidentes y ajustará el encuadre cartográfico (*fitBounds*) al área geográfica resultante.

### 2.4 Consulta de Indicadores y Tableros KPI Ciudadanos
Haga clic en la pestaña superior **"Estadísticas / KPIs"** para acceder a los tableros analíticos interactivos:
- **Tarjetas Resumen:** Muestran el volumen total de incidentes en el período, la comuna con mayor concentración y el delito preponderante.
- **Gráficos Dinámicos (Chart.js):**
  - *Distribución por Tipología:* Gráfico de dona (*Doughnut*) con los porcentajes relativos.
  - *Evolución Temporal:* Gráfico de líneas cronológico que visualiza la tendencia delictiva semanal o mensual.
  - *Top 10 Zonas Críticas:* Histograma horizontal que ordena de mayor a menor los sectores con más registros.

### 2.5 Proceso de Recuperación de Contraseña Olvidada
Para los usuarios institucionales que hayan extraviado sus claves de acceso:
1. Desde la pantalla de inicio de sesión (`/login/index.html`), pulse el enlace **"¿Olvidó su contraseña?"**.
2. Digite su correo electrónico institucional registrado y haga clic en **"Enviar Enlace de Recuperación"**.
3. El sistema despachará un correo con un token criptográfico HMAC SHA-256 de un solo uso, con validez de 60 minutos.
4. Al abrir el enlace recibido (`/login/reset-password.html?token=...`), ingrese su nueva clave segura y confirme la operación.

---

## 3. MÓDULO 2: GUÍA DE OPERACIÓN EN CAMPO (ROL REPORTERO)

Este módulo está destinado a patrulleros de policía, agentes de tránsito y personal de campo en Florencia (*Cobertura: RF-REP-01 a RF-REP-06, RF-ML-01, RF-ML-02, RNF-14; HU-REP-01 a HU-REP-10*).

### 3.1 Instalación de la Aplicación Móvil (PWA)
SIGI opera como una **Aplicación Web Progresiva (PWA)** instalable sin requerir tiendas de aplicaciones externas:
1. Ingrese desde Google Chrome (Android) o Safari (iOS) a [https://sigi.verapd.xyz/reportero/index.html](https://sigi.verapd.xyz/reportero/index.html).
2. En la parte inferior de la pantalla o en la barra de direcciones aparecerá el aviso: **"¿Desea instalar SIGI Reportero en su pantalla de inicio?"** o el botón **"Instalar App"**.
3. Pulse **"Instalar"** (en iOS: botón Compartir -> *Agregar al inicio*).
4. Se generará el icono oficial de SIGI con su logotipo institucional en la pantalla principal de su teléfono, permitiendo acceso a pantalla completa y funcionamiento sin barras del navegador.

### 3.2 Inicio de Sesión Móvil y Cambio Obligatorio de Contraseña
1. Inicie la aplicación e ingrese su usuario institucional y la contraseña provisional suministrada por el Superadministrador.
2. **Política de Primer Acceso:** Si la cuenta es nueva o fue restablecida administrativamente, la plataforma desplegará de forma obligatoria la ventana modal **"Actualización Obligatoria de Contraseña"** (`debe_cambiar_password = 1`).
3. Digite una nueva clave personal que cumpla con los estándares de seguridad (mínimo 8 caracteres, combinación alfanumérica y caracteres especiales).
4. Tras confirmar, el sistema autenticará la sesión y desbloqueará el panel de radicación.

### 3.3 Captura de Incidente con Autolocalización GPS de Alta Precisión
1. En la consola principal, pulse el botón verde **"Nuevo Reporte de Incidente"**.
2. Toque el botón **"Obtener Mi Ubicación (GPS)"**.
3. Cuando el navegador solicite permisos de geolocalización, seleccione **"Permitir siempre mientras se usa la app"**.
4. El sistema capturará las coordenadas exactas con precisión métrica mediante la API HTML5 Geolocation (`enableHighAccuracy: true`).
5. Se presentará un mini-mapa interactivo: si el hecho ocurrió a pocos metros de donde se encuentra resguardado el agente, éste puede **arrastrar el marcador sobre el mapa** para corregir la posición espacial exacta. El sistema recalcula la contención en el barrio o vereda automáticamente.

### 3.4 Asistente Predictivo con Inteligencia Artificial (NLP & Emergencias)
A medida que el reportero redacta el campo **"Relato / Descripción de los Hechos"**, el motor de Inteligencia Artificial integrado en SIGI actúa en tiempo real:
- **Sugerencia de Tipología:** Tras escribir una descripción (por ejemplo: *"Sujeto intimida con arma blanca y despoja de teléfono celular a transeúnte"*), el asistente de Machine Learning (Naive Bayes) sugiere automáticamente: **"Tipo sugerido: Hurto a Personas (Confianza: 94%)"**.
- **Disparador Automático de Servicios de Emergencia:** Si el relato incluye palabras clave de heridos, conflagraciones o armas de fuego (ej: *"herido por proyectil de arma de fuego sangrando en la acera"*), el sistema activa automáticamente las casillas de:
  - 🚨 *Requiere Ambulancia / Cruz Roja*
  - 👮 *Requiere Apoyo Inmediato de Policía Nacional*
  - 🚒 *Requiere Cuerpo de Bomberos* (en caso de humo, llamas o escape de gas).
- El reportero puede aceptar la recomendación con un solo toque o modificarla según su criterio visual en terreno.

### 3.5 Adjuntar Evidencia Fotográfica con Optimización Cloudinary
1. En la sección **"Evidencia Fotográfica"**, pulse **"Tomar Fotografía / Seleccionar Archivo"**.
2. Puede accionar directamente la cámara del smartphone o cargar una imagen de la galería.
3. El sistema generará una previsualización instantánea.
4. Al pulsar **"Radicar Incidente"**, la imagen se transmite y procesa en la CDN optimizada de Cloudinary, almacenando únicamente el enlace seguro HTTPS en el servidor para garantizar velocidad y bajo consumo de datos móviles.

### 3.6 Operación en Modo Fuera de Línea (PWA Offline) y Sincronización
En zonas de Florencia o corregimientos rurales sin cobertura de datos móviles (2G/3G/4G):
1. **Detección Automática:** El sistema detecta la ausencia de conectividad y despliega en la parte superior una franja informativa ámbar: **"Modo Fuera de Línea Activo — Sus reportes se guardarán localmente"**.
2. **Radicación Offline:** Complete el formulario con normalidad y presione **"Guardar Reporte"**. El incidente se encripta y almacena en la memoria del dispositivo (`localStorage: sigi_cola_incidentes_offline`).
3. **Autosincronización en Segundo Plano:** Tan pronto el dispositivo retoma señal de datos o red Wi-Fi (`window.ononline`), el Service Worker procesa la cola de incidentes secuencialmente, los transmite al servidor central y despliega una notificación de confirmación con los radicados oficiales asignados.

### 3.7 Seguimiento y Estados en "Mis Reportes"
En la pestaña inferior **"Mis Reportes"**, el agente puede consultar el historial de los eventos que ha radicado:
- 🟡 **Reportado (Pendiente):** En cola de espera para dictamen de la mesa de validación.
- 🔵 **En Evaluación:** Un analista ha tomado el caso y lo está verificando en este momento.
- 🟢 **Aprobado / Resuelto:** El caso ha sido oficializado y ya se encuentra visible en el Geoportal municipal.
- 🔴 **Desestimado:** El caso fue rechazado por inconsistencia, falsedad o duplicidad. Al hacer clic, el reportero puede leer las observaciones técnicas emitidas por el analista.

---

## 4. MÓDULO 3: GUÍA DE LA MESA DE VALIDACIÓN Y ANALÍTICA (ROL ADMINISTRADOR)

Este módulo describe la operativa de los analistas de seguridad, coordinadores de policía y gestores del riesgo encargados del control de calidad de la información (*Cobertura: RF-VAL-01 a RF-VAL-06, RF-RT-01, RF-ML-03, RF-ML-04, RF-REP-EXP-01; HU-ADM-01 a HU-ADM-15*).

### 4.1 Entorno del Panel de Control Administrativo
Al ingresar con perfil de Administrador (`https://sigi.verapd.xyz/admin/index.html`), se despliega la consola institucional con 5 áreas de trabajo:
1. **Mesa de Validación (Cola de Espera de Incidentes).**
2. **Analítica Espacial y Hotspots Predictivos.**
3. **Generación de Reportes Ejecutivos PDF.**
4. **Importación Masiva de Datos (CSV) y Rollback.**
5. **Explorador Tabular Multicriterio.**

### 4.2 Alertas Push en Tiempo Real (WebSockets) y Sonido Web Audio
- **Conexión Continua:** El panel administrativo mantiene un túnel persistente mediante WebSockets (`Socket.io`) conectado a la sala `administradores`.
- **Notificación Sonora y Visual:** Cuando un reportero radique un nuevo incidente desde cualquier punto de la ciudad:
  - Se escuchará un suave tono acústico institucional sintetizado nativamente por el navegador mediante la **Web Audio API** (frecuencia armónica D5 a A5 sin requerir descarga de archivos MP3 pesados).
  - Emergerá una tarjeta *Toast* interactiva indicando: *"Nuevo Incidente Radicado: [Tipo] en Barrio [Sector]"*.
  - La fila se insertará dinámicamente en la parte superior de la tabla sin requerir recargar la página (`F5`).

### 4.3 Mesa de Validación: Toma de Control con Candado Concurrente
Para evitar que dos analistas editen, aprueben o desestimen el mismo reporte en paralelo:
1. Haga clic en el botón **"Evaluar"** en la fila del incidente.
2. **Adquisición del Candado Concurrente:** El servidor asigna el registro a su identificador durante **10 minutos** (`bloqueado_por = ID`, `bloqueo_expira = NOW() + 10 MIN`). En las pantallas de los demás administradores, el botón pasará a estar deshabilitado con el rótulo: *"En revisión por [Nombre del Analista]"*.
3. **Inspección Integral:** En el modal de validación, verifique:
   - Evidencia fotográfica en alta definición alojada en Cloudinary.
   - Posición geográfica en el mapa satelital interactivo.
   - Coherencia entre la narración de los hechos y la tipología seleccionada.
4. **Liberación Manual o Caducidad:** Si no concluye la revisión, puede presionar **"Liberar Bloqueo"**. Si se produce un corte de energía o inactividad, el candado se desbloqueará automáticamente pasados los 10 minutos.

### 4.4 Dictamen Técnico Asistido por Inteligencia Artificial
Dentro del formulario de validación:
- **Botón "Sugerencia IA":** Al pulsarlo, el sistema consulta el motor de Machine Learning y expone:
  - *Tipología Calculada:* Predicción del modelo Naive Bayes sobre el texto del reporte.
  - *Índice de Certeza:* Porcentaje de probabilidad algorítmica.
  - *Detección de Discordancia:* Si el reportero marcó "Hurto" pero el texto describe "Lesiones en riña", la IA resaltará la discordancia en amarillo para alertar al analista.
- **Acciones de Dictamen:**
  - **Aprobar Incidente:** El evento adquiere estado *Aprobado*, se indexa de inmediato en el Geoportal ciudadano y pasa a alimentar los modelos de calor.
  - **Desestimar Incidente:** Exige redactar una justificación obligatoria (ej: *"Evidencia fotográfica borrosa ilegible"*, *"Reporte duplicado con INC-2026-089"*). El caso se archiva para auditoría y no se publica a la ciudadanía.

### 4.5 Analítica Espacial Avanzada: Hotspots DBSCAN y Proyección Predictiva
En la pestaña **"Analítica Predictiva"**:
- **Clustering Espacial DBSCAN:** El sistema agrupa los incidentes mediante el algoritmo DBSCAN utilizando la métrica de distancia ortodrómica de **Haversine** (con radio $\varepsilon = 300\text{ metros}$ y mínimo 3 incidentes). Los agrupamientos se representan en el mapa como zonas de calor con gradiente cromático (verde $\to$ amarillo $\to$ rojo intenso), revelando los verdaderos focos críticos de inseguridad o accidentalidad sin sesgos visuales.
- **Pronóstico Temporal (Exponential Smoothing):** Muestra una gráfica con la proyección estimada de incidentes para las próximas 4 semanas basada en suavizado exponencial estacional, permitiendo al comando de policía programar patrullajes preventivos en turnos y cuadrantes estratégicos.

### 4.6 Generación y Descarga de Reportes Ejecutivos en PDF Oficial
Para comités de orden público y consejos de seguridad municipal:
1. Diríjase a la pestaña **"Reportes Ejecutivos"**.
2. Seleccione el mes y año a consolidar (ej: Octubre 2026) o un rango de fechas personalizado.
3. Pulse el botón **"Generar Reporte Oficial PDF"**.
4. El servidor compilará en tiempo real mediante **PDFKit** un documento corporativo de alta calidad que incluye:
   - Encabezado institucional y fecha de emisión.
   - Resumen ejecutivo de incidentes atendidos, aprobados y desestimados.
   - Tabla desglosada por tipologías delictivas con variaciones porcentuales.
   - Análisis de distribución por comunas y sectores de Florencia.
   - Gráfico de severidad y zona para firmas de los responsables técnicos.
5. El archivo se descargará automáticamente en su equipo con el nombre `Reporte_Ejecutivo_SIGI_[MES]_[AÑO].pdf`.

### 4.7 Importación Masiva de Incidentes mediante CSV y Rollback
1. Acceda a la pestaña **"Importación Masiva"**.
2. Descargue la **"Plantilla CSV Oficial"** para constatar la estructura de cabeceras (`tipo`, `fecha`, `hora`, `lat`, `lng`, `descripcion`, `gravedad`, `direccion`).
3. Seleccione el archivo `.csv` y presione **"Procesar Carga Masiva"**.
4. El sistema ejecuta una transacción atómica verificando cada registro. Al culminar, reporta el total de filas creadas y asocia un **Lote de Importación (Batch ID)** único.
5. **Mecanismo de Rollback:** Si se cargó por error un archivo con datos desactualizados o corruptos, pulse el botón rojo **"Deshacer Última Importación (Rollback)"**. El sistema removerá de forma limpia y exclusiva los registros asociados a dicho lote, sin afectar los reportes legítimos de la plataforma.

### 4.8 Explorador Tabular Avanzado con Exportación
Permite realizar búsquedas cruzadas con paginación optimizada, ordenamiento ascendente/descendente por cualquiera de las columnas y exportación instantánea a formatos **CSV** y **Excel** para análisis en software de hojas de cálculo o paquetes estadísticos externos (R, Python, SPSS).

---

## 5. MÓDULO 4: GOBERNANZA, AUDITORÍA Y PARÁMETROS (ROL SUPERADMINISTRADOR)

Este módulo describe las funciones exclusivas del Administrador General del Sistema destinadas a la gestión de identidad, control forense y administración de catálogos (*Cobertura: RF-ADM-01 a RF-ADM-04, RF-CAT-01, RF-ML-04; HU-SUP-01 a HU-SUP-10*).

### 5.1 Creación de Usuarios y Envío Automatizado de Credenciales
1. Ingrese a la consola con credenciales de Superadministrador (`https://sigi.verapd.xyz/superadmin/index.html`).
2. En la sección **"Gestión de Usuarios"**, pulse **"+ Crear Nuevo Usuario"**.
3. Complete los campos obligatorios:
   - *Nombres y Apellidos.*
   - *Nombre de Usuario Único.*
   - *Correo Electrónico Institucional.*
   - *Rol:* Reportero, Administrador o Superadministrador.
   - *Entidad / Cuadrante Asignado.*
   - *Teléfono Móvil.*
4. Haga clic en **"Registrar y Enviar Credenciales"**.
5. **Procedimiento Automático:** El sistema genera una contraseña criptográfica aleatoria de 10 caracteres, cifra su hash con Bcrypt (10 rondas de salteo), marca la cuenta con cambio obligatorio de contraseña y despacha de forma inmediata un correo electrónico formal mediante Nodemailer con las instrucciones de acceso a [https://sigi.verapd.xyz](https://sigi.verapd.xyz).

### 5.2 Gestión de Cuentas y Salvaguarda de Disponibilidad Institucional
- **Inactivación Preventiva:** Para suspender el acceso de un funcionario trasladado, cambie su estado a `Inactivo`. El sistema revocará de inmediato cualquier token JWT o sesión activa que mantenga abierta.
- **Modificación de Roles:** Permite ascender o reubicar roles funcionales con efecto inmediato.
- **Blindaje Institucional de Superadministrador:** Si un Superadministrador intenta inactivarse a sí mismo o cambiar su propio rol a Administrador/Reportero, el sistema verificará en base de datos si es el **último Superadministrador activo**. En tal caso, abortará la transacción emitiendo la alerta: *"Operación Bloqueada: No es posible inactivar ni degradar al único Superadministrador activo del sistema"*, protegiendo la plataforma de bloqueos accidentales.

### 5.3 Consola de Auditoría Forense y Monitoreo de Trazabilidad
En la sección **"Bitácora de Auditoría"**:
- Se registran en una tabla inmutable de solo lectura todas las operaciones críticas: creaciones, autenticaciones, bloqueos de mesa, aprobaciones, desestimaciones, reversiones CSV y modificaciones de usuario.
- Metadatos capturados por evento: Marca de tiempo exacta (ISO 8601), usuario autor, rol, dirección IP remota, navegador/sistema operativo (*User-Agent*), tabla afectada y detalle de los cambios aplicados en formato JSON.
- **Buscador Forense:** Permite realizar filtros combinados por rango de horas o por usuario para reconstruir la cadena de custodia ante requerimientos de entes de control judicial o disciplinario.

### 5.4 Gestión de Catálogos con Validación Cromática Perceptual (Redmean)
En la pestaña **"Administración de Catálogos"**:
- El Superadministrador puede crear nuevas tipologías de incidentes (ej: *Inundación por Creciente Súbita*, *Contaminación Ambiental*) y asociarles un color representativo en código hexadecimal.
- **Validación Matemática de Colisión Cromática (Fórmula Redmean):**
  Para evitar que en el Geoportal aparezcan incidentes con tonalidades prácticamente indistinguibles para el ojo humano (por ejemplo, dos rojos muy parecidos), el sistema calcula en tiempo real la distancia euclidiana ponderada según la percepción visual humana:
  $$\Delta C = \sqrt{\left(2 + \frac{\bar{r}}{256}\right)\Delta R^2 + 4\Delta G^2 + \left(2 + \frac{255 - \bar{r}}{256}\right)\Delta B^2}$$
  Si la distancia cromática respecto a cualquier tipo preexistente es menor a **85 puntos** ($\Delta C < 85$), el sistema rechaza la asignación y le exige al usuario seleccionar un color claramente diferenciable, garantizando la máxima legibilidad cartográfica.
- **Protección de Integridad Referencial:** No es posible eliminar una tipología si ya existen incidentes históricos catalogados bajo la misma; el sistema sugiere en su lugar el archivado lógico.

### 5.5 Consola de Reentrenamiento del Modelo de Machine Learning
1. En la pestaña **"Modelo de Inteligencia Artificial"**, el Superadministrador puede consultar el estado del modelo de clasificación: número de términos en el vocabulario, total de muestras procesadas y fecha del último entrenamiento.
### 5.6 Monitoreo en Tiempo Real y Desbloqueo de Direcciones IP Bloqueadas
En la pestaña **"Seguridad IP"** (`#btnSeguridadIps`), el Superadministrador dispone de una consola de defensa perimetral para auditar y gestionar las suspensiones de red ocasionadas por intentos fallidos de autenticación:
1. **Visualización de Suspensiones Activas:**
   - Cada fila detalla el número consecutivo, la **Dirección IP** (con badge monoespaciado), el **Motivo del Bloqueo** (ej. *Exceso de intentos de acceso fallidos en inicio de sesión (5 intentos)*) y la **Hora del Bloqueo**.
   - **Temporizador Dinámico en Vivo:** La columna *Tiempo Restante* despliega un badge con cuenta regresiva decreciente (`MM:SS`) que se actualiza cada segundo. Al cumplirse los 15 minutos reglamentarios, el bloqueo se extingue automáticamente.
2. **Procedimiento de Desbloqueo Manual Anticipado:**
   - Ubique la fila correspondiente a la dirección IP del funcionario o estación de trabajo afectada.
   - En la columna *Acción*, pulse el botón con icono de **candado cerrado**.
   - El sistema abrirá una ventana emergente minimalista solicitando la confirmación de la operación perimetral.
   - Al pulsar **"Confirmar"**, el backend purga de forma inmediata la dirección IP de la memoria del limitador de tasa, asienta el evento `DESBLOQUEAR_IP` en la auditoría inmutable y emite la señal WebSocket para remover la fila en tiempo real en todas las consolas abiertas. El usuario podrá iniciar sesión de inmediato sin tener que aguardar el vencimiento de la ventana de 15 minutos.

---

## 6. PREGUNTAS FRECUENTES Y RESOLUCIÓN DE PROBLEMAS (FAQ)

| Caso o Pregunta Frecuente | Causa Probable | Procedimiento de Solución Paso a Paso |
| :--- | :--- | :--- |
| **"¿Cómo instalo SIGI como aplicación en mi teléfono Android o iPhone?"** | Desconocimiento del proceso de instalación PWA. | Abra [https://sigi.verapd.xyz/reportero/index.html](https://sigi.verapd.xyz/reportero/index.html) en Chrome o Safari. Toque los tres puntos o el botón Compartir y elija **"Instalar aplicación"** o **"Agregar al inicio"**. La app quedará en su menú principal como una aplicación nativa. |
| **"¿Puedo reportar incidentes en zonas rurales de Florencia sin señal de internet?"** | Falta de cobertura móvil en veredas apartadas. | Sí. Gracias al modo **PWA Offline**, radique el incidente normalmente con el GPS encendido. El sistema lo guardará en la memoria local y lo sincronizará de forma automática tan pronto retome conexión a internet. |
| **"El botón de GPS no captura mis coordenadas en el celular."** | Permisos de geolocalización denegados en el navegador. | Ingrese a la configuración de su teléfono $\to$ Aplicaciones $\to$ Navegador (Chrome/Safari) $\to$ Permisos $\to$ Ubicación y seleccione **"Permitir siempre"**. Asegúrese de tener encendida la ubicación del dispositivo en modo alta precisión. |
| **"Al redactar el reporte, el sistema sugiere un tipo de incidente y casillas de ambulancia. ¿Es obligatorio aceptarlo?"** | Funcionamiento del Asistente Predictivo con Inteligencia Artificial. | No. La Inteligencia Artificial analiza el texto para asistir y acelerar la captura, pero el criterio profesional del reportero en terreno siempre tiene prioridad. Puede seleccionar el tipo que considere oportuno. |
| **"Aparece una alerta que dice que el incidente está bloqueado por otro analista."** | Mecanismo de candado concurrente activo en la mesa de validación. | Otro analista está evaluando el caso en ese mismo instante. Espere a que emita su dictamen. Si el analista cierra el navegador o abandona el caso, el bloqueo caducará automáticamente a los 10 minutos. |
| **"¿Cómo se activa o desactiva el sonido de alerta al llegar nuevos incidentes?"** | Alerta en tiempo real mediante Web Audio API en el panel administrador. | El sonido se reproduce automáticamente ante cada nuevo incidente mediante el altavoz del equipo. Si desea silenciarlo, utilice el control de volumen del navegador o el conmutador de sonido en la barra superior del panel administrativo. |
| **"¿Cómo descargo el informe mensual de seguridad para el consejo municipal?"** | Necesidad de informe institucional en formato PDF. | Ingrese con rol de Administrador a la pestaña **"Reportes Ejecutivos"**, seleccione el mes deseado y pulse **"Generar Reporte Oficial PDF"**. El archivo formateado se descargará en segundos con estadísticas consolidadas. |
| **"No recibí el correo con el enlace de recuperación de contraseña."** | Filtro de spam o dirección de correo errónea. | Verifique la carpeta de *Correo no deseado / Spam*. Si tras 5 minutos no lo recibe, comuníquese con el Superadministrador para que verifique que su correo institucional esté bien registrado en el sistema. |
| **"Al intentar crear un nuevo tipo de incidente, el sistema me dice que el color es muy similar a otro."** | Salvaguarda de distancia perceptual cromática Redmean ($\Delta C < 85$). | El color elegido se parece demasiado a una tipología ya existente en el mapa, lo cual causaría confusión visual a la ciudadanía. Seleccione una tonalidad con mayor contraste en el selector de color. |
| **"El sistema me pide cambiar la contraseña y no me permite navegar por otras secciones."** | Política de seguridad institucional de primer acceso o reseteo administrativo. | Es obligatorio cambiar la clave provisional por una personal para proteger la cuenta. Ingrese una contraseña de al menos 8 caracteres para continuar. |
| **"Un usuario o funcionario no puede entrar y le sale 'Demasiados intentos de acceso fallidos desde esta IP'."** | Suspensión temporal de seguridad por exceder 5 intentos erróneos consecutivos. | El Superadministrador debe ingresar a la pestaña **"Seguridad IP"**, localizar la dirección IP en la tabla y presionar el botón de **candado cerrado**. Al confirmar el desbloqueo, el acceso se reanudará de inmediato. |

---

## 7. MATRIZ DE TRAZABILIDAD OPERATIVA (MANUAL VS ERS VS HU)

A continuación se presenta la correspondencia biunívoca entre las instrucciones del presente manual de usuario, los Requisitos Funcionales del ERS (`01_ERS_SIGI_IEEE830.md`) y las Historias de Usuario (`07_Historias_de_Usuario_SIGI.md`):

| Sección del Manual | Requisitos ERS Satisfechos | Historias de Usuario Asociadas | Rol Operativo |
| :--- | :--- | :--- | :--- |
| **2.1 - 2.2 Geoportal Cartográfico** | `RF-GEO-01`, `RF-GEO-02`, `RF-GEO-03` | `HU-INV-01`, `HU-INV-02` | Ciudadano (Invitado) |
| **2.3 Filtros Espacio-Temporales** | `RF-DASH-01` | `HU-INV-03` | Ciudadano (Invitado) |
| **2.4 Indicadores y Tableros KPI** | `RF-DASH-02` | `HU-INV-04` | Ciudadano (Invitado) |
| **2.5 Recuperación de Contraseña** | `RF-AUTH-03` | `HU-GEN-02` | Todos los roles |
| **3.1 - 3.2 PWA Móvil y Cambio Clave** | `RF-AUTH-01`, `RF-AUTH-02`, `RNF-14` | `HU-REP-01`, `HU-REP-10` | Reportero de Campo |
| **3.3 Captura GPS de Alta Precisión** | `RF-REP-01`, `RF-REP-02` | `HU-REP-02`, `HU-REP-03` | Reportero de Campo |
| **3.4 Asistente Predictivo con IA** | `RF-ML-01`, `RF-ML-02` | `HU-REP-09` | Reportero de Campo |
| **3.5 Evidencia Fotográfica Cloudinary** | `RF-REP-03` | `HU-REP-04` | Reportero de Campo |
| **3.6 Modo Offline y Sincronización** | `RNF-14` | `HU-REP-10` | Reportero de Campo |
| **3.7 Consulta "Mis Reportes"** | `RF-REP-05`, `RF-REP-06` | `HU-REP-07`, `HU-REP-08` | Reportero de Campo |
| **4.2 Alertas Realtime y Web Audio** | `RF-RT-01`, `RNF-15` | `HU-ADM-13` | Administrador |
| **4.3 Mesa y Candado Concurrente** | `RF-VAL-01`, `RF-VAL-02`, `RF-VAL-03` | `HU-ADM-01`, `HU-ADM-02`, `HU-ADM-03` | Administrador |
| **4.4 Dictamen y Asistencia IA** | `RF-VAL-04`, `RF-VAL-05`, `RF-ML-03` | `HU-ADM-04`, `HU-ADM-05`, `HU-ADM-12` | Administrador |
| **4.5 Hotspots DBSCAN y Pronóstico** | `RF-ML-04` | `HU-ADM-15` | Administrador |
| **4.6 Reportes Ejecutivos en PDF** | `RF-REP-EXP-01` | `HU-ADM-14` | Administrador |
| **4.7 Ingesta CSV y Rollback** | `RF-ING-01`, `RF-ING-02` | `HU-ADM-09`, `HU-ADM-10` | Administrador |
| **4.8 Explorador Tabular y Exportación**| `RF-EXP-01`, `RF-EXP-02` | `HU-ADM-07`, `HU-ADM-08` | Administrador |
| **5.1 Creación y Credenciales Autom.** | `RF-ADM-01` | `HU-SUP-01`, `HU-SUP-02` | Superadministrador |
| **5.2 Gestión Cuentas y Blindaje Super**| `RF-ADM-02`, `RF-ADM-04` | `HU-SUP-03`, `HU-SUP-09` | Superadministrador |
| **5.3 Auditoría Forense Inmutable** | `RF-ADM-03` | `HU-SUP-04`, `HU-SUP-05` | Superadministrador |
| **5.4 Catálogo y Validación Redmean** | `RF-CAT-01` | `HU-SUP-08` | Superadministrador |
| **5.5 Reentrenamiento Modelo ML** | `RF-ML-04` | `HU-SUP-10` | Superadministrador |

---
*Fin del Manual de Usuario — Sistema de Información Geográfica de Incidentes (SIGI v2.1)*
