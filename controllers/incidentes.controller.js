const pool = require('../db');

const registrarIncidente = async (req, res) => {
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
        1
      )
    `, [descripcion, tipo, fecha, hora, lng, lat]);

    res.json({ mensaje: "Incidente registrado ✅" });

  } catch (error) {
    res.status(500).json({ error: "Error en servidor" });
  }
};

const eliminarIncidente = async (req, res) => {
  try {
    await pool.query("DELETE FROM incidente WHERE idincidente = $1", [req.params.id]);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: "Error eliminando" });
  }
};

const obtenerIncidente = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM incidente WHERE idincidente = $1",
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error" });
  }
};

const actualizarIncidente = async (req, res) => {
  try {
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
