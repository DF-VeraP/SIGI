const express = require('express');
const router = express.Router();
const incidentesController = require('../controllers/incidentes.controller');

router.post("/registrarIncidente", incidentesController.registrarIncidente);
router.delete("/incidente/:id", incidentesController.eliminarIncidente);
router.get("/incidente/:id", incidentesController.obtenerIncidente);
router.put("/incidente/:id", incidentesController.actualizarIncidente);

module.exports = router;
