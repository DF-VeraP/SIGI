/**
 * SIGI — Controlador de Seguridad de Red (IPs Bloqueadas y Rate Limit)
 * Exclusivo para Superadmin. Permite consultar IPs bloqueadas por fuerza bruta
 * y desbloquearlas de forma manual.
 */

const gestorIps = require('../utils/gestorIps');
const logger = require('../utils/logger');
const { registrarLogActividad } = logger;

/**
 * Obtener lista de direcciones IP bloqueadas activas y estadísticas globales
 */
const obtenerIpsBloqueadas = async (req, res) => {
  try {
    const ips = gestorIps.obtenerIpsActivas();
    const estadisticas = gestorIps.obtenerEstadisticas();

    res.json({
      exito: true,
      ips,
      estadisticas
    });
  } catch (error) {
    logger.error('Error al obtener IPs bloqueadas:', error);
    res.status(500).json({ mensaje: 'Error al consultar direcciones IP bloqueadas' });
  }
};

/**
 * Desbloquear manualmente una dirección IP
 */
const desbloquearIp = async (req, res) => {
  const { ip } = req.params;
  const idAdmin = req.session.idusuario;
  const nombreAdmin = req.session.usuario || 'Superadmin';

  if (!ip) {
    return res.status(400).json({ mensaje: 'Debe especificar la dirección IP a desbloquear' });
  }

  try {
    const ipLimpia = gestorIps.normalizarIp(decodeURIComponent(ip));
    const fueDesbloqueada = gestorIps.desbloquearIp(ipLimpia);

    await registrarLogActividad(
      idAdmin,
      'DESBLOQUEAR_IP',
      'seguridad',
      null,
      `Superadmin ${nombreAdmin} desbloqueó la dirección IP ${ipLimpia}`,
      req
    );

    try {
      const io = req.app && req.app.get('io');
      if (io) {
        io.emit('ip_desbloqueada', { ip: ipLimpia });
      }
    } catch (wsErr) {
      // Ignorar si websocket no está activo
    }

    res.json({
      exito: true,
      mensaje: `Dirección IP ${ipLimpia} desbloqueada exitosamente`,
      ip: ipLimpia,
      estabaRegistrada: fueDesbloqueada
    });
  } catch (error) {
    logger.error('Error al desbloquear IP:', error);
    res.status(500).json({ mensaje: 'Error al procesar el desbloqueo de la IP' });
  }
};

module.exports = {
  obtenerIpsBloqueadas,
  desbloquearIp
};
