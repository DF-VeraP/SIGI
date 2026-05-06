const session = require("express-session");
const express = require("express");
const pool = require("./db");

const app = express();
app.use(express.static("Frontend"));
app.use(express.json());

app.use(session({
  secret: "mi_secreto_super_seguro",
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


app.use("/admin-static", express.static("Admin"));

app.use('/', require('./Direcciones/Geografia'));
app.use('/', require('./Direcciones/Incidentes'));
app.use('/', require('./Direcciones/Autocompletado'));
app.use('/', require('./Direcciones/Estadisticas'));
app.use('/', require('./Direcciones/Tablas'));
app.use('/', require('./Direcciones/Autenticacion'));



app.listen(3000, () => {
  console.log("El servido ta corriendo en el puerto 3000 papá");
});