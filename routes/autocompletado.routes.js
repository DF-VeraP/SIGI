const express = require('express');
const router = express.Router();
const GeografiaModel = require('../models/geografia.model');
const CatalogosModel = require('../models/catalogos.model');
const logger = require('../utils/logger');

router.get("/buscarBarrios", async (req, res) => {
  const q = req.query.q;
  try {
    const rows = await GeografiaModel.buscarBarrios(q, 10);
    res.json(rows);
  } catch (error) {
    logger.error("Error en /buscarBarrios:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

router.get("/buscarVeredas", async (req, res) => {
  const q = req.query.q;
  try {
    const rows = await GeografiaModel.buscarVeredas(q, 10);
    res.json(rows);
  } catch (error) {
    logger.error("Error en /buscarVeredas:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

router.get("/tiposIncidente", async (req, res) => {
  try {
    const rows = await CatalogosModel.obtenerTiposActivos();
    res.json(rows);
  } catch (error) {
    logger.error("Error definitivo en /tiposIncidente:", error);
    res.status(500).json({ error: "Error en servidor" });
  }
});

module.exports = router;

