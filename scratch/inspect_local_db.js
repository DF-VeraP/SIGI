const pool = require('../config/db');

async function check() {
  try {
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
    console.log('TABLAS_LOCALES:', tables.rows.map(r => r.table_name).join(', '));
    
    if (tables.rows.some(r => r.table_name === 'usuario')) {
      const u = await pool.query("SELECT id_usuario, nombre, usuario, email, rol, estado FROM usuario");
      console.log('USUARIOS_LOCALES:', JSON.stringify(u.rows, null, 2));
    }
    
    if (tables.rows.some(r => r.table_name === 'incidente')) {
      const i = await pool.query("SELECT count(*) as total FROM incidente");
      console.log('TOTAL_INCIDENTES_LOCALES:', i.rows[0].total);
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

check();
