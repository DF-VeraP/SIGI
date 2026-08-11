const pool = require('../db');

const getIncidentesTabla = async (req, res) => {
  try {
    const usuarioLogueado = req.session.usuario;
    if (!usuarioLogueado) {
      return res.status(401).json({ error: "No autorizado" });
    }

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
    const result = await pool.query(query, [usuarioLogueado]);
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
    const usuarioLogueado = req.session.usuario;
    if (!usuarioLogueado) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const { idtipoincidente, fechaincidente, fechaDesde, fechaHasta } = req.query;

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

    let values = [usuarioLogueado];

    if (idtipoincidente) {
      values.push(idtipoincidente);
      query += ` AND i.idtipoincidente = $${values.length}`;
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
