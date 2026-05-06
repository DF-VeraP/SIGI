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
      SELECT idtipoincidente, nametipoincidente
      FROM tipo_incidente
    `);

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: "Error en servidor" });
  }
});


module.exports = router;