/**
 * SIGI — Módulo MNVCC (Modelo Nacional de Vigilancia Comunitaria por Cuadrantes - Tomo 2.2 Cap. 5 y 6)
 * Gestiona la capa cartográfica de Cuadrantes (DECAQ Florencia), la Hoja de Servicio (HS),
 * los Puntos Críticos con Análisis Causal (5 Porqués / Ishikawa) y la TAMIR Digital.
 */

let capaCuadrantesLeaflet = null;
let cuadrantesActivosEnMapa = false;
let cacheCuadrantesMNVCC = [];
let cuadranteSeleccionadoId = 3; // Cuadrante 3 (mayor volumen en Florencia) por defecto

const ETIQUETAS_TIPOLOGIA_PC = {
  generador_oportunidad: {
    nombre: 'Generador de Oportunidad',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.14)'
  },
  atractor_infractores: {
    nombre: 'Atractor de Infractores',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.14)'
  },
  facilitador_infracciones: {
    nombre: 'Facilitador de Infracciones',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.14)'
  }
};

/**
 * Inicializa controles de mapa (menú de Polígonos: Barrios, Veredas, Cuadrantes) y pestaña CIEPS/MNVCC
 */
function inicializarModuloMNVCC() {
  const btnPoligonos = document.getElementById('btnToggleCuadrantes');
  const menuPoligonos = document.getElementById('menuCapasPoligonos');
  const chkBarrios = document.getElementById('chkCapaBarrios');
  const chkVeredas = document.getElementById('chkCapaVeredas');
  const chkCuadrantes = document.getElementById('chkCapaCuadrantes');

  if (menuPoligonos && typeof L !== 'undefined' && L.DomEvent && !menuPoligonos.dataset.leafletProtected) {
    menuPoligonos.dataset.leafletProtected = '1';
    L.DomEvent.disableClickPropagation(menuPoligonos);
    L.DomEvent.disableScrollPropagation(menuPoligonos);
  }

  if (btnPoligonos && !btnPoligonos.dataset.mnvccWired) {
    btnPoligonos.dataset.mnvccWired = '1';
    btnPoligonos.addEventListener('click', (e) => {
      if (e) e.stopPropagation();
      const panelMapEl = document.getElementById('panelMap');
      const vistaMapaActiva = panelMapEl && panelMapEl.classList.contains('vista-activa');
      if (!vistaMapaActiva) return;
      if (!menuPoligonos) {
        alternarCapaCuadrantesMapa();
        return;
      }
      const abierto = menuPoligonos.style.display !== 'none';
      if (abierto) {
        menuPoligonos.style.display = 'none';
        btnPoligonos.setAttribute('aria-expanded', 'false');
        btnPoligonos.classList.remove('activo');
      } else {
        posicionarMenuCapasPoligonos(btnPoligonos, menuPoligonos);
        menuPoligonos.style.display = 'flex';
        btnPoligonos.setAttribute('aria-expanded', 'true');
        btnPoligonos.classList.add('activo');
      }
    });
  }

  if (!document.body.dataset.menuPoligonosOutsideWired) {
    document.body.dataset.menuPoligonosOutsideWired = '1';
    document.addEventListener('click', (e) => {
      const menu = document.getElementById('menuCapasPoligonos');
      const btn = document.getElementById('btnToggleCuadrantes');
      if (!menu || menu.style.display === 'none') return;
      if (menu.contains(e.target) || (btn && btn.contains(e.target))) return;
      menu.style.display = 'none';
      if (btn) {
        btn.setAttribute('aria-expanded', 'false');
        btn.classList.remove('activo');
      }
    });
  }

  if (chkBarrios && !chkBarrios.dataset.mnvccWired) {
    chkBarrios.dataset.mnvccWired = '1';
    chkBarrios.addEventListener('change', (e) => {
      if (typeof map === 'undefined' || !map || typeof capaBarrio === 'undefined') return;
      if (e.target.checked) {
        if (!map.hasLayer(capaBarrio)) map.addLayer(capaBarrio);
        if (capaBarrio.getLayers().length === 0 && typeof cargarBarrio === 'function') {
          cargarBarrio();
        }
      } else {
        if (map.hasLayer(capaBarrio)) map.removeLayer(capaBarrio);
      }
    });
  }

  if (chkVeredas && !chkVeredas.dataset.mnvccWired) {
    chkVeredas.dataset.mnvccWired = '1';
    chkVeredas.addEventListener('change', (e) => {
      if (typeof map === 'undefined' || !map || typeof capaVereda === 'undefined') return;
      if (e.target.checked) {
        if (!map.hasLayer(capaVereda)) map.addLayer(capaVereda);
        if (capaVereda.getLayers().length === 0 && typeof cargarVeredas === 'function') {
          cargarVeredas();
        }
      } else {
        if (map.hasLayer(capaVereda)) map.removeLayer(capaVereda);
      }
    });
  }

  if (chkCuadrantes && !chkCuadrantes.dataset.mnvccWired) {
    chkCuadrantes.dataset.mnvccWired = '1';
    chkCuadrantes.addEventListener('change', async (e) => {
      await establecerVisibilidadCuadrantesMapa(e.target.checked);
    });
  }

  const selectorCuadrante = document.getElementById('mnvccSelectCuadrante');
  if (selectorCuadrante && !selectorCuadrante.dataset.mnvccWired) {
    selectorCuadrante.dataset.mnvccWired = '1';
    selectorCuadrante.addEventListener('change', (e) => {
      const id = parseInt(e.target.value, 10);
      if (!isNaN(id)) {
        cuadranteSeleccionadoId = id;
        cargarHojaServicioCuadrante(id);
      }
    });
  }

  const filtroTipoMapa = document.getElementById('mnvccFiltroTipoCuadrante');
  if (filtroTipoMapa && !filtroTipoMapa.dataset.mnvccWired) {
    filtroTipoMapa.dataset.mnvccWired = '1';
    filtroTipoMapa.addEventListener('change', () => {
      cargarListaCuadrantesCIEPS(filtroTipoMapa.value);
    });
  }

  cargarListaCuadrantesCIEPS('');
}

/**
 * Posiciona el contenedor flotante de selección de polígonos justo debajo del botón Polígonos
 */
function posicionarMenuCapasPoligonos(btn, menu) {
  const mapEl = document.getElementById('map');
  if (!mapEl || !btn || !menu) return;
  const mapRect = mapEl.getBoundingClientRect();
  const btnRect = btn.getBoundingClientRect();
  if (mapRect.width === 0 || btnRect.width === 0) return;

  const topOffset = Math.max(48, btnRect.bottom - mapRect.top + 8);
  const centerX = btnRect.left - mapRect.left + btnRect.width / 2;
  const minLeft = 115;
  const maxLeft = Math.max(minLeft, mapRect.width - 115);
  const clampedCenterX = Math.min(maxLeft, Math.max(minLeft, centerX));

  menu.style.top = `${topOffset}px`;
  menu.style.left = `${clampedCenterX}px`;
  menu.style.transform = 'translateX(-50%)';
}

/**
 * Establece de inmediato la visibilidad de la capa de Cuadrantes MNVCC sobre el mapa
 */
async function establecerVisibilidadCuadrantesMapa(mostrar) {
  if (typeof map === 'undefined' || !map) return;

  if (!mostrar) {
    if (capaCuadrantesLeaflet && map.hasLayer(capaCuadrantesLeaflet)) {
      map.removeLayer(capaCuadrantesLeaflet);
    }
    cuadrantesActivosEnMapa = false;
    return;
  }

  if (capaCuadrantesLeaflet) {
    if (!map.hasLayer(capaCuadrantesLeaflet)) {
      map.addLayer(capaCuadrantesLeaflet);
    }
    cuadrantesActivosEnMapa = true;
    return;
  }

  try {
    const res = await fetch('/poligonoCuadrante');
    if (!res.ok) return;
    const rows = await res.json();

    const features = rows
      .filter(r => r.geom)
      .map(r => ({
        type: 'Feature',
        properties: {
          id_cuadrante: r.id_cuadrante,
          codigo_cuadrante: r.codigo_cuadrante,
          nombre: r.nombre,
          tipo: r.tipo,
          unidad_base: r.unidad_base,
          telefono_contacto: r.telefono_contacto,
          color: r.color || '#2563eb',
          sectores_barrios: r.sectores_barrios,
          total_incidentes: r.total_incidentes || 0
        },
        geometry: JSON.parse(r.geom)
      }));

    capaCuadrantesLeaflet = L.geoJSON(
      { type: 'FeatureCollection', features },
      {
        pane: 'poligonosPane',
        style: (feature) => {
          const esUrbano = feature.properties.tipo === 'urbano';
          return {
            color: feature.properties.color || '#2563eb',
            weight: esUrbano ? 2.5 : 1.5,
            opacity: 0.9,
            dashArray: esUrbano ? '' : '6, 4',
            fillColor: feature.properties.color || '#2563eb',
            fillOpacity: esUrbano ? 0.22 : 0.10
          };
        },
        onEachFeature: (feature, layer) => {
          const p = feature.properties;
          const badgeTipo = p.tipo === 'urbano'
            ? '<span style="background:#2563eb;color:#fff;padding:2px 7px;border-radius:10px;font-size:0.68rem;font-weight:700;">URBANO (IGAC)</span>'
            : '<span style="background:#15803d;color:#fff;padding:2px 7px;border-radius:10px;font-size:0.68rem;font-weight:700;">RURAL</span>';

          const popupHtml = `
            <div style="min-width:240px;font-family:'Plus Jakarta Sans',sans-serif;">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:6px;">
                <strong style="font-size:0.82rem;color:#38bdf8;">${p.codigo_cuadrante}</strong>
                ${badgeTipo}
              </div>
              <div style="font-weight:700;font-size:0.9rem;margin-bottom:4px;">${p.nombre}</div>
              <div style="font-size:0.76rem;opacity:0.85;margin-bottom:6px;">
                <div><strong>Unidad:</strong> ${p.unidad_base || 'Estación Florencia'}</div>
                <div><strong>Línea Cuadrante:</strong> ${p.telefono_contacto || '123'}</div>
                <div><strong>Incidentes registrados:</strong> ${p.total_incidentes} casos</div>
              </div>
              <div style="font-size:0.72rem;opacity:0.75;margin-bottom:8px;max-height:48px;overflow-y:auto;">
                <strong>Cobertura:</strong> ${p.sectores_barrios || 'Jurisdicción asignada'}
              </div>
              <button type="button" onclick="abrirHojaServicioDesdeMapa(${p.id_cuadrante})"
                style="width:100%;padding:6px 10px;border:none;border-radius:6px;background:#2563eb;color:#fff;font-weight:700;font-size:0.76rem;cursor:pointer;">
                Ver Hoja de Servicio y TAMIR
              </button>
            </div>
          `;
          layer.bindPopup(popupHtml);
        }
      }
    ).addTo(map);

    cuadrantesActivosEnMapa = true;
  } catch (err) {
    console.warn('Error al cargar polígonos de cuadrantes:', err);
  }
}

/**
 * Alterna la visualización de los polígonos de Cuadrantes (compatibilidad directa)
 */
async function alternarCapaCuadrantesMapa() {
  const nuevoEstado = !cuadrantesActivosEnMapa;
  const chkCuadrantes = document.getElementById('chkCapaCuadrantes');
  if (chkCuadrantes) chkCuadrantes.checked = nuevoEstado;
  await establecerVisibilidadCuadrantesMapa(nuevoEstado);
}

window.establecerVisibilidadCuadrantesMapa = establecerVisibilidadCuadrantesMapa;

/**
 * Abre la vista AI Lab / CIEPS en la pestaña MNVCC para un cuadrante específico
 */
window.abrirHojaServicioDesdeMapa = function (idCuadrante) {
  cuadranteSeleccionadoId = idCuadrante;
  if (typeof cambiarVista === 'function') {
    cambiarVista('ia-hub');
  }
  const tabBtn = document.querySelector('.ai-tab-btn[data-tab="tabMNVCC"]');
  if (tabBtn) tabBtn.click();

  const selector = document.getElementById('mnvccSelectCuadrante');
  if (selector) selector.value = String(idCuadrante);
  cargarHojaServicioCuadrante(idCuadrante);
};

/**
 * Carga el listado resumen de Cuadrantes y pobla el selector de Hoja de Servicio
 */
async function cargarListaCuadrantesCIEPS(tipo = '') {
  try {
    const url = tipo ? `/api/mnvcc/cuadrantes?tipo=${encodeURIComponent(tipo)}` : '/api/mnvcc/cuadrantes';
    const res = await fetch(url);
    if (!res.ok) return;
    const payload = await res.json();
    if (payload.status !== 'success') return;

    cacheCuadrantesMNVCC = payload.data || [];

    const selector = document.getElementById('mnvccSelectCuadrante');
    if (selector && cacheCuadrantesMNVCC.length > 0) {
      const existeActual = cacheCuadrantesMNVCC.some(c => c.id_cuadrante === cuadranteSeleccionadoId);
      if (!existeActual) {
        cuadranteSeleccionadoId = cacheCuadrantesMNVCC[0].id_cuadrante;
      }

      selector.innerHTML = cacheCuadrantesMNVCC.map(c => `
        <option value="${c.id_cuadrante}" ${c.id_cuadrante === cuadranteSeleccionadoId ? 'selected' : ''}>
          [${c.codigo_cuadrante}] ${c.nombre} (${c.total_incidentes} casos · ${c.aporte_estacion_pct}% estación)
        </option>
      `).join('');
    }

    cargarHojaServicioCuadrante(cuadranteSeleccionadoId);
  } catch (err) {
    console.warn('Error cargando cuadrantes CIEPS:', err);
  }
}

/**
 * Consulta y renderiza la Hoja de Servicio (pág. 51 Tomo 2.2), Puntos Críticos (5 Porqués) y TAMIR
 */
async function cargarHojaServicioCuadrante(idCuadrante) {
  try {
    const res = await fetch(`/api/mnvcc/hoja-servicio/${idCuadrante}`);
    if (!res.ok) return;
    const payload = await res.json();
    if (payload.status !== 'success' || !payload.data) return;

    const {
      cuadrante,
      estadistica_aporte,
      matriz_dias_semana,
      matriz_franjas_horarias,
      puntos_criticos,
      tamir
    } = payload.data;

    // 1. Cabecera de la Hoja de Servicio
    const elCodigo = document.getElementById('hsCodigoCuadrante');
    const elNombre = document.getElementById('hsNombreCuadrante');
    const elUnidad = document.getElementById('hsUnidadBase');
    const elTel = document.getElementById('hsTelefonoCuadrante');
    const elBarrios = document.getElementById('hsSectoresBarrios');

    if (elCodigo) elCodigo.textContent = cuadrante.codigo_cuadrante;
    if (elNombre) elNombre.textContent = cuadrante.nombre;
    if (elUnidad) elUnidad.textContent = cuadrante.unidad_base || 'Estación de Policía Florencia';
    if (elTel) elTel.textContent = cuadrante.telefono_contacto || '123';
    if (elBarrios) elBarrios.textContent = cuadrante.sectores_barrios || 'Sin sectores especificados';

    // 2. Tabla de Estadística entre Semanas y % Aporte a la Estación
    const tbodyAporte = document.getElementById('hsTablaAporteBody');
    if (tbodyAporte) {
      if (!estadistica_aporte || estadistica_aporte.length === 0) {
        tbodyAporte.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--texto-suave);">Sin incidentes en este cuadrante</td></tr>';
      } else {
        tbodyAporte.innerHTML = estadistica_aporte.map(r => `
          <tr>
            <td style="font-weight:700;">${r.delito}</td>
            <td style="text-align:center;">${r.sem_1}</td>
            <td style="text-align:center;">${r.sem_2}</td>
            <td style="text-align:center;">${r.sem_3}</td>
            <td style="text-align:center;">${r.sem_4}</td>
            <td style="text-align:center;font-weight:700;color:var(--acento);">${r.total_cuadrante}</td>
            <td style="text-align:center;">${r.total_estacion}</td>
            <td style="text-align:center;font-weight:700;color:${r.aporte_estacion_pct >= 20 ? '#ef4444' : '#10b981'};">${r.aporte_estacion_pct}%</td>
          </tr>
        `).join('');
      }
    }

    // 3. Tabla por Días de la Semana (Lunes a Domingo)
    const tbodyDias = document.getElementById('hsTablaDiasBody');
    if (tbodyDias) {
      if (!matriz_dias_semana || matriz_dias_semana.length === 0) {
        tbodyDias.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--texto-suave);">Sin registros por día en este cuadrante</td></tr>';
      } else {
        tbodyDias.innerHTML = matriz_dias_semana.map(r => `
          <tr>
            <td style="font-weight:700;">${r.delito}</td>
            <td style="text-align:center;">${r.lunes}</td>
            <td style="text-align:center;">${r.martes}</td>
            <td style="text-align:center;">${r.miercoles}</td>
            <td style="text-align:center;">${r.jueves}</td>
            <td style="text-align:center;">${r.viernes}</td>
            <td style="text-align:center;font-weight:600;color:#f59e0b;">${r.sabado}</td>
            <td style="text-align:center;font-weight:600;color:#f59e0b;">${r.domingo}</td>
            <td style="text-align:center;font-weight:700;color:var(--acento);">${r.total}</td>
          </tr>
        `).join('');
      }
    }

    // 4. Tabla por Franjas Horarias de 4 Horas (00:00 a 23:59)
    const tbodyFranjas = document.getElementById('hsTablaFranjasBody');
    if (tbodyFranjas) {
      if (!matriz_franjas_horarias || matriz_franjas_horarias.length === 0) {
        tbodyFranjas.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--texto-suave);">Sin registros horarios en este cuadrante</td></tr>';
      } else {
        tbodyFranjas.innerHTML = matriz_franjas_horarias.map(r => `
          <tr>
            <td style="font-weight:700;">${r.delito}</td>
            <td style="text-align:center;">${r.f_00_03}</td>
            <td style="text-align:center;">${r.f_04_07}</td>
            <td style="text-align:center;">${r.f_08_11}</td>
            <td style="text-align:center;">${r.f_12_15}</td>
            <td style="text-align:center;font-weight:600;color:#f97316;">${r.f_16_19}</td>
            <td style="text-align:center;font-weight:600;color:#ef4444;">${r.f_20_23}</td>
            <td style="text-align:center;font-weight:700;color:var(--acento);">${r.total}</td>
          </tr>
        `).join('');
      }
    }

    // 5. Puntos Críticos y Análisis Causal (5 Porqués + Ishikawa)
    await renderizarPuntosCriticosMNVCC(puntos_criticos);

    // 6. Actividades TAMIR del Cuadrante
    await renderizarTamirMNVCC(tamir);
  } catch (err) {
    console.warn('Error cargando Hoja de Servicio:', err);
  }
}

async function renderizarPuntosCriticosMNVCC(problemasCuadrante) {
  const cont = document.getElementById('hsPuntosCriticosList');
  if (!cont) return;

  let lista = problemasCuadrante || [];
  if (lista.length === 0) {
    // Si el cuadrante seleccionado no tiene focos propios, mostrar los focos activos de la estación
    const res = await fetch('/api/mnvcc/problemas');
    if (res.ok) {
      const p = await res.json();
      lista = p.data || [];
    }
  }

  if (lista.length === 0) {
    cont.innerHTML = '<p style="color:var(--texto-suave);font-size:0.82rem;">No hay puntos críticos caracterizados actualmente.</p>';
    return;
  }

  cont.innerHTML = lista.map(p => {
    const tip = ETIQUETAS_TIPOLOGIA_PC[p.tipologia_punto_critico] || ETIQUETAS_TIPOLOGIA_PC.facilitador_infracciones;
    const ish = p.factores_ishikawa || {};
    return `
      <div style="border:1px solid var(--borde);border-radius:10px;padding:14px;background:rgba(255,255,255,0.02);margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
          <div>
            <span style="font-size:0.72rem;color:var(--texto-suave);font-weight:700;">${p.codigo_cuadrante || 'ESTACIÓN'}</span>
            <h4 style="margin:2px 0 0 0;font-size:0.92rem;color:var(--texto);">${p.titulo}</h4>
          </div>
          <span style="background:${tip.bg};color:${tip.color};border:1px solid ${tip.color};padding:3px 10px;border-radius:12px;font-size:0.72rem;font-weight:700;">
            ${tip.nombre} · Riesgo ${p.nivel_riesgo}
          </span>
        </div>

        <div style="font-size:0.78rem;color:var(--texto-suave);margin-bottom:10px;">
          <strong>Causa Raíz Identificada (CIEPS):</strong> <span style="color:var(--texto);">${p.causa_raiz || p.porque_5 || 'En análisis'}</span>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;font-size:0.75rem;margin-bottom:8px;">
          <div style="background:rgba(0,0,0,0.18);padding:8px 10px;border-radius:8px;border:1px solid var(--borde);">
            <strong style="color:#38bdf8;display:block;margin-bottom:4px;">Cadena Causal (Técnica 5 Porqués)</strong>
            <div><strong>1° Porqué:</strong> ${p.porque_1 || '-'}</div>
            <div><strong>2° Porqué:</strong> ${p.porque_2 || '-'}</div>
            <div><strong>3° Porqué:</strong> ${p.porque_3 || '-'}</div>
            <div><strong>4° Porqué:</strong> ${p.porque_4 || '-'}</div>
            <div><strong>5° Porqué:</strong> ${p.porque_5 || '-'}</div>
          </div>
          <div style="background:rgba(0,0,0,0.18);padding:8px 10px;border-radius:8px;border:1px solid var(--borde);">
            <strong style="color:#a855f7;display:block;margin-bottom:4px;">Factores Espina de Pescado (Ishikawa)</strong>
            <div><strong>Entorno Físico:</strong> ${ish.entorno_fisico || 'Vías y alumbrado'}</div>
            <div><strong>Dinámica Social:</strong> ${ish.dinamica_social || 'Comportamiento ciudadano'}</div>
            <div><strong>Control Institucional:</strong> ${ish.control_institucional || 'Articulación operativa'}</div>
            <div><strong>Corresponsables:</strong> ${p.actores_corresponsables || 'DECAQ / Alcaldía'}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function renderizarTamirMNVCC(tamirCuadrante) {
  const tbody = document.getElementById('hsTablaTamirBody');
  if (!tbody) return;

  let lista = tamirCuadrante || [];
  if (lista.length === 0) {
    const res = await fetch('/api/mnvcc/tamir');
    if (res.ok) {
      const p = await res.json();
      lista = p.data || [];
    }
  }

  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--texto-suave);">No hay actividades preventivas registradas en la TAMIR</td></tr>';
    return;
  }

  const coloresEstado = {
    cumplida: { txt: 'Cumplida', color: '#10b981' },
    en_ejecucion: { txt: 'En Ejecución', color: '#3b82f6' },
    pendiente: { txt: 'Pendiente', color: '#f59e0b' },
    reprogramada: { txt: 'Reprogramada', color: '#94a3b8' }
  };

  tbody.innerHTML = lista.map(t => {
    const est = coloresEstado[t.estado_cumplimiento] || coloresEstado.pendiente;
    return `
      <tr>
        <td style="font-weight:700;font-size:0.76rem;">${t.codigo_cuadrante}<br><span style="font-weight:400;color:var(--texto-suave);">${t.dias_semana}</span></td>
        <td style="font-weight:600;color:#38bdf8;white-space:nowrap;">${t.franja_horaria}</td>
        <td style="font-size:0.76rem;">${t.lugar_especifico}</td>
        <td style="font-size:0.76rem;">${t.problematica_priorizada}</td>
        <td style="font-size:0.76rem;">${t.actividad_preventiva}<br><small style="color:var(--texto-suave);"><strong>Apoyo:</strong> ${t.actores_apoyo || 'Patrulla'}</small></td>
        <td style="text-align:center;">
          <span style="color:${est.color};font-weight:700;font-size:0.75rem;">● ${est.txt}</span>
        </td>
      </tr>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  inicializarModuloMNVCC();
});
