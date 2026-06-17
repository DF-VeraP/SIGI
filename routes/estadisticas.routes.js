const express = require('express');
const router = express.Router();
const estadisticasController = require('../controllers/estadisticas.controller');

router.get("/conteoIncidente", estadisticasController.getConteoIncidente);
router.get("/conteoPorTipo", estadisticasController.getConteoPorTipo);
router.get("/resumen", estadisticasController.getResumen);
router.get("/top-zonas", estadisticasController.getTopZonas);
router.get("/top-incidentes", estadisticasController.getTopIncidentes);

module.exports = router;
