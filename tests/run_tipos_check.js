const assert = require('assert');
const pool = require('../db');
const CatalogosModel = require('../models/catalogos.model');
const { normalizarTexto, calcularDistanciaColor } = require('../controllers/catalogos.controller');

async function runTests() {
  console.log('--- INICIO DE VALIDACIONES DE TIPOS DE INCIDENTES ---');

  // Test 1: Normalización de texto
  assert.strictEqual(normalizarTexto('Robo'), 'robo');
  assert.strictEqual(normalizarTexto('  ROBO  '), 'robo');
  assert.strictEqual(normalizarTexto('rObÓ'), 'robo');
  assert.strictEqual(normalizarTexto('Inundación'), 'inundacion');
  assert.strictEqual(normalizarTexto('INUNDACION'), 'inundacion');
  assert.strictEqual(normalizarTexto('  Accidente   vial '), 'accidente vial');
  console.log('✓ Test 1 PASÓ: Normalización estricta anti-duplicados');

  // Test 2: Distancia de color (Redmean)
  const rojoBase = '#ef4444';
  const rojoCasiIgual = '#dc2626';
  const rojoMuyCerca = '#ea3838';
  const turquesaDiferente = '#06b6d4';
  const azulDiferente = '#2563eb';

  assert.strictEqual(calcularDistanciaColor(rojoBase, rojoBase), 0);
  assert.ok(calcularDistanciaColor(rojoBase, rojoCasiIgual) < 85, 'Rojo oscuro debe considerarse casi igual');
  assert.ok(calcularDistanciaColor(rojoBase, rojoMuyCerca) < 85, 'Rojo cercano debe considerarse casi igual');
  assert.ok(calcularDistanciaColor(rojoBase, turquesaDiferente) >= 85, 'Turquesa debe considerarse diferenciable');
  assert.ok(calcularDistanciaColor(rojoBase, azulDiferente) >= 85, 'Azul debe considerarse diferenciable');
  console.log('✓ Test 2 PASÓ: Algoritmo de proximidad y contraste perceptual de color');

  // Test 3: Model y BD
  const tipos = await CatalogosModel.obtenerTiposConDetalle();
  assert.ok(Array.isArray(tipos) && tipos.length >= 4);
  const robo = tipos.find(t => t.idtipoincidente === 1);
  assert.ok(robo);
  assert.strictEqual(robo.color, '#ef4444');
  assert.strictEqual(robo.nametipoincidente, 'Robo');
  console.log('✓ Test 3 PASÓ: Consulta de tipos con color, categoría y conteo en BD');

  // Test 4: Conteo de incidentes vinculados
  const conteo = await CatalogosModel.contarIncidentesPorTipo(1);
  console.log(`✓ Test 4 PASÓ: Incidentes vinculados a tipo 1 (${robo.nametipoincidente}): ${conteo}`);

  await pool.end();
  console.log('--- TODAS LAS VALIDACIONES PASARON EXITOSAMENTE ---');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Error en pruebas:', err);
  process.exit(1);
});
