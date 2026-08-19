const express = require('express');
const router = express.Router();
const incidentesController = require('../controllers/incidentes.controller');
const { verificarSesion } = require('../middleware/auth.middleware');

const multer = require('multer');

// Usar memoria para no guardar los CSV en disco innecesiramente
const upload = multer({ storage: multer.memoryStorage() });

router.post("/registrarIncidente", verificarSesion, incidentesController.registrarIncidente);
router.post("/importar-incidentes", verificarSesion, upload.single('archivo'), incidentesController.importarIncidentesMasivo);
router.delete("/importados/ultimo", verificarSesion, incidentesController.deshacerUltimaImportacion);
router.delete("/incidente/:id", verificarSesion, incidentesController.eliminarIncidente);
router.get("/incidente/:id", verificarSesion, incidentesController.obtenerIncidente);
router.put("/incidente/:id", verificarSesion, incidentesController.actualizarIncidente);

module.exports = router;
