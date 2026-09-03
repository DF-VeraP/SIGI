const pool = require('../db');
const bcrypt = require('bcrypt');

async function main() {
  const pass = await bcrypt.hash('1234', 10);

  // 1. SuperAdmin (Daniel)
  await pool.query(`
    UPDATE usuario 
    SET contraseniausuario = $1, rol = 'superadmin', estado = 'activo', dependencia = 'Despacho del Alcalde'
    WHERE idusuario = 1
  `, [pass]);

  // 2. Reportero (Felipe)
  await pool.query(`
    UPDATE usuario 
    SET contraseniausuario = $1, rol = 'reportero', estado = 'activo', dependencia = 'Defensa Civil Terreno'
    WHERE idusuario = 2
  `, [pass]);

  // 3. Admin (admin_carlos)
  const checkAdmin = await pool.query("SELECT idusuario FROM usuario WHERE nombreusuario = 'admin_carlos'");
  if (checkAdmin.rows.length === 0) {
    await pool.query(`
      INSERT INTO usuario (nombreusuario, contraseniausuario, entidadusuario, email, rol, estado, dependencia)
      VALUES ('admin_carlos', $1, 'Secretaría de Gobierno', 'carlos@sigi.gov.co', 'admin', 'activo', 'Secretaría de Gobierno')
    `, [pass]);
  } else {
    await pool.query(`
      UPDATE usuario
      SET contraseniausuario = $1, entidadusuario = 'Secretaría de Gobierno', rol = 'admin', estado = 'activo', dependencia = 'Secretaría de Gobierno'
      WHERE nombreusuario = 'admin_carlos'
    `, [pass]);
  }

  const allUsers = await pool.query("SELECT idusuario, nombreusuario, email, rol, estado, dependencia FROM usuario ORDER BY idusuario ASC");
  console.log("=================================================");
  console.log("👥 USUARIOS HABILITADOS EN EL SISTEMA SIGI v2:");
  console.log("=================================================");
  console.table(allUsers.rows);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
