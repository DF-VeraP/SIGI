const session = require("express-session");
const express = require("express");
require('dotenv').config();
const pool = require("./db");
const { errorHandler } = require('./middleware/error.middleware');

const app = express();
app.use(express.static("public"));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || "mi_secreto_super_seguro",
  resave: false,
  saveUninitialized: false
}));

app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
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
app.use('/', require('./routes/filtros.routes'));

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`El servidor ta corriendo en el puerto ${PORT} papá`);
});