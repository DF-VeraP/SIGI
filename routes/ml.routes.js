const express = require('express');
const router = express.Router();
const mlController = require('../controllers/ml.controller');
const { verificarSesion, verificarRol } = require('../middleware/auth.middleware');

// Rutas de Machine Learning y Analítica Espacial Predictiva
router.post('/api/ml/predecir-incidente', mlController.predecirIncidente);
router.get('/api/ml/hotspots', mlController.obtenerHotspots);
router.get('/api/ml/forecast', mlController.obtenerForecast);

// Reentrenamiento de modelos restringido a roles administrativos
router.post(
  '/api/ml/reentrenar',
  verificarSesion,
  verificarRol(['superadmin', 'admin']),
  mlController.reentrenar
);

module.exports = router;
