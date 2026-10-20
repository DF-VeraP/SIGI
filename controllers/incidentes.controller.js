const csv = require('csv-parser');
const stream = require('stream');
const IncidenteModel = require('../models/incidente.model');
const logger = require('../utils/logger');
const { registrarLogActividad } = logger;
const { subirImagenCloudinary, eliminarImagenCloudinary } = require('../utils/cloudinary');

/**
 * Valida que la fecha y hora de un incidente sean lógicas y válidas:
 * - Formato estricto AAAA-MM-DD
 * - Año entre 2000 y el año actual (evita años como 403 o años negativos)
 * - Mes entre 01 y 12 (evita mes 22)
 * - Día válido para el mes y año específico (evita día 44 o 30 de febrero)
 * - No permite fechas futuras ni horas futuras para el día de hoy
 */
const validarFechaHoraIncidente = (fecha, hora) => {
  if (!fecha || typeof fecha !== 'string') {
    return { valido: false, mensaje: "La fecha del incidente es obligatoria y debe ser válida." };
  }
  const regexFecha = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = fecha.trim().match(regexFecha);
  if (!match) {
    return { valido: false, mensaje: "Formato de fecha inválido. Debe ser AAAA-MM-DD." };
  }
  const anio = parseInt(match[1], 10);
  const mes = parseInt(match[2], 10);
  const dia = parseInt(match[3], 10);

  const anioMinimo = 2000;
  const ahora = new Date();
  const anioActual = ahora.getFullYear();

  if (anio < anioMinimo || anio > anioActual) {
    return { valido: false, mensaje: `El año del incidente (${anio}) no es válido. Debe estar entre ${anioMinimo} y ${anioActual}.` };
  }
  if (mes < 1 || mes > 12) {
    return { valido: false, mensaje: `El mes (${mes}) es inválido. Debe estar entre 01 y 12.` };
  }
  const diasEnMes = new Date(anio, mes, 0).getDate();
  if (dia < 1 || dia > diasEnMes) {
    return { valido: false, mensaje: `El día (${dia}) no es válido para el mes ${mes} (máximo ${diasEnMes} días).` };
  }

  // Comprobar fecha futura con la fecha local actual
  const mesPad = String(ahora.getMonth() + 1).padStart(2, '0');
  const diaPad = String(ahora.getDate()).padStart(2, '0');
  const hoyStr = `${anioActual}-${mesPad}-${diaPad}`;

  if (fecha.trim() > hoyStr) {
    return { valido: false, mensaje: "La fecha del incidente no puede ser futura." };
  }

  // Validar hora si viene presente
  if (hora) {
    const regexHora = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;
    if (!regexHora.test(hora.trim())) {
      return { valido: false, mensaje: "Formato de hora inválido. Debe ser HH:MM (00:00 a 23:59)." };
    }
    if (fecha.trim() === hoyStr) {
      const [horas, minutos] = hora.split(':').map(Number);
      const horaActual = ahora.getHours();
      const minActual = ahora.getMinutes();
      if (horas > horaActual || (horas === horaActual && minutos > minActual)) {
        return { valido: false, mensaje: "Si la fecha es hoy, la hora no puede ser posterior a la hora actual." };
      }
    }
  }

  return { valido: true };
};

// Registrar un incidente (Abierto a Reportero, Admin y Superadmin)
const registrarIncidente = async (req, res) => {
  const idusuarioLogueado = req.session.idusuario;
  if (!idusuarioLogueado) {
    return res.status(401).json({ mensaje: "No autorizado 🚫" });
  }

  const {
    tipo,
    fecha,
    hora,
    lat,
    lng,
    descripcion,
    descripcionincidente,
    id_gravedad,
    id_modalidad,
    direccion,
    comentarios_adicionales,
    numero_victimas,
    numero_vehiculos_afectados,
    valor_perdidas,
    requiere_ambulancia,
    requiere_policia,
    requiere_bomberos,
    factores
  } = req.body;

  const textoDescripcion = (descripcionincidente || descripcion || '').trim();

  if (!tipo || !fecha || !hora || lat === undefined || lng === undefined) {
    return res.status(400).json({ mensaje: "Faltan campos obligatorios: tipo, fecha, hora y coordenadas ⚠️" });
  }

  // Validación estricta de fecha y hora
  const validacionFechaHora = validarFechaHoraIncidente(fecha, hora);
  if (!validacionFechaHora.valido) {
    return res.status(400).json({ mensaje: validacionFechaHora.mensaje });
  }

  try {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    // Generar código único de incidente si no existe
    const codigoincidente = `INC-${Date.now().toString().slice(-6)}`;

    // Procesar foto de evidencia si fue adjuntada
    let imagenUrl = null;
    if (req.file && req.file.buffer) {
      try {
        imagenUrl = await subirImagenCloudinary(req.file.buffer, codigoincidente, req.file.originalname);
      } catch (imgErr) {
        logger.error("Error al subir foto de evidencia:", imgErr.message);
      }
    }

    // Auto-asociar barrio y vereda con PostGIS ST_Contains a través del modelo
    const { idbarrio, idvereda } = await IncidenteModel.resolverUbicacionEspacial(lngNum, latNum);

    // Si quien registra es Admin o Superadmin, el incidente ya es verídico (Estado 5 = Aprobado / Resuelto)
    // Si es Reportero, queda en Estado 1 = Reportado (pendiente de revisión en cola)
    const rolCreador = req.session.rol || 'reportero';
    const esAdminOSuper = rolCreador === 'admin' || rolCreador === 'superadmin';
    const idEstado = esAdminOSuper ? 5 : 1;
    const adminRevisor = esAdminOSuper ? idusuarioLogueado : null;
    const parsedGravedad = parseInt(id_gravedad);
    const idGravedad = (!isNaN(parsedGravedad) && parsedGravedad > 0) ? parsedGravedad : 3;

    const parsedModalidad = parseInt(id_modalidad);
    const idModalidad = (!isNaN(parsedModalidad) && parsedModalidad > 0) ? parsedModalidad : null;

    const result = await IncidenteModel.crear({
      codigoincidente,
      tipo: parseInt(tipo),
      fecha,
      hora,
      descripcion: textoDescripcion,
      lng: lngNum,
      lat: latNum,
      idUsuario: idusuarioLogueado,
      idEstado,
      adminRevisor,
      idGravedad,
      idModalidad,
      idbarrio,
      idvereda,
      direccion: direccion || null,
      comentarios: comentarios_adicionales || null,
      victimas: numero_victimas ? parseInt(numero_victimas) : 1,
      vehiculos: numero_vehiculos_afectados ? parseInt(numero_vehiculos_afectados) : 0,
      perdidas: valor_perdidas ? parseFloat(valor_perdidas) : null,
      ambulancia: requiere_ambulancia === true || requiere_ambulancia === 'true',
      policia: requiere_policia === undefined ? true : (requiere_policia === true || requiere_policia === 'true'),
      bomberos: requiere_bomberos === true || requiere_bomberos === 'true',
      imagenUrl
    });

    const nuevoIncidente = result.rows[0];

    // Asignar factores si vienen especificados
    if (Array.isArray(factores) && factores.length > 0) {
      await IncidenteModel.asociarFactores(nuevoIncidente.idincidente, factores);
    }

    // Registrar en auditoría
    const descAuditoria = esAdminOSuper
      ? `Incidente ${nuevoIncidente.codigoincidente} creado en estado Aprobado por ${rolCreador}`
      : `Incidente ${nuevoIncidente.codigoincidente} creado en estado Reportado`;

    await registrarLogActividad(
      idusuarioLogueado,
      'CREAR_INCIDENTE',
      'incidente',
      nuevoIncidente.idincidente,
      descAuditoria,
      req
    );

    // Si fue creado por reportero, notificar a los administradores
    if (!esAdminOSuper) {
      await IncidenteModel.notificarAdmins(`Nuevo incidente ${nuevoIncidente.codigoincidente} reportado en espera de revisión.`);
    }

    // Notificar en tiempo real por WebSockets (Socket.io)
    try {
      const io = req.app && req.app.get('io');
      if (io) {
        io.emit('nuevo_incidente', {
          idincidente: nuevoIncidente.idincidente,
          codigoincidente: nuevoIncidente.codigoincidente,
          idtipoincidente: parseInt(tipo),
          descripcion: textoDescripcion,
          lat: latNum,
          lng: lngNum,
          fecha,
          hora,
          id_estado: idEstado,
          id_gravedad: idGravedad,
          direccion: direccion || null,
          imagen_url: nuevoIncidente.imagen_url
        });
      }
    } catch (wsErr) {
      logger.warn("Aviso Socket.io:", wsErr.message);
    }

    res.status(201).json({
      mensaje: "Incidente registrado exitosamente.",
      incidente: nuevoIncidente
    });

  } catch (error) {
    logger.error("Error al registrar incidente:", error);
    res.status(500).json({ mensaje: "Error en el servidor al registrar incidente" });
  }
};

// Obtener incidentes con filtros, JOINs explicativos y paginación opcional
const obtenerIncidentes = async (req, res) => {
  try {
    const { estado, gravedad, tipo, barrio, vereda, fecha_inicio, fecha_fin, mis_reportes, page, limit } = req.query;

    const result = await IncidenteModel.obtenerTodosConFiltros({
      estado,
      gravedad,
      tipo,
      barrio,
      vereda,
      fecha_inicio,
      fecha_fin,
      mis_reportes,
      idUsuario: req.session?.idusuario
    }, {
      page,
      limit
    });

    // Si el cliente solicita paginación explícita (page o paginated=true)
    if (page || req.query.paginated === 'true') {
      const curPage = parseInt(page) || 1;
      const curLimit = parseInt(limit) || 20;
      return res.json({
        total: result.total,
        page: curPage,
        limit: curLimit,
        totalPages: Math.ceil(result.total / curLimit) || 1,
        data: result.rows
      });
    }

    // Respuesta en array directo (100% retrocompatible con Leaflet y vistas actuales)
    res.json(result.rows);
  } catch (error) {
    logger.error("Error al obtener incidentes:", error);
    res.status(500).json({ mensaje: "Error al consultar incidentes" });
  }
};

// Obtener reportes propios del Reportero en sesión
const obtenerMisReportes = async (req, res) => {
  const idusuarioLogueado = req.session.idusuario;
  if (!idusuarioLogueado) {
    return res.status(401).json({ mensaje: "No autorizado 🚫" });
  }

  try {
    const result = await IncidenteModel.obtenerMisReportes(idusuarioLogueado);
    res.json(result.rows);
  } catch (error) {
    logger.error("Error al obtener mis reportes:", error);
    res.status(500).json({ mensaje: "Error en servidor" });
  }
};

// Obtener incidentes pendientes de revisión (Admin y Superadmin)
const obtenerPendientes = async (req, res) => {
  try {
    const result = await IncidenteModel.obtenerPendientes();
    res.json(result.rows);
  } catch (error) {
    logger.error("Error al obtener incidentes pendientes:", error);
    res.status(500).json({ mensaje: "Error al obtener pendientes" });
  }
};

// Cambiar estado / validar incidente (Admin y Superadmin)
const cambiarEstadoIncidente = async (req, res) => {
  const { id } = req.params;
  const { id_estado, id_gravedad, id_modalidad, comentarios_adicionales } = req.body;

  if (!id_estado) {
    return res.status(400).json({ mensaje: "Se requiere especificar id_estado ⚠️" });
  }

  try {
    const incCheck = await IncidenteModel.obtenerCreadorYEstado(parseInt(id));

    if (incCheck.rows.length === 0) {
      return res.status(404).json({ mensaje: "Incidente no encontrado ❌" });
    }

    const incidente = incCheck.rows[0];
    const estadoVal = parseInt(id_estado);
    const gravedadVal = id_gravedad ? parseInt(id_gravedad) : null;
    const modalidadVal = id_modalidad ? parseInt(id_modalidad) : null;

    const result = await IncidenteModel.actualizarEstado({
      idIncidente: parseInt(id),
      idEstado: estadoVal,
      idGravedad: gravedadVal,
      idModalidad: modalidadVal,
      comentariosAdicionales: comentarios_adicionales,
      idUsuarioEditor: req.session.idusuario
    });

    const estadoNombreRes = await IncidenteModel.obtenerNombreEstado(estadoVal);
    const estadoNombre = estadoNombreRes.rows[0]?.nombre || 'Nuevo Estado';

    await registrarLogActividad(
      req.session.idusuario,
      'CAMBIAR_ESTADO_INCIDENTE',
      'incidente',
      parseInt(id),
      `Estado del incidente ${incidente.codigoincidente || id} cambiado a ${estadoNombre}`,
      req
    );

    if (incidente.id_usuario_creador) {
      await IncidenteModel.crearNotificacion({
        idUsuario: incidente.id_usuario_creador,
        tipo: 'alerta',
        asunto: 'Actualización de Reporte',
        mensaje: `Tu reporte ${incidente.codigoincidente || id} ha sido actualizado a estado: "${estadoNombre}".`
      });
    }

    res.json({
      mensaje: `Estado actualizado a "${estadoNombre}" exitosamente ✅`,
      incidente: result.rows[0]
    });

  } catch (error) {
    logger.error("Error al cambiar estado del incidente:", error);
    res.status(500).json({ mensaje: "Error al actualizar estado del incidente" });
  }
};

const eliminarIncidente = async (req, res) => {
  const idusuarioLogueado = req.session.idusuario;
  const userRol = req.session.rol || 'reportero';

  if (!idusuarioLogueado) {
    return res.status(401).json({ mensaje: "No autorizado 🚫" });
  }

  try {
    const incId = parseInt(req.params.id);
    const checkOwner = await IncidenteModel.obtenerCreadorYEstado(incId);
    if (checkOwner.rows.length === 0) {
      return res.status(404).json({ mensaje: "Incidente no encontrado ❌" });
    }

    const inc = checkOwner.rows[0];
    const creadorId = inc.id_usuario_creador || inc.idusuario;

    if (userRol !== 'superadmin' && userRol !== 'admin' && creadorId !== idusuarioLogueado) {
      return res.status(403).json({ mensaje: "No tienes permiso para eliminar este incidente 🚫" });
    }

    // Si es reportero, solo puede eliminar si está en estado Reportado (1)
    if (userRol === 'reportero' && inc.id_estado !== 1) {
      return res.status(403).json({ mensaje: "No puedes eliminar un reporte que ya está en proceso de revisión 🚫" });
    }

    // Si tiene imagen asociada, eliminarla
    if (inc.imagen_url) {
      try {
        await eliminarImagenCloudinary(inc.imagen_url);
      } catch (errImg) {
        logger.warn("No se pudo eliminar la imagen asociada:", errImg.message);
      }
    }

    await IncidenteModel.eliminar(incId);

    await registrarLogActividad(
      idusuarioLogueado,
      'ELIMINAR_INCIDENTE',
      'incidente',
      incId,
      `Incidente ID ${incId} eliminado por ${req.session.usuario}`,
      req
    );

    res.json({ mensaje: "Incidente eliminado exitosamente ✅" });
  } catch (error) {
    logger.error("Error al eliminar incidente:", error);
    res.status(500).json({ mensaje: "Error al eliminar incidente" });
  }
};

const obtenerIncidente = async (req, res) => {
  try {
    const incId = parseInt(req.params.id);
    const result = await IncidenteModel.obtenerPorId(incId);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "Incidente no encontrado ❌" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error("Error al obtener incidente:", error);
    res.status(500).json({ mensaje: "Error al consultar incidente" });
  }
};

const actualizarIncidente = async (req, res) => {
  const idusuarioLogueado = req.session.idusuario;
  const userRol = req.session.rol || 'reportero';

  if (!idusuarioLogueado) {
    return res.status(401).json({ mensaje: "No autorizado 🚫" });
  }

  try {
    const incId = parseInt(req.params.id);
    const checkOwner = await IncidenteModel.obtenerCreadorYEstado(incId);
    if (checkOwner.rows.length === 0) {
      return res.status(404).json({ mensaje: "Incidente no encontrado ❌" });
    }

    const inc = checkOwner.rows[0];
    const creadorId = inc.id_usuario_creador || inc.idusuario;

    // Regla de Negocio del Reportero: Solo puede editar mientras esté en estado 'Reportado' (id_estado = 1)
    if (userRol === 'reportero') {
      if (creadorId !== idusuarioLogueado) {
        return res.status(403).json({ mensaje: "No tienes permiso para modificar incidentes de otros reporteros 🚫" });
      }
      if (inc.id_estado !== 1) {
        return res.status(403).json({ mensaje: "No puedes editar un reporte que ya está en proceso de revisión o investigación 🚫" });
      }
    }

    const { fechaincidente, horaincidente, descripcionincidente, direccion, id_gravedad, id_modalidad } = req.body;

    if (fechaincidente) {
      const validacionFecha = validarFechaHoraIncidente(fechaincidente, horaincidente);
      if (!validacionFecha.valido) {
        return res.status(400).json({ mensaje: validacionFecha.mensaje });
      }
    }

    const gravedadVal = id_gravedad ? parseInt(id_gravedad) : null;
    const modalidadVal = id_modalidad ? parseInt(id_modalidad) : null;

    // Gestión de reemplazo de imagen (Cloudinary o local)
    let nuevaImagenUrl = undefined;
    if (req.file && req.file.buffer) {
      if (inc.imagen_url) {
        try {
          await eliminarImagenCloudinary(inc.imagen_url);
        } catch (errDel) {
          logWarn("No se pudo eliminar la imagen anterior:", { error: errDel.message });
        }
      }
      try {
        nuevaImagenUrl = await subirImagenCloudinary(
          req.file.buffer,
          inc.codigoincidente || `INC-${incId}`,
          req.file.originalname
        );
      } catch (errSubir) {
        logError("Error al subir nueva imagen:", { error: errSubir.message });
      }
    }

    await IncidenteModel.actualizarDetalles({
      idIncidente: incId,
      fechaincidente,
      horaincidente,
      descripcionincidente,
      direccion,
      idGravedad: gravedadVal,
      idModalidad: modalidadVal,
      nuevaImagenUrl,
      idUsuarioEditor: idusuarioLogueado
    });

    await registrarLogActividad(
      idusuarioLogueado,
      'EDITAR_INCIDENTE',
      'incidente',
      incId,
      `Incidente ID ${incId} editado por ${req.session.usuario}${nuevaImagenUrl ? ' (foto actualizada)' : ''}`,
      req
    );

    res.json({ 
      mensaje: "Incidente actualizado exitosamente ✅",
      imagen_url: nuevaImagenUrl || inc.imagen_url
    });

  } catch (error) {
    logger.error("Error actualizando incidente:", error);
    res.status(500).json({ mensaje: "Error actualizando incidente" });
  }
};

const importarIncidentesMasivo = async (req, res) => {
  const idusuarioLogueado = req.session.idusuario;
  const userRol = req.session.rol || 'reportero';

  if (!idusuarioLogueado) {
    return res.status(401).json({ mensaje: "No autorizado 🚫" });
  }

  if (userRol === 'reportero') {
    return res.status(403).json({ mensaje: "Los reporteros solo pueden registrar incidentes individuales 🚫" });
  }

  if (!req.file) {
    return res.status(400).json({ mensaje: "No se subió ningún archivo CSV ⚠️" });
  }

  const results = [];
  const bufferStream = new stream.PassThrough();
  bufferStream.end(req.file.buffer);

  bufferStream
    .pipe(csv({ separator: ';' }))
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      let exitos = 0;
      let fallidos = 0;
      const idLote = Date.now().toString();

      let finalResults = results;
      if (results.length > 0 && Object.keys(results[0]).length === 1 && Object.keys(results[0])[0].includes(',')) {
        const bufferStream2 = new stream.PassThrough();
        bufferStream2.end(req.file.buffer);
        finalResults = [];
        await new Promise((resolve) => {
          bufferStream2.pipe(csv()).on('data', (data) => finalResults.push(data)).on('end', resolve);
        });
      }

      for (const row of finalResults) {
        const tipo = row.TIPO || row.tipo;
        const fecha = row.FECHA || row.fecha;
        const hora = row.HORA || row.hora;
        const lat = parseFloat(row.LATITUD || row.latitud || row.lat);
        const lng = parseFloat(row.LONGITUD || row.longitud || row.lng);
        const desc = row.DESCRIPCION || row.descripcion || '';
        const codigo = row.CODIGO || row.codigo || `INC-MAS-${Date.now().toString().slice(-4)}-${exitos + 1}`;

        if (!tipo || !fecha || !hora || isNaN(lat) || isNaN(lng)) {
          fallidos++;
          continue;
        }

        try {
          await IncidenteModel.insertarFilaMasiva({
            codigo,
            desc,
            tipo,
            fecha,
            hora,
            lng,
            lat,
            idUsuario: idusuarioLogueado,
            idLote
          });
          exitos++;
        } catch (err) {
          logError("Error insertando fila CSV:", { error: err.message });
          fallidos++;
        }
      }

      await registrarLogActividad(
        idusuarioLogueado,
        'IMPORTACION_MASIVA',
        'incidente',
        null,
        `Importación masiva completada (Lote ${idLote}): ${exitos} creados, ${fallidos} fallidos`,
        req
      );

      res.json({ 
        mensaje: "Proceso de importación masiva completado ✅", 
        exitos, 
        fallidos,
        id_lote: idLote 
      });
    });
};

const deshacerUltimaImportacion = async (req, res) => {
  const idusuarioLogueado = req.session.idusuario;
  const userRol = req.session.rol || 'reportero';

  if (!idusuarioLogueado) {
    return res.status(401).json({ mensaje: "No autorizado 🚫" });
  }

  if (userRol === 'reportero') {
    return res.status(403).json({ mensaje: "Acceso denegado 🚫" });
  }

  try {
    const resultLote = await IncidenteModel.obtenerUltimoLoteMasivo();

    if (resultLote.rows.length === 0) {
      return res.status(404).json({ mensaje: "No se encontraron importaciones masivas para deshacer." });
    }

    const ultimoLote = resultLote.rows[0].id_lote;

    const resultDelete = await IncidenteModel.eliminarPorLote(ultimoLote);

    await registrarLogActividad(
      idusuarioLogueado,
      'DESHACER_IMPORTACION',
      'incidente',
      null,
      `Importación deshecha del lote ${ultimoLote} (${resultDelete.rowCount} registros eliminados)`,
      req
    );

    res.json({ 
      mensaje: "Última importación deshecha correctamente ✅", 
      eliminados: resultDelete.rowCount 
    });
  } catch (error) {
    logger.error("Error deshaciendo importación:", error);
    res.status(500).json({ mensaje: "Error al deshacer importación" });
  }
};

// Tomar revisión de un incidente (Locking)
const tomarIncidente = async (req, res) => {
  const { id } = req.params;
  const idAdmin = req.session.idusuario;
  const nombreAdmin = req.session.usuario;

  if (!idAdmin) {
    return res.status(401).json({ mensaje: "No autorizado 🚫" });
  }

  try {
    const incId = parseInt(id);
    const result = await IncidenteModel.tomarIncidente(incId, idAdmin);

    if (result.rows.length === 0) {
      const checkRes = await IncidenteModel.obtenerAdminAsignado(incId);

      const adminAsignado = checkRes.rows.length > 0 ? (checkRes.rows[0].nombreusuario || 'otro administrador') : 'otro administrador';
      return res.status(409).json({
        mensaje: `No se pudo tomar el incidente. Ya fue asignado para revisión a ${adminAsignado}. 🔒`
      });
    }

    registrarLogActividad(idAdmin, 'TOMAR_REVISION', 'incidente', incId, `Tomó la revisión del incidente #${incId}`, req).catch(err => logger.error("Error en log:", err.message));

    res.json({
      mensaje: `Has tomado la revisión del incidente #${incId} ✅`,
      incidente: result.rows[0],
      admin_revisor_nombre: nombreAdmin
    });

  } catch (error) {
    logger.error("Error en tomarIncidente:", error);
    res.status(500).json({ mensaje: "Error en el servidor al tomar el incidente" });
  }
};

// Liberar revisión de un incidente (Devolver a la cola pública)
const liberarIncidente = async (req, res) => {
  const { id } = req.params;
  const idAdmin = req.session.idusuario;
  const rolAdmin = req.session.rol;

  if (!idAdmin) {
    return res.status(401).json({ mensaje: "No autorizado 🚫" });
  }

  try {
    const incId = parseInt(id);
    const result = await IncidenteModel.liberarIncidente(incId, idAdmin, rolAdmin);

    if (result.rows.length === 0) {
      return res.status(403).json({ mensaje: "No tienes permisos para liberar este incidente o ya no está asignado a ti ⛔" });
    }

    registrarLogActividad(idAdmin, 'LIBERAR_REVISION', 'incidente', incId, `Liberó el incidente #${incId} devolviéndolo a la cola pública`, req).catch(err => logger.error("Error en log:", err.message));

    res.json({ mensaje: `Incidente #${incId} devuelto a la cola pública de verificación ↩️` });

  } catch (error) {
    logger.error("Error en liberarIncidente:", error);
    res.status(500).json({ mensaje: "Error al liberar el incidente" });
  }
};

// Resolver / Aprobar incidente
const resolverIncidente = async (req, res) => {
  const { id } = req.params;
  const notas = (req.body && req.body.notas) ? req.body.notas : null;
  const idAdmin = req.session.idusuario;

  if (!idAdmin) {
    return res.status(401).json({ mensaje: "No autorizado 🚫" });
  }

  try {
    const incId = parseInt(id);
    const result = await IncidenteModel.resolverIncidente(incId, idAdmin, notas);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "Incidente no encontrado" });
    }

    registrarLogActividad(idAdmin, 'APROBAR_INCIDENTE', 'incidente', incId, `Aprobó y resolvió el incidente #${incId}`, req).catch(err => logger.error("Error en log:", err.message));

    res.json({ mensaje: `Incidente #${incId} verificado y aprobado exitosamente ✅` });

  } catch (error) {
    logger.error("Error en resolverIncidente:", error);
    res.status(500).json({ mensaje: "Error al resolver el incidente" });
  }
};

// Cerrar / Desestimar incidente (Rechazar con motivo)
const cerrarIncidente = async (req, res) => {
  const { id } = req.params;
  const motivo = (req.body && req.body.motivo) ? req.body.motivo : null;
  const idAdmin = req.session.idusuario;

  if (!idAdmin) {
    return res.status(401).json({ mensaje: "No autorizado 🚫" });
  }

  try {
    const incId = parseInt(id);
    const result = await IncidenteModel.cerrarIncidente(incId, idAdmin, motivo);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "Incidente no encontrado" });
    }

    registrarLogActividad(idAdmin, 'DESESTIMAR_INCIDENTE', 'incidente', incId, `Desestimó/cerró el incidente #${incId}`, req).catch(err => logger.error("Error en log:", err.message));

    res.json({ mensaje: `Incidente #${incId} desestimado / cerrado exitosamente ❌` });

  } catch (error) {
    logger.error("Error en cerrarIncidente:", error);
    res.status(500).json({ mensaje: "Error al cerrar el incidente" });
  }
};

module.exports = {
  registrarIncidente,
  obtenerIncidentes,
  obtenerMisReportes,
  obtenerPendientes,
  cambiarEstadoIncidente,
  eliminarIncidente,
  obtenerIncidente,
  actualizarIncidente,
  importarIncidentesMasivo,
  deshacerUltimaImportacion,
  tomarIncidente,
  liberarIncidente,
  resolverIncidente,
  cerrarIncidente,
  validarFechaHoraIncidente
};
