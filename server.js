const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const express = require("express");
require('dotenv').config();
const pool = require("./db");
const { errorHandler } = require('./middleware/error.middleware');
const { csrfProtection, getCsrfToken } = require('./middleware/csrf.middleware');

const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
const app = express();

// Habilitar confianza en proxy inverso (Nginx / HTTPS en producción)
app.set('trust proxy', 1);

// Protección de cabeceras HTTP (Anti-clickjacking, XSS, MIME Sniffing, ocultar X-Powered-By)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(express.static("public"));

// Fallback elegante para imágenes de incidentes que no existan en disco (evita 404 en consola y UI rota)
app.get('/uploads/incidentes/:archivo', (req, res) => {
  const nombreLimpio = path.basename(req.params.archivo);
  const filePath = path.join(__dirname, 'public', 'uploads', 'incidentes', nombreLimpio);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250" fill="none">
    <rect width="400" height="250" fill="#18191f"/>
    <rect x="1" y="1" width="398" height="248" rx="8" stroke="#2d3039" stroke-width="2"/>
    <circle cx="200" cy="105" r="32" fill="#262833"/>
    <path d="M188 117L196 107L204 115L212 103L220 117H188Z" fill="#71717a"/>
    <circle cx="212" cy="95" r="4" fill="#a1a1aa"/>
    <text x="200" y="155" text-anchor="middle" fill="#a1a1aa" font-family="system-ui, sans-serif" font-size="13" font-weight="600">Evidencia no disponible</text>
    <text x="200" y="175" text-anchor="middle" fill="#71717a" font-family="system-ui, sans-serif" font-size="11">Archivo físico no encontrado en almacenamiento</text>
  </svg>`.trim());
});

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
    secure: isProd ? 'auto' : false
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
app.use('/', require('./routes/mnvcc.routes'));

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

  // Normalizar rutas relativas de imágenes en la base de datos
  try {
    await pool.query(`
      UPDATE public.incidente 
      SET imagen_url = '/uploads/incidentes/' || imagen_url 
      WHERE imagen_url IS NOT NULL 
        AND imagen_url != ''
        AND imagen_url NOT LIKE 'http%' 
        AND imagen_url NOT LIKE '/%';
    `);
  } catch (err) {
    console.warn('Aviso al normalizar URLs de imágenes:', err.message);
  }

  // Auto-migración y verificación territorial de MNVCC (Cuadrantes, Polígonos y TAMIR)
  try {
    const resTabla = await pool.query("SELECT to_regclass('public.cuadrante') AS tabla;");
    const existeTabla = resTabla.rows[0] && resTabla.rows[0].tabla;
    let necesitaMigracion = !existeTabla;

    if (existeTabla) {
      const resCount = await pool.query("SELECT COUNT(*) AS total FROM public.cuadrante WHERE geom IS NOT NULL;");
      if (Number(resCount.rows[0].total) === 0) {
        necesitaMigracion = true;
      }
    }

    if (necesitaMigracion) {
      console.log('🔄 Ejecutando migración y sembrado MNVCC (cuadrantes, polígonos, TAMIR)...');
      const migrationFile = path.join(__dirname, 'sql', 'migration_mnvcc.sql');
      if (fs.existsSync(migrationFile)) {
        const sql = fs.readFileSync(migrationFile, 'utf8');
        await pool.query(sql);
        console.log('✅ Tablas y polígonos MNVCC inicializados exitosamente.');
      }
    }
  } catch (err) {
    console.warn('Aviso al verificar/migrar tablas MNVCC:', err.message);
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