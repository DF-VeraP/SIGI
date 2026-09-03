const pool = require('../db');

/**
 * Registra una acción de usuario o sistema en la tabla logs_actividad
 */
async function registrarLogActividad(id_usuario, accion, tabla_afectada = null, id_registro = null, descripcion = null, req = null) {
  try {
    let ip = null;
    let user_agent = null;

    if (req) {
      ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;
      user_agent = req.headers['user-agent'] || null;
    }

    const userId = id_usuario || (req && req.session ? req.session.idusuario : null);

    await pool.query(
      `INSERT INTO logs_actividad (id_usuario, accion, tabla_afectada, id_registro, descripcion, ip, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, accion, tabla_afectada, id_registro, descripcion, ip, user_agent]
    );
  } catch (error) {
    console.error('Error registrando log de actividad:', error.message);
  }
}

module.exports = {
  registrarLogActividad
};
