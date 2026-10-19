const { Pool } = require("pg");
const dbConfig = require("./db.config");

/**
 * Instancia canónica del Pool de conexiones PostgreSQL (SIGI).
 * Centralizada bajo config/ conforme a las guías de arquitectura limpia.
 */
const pool = new Pool(dbConfig);

module.exports = pool;
