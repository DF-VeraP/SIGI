// Mock del pool de base de datos para entorno de pruebas/CI
jest.mock('../db', () => ({
  query: jest.fn()
}));

const pool = require('../db');
const CatalogosModel = require('../models/catalogos.model');
const { normalizarTexto, calcularDistanciaColor } = require('../controllers/catalogos.controller');

describe('Gestión y Control de Redundancia de Tipos de Incidentes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('normalizarTexto detecta variaciones de mayúsculas, espacios y tildes', () => {
    expect(normalizarTexto('Robo')).toBe('robo');
    expect(normalizarTexto('  ROBO  ')).toBe('robo');
    expect(normalizarTexto('rObÓ')).toBe('robo');
    expect(normalizarTexto('Inundación')).toBe('inundacion');
    expect(normalizarTexto('INUNDACION')).toBe('inundacion');
    expect(normalizarTexto('  Accidente   vial ')).toBe('accidente vial');
  });

  test('calcularDistanciaColor detecta colores casi idénticos y colores diferenciables', () => {
    const rojoBase = '#ef4444';
    const rojoCasiIgual = '#dc2626';
    const rojoMuyCerca = '#ea3838';
    const turquesaDiferente = '#06b6d4';
    const azulDiferente = '#2563eb';

    // Colores idénticos
    expect(calcularDistanciaColor(rojoBase, rojoBase)).toBe(0);

    // Colores de la misma tonalidad (distancia < 85)
    expect(calcularDistanciaColor(rojoBase, rojoCasiIgual)).toBeLessThan(85);
    expect(calcularDistanciaColor(rojoBase, rojoMuyCerca)).toBeLessThan(85);

    // Colores diferenciados (distancia >= 85)
    expect(calcularDistanciaColor(rojoBase, turquesaDiferente)).toBeGreaterThanOrEqual(85);
    expect(calcularDistanciaColor(rojoBase, azulDiferente)).toBeGreaterThanOrEqual(85);
  });

  test('CatalogosModel.obtenerTiposConDetalle retorna datos con colores y conteo de incidentes', async () => {
    const mockRows = [
      { idtipoincidente: 1, nametipoincidente: 'Robo', color: '#ef4444', total_incidentes: 5, activo: true },
      { idtipoincidente: 2, nametipoincidente: 'Accidente vial', color: '#f59e0b', total_incidentes: 2, activo: true },
      { idtipoincidente: 3, nametipoincidente: 'Incendio', color: '#ef4444', total_incidentes: 0, activo: true },
      { idtipoincidente: 4, nametipoincidente: 'Inundación', color: '#06b6d4', total_incidentes: 1, activo: true }
    ];
    pool.query.mockResolvedValueOnce({ rows: mockRows });

    const tipos = await CatalogosModel.obtenerTiposConDetalle();
    expect(Array.isArray(tipos)).toBe(true);
    expect(tipos.length).toBeGreaterThanOrEqual(4);

    const robo = tipos.find(t => t.idtipoincidente === 1);
    expect(robo).toBeDefined();
    expect(robo.color).toBe('#ef4444');
    expect(robo.nametipoincidente).toBe('Robo');
    expect(typeof robo.total_incidentes).toBe('number');
  });

  test('CatalogosModel.contarIncidentesPorTipo previene eliminación de tipos con historial', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ total: 5 }] });
    const conteo = await CatalogosModel.contarIncidentesPorTipo(1);
    expect(typeof conteo).toBe('number');
    expect(conteo).toBe(5);
  });
});
