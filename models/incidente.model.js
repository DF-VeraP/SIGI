const pool = require('../db');

/**
 * Modelo de Incidentes (Incidente Model)
 * Encapsula la persistencia, consultas geoespaciales, filtros, paginación y cola de revisión.
 */
class IncidenteModel {
  /**
   * Buscar IDs de barrio y vereda por contención PostGIS ST_Contains
   * (El id_cuadrante se asigna automáticamente mediante el trigger espacial trg_asignar_cuadrante_incidente en PostGIS)
   */
  static async resolverUbicacionEspacial(lng, lat) {
    let idbarrio = null;
    let idvereda = null;

    try {
      const barrioRes = await pool.query(
        "SELECT gid FROM barrio WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)) LIMIT 1",
        [lng, lat]
      );
      if (barrioRes.rows.length > 0) idbarrio = barrioRes.rows[0].gid;

      const veredaRes = await pool.query(
        "SELECT id FROM vereda WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)) LIMIT 1",
        [lng, lat]
      );
      if (veredaRes.rows.length > 0) idvereda = veredaRes.rows[0].id;
    } catch (err) {
      console.warn("Advertencia al resolver ubicación espacial:", err.message);
    }

    return { idbarrio, idvereda };
  }

  /**
   * Insertar un nuevo incidente
   */
  static async crear({
    codigoincidente,
    tipo,
    fecha,
    hora,
    descripcion,
    lng,
    lat,
    idUsuario,
    idEstado,
    adminRevisor,
    idGravedad,
    idModalidad,
    idbarrio,
    idvereda,
    direccion,
    comentarios,
    victimas,
    vehiculos,
    perdidas,
    ambulancia,
    policia,
    bomberos,
    imagenUrl
  }) {
    return pool.query(`
      INSERT INTO incidente
      (
        codigoincidente, idtipoincidente, fechaincidente, horaincidente, descripcionincidente,
        geom, idusuario, id_usuario_creador, id_estado, id_admin_revisor, id_gravedad, id_modalidad, idbarrio, idvereda,
        direccion, comentarios_adicionales, numero_victimas, numero_vehiculos_afectados, valor_perdidas,
        requiere_ambulancia, requiere_policia, requiere_bomberos, origen, imagen_url
      )
      VALUES (
        $1, $2, $3, $4, $5,
        ST_SetSRID(ST_MakePoint($6, $7), 4326),
        $8, $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19,
        $20, $21, $22, 'manual', $23
      )
      RETURNING idincidente, codigoincidente, fechaincidente, horaincidente, imagen_url
    `, [
      codigoincidente, tipo, fecha, hora, descripcion,
      lng, lat,
      idUsuario, idEstado, adminRevisor, idGravedad, idModalidad, idbarrio, idvereda,
      direccion, comentarios, victimas, vehiculos, perdidas,
      ambulancia, policia, bomberos, imagenUrl
    ]);
  }

  /**
   * Asociar factores de riesgo a un incidente
   */
  static async asociarFactores(idIncidente, factores) {
    if (!Array.isArray(factores) || factores.length === 0) return;
    for (const factorId of factores) {
      await pool.query(
        "INSERT INTO incidente_factores (id_incidente, id_factor) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [idIncidente, parseInt(factorId)]
      );
    }
  }

  /**
   * Crear notificación para administradores
   */
  static async notificarAdmins(mensaje) {
    return pool.query(`
      INSERT INTO notificaciones (id_usuario, tipo, asunto, mensaje)
      SELECT idusuario, 'alerta', 'Nuevo reporte de incidente', $1
      FROM usuario WHERE rol IN ('admin', 'superadmin')
    `, [mensaje]);
  }

  /**
   * Obtener incidentes con filtros dinámicos y soporte opcional de paginación
   */
  static async obtenerTodosConFiltros(filtros, paginacion = {}) {
    const { estado, gravedad, tipo, barrio, vereda, fecha_inicio, fecha_fin, mis_reportes, idUsuario } = filtros;
    const { page, limit } = paginacion;

    let baseQuery = `
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

    if (mis_reportes === 'true' && idUsuario) {
      baseQuery += ` AND (i.id_usuario_creador = $${paramIdx} OR i.idusuario = $${paramIdx})`;
      params.push(idUsuario);
      paramIdx++;
    }

    if (estado) {
      baseQuery += ` AND i.id_estado = $${paramIdx}`;
      params.push(parseInt(estado));
      paramIdx++;
    }
    if (gravedad) {
      baseQuery += ` AND i.id_gravedad = $${paramIdx}`;
      params.push(parseInt(gravedad));
      paramIdx++;
    }
    if (tipo) {
      baseQuery += ` AND i.idtipoincidente = $${paramIdx}`;
      params.push(parseInt(tipo));
      paramIdx++;
    }
    if (barrio) {
      baseQuery += ` AND i.idbarrio = $${paramIdx}`;
      params.push(parseInt(barrio));
      paramIdx++;
    }
    if (vereda) {
      baseQuery += ` AND i.idvereda = $${paramIdx}`;
      params.push(parseInt(vereda));
      paramIdx++;
    }
    if (fecha_inicio) {
      baseQuery += ` AND i.fechaincidente >= $${paramIdx}`;
      params.push(fecha_inicio);
      paramIdx++;
    }
    if (fecha_fin) {
      baseQuery += ` AND i.fechaincidente <= $${paramIdx}`;
      params.push(fecha_fin);
      paramIdx++;
    }

    // Si se solicitó paginación explícita
    let total = null;
    if (page && limit) {
      const countRes = await pool.query(`SELECT COUNT(*) AS total ${baseQuery}`, params);
      total = parseInt(countRes.rows[0]?.total || 0);
    }

    let selectQuery = `
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
        COALESCE(ti.color, '#3b82f6') as tipo_color,
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
      ${baseQuery}
      ORDER BY i.fechaincidente DESC, i.horaincidente DESC
    `;

    if (page && limit) {
      const offset = (parseInt(page) - 1) * parseInt(limit);
      selectQuery += ` LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
      params.push(parseInt(limit), offset);
    } else if (limit) {
      selectQuery += ` LIMIT $${paramIdx}`;
      params.push(parseInt(limit));
    }

    const result = await pool.query(selectQuery, params);

    return {
      rows: result.rows,
      total: total !== null ? total : result.rows.length
    };
  }

  /**
   * Obtener un incidente por ID con sus relaciones
   */
  static async obtenerPorId(id) {
    return pool.query(`
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
    `, [id]);
  }

  /**
   * Obtener reportes propios del usuario
   */
  static async obtenerMisReportes(idUsuario) {
    return pool.query(`
      SELECT 
        i.idincidente,
        i.codigoincidente,
        i.descripcionincidente,
        i.fechaincidente,
        i.horaincidente,
        i.fecharegistro,
        i.imagen_url,
        i.id_estado,
        i.id_gravedad,
        i.id_modalidad,
        i.direccion,
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
    `, [idUsuario]);
  }

  /**
   * Obtener cola de incidentes pendientes de revisión
   */
  static async obtenerPendientes() {
    return pool.query(`
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
  }

  /**
   * Cambiar estado general de un incidente
   */
  static async cambiarEstado(idIncidente, idEstado, idAdminRevisor, comentarios = null) {
    return pool.query(`
      UPDATE incidente
      SET 
        id_estado = $1,
        id_admin_revisor = $2,
        fecha_evaluacion = CURRENT_TIMESTAMP,
        comentarios_adicionales = COALESCE($3, comentarios_adicionales)
      WHERE idincidente = $4
      RETURNING idincidente, codigoincidente, id_estado, id_admin_revisor
    `, [idEstado, idAdminRevisor, comentarios, idIncidente]);
  }

  /**
   * Tomar incidente en cola compartida (pasa a Estado 2: En revisión)
   */
  static async tomarIncidente(idIncidente, idAdmin) {
    return pool.query(`
      UPDATE incidente
      SET id_estado = 2,
          id_admin_revisor = $1,
          fecha_evaluacion = CURRENT_TIMESTAMP
      WHERE idincidente = $2 
        AND (id_admin_revisor IS NULL OR id_admin_revisor = $1 OR id_estado = 1)
      RETURNING idincidente, id_estado, id_admin_revisor;
    `, [idAdmin, idIncidente]);
  }

  /**
   * Liberar incidente en cola compartida (regresa a Estado 1: Reportado)
   */
  static async liberarIncidente(idIncidente, idAdmin, rolAdmin = null) {
    return pool.query(`
      UPDATE incidente
      SET id_estado = 1,
          id_admin_revisor = NULL
      WHERE idincidente = $1
        AND (id_admin_revisor = $2 OR $3 = 'superadmin')
      RETURNING idincidente, id_estado;
    `, [idIncidente, idAdmin, rolAdmin]);
  }

  /**
   * Resolver incidente (pasa a Estado 5: Resuelto/Aprobado)
   */
  static async resolverIncidente(idIncidente, idAdmin, comentarios = null) {
    return pool.query(`
      UPDATE incidente
      SET id_estado = 5,
          id_admin_revisor = $1,
          fecha_resolucion = CURRENT_TIMESTAMP,
          comentarios_adicionales = COALESCE($2, comentarios_adicionales)
      WHERE idincidente = $3
      RETURNING idincidente, id_estado;
    `, [idAdmin, comentarios, idIncidente]);
  }

  /**
   * Desestimar / Cerrar incidente (pasa a Estado 6: Cerrado/Desestimado)
   */
  static async cerrarIncidente(idIncidente, idAdmin, motivo = null) {
    return pool.query(`
      UPDATE incidente
      SET id_estado = 6,
          id_usuario_editor = $1,
          fecha_edicion = CURRENT_TIMESTAMP,
          comentarios_adicionales = COALESCE($2, comentarios_adicionales)
      WHERE idincidente = $3
      RETURNING idincidente, id_estado;
    `, [idAdmin, motivo ? `[DESESTIMADO]: ${motivo}` : null, idIncidente]);
  }

  /**
   * Eliminar un incidente por ID
   */
  static async eliminar(idIncidente) {
    return pool.query("DELETE FROM incidente WHERE idincidente = $1", [idIncidente]);
  }

  /**
   * Obtener creador, estado y metadatos básicos de un incidente
   */
  static async obtenerCreadorYEstado(idIncidente) {
    return pool.query(
      "SELECT idincidente, codigoincidente, idusuario, id_usuario_creador, id_estado, imagen_url FROM incidente WHERE idincidente = $1",
      [idIncidente]
    );
  }

  /**
   * Actualizar estado y clasificación de un incidente
   */
  static async actualizarEstado({ idIncidente, idEstado, idGravedad, idModalidad, comentariosAdicionales, idUsuarioEditor }) {
    return pool.query(`
      UPDATE incidente SET
        id_estado = $1,
        id_gravedad = COALESCE($2, id_gravedad),
        id_modalidad = COALESCE($3, id_modalidad),
        comentarios_adicionales = COALESCE($4, comentarios_adicionales),
        id_usuario_editor = $5,
        fecha_edicion = CURRENT_TIMESTAMP
      WHERE idincidente = $6
      RETURNING idincidente, codigoincidente, id_estado, id_gravedad
    `, [idEstado, idGravedad, idModalidad, comentariosAdicionales || null, idUsuarioEditor, idIncidente]);
  }

  /**
   * Consultar nombre de un estado de incidente
   */
  static async obtenerNombreEstado(idEstado) {
    return pool.query("SELECT nombre FROM estado_incidente WHERE id_estado = $1", [idEstado]);
  }

  /**
   * Crear notificación para el usuario creador
   */
  static async crearNotificacion({ idUsuario, tipo = 'alerta', asunto, mensaje }) {
    return pool.query(`
      INSERT INTO notificaciones (id_usuario, tipo, asunto, mensaje)
      VALUES ($1, $2, $3, $4)
    `, [idUsuario, tipo, asunto, mensaje]);
  }

  /**
   * Actualizar detalles y campos editables de un incidente
   */
  static async actualizarDetalles({ idIncidente, fechaincidente, horaincidente, descripcionincidente, direccion, idGravedad, idModalidad, nuevaImagenUrl, idUsuarioEditor }) {
    return pool.query(`
      UPDATE incidente SET
        fechaincidente = COALESCE($1, fechaincidente),
        horaincidente = COALESCE($2, horaincidente),
        descripcionincidente = COALESCE($3, descripcionincidente),
        direccion = COALESCE($4, direccion),
        id_gravedad = COALESCE($5, id_gravedad),
        id_modalidad = COALESCE($6, id_modalidad),
        imagen_url = COALESCE($7, imagen_url),
        id_usuario_editor = $8,
        fecha_edicion = CURRENT_TIMESTAMP
      WHERE idincidente = $9
    `, [
      fechaincidente || null,
      horaincidente || null,
      descripcionincidente !== undefined ? descripcionincidente : null,
      direccion || null,
      idGravedad,
      idModalidad,
      nuevaImagenUrl !== undefined ? nuevaImagenUrl : null,
      idUsuarioEditor,
      idIncidente
    ]);
  }

  /**
   * Insertar registro individual durante importación masiva CSV
   */
  static async insertarFilaMasiva({ codigo, desc, tipo, fecha, hora, lng, lat, idUsuario, idLote }) {
    return pool.query(`
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
    `, [codigo, desc, parseInt(tipo), fecha, hora, lng, lat, idUsuario, idLote]);
  }

  /**
   * Obtener el id_lote de la importación masiva más reciente
   */
  static async obtenerUltimoLoteMasivo() {
    return pool.query(
      `SELECT id_lote FROM incidente 
       WHERE origen = 'masivo' AND id_lote IS NOT NULL
       ORDER BY fecharegistro DESC LIMIT 1`
    );
  }

  /**
   * Eliminar todos los incidentes asociados a un id_lote
   */
  static async eliminarPorLote(idLote) {
    return pool.query("DELETE FROM incidente WHERE id_lote = $1", [idLote]);
  }

  /**
   * Consultar puntos geográficos para algoritmo de clustering DBSCAN (Hotspots)
   */
  static async obtenerPuntosParaHotspots(idTipo = null) {
    let query = `
      SELECT 
        i.idincidente as id,
        ST_Y(i.geom) as lat,
        ST_X(i.geom) as lng,
        i.idtipoincidente,
        ti.nametipoincidente as tipo_nombre,
        i.fechaincidente,
        i.horaincidente,
        COALESCE(i.id_gravedad, 3) as gravedad
      FROM incidente i
      LEFT JOIN tipo_incidente ti ON i.idtipoincidente = ti.idtipoincidente
      WHERE i.geom IS NOT NULL
    `;
    const params = [];

    if (idTipo) {
      params.push(idTipo);
      query += ` AND i.idtipoincidente = $${params.length}`;
    }

    query += ` ORDER BY i.fechaincidente DESC LIMIT 2000`;
    return pool.query(query, params);
  }

  /**
   * Contar incidentes con descripción válida para calibración de Machine Learning
   */
  static async contarConDescripcionValida() {
    return pool.query(`
      SELECT COUNT(*) as count 
      FROM incidente 
      WHERE descripcionincidente IS NOT NULL AND LENGTH(descripcionincidente) > 10
    `);
  }

  /**
   * Extraer descripciones de incidentes aprobados/validados para reentrenamiento supervisado en memoria
   */
  static async obtenerMuestrasEntrenamientoML(limite = 1000) {
    const res = await pool.query(`
      SELECT idincidente, idtipoincidente, descripcionincidente, horaincidente, id_gravedad, id_estado
      FROM incidente
      WHERE descripcionincidente IS NOT NULL
        AND LENGTH(TRIM(descripcionincidente)) > 10
      ORDER BY CASE WHEN id_estado = 5 THEN 0 ELSE 1 END, fechaincidente DESC
      LIMIT $1
    `, [limite]);
    return (res && Array.isArray(res.rows)) ? res.rows : [];
  }

  /**
   * Consultar incidentes en formato tabla para un usuario específico
   */
  static async obtenerIncidentesTablaUsuario(nombreUsuario) {
    const query = `
      SELECT 
        i.idincidente,
        i.idtipoincidente,
        i.codigoincidente,
        ST_Y(i.geom) AS lat,
        ST_X(i.geom) AS lng,
        i.descripcionincidente,
        tp.nametipoincidente,
        i.fechaincidente,
        i.horaincidente,
        b.namebarrio,
        v.nombre,
        u.nombreusuario
      FROM incidente i
      LEFT JOIN barrio b
        ON i.idbarrio = b.gid
      JOIN tipo_incidente tp
        ON i.idtipoincidente = tp.idtipoincidente
      JOIN usuario u 
        ON i.idusuario = u.idusuario
      LEFT JOIN vereda v
        ON i.idvereda = v.id
      WHERE u.nombreusuario = $1
    `;
    return pool.query(query, [nombreUsuario]);
  }

  /**
   * Consultar incidentes con filtros administrativos dinámicos
   */
  static async obtenerIncidentesFiltroAdmin({ usuarioLogueado, rolLogueado = 'reportero', idtipoincidente, fechaincidente, fechaDesde, fechaHasta, id_estado }) {
    let query = `
      SELECT 
        i.idincidente,
        i.idtipoincidente,
        i.codigoincidente,
        ST_Y(i.geom) AS lat,
        ST_X(i.geom) AS lng,
        i.descripcionincidente,
        tp.nametipoincidente,
        i.fechaincidente,
        i.horaincidente,
        b.namebarrio,
        v.nombre,
        COALESCE(u.nombreusuario, 'Sistema') as nombreusuario,
        i.id_estado,
        COALESCE(ei.nombre, 'Reportado') as estado_nombre,
        COALESCE(ei.color, '#ffc107') as estado_color,
        i.id_admin_revisor,
        ar.nombreusuario as admin_revisor_nombre,
        i.fecha_toma_revision,
        i.fecharegistro,
        i.imagen_url
      FROM incidente i
      LEFT JOIN barrio b 
        ON i.idbarrio = b.gid
      LEFT JOIN tipo_incidente tp 
        ON i.idtipoincidente = tp.idtipoincidente
      LEFT JOIN usuario u 
        ON i.idusuario = u.idusuario
      LEFT JOIN vereda v 
        ON i.idvereda = v.id
      LEFT JOIN estado_incidente ei
        ON i.id_estado = ei.id_estado
      LEFT JOIN usuario ar
        ON i.id_admin_revisor = ar.idusuario
      WHERE 1=1
    `;

    const values = [];

    if (rolLogueado !== 'superadmin' && rolLogueado !== 'admin') {
      values.push(usuarioLogueado);
      query += ` AND u.nombreusuario = $${values.length}`;
    }

    if (idtipoincidente) {
      values.push(idtipoincidente);
      query += ` AND i.idtipoincidente = $${values.length}`;
    }

    if (id_estado) {
      values.push(parseInt(id_estado));
      query += ` AND i.id_estado = $${values.length}`;
    }

    if (fechaincidente) {
      values.push(fechaincidente);
      query += ` AND DATE(i.fechaincidente) = $${values.length}`;
    }

    if (fechaDesde) {
      values.push(fechaDesde);
      query += ` AND DATE(i.fechaincidente) >= $${values.length}`;
    }

    if (fechaHasta) {
      values.push(fechaHasta);
      query += ` AND DATE(i.fechaincidente) <= $${values.length}`;
    }

    query += ` ORDER BY i.idincidente DESC`;

    return pool.query(query, values);
  }
}

module.exports = IncidenteModel;
