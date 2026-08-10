const pool = require('../db');

const registrarIncidente = async (req, res) => {
  const idusuarioLogueado = req.session.idusuario;
  if (!idusuarioLogueado) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const {
    tipo,
    fecha,
    hora,
    lat,
    lng,
    descripcion
  } = req.body;

  try {
    await pool.query(`
      INSERT INTO incidente
      (descripcionincidente, idtipoincidente, fechaincidente, horaincidente, geom, idusuario)
      VALUES (
        $1, $2, $3, $4,
        ST_SetSRID(ST_MakePoint($5, $6), 4326),
        $7
      )
    `, [descripcion, tipo, fecha, hora, lng, lat, idusuarioLogueado]);

    res.json({ mensaje: "Incidente registrado ✅" });

  } catch (error) {
    console.error("Error al registrar incidente:", error);
    res.status(500).json({ error: "Error en servidor" });
  }
};

const eliminarIncidente = async (req, res) => {
  const idusuarioLogueado = req.session.idusuario;
  if (!idusuarioLogueado) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    // Verificar propiedad del incidente
    const checkOwner = await pool.query("SELECT idusuario FROM incidente WHERE idincidente = $1", [req.params.id]);
    if (checkOwner.rows.length === 0) {
      return res.status(404).json({ error: "Incidente no encontrado" });
    }
    if (checkOwner.rows[0].idusuario !== idusuarioLogueado) {
      return res.status(403).json({ error: "No tienes permiso para modificar este incidente 🚫" });
    }

    await pool.query("DELETE FROM incidente WHERE idincidente = $1", [req.params.id]);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error al eliminar:", error);
    res.status(500).json({ error: "Error eliminando" });
  }
};

const obtenerIncidente = async (req, res) => {
  const idusuarioLogueado = req.session.idusuario;
  if (!idusuarioLogueado) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM incidente WHERE idincidente = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Incidente no encontrado" });
    }
    if (result.rows[0].idusuario !== idusuarioLogueado) {
      return res.status(403).json({ error: "No tienes permiso para ver este incidente 🚫" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error" });
  }
};

const actualizarIncidente = async (req, res) => {
  const idusuarioLogueado = req.session.idusuario;
  if (!idusuarioLogueado) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    // Verificar propiedad del incidente
    const checkOwner = await pool.query("SELECT idusuario FROM incidente WHERE idincidente = $1", [req.params.id]);
    if (checkOwner.rows.length === 0) {
      return res.status(404).json({ error: "Incidente no encontrado" });
    }
    if (checkOwner.rows[0].idusuario !== idusuarioLogueado) {
      return res.status(403).json({ error: "No tienes permiso para modificar este incidente 🚫" });
    }

    const { fechaincidente, horaincidente, descripcionincidente } = req.body;

    await pool.query(
      `UPDATE incidente 
       SET fechaincidente = $1,
           horaincidente = $2,
           descripcionincidente = $3
       WHERE idincidente = $4`,
      [fechaincidente, horaincidente, descripcionincidente, req.params.id]
    );

    res.sendStatus(200);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error actualizando" });
  }
};

module.exports = {
  registrarIncidente,
  eliminarIncidente,
  obtenerIncidente,
  actualizarIncidente
};
