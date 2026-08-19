const pool = require('../db');
const csv = require('csv-parser');
const stream = require('stream');
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

const importarIncidentesMasivo = async (req, res) => {
  const idusuarioLogueado = req.session.idusuario;
  if (!idusuarioLogueado) {
    return res.status(401).json({ error: "No autorizado" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "No se subió ningún archivo" });
  }

  const results = [];
  const bufferStream = new stream.PassThrough();
  bufferStream.end(req.file.buffer);

  bufferStream
    .pipe(csv({ separator: ';' })) // Soportar punto y coma por defecto en Excel español
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      let exitos = 0;
      let fallidos = 0;
      const idLote = Date.now().toString();

      // Si no usó punto y coma, intentamos con coma normal
      let finalResults = results;
      if (results.length > 0 && Object.keys(results[0]).length === 1 && Object.keys(results[0])[0].includes(',')) {
        // Reiniciar stream con coma
        const bufferStream2 = new stream.PassThrough();
        bufferStream2.end(req.file.buffer);
        finalResults = [];
        await new Promise((resolve) => {
          bufferStream2.pipe(csv()).on('data', (data) => finalResults.push(data)).on('end', resolve);
        });
      }

      for (const row of finalResults) {
        // Mapear columnas asumiendo formato mayúsculas o minúsculas
        const tipo = row.TIPO || row.tipo;
        const fecha = row.FECHA || row.fecha;
        const hora = row.HORA || row.hora;
        const lat = parseFloat(row.LATITUD || row.latitud || row.lat);
        const lng = parseFloat(row.LONGITUD || row.longitud || row.lng);
        const desc = row.DESCRIPCION || row.descripcion || '';

        if (!tipo || !fecha || !hora || isNaN(lat) || isNaN(lng)) {
          fallidos++;
          continue;
        }

        try {
          await pool.query(`
            INSERT INTO incidente
            (descripcionincidente, idtipoincidente, fechaincidente, horaincidente, geom, idusuario, origen, id_lote)
            VALUES (
              $1, $2, $3, $4,
              ST_SetSRID(ST_MakePoint($5, $6), 4326),
              $7, $8, $9
            )
          `, [desc, tipo, fecha, hora, lng, lat, idusuarioLogueado, 'masivo', idLote]);
          exitos++;
        } catch (err) {
          console.error("Error insertando fila CSV:", err);
          fallidos++;
        }
      }

      res.json({ 
        mensaje: "Proceso completado", 
        exitos, 
        fallidos 
      });
    });
};

const deshacerUltimaImportacion = async (req, res) => {
  const idusuarioLogueado = req.session.idusuario;
  if (!idusuarioLogueado) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const resultLote = await pool.query(
      `SELECT id_lote FROM incidente 
       WHERE idusuario = $1 AND origen = 'masivo' AND id_lote IS NOT NULL
       ORDER BY fecharegistro DESC LIMIT 1`, 
      [idusuarioLogueado]
    );

    if (resultLote.rows.length === 0) {
      return res.status(404).json({ error: "No se encontraron importaciones masivas para deshacer." });
    }

    const ultimoLote = resultLote.rows[0].id_lote;

    const resultDelete = await pool.query(
      "DELETE FROM incidente WHERE id_lote = $1 AND idusuario = $2",
      [ultimoLote, idusuarioLogueado]
    );

    res.json({ 
      mensaje: "Última importación deshecha correctamente", 
      eliminados: resultDelete.rowCount 
    });
  } catch (error) {
    console.error("Error deshaciendo importación:", error);
    res.status(500).json({ error: "Error en servidor al deshacer importación" });
  }
};

module.exports = {
  registrarIncidente,
  eliminarIncidente,
  obtenerIncidente,
  actualizarIncidente,
  importarIncidentesMasivo,
  deshacerUltimaImportacion
};
