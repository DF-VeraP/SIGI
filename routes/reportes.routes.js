const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportes.controller');
const { verificarSesion } = require('../middleware/auth.middleware');

// Descarga de informe ejecutivo mensual en PDF (Protegido por sesión)
router.get('/api/reportes/pdf', verificarSesion, reportesController.exportarInformePDF);

module.exports = router;
