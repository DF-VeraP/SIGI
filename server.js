const session = require("express-session");
const express = require("express");
require('dotenv').config();
const pool = require("./db");
const { errorHandler } = require('./middleware/error.middleware');

const helmet = require("helmet");
const app = express();

// Protección de cabeceras HTTP (Anti-clickjacking, XSS, MIME Sniffing, ocultar X-Powered-By)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(express.static("public"));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || "mi_secreto_super_seguro",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 40 * 60 * 1000, // 40 minutos de inactividad
    httpOnly: true,
    sameSite: 'lax'
  },
  rolling: true // Renueva automáticamente la sesión en cada petición
}));

app.get("/", (req, res) => {
  res.redirect("/dashboard/index.html");
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error conectando a la base de datos");
  }
});

// app.use("/admin-static", express.static("public/admin")); // Ya está cubierto por public

app.use('/', require('./routes/geografia.routes'));
app.use('/', require('./routes/incidentes.routes'));
app.use('/', require('./routes/autocompletado.routes'));
app.use('/', require('./routes/estadisticas.routes'));
app.use('/', require('./routes/tablas.routes'));
app.use('/', require('./routes/auth.routes'));
app.use('/', require('./routes/usuarios.routes'));
app.use('/', require('./routes/catalogos.routes'));
app.use('/', require('./routes/filtros.routes'));

app.use(errorHandler);

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT} 🚀`);
  });
}