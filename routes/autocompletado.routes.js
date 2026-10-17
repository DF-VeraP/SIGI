const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get("/buscarBarrios", async (req, res) => {
  const q = req.query.q;
  try {
    const result = await pool.query(`
      SELECT namebarrio
      FROM barrio
      WHERE LOWER(namebarrio) LIKE LOWER($1)
      LIMIT 10;
    `, [`%${q}%`]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

router.get("/buscarVeredas", async (req, res) => {
  const q = req.query.q;
  try {
    const result = await pool.query(`
      SELECT nombre
      FROM vereda
      WHERE nombre ILIKE $1
      LIMIT 10;
    `, [`%${q}%`]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

router.get("/tiposIncidente", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        idtipoincidente, 
        nametipoincidente, 
        COALESCE(color, '#3b82f6') AS color, 
        COALESCE(activo, true) AS activo, 
        id_categoria
      FROM tipo_incidente
      WHERE COALESCE(activo, true) = true
      ORDER BY idtipoincidente ASC
    `);

    res.json(result.rows);

  } catch (error) {
    console.warn("Aviso en /tiposIncidente, ejecutando consulta de contingencia:", error.message);
    try {
      const fallback = await pool.query(`
        SELECT 
          idtipoincidente, 
          nametipoincidente, 
          '#3b82f6' AS color, 
          true AS activo, 
          NULL::integer AS id_categoria
        FROM tipo_incidente
        ORDER BY idtipoincidente ASC
      `);
      res.json(fallback.rows);
    } catch (fallbackError) {
      console.error("Error definitivo en /tiposIncidente:", fallbackError);
      res.status(500).json({ error: "Error en servidor" });
    }
  }
});


module.exports = router;
