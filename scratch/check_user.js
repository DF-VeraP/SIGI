const pool = require('../db');

async function checkUser() {
    try {
        const res = await pool.query("SELECT idusuario, nombreusuario, email, rol, estado FROM usuario WHERE nombreusuario = 'felipe' OR nombreusuario LIKE '%felipe%'");
        console.log("USERS:", JSON.stringify(res.rows, null, 2));

        const allUsers = await pool.query("SELECT idusuario, nombreusuario, email, rol, estado FROM usuario");
        console.log("ALL USERS:", JSON.stringify(allUsers.rows, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUser();
