const bcrypt = require('bcrypt');
const pool = require('../db');
const { registrarLogActividad } = require('../utils/logger');
const { enviarEmailBienvenida } = require('../utils/mailer');

// Expresión regular para validación de formato de correo
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
        debe_cambiar_password,
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
        debe_cambiar_password,
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

  // 1. Validaciones de obligatoriedad
  if (!nombreusuario || !nombreusuario.trim()) {
    return res.status(400).json({ mensaje: 'El nombre de usuario es obligatorio ⚠️' });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({ mensaje: 'El correo electrónico es obligatorio para el registro ⚠️' });
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ mensaje: 'Debes ingresar un formato de correo electrónico válido ⚠️' });
  }

  if (!contrasenia || contrasenia.length < 6) {
    return res.status(400).json({ mensaje: 'La contraseña temporal es obligatoria y debe tener al menos 6 caracteres ⚠️' });
  }

  const cleanNombre = nombreusuario.trim();
  const cleanEmail = email.trim();
  const userRol = rol || 'reportero';
  // El estado al registrar solo puede ser activo o inactivo (no bloqueado)
  const userEstado = (estado === 'inactivo') ? 'inactivo' : 'activo';
  const userDependencia = dependencia || 'General';

  try {
    // 2. Verificar duplicado estricto por nombre de usuario o email (insensible a mayúsculas)
    const dupCheck = await pool.query(
      'SELECT idusuario, nombreusuario, email FROM usuario WHERE LOWER(nombreusuario) = LOWER($1) OR LOWER(email) = LOWER($2)',
      [cleanNombre, cleanEmail]
    );

    if (dupCheck.rows.length > 0) {
      const match = dupCheck.rows[0];
      if (match.email && match.email.toLowerCase() === cleanEmail.toLowerCase()) {
        return res.status(400).json({ mensaje: 'El correo electrónico ya se encuentra registrado por otro usuario ⚠️' });
      }
      return res.status(400).json({ mensaje: 'El nombre de usuario ya se encuentra registrado ⚠️' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contrasenia, saltRounds);

    // 3. Insertar nuevo usuario con debe_cambiar_password = true por defecto
    const result = await pool.query(`
      INSERT INTO usuario (
        nombreusuario, contraseniausuario, entidadusuario, email, rol, estado, dependencia, telefono, created_by, debe_cambiar_password
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
      RETURNING idusuario, nombreusuario, email, rol, estado, dependencia, debe_cambiar_password
    `, [
      cleanNombre,
      hashedPassword,
      userDependencia,
      cleanEmail,
      userRol,
      userEstado,
      userDependencia,
      telefono ? telefono.trim() : null,
      req.session.idusuario || null
    ]);

    const nuevoUsuario = result.rows[0];

    // 4. Enviar correo de bienvenida con credenciales y notificación de primer ingreso
    try {
      await enviarEmailBienvenida(cleanEmail, cleanNombre, contrasenia, req);
    } catch (mailError) {
      console.error('Aviso: No se pudo enviar el correo de bienvenida:', mailError);
    }

    await registrarLogActividad(
      req.session.idusuario,
      'CREAR_USUARIO',
      'usuario',
      nuevoUsuario.idusuario,
      `Usuario ${nuevoUsuario.nombreusuario} creado con correo ${nuevoUsuario.email} y rol ${nuevoUsuario.rol}`,
      req
    );

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente. Se ha enviado una notificación a su correo electrónico ✅',
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

    // Validación de duplicidad si se actualiza el nombre de usuario
    if (nombreusuario && nombreusuario.trim() !== '') {
      const dupUser = await pool.query(
        'SELECT idusuario FROM usuario WHERE LOWER(nombreusuario) = LOWER($1) AND idusuario != $2',
        [nombreusuario.trim(), id]
      );
      if (dupUser.rows.length > 0) {
        return res.status(400).json({ mensaje: 'El nombre de usuario ya se encuentra registrado por otro usuario ⚠️' });
      }
    }

    // Validación de correo si se actualiza
    if (email && email.trim() !== '') {
      if (!EMAIL_REGEX.test(email.trim())) {
        return res.status(400).json({ mensaje: 'El correo electrónico no tiene un formato válido ⚠️' });
      }
      const dupEmail = await pool.query(
        'SELECT idusuario FROM usuario WHERE LOWER(email) = LOWER($1) AND idusuario != $2',
        [email.trim(), id]
      );
      if (dupEmail.rows.length > 0) {
        return res.status(400).json({ mensaje: 'El correo electrónico ya se encuentra registrado por otro usuario ⚠️' });
      }
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
