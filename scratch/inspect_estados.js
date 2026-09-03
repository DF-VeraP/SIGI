const pool = require('../db');

async function inspectEstados() {
    try {
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name LIKE '%estado%' OR table_name LIKE '%incidente%';
        `);
        console.log("TABLES MATCHING estado/incidente:");
        console.table(tables.rows);

        for (const t of tables.rows) {
            if (t.table_name === 'estado_incidente' || t.table_name === 'estado' || t.table_name === 'tipoincidente' || t.table_name === 'gravedad_incidente') {
                const data = await pool.query(`SELECT * FROM ${t.table_name}`);
                console.log(`\n📌 DATOS DE '${t.table_name}':`);
                console.table(data.rows);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

inspectEstados();
