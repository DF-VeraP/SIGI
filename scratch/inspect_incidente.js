const pool = require('../db');

async function inspectIncidente() {
    try {
        const cols = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'incidente'
            ORDER BY ordinal_position;
        `);
        console.log("📌 COLUMNAS DE 'incidente':");
        console.table(cols.rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

inspectIncidente();
