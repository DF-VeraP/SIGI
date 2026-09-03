const pool = require('../db');

async function setFelipeSuperadmin() {
    try {
        const res = await pool.query("UPDATE usuario SET rol = 'superadmin' WHERE LOWER(nombreusuario) = 'felipe' RETURNING *");
        console.log("UPDATED USER:", JSON.stringify(res.rows, null, 2));

        const allUsers = await pool.query("SELECT idusuario, nombreusuario, email, rol, estado FROM usuario ORDER BY idusuario ASC");
        console.log("CURRENT USERS:", JSON.stringify(allUsers.rows, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

setFelipeSuperadmin();
