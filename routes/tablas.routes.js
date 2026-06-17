const express = require('express');
const router = express.Router();
const tablasController = require('../controllers/tablas.controller');

router.get('/incidentesTabla', tablasController.getIncidentesTabla);
router.get("/incidentesFiltroAdmin", tablasController.getIncidentesFiltroAdmin);

module.exports = router;
