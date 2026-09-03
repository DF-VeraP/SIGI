const bcrypt = require('bcrypt');
const pool = require('../db');
const { registrarLogActividad } = require('../utils/logger');

// Obtener todos los usuarios (Superadmin y Admin)
const getUsuarios = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        idusuario,
        nombreusuario,
        email,
        rol,
        estado,
        dependencia,
        telefono,
        ultimo_acceso,
        fecha_registro
      FROM usuario
      ORDER BY idusuario ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
  }
};

// Obtener usuario por ID
const getUsuarioById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        idusuario,
        nombreusuario,
        email,
        rol,
        estado,
        dependencia,
        telefono,
        ultimo_acceso,
        fecha_registro
      FROM usuario
      WHERE idusuario = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado ❌' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

// Crear nuevo usuario (Solo Superadmin)
const crearUsuario = async (req, res) => {
  const { nombreusuario, email, rol, estado, dependencia, telefono } = req.body;
  const contrasenia = req.body.contrasenia || req.body.contraseniausuario;

  if (!nombreusuario || !contrasenia) {
    return res.status(400).json({ mensaje: 'El nombre de usuario y la contraseña son obligatorios ⚠️' });
  }

  const userRol = rol || 'reportero';
  const userEstado = estado || 'activo';
  const userDependencia = dependencia || 'General';

  try {
    // Verificar duplicado por nombre de usuario o email
    const dupCheck = await pool.query(
      'SELECT idusuario FROM usuario WHERE nombreusuario = $1 OR (email IS NOT NULL AND email = $2)',
      [nombreusuario, email || null]
    );

    if (dupCheck.rows.length > 0) {
      return res.status(400).json({ mensaje: 'El nombre de usuario o email ya se encuentra registrado ⚠️' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contrasenia, saltRounds);

    const result = await pool.query(`
      INSERT INTO usuario (
        nombreusuario, contraseniausuario, entidadusuario, email, rol, estado, dependencia, telefono, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING idusuario, nombreusuario, email, rol, estado, dependencia
    `, [
      nombreusuario,
      hashedPassword,
      userDependencia,
      email || null,
      userRol,
      userEstado,
      userDependencia,
      telefono || null,
      req.session.idusuario || null
    ]);

    const nuevoUsuario = result.rows[0];

    await registrarLogActividad(
      req.session.idusuario,
      'CREAR_USUARIO',
      'usuario',
      nuevoUsuario.idusuario,
      `Usuario ${nuevoUsuario.nombreusuario} creado con rol ${nuevoUsuario.rol}`,
      req
    );

    res.status(201).json({
      mensaje: 'Usuario creado exitosamente ✅',
      usuario: nuevoUsuario
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ mensaje: 'Error al crear usuario en el servidor' });
  }
};

// Actualizar usuario (Solo Superadmin)
const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombreusuario, email, contrasenia, rol, estado, dependencia, telefono } = req.body;

  try {
    const userCheck = await pool.query('SELECT * FROM usuario WHERE idusuario = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado ❌' });
    }

    let hashedPassword = userCheck.rows[0].contraseniausuario;
    if (contrasenia && contrasenia.trim() !== '') {
      hashedPassword = await bcrypt.hash(contrasenia, 10);
    }

    const updatedUser = await pool.query(`
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
      RETURNING idusuario, nombreusuario, email, rol, estado, dependencia
    `, [
      nombreusuario || null,
      email || null,
      hashedPassword,
      rol || null,
      estado || null,
      dependencia || null,
      telefono || null,
      id
    ]);

    await registrarLogActividad(
      req.session.idusuario,
      'EDITAR_USUARIO',
      'usuario',
      id,
      `Usuario ID ${id} actualizado (Rol: ${updatedUser.rows[0].rol}, Estado: ${updatedUser.rows[0].estado})`,
      req
    );

    res.json({
      mensaje: 'Usuario actualizado exitosamente ✅',
      usuario: updatedUser.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ mensaje: 'Error al actualizar usuario' });
  }
};

// Cambiar estado de usuario (Solo Superadmin)
const cambiarEstadoUsuario = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const estadosValidos = ['activo', 'inactivo', 'pendiente', 'bloqueado'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ mensaje: 'Estado no válido. Use: activo, inactivo, pendiente, bloqueado ⚠️' });
  }

  try {
    const result = await pool.query(
      'UPDATE usuario SET estado = $1, fecha_actualizacion = CURRENT_TIMESTAMP WHERE idusuario = $2 RETURNING idusuario, nombreusuario, estado',
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado ❌' });
    }

    await registrarLogActividad(
      req.session.idusuario,
      'CAMBIAR_ESTADO_USUARIO',
      'usuario',
      id,
      `Estado del usuario ID ${id} cambiado a ${estado}`,
      req
    );

    res.json({
      mensaje: `Estado cambiado a ${estado} exitosamente ✅`,
      usuario: result.rows[0]
    });
  } catch (error) {
    console.error('Error al cambiar estado de usuario:', error);
    res.status(500).json({ mensaje: 'Error al cambiar estado de usuario' });
  }
};

// Obtener logs de auditoría del sistema (Solo Superadmin)
const getAuditoriaLogs = async (req, res) => {
  try {
    const result = await pool.query(`
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
      LIMIT 100
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener logs de auditoría:', error);
    res.status(500).json({ mensaje: 'Error al obtener logs de auditoría' });
  }
};

// Eliminar usuario (Solo Superadmin)
const eliminarUsuario = async (req, res) => {
  const { id } = req.params;

  if (parseInt(id) === req.session.idusuario) {
    return res.status(400).json({ mensaje: 'No puedes eliminar tu propio usuario en sesión ⚠️' });
  }

  try {
    const userCheck = await pool.query('SELECT nombreusuario FROM usuario WHERE idusuario = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado ❌' });
    }

    const nombreEliminado = userCheck.rows[0].nombreusuario;

    await pool.query('DELETE FROM usuario WHERE idusuario = $1', [id]);

    await registrarLogActividad(
      req.session.idusuario,
      'ELIMINAR_USUARIO',
      'usuario',
      id,
      `Usuario ${nombreEliminado} (ID: ${id}) eliminado del sistema`,
      req
    );

    res.json({ mensaje: `Usuario ${nombreEliminado} eliminado correctamente ✅` });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ mensaje: 'Error al eliminar usuario. Puede tener registros o incidentes asociados.' });
  }
};

module.exports = {
  getUsuarios,
  getUsuarioById,
  crearUsuario,
  actualizarUsuario,
  cambiarEstadoUsuario,
  eliminarUsuario,
  getAuditoriaLogs
};
