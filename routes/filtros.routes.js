const express = require('express');
const router = express.Router();
const EstadisticasModel = require('../models/estadisticas.model');
const logger = require('../utils/logger');

router.get('/filtroAnio', async (req, res) => {
  try {
    const anios = await EstadisticasModel.obtenerAniosDisponibles();
    res.json(anios);
  } catch (error) {
    logger.error("Error en /filtroAnio:", error);
    res.status(500).json({ error: "Error al obtener años disponibles" });
  }
});

module.exports = router;

