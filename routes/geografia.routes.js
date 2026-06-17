const express = require('express');
const router = express.Router();
const geografiaController = require('../controllers/geografia.controller');

router.get('/incidentes', geografiaController.getIncidentes);
router.get("/poligonoBarrio", geografiaController.getPoligonoBarrio);
router.get("/buscarBarrioPorCoordenada", geografiaController.buscarBarrioPorCoordenada);
router.get("/poligonoVereda", geografiaController.getPoligonoVereda);

module.exports = router;
