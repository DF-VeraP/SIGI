const bcrypt = require('bcrypt');
const crypto = require('crypto');
const pool = require('../db');
const UsuarioModel = require('../models/usuario.model');
const { registrarLogActividad } = require('../utils/logger');
const { enviarEmailBienvenida } = require('../utils/mailer');

// Expresión regular para validación de formato de correo
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Obtener todos los usuarios (Superadmin y Admin)
const getUsuarios = async (req, res) => {
  try {
    const result = await UsuarioModel.obtenerTodos();
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
    const result = await UsuarioModel.obtenerPorId(id);

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

  const cleanNombre = nombreusuario.trim();
  const cleanEmail = email.trim();
  const userRol = rol || 'reportero';
  const userEstado = (estado === 'inactivo') ? 'inactivo' : 'activo';
  const userDependencia = dependencia || 'General';

  try {
    // 2. Verificar duplicado estricto por nombre de usuario o email (insensible a mayúsculas)
    const dupCheck = await UsuarioModel.verificarDuplicado(cleanNombre, cleanEmail);

    if (dupCheck.rows.length > 0) {
      const match = dupCheck.rows[0];
      if (match.email && match.email.toLowerCase() === cleanEmail.toLowerCase()) {
        return res.status(400).json({ mensaje: 'El correo electrónico ya se encuentra registrado por otro usuario ⚠️' });
      }
      return res.status(400).json({ mensaje: 'El nombre de usuario ya se encuentra registrado ⚠️' });
    }

    // 3. Generar contraseña temporal automática segura (no la define el admin)
    const passwordTemporal = String(Math.floor(100000 + crypto.randomInt(900000)));
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(passwordTemporal, saltRounds);

    // 4. Insertar nuevo usuario con debe_cambiar_password = true por defecto
    const result = await UsuarioModel.crear({
      nombreusuario: cleanNombre,
      contraseniausuario: hashedPassword,
      dependencia: userDependencia,
      email: cleanEmail,
      rol: userRol,
      estado: userEstado,
      telefono: telefono ? telefono.trim() : null,
      createdBy: req.session.idusuario || null
    });

    const nuevoUsuario = result.rows[0];

    // 5. Enviar correo de bienvenida con credenciales y notificación de primer ingreso
    try {
      await enviarEmailBienvenida(cleanEmail, cleanNombre, passwordTemporal, req);
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
      mensaje: 'Usuario registrado exitosamente. Se ha enviado el acceso temporal a su correo electrónico ✅',
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
    const userCheck = await UsuarioModel.obtenerPorId(id);
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
    const result = await UsuarioModel.cambiarEstado(id, estado);

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
    const userCheck = await UsuarioModel.obtenerPorId(id);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado ❌' });
    }

    const nombreEliminado = userCheck.rows[0].nombreusuario;

    await UsuarioModel.eliminar(id);

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

// Obtener información del perfil personal del usuario autenticado
const getPerfil = async (req, res) => {
  try {
    const id = req.session.idusuario;
    if (!id) {
      return res.status(401).json({ mensaje: 'Sesión no iniciada' });
    }

    const result = await UsuarioModel.obtenerPorId(id);
    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const u = result.rows[0];
    res.json({
      idusuario: u.idusuario,
      nombreusuario: u.nombreusuario,
      email: u.email || '',
      rol: u.rol || 'reportero',
      estado: u.estado || 'activo',
      dependencia: u.dependencia || '',
      telefono: u.telefono || '',
      fecha_registro: u.fecha_registro,
      ultimo_acceso: u.ultimo_acceso
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ mensaje: 'Error al obtener datos del perfil' });
  }
};

// Actualizar perfil personal (email, teléfono, contraseña opcional)
const actualizarPerfil = async (req, res) => {
  try {
    const id = req.session.idusuario;
    if (!id) {
      return res.status(401).json({ mensaje: 'Sesión no iniciada' });
    }

    const { email, telefono, dependencia, password_actual, password_nuevo } = req.body;

    const userCheck = await UsuarioModel.obtenerPorId(id);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    const currentRecord = userCheck.rows[0];

    // 1. Validar email si fue enviado
    let cleanEmail = null;
    if (email && email.trim() !== '') {
      cleanEmail = email.trim();
      if (!EMAIL_REGEX.test(cleanEmail)) {
        return res.status(400).json({ mensaje: 'El correo electrónico no tiene un formato válido ⚠️' });
      }
      const dupEmail = await pool.query(
        'SELECT idusuario FROM usuario WHERE LOWER(email) = LOWER($1) AND idusuario != $2',
        [cleanEmail, id]
      );
      if (dupEmail.rows.length > 0) {
        return res.status(400).json({ mensaje: 'El correo electrónico ya se encuentra registrado por otro usuario ⚠️' });
      }
    }

    // 2. Validar cambio de contraseña si fue enviado
    let hashedPassword = null;
    if (password_nuevo && password_nuevo.trim() !== '') {
      if (!password_actual || password_actual.trim() === '') {
        return res.status(400).json({ mensaje: 'Debes ingresar tu contraseña actual para confirmar el cambio ⚠️' });
      }

      // Obtener hash actual de la BD
      const authQuery = await pool.query('SELECT contraseniausuario FROM usuario WHERE idusuario = $1', [id]);
      const validCurrent = await bcrypt.compare(password_actual, authQuery.rows[0].contraseniausuario);
      if (!validCurrent) {
        return res.status(400).json({ mensaje: 'La contraseña actual ingresada es incorrecta ❌' });
      }

      // Validar complejidad de nueva contraseña
      if (password_nuevo.length < 8) {
        return res.status(400).json({ mensaje: 'La nueva contraseña debe tener al mensaje al menos 8 caracteres ⚠️' });
      }
      if (!/[A-Z]/.test(password_nuevo)) {
        return res.status(400).json({ mensaje: 'La nueva contraseña debe incluir al menos una letra mayúscula ⚠️' });
      }
      if (!/[a-z]/.test(password_nuevo)) {
        return res.status(400).json({ mensaje: 'La nueva contraseña debe incluir al menos una letra minúscula ⚠️' });
      }
      if (!/\d/.test(password_nuevo)) {
        return res.status(400).json({ mensaje: 'La nueva contraseña debe incluir al menos un número ⚠️' });
      }

      hashedPassword = await bcrypt.hash(password_nuevo, 10);
    }

    const result = await UsuarioModel.actualizarPerfil(id, {
      email: cleanEmail,
      telefono: telefono ? telefono.trim() : null,
      dependencia: dependencia ? dependencia.trim() : null,
      hashedPassword
    });

    const updated = result.rows[0];

    // Sincronizar sesión
    if (cleanEmail) req.session.email = cleanEmail;
    if (dependencia) req.session.dependencia = dependencia;
    if (hashedPassword) req.session.debe_cambiar_password = false;

    await registrarLogActividad(
      id,
      'ACTUALIZAR_PERFIL',
      'usuario',
      id,
      `Usuario ${updated.nombreusuario} actualizó su perfil${hashedPassword ? ' con cambio de contraseña' : ''}`,
      req
    );

    res.json({
      mensaje: 'Perfil actualizado exitosamente ✅',
      usuario: updated
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ mensaje: 'Error al actualizar información del perfil' });
  }
};

module.exports = {
  getUsuarios,
  getUsuarioById,
  crearUsuario,
  actualizarUsuario,
  cambiarEstadoUsuario,
  eliminarUsuario,
  getAuditoriaLogs,
  getPerfil,
  actualizarPerfil
};
