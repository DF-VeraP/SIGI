const pool = require('../db');

/**
 * Modelo de Estadísticas y Analíticas (Estadisticas Model)
 * Encapsula consultas de conteos, KPIs, resúmenes y zonas de mayor impacto.
 */
class EstadisticasModel {
  /**
   * Conteo total de incidentes en la plataforma
   */
  static async obtenerConteoTotal() {
    return pool.query('SELECT COUNT(*) FROM incidente');
  }

  /**
   * Conteo de incidentes agrupado por tipo
   */
  static async obtenerConteoPorTipo() {
    return pool.query(`
      SELECT 
        tp.idtipoincidente, 
        tp.nametipoincidente AS tipo, 
        COUNT(*) AS cantidad
      FROM incidente i
      JOIN tipo_incidente tp ON i.idtipoincidente = tp.idtipoincidente
      GROUP BY tp.idtipoincidente, tp.nametipoincidente
      ORDER BY cantidad DESC
    `);
  }

  /**
   * Resumen general con filtro de fechas opcional.
   * Maneja tanto tipos conocidos (robos, agresiones, etc.) para compatibilidad
   * como agregación dinámica para cualquier nuevo tipo creado en catálogo.
   */
  static async obtenerResumen(fechaDesde, fechaHasta) {
    let query = `
      SELECT 
        COUNT(*) AS total,
        COALESCE(SUM(CASE WHEN LOWER(tp.nametipoincidente) LIKE '%robo%' OR i.idtipoincidente = 1 THEN 1 ELSE 0 END), 0) AS robos,
        COALESCE(SUM(CASE WHEN LOWER(tp.nametipoincidente) LIKE '%agresion%' OR LOWER(tp.nametipoincidente) LIKE '%amenaza%' OR i.idtipoincidente = 2 THEN 1 ELSE 0 END), 0) AS agresiones,
        COALESCE(SUM(CASE WHEN LOWER(tp.nametipoincidente) LIKE '%pique%' OR i.idtipoincidente = 3 THEN 1 ELSE 0 END), 0) AS piques,
        COALESCE(SUM(CASE WHEN LOWER(tp.nametipoincidente) LIKE '%accidente%' OR i.idtipoincidente = 4 THEN 1 ELSE 0 END), 0) AS accidentes
      FROM incidente i
      LEFT JOIN tipo_incidente tp ON i.idtipoincidente = tp.idtipoincidente
    `;

    const valores = [];
    if (fechaDesde && fechaHasta) {
      query += ' WHERE i.fechaincidente >= $1 AND i.fechaincidente <= $2';
      valores.push(fechaDesde, fechaHasta);
    }

    return pool.query(query, valores);
  }

  /**
   * Obtener barrio y vereda con mayor cantidad de incidentes en un rango de fechas
   */
  static async obtenerTopZonas(fechaDesde, fechaHasta) {
    let condition = '';
    const valores = [];
    if (fechaDesde && fechaHasta) {
      condition = ' WHERE i.fechaincidente >= $1 AND i.fechaincidente <= $2 ';
      valores.push(fechaDesde, fechaHasta);
    }

    const barrio = await pool.query(`
      SELECT b.namebarrio, COUNT(*) AS total
      FROM incidente i
      JOIN barrio b ON i.idbarrio = b.gid
      ${condition}
      GROUP BY b.namebarrio
      ORDER BY total DESC
      LIMIT 1;
    `, valores);

    const vereda = await pool.query(`
      SELECT v.nombre, COUNT(*) AS total
      FROM incidente i
      JOIN vereda v ON i.idvereda = v.id
      ${condition}
      GROUP BY v.nombre
      ORDER BY total DESC
      LIMIT 1;
    `, valores);

    return {
      barrio: barrio.rows[0] || null,
      vereda: vereda.rows[0] || null
    };
  }

  /**
   * Top tipos de incidentes más frecuentes con conteos
   */
  static async obtenerTopIncidentes(fechaDesde, fechaHasta) {
    let condition = '';
    const valores = [];
    if (fechaDesde && fechaHasta) {
      condition = ' WHERE i.fechaincidente >= $1 AND i.fechaincidente <= $2 ';
      valores.push(fechaDesde, fechaHasta);
    }

    return pool.query(`
      SELECT 
        tp.nametipoincidente AS tipo,
        COALESCE(tp.color, '#3b82f6') AS color,
        COUNT(*) AS cantidad
      FROM incidente i
      JOIN tipo_incidente tp ON i.idtipoincidente = tp.idtipoincidente
      ${condition}
      GROUP BY tp.nametipoincidente, tp.color
      ORDER BY cantidad DESC
      LIMIT 6;
    `, valores);
  }

  /**
   * Timestamp del último incidente registrado
   */
  static async obtenerUltimaActualizacion() {
    return pool.query('SELECT MAX(fecharegistro) AS ultima_actualizacion FROM incidente');
  }

  /**
   * Métricas consolidadas de un período para informes ejecutivos
   */
  static async obtenerMetricasPeriodo(fechaInicio, fechaFin) {
    const [totalesRes, tiposRes, zonasRes, estadosRes] = await Promise.all([
      pool.query(`
        SELECT COUNT(*) AS total,
               COALESCE(SUM(numero_victimas), 0) AS victimas,
               COALESCE(SUM(numero_vehiculos_afectados), 0) AS vehiculos
        FROM incidente
        WHERE fechaincidente >= $1 AND fechaincidente <= $2
      `, [fechaInicio, fechaFin]),

      pool.query(`
        SELECT tp.nametipoincidente AS tipo, COUNT(*) AS cantidad
        FROM incidente i
        JOIN tipo_incidente tp ON i.idtipoincidente = tp.idtipoincidente
        WHERE i.fechaincidente >= $1 AND i.fechaincidente <= $2
        GROUP BY tp.nametipoincidente
        ORDER BY cantidad DESC
      `, [fechaInicio, fechaFin]),

      pool.query(`
        SELECT b.namebarrio, COUNT(*) AS total
        FROM incidente i
        JOIN barrio b ON i.idbarrio = b.gid
        WHERE i.fechaincidente >= $1 AND i.fechaincidente <= $2
        GROUP BY b.namebarrio
        ORDER BY total DESC
        LIMIT 5
      `, [fechaInicio, fechaFin]),

      pool.query(`
        SELECT ei.nombre AS estado, COUNT(*) AS total
        FROM incidente i
        JOIN estado_incidente ei ON i.id_estado = ei.id_estado
        WHERE i.fechaincidente >= $1 AND i.fechaincidente <= $2
        GROUP BY ei.nombre
      `, [fechaInicio, fechaFin])
    ]);

    return {
      totalesRes,
      tiposRes,
      zonasRes,
      estadosRes,
      totalIncidentes: parseInt(totalesRes.rows[0]?.total || 0),
      totalVictimas: parseInt(totalesRes.rows[0]?.victimas || 0),
      totalVehiculos: parseInt(totalesRes.rows[0]?.vehiculos || 0),
      tipos: tiposRes.rows || [],
      zonas: zonasRes.rows || [],
      estados: estadosRes.rows || []
    };
  }

  /**
   * Histórico mensual de incidentes para proyecciones de Machine Learning
   */
  static async obtenerHistoricoMensualParaML(limite = 12) {
    const query = `
      SELECT TO_CHAR(fechaincidente, 'YYYY-MM') as mes, COUNT(*)::int as total
      FROM incidente
      WHERE fechaincidente IS NOT NULL
      GROUP BY TO_CHAR(fechaincidente, 'YYYY-MM')
      ORDER BY mes ASC
      LIMIT $1
    `;
    const res = await pool.query(query, [limite]);
    return res.rows || [];
  }

  /**
   * Obtener lista de años únicos registrados en incidentes
   */
  static async obtenerAniosDisponibles() {
    const res = await pool.query(`
      SELECT DISTINCT EXTRACT(YEAR FROM fechaincidente)::int AS anio
      FROM incidente
      WHERE fechaincidente IS NOT NULL
      ORDER BY anio DESC
    `);
    return res.rows.map(r => r.anio);
  }
}

module.exports = EstadisticasModel;
