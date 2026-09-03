const express = require('express');
const router = express.Router();
const catalogosController = require('../controllers/catalogos.controller');

// Ruta pública / accesible para consultar catálogos de incidentes
router.get('/api/catalogos', catalogosController.getCatalogos);

module.exports = router;
