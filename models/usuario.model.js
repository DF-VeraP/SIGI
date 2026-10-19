const pool = require('../db');

/**
 * Modelo de Usuario (Usuario Model)
 * Centraliza las operaciones sobre la tabla usuario.
 */
class UsuarioModel {
  /**
   * Obtener listado de todos los usuarios
   */
  static async obtenerTodos() {
    return pool.query(`
      SELECT 
        idusuario,
        nombreusuario,
        email,
        rol,
        estado,
        dependencia,
        telefono,
        debe_cambiar_password,
        ultimo_acceso,
        fecha_registro
      FROM usuario
      ORDER BY idusuario ASC
    `);
  }

  /**
   * Obtener un usuario por su ID
   */
  static async obtenerPorId(id) {
    return pool.query(`
      SELECT 
        idusuario,
        nombreusuario,
        email,
        rol,
        estado,
        dependencia,
        telefono,
        debe_cambiar_password,
        ultimo_acceso,
        fecha_registro
      FROM usuario
      WHERE idusuario = $1
    `, [id]);
  }

  /**
   * Verificar si existe algún usuario con el mismo username o email
   */
  static async verificarDuplicado(nombreusuario, email) {
    return pool.query(
      'SELECT idusuario, nombreusuario, email FROM usuario WHERE LOWER(nombreusuario) = LOWER($1) OR LOWER(email) = LOWER($2)',
      [nombreusuario, email]
    );
  }

  /**
   * Crear un nuevo usuario en la base de datos
   */
  static async crear({
    nombreusuario,
    contraseniausuario,
    dependencia,
    email,
    rol,
    estado,
    telefono,
    createdBy
  }) {
    return pool.query(`
      INSERT INTO usuario (
        nombreusuario, contraseniausuario, entidadusuario, email, rol, estado, dependencia, telefono, created_by, debe_cambiar_password
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
      RETURNING idusuario, nombreusuario, email, rol, estado, dependencia, debe_cambiar_password
    `, [
      nombreusuario,
      contraseniausuario,
      dependencia,
      email,
      rol,
      estado,
      dependencia,
      telefono,
      createdBy
    ]);
  }

  /**
   * Actualizar información de un usuario
   */
  static async actualizar(id, { nombreusuario, email, rol, estado, dependencia, telefono }) {
    return pool.query(`
      UPDATE usuario
      SET 
        nombreusuario = COALESCE($1, nombreusuario),
        email = COALESCE($2, email),
        rol = COALESCE($3, rol),
        estado = COALESCE($4, estado),
        dependencia = COALESCE($5, dependencia),
        telefono = COALESCE($6, telefono),
        fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE idusuario = $7
      RETURNING idusuario, nombreusuario, email, rol, estado, dependencia, telefono
    `, [nombreusuario, email, rol, estado, dependencia, telefono, id]);
  }

  /**
   * Cambiar estado de un usuario (activo, inactivo, bloqueado)
   */
  static async cambiarEstado(id, nuevoEstado) {
    return pool.query(`
      UPDATE usuario
      SET estado = $1, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE idusuario = $2
      RETURNING idusuario, nombreusuario, estado
    `, [nuevoEstado, id]);
  }

  /**
   * Restablecer contraseña temporal obligatoria
   */
  static async restablecerPassword(id, hashedPassword) {
    return pool.query(`
      UPDATE usuario
      SET contraseniausuario = $1, debe_cambiar_password = true, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE idusuario = $2
      RETURNING idusuario, nombreusuario, email
    `, [hashedPassword, id]);
  }

  /**
   * Actualizar perfil personal de usuario (email, teléfono, dependencia, contraseña opcional)
   */
  static async actualizarPerfil(id, { email, telefono, dependencia, hashedPassword }) {
    if (hashedPassword) {
      return pool.query(`
        UPDATE usuario
        SET 
          email = COALESCE($1, email),
          telefono = COALESCE($2, telefono),
          dependencia = COALESCE($3, dependencia),
          contraseniausuario = $4,
          debe_cambiar_password = false,
          fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE idusuario = $5
        RETURNING idusuario, nombreusuario, email, rol, estado, dependencia, telefono, fecha_registro, ultimo_acceso
      `, [email, telefono, dependencia, hashedPassword, id]);
    } else {
      return pool.query(`
        UPDATE usuario
        SET 
          email = COALESCE($1, email),
          telefono = COALESCE($2, telefono),
          dependencia = COALESCE($3, dependencia),
          fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE idusuario = $4
        RETURNING idusuario, nombreusuario, email, rol, estado, dependencia, telefono, fecha_registro, ultimo_acceso
      `, [email, telefono, dependencia, id]);
    }
  }

  /**
   * Eliminar usuario por ID
   */
  static async eliminar(id) {
    return pool.query(
      'DELETE FROM usuario WHERE idusuario = $1 RETURNING idusuario, nombreusuario',
      [id]
    );
  }

  /**
   * Cuenta cuántos superadministradores activos existen en el sistema (opcionalmente excluyendo a uno por ID)
   */
  static async contarSuperadminsActivos(excluirId = null) {
    if (excluirId) {
      const res = await pool.query(
        "SELECT COUNT(*)::int AS total FROM usuario WHERE rol = 'superadmin' AND estado = 'activo' AND idusuario != $1",
        [parseInt(excluirId)]
      );
      return res.rows[0]?.total || 0;
    }
    const res = await pool.query(
      "SELECT COUNT(*)::int AS total FROM usuario WHERE rol = 'superadmin' AND estado = 'activo'"
    );
    return res.rows[0]?.total || 0;
  }

  /**
   * Verificar si un username ya existe para otro usuario
   */
  static async verificarUsernameDuplicado(nombreusuario, idExcluir) {
    return pool.query(
      'SELECT idusuario FROM usuario WHERE LOWER(nombreusuario) = LOWER($1) AND idusuario != $2',
      [nombreusuario.trim(), idExcluir]
    );
  }

  /**
   * Verificar si un email ya existe para otro usuario
   */
  static async verificarEmailDuplicado(email, idExcluir) {
    return pool.query(
      'SELECT idusuario FROM usuario WHERE LOWER(email) = LOWER($1) AND idusuario != $2',
      [email.trim(), idExcluir]
    );
  }

  /**
   * Consultar hash de contraseña actual por ID
   */
  static async obtenerPasswordHash(id) {
    return pool.query('SELECT contraseniausuario FROM usuario WHERE idusuario = $1', [id]);
  }

  /**
   * Actualizar usuario con contraseña opcional y rol/estado
   */
  static async actualizarCompleto(id, { nombreusuario, email, hashedPassword, rol, estado, dependencia, telefono }) {
    return pool.query(`
      UPDATE usuario SET
        nombreusuario = COALESCE($1, nombreusuario),
        email = COALESCE($2, email),
        contraseniausuario = $3,
        rol = COALESCE($4, rol),
        estado = COALESCE($5, estado),
        dependencia = COALESCE($6, dependencia),
        telefono = COALESCE($7, telefono),
        fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE idusuario = $8
      RETURNING idusuario, nombreusuario, email, rol, estado, dependencia, debe_cambiar_password
    `, [
      nombreusuario ? nombreusuario.trim() : null,
      email ? email.trim() : null,
      hashedPassword,
      rol || null,
      estado || null,
      dependencia || null,
      telefono ? telefono.trim() : null,
      id
    ]);
  }

  /**
   * Obtener registros de auditoría de actividad
   */
  static async obtenerLogsAuditoria(limite = 100) {
    return pool.query(`
      SELECT 
        l.id_log,
        l.id_usuario,
        u.nombreusuario,
        l.accion,
        l.tabla_afectada,
        l.id_registro,
        l.descripcion,
        l.ip AS ip_origen,
        l.fecha AS fecha_hora
      FROM logs_actividad l
      LEFT JOIN usuario u ON l.id_usuario = u.idusuario
      ORDER BY l.id_log DESC
      LIMIT $1
    `, [limite]);
  }
}

module.exports = UsuarioModel;
