// Proxy para compatibilidad regresiva con imports históricos y suites de pruebas Jest
// La instancia canónica del Pool reside en ./config/db.js
module.exports = require("./config/db");