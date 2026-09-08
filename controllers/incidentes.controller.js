const pool = require('../db');
const csv = require('csv-parser');
const stream = require('stream');
const { registrarLogActividad } = require('../utils/logger');
const { subirImagenCloudinary } = require('../utils/cloudinary');

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

  const textoDescripcion = descripcionincidente || descripcion;

  if (!tipo || !fecha || !hora || lat === undefined || lng === undefined || !textoDescripcion) {
    return res.status(400).json({ mensaje: "Faltan campos obligatorios: tipo, fecha, hora, coordenadas y descripción ⚠️" });
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
        console.error("Error al subir foto de evidencia:", imgErr.message);
      }
    }

    // Auto-asociar barrio y vereda con PostGIS ST_Contains
    let idbarrio = null;
    let idvereda = null;

    try {
      const barrioRes = await pool.query(
        "SELECT gid FROM barrio WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)) LIMIT 1",
        [lngNum, latNum]
      );
      if (barrioRes.rows.length > 0) idbarrio = barrioRes.rows[0].gid;

      const veredaRes = await pool.query(
        "SELECT id FROM vereda WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)) LIMIT 1",
        [lngNum, latNum]
      );
      if (veredaRes.rows.length > 0) idvereda = veredaRes.rows[0].id;
    } catch (spatialErr) {
      console.warn("Advertencia en consulta espacial PostGIS:", spatialErr.message);
    }

    const idEstado = 1; // 1 = Reportado
    const parsedGravedad = parseInt(id_gravedad);
    const idGravedad = (!isNaN(parsedGravedad) && parsedGravedad > 0) ? parsedGravedad : 3;

    const parsedModalidad = parseInt(id_modalidad);
    const idModalidad = (!isNaN(parsedModalidad) && parsedModalidad > 0) ? parsedModalidad : null;

    const result = await pool.query(`
      INSERT INTO incidente
      (
        codigoincidente, idtipoincidente, fechaincidente, horaincidente, descripcionincidente,
        geom, idusuario, id_usuario_creador, id_estado, id_gravedad, id_modalidad, idbarrio, idvereda,
        direccion, comentarios_adicionales, numero_victimas, numero_vehiculos_afectados, valor_perdidas,
        requiere_ambulancia, requiere_policia, requiere_bomberos, origen, imagen_url
      )
      VALUES (
        $1, $2, $3, $4, $5,
        ST_SetSRID(ST_MakePoint($6, $7), 4326),
        $8, $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18,
        $19, $20, $21, 'manual', $22
      )
      RETURNING idincidente, codigoincidente, fechaincidente, horaincidente, imagen_url
    `, [
      codigoincidente, parseInt(tipo), fecha, hora, textoDescripcion,
      lngNum, latNum,
      idusuarioLogueado, idEstado, idGravedad, idModalidad, idbarrio, idvereda,
      direccion || null, comentarios_adicionales || null,
      numero_victimas ? parseInt(numero_victimas) : 1,
      numero_vehiculos_afectados ? parseInt(numero_vehiculos_afectados) : 0,
      valor_perdidas ? parseFloat(valor_perdidas) : null,
      requiere_ambulancia === true || requiere_ambulancia === 'true',
      requiere_policia === undefined ? true : (requiere_policia === true || requiere_policia === 'true'),
      requiere_bomberos === true || requiere_bomberos === 'true',
      imagenUrl
    ]);

    const nuevoIncidente = result.rows[0];

    // Asignar factores si vienen especificados
    if (Array.isArray(factores) && factores.length > 0) {
      for (const factorId of factores) {
        await pool.query(
          "INSERT INTO incidente_factores (id_incidente, id_factor) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [nuevoIncidente.idincidente, parseInt(factorId)]
        );
      }
    }

    // Registrar en auditoría
    await registrarLogActividad(
      idusuarioLogueado,
      'CREAR_INCIDENTE',
      'incidente',
      nuevoIncidente.idincidente,
      `Incidente ${nuevoIncidente.codigoincidente} creado en estado Reportado`,
      req
    );

    // Crear notificación para Administradores
    await pool.query(`
      INSERT INTO notificaciones (id_usuario, tipo, asunto, mensaje)
      SELECT idusuario, 'alerta', 'Nuevo reporte de incidente', $1
      FROM usuario WHERE rol IN ('admin', 'superadmin')
    `, [`Nuevo incidente ${nuevoIncidente.codigoincidente} reportado en espera de revisión.`]);

    res.status(201).json({
      mensaje: "Incidente registrado exitosamente ✅",
      incidente: nuevoIncidente
    });

  } catch (error) {
    console.error("Error al registrar incidente:", error);
    res.status(500).json({ mensaje: "Error en el servidor al registrar incidente" });
  }
};

// Obtener incidentes con filtros y JOINs explicativos
const obtenerIncidentes = async (req, res) => {
  try {
    const { estado, gravedad, tipo, barrio, vereda, fecha_inicio, fecha_fin, mis_reportes } = req.query;

    let query = `
      SELECT 
        i.idincidente,
        i.codigoincidente,
        i.descripcionincidente,
        i.fechaincidente,
        i.horaincidente,
        i.fecharegistro,
        i.origen,
        i.direccion,
        i.numero_victimas,
        i.numero_vehiculos_afectados,
        i.valor_perdidas,
        i.requiere_ambulancia,
        i.requiere_policia,
        i.requiere_bomberos,
        ST_Y(i.geom) as lat,
        ST_X(i.geom) as lng,
        i.idtipoincidente,
        ti.nametipoincidente as tipo_nombre,
        i.id_estado,
        ei.nombre as estado_nombre,
        ei.color as estado_color,
        ei.orden as estado_orden,
        i.id_gravedad,
        gi.nombre as gravedad_nombre,
        gi.color as gravedad_color,
        gi.nivel as gravedad_nivel,
        i.id_modalidad,
        mi.nombre as modalidad_nombre,
        i.idbarrio,
        b.namebarrio as barrio_nombre,
        i.idvereda,
        i.id_usuario_creador,
        u.nombreusuario as creador_nombre,
        i.imagen_url
      FROM incidente i
      LEFT JOIN tipo_incidente ti ON i.idtipoincidente = ti.idtipoincidente
      LEFT JOIN estado_incidente ei ON i.id_estado = ei.id_estado
      LEFT JOIN gravedad_incidente gi ON i.id_gravedad = gi.id_gravedad
      LEFT JOIN modalidad_incidente mi ON i.id_modalidad = mi.id_modalidad
      LEFT JOIN barrio b ON i.idbarrio = b.gid
      LEFT JOIN vereda v ON i.idvereda = v.id
      LEFT JOIN usuario u ON i.id_usuario_creador = u.idusuario
      WHERE 1=1
    `;

    const params = [];
    let paramIdx = 1;

    if (mis_reportes === 'true' && req.session.idusuario) {
      query += ` AND (i.id_usuario_creador = $${paramIdx} OR i.idusuario = $${paramIdx})`;
      params.push(req.session.idusuario);
      paramIdx++;
    }

    if (estado) {
      query += ` AND i.id_estado = $${paramIdx}`;
      params.push(parseInt(estado));
      paramIdx++;
    }
    if (gravedad) {
      query += ` AND i.id_gravedad = $${paramIdx}`;
      params.push(parseInt(gravedad));
      paramIdx++;
    }
    if (tipo) {
      query += ` AND i.idtipoincidente = $${paramIdx}`;
      params.push(parseInt(tipo));
      paramIdx++;
    }
    if (barrio) {
      query += ` AND i.idbarrio = $${paramIdx}`;
      params.push(parseInt(barrio));
      paramIdx++;
    }
    if (vereda) {
      query += ` AND i.idvereda = $${paramIdx}`;
      params.push(parseInt(vereda));
      paramIdx++;
    }
    if (fecha_inicio) {
      query += ` AND i.fechaincidente >= $${paramIdx}`;
      params.push(fecha_inicio);
      paramIdx++;
    }
    if (fecha_fin) {
      query += ` AND i.fechaincidente <= $${paramIdx}`;
      params.push(fecha_fin);
      paramIdx++;
    }

    query += ` ORDER BY i.fechaincidente DESC, i.horaincidente DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener incidentes:", error);
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
    const result = await pool.query(`
      SELECT 
        i.idincidente,
        i.codigoincidente,
        i.descripcionincidente,
        i.fechaincidente,
        i.horaincidente,
        i.fecharegistro,
        i.imagen_url,
        ST_Y(i.geom) as lat,
        ST_X(i.geom) as lng,
        ti.nametipoincidente as tipo_nombre,
        ei.nombre as estado_nombre,
        ei.color as estado_color,
        gi.nombre as gravedad_nombre,
        gi.color as gravedad_color,
        b.namebarrio as barrio_nombre,
        v.nombre as vereda_nombre
      FROM incidente i
      LEFT JOIN tipo_incidente ti ON i.idtipoincidente = ti.idtipoincidente
      LEFT JOIN estado_incidente ei ON i.id_estado = ei.id_estado
      LEFT JOIN gravedad_incidente gi ON i.id_gravedad = gi.id_gravedad
      LEFT JOIN barrio b ON i.idbarrio = b.gid
      LEFT JOIN vereda v ON i.idvereda = v.id
      WHERE i.id_usuario_creador = $1 OR i.idusuario = $1
      ORDER BY i.fechaincidente DESC, i.horaincidente DESC
    `, [idusuarioLogueado]);

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener mis reportes:", error);
    res.status(500).json({ mensaje: "Error en servidor" });
  }
};

// Obtener incidentes pendientes de revisión (Admin y Superadmin)
const obtenerPendientes = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        i.idincidente,
        i.codigoincidente,
        i.descripcionincidente,
        i.fechaincidente,
        i.horaincidente,
        i.fecharegistro,
        ST_Y(i.geom) as lat,
        ST_X(i.geom) as lng,
        ti.nametipoincidente as tipo_nombre,
        ei.nombre as estado_nombre,
        ei.color as estado_color,
        gi.nombre as gravedad_nombre,
        b.namebarrio as barrio_nombre,
        v.nombre as vereda_nombre,
        u.nombreusuario as reportero_nombre
      FROM incidente i
      LEFT JOIN tipo_incidente ti ON i.idtipoincidente = ti.idtipoincidente
      LEFT JOIN estado_incidente ei ON i.id_estado = ei.id_estado
      LEFT JOIN gravedad_incidente gi ON i.id_gravedad = gi.id_gravedad
      LEFT JOIN barrio b ON i.idbarrio = b.gid
      LEFT JOIN vereda v ON i.idvereda = v.id
      LEFT JOIN usuario u ON i.id_usuario_creador = u.idusuario
      WHERE i.id_estado IN (1, 2)
      ORDER BY i.fecharegistro ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener incidentes pendientes:", error);
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
    const incCheck = await pool.query(
      "SELECT idincidente, codigoincidente, id_usuario_creador FROM incidente WHERE idincidente = $1",
      [parseInt(id)]
    );

    if (incCheck.rows.length === 0) {
      return res.status(404).json({ mensaje: "Incidente no encontrado ❌" });
    }

    const incidente = incCheck.rows[0];
    const estadoVal = parseInt(id_estado);
    const gravedadVal = id_gravedad ? parseInt(id_gravedad) : null;
    const modalidadVal = id_modalidad ? parseInt(id_modalidad) : null;

    const result = await pool.query(`
      UPDATE incidente SET
        id_estado = $1,
        id_gravedad = COALESCE($2, id_gravedad),
        id_modalidad = COALESCE($3, id_modalidad),
        comentarios_adicionales = COALESCE($4, comentarios_adicionales),
        id_usuario_editor = $5,
        fecha_edicion = CURRENT_TIMESTAMP
      WHERE idincidente = $6
      RETURNING idincidente, codigoincidente, id_estado, id_gravedad
    `, [estadoVal, gravedadVal, modalidadVal, comentarios_adicionales || null, req.session.idusuario, parseInt(id)]);

    const estadoNombreRes = await pool.query("SELECT nombre FROM estado_incidente WHERE id_estado = $1", [estadoVal]);
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
      await pool.query(`
        INSERT INTO notificaciones (id_usuario, tipo, asunto, mensaje)
        VALUES ($1, 'alerta', 'Actualización de Reporte', $2)
      `, [
        incidente.id_usuario_creador,
        `Tu reporte ${incidente.codigoincidente || id} ha sido actualizado a estado: "${estadoNombre}".`
      ]);
    }

    res.json({
      mensaje: `Estado actualizado a "${estadoNombre}" exitosamente ✅`,
      incidente: result.rows[0]
    });

  } catch (error) {
    console.error("Error al cambiar estado del incidente:", error);
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
    const checkOwner = await pool.query("SELECT idusuario, id_usuario_creador FROM incidente WHERE idincidente = $1", [incId]);
    if (checkOwner.rows.length === 0) {
      return res.status(404).json({ mensaje: "Incidente no encontrado ❌" });
    }

    const creadorId = checkOwner.rows[0].id_usuario_creador || checkOwner.rows[0].idusuario;

    if (userRol !== 'superadmin' && userRol !== 'admin' && creadorId !== idusuarioLogueado) {
      return res.status(403).json({ mensaje: "No tienes permiso para eliminar este incidente 🚫" });
    }

    await pool.query("DELETE FROM incidente WHERE idincidente = $1", [incId]);

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
    console.error("Error al eliminar incidente:", error);
    res.status(500).json({ mensaje: "Error al eliminar incidente" });
  }
};

const obtenerIncidente = async (req, res) => {
  try {
    const incId = parseInt(req.params.id);
    const result = await pool.query(`
      SELECT 
        i.*,
        ST_Y(i.geom) as lat,
        ST_X(i.geom) as lng,
        ti.nametipoincidente as tipo_nombre,
        ei.nombre as estado_nombre,
        ei.color as estado_color,
        gi.nombre as gravedad_nombre,
        gi.color as gravedad_color,
        mi.nombre as modalidad_nombre,
        b.namebarrio as barrio_nombre,
        v.nombre as vereda_nombre
      FROM incidente i
      LEFT JOIN tipo_incidente ti ON i.idtipoincidente = ti.idtipoincidente
      LEFT JOIN estado_incidente ei ON i.id_estado = ei.id_estado
      LEFT JOIN gravedad_incidente gi ON i.id_gravedad = gi.id_gravedad
      LEFT JOIN modalidad_incidente mi ON i.id_modalidad = mi.id_modalidad
      LEFT JOIN barrio b ON i.idbarrio = b.gid
      LEFT JOIN vereda v ON i.idvereda = v.id
      WHERE i.idincidente = $1
    `, [incId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "Incidente no encontrado ❌" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener incidente:", error);
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
    const checkOwner = await pool.query("SELECT idusuario, id_usuario_creador, id_estado FROM incidente WHERE idincidente = $1", [incId]);
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

    const gravedadVal = id_gravedad ? parseInt(id_gravedad) : null;
    const modalidadVal = id_modalidad ? parseInt(id_modalidad) : null;

    await pool.query(`
      UPDATE incidente SET
        fechaincidente = COALESCE($1, fechaincidente),
        horaincidente = COALESCE($2, horaincidente),
        descripcionincidente = COALESCE($3, descripcionincidente),
        direccion = COALESCE($4, direccion),
        id_gravedad = COALESCE($5, id_gravedad),
        id_modalidad = COALESCE($6, id_modalidad),
        id_usuario_editor = $7,
        fecha_edicion = CURRENT_TIMESTAMP
      WHERE idincidente = $8
    `, [fechaincidente || null, horaincidente || null, descripcionincidente || null, direccion || null, gravedadVal, modalidadVal, idusuarioLogueado, incId]);

    await registrarLogActividad(
      idusuarioLogueado,
      'EDITAR_INCIDENTE',
      'incidente',
      incId,
      `Incidente ID ${incId} editado por ${req.session.usuario}`,
      req
    );

    res.json({ mensaje: "Incidente actualizado exitosamente ✅" });

  } catch (error) {
    console.error("Error actualizando incidente:", error);
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
          await pool.query(`
            INSERT INTO incidente
            (
              codigoincidente, descripcionincidente, idtipoincidente, fechaincidente, horaincidente,
              geom, idusuario, id_usuario_creador, id_estado, id_gravedad, origen, id_lote
            )
            VALUES (
              $1, $2, $3, $4, $5,
              ST_SetSRID(ST_MakePoint($6, $7), 4326),
              $8, $8, 1, 3, 'masivo', $9
            )
          `, [codigo, desc, parseInt(tipo), fecha, hora, lng, lat, idusuarioLogueado, idLote]);
          exitos++;
        } catch (err) {
          console.error("Error insertando fila CSV:", err);
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
    const resultLote = await pool.query(
      `SELECT id_lote FROM incidente 
       WHERE origen = 'masivo' AND id_lote IS NOT NULL
       ORDER BY fecharegistro DESC LIMIT 1`
    );

    if (resultLote.rows.length === 0) {
      return res.status(404).json({ mensaje: "No se encontraron importaciones masivas para deshacer." });
    }

    const ultimoLote = resultLote.rows[0].id_lote;

    const resultDelete = await pool.query(
      "DELETE FROM incidente WHERE id_lote = $1",
      [ultimoLote]
    );

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
    console.error("Error deshaciendo importación:", error);
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
    // Intentar tomar el incidente si no está tomado por otro admin o si ya estaba tomado por el mismo admin
    const result = await pool.query(`
      UPDATE incidente
      SET id_admin_revisor = $1,
          id_estado = 2, -- 2 = En evaluación
          fecha_toma_revision = CURRENT_TIMESTAMP
      WHERE idincidente = $2
        AND (id_admin_revisor IS NULL OR id_admin_revisor = $1 OR id_estado = 1)
      RETURNING idincidente, codigoincidente, id_estado, id_admin_revisor;
    `, [idAdmin, incId]);

    if (result.rows.length === 0) {
      const checkRes = await pool.query(`
        SELECT i.idincidente, u.nombreusuario 
        FROM incidente i 
        LEFT JOIN usuario u ON i.id_admin_revisor = u.idusuario 
        WHERE i.idincidente = $1
      `, [incId]);

      const adminAsignado = checkRes.rows.length > 0 ? (checkRes.rows[0].nombreusuario || 'otro administrador') : 'otro administrador';
      return res.status(409).json({
        mensaje: `No se pudo tomar el incidente. Ya fue asignado para revisión a ${adminAsignado}. 🔒`
      });
    }

    // Registrar log en segundo plano sin retrasar la respuesta al usuario
    registrarLogActividad(idAdmin, 'TOMAR_REVISION', 'incidente', incId, `Tomó la revisión del incidente #${incId}`, req).catch(err => console.error("Error en log:", err.message));

    res.json({
      mensaje: `Has tomado la revisión del incidente #${incId} ✅`,
      incidente: result.rows[0],
      admin_revisor_nombre: nombreAdmin
    });

  } catch (error) {
    console.error("Error en tomarIncidente:", error);
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
    let query = `
      UPDATE incidente
      SET id_admin_revisor = NULL,
          id_estado = 1, -- 1 = Reportado / Pendiente
          fecha_toma_revision = NULL
      WHERE idincidente = $1
    `;
    const params = [incId];

    if (rolAdmin !== 'superadmin') {
      query += ` AND id_admin_revisor = $2`;
      params.push(idAdmin);
    }

    query += ` RETURNING idincidente;`;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(403).json({ mensaje: "No tienes permisos para liberar este incidente o ya no está asignado a ti ⛔" });
    }

    // Registrar log en segundo plano
    registrarLogActividad(idAdmin, 'LIBERAR_REVISION', 'incidente', incId, `Liberó el incidente #${incId} devolviéndolo a la cola pública`, req).catch(err => console.error("Error en log:", err.message));

    res.json({ mensaje: `Incidente #${incId} devuelto a la cola pública de verificación ↩️` });

  } catch (error) {
    console.error("Error en liberarIncidente:", error);
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
    const result = await pool.query(`
      UPDATE incidente
      SET id_estado = 5, -- 5 = Resuelto / Aprobado
          id_usuario_editor = $1,
          fecha_edicion = CURRENT_TIMESTAMP,
          comentarios_adicionales = COALESCE($2, comentarios_adicionales)
      WHERE idincidente = $3
      RETURNING idincidente, id_estado;
    `, [idAdmin, notas, incId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "Incidente no encontrado" });
    }

    // Registrar log en segundo plano
    registrarLogActividad(idAdmin, 'APROBAR_INCIDENTE', 'incidente', incId, `Aprobó y resolvió el incidente #${incId}`, req).catch(err => console.error("Error en log:", err.message));

    res.json({ mensaje: `Incidente #${incId} verificado y aprobado exitosamente ✅` });

  } catch (error) {
    console.error("Error en resolverIncidente:", error);
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
    const result = await pool.query(`
      UPDATE incidente
      SET id_estado = 6, -- 6 = Cerrado sin resolver / Desestimado
          id_usuario_editor = $1,
          fecha_edicion = CURRENT_TIMESTAMP,
          comentarios_adicionales = COALESCE($2, comentarios_adicionales)
      WHERE idincidente = $3
      RETURNING idincidente, id_estado;
    `, [idAdmin, motivo ? `[DESESTIMADO]: ${motivo}` : null, incId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "Incidente no encontrado" });
    }

    // Registrar log en segundo plano
    registrarLogActividad(idAdmin, 'DESESTIMAR_INCIDENTE', 'incidente', incId, `Desestimó/cerró el incidente #${incId}`, req).catch(err => console.error("Error en log:", err.message));

    res.json({ mensaje: `Incidente #${incId} desestimado / cerrado exitosamente ❌` });

  } catch (error) {
    console.error("Error en cerrarIncidente:", error);
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
  cerrarIncidente
};
