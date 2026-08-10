const express = require('express');
const router = express.Router();
const incidentesController = require('../controllers/incidentes.controller');
const { verificarSesion } = require('../middleware/auth.middleware');

router.post("/registrarIncidente", verificarSesion, incidentesController.registrarIncidente);
router.delete("/incidente/:id", verificarSesion, incidentesController.eliminarIncidente);
router.get("/incidente/:id", verificarSesion, incidentesController.obtenerIncidente);
router.put("/incidente/:id", verificarSesion, incidentesController.actualizarIncidente);

module.exports = router;
