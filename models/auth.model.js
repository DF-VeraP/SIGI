const pool = require('../db');

/**
 * Modelo de Acceso y Autenticación (Auth Model)
 * Centraliza las consultas SQL de usuarios para login, tokens y recuperación de clave.
 */
class AuthModel {
  /**
   * Buscar usuario por nombre de usuario o email
   */
  static async buscarPorNombreOEmail(identificador) {
    return pool.query(
      'SELECT * FROM usuario WHERE nombreusuario = $1 OR email = $1',
      [identificador]
    );
  }

  /**
   * Actualizar fecha y hora del último acceso
   */
  static async actualizarUltimoAcceso(idUsuario) {
    return pool.query(
      'UPDATE usuario SET ultimo_acceso = CURRENT_TIMESTAMP WHERE idusuario = $1',
      [idUsuario]
    );
  }

  /**
   * Buscar usuario por correo electrónico (insensible a mayúsculas)
   */
  static async buscarPorEmail(email) {
    return pool.query(
      'SELECT idusuario, nombreusuario, email FROM usuario WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );
  }

  /**
   * Invalidar tokens de recuperación anteriores no utilizados
   */
  static async invalidarTokensResetPrevios(idUsuario) {
    return pool.query(
      "UPDATE token SET usado = true WHERE id_usuario = $1 AND tipo = 'reset_password' AND usado = false",
      [idUsuario]
    );
  }

  /**
   * Insertar un nuevo token de recuperación de contraseña
   */
  static async guardarTokenReset(idUsuario, token, expiracion) {
    return pool.query(`
      INSERT INTO token (id_usuario, token, tipo, expiracion, usado)
      VALUES ($1, $2, 'reset_password', $3, false)
    `, [idUsuario, token, expiracion]);
  }

  /**
   * Consultar datos del token de recuperación junto con datos del usuario asociado
   */
  static async obtenerTokenReset(token) {
    return pool.query(`
      SELECT t.id_token, t.id_usuario, t.expiracion, t.usado, u.nombreusuario, u.email
      FROM token t
      JOIN usuario u ON t.id_usuario = u.idusuario
      WHERE t.token = $1 AND t.tipo = 'reset_password'
    `, [token]);
  }

  /**
   * Marcar token como utilizado
   */
  static async marcarTokenUsado(idToken) {
    return pool.query('UPDATE token SET usado = true WHERE id_token = $1', [idToken]);
  }

  /**
   * Restablecer la contraseña y desactivar la bandera de cambio obligatorio
   */
  static async actualizarPassword(idUsuario, hashedPassword) {
    return pool.query(`
      UPDATE usuario 
      SET contraseniausuario = $1, debe_cambiar_password = false, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE idusuario = $2
    `, [hashedPassword, idUsuario]);
  }

  /**
   * Obtener credenciales por ID de usuario
   */
  static async obtenerCredencialesPorId(idUsuario) {
    return pool.query(
      'SELECT idusuario, nombreusuario, contraseniausuario FROM usuario WHERE idusuario = $1',
      [idUsuario]
    );
  }
}

module.exports = AuthModel;
