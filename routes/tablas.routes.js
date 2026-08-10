const express = require('express');
const router = express.Router();
const tablasController = require('../controllers/tablas.controller');
const { verificarSesion } = require('../middleware/auth.middleware');

router.get('/incidentesTabla', verificarSesion, tablasController.getIncidentesTabla);
router.get("/incidentesFiltroAdmin", verificarSesion, tablasController.getIncidentesFiltroAdmin);

module.exports = router;
