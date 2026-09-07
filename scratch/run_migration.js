const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function run() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '../sql/migration_falta.sql'), 'utf-8');
    console.log('Ejecutando migración...');
    await pool.query(sql);
    console.log('Migración completada con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('Error al ejecutar migración:', error);
    process.exit(1);
  }
}

run();
