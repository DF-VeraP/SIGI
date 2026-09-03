const pool = require('../db');

async function inspectSchema() {
    try {
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `);
        console.log("📋 TABLAS EN DB:");
        console.table(tables.rows);

        for (const t of tables.rows) {
            const cols = await pool.query(`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = $1
                ORDER BY ordinal_position;
            `, [t.table_name]);
            console.log(`\n📌 COLUMNAS DE '${t.table_name}':`);
            console.table(cols.rows);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

inspectSchema();
