const pool = require('../db');

/**
 * Modelo de Geografía y PostGIS (Geografia Model)
 * Optimiza consultas espaciales aprovechando claves foráneas indexadas y GIST.
 */
class GeografiaModel {
  /**
   * Obtener incidentes con datos geográficos y filtros.
   * Optimización: Une por clave foránea (i.idbarrio, i.idvereda) con fallback espacial,
   * reduciendo drásticamente el consumo de CPU vs ST_Within en tabla completa.
   */
  static async obtenerIncidentes({ nombre, tipoLugar, tipos, fechaDesde, fechaHasta }) {
    let query = `
      SELECT
        i.idincidente,
        i.idtipoincidente,
        i.descripcionincidente,
        ST_Y(i.geom) AS lat,
        ST_X(i.geom) AS lng,
        i.codigoincidente,
        i.fechaincidente,
        i.horaincidente,
        tp.nametipoincidente,
        COALESCE(tp.color, '#3b82f6') AS color,
        b.namebarrio,
        v.nombre AS nombrevereda
      FROM incidente i
      LEFT JOIN barrio b ON (i.idbarrio = b.gid OR (i.idbarrio IS NULL AND ST_Within(i.geom, b.geom)))
      LEFT JOIN vereda v ON (i.idvereda = v.id OR (i.idvereda IS NULL AND ST_Within(i.geom, v.geom)))
      JOIN tipo_incidente tp ON i.idtipoincidente = tp.idtipoincidente
      WHERE 1=1
    `;

    const valores = [];
    let contador = 1;

    if (nombre) {
      if (tipoLugar === 'Vereda') {
        query += ` AND LOWER(v.nombre) LIKE LOWER($${contador})`;
      } else {
        query += ` AND LOWER(b.namebarrio) LIKE LOWER($${contador})`;
      }
      valores.push(`%${nombre}%`);
      contador++;
    }

    if (tipos) {
      query += ` AND i.idtipoincidente = ANY(string_to_array($${contador}, ',')::int[])`;
      valores.push(tipos);
      contador++;
    }

    if (fechaDesde && fechaHasta) {
      query += ` AND i.fechaincidente >= $${contador} AND i.fechaincidente <= $${contador + 1}`;
      valores.push(fechaDesde, fechaHasta);
      contador += 2;
    }

    return pool.query(query, valores);
  }

  /**
   * Obtener polígono GeoJSON de barrio por nombre o listado
   */
  static async obtenerPoligonoBarrio(nombre) {
    let query = 'SELECT gid, namebarrio, ST_AsGeoJSON(geom) AS geom FROM barrio';
    const valores = [];
    if (nombre) {
      query += ' WHERE LOWER(namebarrio) LIKE LOWER($1)';
      valores.push(`%${nombre}%`);
    }
    return pool.query(query, valores);
  }

  /**
   * Buscar barrio y vereda a partir de un punto coordenado (lat/lng)
   */
  static async buscarPorCoordenada(lat, lng) {
    const punto = 'ST_SetSRID(ST_MakePoint($1, $2), 4326)';

    const barrioResult = await pool.query(`
      SELECT gid, namebarrio
      FROM barrio
      WHERE ST_Within(${punto}, geom)
      LIMIT 1
    `, [lng, lat]);

    let veredaResult = { rows: [] };
    try {
      veredaResult = await pool.query(`
        SELECT id, nombre
        FROM vereda
        WHERE ST_Within(${punto}, geom)
        LIMIT 1
      `, [lng, lat]);
    } catch (err) {
      // Ignorar si no existe geometría válida
    }

    let cuadranteResult = { rows: [] };
    try {
      cuadranteResult = await pool.query(`
        SELECT id_cuadrante, codigo_cuadrante, nombre, tipo, telefono_contacto
        FROM cuadrante
        WHERE geom IS NOT NULL AND ST_Intersects(${punto}, geom)
        ORDER BY CASE WHEN tipo = 'urbano' THEN 1 ELSE 2 END ASC
        LIMIT 1
      `, [lng, lat]);
    } catch (err) {
      // Fallback silencioso si la tabla cuadrante no existe en entorno de test aislado
    }

    return {
      barrio: barrioResult.rows[0]?.namebarrio || null,
      idbarrio: barrioResult.rows[0]?.gid || null,
      vereda: veredaResult.rows[0]?.nombre || null,
      idvereda: veredaResult.rows[0]?.id || null,
      cuadrante: cuadranteResult.rows[0]?.nombre || null,
      id_cuadrante: cuadranteResult.rows[0]?.id_cuadrante || null,
      codigo_cuadrante: cuadranteResult.rows[0]?.codigo_cuadrante || null,
      telefono_cuadrante: cuadranteResult.rows[0]?.telefono_contacto || null
    };
  }

  /**
   * Obtener polígonos GeoJSON de los cuadrantes policiales (MNVCC) con conteo de incidentes
   */
  static async obtenerPoligonosCuadrantes(tipo = null) {
    let query = `
      SELECT
        c.id_cuadrante,
        c.codigo_cuadrante,
        c.nombre,
        c.tipo,
        c.unidad_base,
        c.telefono_contacto,
        c.color,
        c.sectores_barrios,
        COUNT(i.idincidente)::int AS total_incidentes,
        ST_AsGeoJSON(c.geom) AS geom
      FROM cuadrante c
      LEFT JOIN incidente i ON i.id_cuadrante = c.id_cuadrante
      WHERE c.geom IS NOT NULL
    `;
    const valores = [];
    if (tipo && ['urbano', 'rural', 'vial', 'fluvial'].includes(tipo)) {
      valores.push(tipo);
      query += ` AND c.tipo = $1`;
    }
    query += ` GROUP BY c.id_cuadrante ORDER BY c.id_cuadrante ASC`;
    return pool.query(query, valores);
  }

  /**
   * Obtener polígono GeoJSON de vereda por nombre
   */
  static async obtenerPoligonoVereda(nombre) {
    let query = `
      SELECT 
        v.id,
        v.nombre,
        c.namecorregimiento,
        ST_AsGeoJSON(v.geom) AS geom
      FROM vereda v
      JOIN corregimiento c ON v.idcorregimiento = c.idcorregimiento
    `;
    const valores = [];
    if (nombre) {
      query += ' WHERE v.nombre ILIKE $1';
      valores.push(`%${nombre}%`);
    }
    return pool.query(query, valores);
  }

  /**
   * Buscar barrios por coincidencia de texto para autocompletado
   */
  static async buscarBarrios(q, limit = 10) {
    const res = await pool.query(`
      SELECT namebarrio
      FROM barrio
      WHERE LOWER(namebarrio) LIKE LOWER($1)
      LIMIT $2;
    `, [`%${q || ''}%`, limit]);
    return res.rows;
  }

  /**
   * Buscar veredas por coincidencia de texto para autocompletado
   */
  static async buscarVeredas(q, limit = 10) {
    const res = await pool.query(`
      SELECT nombre
      FROM vereda
      WHERE nombre ILIKE $1
      LIMIT $2;
    `, [`%${q || ''}%`, limit]);
    return res.rows;
  }
}

module.exports = GeografiaModel;

