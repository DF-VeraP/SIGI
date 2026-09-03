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
    const rolLogueado = req.session.rol || 'reportero';
    if (!usuarioLogueado) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const { idtipoincidente, fechaincidente, fechaDesde, fechaHasta, id_estado } = req.query;

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

    let values = [];

    // Admins y Superadmins ven todos los incidentes del sistema; Reporteros ven solo los propios
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
