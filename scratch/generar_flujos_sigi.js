const fs = require('fs');
const path = require('path');
const { DrawioDiagramBuilder } = require('./drawio_builder');

function generarDiagramasFlujo() {
    const builder = new DrawioDiagramBuilder();

    // =========================================================================
    // PESTAÑA 1: Flujo-Autenticacion-General
    // =========================================================================
    const tabAuth = builder.addTab('tab-auth', 'Flujo-Autenticacion-General');

    // Módulo 1: Inicio de Sesión y Control de Acceso
    builder.addNode(tabAuth, 'mod_auth_box', 'MÓDULO: Inicio de Sesión y Control de Acceso (Login & JWT)', DrawioDiagramBuilder.STYLES.CONTAINER, 50, 40, 660, 1500);
    builder.addNode(tabAuth, 'auth_start', 'Inicio: Acceso a /login/index.html', DrawioDiagramBuilder.STYLES.START_END, 260, 90, 240, 50);
    builder.addNode(tabAuth, 'auth_in1', 'Ingreso de credenciales:\nUsuario/Email + Contraseña', DrawioDiagramBuilder.STYLES.IO_DATA, 260, 180, 240, 55);
    builder.addNode(tabAuth, 'auth_dec_rl', '¿Excede Rate Limit?\n(> 5 intentos en 15 min)', DrawioDiagramBuilder.STYLES.DECISION, 280, 275, 200, 90);
    builder.addNode(tabAuth, 'auth_err_rl', 'HTTP 429: Bloqueo temporal por 15 min\nRegistra advertencia de seguridad', DrawioDiagramBuilder.STYLES.PROCESS, 510, 295, 180, 50);
    builder.addNode(tabAuth, 'auth_end_rl', 'Fin: Acceso bloqueado', DrawioDiagramBuilder.STYLES.START_END, 530, 380, 140, 40);

    builder.addNode(tabAuth, 'auth_proc_find', 'Consulta en PostgreSQL:\nSELECT * FROM usuarios WHERE email = $1', DrawioDiagramBuilder.STYLES.PROCESS, 260, 410, 240, 55);
    builder.addNode(tabAuth, 'auth_dec_exist', '¿Usuario existe en base de datos?', DrawioDiagramBuilder.STYLES.DECISION, 280, 505, 200, 90);
    builder.addNode(tabAuth, 'auth_err_exist', 'HTTP 401: Credenciales inválidas\nRegistra intento fallido', DrawioDiagramBuilder.STYLES.PROCESS, 70, 525, 170, 50);
    builder.addNode(tabAuth, 'auth_end_exist', 'Fin: Autenticación rechazada', DrawioDiagramBuilder.STYLES.START_END, 70, 610, 170, 40);

    builder.addNode(tabAuth, 'auth_dec_act', '¿Cuenta en estado activo?\n(activo == 1)', DrawioDiagramBuilder.STYLES.DECISION, 280, 635, 200, 90);
    builder.addNode(tabAuth, 'auth_err_act', 'HTTP 403: Cuenta inactiva\n"Consulte al Superadministrador"', DrawioDiagramBuilder.STYLES.PROCESS, 70, 655, 170, 50);
    builder.addNode(tabAuth, 'auth_end_act', 'Fin: Acceso denegado', DrawioDiagramBuilder.STYLES.START_END, 70, 740, 170, 40);

    builder.addNode(tabAuth, 'auth_proc_bcrypt', 'Verificación de hash con Bcrypt:\nbcrypt.compare(password, password_hash)', DrawioDiagramBuilder.STYLES.PROCESS, 260, 765, 240, 55);
    builder.addNode(tabAuth, 'auth_dec_pass', '¿Contraseña válida?', DrawioDiagramBuilder.STYLES.DECISION, 280, 860, 200, 90);
    builder.addNode(tabAuth, 'auth_err_pass', 'HTTP 401: Credenciales inválidas\nIncrementa contador de fallas', DrawioDiagramBuilder.STYLES.PROCESS, 70, 880, 170, 50);
    builder.addNode(tabAuth, 'auth_end_pass', 'Fin: Contraseña incorrecta', DrawioDiagramBuilder.STYLES.START_END, 70, 965, 170, 40);

    builder.addNode(tabAuth, 'auth_dec_force', '¿Debe cambiar contraseña?\n(debe_cambiar_password == 1)', DrawioDiagramBuilder.STYLES.DECISION, 280, 990, 200, 90);
    builder.addNode(tabAuth, 'auth_proc_modal', 'Modal forzoso de cambio de clave:\nIngresa nueva clave (>= 8 caracteres)\nbcrypt.hash() -> UPDATE usuarios\nSET debe_cambiar_password = 0', DrawioDiagramBuilder.STYLES.PROCESS, 490, 1070, 200, 85);

    builder.addNode(tabAuth, 'auth_proc_jwt', 'Generación de Token JWT de sesión\nFirma HMAC con JWT_SECRET\nPayload: { id, rol, exp: 24h }', DrawioDiagramBuilder.STYLES.PROCESS, 260, 1165, 240, 65);
    builder.addNode(tabAuth, 'auth_dec_rol', 'Bifurcación según Rol:\n¿rol del usuario?', DrawioDiagramBuilder.STYLES.DECISION, 280, 1270, 200, 90);

    builder.addNode(tabAuth, 'auth_dest_rep', 'Redirección a /reportero/index.html', DrawioDiagramBuilder.STYLES.PROCESS, 70, 1400, 180, 45);
    builder.addNode(tabAuth, 'auth_end_rep', 'Fin: Sesión Reportero', DrawioDiagramBuilder.STYLES.START_END, 80, 1475, 160, 40);

    builder.addNode(tabAuth, 'auth_dest_adm', 'Redirección a /admin/index.html', DrawioDiagramBuilder.STYLES.PROCESS, 290, 1400, 180, 45);
    builder.addNode(tabAuth, 'auth_end_adm', 'Fin: Sesión Administrador', DrawioDiagramBuilder.STYLES.START_END, 300, 1475, 160, 40);

    builder.addNode(tabAuth, 'auth_dest_sup', 'Redirección a /superadmin/index.html', DrawioDiagramBuilder.STYLES.PROCESS, 500, 1400, 190, 45);
    builder.addNode(tabAuth, 'auth_end_sup', 'Fin: Sesión Superadministrador', DrawioDiagramBuilder.STYLES.START_END, 515, 1475, 160, 40);

    // Conectores Módulo 1
    builder.addEdge(tabAuth, 'ea1', 'auth_start', 'auth_in1');
    builder.addEdge(tabAuth, 'ea2', 'auth_in1', 'auth_dec_rl');
    builder.addEdge(tabAuth, 'ea3', 'auth_dec_rl', 'auth_err_rl', 'Sí');
    builder.addEdge(tabAuth, 'ea4', 'auth_err_rl', 'auth_end_rl');
    builder.addEdge(tabAuth, 'ea5', 'auth_dec_rl', 'auth_proc_find', 'No');
    builder.addEdge(tabAuth, 'ea6', 'auth_proc_find', 'auth_dec_exist');
    builder.addEdge(tabAuth, 'ea7', 'auth_dec_exist', 'auth_err_exist', 'No');
    builder.addEdge(tabAuth, 'ea8', 'auth_err_exist', 'auth_end_exist');
    builder.addEdge(tabAuth, 'ea9', 'auth_dec_exist', 'auth_dec_act', 'Sí');
    builder.addEdge(tabAuth, 'ea10', 'auth_dec_act', 'auth_err_act', 'No');
    builder.addEdge(tabAuth, 'ea11', 'auth_err_act', 'auth_end_act');
    builder.addEdge(tabAuth, 'ea12', 'auth_dec_act', 'auth_proc_bcrypt', 'Sí');
    builder.addEdge(tabAuth, 'ea13', 'auth_proc_bcrypt', 'auth_dec_pass');
    builder.addEdge(tabAuth, 'ea14', 'auth_dec_pass', 'auth_err_pass', 'No');
    builder.addEdge(tabAuth, 'ea15', 'auth_err_pass', 'auth_end_pass');
    builder.addEdge(tabAuth, 'ea16', 'auth_dec_pass', 'auth_dec_force', 'Sí');
    builder.addEdge(tabAuth, 'ea17', 'auth_dec_force', 'auth_proc_modal', 'Sí');
    builder.addEdge(tabAuth, 'ea18', 'auth_proc_modal', 'auth_proc_jwt');
    builder.addEdge(tabAuth, 'ea19', 'auth_dec_force', 'auth_proc_jwt', 'No');
    builder.addEdge(tabAuth, 'ea20', 'auth_proc_jwt', 'auth_dec_rol');
    builder.addEdge(tabAuth, 'ea21', 'auth_dec_rol', 'auth_dest_rep', 'Rol: Reportero');
    builder.addEdge(tabAuth, 'ea22', 'auth_dest_rep', 'auth_end_rep');
    builder.addEdge(tabAuth, 'ea23', 'auth_dec_rol', 'auth_dest_adm', 'Rol: Admin');
    builder.addEdge(tabAuth, 'ea24', 'auth_dest_adm', 'auth_end_adm');
    builder.addEdge(tabAuth, 'ea25', 'auth_dec_rol', 'auth_dest_sup', 'Rol: Superadmin');
    builder.addEdge(tabAuth, 'ea26', 'auth_dest_sup', 'auth_end_sup');

    // Módulo 2: Recuperación de Contraseña Olvidada
    builder.addNode(tabAuth, 'mod_rec_box', 'MÓDULO: Recuperación Segura de Contraseña (Token HMAC 60 min)', DrawioDiagramBuilder.STYLES.CONTAINER, 750, 40, 560, 1340);
    builder.addNode(tabAuth, 'rec_start', 'Inicio: Clic en "¿Olvidó su contraseña?"', DrawioDiagramBuilder.STYLES.START_END, 910, 90, 240, 50);
    builder.addNode(tabAuth, 'rec_in_email', 'Ingreso de correo institucional', DrawioDiagramBuilder.STYLES.IO_DATA, 910, 180, 240, 50);
    builder.addNode(tabAuth, 'rec_proc_search', 'Búsqueda en PostgreSQL por correo', DrawioDiagramBuilder.STYLES.PROCESS, 910, 270, 240, 50);
    builder.addNode(tabAuth, 'rec_dec_exist', '¿Correo registrado y activo?', DrawioDiagramBuilder.STYLES.DECISION, 930, 360, 200, 90);
    builder.addNode(tabAuth, 'rec_msg_safe', 'Respuesta genérica por seguridad:\n"Si el correo existe, recibirá el enlace"', DrawioDiagramBuilder.STYLES.PROCESS, 1150, 380, 140, 65);
    builder.addNode(tabAuth, 'rec_end_safe', 'Fin: Proceso seguro finalizado', DrawioDiagramBuilder.STYLES.START_END, 1150, 480, 140, 40);

    builder.addNode(tabAuth, 'rec_proc_token', 'Genera token criptográfico HMAC SHA-256\nAlmacena en reset_tokens con validez 60 min', DrawioDiagramBuilder.STYLES.PROCESS, 910, 490, 240, 60);
    builder.addNode(tabAuth, 'rec_proc_mail', 'Despacha correo electrónico formal vía Nodemailer\ncon enlace a /login/reset-password.html?token=...', DrawioDiagramBuilder.STYLES.PROCESS, 910, 590, 240, 60);
    builder.addNode(tabAuth, 'rec_proc_click', 'Usuario hace clic en enlace recibido', DrawioDiagramBuilder.STYLES.PROCESS, 910, 690, 240, 50);
    builder.addNode(tabAuth, 'rec_dec_valid', '¿Token válido, vigente (< 60 min)\ny sin uso previo?', DrawioDiagramBuilder.STYLES.DECISION, 930, 780, 200, 90);
    builder.addNode(tabAuth, 'rec_err_token', 'HTTP 400: Enlace inválido o expirado\nSolicite una nueva recuperación', DrawioDiagramBuilder.STYLES.PROCESS, 1150, 800, 140, 60);
    builder.addNode(tabAuth, 'rec_end_err', 'Fin: Enlace caducado', DrawioDiagramBuilder.STYLES.START_END, 1150, 895, 140, 40);

    builder.addNode(tabAuth, 'rec_in_newpass', 'Usuario ingresa y confirma nueva contraseña', DrawioDiagramBuilder.STYLES.IO_DATA, 910, 910, 240, 50);
    builder.addNode(tabAuth, 'rec_dec_policy', '¿Cumple política de seguridad?\n(Mínimo 8 caracteres alfanuméricos)', DrawioDiagramBuilder.STYLES.DECISION, 930, 1000, 200, 90);
    builder.addNode(tabAuth, 'rec_proc_update', 'Cifra contraseña con Bcrypt (10 rondas)\nUPDATE usuarios SET password_hash = $1\nMarca token como consumido (used = 1)', DrawioDiagramBuilder.STYLES.PROCESS, 910, 1130, 240, 65);
    builder.addNode(tabAuth, 'rec_end_ok', 'Fin: Notifica éxito y redirige a Login', DrawioDiagramBuilder.STYLES.START_END, 910, 1235, 240, 45);

    // Conectores Módulo 2
    builder.addEdge(tabAuth, 'er1', 'rec_start', 'rec_in_email');
    builder.addEdge(tabAuth, 'er2', 'rec_in_email', 'rec_proc_search');
    builder.addEdge(tabAuth, 'er3', 'rec_proc_search', 'rec_dec_exist');
    builder.addEdge(tabAuth, 'er4', 'rec_dec_exist', 'rec_msg_safe', 'No');
    builder.addEdge(tabAuth, 'er5', 'rec_msg_safe', 'rec_end_safe');
    builder.addEdge(tabAuth, 'er6', 'rec_dec_exist', 'rec_proc_token', 'Sí');
    builder.addEdge(tabAuth, 'er7', 'rec_proc_token', 'rec_proc_mail');
    builder.addEdge(tabAuth, 'er8', 'rec_proc_mail', 'rec_proc_click');
    builder.addEdge(tabAuth, 'er9', 'rec_proc_click', 'rec_dec_valid');
    builder.addEdge(tabAuth, 'er10', 'rec_dec_valid', 'rec_err_token', 'No');
    builder.addEdge(tabAuth, 'er11', 'rec_err_token', 'rec_end_err');
    builder.addEdge(tabAuth, 'er12', 'rec_dec_valid', 'rec_in_newpass', 'Sí');
    builder.addEdge(tabAuth, 'er13', 'rec_in_newpass', 'rec_dec_policy');
    builder.addEdge(tabAuth, 'er14', 'rec_dec_policy', 'rec_in_newpass', 'No: Reintentar', { exitX: 0, exitY: 0.5, entryX: 0, entryY: 0.5 });
    builder.addEdge(tabAuth, 'er15', 'rec_dec_policy', 'rec_proc_update', 'Sí');
    builder.addEdge(tabAuth, 'er16', 'rec_proc_update', 'rec_end_ok');

    // =========================================================================
    // PESTAÑA 2: Flujo-Invitado (Ciudadano)
    // =========================================================================
    const tabInv = builder.addTab('tab-invitado', 'Flujo-Invitado');

    // Módulo 1: Geoportal Cartográfico Público & Capas Territoriales
    builder.addNode(tabInv, 'mod_inv_box', 'MÓDULO: Geoportal Cartográfico Público & Capas Territoriales', DrawioDiagramBuilder.STYLES.CONTAINER, 50, 40, 620, 1100);
    builder.addNode(tabInv, 'inv_start', 'Inicio: Acceso público a /dashboard/index.html', DrawioDiagramBuilder.STYLES.START_END, 240, 90, 240, 50);
    builder.addNode(tabInv, 'inv_proc_init', 'Inicialización de Leaflet.js centrado en Florencia\nCarga mapa base (Satelital / Positron / Dark Mode)', DrawioDiagramBuilder.STYLES.PROCESS, 240, 180, 240, 60);
    builder.addNode(tabInv, 'inv_proc_geom', 'Carga capas vectoriales GeoJSON:\nLímites de Barrios urbanos y Veredas rurales', DrawioDiagramBuilder.STYLES.PROCESS, 240, 280, 240, 60);
    builder.addNode(tabInv, 'inv_proc_req', 'Solicitud asíncrona de incidentes:\nGET /api/incidentes', DrawioDiagramBuilder.STYLES.PROCESS, 240, 380, 240, 55);
    builder.addNode(tabInv, 'inv_dec_filter', 'Filtro de Seguridad Pública en BD:\n¿Incidente con id_estado = 5 (Aprobado)?', DrawioDiagramBuilder.STYLES.DECISION, 260, 475, 200, 90);
    builder.addNode(tabInv, 'inv_proc_omit', 'Se descarta del mapa público\n(Queda invisible a la ciudadanía)', DrawioDiagramBuilder.STYLES.PROCESS, 70, 495, 170, 50);
    builder.addNode(tabInv, 'inv_end_omit', 'Fin: Incidente oculto', DrawioDiagramBuilder.STYLES.START_END, 80, 580, 150, 40);

    builder.addNode(tabInv, 'inv_proc_sanit', 'Sanitización de datos confidenciales:\nOmite nombres e identificación de reporteros', DrawioDiagramBuilder.STYLES.PROCESS, 240, 605, 240, 55);
    builder.addNode(tabInv, 'inv_proc_cluster', 'Agrupamiento espacial dinámico (MarkerCluster)\nColor según tipología e índice de gravedad', DrawioDiagramBuilder.STYLES.PROCESS, 240, 700, 240, 60);
    builder.addNode(tabInv, 'inv_proc_click', 'Ciudadano pulsa sobre un marcador en el mapa', DrawioDiagramBuilder.STYLES.PROCESS, 240, 800, 240, 50);
    builder.addNode(tabInv, 'inv_proc_popup', 'Despliega Popup informativo:\nRadicado, Tipo, Fecha/Hora, Sector, Severidad,\nEvidencia fotográfica optimizada (Cloudinary CDN)', DrawioDiagramBuilder.STYLES.PROCESS, 240, 890, 240, 70);
    builder.addNode(tabInv, 'inv_end_map', 'Fin: Visualización e interacción completa', DrawioDiagramBuilder.STYLES.START_END, 240, 1000, 240, 45);

    // Conectores Módulo 1 Invitado
    builder.addEdge(tabInv, 'ei1', 'inv_start', 'inv_proc_init');
    builder.addEdge(tabInv, 'ei2', 'inv_proc_init', 'inv_proc_geom');
    builder.addEdge(tabInv, 'ei3', 'inv_proc_geom', 'inv_proc_req');
    builder.addEdge(tabInv, 'ei4', 'inv_proc_req', 'inv_dec_filter');
    builder.addEdge(tabInv, 'ei5', 'inv_dec_filter', 'inv_proc_omit', 'No');
    builder.addEdge(tabInv, 'ei6', 'inv_proc_omit', 'inv_end_omit');
    builder.addEdge(tabInv, 'ei7', 'inv_dec_filter', 'inv_proc_sanit', 'Sí');
    builder.addEdge(tabInv, 'ei8', 'inv_proc_sanit', 'inv_proc_cluster');
    builder.addEdge(tabInv, 'ei9', 'inv_proc_cluster', 'inv_proc_click');
    builder.addEdge(tabInv, 'ei10', 'inv_proc_click', 'inv_proc_popup');
    builder.addEdge(tabInv, 'ei11', 'inv_proc_popup', 'inv_end_map');

    // Módulo 2: Motor de Filtros Espacio-Temporales y Estadísticas KPI
    builder.addNode(tabInv, 'mod_inv_kpi_box', 'MÓDULO: Motor de Filtros Espacio-Temporales y Estadísticas KPI', DrawioDiagramBuilder.STYLES.CONTAINER, 710, 40, 620, 1140);
    builder.addNode(tabInv, 'inv_f_start', 'Inicio: Ciudadano abre panel lateral de filtros', DrawioDiagramBuilder.STYLES.START_END, 900, 90, 240, 50);
    builder.addNode(tabInv, 'inv_f_in', 'Selección de criterios de búsqueda:\n- Rango de fechas (Desde / Hasta)\n- Tipo de incidente\n- Comuna / Barrio / Vereda\n- Nivel de gravedad (1 a 5)', DrawioDiagramBuilder.STYLES.IO_DATA, 900, 180, 240, 85);
    builder.addNode(tabInv, 'inv_f_click', 'Clic en botón "Filtrar Incidentes"', DrawioDiagramBuilder.STYLES.PROCESS, 900, 305, 240, 45);
    builder.addNode(tabInv, 'inv_f_req', 'Consulta con parámetros: GET /api/filtros', DrawioDiagramBuilder.STYLES.PROCESS, 900, 390, 240, 50);
    builder.addNode(tabInv, 'inv_f_dec_res', '¿Se hallaron incidentes en el criterio?', DrawioDiagramBuilder.STYLES.DECISION, 920, 480, 200, 90);
    builder.addNode(tabInv, 'inv_f_empty', 'Notificación emergente:\n"No se encontraron incidentes coincidentes"', DrawioDiagramBuilder.STYLES.PROCESS, 1145, 500, 165, 50);

    builder.addNode(tabInv, 'inv_f_update', 'Actualiza marcadores visibles en pantalla\nAjusta encuadre geográfico (fitBounds)', DrawioDiagramBuilder.STYLES.PROCESS, 900, 610, 240, 60);
    builder.addNode(tabInv, 'inv_f_kpi_tab', 'Ciudadano selecciona pestaña "Estadísticas / KPIs"', DrawioDiagramBuilder.STYLES.PROCESS, 900, 710, 240, 50);
    builder.addNode(tabInv, 'inv_f_kpi_req', 'Consultas analíticas asíncronas:\nGET /api/estadisticas/resumen\nGET /api/estadisticas/conteoPorTipo\nGET /api/estadisticas/top-zonas', DrawioDiagramBuilder.STYLES.PROCESS, 900, 800, 240, 75);
    builder.addNode(tabInv, 'inv_f_kpi_render', 'Renderizado con Chart.js:\n- Tarjetas de métricas agregadas\n- Gráfico de dona (Doughnut) por tipo\n- Evolución temporal semanal/mensual\n- Gráfico de barras: Top 10 zonas críticas', DrawioDiagramBuilder.STYLES.PROCESS, 900, 915, 240, 85);
    builder.addNode(tabInv, 'inv_f_end', 'Fin: Análisis estadístico desplegado', DrawioDiagramBuilder.STYLES.START_END, 900, 1040, 240, 45);

    // Conectores Módulo 2 Invitado
    builder.addEdge(tabInv, 'eif1', 'inv_f_start', 'inv_f_in');
    builder.addEdge(tabInv, 'eif2', 'inv_f_in', 'inv_f_click');
    builder.addEdge(tabInv, 'eif3', 'inv_f_click', 'inv_f_req');
    builder.addEdge(tabInv, 'eif4', 'inv_f_req', 'inv_f_dec_res');
    builder.addEdge(tabInv, 'eif5', 'inv_f_dec_res', 'inv_f_empty', 'No');
    builder.addEdge(tabInv, 'eif6', 'inv_f_empty', 'inv_f_in', '', { exitX: 0.5, exitY: 0, entryX: 1, entryY: 0.5 });
    builder.addEdge(tabInv, 'eif7', 'inv_f_dec_res', 'inv_f_update', 'Sí');
    builder.addEdge(tabInv, 'eif8', 'inv_f_update', 'inv_f_kpi_tab');
    builder.addEdge(tabInv, 'eif9', 'inv_f_kpi_tab', 'inv_f_kpi_req');
    builder.addEdge(tabInv, 'eif10', 'inv_f_kpi_req', 'inv_f_kpi_render');
    builder.addEdge(tabInv, 'eif11', 'inv_f_kpi_render', 'inv_f_end');

    // =========================================================================
    // PESTAÑA 3: Flujo-Reportero (Operación en Campo)
    // =========================================================================
    const tabRep = builder.addTab('tab-reportero', 'Flujo-Reportero');

    // Módulo 1: Captura Móvil GPS y Asistencia Inteligente con IA
    builder.addNode(tabRep, 'mod_rep_box', 'MÓDULO: Captura Móvil GPS y Asistencia Inteligente con IA (NLP)', DrawioDiagramBuilder.STYLES.CONTAINER, 50, 40, 620, 1530);
    builder.addNode(tabRep, 'rep_start', 'Inicio: Acceso a /reportero/index.html', DrawioDiagramBuilder.STYLES.START_END, 240, 90, 240, 50);
    builder.addNode(tabRep, 'rep_dec_pwa', '¿PWA instalada en dispositivo?', DrawioDiagramBuilder.STYLES.DECISION, 260, 180, 200, 90);
    builder.addNode(tabRep, 'rep_pwa_banner', 'Service Worker cachea recursos shell\nMuestra banner "Instalar App en inicio"', DrawioDiagramBuilder.STYLES.PROCESS, 70, 195, 170, 60);

    builder.addNode(tabRep, 'rep_btn_new', 'Clic en "Nuevo Reporte de Incidente"', DrawioDiagramBuilder.STYLES.PROCESS, 240, 310, 240, 45);
    builder.addNode(tabRep, 'rep_btn_gps', 'Clic en "Obtener Mi Ubicación (GPS)"', DrawioDiagramBuilder.STYLES.PROCESS, 240, 395, 240, 45);
    builder.addNode(tabRep, 'rep_dec_gps', '¿Permiso GPS concedido?', DrawioDiagramBuilder.STYLES.DECISION, 260, 480, 200, 90);
    builder.addNode(tabRep, 'rep_err_gps', 'Alerta: "Permiso GPS denegado"\nSolicita habilitar en configuración', DrawioDiagramBuilder.STYLES.PROCESS, 70, 495, 170, 60);

    builder.addNode(tabRep, 'rep_proc_gps', 'HTML5 Geolocation (enableHighAccuracy)\nCaptura latitud, longitud y precisión métrica', DrawioDiagramBuilder.STYLES.PROCESS, 240, 610, 240, 55);
    builder.addNode(tabRep, 'rep_proc_drag', 'Fija marcador en mini-mapa interactivo\nReportero puede arrastrarlo para afinar punto', DrawioDiagramBuilder.STYLES.PROCESS, 240, 705, 240, 55);
    builder.addNode(tabRep, 'rep_proc_topol', 'Consulta topológica PostGIS (ST_Contains):\nIdentifica automáticamente Barrio o Vereda', DrawioDiagramBuilder.STYLES.PROCESS, 240, 800, 240, 55);
    builder.addNode(tabRep, 'rep_in_desc', 'Reportero redacta relato de los hechos en campo', DrawioDiagramBuilder.STYLES.IO_DATA, 240, 895, 240, 50);
    builder.addNode(tabRep, 'rep_proc_nlp', 'Motor NLP Naive Bayes analiza el texto en segundo plano', DrawioDiagramBuilder.STYLES.PROCESS, 240, 985, 240, 50);

    builder.addNode(tabRep, 'rep_dec_sug', '¿Modelo detecta tipología con alta probabilidad?', DrawioDiagramBuilder.STYLES.DECISION, 260, 1075, 200, 90);
    builder.addNode(tabRep, 'rep_sug_chip', 'Muestra chip predictivo:\n"Tipo sugerido: [Tipo] (Confianza: X%)"\nReportero acepta sugerencia con un clic', DrawioDiagramBuilder.STYLES.PROCESS, 475, 1085, 180, 70);

    builder.addNode(tabRep, 'rep_dec_emerg', '¿Texto contiene palabras de emergencia?\n("herido", "fuego", "disparos", "sangre")', DrawioDiagramBuilder.STYLES.DECISION, 260, 1205, 200, 90);
    builder.addNode(tabRep, 'rep_emerg_act', 'Activa automáticamente casillas de auxilio:\nAmbulancia / Policía / Bomberos', DrawioDiagramBuilder.STYLES.PROCESS, 475, 1215, 180, 70);

    builder.addNode(tabRep, 'rep_in_photo', 'Captura de fotografía con cámara o galería móvil', DrawioDiagramBuilder.STYLES.IO_DATA, 240, 1335, 240, 50);
    builder.addNode(tabRep, 'rep_end_m1', 'Fin: Formulario listo para radicación', DrawioDiagramBuilder.STYLES.START_END, 240, 1425, 240, 45);

    // Conectores Módulo 1 Reportero
    builder.addEdge(tabRep, 'er1', 'rep_start', 'rep_dec_pwa');
    builder.addEdge(tabRep, 'er2', 'rep_dec_pwa', 'rep_pwa_banner', 'No');
    builder.addEdge(tabRep, 'er3', 'rep_pwa_banner', 'rep_btn_new');
    builder.addEdge(tabRep, 'er4', 'rep_dec_pwa', 'rep_btn_new', 'Sí');
    builder.addEdge(tabRep, 'er5', 'rep_btn_new', 'rep_btn_gps');
    builder.addEdge(tabRep, 'er6', 'rep_btn_gps', 'rep_dec_gps');
    builder.addEdge(tabRep, 'er7', 'rep_dec_gps', 'rep_err_gps', 'No');
    builder.addEdge(tabRep, 'er8', 'rep_err_gps', 'rep_btn_gps', '', { exitX: 0.5, exitY: 0, entryX: 0, entryY: 0.5 });
    builder.addEdge(tabRep, 'er9', 'rep_dec_gps', 'rep_proc_gps', 'Sí');
    builder.addEdge(tabRep, 'er10', 'rep_proc_gps', 'rep_proc_drag');
    builder.addEdge(tabRep, 'er11', 'rep_proc_drag', 'rep_proc_topol');
    builder.addEdge(tabRep, 'er12', 'rep_proc_topol', 'rep_in_desc');
    builder.addEdge(tabRep, 'er13', 'rep_in_desc', 'rep_proc_nlp');
    builder.addEdge(tabRep, 'er14', 'rep_proc_nlp', 'rep_dec_sug');
    builder.addEdge(tabRep, 'er15', 'rep_dec_sug', 'rep_sug_chip', 'Sí');
    builder.addEdge(tabRep, 'er16', 'rep_sug_chip', 'rep_dec_emerg');
    builder.addEdge(tabRep, 'er17', 'rep_dec_sug', 'rep_dec_emerg', 'No / Manual');
    builder.addEdge(tabRep, 'er18', 'rep_dec_emerg', 'rep_emerg_act', 'Sí');
    builder.addEdge(tabRep, 'er19', 'rep_emerg_act', 'rep_in_photo');
    builder.addEdge(tabRep, 'er20', 'rep_dec_emerg', 'rep_in_photo', 'No');
    builder.addEdge(tabRep, 'er21', 'rep_in_photo', 'rep_end_m1');

    // Módulo 2: Bifurcación de Conectividad (Online vs PWA Offline) & Radicación
    builder.addNode(tabRep, 'mod_rep_rad_box', 'MÓDULO: Gestión de Conectividad (Online vs PWA Offline) & Radicación', DrawioDiagramBuilder.STYLES.CONTAINER, 700, 40, 580, 1020);
    builder.addNode(tabRep, 'rep_rad_start', 'Inicio: Reportero pulsa "Radicar Incidente"', DrawioDiagramBuilder.STYLES.START_END, 870, 90, 240, 50);
    builder.addNode(tabRep, 'rep_dec_online', '¿Dispositivo tiene conexión a Internet?\n(navigator.onLine == true)', DrawioDiagramBuilder.STYLES.DECISION, 890, 180, 200, 90);

    // Ruta Offline
    builder.addNode(tabRep, 'rep_off_save', 'Modo Offline Activo:\nSerializa payload y almacena en cola local\nlocalStorage: sigi_cola_incidentes_offline', DrawioDiagramBuilder.STYLES.PROCESS, 720, 310, 180, 75);
    builder.addNode(tabRep, 'rep_off_banner', 'Despliega franja ámbar informativa:\n"Reporte guardado localmente en el móvil"', DrawioDiagramBuilder.STYLES.PROCESS, 720, 425, 180, 60);
    builder.addNode(tabRep, 'rep_off_listen', 'Service Worker escucha evento:\nwindow.ononline', DrawioDiagramBuilder.STYLES.PROCESS, 720, 525, 180, 50);
    builder.addNode(tabRep, 'rep_off_sync', 'Al restablecer señal:\nLee cola secuencialmente (FIFO) y transmite', DrawioDiagramBuilder.STYLES.PROCESS, 720, 615, 180, 65);

    // Ruta Online
    builder.addNode(tabRep, 'rep_on_cloud', 'Transmisión de imagen a Cloudinary CDN\nGenera URL HTTPS segura y optimizada', DrawioDiagramBuilder.STYLES.PROCESS, 950, 310, 240, 60);
    builder.addNode(tabRep, 'rep_on_post', 'Envío de payload al servidor:\nPOST /api/incidentes con coordenadas y foto', DrawioDiagramBuilder.STYLES.PROCESS, 950, 410, 240, 60);
    builder.addNode(tabRep, 'rep_on_db', 'Backend inserta incidente en PostgreSQL:\nAsigna id_estado = 1 ("Reportado")\nGenera código radicado INC-YYYY-XXXX', DrawioDiagramBuilder.STYLES.PROCESS, 950, 510, 240, 70);
    builder.addNode(tabRep, 'rep_on_ws', 'Servidor emite evento WebSocket "nuevo_incidente"\na la sala institucional de "administradores"', DrawioDiagramBuilder.STYLES.PROCESS, 950, 620, 240, 60);
    builder.addNode(tabRep, 'rep_on_res', 'Retorna respuesta exitosa HTTP 201 Created', DrawioDiagramBuilder.STYLES.PROCESS, 950, 720, 240, 50);
    builder.addNode(tabRep, 'rep_on_modal', 'Despliega modal de confirmación con radicado oficial\nLimpia formulario para nueva captura', DrawioDiagramBuilder.STYLES.PROCESS, 950, 810, 240, 60);
    builder.addNode(tabRep, 'rep_rad_end', 'Fin: Incidente radicado exitosamente', DrawioDiagramBuilder.STYLES.START_END, 950, 910, 240, 45);

    // Conectores Módulo 2 Reportero
    builder.addEdge(tabRep, 'err1', 'rep_rad_start', 'rep_dec_online');
    builder.addEdge(tabRep, 'err2', 'rep_dec_online', 'rep_off_save', 'No (Offline)');
    builder.addEdge(tabRep, 'err3', 'rep_off_save', 'rep_off_banner');
    builder.addEdge(tabRep, 'err4', 'rep_off_banner', 'rep_off_listen');
    builder.addEdge(tabRep, 'err5', 'rep_off_listen', 'rep_off_sync');
    builder.addEdge(tabRep, 'err6', 'rep_off_sync', 'rep_on_cloud');
    builder.addEdge(tabRep, 'err7', 'rep_dec_online', 'rep_on_cloud', 'Sí (Online)');
    builder.addEdge(tabRep, 'err8', 'rep_on_cloud', 'rep_on_post');
    builder.addEdge(tabRep, 'err9', 'rep_on_post', 'rep_on_db');
    builder.addEdge(tabRep, 'err10', 'rep_on_db', 'rep_on_ws');
    builder.addEdge(tabRep, 'err11', 'rep_on_ws', 'rep_on_res');
    builder.addEdge(tabRep, 'err12', 'rep_on_res', 'rep_on_modal');
    builder.addEdge(tabRep, 'err13', 'rep_on_modal', 'rep_rad_end');

    // Módulo 3: Consulta y Trazabilidad en "Mis Reportes"
    builder.addNode(tabRep, 'mod_rep_list_box', 'MÓDULO: Consulta y Trazabilidad en "Mis Reportes"', DrawioDiagramBuilder.STYLES.CONTAINER, 1310, 40, 460, 720);
    builder.addNode(tabRep, 'rep_rep_start', 'Inicio: Acceso a pestaña "Mis Reportes"', DrawioDiagramBuilder.STYLES.START_END, 1420, 90, 240, 50);
    builder.addNode(tabRep, 'rep_rep_req', 'Solicitud: GET /api/incidentes/mis-reportes', DrawioDiagramBuilder.STYLES.PROCESS, 1420, 180, 240, 50);
    builder.addNode(tabRep, 'rep_rep_render', 'Renderiza listado cronológico con badges:\n- Reportado (Amarillo)\n- En Evaluación (Azul)\n- Aprobado (Verde)\n- Desestimado (Rojo)', DrawioDiagramBuilder.STYLES.PROCESS, 1420, 270, 240, 80);
    builder.addNode(tabRep, 'rep_rep_dec', '¿Incidente fue desestimado?', DrawioDiagramBuilder.STYLES.DECISION, 1440, 390, 200, 90);
    builder.addNode(tabRep, 'rep_rep_motivo', 'Clic abre modal con justificación técnica\ny motivo emitido por el analista validador', DrawioDiagramBuilder.STYLES.PROCESS, 1330, 520, 180, 65);
    builder.addNode(tabRep, 'rep_rep_det', 'Muestra detalle de radicado y fecha oficial de publicación', DrawioDiagramBuilder.STYLES.PROCESS, 1550, 520, 180, 65);
    builder.addNode(tabRep, 'rep_rep_end', 'Fin: Estado de reportes verificado', DrawioDiagramBuilder.STYLES.START_END, 1420, 630, 240, 45);

    // Conectores Módulo 3 Reportero
    builder.addEdge(tabRep, 'erl1', 'rep_rep_start', 'rep_rep_req');
    builder.addEdge(tabRep, 'erl2', 'rep_rep_req', 'rep_rep_render');
    builder.addEdge(tabRep, 'erl3', 'rep_rep_render', 'rep_rep_dec');
    builder.addEdge(tabRep, 'erl4', 'rep_rep_dec', 'rep_rep_motivo', 'Sí');
    builder.addEdge(tabRep, 'erl5', 'rep_rep_dec', 'rep_rep_det', 'No');
    builder.addEdge(tabRep, 'erl6', 'rep_rep_motivo', 'rep_rep_end');
    builder.addEdge(tabRep, 'erl7', 'rep_rep_det', 'rep_rep_end');

    // =========================================================================
    // PESTAÑA 4: Flujo-Admin (Mesa de Validación, Analítica y Reportes)
    // =========================================================================
    const tabAdmin = builder.addTab('tab-admin', 'Flujo-Admin');

    // Módulo 1: Mesa de Validación & Control de Concurrencia
    builder.addNode(tabAdmin, 'mod_adm_val_box', 'MÓDULO: Mesa de Validación & Control de Concurrencia (Candado 10 min)', DrawioDiagramBuilder.STYLES.CONTAINER, 50, 40, 680, 1440);
    builder.addNode(tabAdmin, 'adm_start', 'Inicio: Administrador en /admin/index.html', DrawioDiagramBuilder.STYLES.START_END, 270, 90, 240, 50);
    builder.addNode(tabAdmin, 'adm_proc_ws', 'Socket.io conectado a sala "administradores"\nEscucha evento "nuevo_incidente" en tiempo real', DrawioDiagramBuilder.STYLES.PROCESS, 270, 180, 240, 60);
    builder.addNode(tabAdmin, 'adm_proc_tone', 'Web Audio API sintetiza tono sonoro (D5 a A5)\nDespliega notificación Toast e inserta fila superior', DrawioDiagramBuilder.STYLES.PROCESS, 270, 280, 240, 60);
    builder.addNode(tabAdmin, 'adm_proc_click', 'Administrador pulsa "Revisar Incidente"', DrawioDiagramBuilder.STYLES.PROCESS, 270, 380, 240, 45);
    builder.addNode(tabAdmin, 'adm_proc_lockreq', 'Solicitud atómica: POST /api/incidentes/:id/tomar', DrawioDiagramBuilder.STYLES.PROCESS, 270, 465, 240, 50);
    builder.addNode(tabAdmin, 'adm_dec_lock', '¿Caso disponible o candado previo expirado?\n(id_admin_revisor IS NULL OR bloqueo_expira < NOW())', DrawioDiagramBuilder.STYLES.DECISION, 290, 555, 200, 95);

    builder.addNode(tabAdmin, 'adm_err_conflict', 'HTTP 409 Conflicto:\n"Caso en evaluación por otro analista"\nDeshabilita botón para los demás analistas', DrawioDiagramBuilder.STYLES.PROCESS, 80, 575, 180, 65);
    builder.addNode(tabAdmin, 'adm_end_conflict', 'Fin: Caso reservado', DrawioDiagramBuilder.STYLES.START_END, 90, 675, 160, 40);

    builder.addNode(tabAdmin, 'adm_proc_setlock', 'Adquisición de Candado:\nUPDATE incidente SET id_admin_revisor = $user,\nid_estado = 2, bloqueo_expira = NOW() + INTERVAL \'10 MIN\'', DrawioDiagramBuilder.STYLES.PROCESS, 270, 690, 240, 70);
    builder.addNode(tabAdmin, 'adm_proc_modal', 'Abre modal de validación exclusiva con fotos Cloudinary\ny mapa interactivo del punto del suceso', DrawioDiagramBuilder.STYLES.PROCESS, 270, 800, 240, 60);
    builder.addNode(tabAdmin, 'adm_proc_ai', 'Consulta Asistente IA ("Sugerencia IA"):\nCompara tipología reportada vs predicción NLP', DrawioDiagramBuilder.STYLES.PROCESS, 270, 900, 240, 55);
    builder.addNode(tabAdmin, 'adm_dec_resol', '¿Dictamen técnico del Administrador?', DrawioDiagramBuilder.STYLES.DECISION, 290, 995, 200, 90);

    // Opciones de resolución
    builder.addNode(tabAdmin, 'adm_res_apr', 'Aprobar: POST /:id/resolver\nUPDATE incidente SET id_estado = 5 ("Aprobado"),\nfecha_resolucion = NOW()', DrawioDiagramBuilder.STYLES.PROCESS, 270, 1125, 240, 70);
    builder.addNode(tabAdmin, 'adm_res_pub', 'Caso se publica de inmediato en Geoportal público\ny alimenta modelos de Machine Learning', DrawioDiagramBuilder.STYLES.PROCESS, 270, 1235, 240, 60);

    builder.addNode(tabAdmin, 'adm_res_des', 'Desestimar: POST /:id/cerrar\nValida justificación técnica obligatoria\nUPDATE incidente SET id_estado = 6, motivo = $motivo', DrawioDiagramBuilder.STYLES.PROCESS, 530, 1125, 180, 75);
    builder.addNode(tabAdmin, 'adm_res_arch', 'Caso se archiva fuera de la vista pública\nPermanece accesible para auditoría', DrawioDiagramBuilder.STYLES.PROCESS, 530, 1240, 180, 55);

    builder.addNode(tabAdmin, 'adm_res_lib', 'Liberar: POST /:id/liberar\n(O transcurren 10 min de inactividad)\nRestablece id_admin_revisor = NULL, id_estado = 1', DrawioDiagramBuilder.STYLES.PROCESS, 80, 1125, 170, 75);

    builder.addNode(tabAdmin, 'adm_end_val', 'Fin: Caso procesado y cola actualizada', DrawioDiagramBuilder.STYLES.START_END, 270, 1345, 240, 45);

    // Conectores Módulo 1 Admin
    builder.addEdge(tabAdmin, 'eav1', 'adm_start', 'adm_proc_ws');
    builder.addEdge(tabAdmin, 'eav2', 'adm_proc_ws', 'adm_proc_tone');
    builder.addEdge(tabAdmin, 'eav3', 'adm_proc_tone', 'adm_proc_click');
    builder.addEdge(tabAdmin, 'eav4', 'adm_proc_click', 'adm_proc_lockreq');
    builder.addEdge(tabAdmin, 'eav5', 'adm_proc_lockreq', 'adm_dec_lock');
    builder.addEdge(tabAdmin, 'eav6', 'adm_dec_lock', 'adm_err_conflict', 'No');
    builder.addEdge(tabAdmin, 'eav7', 'adm_err_conflict', 'adm_end_conflict');
    builder.addEdge(tabAdmin, 'eav8', 'adm_dec_lock', 'adm_proc_setlock', 'Sí');
    builder.addEdge(tabAdmin, 'eav9', 'adm_proc_setlock', 'adm_proc_modal');
    builder.addEdge(tabAdmin, 'eav10', 'adm_proc_modal', 'adm_proc_ai');
    builder.addEdge(tabAdmin, 'eav11', 'adm_proc_ai', 'adm_dec_resol');
    builder.addEdge(tabAdmin, 'eav12', 'adm_dec_resol', 'adm_res_apr', 'Aprobar');
    builder.addEdge(tabAdmin, 'eav13', 'adm_res_apr', 'adm_res_pub');
    builder.addEdge(tabAdmin, 'eav14', 'adm_res_pub', 'adm_end_val');
    builder.addEdge(tabAdmin, 'eav15', 'adm_dec_resol', 'adm_res_des', 'Desestimar');
    builder.addEdge(tabAdmin, 'eav16', 'adm_res_des', 'adm_res_arch');
    builder.addEdge(tabAdmin, 'eav17', 'adm_res_arch', 'adm_end_val');
    builder.addEdge(tabAdmin, 'eav18', 'adm_dec_resol', 'adm_res_lib', 'Liberar');
    builder.addEdge(tabAdmin, 'eav19', 'adm_res_lib', 'adm_end_val');

    // Módulo 2: Analítica Predictiva Espacial (DBSCAN) y Pronóstico Temporal
    builder.addNode(tabAdmin, 'mod_adm_an_box', 'MÓDULO: Analítica Predictiva Espacial (DBSCAN) y Pronóstico Temporal', DrawioDiagramBuilder.STYLES.CONTAINER, 760, 40, 520, 960);
    builder.addNode(tabAdmin, 'adm_an_start', 'Inicio: Acceso a pestaña "Analítica Predictiva"', DrawioDiagramBuilder.STYLES.START_END, 900, 90, 240, 50);
    builder.addNode(tabAdmin, 'adm_an_in', 'Selección de ventana temporal y tipologías', DrawioDiagramBuilder.STYLES.IO_DATA, 900, 180, 240, 50);
    builder.addNode(tabAdmin, 'adm_an_req_dbscan', 'Solicitud: GET /api/ml/hotspots', DrawioDiagramBuilder.STYLES.PROCESS, 900, 270, 240, 50);
    builder.addNode(tabAdmin, 'adm_an_dbscan', 'Algoritmo DBSCAN con distancia de Haversine:\nAgrupa focos con eps = 300m y minPts = 3 incidentes', DrawioDiagramBuilder.STYLES.PROCESS, 900, 360, 240, 65);
    builder.addNode(tabAdmin, 'adm_an_map_render', 'Renderiza mapa de calor interactivo con gradiente cromático\n(Verde -> Amarillo -> Rojo según densidad crítica)', DrawioDiagramBuilder.STYLES.PROCESS, 900, 465, 240, 65);
    builder.addNode(tabAdmin, 'adm_an_req_fore', 'Solicitud: GET /api/ml/forecast', DrawioDiagramBuilder.STYLES.PROCESS, 900, 570, 240, 50);
    builder.addNode(tabAdmin, 'adm_an_fore', 'Modelo de Suavizado Exponencial (Exponential Smoothing):\nCalcula proyección delictiva para las próximas 4 semanas', DrawioDiagramBuilder.STYLES.PROCESS, 900, 660, 240, 65);
    builder.addNode(tabAdmin, 'adm_an_chart', 'Renderiza gráfico de tendencia con bandas de predicción\npara planificación de patrullajes preventivos', DrawioDiagramBuilder.STYLES.PROCESS, 900, 765, 240, 65);
    builder.addNode(tabAdmin, 'adm_an_end', 'Fin: Diagnóstico predictivo completado', DrawioDiagramBuilder.STYLES.START_END, 900, 870, 240, 45);

    // Conectores Módulo 2 Admin
    builder.addEdge(tabAdmin, 'eaa1', 'adm_an_start', 'adm_an_in');
    builder.addEdge(tabAdmin, 'eaa2', 'adm_an_in', 'adm_an_req_dbscan');
    builder.addEdge(tabAdmin, 'eaa3', 'adm_an_req_dbscan', 'adm_an_dbscan');
    builder.addEdge(tabAdmin, 'eaa4', 'adm_an_dbscan', 'adm_an_map_render');
    builder.addEdge(tabAdmin, 'eaa5', 'adm_an_map_render', 'adm_an_req_fore');
    builder.addEdge(tabAdmin, 'eaa6', 'adm_an_req_fore', 'adm_an_fore');
    builder.addEdge(tabAdmin, 'eaa7', 'adm_an_fore', 'adm_an_chart');
    builder.addEdge(tabAdmin, 'eaa8', 'adm_an_chart', 'adm_an_end');

    // Módulo 3: Generación de Reportes Oficiales Ejecutivos en PDF
    builder.addNode(tabAdmin, 'mod_adm_pdf_box', 'MÓDULO: Generación de Reportes Oficiales Ejecutivos en PDF', DrawioDiagramBuilder.STYLES.CONTAINER, 1310, 40, 480, 870);
    builder.addNode(tabAdmin, 'adm_pdf_start', 'Inicio: Pestaña "Reportes Ejecutivos"', DrawioDiagramBuilder.STYLES.START_END, 1430, 90, 240, 50);
    builder.addNode(tabAdmin, 'adm_pdf_in', 'Selección de mes y año institucional (o rango)', DrawioDiagramBuilder.STYLES.IO_DATA, 1430, 180, 240, 50);
    builder.addNode(tabAdmin, 'adm_pdf_click', 'Clic en "Generar Reporte Oficial PDF"', DrawioDiagramBuilder.STYLES.PROCESS, 1430, 270, 240, 45);
    builder.addNode(tabAdmin, 'adm_pdf_query', 'Backend consulta base de datos PostgreSQL:\nConsolida tipologías, variaciones y comunas', DrawioDiagramBuilder.STYLES.PROCESS, 1430, 355, 240, 60);
    builder.addNode(tabAdmin, 'adm_pdf_kit', 'Motor PDFKit compila dinámicamente el documento:\n- Portada oficial institucional\n- Tablas estadísticas formateadas\n- Resumen ejecutivo y firmas de control', DrawioDiagramBuilder.STYLES.PROCESS, 1430, 455, 240, 80);
    builder.addNode(tabAdmin, 'adm_pdf_stream', 'Transmite archivo con Content-Type: application/pdf', DrawioDiagramBuilder.STYLES.PROCESS, 1430, 575, 240, 50);
    builder.addNode(tabAdmin, 'adm_pdf_down', 'Descarga automática en navegador:\nReporte_Ejecutivo_SIGI_[MES]_[AÑO].pdf', DrawioDiagramBuilder.STYLES.PROCESS, 1430, 665, 240, 60);
    builder.addNode(tabAdmin, 'adm_pdf_end', 'Fin: Documento listo para comités', DrawioDiagramBuilder.STYLES.START_END, 1430, 765, 240, 45);

    // Conectores Módulo 3 Admin
    builder.addEdge(tabAdmin, 'eap1', 'adm_pdf_start', 'adm_pdf_in');
    builder.addEdge(tabAdmin, 'eap2', 'adm_pdf_in', 'adm_pdf_click');
    builder.addEdge(tabAdmin, 'eap3', 'adm_pdf_click', 'adm_pdf_query');
    builder.addEdge(tabAdmin, 'eap4', 'adm_pdf_query', 'adm_pdf_kit');
    builder.addEdge(tabAdmin, 'eap5', 'adm_pdf_kit', 'adm_pdf_stream');
    builder.addEdge(tabAdmin, 'eap6', 'adm_pdf_stream', 'adm_pdf_down');
    builder.addEdge(tabAdmin, 'eap7', 'adm_pdf_down', 'adm_pdf_end');

    // Módulo 4: Ingesta Masiva CSV y Reversión Atómica (Rollback)
    builder.addNode(tabAdmin, 'mod_adm_csv_box', 'MÓDULO: Ingesta Masiva CSV y Reversión Atómica (Rollback)', DrawioDiagramBuilder.STYLES.CONTAINER, 1820, 40, 520, 1080);
    builder.addNode(tabAdmin, 'adm_csv_start', 'Inicio: Pestaña "Importación Masiva"', DrawioDiagramBuilder.STYLES.START_END, 1960, 90, 240, 50);
    builder.addNode(tabAdmin, 'adm_csv_in', 'Carga de archivo .csv estructurado según plantilla', DrawioDiagramBuilder.STYLES.IO_DATA, 1960, 180, 240, 50);
    builder.addNode(tabAdmin, 'adm_csv_proc', 'Procesamiento en streaming fila a fila:\nValida tipos de datos, rangos geográficos y obligatoriedad', DrawioDiagramBuilder.STYLES.PROCESS, 1960, 270, 240, 65);
    builder.addNode(tabAdmin, 'adm_csv_dec_val', '¿Archivo contiene registros válidos?', DrawioDiagramBuilder.STYLES.DECISION, 1980, 375, 200, 90);
    builder.addNode(tabAdmin, 'adm_csv_err', 'Rechazo de lote con reporte detallado de errores', DrawioDiagramBuilder.STYLES.PROCESS, 2190, 395, 130, 50);

    builder.addNode(tabAdmin, 'adm_csv_insert', 'Inserción transaccional atómica en PostgreSQL:\nAsigna batch_id único a todos los registros del lote', DrawioDiagramBuilder.STYLES.PROCESS, 1960, 505, 240, 65);
    builder.addNode(tabAdmin, 'adm_csv_res', 'Reporta total de filas importadas con éxito', DrawioDiagramBuilder.STYLES.PROCESS, 1960, 610, 240, 50);
    builder.addNode(tabAdmin, 'adm_csv_dec_roll', '¿Usuario solicita revertir importación?\n(Clic en "Deshacer Última Importación")', DrawioDiagramBuilder.STYLES.DECISION, 1980, 700, 200, 90);

    builder.addNode(tabAdmin, 'adm_csv_roll_conf', 'Solicita confirmación de seguridad con batch_id', DrawioDiagramBuilder.STYLES.PROCESS, 2190, 795, 130, 50);
    builder.addNode(tabAdmin, 'adm_csv_roll_del', 'DELETE FROM incidente WHERE batch_id = $batchId\nEliminación atómica y exclusiva del lote', DrawioDiagramBuilder.STYLES.PROCESS, 2180, 885, 150, 65);
    builder.addNode(tabAdmin, 'adm_csv_roll_ok', 'Restaura mapa al estado anterior e informa', DrawioDiagramBuilder.STYLES.PROCESS, 2180, 990, 150, 50);

    builder.addNode(tabAdmin, 'adm_csv_ok_keep', 'Registros quedan consolidados definitivamente en el sistema', DrawioDiagramBuilder.STYLES.PROCESS, 1960, 830, 240, 55);
    builder.addNode(tabAdmin, 'adm_csv_end', 'Fin: Operación de importación concluida', DrawioDiagramBuilder.STYLES.START_END, 1960, 925, 240, 45);

    // Conectores Módulo 4 Admin
    builder.addEdge(tabAdmin, 'eac1', 'adm_csv_start', 'adm_csv_in');
    builder.addEdge(tabAdmin, 'eac2', 'adm_csv_in', 'adm_csv_proc');
    builder.addEdge(tabAdmin, 'eac3', 'adm_csv_proc', 'adm_csv_dec_val');
    builder.addEdge(tabAdmin, 'eac4', 'adm_csv_dec_val', 'adm_csv_err', 'No');
    builder.addEdge(tabAdmin, 'eac5', 'adm_csv_dec_val', 'adm_csv_insert', 'Sí');
    builder.addEdge(tabAdmin, 'eac6', 'adm_csv_insert', 'adm_csv_res');
    builder.addEdge(tabAdmin, 'eac7', 'adm_csv_res', 'adm_csv_dec_roll');
    builder.addEdge(tabAdmin, 'eac8', 'adm_csv_dec_roll', 'adm_csv_roll_conf', 'Sí');
    builder.addEdge(tabAdmin, 'eac9', 'adm_csv_roll_conf', 'adm_csv_roll_del');
    builder.addEdge(tabAdmin, 'eac10', 'adm_csv_roll_del', 'adm_csv_roll_ok');
    builder.addEdge(tabAdmin, 'eac11', 'adm_csv_roll_ok', 'adm_csv_end');
    builder.addEdge(tabAdmin, 'eac12', 'adm_csv_dec_roll', 'adm_csv_ok_keep', 'No');
    builder.addEdge(tabAdmin, 'eac13', 'adm_csv_ok_keep', 'adm_csv_end');

    // =========================================================================
    // PESTAÑA 5: Flujo-Superadmin (Gobernanza, Auditoría y Seguridad)
    // =========================================================================
    const tabSuper = builder.addTab('tab-superadmin', 'Flujo-Superadmin');

    // Módulo 1: Creación de Usuarios y Despacho Automático de Credenciales
    builder.addNode(tabSuper, 'mod_sup_box', 'MÓDULO: Creación de Usuarios y Despacho Automático de Credenciales', DrawioDiagramBuilder.STYLES.CONTAINER, 50, 40, 560, 770);
    builder.addNode(tabSuper, 'sup_start', 'Inicio: Acceso a /superadmin/index.html', DrawioDiagramBuilder.STYLES.START_END, 210, 90, 240, 50);
    builder.addNode(tabSuper, 'sup_in_user', 'Ingreso de datos en "+ Registrar Nuevo Usuario":\nNombre, Username, Email, Rol, Entidad, Teléfono', DrawioDiagramBuilder.STYLES.IO_DATA, 210, 180, 240, 70);
    builder.addNode(tabSuper, 'sup_proc_pass', 'Genera contraseña aleatoria segura (10 caracteres)\nCifra hash con Bcrypt (10 salt rounds)', DrawioDiagramBuilder.STYLES.PROCESS, 210, 290, 240, 60);
    builder.addNode(tabSuper, 'sup_proc_insert', 'Inserta en BD con activo = 1 y debe_cambiar_password = 1', DrawioDiagramBuilder.STYLES.PROCESS, 210, 390, 240, 50);
    builder.addNode(tabSuper, 'sup_proc_mail', 'Nodemailer despacha correo electrónico formal\ncon credenciales de acceso y enlace oficial', DrawioDiagramBuilder.STYLES.PROCESS, 210, 480, 240, 60);
    builder.addNode(tabSuper, 'sup_proc_audit1', 'Registra evento de creación en bitácora de auditoría', DrawioDiagramBuilder.STYLES.PROCESS, 210, 580, 240, 50);
    builder.addNode(tabSuper, 'sup_end_create', 'Fin: Cuenta creada y credenciales enviadas', DrawioDiagramBuilder.STYLES.START_END, 210, 670, 240, 45);

    // Conectores Módulo 1 Superadmin
    builder.addEdge(tabSuper, 'es1', 'sup_start', 'sup_in_user');
    builder.addEdge(tabSuper, 'es2', 'sup_in_user', 'sup_proc_pass');
    builder.addEdge(tabSuper, 'es3', 'sup_proc_pass', 'sup_proc_insert');
    builder.addEdge(tabSuper, 'es4', 'sup_proc_insert', 'sup_proc_mail');
    builder.addEdge(tabSuper, 'es5', 'sup_proc_mail', 'sup_proc_audit1');
    builder.addEdge(tabSuper, 'es6', 'sup_proc_audit1', 'sup_end_create');

    // Módulo 2: Control de Estados y Blindaje Institucional de Superadmin
    builder.addNode(tabSuper, 'mod_sup_st_box', 'MÓDULO: Control de Estados y Blindaje Institucional de Superadmin', DrawioDiagramBuilder.STYLES.CONTAINER, 640, 40, 560, 1040);
    builder.addNode(tabSuper, 'sup_st_start', 'Inicio: Superadmin selecciona un usuario existente', DrawioDiagramBuilder.STYLES.START_END, 800, 90, 240, 50);
    builder.addNode(tabSuper, 'sup_st_in', 'Solicitud: Inactivar usuario o Modificar Rol', DrawioDiagramBuilder.STYLES.IO_DATA, 800, 180, 240, 50);
    builder.addNode(tabSuper, 'sup_st_dec_issup', '¿El usuario objetivo es Superadministrador?', DrawioDiagramBuilder.STYLES.DECISION, 820, 270, 200, 90);

    builder.addNode(tabSuper, 'sup_st_dec_last', '¿Es el único Superadmin activo?\n(contarSuperadminsActivos <= 1)', DrawioDiagramBuilder.STYLES.DECISION, 820, 400, 200, 95);
    builder.addNode(tabSuper, 'sup_st_err_last', 'Operación Denegada (HTTP 400):\n"No es posible inactivar ni degradar al\núnico Superadministrador activo"', DrawioDiagramBuilder.STYLES.PROCESS, 1030, 410, 160, 75);
    builder.addNode(tabSuper, 'sup_st_end_block', 'Fin: Bloqueo de seguridad activo', DrawioDiagramBuilder.STYLES.START_END, 1035, 520, 150, 40);

    builder.addNode(tabSuper, 'sup_st_dec_self', '¿Superadmin intenta auto-inactivarse\nen su propia sesión activa?', DrawioDiagramBuilder.STYLES.DECISION, 820, 535, 200, 95);
    builder.addNode(tabSuper, 'sup_st_err_self', 'Operación Denegada (HTTP 400):\n"No puede inactivar su propia cuenta"', DrawioDiagramBuilder.STYLES.PROCESS, 1030, 550, 160, 65);

    builder.addNode(tabSuper, 'sup_st_proc_upd', 'UPDATE usuarios SET activo = $estado / rol = $rol', DrawioDiagramBuilder.STYLES.PROCESS, 800, 670, 240, 50);
    builder.addNode(tabSuper, 'sup_st_proc_sess', 'Revoca tokens y finaliza sesiones activas si fue inactivado', DrawioDiagramBuilder.STYLES.PROCESS, 800, 760, 240, 55);
    builder.addNode(tabSuper, 'sup_st_proc_aud', 'Registra cambio de estado en bitácora de auditoría', DrawioDiagramBuilder.STYLES.PROCESS, 800, 855, 240, 50);
    builder.addNode(tabSuper, 'sup_st_end_ok', 'Fin: Estado de cuenta actualizado con blindaje', DrawioDiagramBuilder.STYLES.START_END, 800, 945, 240, 45);

    // Conectores Módulo 2 Superadmin
    builder.addEdge(tabSuper, 'ess1', 'sup_st_start', 'sup_st_in');
    builder.addEdge(tabSuper, 'ess2', 'sup_st_in', 'sup_st_dec_issup');
    builder.addEdge(tabSuper, 'ess3', 'sup_st_dec_issup', 'sup_st_dec_last', 'Sí');
    builder.addEdge(tabSuper, 'ess4', 'sup_st_dec_issup', 'sup_st_proc_upd', 'No (Reportero/Admin)');
    builder.addEdge(tabSuper, 'ess5', 'sup_st_dec_last', 'sup_st_err_last', 'Sí');
    builder.addEdge(tabSuper, 'ess6', 'sup_st_err_last', 'sup_st_end_block');
    builder.addEdge(tabSuper, 'ess7', 'sup_st_dec_last', 'sup_st_dec_self', 'No (Hay otros activos)');
    builder.addEdge(tabSuper, 'ess8', 'sup_st_dec_self', 'sup_st_err_self', 'Sí');
    builder.addEdge(tabSuper, 'ess9', 'sup_st_err_self', 'sup_st_end_block');
    builder.addEdge(tabSuper, 'ess10', 'sup_st_dec_self', 'sup_st_proc_upd', 'No');
    builder.addEdge(tabSuper, 'ess11', 'sup_st_proc_upd', 'sup_st_proc_sess');
    builder.addEdge(tabSuper, 'ess12', 'sup_st_proc_sess', 'sup_st_proc_aud');
    builder.addEdge(tabSuper, 'ess13', 'sup_st_proc_aud', 'sup_st_end_ok');

    // Módulo 3: Catálogos con Validación Cromática Perceptual (Redmean)
    builder.addNode(tabSuper, 'mod_sup_cat_box', 'MÓDULO: Catálogos con Validación Cromática Perceptual (Redmean)', DrawioDiagramBuilder.STYLES.CONTAINER, 1230, 40, 570, 1040);
    builder.addNode(tabSuper, 'sup_cat_start', 'Inicio: Consola "Administración de Catálogos"', DrawioDiagramBuilder.STYLES.START_END, 1395, 90, 240, 50);
    builder.addNode(tabSuper, 'sup_cat_in', 'Digita nombre de tipología y elige color hexadecimal', DrawioDiagramBuilder.STYLES.IO_DATA, 1395, 180, 240, 50);
    builder.addNode(tabSuper, 'sup_cat_calc', 'Cálculo de Distancia Perceptual Cromática (Redmean):\nDeltaC = sqrt((2+r/256)*DR^2 + 4*DG^2 + (2+(255-r)/256)*DB^2)', DrawioDiagramBuilder.STYLES.PROCESS, 1395, 270, 240, 75);
    builder.addNode(tabSuper, 'sup_cat_dec_col', '¿Distancia cromática DeltaC < 85\nrespecto a otro tipo preexistente?', DrawioDiagramBuilder.STYLES.DECISION, 1415, 385, 200, 95);

    builder.addNode(tabSuper, 'sup_cat_err_col', 'Alerta de Colisión Visual:\n"El color es indistinguible de otro tipo.\nSeleccione una tonalidad con mayor contraste"', DrawioDiagramBuilder.STYLES.PROCESS, 1630, 395, 160, 75);

    builder.addNode(tabSuper, 'sup_cat_insert', 'Color perceptiblemente diferenciable:\nINSERT INTO tipo_incidente (nombre, color, activo)', DrawioDiagramBuilder.STYLES.PROCESS, 1395, 520, 240, 60);
    builder.addNode(tabSuper, 'sup_cat_dec_del', '¿Superadmin solicita eliminar una tipología?', DrawioDiagramBuilder.STYLES.DECISION, 1415, 620, 200, 90);

    builder.addNode(tabSuper, 'sup_cat_chk_ref', 'Consulta referencial:\ncontarIncidentesPorTipo(id)', DrawioDiagramBuilder.STYLES.PROCESS, 1630, 725, 160, 50);
    builder.addNode(tabSuper, 'sup_cat_dec_ref', '¿Tiene incidentes\nhistóricos?', DrawioDiagramBuilder.STYLES.DECISION, 1640, 815, 140, 75);
    builder.addNode(tabSuper, 'sup_cat_err_ref', 'Bloquea eliminación física por integridad referencial\n(Sugiere archivado lógico)', DrawioDiagramBuilder.STYLES.PROCESS, 1620, 930, 170, 60);
    builder.addNode(tabSuper, 'sup_cat_del_ok', 'DELETE FROM tipo_incidente WHERE id = $id', DrawioDiagramBuilder.STYLES.PROCESS, 1435, 935, 160, 50);

    builder.addNode(tabSuper, 'sup_cat_end', 'Fin: Catálogo tipológico actualizado', DrawioDiagramBuilder.STYLES.START_END, 1395, 1025, 240, 45);

    // Conectores Módulo 3 Superadmin
    builder.addEdge(tabSuper, 'ec1', 'sup_cat_start', 'sup_cat_in');
    builder.addEdge(tabSuper, 'ec2', 'sup_cat_in', 'sup_cat_calc');
    builder.addEdge(tabSuper, 'ec3', 'sup_cat_calc', 'sup_cat_dec_col');
    builder.addEdge(tabSuper, 'ec4', 'sup_cat_dec_col', 'sup_cat_err_col', 'Sí');
    builder.addEdge(tabSuper, 'ec5', 'sup_cat_err_col', 'sup_cat_in', '', { exitX: 0.5, exitY: 0, entryX: 1, entryY: 0.5 });
    builder.addEdge(tabSuper, 'ec6', 'sup_cat_dec_col', 'sup_cat_insert', 'No');
    builder.addEdge(tabSuper, 'ec7', 'sup_cat_insert', 'sup_cat_dec_del');
    builder.addEdge(tabSuper, 'ec8', 'sup_cat_dec_del', 'sup_cat_chk_ref', 'Sí');
    builder.addEdge(tabSuper, 'ec9', 'sup_cat_chk_ref', 'sup_cat_dec_ref');
    builder.addEdge(tabSuper, 'ec10', 'sup_cat_dec_ref', 'sup_cat_err_ref', 'Sí');
    builder.addEdge(tabSuper, 'ec11', 'sup_cat_dec_ref', 'sup_cat_del_ok', 'No');
    builder.addEdge(tabSuper, 'ec12', 'sup_cat_dec_del', 'sup_cat_end', 'No');
    builder.addEdge(tabSuper, 'ec13', 'sup_cat_del_ok', 'sup_cat_end');
    builder.addEdge(tabSuper, 'ec14', 'sup_cat_err_ref', 'sup_cat_end');

    // Módulo 4: Auditoría Forense y Reentrenamiento ML
    builder.addNode(tabSuper, 'mod_sup_ml_box', 'MÓDULO: Auditoría Forense y Reentrenamiento ML', DrawioDiagramBuilder.STYLES.CONTAINER, 1830, 40, 530, 870);
    builder.addNode(tabSuper, 'sup_ml_start', 'Inicio: Consola de Auditoría y Machine Learning', DrawioDiagramBuilder.STYLES.START_END, 1970, 90, 240, 50);
    builder.addNode(tabSuper, 'sup_aud_filter', 'Auditoría Forense: Filtrado por fecha, usuario y tabla\nConsulta GET /api/usuarios/auditoria (tabla inmutable)', DrawioDiagramBuilder.STYLES.PROCESS, 1970, 180, 240, 65);
    builder.addNode(tabSuper, 'sup_aud_view', 'Inspección de metadatos forenses: IP, User-Agent, JSON payload', DrawioDiagramBuilder.STYLES.PROCESS, 1970, 285, 240, 55);
    builder.addNode(tabSuper, 'sup_ml_retrain', 'Superadmin pulsa "Reentrenar Modelo ML":\nPOST /api/ml/reentrenar', DrawioDiagramBuilder.STYLES.PROCESS, 1970, 380, 240, 55);
    builder.addNode(tabSuper, 'sup_ml_query', 'Extrae relatos de incidentes aprobados (id_estado = 5)', DrawioDiagramBuilder.STYLES.PROCESS, 1970, 475, 240, 50);
    builder.addNode(tabSuper, 'sup_ml_bayes', 'Reconstruye vocabulario y probabilidades a priori\naplicando suavizado de Laplace en tiempo real', DrawioDiagramBuilder.STYLES.PROCESS, 1970, 565, 240, 65);
    builder.addNode(tabSuper, 'sup_ml_update', 'Actualiza matriz predictiva en memoria sin reinicio de Node.js', DrawioDiagramBuilder.STYLES.PROCESS, 1970, 670, 240, 55);
    builder.addNode(tabSuper, 'sup_ml_end', 'Fin: Modelo reentrenado y auditoría verificada', DrawioDiagramBuilder.STYLES.START_END, 1970, 765, 240, 45);

    // Conectores Módulo 4 Superadmin
    builder.addEdge(tabSuper, 'em1', 'sup_ml_start', 'sup_aud_filter');
    builder.addEdge(tabSuper, 'em2', 'sup_aud_filter', 'sup_aud_view');
    builder.addEdge(tabSuper, 'em3', 'sup_aud_view', 'sup_ml_retrain');
    builder.addEdge(tabSuper, 'em4', 'sup_ml_retrain', 'sup_ml_query');
    builder.addEdge(tabSuper, 'em5', 'sup_ml_query', 'sup_ml_bayes');
    builder.addEdge(tabSuper, 'em6', 'sup_ml_bayes', 'sup_ml_update');
    builder.addEdge(tabSuper, 'em7', 'sup_ml_update', 'sup_ml_end');

    return builder.toXml();
}

// Generar el archivo XML
const xmlContent = generarDiagramasFlujo();

// Destinos de guardado
const destino1 = 'C:\\Users\\Lenovo\\Documents\\SENA\\AnalizarRiesgos\\Diagramas_Flujo_SIGI.drawio';
const destino2 = 'C:\\Users\\Lenovo\\Documents\\SENA\\AnalizarRiesgos\\Diagramas.drawio';
const dirDocs = path.join(__dirname, '..', 'documentacion', 'DocumentosFinales', 'Diagramas');
if (!fs.existsSync(dirDocs)) {
    fs.mkdirSync(dirDocs, { recursive: true });
}
const destino3 = path.join(dirDocs, 'Diagramas_Flujo_SIGI.drawio');

fs.writeFileSync(destino1, xmlContent, 'utf8');
console.log('Guardado exitosamente en:', destino1);

fs.writeFileSync(destino2, xmlContent, 'utf8');
console.log('Guardado exitosamente en:', destino2);

fs.writeFileSync(destino3, xmlContent, 'utf8');
console.log('Guardado exitosamente en:', destino3);

console.log('Total bytes generados:', xmlContent.length);
