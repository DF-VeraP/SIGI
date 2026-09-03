const pool = require('../db');

async function checkUsers() {
  const res = await pool.query("SELECT idusuario, nombreusuario, email, rol, estado FROM usuario");
  console.log("Usuarios en la BD:", res.rows);
}

checkUsers().then(() => pool.end());
