const pool = require('../db');

async function testSharedQueueLocking() {
    try {
        console.log("🧪 INICIANDO PRUEBAS DE COLA COMPARTIDA Y BLOQUEO DE INCIDENTES...\n");

        // 1. Crear un incidente de prueba
        const insRes = await pool.query(`
            INSERT INTO incidente (
                codigoincidente, idtipoincidente, fechaincidente, horaincidente,
                descripcionincidente, geom, idusuario, id_usuario_creador, id_estado, id_gravedad
            )
            VALUES (
                'TEST-LOCK-001', 1, CURRENT_DATE, CURRENT_TIME,
                'Incidente de prueba para cola compartida y toma de control',
                ST_SetSRID(ST_MakePoint(-75.56, 6.25), 4326),
                13, 13, 1, 3
            )
            RETURNING idincidente, codigoincidente, id_estado, id_admin_revisor;
        `);

        const testId = insRes.rows[0].idincidente;
        console.log(`✅ 1. Incidente de prueba creado: ID #${testId} (Estado: ${insRes.rows[0].id_estado}, Revisor: ${insRes.rows[0].id_admin_revisor})`);

        // 2. Admin 1 (Felipe - ID: 2) Toma la revisión
        const take1 = await pool.query(`
            UPDATE incidente
            SET id_admin_revisor = $1,
                id_estado = 2,
                fecha_toma_revision = CURRENT_TIMESTAMP
            WHERE idincidente = $2
              AND (id_admin_revisor IS NULL OR id_admin_revisor = $1 OR id_estado = 1)
            RETURNING idincidente, id_estado, id_admin_revisor;
        `, [2, testId]);

        console.log(`✅ 2. Admin 1 (Felipe, ID 2) tomó la revisión:`, take1.rows[0]);

        // 3. Admin 2 (admin_carlos - ID: 17) Intenta tomar el MISMO incidente
        const take2 = await pool.query(`
            UPDATE incidente
            SET id_admin_revisor = $1,
                id_estado = 2,
                fecha_toma_revision = CURRENT_TIMESTAMP
            WHERE idincidente = $2
              AND (id_admin_revisor IS NULL OR id_admin_revisor = $1 OR id_estado = 1)
            RETURNING idincidente, id_estado, id_admin_revisor;
        `, [17, testId]);

        if (take2.rows.length === 0) {
            console.log(`🛡️ 3. BLOQUEO EXITOSO: Admin 2 (admin_carlos, ID 17) fue rechazado porque el incidente ya pertenece a Admin 1.`);
        } else {
            console.error(`❌ FALLO EN BLOQUEO: Admin 2 pudo tomar un incidente ya reservado.`);
        }

        // 4. Admin 1 Libera la revisión
        await pool.query(`
            UPDATE incidente
            SET id_admin_revisor = NULL,
                id_estado = 1,
                fecha_toma_revision = NULL
            WHERE idincidente = $1;
        `, [testId]);

        console.log(`✅ 4. Admin 1 liberó el incidente. Vuelve a id_estado = 1, id_admin_revisor = NULL.`);

        // 5. Admin 2 Toma la revisión libre
        const take3 = await pool.query(`
            UPDATE incidente
            SET id_admin_revisor = $1,
                id_estado = 2,
                fecha_toma_revision = CURRENT_TIMESTAMP
            WHERE idincidente = $2
              AND (id_admin_revisor IS NULL OR id_admin_revisor = $1 OR id_estado = 1)
            RETURNING idincidente, id_estado, id_admin_revisor;
        `, [17, testId]);

        console.log(`✅ 5. Admin 2 (admin_carlos, ID 17) tomó la revisión libre:`, take3.rows[0]);

        // 6. Admin 2 Aprueba/Resuelve el incidente
        const resolve = await pool.query(`
            UPDATE incidente
            SET id_estado = 5,
                id_usuario_editor = $1,
                fecha_edicion = CURRENT_TIMESTAMP
            WHERE idincidente = $2
            RETURNING idincidente, id_estado;
        `, [17, testId]);

        console.log(`🎉 6. Incidente aprobado/resuelto exitosamente:`, resolve.rows[0]);

        // Cleanup test record
        await pool.query(`DELETE FROM incidente WHERE idincidente = $1`, [testId]);
        console.log(`\n🧹 Limpieza completada. Incidente de prueba #${testId} eliminado.`);

        process.exit(0);
    } catch (err) {
        console.error("❌ Error durante la prueba de cola compartida:", err);
        process.exit(1);
    }
}

testSharedQueueLocking();
