/**
 * SIGI — Centro de Control de Inteligencia Artificial y Machine Learning
 * Manejador del AI Lab: Simulador NLP en vivo, Afinación de Hiperparámetros DBSCAN y Forecasting
 */

let chartForecastInstancia = null;

const EJEMPLOS_NLP = {
  robo: "Dos sujetos a bordo de una motocicleta negra con placas tapadas encañonaron con arma de fuego a clientes en una panadería, llevándose celulares, billeteras y 500 mil pesos en efectivo antes de escapar a alta velocidad.",
  pelea: "Fuerte riña tumultuaria entre vecinos bajo estado de embriaguez con agresiones físicas, golpes, botellas rotas y amenazas con machete. Hay una persona gravemente herida con sangrado abundante que requiere ambulancia urgente.",
  piques: "Aglomeración de más de 30 jóvenes realizando piques clandestinos y carreras ilegales en la variante. Motos con escape modificado muy ruidoso haciendo acrobacias y piruetas stunt en una sola llanta poniendo en peligro a transeúntes.",
  accidente: "Violenta colisión vehicular en intersección con semáforo. Un taxi chocó contra una motocicleta particular que se pasó en luz roja. El conductor de la moto salió despedido y sufrió fractura en extremidad inferior."
};

function inicializarAILab() {
  configurarTabsAILab();
  configurarSimuladorNLP();
  cargarRankingDBSCAN();
  cargarForecastingAILab();
}

/**
 * 1. NAVEGACIÓN POR PESTAÑAS DENTRO DEL AI LAB
 */
function configurarTabsAILab() {
  const tabs = document.querySelectorAll('.ai-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.dataset.tab;
      document.querySelectorAll('.ai-tab-content').forEach(c => {
        c.style.display = (c.id === target) ? 'block' : 'none';
      });

      if (target === 'tabForecast') {
        setTimeout(() => {
          if (chartForecastInstancia) chartForecastInstancia.resize();
        }, 100);
      }
    });
  });
}

/**
 * 2. SIMULADOR NLP DE CLASIFICACIÓN EN TIEMPO REAL
 */
function configurarSimuladorNLP() {
  const textarea = document.getElementById('aiSimuladorInput');
  if (!textarea) return;

  let debounce = null;
  textarea.addEventListener('input', (e) => {
    clearTimeout(debounce);
    const texto = e.target.value.trim();
    if (texto.length < 8) return;
    debounce = setTimeout(() => {
      ejecutarPrediccionNLP(texto);
    }, 300);
  });

  // Chips de ejemplos rápidos
  document.querySelectorAll('.ai-chip-scenario').forEach(chip => {
    chip.addEventListener('click', () => {
      const tipo = chip.dataset.example;
      if (EJEMPLOS_NLP[tipo]) {
        textarea.value = EJEMPLOS_NLP[tipo];
        ejecutarPrediccionNLP(textarea.value);
      }
    });
  });

  // Ejecutar con el primer ejemplo por defecto
  ejecutarPrediccionNLP(textarea.value || EJEMPLOS_NLP.robo);
}

async function ejecutarPrediccionNLP(texto) {
  try {
    const res = await fetch('/api/ml/predecir-incidente', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descripcion: texto, hora: '22:15' })
    });

    if (!res.ok) return;
    const payload = await res.json();
    if (payload.status !== 'success') return;

    renderizarResultadosNLP(payload.data);
  } catch (err) {
    console.warn("Error en predicción NLP:", err);
  }
}

function renderizarResultadosNLP(data) {
  const { tipo, gravedad, asistencias } = data;

  // 1. Tipo y Certeza Principal
  const elTipo = document.getElementById('aiPredTipoNombre');
  const elConf = document.getElementById('aiPredConfianzaVal');
  if (elTipo) elTipo.textContent = tipo.nametipoincidente;
  if (elConf) elConf.textContent = `${tipo.confianza}%`;

  // 2. Distribución Probabilística (Filas Estructuradas con Indicadores)
  const contenedorBarras = document.getElementById('aiProbabilidadesBarras');
  if (contenedorBarras && tipo.distribucion) {
    const paleta = {
      1: { color: '#f43f5e', grad: 'linear-gradient(90deg, #e11d48, #fb7185)' }, // Robo / Hurto (Rojo/Rosa táctico)
      2: { color: '#f59e0b', grad: 'linear-gradient(90deg, #d97706, #fbbf24)' }, // Agresiones (Ámbar)
      3: { color: '#a855f7', grad: 'linear-gradient(90deg, #9333ea, #c084fc)' }, // Piques (Púrpura)
      4: { color: '#10b981', grad: 'linear-gradient(90deg, #059669, #34d399)' }  // Accidentes (Verde Esmeralda)
    };

    const maxProb = Math.max(...tipo.distribucion.map(d => d.probabilidad));

    contenedorBarras.innerHTML = tipo.distribucion.map(d => {
      const cfg = paleta[d.id] || { color: '#3b82f6', grad: 'linear-gradient(90deg, #2563eb, #60a5fa)' };
      const esLider = d.probabilidad === maxProb && d.probabilidad > 0;
      return `
        <div class="ai-prob-row ${esLider ? 'is-winner' : ''}">
          <div class="ai-prob-header">
            <div class="ai-prob-meta">
              <span class="ai-prob-dot" style="background: ${cfg.color};"></span>
              <span class="ai-prob-name">${d.nombre}</span>
              ${esLider ? '<span class="ai-prob-winner-badge">Predicción</span>' : ''}
            </div>
            <div class="ai-prob-value" style="color: ${esLider ? cfg.color : 'var(--texto-suave)'};">
              ${d.probabilidad}%
            </div>
          </div>
          <div class="ai-prob-track">
            <div class="ai-prob-fill" style="width: ${Math.max(d.probabilidad > 0 ? 3 : 0, d.probabilidad)}%; background: ${cfg.grad};"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 3. Medidor de Gravedad Táctica
  const elScore = document.getElementById('aiGravScore');
  const elGravTitulo = document.getElementById('aiGravTitulo');
  const elGravDesc = document.getElementById('aiGravDesc');
  if (elScore) {
    elScore.textContent = gravedad.nivel;
    elScore.style.background = gravedad.color;
    elScore.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.35)'; // sombra limpia de elevación sin destello molesto
  }
  if (elGravTitulo) {
    elGravTitulo.innerHTML = `
      <span>Gravedad Nivel ${gravedad.nivel}</span>
      <span class="ai-grav-tag" style="background:${gravedad.color}22; color:${gravedad.color}; border:1px solid ${gravedad.color}55;">
        ${gravedad.etiqueta}
      </span>
    `;
  }
  if (elGravDesc) {
    elGravDesc.innerHTML = `Tiempo de respuesta estimado: <strong>${gravedad.tiempo_respuesta_estimado}</strong>`;
  }

  // 4. Disparadores Críticos Detectados (XAI)
  const elTriggers = document.getElementById('aiTriggersList');
  if (elTriggers) {
    if (gravedad.factores_detectados && gravedad.factores_detectados.length > 0) {
      elTriggers.innerHTML = gravedad.factores_detectados.map(f => `
        <span class="ai-trigger-chip alert-trigger">
          Factor crítico: "${f}"
        </span>
      `).join('');
    } else {
      elTriggers.innerHTML = '<span class="ai-trigger-chip safe">Sin factores críticos detectados</span>';
    }
  }

  // 5. Asistencias de Auxilio Inmediato
  const elAsist = document.getElementById('aiAsistenciasRecomendadas');
  if (elAsist) {
    const pills = [];
    if (asistencias.policia) {
      pills.push('<span class="ai-dispatch-pill dispatch-police">Patrulla de Policía</span>');
    }
    if (asistencias.ambulancia) {
      pills.push('<span class="ai-dispatch-pill dispatch-ambulance">Unidad Médica / Paramédicos</span>');
    }
    if (asistencias.bomberos) {
      pills.push('<span class="ai-dispatch-pill dispatch-fire">Bomberos / Rescate</span>');
    }
    if (pills.length === 0) {
      pills.push('<span class="ai-dispatch-pill dispatch-standard">Patrullaje Preventivo</span>');
    }
    elAsist.innerHTML = pills.join('');
  }
}

/**
 * 3. RANKING Y AFINACIÓN DE HIPERPARÁMETROS DBSCAN
 */
async function cargarRankingDBSCAN(eps = 450, minPts = 3, tipo = '') {
  const tbody = document.getElementById('aiTablaClustersBody');
  const kpiClusters = document.getElementById('aiKpiTotalClusters');
  const kpiPuntos = document.getElementById('aiKpiPuntosAgrupados');
  const kpiRuido = document.getElementById('aiKpiRuido');

  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px; color:#8b949e;">Ejecutando agrupamiento DBSCAN sobre las coordenadas...</td></tr>';
  }

  try {
    let url = `/api/ml/hotspots?eps=${eps}&minPts=${minPts}`;
    if (tipo) url += `&tipo=${tipo}`;

    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();

    if (kpiClusters) kpiClusters.textContent = data.total_clusters || 0;
    if (kpiRuido) kpiRuido.textContent = data.total_ruido || 0;

    let totalEnClusters = 0;
    if (data.clusters) {
      data.clusters.forEach(c => totalEnClusters += c.cantidad_incidentes);
    }
    if (kpiPuntos) kpiPuntos.textContent = totalEnClusters;

    if (!tbody) return;
    if (!data.clusters || data.clusters.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 24px; color: var(--texto-suave);">No se formaron clusters densos con los parámetros seleccionados. Prueba aumentando el radio epsilon.</td></tr>';
      return;
    }

    tbody.innerHTML = data.clusters.map((c, idx) => {
      const nombreLimpio = (c.nombre || `Zona Crítica ${idx + 1}`).replace(/#/g, '');
      return `
        <tr>
          <td class="ai-cluster-col-rank"><span class="ai-cluster-rank-num">${idx + 1}</span></td>
          <td>
            <div class="ai-cluster-name">${nombreLimpio}</div>
            <div class="ai-cluster-sub">Centroide: ${c.centroide.lat.toFixed(4)}, ${c.centroide.lng.toFixed(4)}</div>
          </td>
          <td>
            <span class="ai-risk-badge" style="background: ${c.color}1a; color: ${c.color}; border: 1px solid ${c.color}40;">
              ${c.nivel_riesgo}
            </span>
          </td>
          <td class="ai-cluster-metric"><b>${c.cantidad_incidentes}</b> <span class="ai-cluster-unit">casos</span></td>
          <td class="ai-cluster-metric"><b>${c.gravedad_promedio}</b> <span class="ai-cluster-unit">/ 5.0</span></td>
          <td>
            <button type="button" class="btn-ir-cluster" onclick="irAClusterEnMapa(${c.centroide.lat}, ${c.centroide.lng}, '${nombreLimpio}')">
              Ver en mapa
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Actualizar también la Quick Bar flotante del mapa si existe
    actualizarQuickBarMapa(data);
  } catch (err) {
    console.warn("Error cargando DBSCAN:", err);
  }
}

/**
 * Lleva la cámara Leaflet directamente a un cluster DBSCAN seleccionado
 */
window.irAClusterEnMapa = function(lat, lng, nombre) {
  // Cambiar a vista de mapa
  const navMapa = document.querySelector('.nav-btn[data-view="mapa"]') || document.querySelector('.mobile-nav-tab[data-view="mapa"]');
  if (navMapa) navMapa.click();

  setTimeout(() => {
    if (typeof map !== 'undefined' && map) {
      // Activar capa DBSCAN si estaba apagada
      const btnToggleDBSCAN = document.getElementById("btnToggleDBSCAN");
      if (btnToggleDBSCAN && !btnToggleDBSCAN.classList.contains("activo")) {
        btnToggleDBSCAN.click();
      }

      map.flyTo([lat, lng], 16, {
        animate: true,
        duration: 1.2
      });
    }
  }, 300);
};

/**
 * 4. PRONÓSTICO Y FORECASTING CON CHART.JS
 */
async function cargarForecastingAILab() {
  try {
    const res = await fetch('/api/ml/forecast?meses=3');
    if (!res.ok) return;
    const json = await res.json();
    if (json.status !== 'success' || !json.data) return;

    const data = json.data;

    // Actualizar KPIs de proyección
    const elTend = document.getElementById('aiForecastTendenciaVal');
    const elProxMes = document.getElementById('aiForecastProximoMes');
    const elCambio = document.getElementById('aiForecastCambioPct');

    if (elTend) elTend.textContent = data.tendencia || 'Estable';
    if (elProxMes && data.proyeccion && data.proyeccion[0]) {
      elProxMes.textContent = `${data.proyeccion[0].cantidad_estimada} incidentes`;
    }
    if (elCambio) {
      const signo = data.porcentaje_cambio >= 0 ? '+' : '';
      elCambio.textContent = `${signo}${data.porcentaje_cambio}%`;
      elCambio.style.color = data.porcentaje_cambio > 0 ? '#f87171' : '#34d399';
    }

    // Dibujar gráfico con Chart.js
    const canvas = document.getElementById('chartForecastCanvas');
    if (!canvas || typeof Chart === 'undefined') return;

    const labels = [];
    const datosReales = [];
    const datosProyectados = [];
    const datosBandaSuperior = [];
    const datosBandaInferior = [];

    // Meses históricos
    if (data.historico) {
      data.historico.forEach(h => {
        labels.push(h.mes);
        datosReales.push(h.total);
        datosProyectados.push(null);
        datosBandaSuperior.push(null);
        datosBandaInferior.push(null);
      });
    }

    // Conectar el último valor real con el inicio de la proyección
    if (datosReales.length > 0) {
      const ultimoIdx = datosReales.length - 1;
      datosProyectados[ultimoIdx] = datosReales[ultimoIdx];
      datosBandaSuperior[ultimoIdx] = datosReales[ultimoIdx];
      datosBandaInferior[ultimoIdx] = datosReales[ultimoIdx];
    }

    // Proyecciones
    if (data.proyeccion) {
      data.proyeccion.forEach(p => {
        labels.push(p.mes_futuro);
        datosReales.push(null);
        datosProyectados.push(p.cantidad_estimada);
        datosBandaSuperior.push(p.intervalo_confianza ? p.intervalo_confianza[1] : p.cantidad_estimada);
        datosBandaInferior.push(p.intervalo_confianza ? p.intervalo_confianza[0] : p.cantidad_estimada);
      });
    }

    if (chartForecastInstancia) {
      chartForecastInstancia.destroy();
    }

    const esClaro = document.body.classList.contains('tema-claro');
    const colorTexto = esClaro ? '#0f172a' : '#e2e8f0';
    const colorTicks = esClaro ? '#475569' : '#94a3b8';
    const colorGrid = esClaro ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)';

    const ctx = canvas.getContext('2d');
    chartForecastInstancia = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Incidentes Históricos Reales',
            data: datosReales,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.25,
            pointBackgroundColor: '#3b82f6'
          },
          {
            label: 'Pronóstico del Modelo (Machine Learning)',
            data: datosProyectados,
            borderColor: '#a855f7',
            borderDash: [5, 5],
            borderWidth: 2.5,
            pointBackgroundColor: '#a855f7',
            pointRadius: 5
          },
          {
            label: 'Banda Superior (Confianza 85%)',
            data: datosBandaSuperior,
            borderColor: 'transparent',
            backgroundColor: 'rgba(168, 85, 247, 0.15)',
            fill: '+1',
            pointRadius: 0
          },
          {
            label: 'Banda Inferior (Confianza 85%)',
            data: datosBandaInferior,
            borderColor: 'transparent',
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: colorTexto,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }
            }
          }
        },
        scales: {
          x: {
            grid: { color: colorGrid },
            ticks: { color: colorTicks }
          },
          y: {
            grid: { color: colorGrid },
            ticks: { color: colorTicks },
            beginAtZero: true
          }
        }
      }
    });

  } catch (err) {
    console.warn("Error cargando forecast:", err);
  }
}

// Exponer sincronización con cambio de tema
window.actualizarForecastTema = () => {
  if (chartForecastInstancia) {
    cargarForecastingAILab();
  }
};

/**
 * 5. QUICK BAR FLOTANTE EN EL MAPA PARA AJUSTAR HIPERPARÁMETROS
 */
function actualizarQuickBarMapa(data) {
  let dock = document.getElementById('mapDbscanQuickDock');
  if (!dock) {
    dock = document.createElement('div');
    dock.id = 'mapDbscanQuickDock';
    dock.className = 'map-dbscan-dock';
    dock.style.display = 'none';

    dock.innerHTML = `
      <div style="display:flex; align-items:center; gap: 8px;">
        <span><b>DBSCAN:</b> <span id="quickDockClustersCount">0</span> zonas críticas</span>
      </div>
      <div style="display:flex; align-items:center; gap: 6px;">
        <label style="font-size:0.75rem; color:#94a3b8;">Radio ε:</label>
        <select id="selectQuickEps">
          <option value="250">250m</option>
          <option value="450" selected>450m</option>
          <option value="750">750m</option>
          <option value="1000">1 km</option>
        </select>
      </div>
      <button type="button" class="btn-open-ailab" onclick="abrirAILabDesdeMapa()">
        Abrir AI Lab
      </button>
    `;

    const mapWrapper = document.querySelector('.map-wrapper') || document.getElementById('vistaMapa');
    if (mapWrapper) mapWrapper.appendChild(dock);

    const selEps = document.getElementById('selectQuickEps');
    if (selEps) {
      selEps.addEventListener('change', (e) => {
        const nuevoEps = parseInt(e.target.value, 10);
        if (typeof cargarYRenderizarHotspotsML === 'function') {
          cargarYRenderizarHotspotsML(nuevoEps);
        }
        cargarRankingDBSCAN(nuevoEps);
      });
    }
  }

  const countSpan = document.getElementById('quickDockClustersCount');
  if (countSpan && data) {
    countSpan.textContent = data.total_clusters || 0;
  }
}

window.abrirAILabDesdeMapa = function() {
  const navAILab = document.querySelector('.nav-btn[data-view="ia-hub"]') || document.querySelector('.mobile-nav-tab[data-view="ia-hub"]');
  if (navAILab) navAILab.click();
};

// Exponer globalmente
window.inicializarAILab = inicializarAILab;
window.cargarRankingDBSCAN = cargarRankingDBSCAN;
