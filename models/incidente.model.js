const pool = require('../db');

/**
 * Modelo de Incidentes (Incidente Model)
 * Encapsula la persistencia, consultas geoespaciales, filtros, paginación y cola de revisión.
 */
class IncidenteModel {
  /**
   * Buscar IDs de barrio y vereda por contención PostGIS ST_Contains
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
  static async liberarIncidente(idIncidente, idAdmin) {
    return pool.query(`
      UPDATE incidente
      SET id_estado = 1,
          id_admin_revisor = NULL
      WHERE idincidente = $1
        AND (id_admin_revisor = $2 OR $3 = 'superadmin')
      RETURNING idincidente, id_estado;
    `, [idIncidente, idAdmin, idAdmin]);
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
}

module.exports = IncidenteModel;
