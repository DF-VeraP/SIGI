const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const express = require("express");
require('dotenv').config();
const pool = require("./db");
const { errorHandler } = require('./middleware/error.middleware');
const { csrfProtection, getCsrfToken } = require('./middleware/csrf.middleware');

const helmet = require("helmet");
const path = require("path");
const app = express();

// Protección de cabeceras HTTP (Anti-clickjacking, XSS, MIME Sniffing, ocultar X-Powered-By)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(express.static("public"));
app.use(express.json());

// Configuración de persistencia de sesiones en PostgreSQL (connect-pg-simple)
// En entorno de tests (NODE_ENV === 'test'), usa almacenamiento en memoria para agilidad de Jest.
let sessionStore;
if (process.env.NODE_ENV !== 'test') {
  try {
    sessionStore = new pgSession({
      pool: pool,
      tableName: 'session',
      createTableIfMissing: true,
      pruneSessionInterval: 60 * 15 // Limpieza de sesiones expiradas cada 15 min
    });
    sessionStore.on('error', (err) => {
      console.warn('Aviso de persistencia de sesiones en PostgreSQL:', err.message);
    });
  } catch (storeErr) {
    console.warn('Fallback a almacenamiento de sesión en memoria:', storeErr.message);
  }
}

const isProd = process.env.NODE_ENV === 'production';
const sessionSecret = process.env.SESSION_SECRET || (isProd 
  ? (() => { throw new Error('FATAL: SESSION_SECRET debe estar configurado en entorno de producción'); })() 
  : "sigi_session_dev_secret_key_8f7b2c9e1a");

app.use(session({
  store: sessionStore,
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 40 * 60 * 1000, // 40 minutos de inactividad
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd
  },
  rolling: true // Renueva automáticamente la sesión en cada petición
}));

// Protección contra CSRF (Cross-Site Request Forgery)
app.use(csrfProtection);
app.get('/api/csrf-token', getCsrfToken);

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "favicon.ico"));
});

app.get("/", (req, res) => {
  res.redirect("/dashboard/index.html");
});

// Endpoint de diagnóstico seguro (solo desarrollo/pruebas o superadmin autenticado)
app.get("/test-db", async (req, res) => {
  const esSuperAdmin = req.session && req.session.rol === 'superadmin';
  const esAmbienteSeguro = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

  if (!esSuperAdmin && !esAmbienteSeguro) {
    return res.status(403).json({ mensaje: "Acceso denegado a endpoint de diagnóstico 🚫" });
  }

  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ estado: "Conectado", timestamp: result.rows[0].now });
  } catch (error) {
    console.error("Error en /test-db:", error.message);
    res.status(500).json({ error: "Error conectando a la base de datos" });
  }
});

app.use('/', require('./routes/geografia.routes'));
app.use('/', require('./routes/incidentes.routes'));
app.use('/', require('./routes/autocompletado.routes'));
app.use('/', require('./routes/estadisticas.routes'));
app.use('/', require('./routes/tablas.routes'));
app.use('/', require('./routes/auth.routes'));
app.use('/', require('./routes/usuarios.routes'));
app.use('/', require('./routes/catalogos.routes'));
app.use('/', require('./routes/filtros.routes'));
app.use('/', require('./routes/reportes.routes'));
app.use('/', require('./routes/ml.routes'));
app.use('/', require('./routes/seguridad.routes'));

app.use(errorHandler);

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const allowedOrigins = process.env.APP_URL 
  ? [process.env.APP_URL, "http://localhost:3000"] 
  : "*";

const io = new Server(server, {
  cors: { 
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// Guardar instancia de io accesible desde controladores mediante req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  // Conexión cliente WebSocket establecida
  socket.on('disconnect', () => {});
});

module.exports = app;
app.server = server;

async function asegurarEsquemaBaseDatos() {
  if (process.env.NODE_ENV === 'test') return;
  try {
    await pool.query(`
      ALTER TABLE IF EXISTS public.tipo_incidente 
        ADD COLUMN IF NOT EXISTS color character varying(20),
        ADD COLUMN IF NOT EXISTS descripcion text,
        ADD COLUMN IF NOT EXISTS activo boolean DEFAULT true,
        ADD COLUMN IF NOT EXISTS id_categoria integer,
        ADD COLUMN IF NOT EXISTS codigo character varying(10),
        ADD COLUMN IF NOT EXISTS nivel_riesgo_base character varying(20) DEFAULT 'media',
        ADD COLUMN IF NOT EXISTS fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP;

      UPDATE public.tipo_incidente SET color = '#ef4444' WHERE idtipoincidente = 1 AND (color IS NULL OR color = '');
      UPDATE public.tipo_incidente SET color = '#f59e0b' WHERE idtipoincidente = 2 AND (color IS NULL OR color = '');
      UPDATE public.tipo_incidente SET color = '#f59e0b' WHERE idtipoincidente = 3 AND (color IS NULL OR color = '');
      UPDATE public.tipo_incidente SET color = '#8b5cf6' WHERE idtipoincidente = 4 AND (color IS NULL OR color = '');
      UPDATE public.tipo_incidente SET color = '#10b981' WHERE (idtipoincidente = 5 OR idtipoincidente = 6) AND (color IS NULL OR color = '');
      UPDATE public.tipo_incidente SET color = '#3b82f6' WHERE color IS NULL OR color = '';
      UPDATE public.tipo_incidente SET activo = true WHERE activo IS NULL;
    `);
    console.log('✅ Esquema y compatibilidad de tipos de incidente verificados con éxito.');
  } catch (err) {
    console.warn('Aviso al verificar esquema de tipos de incidente:', err.message);
  }
}

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`⚠️ El puerto ${PORT} ya está en uso. Detén el proceso anterior o define otro puerto con PORT=3001.`);
    } else {
      console.error('Error al iniciar el servidor:', err);
    }
  });

  server.listen(PORT, async () => {
    console.log(`Servidor corriendo en el puerto ${PORT} con WebSockets (Socket.io) y Machine Learning activos 🚀`);
    await asegurarEsquemaBaseDatos();
  });
}