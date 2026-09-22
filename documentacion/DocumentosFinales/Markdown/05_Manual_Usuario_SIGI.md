# MANUAL DE USUARIO INTEGRAL
## Sistema de Información Geográfica de Incidentes — SIGI
**Guía Operativa Paso a Paso para Ciudadanía, Personal de Terreno y Administradores**

---

### Control del Documento
- **Proyecto:** SIGI - Sistema de Información Geográfica de Incidentes
- **Institución:** Servicio Nacional de Aprendizaje (SENA)
- **Programa:** Análisis y Desarrollo de Software (ADSO) - Ficha 3142784
- **Autor:** Daniel Felipe Vera Perdomo
- **Localización:** Florencia, Caquetá, Colombia
- **Versión:** 2.0 (Guía Operativa por Roles)
- **Fecha:** Septiembre 2026

---

## ÍNDICE GENERAL

1. [INTRODUCCIÓN Y GUÍA DE NAVEGACIÓN](#1-introducción-y-guía-de-navegación)  
   1.1 [Propósito del Manual de Usuario](#11-propósito-del-manual-de-usuario)  
   1.2 [Estructura Modular por Roles](#12-estructura-modular-por-roles)  
2. [MÓDULO 1: GUÍA DEL CIUDADANO (ROL INVITADO)](#2-módulo-1-guía-del-ciudadano-rol-invitado)  
   2.1 [Acceso al Geoportal Público](#21-acceso-al-geoportal-público)  
   2.2 [Exploración Cartográfica (Capas de Barrios y Veredas)](#22-exploración-cartográfica-capas-de-barrios-y-veredas)  
   2.3 [Uso del Motor de Filtros Espacio-Temporales](#23-uso-del-motor-de-filtros-espacio-temporales)  
   2.4 [Consulta de Indicadores y Tableros KPI Ciudadanos](#24-consulta-de-indicadores-y-tableros-kpi-ciudadanos)  
   2.5 [Proceso de Recuperación de Contraseña Olvidada](#25-proceso-de-recuperación-de-contraseña-olvidada)  
3. [MÓDULO 2: GUÍA DE OPERACIÓN EN CAMPO (ROL REPORTERO)](#3-módulo-2-guía-de-operación-en-campo-rol-reportero)  
   3.1 [Inicio de Sesión Móvil y Cambio Obligatorio de Contraseña](#31-inicio-de-sesión-móvil-y-cambio-obligatorio-de-contraseña)  
   3.2 [Captura de Incidente con Autolocalización GPS](#32-captura-de-incidente-con-autolocalización-gps)  
   3.3 [Adjuntar Evidencia Fotográfica y Subida a Cloudinary](#33-adjuntar-evidencia-fotográfica-y-subida-a-cloudinary)  
   3.4 [Seguimiento y Estado de Casos en "Mis Reportes"](#34-seguimiento-y-estado-de-casos-en-mis-reportes)  
4. [MÓDULO 3: GUÍA DE LA MESA DE VALIDACIÓN (ROL ADMINISTRADOR)](#4-módulo-3-guía-de-la-mesa-de-validación-rol-administrador)  
   4.1 [Entorno del Panel de Control Administrativo](#41-entorno-del-panel-de-control-administrativo)  
   4.2 [Operación de la Cola de Validación Compartida](#42-operación-de-la-cola-de-validación-compartida)  
   4.3 [Toma de Control, Candado Concurrente (Locking) y Liberación](#43-toma-de-control-candado-concurrente-locking-y-liberación)  
   4.4 [Dictamen Técnico: Aprobación, Desestimación y Resolución](#44-dictamen-técnico-aprobación-desestimación-y-resolución)  
   4.5 [Importación Masiva de Incidentes mediante Archivo CSV](#45-importación-masiva-de-incidentes-mediante-archivo-csv)  
   4.6 [Uso del Mecanismo de Rollback de Importaciones](#46-uso-del-mecanismo-de-rollback-de-importaciones)  
   4.7 [Explorador Tabular Avanzado con Exportación](#47-explorador-tabular-avanzado-con-exportación)  
5. [MÓDULO 4: GOBERNANZA Y AUDITORÍA (ROL SUPERADMINISTRADOR)](#5-módulo-4-gobernanza-y-auditoría-rol-superadministrador)  
   5.1 [Creación de Usuarios y Envío Automatizado de Credenciales](#51-creación-de-usuarios-y-envío-automatizado-de-credenciales)  
   5.2 [Gestión Integral de Cuentas, Modificación de Roles y Estados](#52-gestión-integral-de-cuentas-modificación-de-roles-y-estados)  
   5.3 [Consola de Auditoría Forense y Monitoreo de Logs](#53-consola-de-auditoría-forense-y-monitoreo-de-logs)  
   5.4 [Administración de Parámetros Globales y Catálogos](#54-administración-de-parámetros-globales-y-catálogos)  
6. [PREGUNTAS FRECUENTES Y RESOLUCIÓN DE PROBLEMAS (FAQ)](#6-preguntas-frecuentes-y-resolución-de-problemas-faq)  

---

## 1. INTRODUCCIÓN Y GUÍA DE NAVEGACIÓN

### 1.1 Propósito del Manual de Usuario
El presente manual tiene como objetivo guiar de manera didáctica y visual a todos los usuarios del sistema **SIGI** en el uso adecuado de sus funciones. Está redactado para que tanto un ciudadano sin conocimientos técnicos avanzados como un analista o administrador institucional puedan operar el sistema con máxima eficacia.

### 1.2 Estructura Modular por Roles
Para facilitar la consulta, el manual está dividido en 4 módulos independientes según el rol de acceso asignado:

```
                                  [PORTAL SIGI]
                                        │
         ┌───────────────┬──────────────┴───────────────┬────────────────┐
         ▼               ▼                              ▼                ▼
   [ROL INVITADO]  [ROL REPORTERO]               [ROL ADMIN]      [ROL SUPERADMIN]
   - Geoportal     - Captura GPS Terreno         - Mesa Validación - Gestión Cuentas
   - Filtros Mapa  - Evidencia Foto Cloudinary   - Candado Concur. - Auditoría Logs
   - Gráficos KPI  - Seguimiento "Mis Reportes"  - Ingesta CSV     - Configuración
```

---

## 2. MÓDULO 1: GUÍA DEL CIUDADANO (ROL INVITADO)

El rol de **Invitado** no requiere registro ni credenciales. Permite el libre acceso a la información pública de incidentes consolidados en Florencia, Caquetá.

### 2.1 Acceso al Geoportal Público
1. Abra cualquier navegador web moderno (Google Chrome, Mozilla Firefox, Safari o Microsoft Edge).
2. Digite la dirección URL del portal (por defecto en entorno local: `http://localhost:3000/dashboard/index.html` o el dominio asignado en producción).
3. La pantalla principal cargará automáticamente el mapa cartográfico interactivo de Florencia centrado en la zona urbana y rural.

> **ESPACIO PARA DIAGRAMA / CAPTURA:**  
> *(Insertar aquí Captura de Pantalla: Vista Principal del Geoportal Público SIGI)*

### 2.2 Exploración Cartográfica (Capas de Barrios y Veredas)
- **Navegación:** Arrastre con el mouse (o deslice con el dedo en pantallas táctiles) para desplazarse por el municipio. Use la rueda del ratón o los botones `+` y `-` en la esquina superior izquierda para acercar o alejar el zoom.
- **Selector de Capas:** En la esquina superior derecha encontrará el control de capas:
  - **Barrios Urbanos:** Dibuja los límites vectoriales de los barrios de Florencia con tono azul tenue.
  - **Veredas Rurales:** Dibuja las delimitaciones del corregimiento y veredas en tono verde bosque.
- **Información de un Incidente:** Al hacer clic sobre cualquier chincheta o marcador en el mapa, se desplegará una ventana emergente (*popup*) indicando: código del incidente, tipo de delito, fecha, hora, sector y una descripción general de los hechos.

> **ESPACIO PARA DIAGRAMA / CAPTURA:**  
> *(Insertar aquí Captura de Pantalla: Ventana Emergente Popup con Detalle del Incidente)*

### 2.3 Uso del Motor de Filtros Espacio-Temporales
En el panel lateral izquierdo desplegable, puede acotar los datos mostrados:
1. **Filtro por Rango de Fechas:** Seleccione una *Fecha Inicial* y una *Fecha Final* para acotar el análisis (por ejemplo, el último mes).
2. **Filtro por Tipo de Incidente:** Seleccione categorías específicas como Hurto, Accidente de Tránsito, Riña, Homicidio, etc.
3. **Filtro por Sector (Barrio o Vereda):** Escriba el nombre del barrio o selecciónelo en la lista desplegable asistida por autocompletado.
4. **Botón Aplicar Filtros:** Al pulsarlo, el mapa refrescará inmediatamente las chinchetas activas y adaptará la vista (*fitBounds*) al área geográfica resultante.

> **ESPACIO PARA DIAGRAMA / CAPTURA:**  
> *(Insertar aquí Captura de Pantalla: Panel de Filtros Espacio-Temporales)*

### 2.4 Consulta de Indicadores y Tableros KPI Ciudadanos
Haciendo clic en la pestaña superior **"Estadísticas / KPIs"**:
- **Tarjetas Numéricas:** Total de eventos en el período, sector con mayor índice de incidentes y tipo de incidente más frecuente.
- **Gráficos Interactivos:**
  - *Distribución por Tipología:* Diagrama circular (Doughnut) que muestra las proporciones porcentuales.
  - *Evolución Temporal:* Gráfico de líneas que expone la tendencia delictiva a lo largo de las semanas o meses.
  - *Top 10 Zonas Críticas:* Gráfico de barras horizontales jerarquizando los barrios con mayor número de reportes.

> **ESPACIO PARA DIAGRAMA / CAPTURA:**  
> *(Insertar aquí Captura de Pantalla: Tablero de Indicadores y Gráficos Chart.js)*

### 2.5 Proceso de Recuperación de Contraseña Olvidada
Para usuarios institucionales que hayan extraviado su clave:
1. En la pantalla de inicio de sesión (`/login/index.html`), pulse el enlace **"¿Olvidó su contraseña?"**.
2. Digite su correo electrónico institucional registrado y pulse **"Enviar Enlace de Recuperación"**.
3. El sistema despachará un correo con un enlace seguro cifrado válido por 60 minutos.
4. Al hacer clic en el enlace, accederá a la pantalla `/login/reset-password.html` donde podrá definir su nueva contraseña segura.

---

## 3. MÓDULO 2: GUÍA DE OPERACIÓN EN CAMPO (ROL REPORTERO)

Este módulo está destinado a cuadrantes policiales, inspectores de tránsito o agentes de campo que levantan novedades directamente en el territorio.

### 3.1 Inicio de Sesión Móvil y Cambio Obligatorio de Contraseña
1. Acceda desde su teléfono móvil a la URL del portal e ingrese con las credenciales provisionales suministradas por el Superadministrador.
2. **Primer Inicio de Sesión:** Si su cuenta es nueva o su contraseña fue restablecida, el sistema bloqueará automáticamente las demás funciones y le mostrará la pantalla **"Cambio Obligatorio de Contraseña"**.
3. Ingrese una nueva contraseña que cumpla con los estándares mínimos (al menos 8 caracteres alfanuméricos). Una vez confirmada, será redirigido al panel de reportero móvil (`/reportero/index.html`).

> **ESPACIO PARA DIAGRAMA / CAPTURA:**  
> *(Insertar aquí Captura de Pantalla: Pantalla de Cambio Obligatorio de Contraseña)*

### 3.2 Captura de Incidente con Autolocalización GPS
1. En el panel principal del Reportero, pulse el botón **"Nuevo Reporte de Incidente"**.
2. **Captura GPS:** Pulse el botón **"Obtener Mi Ubicación Actual (GPS)"**. El navegador solicitará permisos de ubicación (acepte la solicitud).
3. El sistema fijará automáticamente las coordenadas de latitud y longitud con su margen de precisión en metros.
4. En el mini-mapa de referencia, aparecerá un marcador arrastrable: si se encuentra a unos metros del punto exacto del hecho, puede arrastrar el marcador para afinar la ubicación.
5. El sistema asociará automáticamente el barrio o vereda correspondiente por contención topológica.

> **ESPACIO PARA DIAGRAMA / CAPTURA:**  
> *(Insertar aquí Captura de Pantalla: Formulario Móvil con Botón GPS y Mini-Mapa de Terreno)*

### 3.3 Adjuntar Evidencia Fotográfica y Subida a Cloudinary
1. En la sección **"Evidencia Fotográfica"**, pulse el botón **"Tomar Foto / Adjuntar Imagen"**.
2. Puede seleccionar la cámara del smartphone para tomar la fotografía en vivo o elegir una imagen de la galería.
3. El sistema mostrará una miniatura de previsualización.
4. Complete los datos del formulario:
   - *Tipo de Incidente:* Seleccione del catálogo.
   - *Fecha y Hora:* Se completan automáticamente con la fecha y hora actual, modificables si es necesario.
   - *Gravedad Estimada:* Nivel de severidad de 1 a 5.
   - *Relato de los Hechos:* Descripción concisa y objetiva de lo acontecido.
   - *Afectaciones:* Víctimas, vehículos o si requirió apoyo de ambulancia/policía.
5. Pulse **"Radicar Incidente"**. La imagen se subirá automáticamente en streaming a la nube optimizada por Cloudinary y se le asignará de inmediato un **Código Radicado Único** (Ej: `INC-2026-8941`).

> **ESPACIO PARA DIAGRAMA / CAPTURA:**  
> *(Insertar aquí Captura de Pantalla: Previsualización de Foto y Confirmación de Radicado)*

### 3.4 Seguimiento y Estado de Casos en "Mis Reportes"
En la pestaña inferior **"Mis Reportes"**, el agente podrá consultar el historial de los eventos que ha radicado:
- **Badge Amarillo ("Reportado / Pendiente"):** El caso está en la cola de validación esperando ser revisado por un analista.
- **Badge Azul ("En Evaluación"):** El caso está siendo revisado actualmente por un analista en la mesa.
- **Badge Verde ("Aprobado / Resuelto"):** El caso fue validado exitosamente y ya es visible en el Geoportal oficial.
- **Badge Rojo ("Desestimado / Cerrado"):** El caso fue descartado por duplicidad o inconsistencia, pudiendo pulsar sobre él para leer los comentarios técnicos del validador.

---

## 4. MÓDULO 3: GUÍA DE LA MESA DE VALIDACIÓN (ROL ADMINISTRADOR)

Este módulo está destinado a los analistas de seguridad encargados de depurar, clasificar y oficializar los incidentes radicados.

### 4.1 Entorno del Panel de Control Administrativo
Al ingresar con perfil de Administrador (`/admin/index.html`), el sistema despliega el menú superior con las siguientes consolas:
1. **Mesa de Validación (Cola de Espera).**
2. **Explorador Tabular de Incidentes.**
3. **Importación Masiva (CSV).**
4. **Geoportal Analítico.**

> **ESPACIO PARA DIAGRAMA / CAPTURA:**  
> *(Insertar aquí Captura de Pantalla: Panel de Control del Administrador)*

### 4.2 Operación de la Cola de Validación Compartida
En la pestaña **"Mesa de Validación"**, se listan todas las novedades radicadas por reporteros de campo que esperan dictamen:
- La lista muestra: Código de caso, tipo, sector geográfico, fecha/hora de radicación, agente emisor y estado de bloqueo concurrente.
- Incidentes con evidencia fotográfica exhiben un icono de cámara interactivo.

### 4.3 Toma de Control, Candado Concurrente (Locking) y Liberación
Para evitar que dos analistas editen o aprueben el mismo caso al mismo tiempo:
1. Para iniciar la evaluación de un incidente, haga clic en el botón **"Revisar Incidente"**.
2. **Adquisición del Candado:** El sistema reservará el registro exclusivamente para usted durante **10 minutos**. En las pantallas de los demás administradores el botón cambiará automáticamente a estado deshabilitado con el rótulo **"En revisión por [Su Nombre]"**.
3. **Liberación Voluntaria:** Si por alguna razón no puede concluir la revisión del caso, haga clic en el botón **"Liberar Bloqueo"**. El caso volverá a estar disponible de inmediato para los demás analistas.
4. **Auto-Expiración:** Si transcurren 10 minutos sin emitir un dictamen ni registrar actividad, el candado caduca automáticamente para no congelar la cola de trabajo.

> **ESPACIO PARA DIAGRAMA / CAPTURA:**  
> *(Insertar aquí Captura de Pantalla: Modal de Validación de Incidente con Candado Activo y Evidencia)*

### 4.4 Dictamen Técnico: Aprobación, Desestimación y Resolución
Dentro del modal de evaluación:
- **Inspección de Evidencia:** Haga clic en la imagen para abrirla en alta resolución procesada por la CDN de Cloudinary.
- **Verificación Espacial:** Corrobore las coordenadas y la demarcación del barrio/vereda en el mapa miniatura.
- **Corrección de Datos:** Ajuste la gravedad, modalidad o descripción si la tipificación inicial del reportero fue imprecisa.
- **Opciones de Dictamen:**
  - **Aprobar / Resolver:** Hace oficial el incidente. Cambia su estado a "Aprobado", lo publica de inmediato en el mapa de acceso general y computa para las estadísticas públicas.
  - **Desestimar / Rechazar:** Requiere ingresar obligatoriamente una justificación técnica (ej: "Reporte duplicado", "Evidencia no concluyente"). El incidente se archiva, se oculta del público y queda visible solo para auditoría.

### 4.5 Importación Masiva de Incidentes mediante Archivo CSV
Para cargar registros históricos o reportes externos:
1. Diríjase a la pestaña **"Importación Masiva"**.
2. Descargue la **"Plantilla CSV de Ejemplo"** para asegurarse de respetar los nombres de columna requeridos (`tipo`, `fecha`, `hora`, `lat`, `lng`, `descripcion`, `gravedad`, `direccion`).
3. Arrastre su archivo `.csv` al área de carga y pulse **"Iniciar Procesamiento"**.
4. El sistema validará en streaming fila a fila y desplegará un resumen detallado con la cantidad de filas insertadas con éxito y las filas rechazadas con su motivo específico.

> **ESPACIO PARA DIAGRAMA / CAPTURA:**  
> *(Insertar aquí Captura de Pantalla: Consola de Importación Masiva CSV con Reporte de Resultados)*

### 4.6 Uso del Mecanismo de Rollback de Importaciones
Si tras una carga masiva se detecta que el archivo origen contenía datos corruptos o fechas erróneas:
1. En la misma consola de importación, pulse el botón rojo **"Deshacer Última Importación (Rollback)"**.
2. El sistema solicitará confirmación indicando el identificador del lote.
3. Al confirmar, el servidor ejecutará una eliminación en bloque restringida exclusivamente a los registros de ese lote, restaurando el mapa al estado inmediatamente anterior.

### 4.7 Explorador Tabular Avanzado con Exportación
Permite buscar incidentes mediante filtros combinados por columnas, ordenar por fecha o severidad y exportar los resultados a formatos estándar para informes institucionales.

---

## 5. MÓDULO 4: GOBERNANZA Y AUDITORÍA (ROL SUPERADMINISTRADOR)

El perfil de **Superadministrador** posee la máxima jerarquía técnica del sistema, con facultades exclusivas sobre la gestión de identidades y la trazabilidad del sistema.

### 5.1 Creación de Usuarios y Envío Automatizado de Credenciales
1. Ingrese a la consola **"Gestión de Usuarios"**.
2. Haga clic en el botón **"+ Registrar Nuevo Usuario"**.
3. Complete el formulario institucional:
   - *Nombre Completo.*
   - *Nombre de Usuario Único.*
   - *Correo Electrónico Institucional.*
   - *Rol Asignado:* Reportero, Administrador o Superadministrador.
   - *Entidad / Dependencia:* (Ej: Policía Nacional Cuadrante 3, Alcaldía Florencia).
   - *Teléfono de Contacto.*
4. Pulse **"Crear Usuario y Despachar Credenciales"**.
5. **Proceso Automático del Sistema:** El servidor generará una contraseña temporal de alta seguridad, la almacenará cifrada con Bcrypt, marcará la cuenta con cambio obligatorio de contraseña y enviará un correo electrónico de bienvenida mediante Nodemailer con los datos de acceso y el enlace a la plataforma.

> **ESPACIO PARA DIAGRAMA / CAPTURA:**  
> *(Insertar aquí Captura de Pantalla: Formulario de Creación de Usuario con Asignación de Roles)*

### 5.2 Gestión Integral de Cuentas, Modificación de Roles y Estados
- **Activar / Inactivar Cuentas:** Si un funcionario es trasladado o cesa sus funciones, basta con cambiar su estado a `Inactivo`. El sistema cerrará automáticamente cualquier sesión que dicho usuario mantenga abierta en ese instante.
- **Reasignación de Roles:** Permite ascender a un Reportero a Administrador o viceversa con efecto inmediato en sus permisos.
- **Regla de Seguridad del Superadministrador:** El sistema bloquea automáticamente cualquier intento de un Superadministrador de inactivarse o degradarse a sí mismo para prevenir el bloqueo accidental de la administración.

### 5.3 Consola de Auditoría Forense y Monitoreo de Logs
En la sección **"Bitácora de Auditoría"**:
- Se presenta el registro inmutable de todas las acciones críticas ejecutadas en el sistema.
- Columnas visibles: Marca de tiempo precisa (fecha/hora), usuario responsable, acción realizada, tabla afectada, ID del registro, dirección IP del cliente y navegador utilizado (*User-Agent*).
- **Buscador Forense:** Permite filtrar eventos ocurridos en un rango de fechas para verificar quién aprobó un incidente determinado, quién modificó un rol o cuándo se realizó una importación masiva.

> **ESPACIO PARA DIAGRAMA / CAPTURA:**  
> *(Insertar aquí Captura de Pantalla: Consola de Auditoría Forense y Trazabilidad de Logs)*

### 5.4 Administración de Parámetros Globales y Catálogos
El Superadministrador tiene la potestad de:
- Modificar y crear nuevas tipologías de incidentes.
- Gestionar niveles de gravedad y tiempos de respuesta esperados.
- Forzar la liberación manual de cualquier candado de la mesa de validación si un analista dejó un caso bloqueado indebidamente.

---

## 6. PREGUNTAS FRECUENTES Y RESOLUCIÓN DE PROBLEMAS (FAQ)

| Problema o Pregunta | Causa Probable | Solución Paso a Paso |
| :--- | :--- | :--- |
| **"El botón de GPS no captura mis coordenadas en el móvil."** | Los permisos de geolocalización están denegados en el navegador del teléfono. | Ingrese a la configuración del navegador en el dispositivo, diríjase a *Permisos de Sitio*, busque el portal SIGI y seleccione **Permitir acceso a ubicación precisa**. |
| **"Aparece un mensaje que dice que el incidente está bloqueado por otro analista."** | Otro analista está evaluando el caso en la mesa de validación. | Debe esperar a que el analista concluya su dictamen o libere el caso. Si el analista abandonó el caso, el bloqueo caducará automáticamente a los 10 minutos. |
| **"No recibí el correo con el enlace de recuperación de contraseña."** | El correo pudo llegar a la carpeta de spam o el servidor SMTP está en modo simulador local. | Revise su carpeta de *Correo no deseado / Spam*. Si se encuentra en un entorno de desarrollo local, solicite al administrador técnico que revise la consola del servidor donde se imprime el enlace simulado. |
| **"El sistema me pide cambiar la contraseña y no me deja hacer nada más."** | Su cuenta fue recién creada o restablecida por un administrador. | Es una política de seguridad obligatoria. Digite su nueva contraseña personal cumpliendo los requisitos mínimos para continuar utilizando la plataforma normalmente. |
| **"¿Por qué un incidente que reporté no aparece en el Geoportal público?"** | El incidente aún se encuentra en estado *Reportado* (pendiente de validación). | Todo reporte radicado por un reportero en terreno debe ser primero revisado y aprobado por la mesa de validación para garantizar la veracidad de la información pública. |
