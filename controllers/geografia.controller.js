const pool = require('../db');

const getIncidentes = async (req, res) => {
  const nombre = req.query.barrio;
  const tipos = req.query.tipos;
  try {
    let query = `
      SELECT
        i.idincidente,
        i.idtipoincidente,
        i.descripcionincidente,
        ST_Y(i.geom) AS lat,
        ST_X(i.geom) AS lng,
        codigoincidente,
        i.fechaincidente,
        i.horaincidente,
        tp.nametipoincidente
      FROM incidente i
      LEFT JOIN barrio b
      ON ST_Within(i.geom, b.geom)
      JOIN tipo_incidente tp
      ON i.idtipoincidente = tp.idtipoincidente
      WHERE 1=1
      `;
    let valores = [];
    let contador = 1;
    if (nombre) {
      query += ` AND LOWER(b.namebarrio) LIKE LOWER ($${contador})`;
      valores.push(`%${nombre}%`);
      contador++;
    }
    if (tipos) {
      query += ` AND i.idtipoincidente = ANY(string_to_array($${contador}, ',')::int[])`;
      valores.push(tipos);
      contador++;
    }
    const result = await pool.query(query, valores);
    res.json(result.rows);
  } catch (error) {
    console.log("Error: " + error);
    res.status(500).json({
      error: "Error en el servidor"
    });
  }
};

const getPoligonoBarrio = async (req, res) => {
  const nombre = req.query.nombre;
  try {
    let query = `
      SELECT 
        gid,
        namebarrio,
        ST_AsGeoJSON(geom) AS geom
      FROM barrio
    `;
    let valores = [];
    if (nombre) {
      query += ` WHERE LOWER(namebarrio) LIKE LOWER($1)`;
      valores.push(`%${nombre}%`);
    }
    const result = await pool.query(query, valores);
    res.json(result.rows);
  } catch (error) {
    console.log("Error: " + error);
    res.status(500).json({
      error: "Error en el servidor"
    });
  }
};

const buscarBarrioPorCoordenada = async (req, res) => {
  const { lat, lng } = req.query;

  try {

    const punto = `
      ST_SetSRID(ST_MakePoint($1, $2), 4326)
    `;

    // 🔥 CONSULTA BARRIO
    const barrioResult = await pool.query(`
      SELECT namebarrio
      FROM barrio
      WHERE ST_Within(${punto}, geom)
      LIMIT 1
    `, [lng, lat]);

    // 🔥 CONSULTA VEREDA
    const veredaResult = await pool.query(`
      SELECT nombre
      FROM vereda
      WHERE ST_Within(${punto}, geom)
      LIMIT 1
    `, [lng, lat]);

    res.json({
      barrio: barrioResult.rows[0]?.namebarrio || null,
      vereda: veredaResult.rows[0]?.nombre || null
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error en servidor" });
  }
};

const getPoligonoVereda = async (req, res) => {
  const nombre = req.query.nombre;
  try {
    let query = `
      SELECT 
        v.id,
        v.nombre,
        c.namecorregimiento,
        ST_AsGeoJSON(v.geom) AS geom
      FROM vereda v
      JOIN corregimiento c
      ON v.idcorregimiento = c.idcorregimiento
    `;
    let valores = [];
    if (nombre) {
      query += ` WHERE v.nombre ILIKE $1`;
      valores.push(`%${nombre}%`);
    }
    const result = await pool.query(query, valores);
    res.json(result.rows);
  } catch (error) {
    console.log("Error: " + error);
    res.status(500).json({
      error: "Error en el servidor"
    });
  }
};

module.exports = {
  getIncidentes,
  getPoligonoBarrio,
  buscarBarrioPorCoordenada,
  getPoligonoVereda
};
