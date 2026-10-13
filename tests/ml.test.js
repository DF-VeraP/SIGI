const request = require('supertest');

// Mock del módulo de base de datos
jest.mock('../db', () => ({
  query: jest.fn()
}));

// Mock de bcrypt (requerido por auth.controller)
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('$2b$10$hashed')
}));

// Mock de Cloudinary
jest.mock('../utils/cloudinary', () => ({
  subirImagenCloudinary: jest.fn().mockResolvedValue('https://res.cloudinary.com/demo/image.png')
}));

// Mock de autenticacion para tests
jest.mock('../middleware/auth.middleware', () => ({
  verificarSesion: (req, res, next) => {
    req.session.usuario = 'AdminML';
    req.session.idusuario = 1;
    req.session.rol = 'admin';
    req.session.estado = 'activo';
    next();
  },
  verificarRol: () => (req, res, next) => next(),
  verificarEstadoActivo: (req, res, next) => next()
}));

const pool = require('../db');
const app = require('../server');
const mlService = require('../services/ml.service');

describe('Módulo de Machine Learning y Analítica Predictiva (SIGI)', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // 1. Pruebas Unitarias del Servicio ML (NLP & DBSCAN)
  // ─────────────────────────────────────────────
  describe('MLService - Clasificación NLP y Heurísticas', () => {

    it('debería clasificar correctamente un reporte de robo con alta certeza', () => {
      const texto = "Dos sujetos en moto armados encañonaron a una joven para robar su celular y billetera";
      const pred = mlService.clasificarTextoIncidente(texto);

      expect(pred.idtipoincidente).toBe(1); // Robo
      expect(pred.nametipoincidente).toBe('Robo / Hurto');
      expect(pred.confianza).toBeGreaterThan(50);
      expect(pred.distribucion.length).toBe(4);
    });

    it('debería clasificar un reporte de riña violenta como agresiones', () => {
      const texto = "Fuerte riña entre varias personas en la esquina, se atacaron con machete y cuchillo dejando varios heridos";
      const pred = mlService.clasificarTextoIncidente(texto);

      expect(pred.idtipoincidente).toBe(2); // Agresiones
      expect(pred.nametipoincidente).toBe('Agresiones / Amenazas');
      expect(pred.confianza).toBeGreaterThan(50);
    });

    it('debería clasificar carreras clandestinas como piques ilegales', () => {
      const texto = "Aglomeración de jóvenes haciendo piques clandestinos y piruetas stunt con escape ruidoso en la variante";
      const pred = mlService.clasificarTextoIncidente(texto, "23:30");

      expect(pred.idtipoincidente).toBe(3); // Piques
      expect(pred.nametipoincidente).toBe('Piques ilegales');
      expect(pred.confianza).toBeGreaterThan(50);
    });

    it('debería clasificar una colisión vehicular como accidente de tránsito', () => {
      const texto = "Choque violento entre un taxi y una motocicleta que se pasó el semáforo en rojo";
      const pred = mlService.clasificarTextoIncidente(texto, "08:15");

      expect(pred.idtipoincidente).toBe(4); // Accidente
      expect(pred.nametipoincidente).toBe('Accidentes de tránsito');
      expect(pred.confianza).toBeGreaterThan(50);
    });

    it('debería estimar gravedad crítica (5) cuando se detectan fatalidades o armas de fuego', () => {
      const texto = "Atraco con disparos de arma de fuego, la víctima quedó sin vida en el lugar";
      const grav = mlService.estimarGravedad(texto);

      expect(grav.nivel).toBe(5);
      expect(grav.etiqueta).toContain('Crítica');
      expect(grav.asistencias_sugeridas.policia).toBe(true);
      expect(grav.asistencias_sugeridas.ambulancia).toBe(true);
      expect(grav.factores_detectados.length).toBeGreaterThan(0);
    });

    it('debería estimar gravedad menor para incidentes sin violencia extrema', () => {
      const texto = "Discusión verbal por parqueo y un espejo roto";
      const grav = mlService.estimarGravedad(texto);

      expect(grav.nivel).toBeLessThanOrEqual(3);
    });
  });

  // ─────────────────────────────────────────────
  // 2. Pruebas Unitarias de Clustering Espacial DBSCAN
  // ─────────────────────────────────────────────
  describe('MLService - DBSCAN Spatial Hotspots', () => {

    it('debería agrupar puntos densos en clusters y calcular centroide y radio', () => {
      // 4 incidentes cercanos en el centro de Popayán (distancia < 200m)
      const puntos = [
        { id: 1, lat: 2.4419, lng: -76.6063, gravedad: 4, tipo_nombre: 'Robo / Hurto' },
        { id: 2, lat: 2.4421, lng: -76.6065, gravedad: 5, tipo_nombre: 'Robo / Hurto' },
        { id: 3, lat: 2.4418, lng: -76.6061, gravedad: 3, tipo_nombre: 'Robo / Hurto' },
        { id: 4, lat: 2.4423, lng: -76.6064, gravedad: 4, tipo_nombre: 'Robo / Hurto' },
        // 1 punto alejado a 10 km (debe ser ruido)
        { id: 5, lat: 2.5000, lng: -76.7000, gravedad: 2, tipo_nombre: 'Accidente' }
      ];

      const resultado = mlService.clusterDBSCAN(puntos, 400, 3);

      expect(resultado.total_clusters).toBe(1);
      expect(resultado.clusters[0].cantidad_incidentes).toBe(4);
      expect(resultado.clusters[0].centroide.lat).toBeCloseTo(2.442, 2);
      expect(resultado.clusters[0].nivel_riesgo).toBeDefined();
      expect(resultado.ruido_puntos.length).toBe(1);
      expect(resultado.ruido_puntos[0].id).toBe(5);
    });

    it('debería manejar datasets vacíos o sin coordenadas sin fallar', () => {
      const resultado = mlService.clusterDBSCAN([]);
      expect(resultado.total_clusters).toBe(0);
      expect(resultado.clusters).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────
  // 3. Pruebas Unitarias de Forecasting de Series Temporales
  // ─────────────────────────────────────────────
  describe('MLService - Series Temporales y Forecast', () => {

    it('debería proyectar los meses siguientes con intervalos de confianza', () => {
      const historico = [
        { mes: '2026-01', total: 40 },
        { mes: '2026-02', total: 45 },
        { mes: '2026-03', total: 50 },
        { mes: '2026-04', total: 56 }
      ];

      const res = mlService.proyectarTendencia(historico, 3);

      expect(res.proyeccion.length).toBe(3);
      expect(res.proyeccion[0].cantidad_estimada).toBeGreaterThan(0);
      expect(res.tendencia).toContain('aumento');
      expect(res.porcentaje_cambio).toBeGreaterThan(0);
    });
  });

  // ─────────────────────────────────────────────
  // 4. Pruebas de Endpoints HTTP /api/ml/...
  // ─────────────────────────────────────────────
  describe('Endpoints HTTP de Machine Learning', () => {

    it('POST /api/ml/predecir-incidente debería retornar predicción completa', async () => {
      const res = await request(app)
        .post('/api/ml/predecir-incidente')
        .send({
          descripcion: 'Sujetos armados atracaron a clientes en panaderia llevandose dinero y telefonos',
          hora: '19:40'
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.tipo.idtipoincidente).toBe(1);
      expect(res.body.data.gravedad.nivel).toBeGreaterThanOrEqual(3);
      expect(res.body.data.asistencias.policia).toBe(true);
    });

    it('POST /api/ml/predecir-incidente debería retornar 400 si falta la descripción', async () => {
      const res = await request(app)
        .post('/api/ml/predecir-incidente')
        .send({
          hora: '19:40'
        });

      expect(res.status).toBe(400);
      expect(res.body.mensaje).toContain('descripción');
    });

    it('GET /api/ml/hotspots debería ejecutar clustering sobre incidentes de la BD', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [
          { id: 10, lat: 2.441, lng: -76.605, idtipoincidente: 1, tipo_nombre: 'Robo', gravedad: 4 },
          { id: 11, lat: 2.442, lng: -76.606, idtipoincidente: 1, tipo_nombre: 'Robo', gravedad: 4 },
          { id: 12, lat: 2.443, lng: -76.605, idtipoincidente: 1, tipo_nombre: 'Robo', gravedad: 3 }
        ]
      });

      const res = await request(app).get('/api/ml/hotspots?eps=500&minPts=3');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.total_incidentes).toBe(3);
      expect(res.body.total_clusters).toBe(1);
    });

    it('GET /api/ml/forecast debería retornar series temporales proyectadas', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [
          { mes: '2026-05', total: 30 },
          { mes: '2026-06', total: 34 },
          { mes: '2026-07', total: 38 }
        ]
      });

      const res = await request(app).get('/api/ml/forecast?meses=3');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.proyeccion.length).toBe(3);
      expect(res.body.data.tendencia).toBeDefined();
    });

    it('POST /api/ml/reentrenar debería permitir re-calibración de modelos a administradores', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ count: 680 }]
      });

      const res = await request(app).post('/api/ml/reentrenar');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.registros_analizados).toBe(680);
    });
  });
});
