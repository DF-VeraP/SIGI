const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verificarSesion } = require('../middleware/auth.middleware');

router.get("/admin", verificarSesion, authController.getAdmin);
router.get("/reportero", verificarSesion, authController.getReportero);
router.get("/logout", authController.logout);
router.get("/usuario", authController.getUsuario);
router.post("/login", authController.login);

module.exports = router;
