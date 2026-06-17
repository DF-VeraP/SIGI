const pool = require('../db');

const getIncidentesTabla = async (req, res) => {
  try {
    let query = `
      SELECT 
        i.idincidente,
        i.idtipoincidente,
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
      WHERE 1=1
      `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.log("Error: " + error);
    res.status(500).json({
      error: "Error en el servidor"
    });
  }
};


const getIncidentesFiltroAdmin = async (req, res) => {
  try {
    const { idtipoincidente, fechaincidente } = req.query;

    let query = `
      SELECT 
        i.idincidente,
        i.idtipoincidente,
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
      WHERE 1=1
    `;

    let values = [];

    if (idtipoincidente) {
      values.push(idtipoincidente);
      query += ` AND i.idtipoincidente = $${values.length}`;
    }

    if (fechaincidente) {
      values.push(fechaincidente);
      query += ` AND DATE(i.fechaincidente) = $${values.length}`;
    }

    const result = await pool.query(query, values);

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en servidor" });
  }
};

module.exports = {
  getIncidentesTabla,
  getIncidentesFiltroAdmin
};
