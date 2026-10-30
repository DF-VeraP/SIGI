const request = require('supertest');

jest.mock('../db', () => ({
  query: jest.fn()
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('$2b$10$hashed')
}));

jest.mock('../utils/cloudinary', () => ({
  subirImagenCloudinary: jest.fn().mockResolvedValue('https://res.cloudinary.com/demo/image.png')
}));

jest.mock('../middleware/auth.middleware', () => ({
  verificarSesion: (req, res, next) => {
    req.session.usuario = 'AdminCIEPS';
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

describe('Módulo MNVCC (Tomo 2.2 Capítulos 3, 5 y 6 - Cuadrantes, Hoja de Servicio, 5 Porqués y TAMIR)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /poligonoCuadrante debería retornar los polígonos GeoJSON de cuadrantes', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id_cuadrante: 1,
          codigo_cuadrante: 'DECAQ-MNVCC-D1-E1-0001',
          nombre: 'Cuadrante 1 - Sector El Ventilador',
          tipo: 'urbano',
          total_incidentes: 47,
          geom: '{"type":"MultiPolygon","coordinates":[]}'
        }
      ]
    });

    const res = await request(app).get('/poligonoCuadrante?tipo=urbano');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].codigo_cuadrante).toBe('DECAQ-MNVCC-D1-E1-0001');
  });

  it('GET /api/mnvcc/cuadrantes debería listar el resumen de cuadrantes con % de aporte a la estación', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id_cuadrante: 3,
          codigo_cuadrante: 'DECAQ-MNVCC-D1-E1-0003',
          nombre: 'Cuadrante 3 - Sector Restrepo / Malvinas',
          tipo: 'urbano',
          total_incidentes: 177,
          aporte_estacion_pct: 28.6,
          puntos_criticos_activos: 2,
          total_tamir: 2,
          tamir_cumplidas: 1
        }
      ]
    });

    const res = await request(app).get('/api/mnvcc/cuadrantes');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data[0].codigo_cuadrante).toBe('DECAQ-MNVCC-D1-E1-0003');
    expect(res.body.data[0].aporte_estacion_pct).toBe(28.6);
  });

  it('GET /api/mnvcc/hoja-servicio/:idCuadrante debería retornar la Hoja de Servicio completa (pág. 51 Tomo 2.2)', async () => {
    // 1. Datos del cuadrante
    pool.query.mockResolvedValueOnce({
      rows: [{
        id_cuadrante: 3,
        codigo_cuadrante: 'DECAQ-MNVCC-D1-E1-0003',
        nombre: 'Cuadrante 3 - Sector Restrepo',
        tipo: 'urbano',
        unidad_base: 'Estación Florencia',
        telefono_contacto: '317 254 1033'
      }]
    });
    // 2. Estadística y % aporte estación
    pool.query.mockResolvedValueOnce({
      rows: [{ delito: 'Robo', sem_1: 4, sem_2: 6, sem_3: 5, sem_4: 7, total_cuadrante: 60, total_estacion: 200, aporte_estacion_pct: 30.0 }]
    });
    // 3. Matriz por días de la semana
    pool.query.mockResolvedValueOnce({
      rows: [{ delito: 'Robo', lunes: 8, martes: 7, miercoles: 9, jueves: 8, viernes: 10, sabado: 11, domingo: 7, total: 60 }]
    });
    // 4. Matriz por franjas horarias de 4 horas
    pool.query.mockResolvedValueOnce({
      rows: [{ delito: 'Robo', f_00_03: 5, f_04_07: 4, f_08_11: 10, f_12_15: 11, f_16_19: 14, f_20_23: 16, total: 60 }]
    });
    // 5. Puntos críticos
    pool.query.mockResolvedValueOnce({
      rows: [{ id_problema: 1, titulo: 'Foco Crítico #1', tipologia_punto_critico: 'facilitador_infracciones' }]
    });
    // 6. Actividades TAMIR
    pool.query.mockResolvedValueOnce({
      rows: [{ id_tamir: 1, actividad_preventiva: 'Patrullaje focalizado', estado_cumplimiento: 'cumplida' }]
    });

    const res = await request(app).get('/api/mnvcc/hoja-servicio/3');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.cuadrante.codigo_cuadrante).toBe('DECAQ-MNVCC-D1-E1-0003');
    expect(res.body.data.estadistica_aporte.length).toBe(1);
    expect(res.body.data.matriz_dias_semana.length).toBe(1);
    expect(res.body.data.matriz_franjas_horarias.length).toBe(1);
    expect(res.body.data.puntos_criticos.length).toBe(1);
    expect(res.body.data.tamir.length).toBe(1);
  });

  it('POST /api/mnvcc/problemas debería registrar un Punto Crítico con Análisis Causal (5 Porqués)', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{
        id_problema: 5,
        id_cuadrante: 3,
        titulo: 'Foco de hurto en paradero nocturno',
        tipologia_punto_critico: 'facilitador_infracciones',
        causa_raiz: 'Luminarias averiadas en corredor peatonal'
      }]
    });

    const res = await request(app)
      .post('/api/mnvcc/problemas')
      .send({
        id_cuadrante: 3,
        titulo: 'Foco de hurto en paradero nocturno',
        tipologia_punto_critico: 'facilitador_infracciones',
        porque_1: 'Hurtos reiterados a las 20:00 h',
        porque_5: 'Luminarias sin mantenimiento',
        causa_raiz: 'Luminarias averiadas en corredor peatonal'
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.tipologia_punto_critico).toBe('facilitador_infracciones');
  });

  it('POST /api/mnvcc/tamir y PATCH /api/mnvcc/tamir/:id/cumplimiento deberían gestionar consignas TAMIR', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{
        id_tamir: 10,
        id_cuadrante: 1,
        lugar_especifico: 'Parque El Ventilador',
        estado_cumplimiento: 'pendiente'
      }]
    });

    const createRes = await request(app)
      .post('/api/mnvcc/tamir')
      .send({
        id_cuadrante: 1,
        lugar_especifico: 'Parque El Ventilador',
        problematica_priorizada: 'Hurto a personas en horario nocturno',
        actividad_preventiva: 'Presencia disuasiva y contacto comunitario'
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.id_tamir).toBe(10);

    pool.query.mockResolvedValueOnce({
      rows: [{
        id_tamir: 10,
        estado_cumplimiento: 'cumplida',
        observacion_turno: 'Ejecutada sin novedad'
      }]
    });

    const patchRes = await request(app)
      .patch('/api/mnvcc/tamir/10/cumplimiento')
      .send({
        estado_cumplimiento: 'cumplida',
        observacion_turno: 'Ejecutada sin novedad'
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.estado_cumplimiento).toBe('cumplida');
  });
});
