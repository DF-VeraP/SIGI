const pool = require('../db');

async function migrateIncidenteLock() {
    try {
        console.log("🛠️ Iniciando migración de base de datos para Cola Compartida...");

        // 1. Agregar columna id_admin_revisor si no existe
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='incidente' AND column_name='id_admin_revisor'
                ) THEN 
                    ALTER TABLE incidente ADD COLUMN id_admin_revisor INTEGER REFERENCES usuario(idusuario);
                    RAISE NOTICE 'Columna id_admin_revisor agregada';
                END IF;
            END $$;
        `);

        // 2. Agregar columna fecha_toma_revision si no existe
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='incidente' AND column_name='fecha_toma_revision'
                ) THEN 
                    ALTER TABLE incidente ADD COLUMN fecha_toma_revision TIMESTAMP;
                    RAISE NOTICE 'Columna fecha_toma_revision agregada';
                END IF;
            END $$;
        `);

        // 3. Garantizar que id_estado no sea NULL (asignar 1 - Reportado por defecto si fuera NULL)
        await pool.query(`
            UPDATE incidente SET id_estado = 1 WHERE id_estado IS NULL;
        `);

        const cols = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name='incidente' AND column_name IN ('id_admin_revisor', 'fecha_toma_revision', 'id_estado')
        `);

        console.log("✅ Migración completada exitosamente. Columnas actualizadas:");
        console.table(cols.rows);

        process.exit(0);
    } catch (err) {
        console.error("❌ Error en la migración:", err);
        process.exit(1);
    }
}

migrateIncidenteLock();
