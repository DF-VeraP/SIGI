const pool = require('../db');

/**
 * Modelo de Catálogos (Catalogos Model)
 * Encapsula la obtención de categorías, tipos, estados, gravedades, modalidades y factores,
 * así como la administración del catálogo de tipos de incidentes por parte de Superadmin.
 */
class CatalogosModel {
  static async obtenerTodos() {
    const [categorias, tipos, estados, gravedades, modalidades, factores] = await Promise.all([
      pool.query('SELECT * FROM categoria_incidente ORDER BY id_categoria ASC'),
      pool.query('SELECT t.*, c.nombre as categoria_nombre FROM tipo_incidente t LEFT JOIN categoria_incidente c ON t.id_categoria = c.id_categoria ORDER BY t.idtipoincidente ASC'),
      pool.query('SELECT * FROM estado_incidente ORDER BY orden ASC'),
      pool.query('SELECT * FROM gravedad_incidente ORDER BY nivel ASC'),
      pool.query('SELECT * FROM modalidad_incidente ORDER BY id_modalidad ASC'),
      pool.query('SELECT * FROM factores_incidente ORDER BY id_factor ASC')
    ]);

    return {
      categorias: categorias.rows,
      tipos: tipos.rows,
      estados: estados.rows,
      gravedades: gravedades.rows,
      modalidades: modalidades.rows,
      factores: factores.rows
    };
  }

  /**
   * Obtiene la lista completa de tipos de incidentes con su categoría y conteo de incidentes asociados
   */
  static async obtenerTiposConDetalle() {
    const query = `
      SELECT 
        t.idtipoincidente,
        t.nametipoincidente,
        t.id_categoria,
        c.nombre as categoria_nombre,
        t.codigo,
        COALESCE(t.nivel_riesgo_base, 'media') as nivel_riesgo_base,
        COALESCE(t.color, '#3b82f6') as color,
        t.descripcion,
        t.activo,
        t.fecha_creacion,
        COALESCE(sub.conteo_incidentes, 0)::int as total_incidentes
      FROM tipo_incidente t
      LEFT JOIN categoria_incidente c ON t.id_categoria = c.id_categoria
      LEFT JOIN (
        SELECT idtipoincidente, COUNT(*) as conteo_incidentes
        FROM incidente
        GROUP BY idtipoincidente
      ) sub ON t.idtipoincidente = sub.idtipoincidente
      ORDER BY t.idtipoincidente ASC
    `;
    const res = await pool.query(query);
    return res.rows;
  }

  /**
   * Obtiene un tipo de incidente por ID
   */
  static async obtenerTipoPorId(id) {
    const res = await pool.query(`
      SELECT t.*, c.nombre as categoria_nombre
      FROM tipo_incidente t
      LEFT JOIN categoria_incidente c ON t.id_categoria = c.id_categoria
      WHERE t.idtipoincidente = $1
    `, [parseInt(id)]);
    return res.rows[0] || null;
  }

  /**
   * Registra un nuevo tipo de incidente
   */
  static async crearTipo({ nametipoincidente, id_categoria, nivel_riesgo_base, color, descripcion }) {
    const res = await pool.query(`
      INSERT INTO tipo_incidente (
        nametipoincidente, id_categoria, nivel_riesgo_base, color, descripcion, activo
      ) VALUES ($1, $2, $3, $4, $5, true)
      RETURNING *
    `, [nametipoincidente, id_categoria || null, nivel_riesgo_base || 'media', color, descripcion || null]);
    return res.rows[0];
  }

  /**
   * Actualiza los datos de un tipo de incidente existente
   */
  static async actualizarTipo(id, { nametipoincidente, id_categoria, nivel_riesgo_base, color, descripcion }) {
    const res = await pool.query(`
      UPDATE tipo_incidente
      SET 
        nametipoincidente = $1,
        id_categoria = $2,
        nivel_riesgo_base = $3,
        color = $4,
        descripcion = $5
      WHERE idtipoincidente = $6
      RETURNING *
    `, [nametipoincidente, id_categoria || null, nivel_riesgo_base || 'media', color, descripcion || null, parseInt(id)]);
    return res.rows[0];
  }

  /**
   * Cambia el estado activo / inactivo de un tipo de incidente
   */
  static async cambiarEstadoTipo(id, activo) {
    const res = await pool.query(`
      UPDATE tipo_incidente
      SET activo = $1
      WHERE idtipoincidente = $2
      RETURNING *
    `, [activo, parseInt(id)]);
    return res.rows[0];
  }

  /**
   * Cuenta cuántos incidentes históricos tienen asignado este tipo
   */
  static async contarIncidentesPorTipo(id) {
    const res = await pool.query(`
      SELECT COUNT(*)::int as total FROM incidente WHERE idtipoincidente = $1
    `, [parseInt(id)]);
    return res.rows[0] ? res.rows[0].total : 0;
  }

  /**
   * Elimina físicamente un tipo de incidente de la base de datos
   */
  static async eliminarTipo(id) {
    const res = await pool.query(`
      DELETE FROM tipo_incidente WHERE idtipoincidente = $1 RETURNING *
    `, [parseInt(id)]);
    return res.rows[0];
  }
}

module.exports = CatalogosModel;
