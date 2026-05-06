const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get("/conteoIncidente", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*)
      FROM incidente
    `);
    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: "Error en servidor" });
  }
});

router.get("/conteoPorTipo", async (req, res) => {
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
});

router.get("/resumen", async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN idtipoincidente = 1 THEN 1 ELSE 0 END) AS robos,
        SUM(CASE WHEN idtipoincidente = 2 THEN 1 ELSE 0 END) AS agresiones,
        SUM(CASE WHEN idtipoincidente = 3 THEN 1 ELSE 0 END) AS piques,
        SUM(CASE WHEN idtipoincidente = 4 THEN 1 ELSE 0 END) AS accidentes
      FROM incidente;
    `);

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en resumen" });
  }
});

router.get("/top-zonas", async (req, res) => {
  try {

    const barrio = await pool.query(`
      SELECT b.namebarrio, COUNT(*) AS total
      FROM incidente i
      JOIN barrio b ON i.idbarrio = b.gid
      GROUP BY b.namebarrio
      ORDER BY total DESC
      LIMIT 1;
    `);

    const vereda = await pool.query(`
      SELECT v.nombre, COUNT(*) AS total
      FROM incidente i
      JOIN vereda v ON i.idvereda = v.id
      GROUP BY v.nombre
      ORDER BY total DESC
      LIMIT 1;
    `);

    res.json({
      barrio: barrio.rows[0],
      vereda: vereda.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en top zonas" });
  }
});

router.get("/top-incidentes", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        tp.nametipoincidente AS tipo,
        COUNT(*) AS cantidad
      FROM incidente i
      JOIN tipo_incidente tp ON i.idtipoincidente = tp.idtipoincidente
      GROUP BY tp.nametipoincidente
      ORDER BY cantidad DESC
      LIMIT 4;
    `);

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
});

module.exports = router;