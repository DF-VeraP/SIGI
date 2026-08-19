const pool = require('../db');

const getConteoIncidente = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*)
      FROM incidente
    `);
    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: "Error en servidor" });
  }
};

const getConteoPorTipo = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT tp.idtipoincidente, tp.nametipoincidente AS tipo, COUNT(*) AS cantidad
      FROM incidente i
      JOIN tipo_incidente tp 
        ON i.idtipoincidente = tp.idtipoincidente
      GROUP BY tp.idtipoincidente, tp.nametipoincidente
      ORDER BY cantidad DESC
    `);

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: "Error en servidor" });
  }
};

const getResumen = async (req, res) => {
  const fechaDesde = req.query.fechaDesde;
  const fechaHasta = req.query.fechaHasta;
  try {

    let query = `
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN idtipoincidente = 1 THEN 1 ELSE 0 END) AS robos,
        SUM(CASE WHEN idtipoincidente = 2 THEN 1 ELSE 0 END) AS agresiones,
        SUM(CASE WHEN idtipoincidente = 3 THEN 1 ELSE 0 END) AS piques,
        SUM(CASE WHEN idtipoincidente = 4 THEN 1 ELSE 0 END) AS accidentes
      FROM incidente
    `;
    let valores = [];
    if (fechaDesde && fechaHasta) {
      query += ` WHERE fechaincidente >= $1 AND fechaincidente <= $2`;
      valores.push(fechaDesde, fechaHasta);
    }

    const result = await pool.query(query, valores);

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en resumen" });
  }
};

const getTopZonas = async (req, res) => {
  const fechaDesde = req.query.fechaDesde;
  const fechaHasta = req.query.fechaHasta;
  try {
    let condition = "";
    let valores = [];
    if (fechaDesde && fechaHasta) {
      condition = " WHERE i.fechaincidente >= $1 AND i.fechaincidente <= $2 ";
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

    res.json({
      barrio: barrio.rows[0],
      vereda: vereda.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en top zonas" });
  }
};

const getTopIncidentes = async (req, res) => {
  const fechaDesde = req.query.fechaDesde;
  const fechaHasta = req.query.fechaHasta;
  try {
    let condition = "";
    let valores = [];
    if (fechaDesde && fechaHasta) {
      condition = " WHERE i.fechaincidente >= $1 AND i.fechaincidente <= $2 ";
      valores.push(fechaDesde, fechaHasta);
    }

    const result = await pool.query(`
      SELECT 
        tp.nametipoincidente AS tipo,
        COUNT(*) AS cantidad
      FROM incidente i
      JOIN tipo_incidente tp ON i.idtipoincidente = tp.idtipoincidente
      ${condition}
      GROUP BY tp.nametipoincidente
      ORDER BY cantidad DESC
      LIMIT 4;
    `, valores);

    // asignamos colores fijos por tipo (frontend-friendly)
    const colores = {
      "Robo": "#e74c3c",
      "Agresiones/Amenazas": "#f1c40f",
      "Piques": "#9b59b6",
      "Accidentes de transito": "#2ecc71"
    };

     const data = result.rows.map(r => ({
      tipo: r.tipo,
      cantidad: parseInt(r.cantidad),
      color: colores[r.tipo] || "#3498db"
    }));

    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en top incidentes" });
  }
};

module.exports = {
  getConteoIncidente,
  getConteoPorTipo,
  getResumen,
  getTopZonas,
  getTopIncidentes
};
