let tiposId = [];

// Variables globales para el filtro de tiempo
let filtroFechaDesde = "";
let filtroFechaHasta = "";

// ── Control de Tema Claro / Oscuro en Dashboard ──
function inicializarTemaDashboard() {
    const temaGuardado = localStorage.getItem("tema_sigi_dashboard") || localStorage.getItem("tema_sigi_admin");
    if (temaGuardado === "claro") {
        document.body.classList.add("tema-claro");
    }
    actualizarIconosTema();
}

function actualizarIconosTema() {
    const esClaro = document.body.classList.contains("tema-claro");

    // Actualizar meta theme-color para navegadores móviles
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
        metaTheme.setAttribute("content", esClaro ? "#f5f7fa" : "#0d1117");
    }
}

function alternarTemaDashboard() {
    document.body.classList.toggle("tema-claro");
    const esClaro = document.body.classList.contains("tema-claro");
    localStorage.setItem("tema_sigi_dashboard", esClaro ? "claro" : "oscuro");
    actualizarIconosTema();

    // Actualizar gráficos de Chart.js si existen para ajustar colores de cuadrícula y etiquetas
    if (typeof Chart !== 'undefined' && Chart.instances) {
        Object.values(Chart.instances).forEach(chart => {
            if (chart && chart.options) {
                const colorTexto = esClaro ? '#0f172a' : '#e6edf3';
                const colorSecundario = esClaro ? '#475569' : '#8b949e';
                const colorGrid = esClaro ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.06)';
                
                if (chart.options.plugins && chart.options.plugins.legend && chart.options.plugins.legend.labels) {
                    chart.options.plugins.legend.labels.color = colorTexto;
                }
                if (chart.options.scales) {
                    if (chart.options.scales.x) {
                        if (chart.options.scales.x.ticks) chart.options.scales.x.ticks.color = colorSecundario;
                        if (chart.options.scales.x.grid) chart.options.scales.x.grid.color = colorGrid;
                    }
                    if (chart.options.scales.y) {
                        if (chart.options.scales.y.ticks) chart.options.scales.y.ticks.color = colorTexto;
                        if (chart.options.scales.y.grid) chart.options.scales.y.grid.color = colorGrid;
                    }
                }
                if (chart.data && chart.data.datasets) {
                    chart.data.datasets.forEach(ds => {
                        if (chart.config && chart.config.type === 'doughnut') {
                            ds.borderColor = esClaro ? '#ffffff' : '#0d1117';
                        }
                        if (chart.config && chart.config.type === 'line') {
                            ds.pointBorderColor = esClaro ? '#ffffff' : '#0d1117';
                        }
                    });
                }
                chart.update();
            }
        });
    }
    if (typeof cargarResumen === 'function') {
        cargarResumen();
    }
    if (typeof cargarIncidentesBarra === 'function') {
        cargarIncidentesBarra();
    }
    if (typeof window.actualizarForecastTema === 'function') {
        window.actualizarForecastTema();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    inicializarTemaDashboard();
    
    const btnTemaDesk = document.getElementById("btnTemaHeaderDashboard");
    if (btnTemaDesk) {
        btnTemaDesk.addEventListener("click", (e) => {
            e.stopPropagation();
            alternarTemaDashboard();
        });
    }

    const btnTemaMob = document.getElementById("btnTemaHeaderMobile");
    if (btnTemaMob) {
        btnTemaMob.addEventListener("click", (e) => {
            e.stopPropagation();
            alternarTemaDashboard();
        });
    }
});

function formatearFecha(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Inicializar a 3 meses por defecto
const hoyInicial = new Date();
const hace3MesesInicial = new Date();
hace3MesesInicial.setMonth(hoyInicial.getMonth() - 3);
filtroFechaDesde = formatearFecha(hace3MesesInicial);
filtroFechaHasta = formatearFecha(hoyInicial);

const inpBuscarLugar = document.getElementById("buscarLugar");

const contenedor = document.getElementById("sugerencias");
const panelEst = document.getElementById("estadisticas");
const panelMap = document.getElementById("vistaMapa");
const panelFiltros = document.getElementById("panelFiltros");
const filtrosOverlay = document.getElementById("filtrosOverlay");
const badgeFiltros = document.getElementById("badgeFiltros");
const btnFiltros = document.getElementById("btnFiltros");
const cerrarFiltros = document.getElementById("cerrarFiltros");

const MOBILE_BREAKPOINT = 768;

function esMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
}

let vistaActual = "inicio";

function cambiarVista(vistaId) {
    vistaActual = vistaId;
    cerrarPanelFiltros(false);

    // Ocultar todo
    const panelInicio = document.getElementById("vistaInicio");
    if (panelInicio) {
        panelInicio.classList.add("esconder");
        panelInicio.classList.remove("vista-activa");
    }

    panelMap.classList.add("esconder");
    panelMap.classList.remove("vista-activa");
    
    const vistaTabla = document.getElementById("vistaTabla");
    vistaTabla.classList.add("esconder");
    vistaTabla.classList.remove("vista-activa");
    
    panelEst.classList.add("esconder");
    panelEst.classList.remove("vista-activa");

    const vistaIA = document.getElementById("vistaIA");
    if (vistaIA) {
        vistaIA.classList.add("esconder");
        vistaIA.classList.remove("vista-activa");
    }

    // Reubicación dinámica de la barra de filtros y acciones
    const actionsGroup = document.querySelector(".map-actions-group");
    const contenedorTabla = document.getElementById("contenedorAccionesTabla");
    const contenedorMobileIncidentes = document.getElementById("contenedorAccionesIncidentesMobile");
    const contenedorAnalitica = document.getElementById("contenedorAccionesAnalitica");
    const btnExportarCsv = document.getElementById("btnExportarCsv");
    const mapEl = document.getElementById("map");
    const btnMiUbicacion = document.getElementById("btnMiUbicacion");
    const btnToggleHeatmap = document.getElementById("btnToggleHeatmap");
    const btnToggleDBSCAN = document.getElementById("btnToggleDBSCAN");
    const quickDbscanDock = document.getElementById("mapDbscanQuickDock");

    if (actionsGroup) {
        if (vistaId === "tabla") {
            const esMovil = window.innerWidth <= 768;
            const targetContainer = (esMovil && contenedorMobileIncidentes) ? contenedorMobileIncidentes : contenedorTabla;
            if (targetContainer) {
                if (btnExportarCsv && btnExportarCsv.parentElement === targetContainer) {
                    targetContainer.insertBefore(actionsGroup, btnExportarCsv);
                } else {
                    targetContainer.appendChild(actionsGroup);
                }
            }
            actionsGroup.classList.add("en-tabla");
            actionsGroup.classList.remove("en-analitica");
            if (btnMiUbicacion) btnMiUbicacion.style.display = "none";
            if (btnToggleHeatmap) btnToggleHeatmap.style.display = "none";
            if (btnToggleDBSCAN) btnToggleDBSCAN.style.display = "none";
            if (quickDbscanDock) quickDbscanDock.style.display = "none";
        } else if (vistaId === "estadisticas" && contenedorAnalitica) {
            contenedorAnalitica.appendChild(actionsGroup);
            actionsGroup.classList.add("en-analitica");
            actionsGroup.classList.remove("en-tabla");
            if (btnMiUbicacion) btnMiUbicacion.style.display = "none";
            if (btnToggleHeatmap) btnToggleHeatmap.style.display = "none";
            if (btnToggleDBSCAN) btnToggleDBSCAN.style.display = "none";
            if (quickDbscanDock) quickDbscanDock.style.display = "none";
        } else {
            if (mapEl) {
                mapEl.appendChild(actionsGroup);
                if (typeof L !== "undefined" && L.DomEvent) {
                    L.DomEvent.disableClickPropagation(actionsGroup);
                    L.DomEvent.disableScrollPropagation(actionsGroup);
                }
            }
            actionsGroup.classList.remove("en-tabla");
            actionsGroup.classList.remove("en-analitica");
            if (btnMiUbicacion) btnMiUbicacion.style.display = "";
            if (btnToggleHeatmap) btnToggleHeatmap.style.display = "";
            if (btnToggleDBSCAN) btnToggleDBSCAN.style.display = (vistaId === "mapa" || vistaId === "mapa-completo") ? "" : "none";
            if (quickDbscanDock && vistaId !== "mapa" && vistaId !== "mapa-completo") quickDbscanDock.style.display = "none";
        }
    }

    // Lógica por vista
    if (vistaId === "inicio") {
        if (panelInicio) {
            panelInicio.classList.remove("esconder");
            panelInicio.classList.add("vista-activa");
        }
    } else if (vistaId === "mapa") {
        panelMap.classList.remove("esconder");
        panelMap.classList.add("vista-activa");
        panelMap.classList.remove("modo-explorar");
        panelFiltros.classList.remove("esconder-desktop"); // Mostrar panel derecho
        document.querySelector(".main-content")?.scrollTo(0, 0);
        document.getElementById("vistaMapa")?.scrollTo(0, 0);
        document.querySelector(".map-wrapper")?.scrollTo(0, 0);
        setTimeout(() => map.invalidateSize(), 350); // Ajuste: 350ms para esperar que termine la transición CSS
    } else if (vistaId === "mapa-completo") {
        panelMap.classList.remove("esconder");
        panelMap.classList.add("vista-activa");
        panelMap.classList.add("modo-explorar");
        panelFiltros.classList.add("esconder-desktop"); // Ocultar panel derecho
        document.querySelector(".main-content")?.scrollTo(0, 0);
        document.getElementById("vistaMapa")?.scrollTo(0, 0);
        document.querySelector(".map-wrapper")?.scrollTo(0, 0);
        setTimeout(() => map.invalidateSize(), 350); // Ajuste: 350ms para esperar que termine la transición CSS
    } else if (vistaId === "tabla") {
        vistaTabla.classList.remove("esconder");
        vistaTabla.classList.add("vista-activa");
        llenarTablaIncidentes();
    } else if (vistaId === "estadisticas") {
        panelEst.classList.remove("esconder");
        panelEst.classList.add("vista-activa");
        cargarResumen();
        cargarIncidentesBarra();
    } else if (vistaId === "ia-hub") {
        const vistaIA = document.getElementById("vistaIA");
        if (vistaIA) {
            vistaIA.classList.remove("esconder");
            vistaIA.classList.add("vista-activa");
            if (typeof inicializarAILab === 'function') {
                inicializarAILab();
            }
        }
    }

    // Control de visibilidad del contenedor de KPIs (solo activo en vistas de mapa)
    const ribbonKpisEl = document.getElementById("kpiRibbon");
    const btnAbrirKpisEl = document.getElementById("btnAbrirKpis");
    const vistaMapaEl = document.getElementById("vistaMapa");
    if (ribbonKpisEl) {
        if (vistaId === "mapa" || vistaId === "mapa-completo") {
            if (!ribbonKpisEl.classList.contains("kpi-oculto")) {
                ribbonKpisEl.classList.remove("esconder");
                ribbonKpisEl.style.removeProperty("display");
                ribbonKpisEl.style.setProperty("display", "flex", "important");
                if (btnAbrirKpisEl) {
                    btnAbrirKpisEl.classList.remove("visible");
                    btnAbrirKpisEl.style.setProperty("display", "none", "important");
                }
                vistaMapaEl?.classList.remove("vista-mapa-kpi-oculto");
            } else {
                ribbonKpisEl.classList.add("esconder");
                ribbonKpisEl.style.setProperty("display", "none", "important");
                if (btnAbrirKpisEl) {
                    btnAbrirKpisEl.classList.add("visible");
                    btnAbrirKpisEl.style.setProperty("display", "inline-flex", "important");
                }
                vistaMapaEl?.classList.add("vista-mapa-kpi-oculto");
            }
        } else {
            ribbonKpisEl.classList.add("esconder");
            ribbonKpisEl.style.setProperty("display", "none", "important");
            if (btnAbrirKpisEl) {
                btnAbrirKpisEl.classList.remove("visible");
                btnAbrirKpisEl.style.setProperty("display", "none", "important");
            }
        }
    }

    // Actualizar botones de navegación móviles y desktop
    document.querySelectorAll(".nav-btn[data-view]").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.view === vistaId);
    });
    document.querySelectorAll(".bottom-nav-item[data-view], .mobile-nav-tab[data-view]").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.view === vistaId);
    });
}

let paginaActualTabla = 1;
const REGISTROS_POR_PAGINA = 12;

function llenarTablaIncidentes(resetPagina = false) {
    if (resetPagina) {
        paginaActualTabla = 1;
    }

    const tbody = document.getElementById("tbodyIncidentesPublica");
    const infoPaginacion = document.getElementById("infoPaginacionTabla");
    const labelPagina = document.getElementById("labelPaginaTabla");
    const btnAnt = document.getElementById("btnPagAntTabla");
    const btnSig = document.getElementById("btnPagSigTabla");

    // Llenar Feed Nativo Móvil si aplica
    renderizarFeedIncidentesMobile();

    if (!tbody) return;
    tbody.innerHTML = "";

    if (!incidentesData || incidentesData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No hay incidentes para mostrar.</td></tr>`;
        if (infoPaginacion) infoPaginacion.innerText = "Mostrando 0 de 0 incidentes";
        if (labelPagina) labelPagina.innerText = "Página 1 de 1";
        if (btnAnt) btnAnt.disabled = true;
        if (btnSig) btnSig.disabled = true;
        return;
    }

    // Ordenar de más reciente a más antiguo por fecha y hora
    const incidentesOrdenados = [...incidentesData].sort((a, b) => {
        const fechaStrA = a.fechaincidente ? a.fechaincidente.slice(0, 10) : "";
        const fechaStrB = b.fechaincidente ? b.fechaincidente.slice(0, 10) : "";
        const timeA = new Date(`${fechaStrA}T${a.horaincidente || "00:00:00"}`).getTime() || 0;
        const timeB = new Date(`${fechaStrB}T${b.horaincidente || "00:00:00"}`).getTime() || 0;
        return timeB - timeA;
    });

    const totalRegistros = incidentesOrdenados.length;
    const totalPaginas = Math.ceil(totalRegistros / REGISTROS_POR_PAGINA) || 1;
    if (paginaActualTabla > totalPaginas) paginaActualTabla = totalPaginas;
    if (paginaActualTabla < 1) paginaActualTabla = 1;

    const inicio = (paginaActualTabla - 1) * REGISTROS_POR_PAGINA;
    const fin = Math.min(inicio + REGISTROS_POR_PAGINA, totalRegistros);
    const incidentesPagina = incidentesOrdenados.slice(inicio, fin);

    incidentesPagina.forEach((inc, idx) => {
        const consecutivo = inicio + idx + 1;
        const fecha = inc.fechaincidente ? new Date(inc.fechaincidente).toLocaleDateString("es-CO") : "N/A";
        const hora = inc.horaincidente ? inc.horaincidente.slice(0, 5) : "N/A";
        const zona = inc.namebarrio || inc.nombrevereda || 'Sin zona';

        let badgeClass = "badge-default";
        if (inc.idtipoincidente === 1) badgeClass = "badge-robo";
        if (inc.idtipoincidente === 2) badgeClass = "badge-agresion";
        if (inc.idtipoincidente === 3) badgeClass = "badge-pique";
        if (inc.idtipoincidente === 4) badgeClass = "badge-accidente";

        const tr = document.createElement("tr");
        tr.className = "fila-incidente-hover";
        tr.innerHTML = `
            <td style="color: var(--texto-suave); font-weight: bold;">${consecutivo}</td>
            <td><strong>${inc.codigoincidente || 'N/A'}</strong></td>
            <td><span class="badge-tipo ${badgeClass}">${inc.nametipoincidente || 'N/A'}</span></td>
            <td>${zona}</td>
            <td>${fecha}</td>
            <td>${hora}</td>
        `;
        tr.addEventListener("click", () => mostrarDetalleIncidente(inc));
        tbody.appendChild(tr);
    });

    // Actualizar controles de paginación estilo Admin/Superadmin
    if (infoPaginacion) {
        infoPaginacion.innerText = totalRegistros > 0
            ? `Mostrando ${inicio + 1} a ${fin} de ${totalRegistros} incidentes`
            : "Mostrando 0 de 0 incidentes";
    }

    if (labelPagina) {
        labelPagina.innerText = `Página ${paginaActualTabla} de ${totalPaginas}`;
    }

    if (btnAnt) {
        btnAnt.disabled = paginaActualTabla <= 1;
        btnAnt.onclick = () => cambiarPaginaTabla(paginaActualTabla - 1);
    }

    if (btnSig) {
        btnSig.disabled = paginaActualTabla >= totalPaginas;
        btnSig.onclick = () => cambiarPaginaTabla(paginaActualTabla + 1);
    }
}

function renderizarFeedIncidentesMobile(datos = incidentesData) {
    const feed = document.getElementById("feedIncidentesMobile");
    const badge = document.getElementById("badgeIncidentesMobile");
    const paginacion = document.getElementById("paginacionFeedMobile");
    if (!feed) return;

    feed.innerHTML = "";

    if (!datos || datos.length === 0) {
        feed.innerHTML = `
            <div style="text-align:center; padding: 40px 16px; color:#64748b;">
                <i class="bi bi-inbox" style="font-size: 2.5rem; display:block; margin-bottom:10px;"></i>
                <p style="margin:0;">No se encontraron reportes con los filtros aplicados.</p>
            </div>
        `;
        if (badge) badge.textContent = "0 reportes";
        if (paginacion) paginacion.innerHTML = "";
        return;
    }

    if (badge) badge.textContent = `${datos.length} reportes`;

    // Ordenar de más reciente a más antiguo por fecha y hora
    const incidentesOrdenados = [...datos].sort((a, b) => {
        const fechaStrA = a.fechaincidente ? a.fechaincidente.slice(0, 10) : "";
        const fechaStrB = b.fechaincidente ? b.fechaincidente.slice(0, 10) : "";
        const timeA = new Date(`${fechaStrA}T${a.horaincidente || "00:00:00"}`).getTime() || 0;
        const timeB = new Date(`${fechaStrB}T${b.horaincidente || "00:00:00"}`).getTime() || 0;
        return timeB - timeA;
    });

    const totalPaginas = Math.ceil(incidentesOrdenados.length / REGISTROS_POR_PAGINA);
    const inicio = (paginaActualTabla - 1) * REGISTROS_POR_PAGINA;
    const fin = Math.min(inicio + REGISTROS_POR_PAGINA, incidentesOrdenados.length);
    const paginaDatos = incidentesOrdenados.slice(inicio, fin);

    paginaDatos.forEach(inc => {
        const fecha = inc.fechaincidente ? new Date(inc.fechaincidente).toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }) : "N/A";
        const hora = inc.horaincidente ? inc.horaincidente.slice(0, 5) : "N/A";
        const zona = inc.namebarrio || inc.nombrevereda || 'Sin zona';
        const tipoName = inc.nametipoincidente || 'Incidente';

        let colorClass = "var(--acento)";

        const tipoLower = String(tipoName).toLowerCase();
        if (inc.idtipoincidente === 1 || tipoLower.includes("robo")) {
            colorClass = "var(--rojo)";
        } else if (inc.idtipoincidente === 2 || tipoLower.includes("agresi")) {
            colorClass = "var(--amarillo)";
        } else if (inc.idtipoincidente === 3 || tipoLower.includes("pique")) {
            colorClass = "var(--magenta)";
        } else if (inc.idtipoincidente === 4 || tipoLower.includes("accidente")) {
            colorClass = "var(--verde)";
        }

        const card = document.createElement("div");
        card.className = "mobile-incident-card";
        card.innerHTML = `
            <div class="mic-header">
                <div class="mic-type-badge">
                    <span class="mic-type-text" data-tipo="${tipoLower}" style="color: ${colorClass} !important;">${tipoName}</span>
                </div>
                <span class="mic-code">${inc.codigoincidente || 'N/A'}</span>
            </div>

            <div class="mic-grid">
                <div class="mic-item">
                    <span class="mic-label">Barrio / Zona</span>
                    <span class="mic-val">${zona}</span>
                </div>
                <div class="mic-item">
                    <span class="mic-label">Fecha y Hora</span>
                    <span class="mic-val">${fecha} · ${hora}</span>
                </div>
            </div>

            <div class="mic-footer">
                <span style="font-size: 0.72rem; color: #94a3b8; display: flex; align-items: center; gap: 4px;">
                    <i class="bi bi-clock-history"></i> Registrado
                </span>
                <button type="button" class="btn-mic-view">
                    <i class="bi bi-geo-alt-fill"></i> Ver detalle
                </button>
            </div>
        `;

        card.querySelector(".btn-mic-view").addEventListener("click", () => mostrarDetalleIncidente(inc));
        feed.appendChild(card);
    });

    // Renderizar paginador móvil
    if (paginacion && totalPaginas > 1) {
        paginacion.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-top:10px;">
                <button class="btn-mic-view" ${paginaActualTabla === 1 ? 'disabled style="opacity:0.4;"' : ''} onclick="cambiarPaginaTabla(${paginaActualTabla - 1})"><i class="bi bi-chevron-left"></i> Anterior</button>
                <span style="font-size:0.8rem; color:#94a3b8; font-weight:600;">${paginaActualTabla} / ${totalPaginas}</span>
                <button class="btn-mic-view" ${paginaActualTabla === totalPaginas ? 'disabled style="opacity:0.4;"' : ''} onclick="cambiarPaginaTabla(${paginaActualTabla + 1})">Siguiente <i class="bi bi-chevron-right"></i></button>
            </div>
        `;
    } else if (paginacion) {
        paginacion.innerHTML = "";
    }
}

function cambiarPaginaTabla(nuevaPagina) {
    paginaActualTabla = nuevaPagina;
    llenarTablaIncidentes(false);
}

function mostrarDetalleIncidente(inc) {
    const modal = document.getElementById("modalDetalleIncidente");
    const cuerpo = document.getElementById("cuerpoDetalleIncidente");
    if (!modal || !cuerpo) return;

    const fecha = inc.fechaincidente ? new Date(inc.fechaincidente).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    }) : "N/A";
    const hora = inc.horaincidente ? inc.horaincidente.slice(0, 5) : "N/A";
    const zona = inc.namebarrio || inc.nombrevereda || 'Sin zona asignada';

    let badgeClass = "badge-default";
    let iconClass = "bi-shield-exclamation";
    let heroClass = "hero-robo";
    let iconBg = "rgba(239, 68, 68, 0.15)";
    let iconColor = "#ef4444";

    if (inc.idtipoincidente === 1) {
        badgeClass = "badge-robo";
        iconClass = "bi-shield-shaded";
        heroClass = "hero-robo";
        iconBg = "rgba(239, 68, 68, 0.15)";
        iconColor = "#ef4444";
    } else if (inc.idtipoincidente === 2) {
        badgeClass = "badge-agresion";
        iconClass = "bi-exclamation-triangle-fill";
        heroClass = "hero-agresion";
        iconBg = "rgba(245, 158, 11, 0.15)";
        iconColor = "#f59e0b";
    } else if (inc.idtipoincidente === 3) {
        badgeClass = "badge-pique";
        iconClass = "bi-lightning-charge-fill";
        heroClass = "hero-pique";
        iconBg = "rgba(168, 85, 247, 0.15)";
        iconColor = "#a855f7";
    } else if (inc.idtipoincidente === 4) {
        badgeClass = "badge-accidente";
        iconClass = "bi-car-front-fill";
        heroClass = "hero-accidente";
        iconBg = "rgba(16, 185, 129, 0.15)";
        iconColor = "#10b981";
    }

    const hasCoords = inc.lat && inc.lng && !isNaN(Number(inc.lat)) && !isNaN(Number(inc.lng));
    const coordsStr = hasCoords ? `${Number(inc.lat).toFixed(4)}, ${Number(inc.lng).toFixed(4)}` : '';

    cuerpo.innerHTML = `
        <div class="detalle-hero ${heroClass}">
            <div class="detalle-hero-info">
                <div class="detalle-hero-top">
                    <span class="detalle-hero-tipo ${badgeClass}">${inc.nametipoincidente || 'Incidente'}</span>
                    <span class="detalle-hero-codigo">${inc.codigoincidente || 'N/A'}</span>
                </div>
                <h4 class="detalle-hero-zona" title="${zona}">${zona}</h4>
            </div>
        </div>

        <div class="detalle-cards-grid">
            <div class="detalle-card-item">
                <div class="detalle-card-body">
                    <span class="dcb-label">Fecha y Hora</span>
                    <span class="dcb-val">${fecha}</span>
                    <span class="dcb-val" style="font-size: 0.78rem; opacity: 0.85;">${hora !== 'N/A' ? hora + ' hrs' : 'Sin hora'}</span>
                </div>
            </div>

            <div class="detalle-card-item">
                <div class="detalle-card-body">
                    <span class="dcb-label">Ubicación</span>
                    <span class="dcb-val">${zona}</span>
                    ${hasCoords ? `<span class="dcb-val" style="font-size: 0.74rem; opacity: 0.8; font-family: monospace;">${coordsStr}</span>` : ''}
                </div>
            </div>
        </div>

        <div class="detalle-desc-box">
            <div class="ddb-header">
                <i class="bi bi-card-text"></i> Descripción del Reporte
            </div>
            <p class="ddb-text">${inc.descripcionincidente || 'Sin observaciones o descripción detallada registrada para este reporte.'}</p>
        </div>

        <div class="detalle-modal-acciones">
            ${hasCoords ? `
            <button type="button" class="btn-detalle-centrar" id="btnCentrarIncidenteMapa">
                <i class="bi bi-geo-alt-fill"></i> Ver en el mapa
            </button>
            ` : ''}
            <button type="button" class="btn-detalle-cerrar" id="btnCerrarDetalleModal">
                Cerrar
            </button>
        </div>
    `;

    const btnCentrar = cuerpo.querySelector("#btnCentrarIncidenteMapa");
    if (btnCentrar && hasCoords) {
        btnCentrar.addEventListener("click", () => {
            modal.style.display = "none";
            cambiarVista("mapa");
            setTimeout(() => {
                if (map) {
                    const targetLat = Number(inc.lat);
                    const targetLng = Number(inc.lng);
                    map.setView([targetLat, targetLng], 17, { animate: true });

                    if (capaIncidentes) {
                        capaIncidentes.eachLayer(layer => {
                            if (layer.getLatLng) {
                                const lPos = layer.getLatLng();
                                if (Math.abs(lPos.lat - targetLat) < 0.0001 && Math.abs(lPos.lng - targetLng) < 0.0001) {
                                    if (typeof capaIncidentes.zoomToShowLayer === "function") {
                                        capaIncidentes.zoomToShowLayer(layer, () => {
                                            layer.openPopup();
                                        });
                                    } else {
                                        layer.openPopup();
                                    }
                                }
                            }
                        });
                    }

                    // Efecto de palpitación visual (radar/beacon) durante 3 segundos
                    const beaconIcon = L.divIcon({
                        className: 'beacon-pin-container',
                        html: `
                            <div class="beacon-pulse-wrapper">
                                <div class="beacon-ripple ring-1"></div>
                                <div class="beacon-ripple ring-2"></div>
                                <div class="beacon-core"></div>
                            </div>
                        `,
                        iconSize: [40, 40],
                        iconAnchor: [20, 20]
                    });

                    const beaconMarker = L.marker([targetLat, targetLng], {
                        icon: beaconIcon,
                        zIndexOffset: 10000,
                        interactive: false
                    }).addTo(map);

                    setTimeout(() => {
                        if (map && map.hasLayer(beaconMarker)) {
                            map.removeLayer(beaconMarker);
                        }
                    }, 3000);
                }
            }, 300);
        });
    }

    const btnCerrar = cuerpo.querySelector("#btnCerrarDetalleModal");
    if (btnCerrar) {
        btnCerrar.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    modal.style.display = "flex";
}

const modalDetalleIncidente = document.getElementById("modalDetalleIncidente");
const btnCerrarDetalleIncidente = document.getElementById("btnCerrarDetalleIncidente");

if (btnCerrarDetalleIncidente && modalDetalleIncidente) {
    btnCerrarDetalleIncidente.addEventListener("click", () => {
        modalDetalleIncidente.style.display = "none";
    });
}
if (modalDetalleIncidente) {
    modalDetalleIncidente.addEventListener("click", (e) => {
        if (e.target === modalDetalleIncidente) {
            modalDetalleIncidente.style.display = "none";
        }
    });
}

function irLogin() {
    window.location.href = "/login/index.html";
}

// Toggle Mini Sidebar (Colapsar / Expandir)
const btnToggleSidebar = document.getElementById("btnToggleSidebar");
const sidebar = document.querySelector(".sidebar.desktop-only");

if (btnToggleSidebar && sidebar) {
    if (localStorage.getItem("sigi_sidebar_colapsada") === "true") {
        sidebar.classList.add("colapsada");
        btnToggleSidebar.querySelector("i")?.classList.replace("bi-chevron-left", "bi-chevron-right");
    }

    const reajustarMapaSeguro = () => {
        if (typeof map !== 'undefined' && map && typeof map.invalidateSize === 'function') {
            map.invalidateSize();
        }
    };

    sidebar.addEventListener("transitionend", (e) => {
        if (e.target === sidebar) {
            reajustarMapaSeguro();
        }
    });

    btnToggleSidebar.addEventListener("click", (e) => {
        e.stopPropagation();
        const estaColapsada = sidebar.classList.toggle("colapsada");
        localStorage.setItem("sigi_sidebar_colapsada", estaColapsada);
        
        const icono = btnToggleSidebar.querySelector("i");
        if (icono) {
            if (estaColapsada) {
                icono.classList.replace("bi-chevron-left", "bi-chevron-right");
            } else {
                icono.classList.replace("bi-chevron-right", "bi-chevron-left");
            }
        }

        setTimeout(reajustarMapaSeguro, 350);
    });
}

// Listeners Desktop
document.querySelectorAll(".nav-btn[data-view]").forEach(btn => {
    btn.addEventListener("click", () => {
        btn.blur();
        cambiarVista(btn.dataset.view);
    });
});
document.getElementById("iniciarSesion")?.addEventListener("click", irLogin);
document.getElementById("iniciarSesionMobile")?.addEventListener("click", irLogin);

// Listeners Mobile
document.querySelectorAll(".bottom-nav-item[data-view]").forEach(btn => {
    btn.addEventListener("click", () => {
        const view = btn.dataset.view;
        if (view === "filtros") {
            cambiarVista("mapa");
            abrirPanelFiltros(true);
        } else if (view === "perfil") {
            irLogin();
        } else {
            cambiarVista(view);
        }
    });
});

// Listener Exportar Datos (Excel / CSV estructurado con diseño SIGI)
document.getElementById("btnExportarCsv")?.addEventListener("click", () => {
    if (!incidentesData || incidentesData.length === 0) {
        return alert("No hay datos para exportar.");
    }

    const fechaExport = new Date().toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
    const horaExport = new Date().toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit"
    });

    let filasHtml = "";
    incidentesData.forEach((inc, idx) => {
        const fecha = inc.fechaincidente ? new Date(inc.fechaincidente).toLocaleDateString("es-CO") : "N/A";
        const hora = inc.horaincidente ? inc.horaincidente.slice(0, 5) : "N/A";
        const zona = inc.namebarrio || inc.nombrevereda || "Sin zona";
        const tipo = inc.nametipoincidente || "Sin tipo";
        const codigo = inc.codigoincidente || `INC-${idx + 1}`;

        let estiloTipo = "background-color: #f1f5f9; color: #334155;";
        if (inc.idtipoincidente === 1) estiloTipo = "background-color: #fee2e2; color: #991b1b; font-weight: bold;";
        else if (inc.idtipoincidente === 2) estiloTipo = "background-color: #fef9c3; color: #854d0e; font-weight: bold;";
        else if (inc.idtipoincidente === 3) estiloTipo = "background-color: #f3e8ff; color: #6b21a8; font-weight: bold;";
        else if (inc.idtipoincidente === 4) estiloTipo = "background-color: #dcfce7; color: #166534; font-weight: bold;";

        const bgFila = idx % 2 === 0 ? "#ffffff" : "#f8fafc";

        filasHtml += `
            <tr style="background-color: ${bgFila};">
                <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; color: #64748b; font-weight: 600;">${idx + 1}</td>
                <td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-weight: 700; color: #0b192c;">${codigo}</td>
                <td style="padding: 8px 10px; border: 1px solid #cbd5e1; ${estiloTipo} text-align: center;">${tipo}</td>
                <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #1e293b;">${zona}</td>
                <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; color: #334155;">${fecha}</td>
                <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; color: #334155;">${hora}</td>
            </tr>
        `;
    });

    const tablaHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <!--[if gte mso 9]>
            <xml>
                <x:ExcelWorkbook>
                    <x:ExcelWorksheets>
                        <x:ExcelWorksheet>
                            <x:Name>Incidentes SIGI</x:Name>
                            <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
                        </x:ExcelWorksheet>
                    </x:ExcelWorksheets>
                </x:ExcelWorkbook>
            </xml>
            <![endif]-->
            <style>
                body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; }
                table { border-collapse: collapse; width: 100%; }
                th { font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 11pt; }
                td { font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 10pt; }
            </style>
        </head>
        <body>
            <table>
                <tr>
                    <th colspan="6" style="background-color: #0b192c; color: #3b82f6; font-size: 15pt; font-weight: bold; text-align: center; padding: 14px; border: 1px solid #0b192c;">
                        SIGI - SISTEMA DE INFORMACIÓN GEOGRÁFICO DE INCIDENTES
                    </th>
                </tr>
                <tr>
                    <td colspan="6" style="background-color: #1e293b; color: #94a3b8; font-size: 9pt; text-align: center; padding: 6px; border: 1px solid #1e293b;">
                        Reporte Oficial de Incidentes | Generado el ${fechaExport} a las ${horaExport} | Total: ${incidentesData.length} registros
                    </td>
                </tr>
                <tr style="height: 10px;"><td colspan="6"></td></tr>
                <thead>
                    <tr style="background-color: #2563eb; color: #ffffff;">
                        <th style="padding: 10px; border: 1px solid #0369a1; text-align: center; font-weight: bold; width: 60px;">Num</th>
                        <th style="padding: 10px; border: 1px solid #0369a1; text-align: left; font-weight: bold; width: 110px;">Código</th>
                        <th style="padding: 10px; border: 1px solid #0369a1; text-align: center; font-weight: bold; width: 150px;">Tipo de Incidente</th>
                        <th style="padding: 10px; border: 1px solid #0369a1; text-align: left; font-weight: bold; width: 200px;">Barrio / Vereda</th>
                        <th style="padding: 10px; border: 1px solid #0369a1; text-align: center; font-weight: bold; width: 110px;">Fecha</th>
                        <th style="padding: 10px; border: 1px solid #0369a1; text-align: center; font-weight: bold; width: 90px;">Hora</th>
                    </tr>
                </thead>
                <tbody>
                    ${filasHtml}
                </tbody>
            </table>
        </body>
        </html>
    `;

    // \\uFEFF (UTF-8 BOM) para abrir nativamente en Excel con tildes y formato perfecto sin deformaciones
    const blob = new Blob(["\uFEFF", tablaHtml], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const fechaArchivo = new Date().toISOString().slice(0, 10);
    a.download = `SIGI_Reporte_Incidentes_${fechaArchivo}.xls`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 250);
});

// Variables globales para la ubicación del usuario
let marcadorUsuario = null;
let circuloPrecisionUsuario = null;

function obtenerUbicacionUsuario() {
    if (!navigator.geolocation) {
        alert("Tu navegador o dispositivo no soporta geolocalización.");
        return;
    }

    const btn = document.getElementById("btnMiUbicacion");
    if (btn) {
        btn.style.opacity = "0.6";
    }

    navigator.geolocation.getCurrentPosition(
        (posicion) => {
            const lat = posicion.coords.latitude;
            const lng = posicion.coords.longitude;
            const precision = posicion.coords.accuracy;

            if (btn) {
                btn.style.opacity = "1";
            }

            if (typeof map === "undefined" || !map) return;

            // Limpiar marcador anterior si existe
            if (marcadorUsuario) map.removeLayer(marcadorUsuario);
            if (circuloPrecisionUsuario) map.removeLayer(circuloPrecisionUsuario);

            // Icono pulsante personalizado para el usuario
            const userIcon = L.divIcon({
                className: 'user-location-marker-container',
                html: '<div class="pulse-user-dot"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            // Círculo de precisión en el mapa
            circuloPrecisionUsuario = L.circle([lat, lng], {
                radius: precision,
                color: '#2563eb',
                fillColor: '#2563eb',
                fillOpacity: 0.15,
                weight: 1.5,
                dashArray: '4, 6'
            }).addTo(map);

            // Marcador del usuario
            marcadorUsuario = L.marker([lat, lng], { icon: userIcon })
                .addTo(map)
                .bindPopup(`
                    <div style="font-family: system-ui; padding: 4px;">
                        <strong style="color: #2563eb;">📍 Tu ubicación actual</strong><br>
                        <span style="font-size: 0.78rem; color: #a0aec0;">Precisión estimada: ±${Math.round(precision)} metros</span>
                    </div>
                `)
                .openPopup();

            // Desplazamiento suave de cámara (flyTo)
            map.flyTo([lat, lng], 16, {
                animate: true,
                duration: 1.5
            });
        },
        (error) => {
            if (btn) {
                btn.style.opacity = "1";
            }

            let mensaje = "No se pudo obtener tu ubicación.";
            if (error.code === error.PERMISSION_DENIED) {
                mensaje = "Permiso de ubicación denegado en el navegador.";
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                mensaje = "La información de ubicación no está disponible en tu dispositivo.";
            } else if (error.code === error.TIMEOUT) {
                mensaje = "Se agotó el tiempo de espera para obtener tu posición.";
            }
            alert(mensaje);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// Listener para el botón Mi Ubicación
document.getElementById("btnMiUbicacion")?.addEventListener("click", obtenerUbicacionUsuario);

function setBottomNavActive(viewId) {
    document.querySelectorAll(".bottom-nav-item[data-view]").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.view === viewId);
    });
}

let chartTendencia = null;
let chartHoras = null;
let chartDona = null;
let chartBarras = null;

function cargarResumen() {
    const elTotal = document.getElementById("total");
    const elRobos = document.getElementById("robos");
    const elAcci = document.getElementById("accidentes");
    const elPiques = document.getElementById("piques");
    const elAgres = document.getElementById("agresiones");
    const elTopB = document.getElementById("topBarrio");
    const elTopV = document.getElementById("topVereda");
    const topZonasList = document.getElementById("topZonasList");
    const contMatriz = document.getElementById("matrizDiaHora");

    if (!incidentesData || incidentesData.length === 0) {
        if (elTotal) elTotal.textContent = "0";
        if (elRobos) elRobos.textContent = "0";
        if (elAcci) elAcci.textContent = "0";
        if (elPiques) elPiques.textContent = "0";
        if (elAgres) elAgres.textContent = "0";
        if (elTopB) elTopB.textContent = "Sin datos";
        if (elTopV) elTopV.textContent = "Sin datos";
        if (topZonasList) {
            topZonasList.innerHTML = `<li style="padding: 16px; color: var(--texto-suave); text-align: center; list-style: none;">No se encontraron registros para los filtros seleccionados</li>`;
        }
        if (chartDona) { chartDona.destroy(); chartDona = null; }
        if (chartTendencia) { chartTendencia.destroy(); chartTendencia = null; }
        if (chartHoras) { chartHoras.destroy(); chartHoras = null; }
        if (contMatriz) {
            contMatriz.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--texto-suave); padding: 24px; font-size: 0.88rem;">No hay incidentes para mostrar con los filtros actuales.</div>`;
        }
        return;
    }

    // 0. Actualizar las tarjetas de resumen
    let r = 0, a = 0, p = 0, ag = 0;
    const conteoBarrio = {};
    const conteoVereda = {};

    // 1. Agrupar datos por Mes/Año, contar para resumen y agrupar por hora
    const conteoPorMes = {};
    const conteoPorHora = Array(24).fill(0);
    const matrizDiaHora = Array(7).fill(0).map(() => Array(24).fill(0));
    let maxHeatmap = 0;
    
    incidentesData.forEach(inc => {
        // Contadores para resumen
        if (inc.idtipoincidente === 1) r++;
        if (inc.idtipoincidente === 4) a++;
        if (inc.idtipoincidente === 3) p++;
        if (inc.idtipoincidente === 2) ag++;

        if (inc.namebarrio) {
            conteoBarrio[inc.namebarrio] = (conteoBarrio[inc.namebarrio] || 0) + 1;
        }
        if (inc.nombrevereda) {
            conteoVereda[inc.nombrevereda] = (conteoVereda[inc.nombrevereda] || 0) + 1;
        }

        // Agrupación para gráfica tendencia
        const fechaObj = new Date(inc.fechaincidente);
        if (!isNaN(fechaObj)) {
            const anio = fechaObj.getFullYear();
            const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
            const key = `${anio}-${mes}`; // ej. 2025-01
            
            conteoPorMes[key] = (conteoPorMes[key] || 0) + 1;
        }

        // Agrupación para gráfica horas y matriz de concentración
        if (inc.horaincidente) {
            const horaInt = parseInt(inc.horaincidente.slice(0, 2), 10);
            if (!isNaN(horaInt) && horaInt >= 0 && horaInt < 24) {
                conteoPorHora[horaInt]++;
                
                if (!isNaN(fechaObj)) {
                    let day = fechaObj.getDay(); 
                    day = day === 0 ? 6 : day - 1; // Ajuste: 0=Lun, 6=Dom
                    matrizDiaHora[day][horaInt]++;
                    if (matrizDiaHora[day][horaInt] > maxHeatmap) {
                        maxHeatmap = matrizDiaHora[day][horaInt];
                    }
                }
            }
        }
    });

    // Actualizar DOM de resumen
    if (elTotal) elTotal.textContent = incidentesData.length;
    if (elRobos) elRobos.textContent = r;
    if (elAcci) elAcci.textContent = a;
    if (elPiques) elPiques.textContent = p;
    if (elAgres) elAgres.textContent = ag;

    if (elTopB) {
        let maxB = "N/A", maxCount = 0;
        for (let [b, c] of Object.entries(conteoBarrio)) {
            if (c > maxCount) { maxB = b; maxCount = c; }
        }
        elTopB.textContent = maxB;
    }

    if (elTopV) {
        let maxV = "N/A", maxCount = 0;
        for (let [v, c] of Object.entries(conteoVereda)) {
            if (c > maxCount) { maxV = v; maxCount = c; }
        }
        elTopV.textContent = maxV;
    }

    // --- RENDERING TOP 10 ZONAS CRÍTICAS ---
    const sortedBarrios = Object.entries(conteoBarrio)
        .sort((a, b) => b[1] - a[1]) // Mayor a menor
        .slice(0, 10); // Top 10
        
    if (topZonasList) {
        topZonasList.innerHTML = "";
        if (sortedBarrios.length > 0) {
            const maxVal = sortedBarrios[0][1]; // El valor más alto será el 100% de la barra
            
            sortedBarrios.forEach((item, index) => {
                const barrio = item[0] || 'Desconocido';
                const count = item[1];
                const pct = Math.round((count / maxVal) * 100);
                
                const rankClass = index < 3 ? `rank-${index + 1}` : '';

                const li = document.createElement("li");
                li.className = `top-zona-item ${rankClass}`;
                li.innerHTML = `
                    <div class="zona-header">
                        <div class="zona-left">
                            <span class="zona-rank">${index + 1}</span>
                            <span class="zona-name" title="${barrio}">${barrio}</span>
                        </div>
                        <div class="zona-stats">
                            <span class="zona-count"><strong>${count}</strong> <small>casos</small></span>
                            <span class="zona-badge-pct">${pct}%</span>
                        </div>
                    </div>
                    <div class="zona-bar-bg">
                        <div class="zona-bar-fill" style="width: ${pct}%"></div>
                    </div>
                `;
                topZonasList.appendChild(li);
            });
        }
    }

    // --- RENDERING GRÁFICO DE DONA (PROPORCIÓN POR TIPO) ---
    const ctxDona = document.getElementById('graficoDona');
    if (ctxDona) {
        if (chartDona) {
            chartDona.destroy();
        }

        chartDona = new Chart(ctxDona, {
            type: 'doughnut',
            data: {
                labels: ['Robos', 'Accidentes', 'Piques', 'Agresiones'],
                datasets: [{
                    data: [r, a, p, ag],
                    backgroundColor: [
                        '#e05d5d',
                        '#10b981',
                        '#a855f7',
                        '#eab308'
                    ],
                    borderColor: document.body.classList.contains("tema-claro") ? '#ffffff' : '#171a21',
                    borderWidth: 2,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: document.body.classList.contains("tema-claro") ? '#0f172a' : '#8a92a2',
                            font: { size: 12, family: "'Plus Jakarta Sans', sans-serif" },
                            padding: 14,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(23, 26, 33, 0.95)',
                        titleColor: '#4a70c7',
                        bodyColor: '#ffffff',
                        borderColor: '#262a35',
                        borderWidth: 1,
                        padding: 10,
                        callbacks: {
                            label: function(context) {
                                const totalSum = r + a + p + ag;
                                const val = context.raw || 0;
                                const pct = totalSum > 0 ? ((val / totalSum) * 100).toFixed(1) : 0;
                                return ` ${context.label}: ${val} (${pct}%)`;
                            }
                        }
                    }
                },
                cutout: '65%'
            }
        });
    }

    // Ordenar las llaves cronológicamente para Tendencia Temporal
    const labels = Object.keys(conteoPorMes).sort();
    const data = labels.map(key => conteoPorMes[key]);

    // Formatear labels a meses legibles (Ej: "Ene 2025")
    const mesesTexto = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const labelsFormatted = labels.map(key => {
        const [y, m] = key.split('-');
        return `${mesesTexto[parseInt(m) - 1]} ${y}`;
    });

    const ctx = document.getElementById('graficoTendencia');
    if (!ctx) return;

    if (chartTendencia) {
        chartTendencia.destroy();
    }

    const colorAcento = '#4a70c7';
    
    chartTendencia = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labelsFormatted,
            datasets: [{
                label: 'Total Incidentes',
                data: data,
                borderColor: colorAcento,
                backgroundColor: 'rgba(74, 112, 199, 0.1)',
                borderWidth: 2.5,
                pointBackgroundColor: colorAcento,
                pointBorderColor: document.body.classList.contains("tema-claro") ? '#ffffff' : '#171a21',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                fill: true,
                tension: 0.4 // Curvas suaves
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(13, 17, 23, 0.9)',
                    titleColor: '#8b949e',
                    bodyColor: '#c9d1d9',
                    borderColor: '#30363d',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: document.body.classList.contains("tema-claro") ? '#475569' : '#8b949e',
                        font: { size: 11 }
                    },
                    border: { display: false }
                },
                y: {
                    grid: {
                        color: document.body.classList.contains("tema-claro") ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: document.body.classList.contains("tema-claro") ? '#475569' : '#8b949e',
                        font: { size: 11 },
                        stepSize: 1
                    },
                    beginAtZero: true,
                    border: { display: false }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index',
            }
        }
    });

    // ── GRÁFICA DE HORAS ──
    const ctxHoras = document.getElementById('graficoHoras');
    if (!ctxHoras) return;

    if (chartHoras) {
        chartHoras.destroy();
    }

    const labelsHoras = Array.from({length: 24}, (_, i) => `${String(i).padStart(2, '0')}:00`);

    chartHoras = new Chart(ctxHoras, {
        type: 'bar',
        data: {
            labels: labelsHoras,
            datasets: [{
                label: 'Incidentes',
                data: conteoPorHora,
                backgroundColor: 'rgba(74, 112, 199, 0.65)',
                borderColor: 'rgba(74, 112, 199, 0.95)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(13, 17, 23, 0.9)',
                    titleColor: '#8b949e',
                    bodyColor: '#c9d1d9',
                    borderColor: '#30363d',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        title: (items) => `Hora: ${items[0].label}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: document.body.classList.contains("tema-claro") ? '#475569' : '#8b949e', font: { size: 10 } },
                    border: { display: false }
                },
                y: {
                    grid: { color: document.body.classList.contains("tema-claro") ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: document.body.classList.contains("tema-claro") ? '#475569' : '#8b949e', font: { size: 11 }, stepSize: 1 },
                    beginAtZero: true,
                    border: { display: false }
                }
            }
        }
    });

    // ── MATRIZ DE CONCENTRACIÓN ──
    if (contMatriz) {
        contMatriz.innerHTML = "";
        
        // Esquina superior izquierda vacía
        const corner = document.createElement("div");
        contMatriz.appendChild(corner);
        
        // Cabeceras de horas (eje X)
        for (let h = 0; h < 24; h++) {
            const lbl = document.createElement("div");
            lbl.className = "hm-label-x";
            lbl.textContent = String(h).padStart(2, '0');
            contMatriz.appendChild(lbl);
        }
        
        const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
        
        // Filas de días
        for (let d = 0; d < 7; d++) {
            // Etiqueta del día (eje Y)
            const lbl = document.createElement("div");
            lbl.className = "hm-label-y";
            lbl.textContent = diasSemana[d];
            contMatriz.appendChild(lbl);
            
            // Celdas por hora
            for (let h = 0; h < 24; h++) {
                const cell = document.createElement("div");
                cell.className = "hm-cell";
                const val = matrizDiaHora[d][h];
                
                if (val > 0) {
                    const ratio = maxHeatmap > 0 ? (val / maxHeatmap) : 0;
                    if (ratio <= 0.33) {
                        cell.style.backgroundColor = 'rgba(37, 99, 235, 0.85)';
                        cell.style.boxShadow = 'none';
                    } else if (ratio <= 0.66) {
                        cell.style.backgroundColor = 'rgba(217, 119, 6, 0.90)';
                        cell.style.boxShadow = 'none';
                    } else {
                        cell.style.backgroundColor = 'rgba(220, 38, 38, 0.92)';
                        cell.style.boxShadow = 'none';
                    }
                    cell.style.color = '#ffffff';
                    cell.style.fontWeight = '700';
                    cell.style.fontSize = '0.72rem';
                    cell.title = `${diasSemana[d]} ${String(h).padStart(2, '0')}:00\nIncidentes: ${val}\n(Clic para ver incidentes)`;
                    cell.textContent = val;
                    cell.dataset.clickable = "true";
                    cell.style.cursor = "pointer";
                    cell.addEventListener("click", () => {
                        mostrarIncidentesMatriz(d, h, diasSemana[d]);
                    });
                }
                
                contMatriz.appendChild(cell);
            }
        }
    }
}

// ── MODAL: DETALLE DE INCIDENTES POR MATRIZ (DÍA × HORA) CON PAGINACIÓN DE 7 REGISTROS ──
let incidentesMatrizActual = [];
let paginaMatrizActual = 1;
const REGISTROS_POR_PAGINA_MATRIZ = 7;

function renderizarPaginaMatriz() {
    const tbody = document.getElementById("cuerpoTablaMatrizIncidentes");
    const infoPaginacion = document.getElementById("infoPaginacionMatriz");
    const labelPagina = document.getElementById("labelPaginaMatriz");
    const btnAnt = document.getElementById("btnPagAntMatriz");
    const btnSig = document.getElementById("btnPagSigMatriz");
    if (!tbody) return;

    tbody.innerHTML = "";
    const total = incidentesMatrizActual.length;

    if (total === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:18px; color:var(--texto-suave);">No hay incidentes registrados en esta franja.</td></tr>`;
        if (infoPaginacion) infoPaginacion.textContent = "Mostrando 0 de 0 incidentes";
        if (labelPagina) labelPagina.textContent = "Página 1 de 1";
        if (btnAnt) btnAnt.disabled = true;
        if (btnSig) btnSig.disabled = true;
        return;
    }

    const totalPaginas = Math.ceil(total / REGISTROS_POR_PAGINA_MATRIZ) || 1;
    if (paginaMatrizActual > totalPaginas) paginaMatrizActual = totalPaginas;
    if (paginaMatrizActual < 1) paginaMatrizActual = 1;

    const inicio = (paginaMatrizActual - 1) * REGISTROS_POR_PAGINA_MATRIZ;
    const fin = Math.min(inicio + REGISTROS_POR_PAGINA_MATRIZ, total);
    const slice = incidentesMatrizActual.slice(inicio, fin);

    slice.forEach((inc, idx) => {
        const consecutivo = inicio + idx + 1;
        const fecha = inc.fechaincidente ? new Date(inc.fechaincidente).toLocaleDateString("es-CO") : "N/A";
        const hora = inc.horaincidente ? inc.horaincidente.slice(0, 5) : "N/A";
        const zona = inc.namebarrio || inc.nombrevereda || "Sin zona";

        let badgeClass = "badge-default";
        if (inc.idtipoincidente === 1) badgeClass = "badge-robo";
        else if (inc.idtipoincidente === 2) badgeClass = "badge-agresion";
        else if (inc.idtipoincidente === 3) badgeClass = "badge-pique";
        else if (inc.idtipoincidente === 4) badgeClass = "badge-accidente";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="color: var(--texto-suave); font-weight: bold; text-align: center;">${consecutivo}</td>
            <td><strong>${inc.codigoincidente || 'N/A'}</strong></td>
            <td style="text-align: center;"><span class="badge-tipo ${badgeClass}">${inc.nametipoincidente || 'N/A'}</span></td>
            <td>${zona}</td>
            <td style="text-align: center;">${fecha}</td>
            <td style="text-align: center;">${hora}</td>
        `;
        tbody.appendChild(tr);
    });

    if (infoPaginacion) {
        infoPaginacion.textContent = `Mostrando ${inicio + 1} a ${fin} de ${total} incidentes`;
    }
    if (labelPagina) {
        labelPagina.textContent = `Página ${paginaMatrizActual} de ${totalPaginas}`;
    }
    if (btnAnt) {
        btnAnt.disabled = paginaMatrizActual <= 1;
    }
    if (btnSig) {
        btnSig.disabled = paginaMatrizActual >= totalPaginas;
    }
}

function mostrarIncidentesMatriz(diaIdx, horaInt, diaCorto) {
    const modal = document.getElementById("modalMatrizDetalle");
    const titulo = document.getElementById("modalMatrizTitulo");
    const subtitulo = document.getElementById("modalMatrizSubtitulo");
    if (!modal) return;

    const nombresDiasCompletos = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const nombreDia = nombresDiasCompletos[diaIdx] || diaCorto || "Día seleccionado";
    const horaTexto = `${String(horaInt).padStart(2, '0')}:00 hrs`;

    // Filtrar incidentes según día de la semana (0=Lun ... 6=Dom) y hora (0..23)
    incidentesMatrizActual = (incidentesData || []).filter(inc => {
        if (!inc.fechaincidente || !inc.horaincidente) return false;
        const fechaObj = new Date(inc.fechaincidente);
        if (isNaN(fechaObj)) return false;
        let day = fechaObj.getDay();
        day = day === 0 ? 6 : day - 1; // 0=Lun, 6=Dom
        if (day !== diaIdx) return false;
        const h = parseInt(inc.horaincidente.slice(0, 2), 10);
        return h === horaInt;
    });

    paginaMatrizActual = 1;

    if (titulo) {
        titulo.innerHTML = `<i class="bi bi-grid-3x3-gap-fill" style="color: var(--acento, #3b82f6); margin-right: 8px;"></i> Incidentes: ${nombreDia} a las ${horaTexto}`;
    }
    if (subtitulo) {
        subtitulo.textContent = `Se encontraron ${incidentesMatrizActual.length} incidente${incidentesMatrizActual.length === 1 ? '' : 's'} registrado${incidentesMatrizActual.length === 1 ? '' : 's'} en esta franja horaria:`;
    }

    renderizarPaginaMatriz();
    modal.style.display = "flex";
}

// Cierre y controles de paginación del modal de matriz
const btnCerrarModalMatriz = document.getElementById("btnCerrarModalMatriz");
const modalMatrizDetalle = document.getElementById("modalMatrizDetalle");
const btnPagAntMatriz = document.getElementById("btnPagAntMatriz");
const btnPagSigMatriz = document.getElementById("btnPagSigMatriz");

if (btnPagAntMatriz) {
    btnPagAntMatriz.addEventListener("click", () => {
        if (paginaMatrizActual > 1) {
            paginaMatrizActual--;
            renderizarPaginaMatriz();
        }
    });
}

if (btnPagSigMatriz) {
    btnPagSigMatriz.addEventListener("click", () => {
        const totalPaginas = Math.ceil(incidentesMatrizActual.length / REGISTROS_POR_PAGINA_MATRIZ) || 1;
        if (paginaMatrizActual < totalPaginas) {
            paginaMatrizActual++;
            renderizarPaginaMatriz();
        }
    });
}

if (btnCerrarModalMatriz && modalMatrizDetalle) {
    btnCerrarModalMatriz.addEventListener("click", () => {
        modalMatrizDetalle.style.display = "none";
    });
}
if (modalMatrizDetalle) {
    modalMatrizDetalle.addEventListener("click", (e) => {
        if (e.target === modalMatrizDetalle) {
            modalMatrizDetalle.style.display = "none";
        }
    });
}

function contarFiltrosActivos() {
    let count = tiposId.length;
    if (typeof inpBuscarLugar !== 'undefined' && inpBuscarLugar && inpBuscarLugar.value.trim()) count++;
    return count;
}

function actualizarBadgeFiltros() {
    const count = contarFiltrosActivos();
    badgeFiltros.textContent = count;
    badgeFiltros.classList.toggle("visible", count > 0);
}

function abrirPanelFiltros() {
    if (panelFiltros) {
        panelFiltros.style.display = "flex";
        panelFiltros.classList.add("abierto");
        panelFiltros.setAttribute("aria-hidden", "false");
    }
}

function cerrarPanelFiltros() {
    if (panelFiltros && panelFiltros.contains(document.activeElement) && btnFiltros) {
        btnFiltros.focus();
    }

    if (panelFiltros) {
        panelFiltros.style.display = "none";
        panelFiltros.classList.remove("abierto");
        panelFiltros.setAttribute("aria-hidden", "true");
    }
    if (panelMap) {
        panelMap.classList.remove("filtros-abiertos");
    }
    if (filtrosOverlay) {
        filtrosOverlay.style.display = "none";
        filtrosOverlay.classList.remove("visible");
        filtrosOverlay.setAttribute("aria-hidden", "true");
    }
    if (btnFiltros) {
        btnFiltros.style.display = "";
    }
    if (contenedor) {
        contenedor.style.display = "none";
    }
}

if (btnFiltros) {
    btnFiltros.addEventListener("click", (e) => {
        if (e) e.stopPropagation();
        if (map) map.closePopup();
        abrirPanelFiltros();
    });
}
if (cerrarFiltros) {
    cerrarFiltros.addEventListener("click", () => cerrarPanelFiltros());
}
if (filtrosOverlay) {
    filtrosOverlay.addEventListener("click", () => cerrarPanelFiltros());
}
if (panelFiltros) {
    panelFiltros.addEventListener("click", (e) => {
        if (e.target === panelFiltros) {
            cerrarPanelFiltros();
        }
    });
}

const map = L.map("map").setView([1.615, -75.606], 14);

// Prevenir que los clics en elementos de interfaz flotantes sobre el mapa se propaguen a Leaflet
[
    document.querySelector(".map-actions-group"),
    document.getElementById("panelFiltros"),
    document.getElementById("filtrosOverlay"),
    document.getElementById("modalFiltroTiempo"),
    document.getElementById("overlayFiltroTiempo"),
    document.querySelector(".btn-abrir-kpis")
].forEach(el => {
    if (el) {
        L.DomEvent.disableClickPropagation(el);
        L.DomEvent.disableScrollPropagation(el);
    }
});

// Crear paneles personalizados para controlar el z-index (quién se dibuja sobre quién)
map.createPane('poligonosPane');
map.getPane('poligonosPane').style.zIndex = 400; // Nivel base para polígonos

map.createPane('incidentesPane');
map.getPane('incidentesPane').style.zIndex = 450; // Siempre encima de polígonos

const esriSat = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles © Esri",
    maxZoom: 18
});

const esriDark = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles © Esri",
    maxZoom: 16
});

const osmStreet = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19
});

// Por defecto mostramos el mapa oscuro limpio
esriDark.addTo(map);

const baseMaps = {
    "Modo Oscuro": esriDark,
    "Satelital": esriSat,
    "Calles (Normal)": osmStreet
};

// Control de capas ubicado debajo de los controles de zoom (topleft)
L.control.layers(baseMaps, null, { position: 'topleft' }).addTo(map);


// Cambio dinámico de clases según la vista activa para estilizar los botones de zoom y capas
const mapContainerEl = document.getElementById("map");
if (mapContainerEl) {
    mapContainerEl.classList.add("map-theme-dark");
}

map.on('baselayerchange', function (e) {
    if (!mapContainerEl) return;
    mapContainerEl.classList.remove("map-theme-dark", "map-theme-sat", "map-theme-streets");
    if (e.name === "Modo Oscuro") {
        mapContainerEl.classList.add("map-theme-dark");
    } else if (e.name === "Satelital") {
        mapContainerEl.classList.add("map-theme-sat");
    } else if (e.name === "Calles (Normal)") {
        mapContainerEl.classList.add("map-theme-streets");
    }
});

let capaIncidentes = L.markerClusterGroup({
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    disableClusteringAtZoom: 16
}).addTo(map);

let heatLayer = L.heatLayer([], {
    radius: esMobile() ? 20 : 25,
    blur: 15,
    maxZoom: 16,
    gradient: {0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red'}
});

let dbscanLayer = L.layerGroup();
let modoDBSCAN = false;

let capaBarrio = L.layerGroup().addTo(map);
let capaVereda = L.layerGroup().addTo(map);

/* ═════════════════════════════════════════════════════════════════════════
   POPUP DE COORDENADAS GLOBAL — Muestra Lat/Lng en cualquier punto del mapa
   ═════════════════════════════════════════════════════════════════════════ */
let popupUbicacion = L.popup({
    className: 'custom-popup-container',
    minWidth: 290,
    autoPanPaddingTopLeft: L.point(20, 90),
    autoPanPaddingBottomRight: L.point(20, 20)
});

function mostrarCoordenadasMapa(latlng, infoDirecta = null) {
    if (!latlng || typeof latlng.lat !== 'number' || typeof latlng.lng !== 'number') return;
    const lat = latlng.lat;
    const lng = latlng.lng;

    let textoZonaInicial = "<em>Identificando zona territorial...</em>";
    if (infoDirecta) {
        if (infoDirecta.barrio) {
            textoZonaInicial = `<b>Barrio:</b> ${infoDirecta.barrio}`;
        } else if (infoDirecta.vereda) {
            textoZonaInicial = `<b>Vereda:</b> ${infoDirecta.vereda}${infoDirecta.corregimiento ? ` (${infoDirecta.corregimiento})` : ''}`;
        }
    }

    const renderPopupHtml = (textoZona) => `
        <div class="popup-coord-card">
            <div class="popup-coord-header">
                <i class="bi bi-geo-alt-fill"></i> Coordenada seleccionada
            </div>
            <div class="popup-user-coords">
                <div class="popup-coord-item">
                    <span class="popup-coord-label">Latitud</span>
                    <span class="popup-coord-val">${lat.toFixed(5)}</span>
                </div>
                <div class="popup-coord-item">
                    <span class="popup-coord-label">Longitud</span>
                    <span class="popup-coord-val">${lng.toFixed(5)}</span>
                </div>
            </div>
            <div class="popup-coord-footer">
                <i class="bi bi-compass"></i>
                <div class="popup-coord-zona-text">${textoZona}</div>
            </div>
        </div>
    `;

    popupUbicacion
        .setLatLng(latlng)
        .setContent(renderPopupHtml(textoZonaInicial))
        .openOn(map);

    fetch(`/buscarBarrioPorCoordenada?lat=${lat}&lng=${lng}`)
        .then(res => res.json())
        .then(data => {
            let texto = "";
            if (data.barrio && data.vereda) {
                texto = `<b>Barrio:</b> ${data.barrio}<br><b>Vereda:</b> ${data.vereda}`;
            } else if (data.barrio) {
                texto = `<b>Barrio:</b> ${data.barrio}`;
            } else if (data.vereda) {
                texto = `<b>Vereda:</b> ${data.vereda}`;
            } else if (infoDirecta && (infoDirecta.barrio || infoDirecta.vereda)) {
                texto = textoZonaInicial;
            } else {
                texto = "<em>Fuera del perímetro urbano/rural registrado</em>";
            }
            popupUbicacion.setContent(renderPopupHtml(texto));
        })
        .catch(err => {
            console.error("Error obteniendo ubicación:", err);
            if (infoDirecta && (infoDirecta.barrio || infoDirecta.vereda)) {
                popupUbicacion.setContent(renderPopupHtml(textoZonaInicial));
            } else {
                popupUbicacion.setContent(renderPopupHtml("<span style='color:#ef4444;'>No se pudo obtener información de zona</span>"));
            }
        });
}

let incidentesData = [];
let modoCalor = false;

document.querySelectorAll(".incidente").forEach(btn => {
    btn.addEventListener("click", function () {
        const id = btn.dataset.id;
        if (btn.classList.contains("resaltarBtnFiltro")) {
            btn.classList.remove("resaltarBtnFiltro");
            tiposId = tiposId.filter(tipo => tipo !== id);
        } else {
            btn.classList.add("resaltarBtnFiltro");
            tiposId.push(id);
        }
        actualizarBadgeFiltros();
    });
});

function desmarcarTiposInput() {
    if (typeof inpBuscarLugar !== "undefined" && inpBuscarLugar) inpBuscarLugar.value = "";
    lugarSeleccionado = { nombre: "", tipo: "" };
    contenedor.innerHTML = "";
    tiposId.length = 0;
    document.querySelectorAll(".incidente").forEach(btn => {
        btn.classList.remove("resaltarBtnFiltro");
    });
    actualizarBadgeFiltros();
}

function obtenerColor(tipo) {
    if (tipo === 1) return "red";
    if (tipo === 2) return "yellow";
    if (tipo === 3) return "magenta";
    if (tipo === 4) return "limegreen";
}

let lugarSeleccionado = { nombre: '', tipo: '' };

function obtenerURL() {
    let url = "/incidentes?";
    const lugar = inpBuscarLugar.value;
    if (lugar && lugarSeleccionado.nombre === lugar) {
        url += `lugar=${encodeURIComponent(lugar)}&tipoLugar=${lugarSeleccionado.tipo}&`;
    } else if (lugar) {
        // Fallback si escribió pero no seleccionó
        url += `lugar=${encodeURIComponent(lugar)}&tipoLugar=Barrio&`;
    }
    if (tiposId.length > 0) {
        url += `tipos=${tiposId.join(",")}&`;
    }
    if (filtroFechaDesde) {
        url += `fechaDesde=${filtroFechaDesde}&`;
    }
    if (filtroFechaHasta) {
        url += `fechaHasta=${filtroFechaHasta}&`;
    }
    return url;
}

function renderizarIncidentes() {
    capaIncidentes.clearLayers();
    heatLayer.setLatLngs([]); // Limpiar heatmap

    actualizarAnalisisRapido(incidentesData);
    llenarTablaIncidentes(true);
    cargarResumen();
    cargarIncidentesBarra();

    if (modoCalor) {
        map.removeLayer(capaIncidentes);
        map.addLayer(heatLayer);
        
        const heatPoints = incidentesData.map(inc => [inc.lat, inc.lng, 1]); // Lat, Lng, Intensidad
        heatLayer.setLatLngs(heatPoints);
    } else {
        map.removeLayer(heatLayer);
        map.addLayer(capaIncidentes);

        incidentesData.forEach(incidente => {
            const marker = L.circleMarker([incidente.lat, incidente.lng], {
                pane: 'incidentesPane',
                radius: esMobile() ? 6 : 5,
                color: obtenerColor(incidente.idtipoincidente),
                fillColor: obtenerColor(incidente.idtipoincidente),
                fillOpacity: 0.7
            }).addTo(capaIncidentes);

            if (incidente.codigoincidente) {
                marker.bindTooltip(incidente.codigoincidente, {
                    permanent: false,
                    direction: "top",
                    offset: [0, -10]
                });
            }

            const hora = incidente.horaincidente ? incidente.horaincidente.slice(0, 5) : "N/A";
            const fechaObj = new Date(incidente.fechaincidente);
            const fecha = isNaN(fechaObj) ? "N/A" : fechaObj.toLocaleDateString("es-CO", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            });
            
            let iconClass = "bi-shield-exclamation";
            let tipoClase = "tipo-default";
            let severidad = "Baja";
            let severidadClase = "sev-baja";

            if (incidente.idtipoincidente === 1) { 
                iconClass = "bi-shield-exclamation"; tipoClase = "tipo-robo"; 
                severidad = "Alta"; severidadClase = "sev-alta";
            }
            if (incidente.idtipoincidente === 2) { 
                iconClass = "bi-exclamation-triangle"; tipoClase = "tipo-agresion"; 
                severidad = "Alta"; severidadClase = "sev-alta";
            }
            if (incidente.idtipoincidente === 3) { 
                iconClass = "bi-lightning"; tipoClase = "tipo-pique"; 
                severidad = "Media"; severidadClase = "sev-media";
            }
            if (incidente.idtipoincidente === 4) { 
                iconClass = "bi-car-front"; tipoClase = "tipo-accidente"; 
                severidad = "Crítica"; severidadClase = "sev-critica";
            }

            // Lógica de Estado simulado
            let estado = "Nuevo";
            let estadoClase = "est-nuevo";
            if (!isNaN(fechaObj)) {
                const dias = Math.floor((new Date() - fechaObj) / (1000 * 60 * 60 * 24));
                if (dias > 30) {
                    estado = "Cerrado";
                    estadoClase = "est-cerrado";
                } else if (dias > 3) {
                    estado = "Investigación";
                    estadoClase = "est-investigacion";
                }
            }

            const latNum = Number(incidente.lat);
            const lngNum = Number(incidente.lng);
            const latStr = !isNaN(latNum) ? latNum.toFixed(5) : incidente.lat;
            const lngStr = !isNaN(lngNum) ? lngNum.toFixed(5) : incidente.lng;

            const contenido = `
                <div class="popup-card">
                    <div class="popup-card-header">
                        <span class="popup-badge ${tipoClase}" title="${incidente.nametipoincidente || 'Incidente'}">${incidente.nametipoincidente || 'Incidente'}</span>
                        <span class="popup-code" title="${incidente.codigoincidente || 'N/A'}">${incidente.codigoincidente || 'N/A'}</span>
                    </div>
                    
                    <div class="popup-location-box">
                        <span class="popup-loc-label">Zona / Barrio</span>
                        <strong class="popup-loc-name">${incidente.namebarrio || incidente.nombrevereda || 'Sin zona asignada'}</strong>
                    </div>

                    <div class="popup-coords-box">
                        <span>Lat ${latStr}</span>
                        <span>Lng ${lngStr}</span>
                    </div>

                    <div class="popup-grid-2x2">
                        <div class="popup-grid-item">
                            <span class="pg-label">Fecha</span>
                            <span class="pg-val">${fecha}</span>
                        </div>
                        <div class="popup-grid-item">
                            <span class="pg-label">Hora</span>
                            <span class="pg-val">${hora}</span>
                        </div>
                        <div class="popup-grid-item">
                            <span class="pg-label">Estado</span>
                            <span class="popup-status-tag ${estadoClase}">${estado}</span>
                        </div>
                        <div class="popup-grid-item">
                            <span class="pg-label">Severidad</span>
                            <span class="popup-sev-tag ${severidadClase}">${severidad}</span>
                        </div>
                    </div>
                </div>
            `;

            // Vincular el popup de inmediato para que se abra al PRIMER clic sin requerir doble clic
            marker.bindPopup(contenido, {
                className: 'custom-popup-container',
                minWidth: 290,
                autoPanPaddingTopLeft: L.point(20, 90),
                autoPanPaddingBottomRight: L.point(20, 20)
            });

            marker.on("click", function (e) {
                if (e && e.originalEvent) {
                    L.DomEvent.stopPropagation(e);
                }
                marker.openPopup();
            });
        });
    }
}

function cargarIncidentes() {
    const url = obtenerURL();
    fetch(url)
        .then(res => res.json())
        .then(data => {
            incidentesData = data;
            renderizarIncidentes();
            
            // Consultar la última hora de registro real en la base de datos
            fetch('/ultima-actualizacion')
                .then(r => r.json())
                .then(u => {
                    const elHora = document.getElementById("hora-actualizacion");
                    if (elHora && u.ultima_actualizacion) {
                        const date = new Date(u.ultima_actualizacion);
                        elHora.textContent = date.toLocaleString("es-CO", { 
                            day: '2-digit', 
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true
                        });
                    }
                })
                .catch(err => console.error("Error obteniendo última actualización:", err));
        })
        .catch(error => console.error("Error:", error));
}

const btnToggleHeatmap = document.getElementById("btnToggleHeatmap");
if(btnToggleHeatmap) {
    btnToggleHeatmap.addEventListener("click", (e) => {
        if (e) e.stopPropagation();
        if (map) map.closePopup();
        modoCalor = !modoCalor;
        if(modoCalor) {
            btnToggleHeatmap.classList.add("activo");
        } else {
            btnToggleHeatmap.classList.remove("activo");
        }
        renderizarIncidentes();
    });
}

const btnToggleDBSCAN = document.getElementById("btnToggleDBSCAN");
if (btnToggleDBSCAN) {
    btnToggleDBSCAN.addEventListener("click", async (e) => {
        if (e) e.stopPropagation();
        if (map) map.closePopup();
        modoDBSCAN = !modoDBSCAN;

        const quickDock = document.getElementById('mapDbscanQuickDock');

        if (modoDBSCAN) {
            btnToggleDBSCAN.classList.add("activo");
            btnToggleDBSCAN.style.background = "rgba(14, 165, 233, 0.4)";
            btnToggleDBSCAN.style.boxShadow = "0 0 14px rgba(14, 165, 233, 0.7)";
            map.addLayer(dbscanLayer);
            await cargarYRenderizarHotspotsML();
            if (quickDock) quickDock.style.display = 'flex';
        } else {
            btnToggleDBSCAN.classList.remove("activo");
            btnToggleDBSCAN.style.background = "rgba(14, 165, 233, 0.15)";
            btnToggleDBSCAN.style.boxShadow = "";
            map.removeLayer(dbscanLayer);
            dbscanLayer.clearLayers();
            if (quickDock) quickDock.style.display = 'none';
        }
    });
}

async function cargarYRenderizarHotspotsML(eps = 450, minPts = 3) {
    dbscanLayer.clearLayers();
    try {
        const res = await fetch(`/api/ml/hotspots?eps=${eps}&minPts=${minPts}`);
        if (!res.ok) return;
        const data = await res.json();

        // Actualizar quick bar si la función existe
        if (typeof actualizarQuickBarMapa === 'function') {
            actualizarQuickBarMapa(data);
        }

        if (!data || !data.clusters || data.clusters.length === 0) {
            console.log("No se identificaron concentraciones densas DBSCAN con los parámetros actuales.");
            return;
        }

        data.clusters.forEach(cl => {
            // Círculo de cobertura espacial del cluster
            const circulo = L.circle([cl.centroide.lat, cl.centroide.lng], {
                radius: cl.radio_metros,
                color: cl.color,
                fillColor: cl.color,
                fillOpacity: 0.22,
                weight: 2,
                dashArray: '5, 5'
            }).addTo(dbscanLayer);

            // Marcador de núcleo del cluster con contador de incidentes
            const customIcon = L.divIcon({
                className: 'dbscan-cluster-marker',
                html: `<div style="background:${cl.color}; color:#fff; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:12px; box-shadow:0 0 12px ${cl.color}; border:2px solid #fff; cursor:pointer;">${cl.cantidad_incidentes}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });

            const marker = L.marker([cl.centroide.lat, cl.centroide.lng], { icon: customIcon }).addTo(dbscanLayer);

            const popupContent = `
                <div class="dbscan-popup-card">
                    <div class="dbscan-popup-head">
                        <h4 class="dbscan-popup-title">${cl.nombre}</h4>
                        <span class="dbscan-risk-pill" style="--risk-accent: ${cl.color};">${cl.nivel_riesgo}</span>
                    </div>
                    <div class="dbscan-metrics-grid">
                        <div class="dbscan-metric-item">
                            <span class="dbscan-metric-label">Incidentes agrupados</span>
                            <span class="dbscan-metric-val">${cl.cantidad_incidentes}</span>
                        </div>
                        <div class="dbscan-metric-item">
                            <span class="dbscan-metric-label">Severidad promedio</span>
                            <span class="dbscan-metric-val">${cl.gravedad_promedio} <small>/ 5.0</small></span>
                        </div>
                        <div class="dbscan-metric-item">
                            <span class="dbscan-metric-label">Radio de influencia</span>
                            <span class="dbscan-metric-val">${Number(cl.radio_metros).toLocaleString('es-CO')} m</span>
                        </div>
                    </div>
                    <div class="dbscan-popup-footer">
                        <span>DBSCAN Espacial</span>
                        <span class="dbscan-param-dot">&bull;</span>
                        <span>eps: ${eps}m</span>
                        <span class="dbscan-param-dot">&bull;</span>
                        <span>minPts: ${minPts}</span>
                    </div>
                </div>
            `;
            const popupOptions = {
                className: 'custom-popup-container dbscan-popup-wrapper',
                maxWidth: 320,
                minWidth: 260
            };
            circulo.bindPopup(popupContent, popupOptions);
            marker.bindPopup(popupContent, popupOptions);
        });
    } catch (e) {
        console.warn("Error al cargar hotspots ML:", e);
    }
}

// Botón de recalcular DBSCAN en el AI Lab
document.addEventListener("DOMContentLoaded", () => {
    const btnEjecutarAjusteDBSCAN = document.getElementById('btnEjecutarAjusteDBSCAN');
    if (btnEjecutarAjusteDBSCAN) {
        btnEjecutarAjusteDBSCAN.addEventListener('click', () => {
            const epsVal = parseInt(document.getElementById('dbscanParamEps')?.value || 450, 10);
            const minPtsVal = parseInt(document.getElementById('dbscanParamMinPts')?.value || 3, 10);
            if (typeof cargarRankingDBSCAN === 'function') {
                cargarRankingDBSCAN(epsVal, minPtsVal);
            }
            if (typeof cargarYRenderizarHotspotsML === 'function') {
                cargarYRenderizarHotspotsML(epsVal, minPtsVal);
            }
        });
    }
});

// ════════════════════════════════
// LÓGICA DE MI UBICACIÓN EN TIEMPO REAL
// ════════════════════════════════
let miUbicacionMarker = null;
let miUbicacionCircle = null;

const btnMiUbicacion = document.getElementById("btnMiUbicacion");
if (btnMiUbicacion) {
    btnMiUbicacion.addEventListener("click", (e) => {
        if (e) e.stopPropagation();
        if (map) map.closePopup();
        if (!navigator.geolocation) {
            alert("Tu navegador no soporta geolocalización en tiempo real.");
            return;
        }

        btnMiUbicacion.classList.add("activo");
        const badgeDot = document.getElementById("badgeUbicacion");
        if (badgeDot) badgeDot.style.display = "block";

        // Animación visual de carga en el botón
        const icono = btnMiUbicacion.querySelector('.icono-desktop');
        if (icono) icono.className = "bi bi-arrow-repeat icono-desktop spin-icon";

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                const accuracy = Math.round(pos.coords.accuracy);

                // Restaurar ícono
                if (icono) icono.className = "bi bi-crosshair2 icono-desktop";

                // Remover marcador y círculo anteriores si existen
                if (miUbicacionMarker && map) map.removeLayer(miUbicacionMarker);
                if (miUbicacionCircle && map) map.removeLayer(miUbicacionCircle);

                // Círculo de precisión GPS translúcido
                miUbicacionCircle = L.circle([lat, lng], {
                    radius: accuracy,
                    color: '#2563eb',
                    fillColor: '#2563eb',
                    fillOpacity: 0.12,
                    weight: 1.5,
                    dashArray: '4, 4'
                }).addTo(map);

                // Marcador Radar GIF/CSS animado
                const userIcon = L.divIcon({
                    className: 'user-location-marker-container',
                    html: `<div class="user-location-radar" title="Tu posición GPS"></div>`,
                    iconSize: [22, 22],
                    iconAnchor: [11, 11]
                });

                const popupHtml = `
                    <div class="popup-card">
                        <div class="popup-user-header">
                            <span>Tu ubicación actual</span>
                        </div>
                        
                        <div class="popup-user-coords">
                            <div class="popup-coord-item">
                                <span class="popup-coord-label">Latitud</span>
                                <span class="popup-coord-val">${lat.toFixed(5)}</span>
                            </div>
                            <div class="popup-coord-item">
                                <span class="popup-coord-label">Longitud</span>
                                <span class="popup-coord-val">${lng.toFixed(5)}</span>
                            </div>
                        </div>

                        <div style="font-size: 0.72rem; color: var(--texto-suave); display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.03); padding: 6px 10px; border-radius: 8px;">
                            <span>Precisión</span>
                            <strong style="color: var(--texto);">±${accuracy} metros</strong>
                        </div>
                    </div>
                `;

                miUbicacionMarker = L.marker([lat, lng], { icon: userIcon })
                    .addTo(map)
                    .bindPopup(popupHtml, {
                        className: 'custom-popup-container',
                        minWidth: 260,
                        autoPanPaddingTopLeft: L.point(20, 90)
                    });

                // Vuelo fluido con flyTo
                map.flyTo([lat, lng], 16, {
                    animate: true,
                    duration: 1.4
                });

                setTimeout(() => {
                    if (miUbicacionMarker) miUbicacionMarker.openPopup();
                }, 1500);
            },
            (err) => {
                if (icono) icono.className = "bi bi-crosshair2 icono-desktop";
                btnMiUbicacion.classList.remove("activo");
                if (badgeDot) badgeDot.style.display = "none";
                console.warn("Error de geolocalización:", err);
                if (err.code === 1) {
                    alert("Permiso de ubicación denegado. Por favor, habilítalo en la barra de direcciones de tu navegador.");
                } else {
                    alert("No se pudo obtener tu ubicación en este momento.");
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    });
}

function actualizarAnalisisRapido(data) {
    // Nuevos KPIs (Cinta superior)
    const elTotal = document.getElementById("kpi-total");
    const elVariacion = document.getElementById("kpi-variacion");
    const elZona = document.getElementById("kpi-zona");
    const elTipo = document.getElementById("kpi-tipo");
    
    // Antiguos KPIs (Panel lateral)
    const elVisibles = document.getElementById("ar-visibles");
    const elBarrio = document.getElementById("ar-barrio");
    const elOldTipo = document.getElementById("ar-tipo");
    const elHora = document.getElementById("ar-hora");
    
    if (elTotal) elTotal.textContent = data.length;
    if (elVisibles) elVisibles.textContent = data.length;

    // Conteo interactivo de tipologías para la Simbología de la barra lateral
    let countRobo = 0, countPiques = 0, countAgresiones = 0, countAccidente = 0;
    data.forEach(inc => {
        if (inc.idtipoincidente === 1) countRobo++;
        else if (inc.idtipoincidente === 2) countAgresiones++;
        else if (inc.idtipoincidente === 3) countPiques++;
        else if (inc.idtipoincidente === 4) countAccidente++;
    });

    const elCountRobo = document.getElementById("sidebarCountRobo");
    const elCountPiques = document.getElementById("sidebarCountPiques");
    const elCountAgresiones = document.getElementById("sidebarCountAgresiones");
    const elCountAccidente = document.getElementById("sidebarCountAccidente");

    if (elCountRobo) elCountRobo.textContent = countRobo;
    if (elCountPiques) elCountPiques.textContent = countPiques;
    if (elCountAgresiones) elCountAgresiones.textContent = countAgresiones;
    if (elCountAccidente) elCountAccidente.textContent = countAccidente;

    if (data.length === 0) {
        if(elVariacion) { elVariacion.innerHTML = `0% <span style="font-size: 0.55em; font-weight: normal; color: var(--secundario, #94a3b8); margin-left: 5px;">vs. mes anterior</span>`; elVariacion.className = "kpi-valor"; }
        if(elZona) elZona.textContent = "N/A";
        if(elTipo) elTipo.textContent = "N/A";
        if(elBarrio) elBarrio.textContent = "N/A";
        if(elOldTipo) elOldTipo.textContent = "N/A";
        if(elHora) elHora.textContent = "N/A";
        return;
    }

    const conteoZonas = {};
    const conteoTipos = {};
    const conteoHoras = {};
    let fechas = [];

    data.forEach(inc => {
        const zona = inc.namebarrio || "N/A";
        if (zona !== "N/A") {
            conteoZonas[zona] = (conteoZonas[zona] || 0) + 1;
        }
        if (inc.nametipoincidente) {
            conteoTipos[inc.nametipoincidente] = (conteoTipos[inc.nametipoincidente] || 0) + 1;
        }
        if (inc.horaincidente) {
            const horaStr = inc.horaincidente.slice(0, 2) + ":00";
            conteoHoras[horaStr] = (conteoHoras[horaStr] || 0) + 1;
        }
        if (inc.fechaincidente) {
            fechas.push(new Date(inc.fechaincidente).getTime());
        }
    });

    let maxZona = "N/A", maxZonaCount = 0;
    for (const [zona, count] of Object.entries(conteoZonas)) {
        if (count > maxZonaCount) {
            maxZona = zona;
            maxZonaCount = count;
        }
    }

    let maxTipo = "N/A", maxTipoCount = 0;
    for (const [tipo, count] of Object.entries(conteoTipos)) {
        if (count > maxTipoCount) {
            maxTipo = tipo;
            maxTipoCount = count;
        }
    }

    let maxHora = "N/A", maxHoraCount = 0;
    for (const [hora, count] of Object.entries(conteoHoras)) {
        if (count > maxHoraCount) {
            maxHora = hora;
            maxHoraCount = count;
        }
    }

    if (elZona) {
        if (maxZona !== "N/A") {
            elZona.innerHTML = `<span class="kpi-zona-nombre" title="${maxZona}">${maxZona}</span> <span class="kpi-zona-conteo">(${maxZonaCount})</span>`;
        } else {
            elZona.textContent = "Sin zona";
        }
    }
    let tipoColor = "var(--texto-suave)";
    if (maxTipo.toLowerCase().includes("robo")) tipoColor = "var(--rojo)";
    else if (maxTipo.toLowerCase().includes("agresion") || maxTipo.toLowerCase().includes("amenaza")) tipoColor = "var(--amarillo)";
    else if (maxTipo.toLowerCase().includes("pique")) tipoColor = "var(--magenta)";
    else if (maxTipo.toLowerCase().includes("accidente")) tipoColor = "var(--verde)";
    if(elTipo) elTipo.innerHTML = maxTipo !== "N/A" ? `<span style="display:inline-block; width:7px; height:7px; border-radius:50%; background-color:${tipoColor}; margin-right:6px;"></span>${maxTipo}` : "---";
    if(elBarrio) elBarrio.textContent = maxZona !== "N/A" ? maxZona : "Sin zona";
    if(elOldTipo) elOldTipo.textContent = maxTipo !== "N/A" ? maxTipo : "…";
    if(elHora) elHora.textContent = maxHora !== "N/A" ? maxHora : "…";

    // CALCULO VARIACIÓN (Últimos 30 días vs 30 días previos del dataset visible)
    if (elVariacion && fechas.length > 0) {
        fechas.sort((a, b) => a - b);
        const maxDate = fechas[fechas.length - 1];
        
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        const cutoffRecent = maxDate - thirtyDaysMs;
        const cutoffPrevious = maxDate - (2 * thirtyDaysMs);
        
        let countRecent = 0;
        let countPrevious = 0;
        
        fechas.forEach(t => {
            if (t >= cutoffRecent && t <= maxDate) countRecent++;
            else if (t >= cutoffPrevious && t < cutoffRecent) countPrevious++;
        });

        if (countPrevious === 0) {
            elVariacion.innerHTML = `${countRecent > 0 ? "↑" : ""} ${countRecent > 0 ? "100%" : "0%"}`;
            elVariacion.className = "kpi-valor " + (countRecent > 0 ? "kpi-variacion-negativa" : ""); // Aumento de crimen = negativo (rojo)
        } else {
            const pct = Math.round(((countRecent - countPrevious) / countPrevious) * 100);
            const symbol = pct > 0 ? "↑" : (pct < 0 ? "↓" : "");
            elVariacion.innerHTML = `${symbol} ${Math.abs(pct)}%`;
            elVariacion.className = "kpi-valor";
            if (pct > 0) elVariacion.classList.add("kpi-variacion-negativa"); // Rojo
            if (pct < 0) elVariacion.classList.add("kpi-variacion-positiva"); // Verde
        }
    }
}

function cargarBarrio() {
    capaBarrio.clearLayers();
    const nombre = (typeof lugarSeleccionado !== 'undefined' && lugarSeleccionado.tipo === 'Barrio') ? lugarSeleccionado.nombre : (inpBuscarLugar.value || '');
    let url = "/poligonoBarrio";
    if (nombre) {
        url += `?nombre=${encodeURIComponent(nombre)}`;
    }
    if (typeof lugarSeleccionado !== 'undefined' && lugarSeleccionado.tipo === 'Vereda') return;
    fetch(url)
        .then(res => res.json())
        .then(data => {
            const capaGeoJSON = L.geoJSON(null, {
                pane: 'poligonosPane',
                style: {
                    color: "white",
                    fillColor: "black",
                    weight: 0.5,
                    fillOpacity: 0.4
                },
                onEachFeature(feature, layer) {
                    layer.bindTooltip(feature.properties.namebarrio, {
                        sticky: true,
                        className: 'tooltip-barrio'
                    });
                    layer.on("click", function (e) {
                        if (e && e.originalEvent) {
                            L.DomEvent.stopPropagation(e);
                        }
                        mostrarCoordenadasMapa(e.latlng, { barrio: feature.properties.namebarrio });
                    });
                }
            });
            data.forEach(barrio => {
                const geometry = JSON.parse(barrio.geom);
                capaGeoJSON.addData({
                    type: "Feature",
                    geometry,
                    properties: { namebarrio: barrio.namebarrio }
                });
            });
            capaGeoJSON.addTo(capaBarrio);
            if (nombre && data.length > 0) {
                map.fitBounds(capaGeoJSON.getBounds());
            }
        });
}

function cargarVeredas() {
    capaVereda.clearLayers();
    const nombre = (typeof lugarSeleccionado !== 'undefined' && lugarSeleccionado.tipo === 'Vereda') ? lugarSeleccionado.nombre : (inpBuscarLugar.value || '');
    let url = "/poligonoVereda";
    if (nombre) {
        url += `?nombre=${encodeURIComponent(nombre)}`;
    }
    if (typeof lugarSeleccionado !== 'undefined' && lugarSeleccionado.tipo === 'Barrio') return;
    fetch(url)
        .then(res => res.json())
        .then(data => {
            const capaGeoJSON = L.geoJSON(null, {
                pane: 'poligonosPane',
                style: {
                    color: "blue",
                    fillColor: "gray",
                    weight: 0.9,
                    fillOpacity: 0.4
                },
                onEachFeature(feature, layer) {
                    const desc = "Vereda: " + feature.properties.nombre +
                        (feature.properties.corregimiento ? ("<br>Corregimiento: " + feature.properties.corregimiento) : "");
                    layer.bindTooltip(desc, {
                        sticky: true,
                        className: 'tooltip-vereda'
                    });
                    layer.on("click", function (e) {
                        if (e && e.originalEvent) {
                            L.DomEvent.stopPropagation(e);
                        }
                        mostrarCoordenadasMapa(e.latlng, {
                            vereda: feature.properties.nombre,
                            corregimiento: feature.properties.corregimiento
                        });
                    });
                }
            });
            data.forEach(vereda => {
                const geometry = JSON.parse(vereda.geom);
                capaGeoJSON.addData({
                    type: "Feature",
                    geometry,
                    properties: {
                        nombre: vereda.nombre,
                        corregimiento: vereda.namecorregimiento
                    }
                });
            });
            capaGeoJSON.addTo(capaVereda);
            if (nombre && data.length > 0) {
                map.fitBounds(capaGeoJSON.getBounds());
            }
        });
}

function resetMapa() {
    map.setView([1.615, -75.606], 14);
}

document.querySelector(".btnActualizar").addEventListener("click", function (e) {
    if (e) e.stopPropagation();
    if (map) map.closePopup();
    actualizarBadgeFiltros();
    cargarBarrio();
    cargarIncidentes();
    cargarVeredas();
    cerrarPanelFiltros();
});

document.querySelector(".restablecer").addEventListener("click", function (e) {
    if (e) e.stopPropagation();
    if (map) map.closePopup();
    capaIncidentes.clearLayers();
    heatLayer.setLatLngs([]);
    capaBarrio.clearLayers();
    capaVereda.clearLayers();
    desmarcarTiposInput();
    if (typeof inpBuscarLugar !== "undefined" && inpBuscarLugar) inpBuscarLugar.value = "";
    lugarSeleccionado = { nombre: "", tipo: "" };
    if (contenedor) {
        contenedor.innerHTML = "";
        contenedor.style.display = "none";
    }
    
    // Apagar heatmap si estaba encendido
    modoCalor = false;
    if(btnToggleHeatmap) btnToggleHeatmap.classList.remove("activo");

    // Apagar DBSCAN si estaba encendido
    modoDBSCAN = false;
    if (btnToggleDBSCAN) {
        btnToggleDBSCAN.classList.remove("activo");
        btnToggleDBSCAN.style.background = "rgba(14, 165, 233, 0.15)";
        btnToggleDBSCAN.style.boxShadow = "";
    }
    if (map && map.hasLayer(dbscanLayer)) map.removeLayer(dbscanLayer);
    dbscanLayer.clearLayers();
    
    // Resetear tiempo a 3 meses
    const hoy = new Date();
    const hace3 = new Date();
    hace3.setMonth(hoy.getMonth() - 3);
    filtroFechaDesde = formatearFecha(hace3);
    filtroFechaHasta = formatearFecha(hoy);

    // Limpiar UI del modal
    document.getElementById("fechaDesdeModal").value = "";
    document.getElementById("fechaHastaModal").value = "";
    document.getElementById("mesFiltroModal").value = "";
    if (document.getElementById("anioFiltroModal")) document.getElementById("anioFiltroModal").value = "";
    document.querySelectorAll(".btn-rapido-modal").forEach(b => b.classList.remove("activo"));
    const btn3Meses = Array.from(document.querySelectorAll(".btn-rapido-modal")).find(b => b.dataset.rango === "3meses");
    if (btn3Meses) btn3Meses.classList.add("activo");

    cargarBarrio();
    cargarVeredas();
    cargarIncidentes();
    cargarResumen();
    cargarIncidentesBarra();
    resetMapa();
    actualizarBadgeFiltros();
});


if (inpBuscarLugar) {
    inpBuscarLugar.addEventListener("input", async function () {
        if (!contenedor) return;
        this.after(contenedor);
        actualizarBadgeFiltros();
        const texto = this.value.trim();
        if (texto.length < 2) {
            contenedor.innerHTML = "";
            contenedor.style.display = "none";
            lugarSeleccionado = { nombre: '', tipo: '' };
            return;
        }

        try {
            const [resBarrios, resVeredas] = await Promise.all([
                fetch(`/buscarBarrios?q=${encodeURIComponent(texto)}`),
                fetch(`/buscarVeredas?q=${encodeURIComponent(texto)}`)
            ]);
            
            const [barrios, veredas] = await Promise.all([
                resBarrios.json(),
                resVeredas.json()
            ]);

            const sugerencias = [
                ...barrios.map(b => ({ nombre: b.namebarrio, tipo: 'Barrio' })),
                ...veredas.map(v => ({ nombre: v.nombre, tipo: 'Vereda' }))
            ].slice(0, 15); // Limitar a 15 sugerencias totales

            contenedor.innerHTML = "";
            if (sugerencias.length === 0) {
                const sinResult = document.createElement("div");
                sinResult.className = "itemSugerencia";
                sinResult.style.color = "var(--texto-suave)";
                sinResult.style.cursor = "default";
                sinResult.style.fontStyle = "italic";
                sinResult.textContent = "No se encontraron coincidencias";
                contenedor.appendChild(sinResult);
            } else {
                sugerencias.forEach(item => {
                    const div = document.createElement("div");
                    div.innerHTML = `<span>${item.nombre}</span> <small style="color:var(--acento); font-size:11px; background:rgba(37,99,235,0.12); padding:2px 7px; border-radius:6px; font-weight:600;">${item.tipo}</small>`;
                    div.classList.add("itemSugerencia");
                    div.addEventListener("click", function (ev) {
                        ev.stopPropagation();
                        inpBuscarLugar.value = item.nombre;
                        lugarSeleccionado = item;
                        contenedor.innerHTML = "";
                        contenedor.style.display = "none";
                        actualizarBadgeFiltros();
                    });
                    contenedor.appendChild(div);
                });
            }
            contenedor.style.display = "block";
        } catch(e) {
            console.error("Error buscando sugerencias de lugares:", e);
        }
    });

    inpBuscarLugar.addEventListener("focus", function () {
        if (contenedor && contenedor.children.length > 0 && this.value.trim().length >= 2) {
            contenedor.style.display = "block";
        }
    });

    document.addEventListener("click", function (e) {
        if (contenedor && !contenedor.contains(e.target) && e.target !== inpBuscarLugar) {
            contenedor.style.display = "none";
        }
    });
}


let graficoAnimFrame = null;

async function cargarIncidentesBarra() {
    let data = [];
    const tieneFiltroLugarOTipo = (typeof inpBuscarLugar !== 'undefined' && inpBuscarLugar && inpBuscarLugar.value.trim() !== '') || (typeof tiposId !== 'undefined' && tiposId && tiposId.length > 0);
    
    if (tieneFiltroLugarOTipo && typeof incidentesData !== 'undefined' && incidentesData && incidentesData.length > 0) {
        const conteo = {};
        incidentesData.forEach(inc => {
            const t = inc.nametipoincidente || (inc.idtipoincidente === 1 ? 'Robo' : inc.idtipoincidente === 2 ? 'Agresiones/Amenazas' : inc.idtipoincidente === 3 ? 'Piques' : 'Accidentes de transito');
            conteo[t] = (conteo[t] || 0) + 1;
        });
        const colores = {
            "Robo": "#e74c3c",
            "Agresiones/Amenazas": "#f1c40f",
            "Piques": "#9b59b6",
            "Accidentes de transito": "#2ecc71"
        };
        data = Object.entries(conteo).map(([tipo, cantidad]) => ({
            tipo,
            cantidad,
            color: colores[tipo] || "#3b82f6"
        }));
        data.sort((a, b) => b.cantidad - a.cantidad);
    } else {
        const q = `?fechaDesde=${filtroFechaDesde}&fechaHasta=${filtroFechaHasta}`;
        try {
            const res = await fetch(`/top-incidentes${q}`);
            data = await res.json();
        } catch (e) {
            console.error("Error obteniendo top-incidentes:", e);
            data = [];
        }
    }

    const canvas = document.getElementById("graficoBarras");
    if (!canvas) return;

    if (!data || !data.length) {
        if (chartBarras) {
            chartBarras.destroy();
            chartBarras = null;
        }
        return;
    }

    const ctx = canvas.getContext("2d");

    if (chartBarras) {
        chartBarras.destroy();
    }

    const totalCount = data.reduce((acc, curr) => acc + curr.cantidad, 0);
    const labels = data.map(d => d.tipo);
    const valores = data.map(d => d.cantidad);

    function obtenerColorGradiente(tipoStr, colorBackend) {
        const t = (tipoStr || '').toLowerCase();
        if (t.includes('robo') || t.includes('hurto')) {
            return { border: '#e05d5d', fillStart: 'rgba(224, 93, 93, 0.15)', fillEnd: 'rgba(224, 93, 93, 0.55)' };
        } else if (t.includes('accidente') || t.includes('tránsito') || t.includes('transito')) {
            return { border: '#10b981', fillStart: 'rgba(16, 185, 129, 0.15)', fillEnd: 'rgba(16, 185, 129, 0.55)' };
        } else if (t.includes('pique')) {
            return { border: '#a855f7', fillStart: 'rgba(168, 85, 247, 0.15)', fillEnd: 'rgba(168, 85, 247, 0.55)' };
        } else if (t.includes('agresi') || t.includes('amenaza')) {
            return { border: '#eab308', fillStart: 'rgba(234, 179, 8, 0.15)', fillEnd: 'rgba(234, 179, 8, 0.55)' };
        }
        const base = colorBackend || '#3b82f6';
        return { border: base, fillStart: 'rgba(59, 130, 246, 0.15)', fillEnd: 'rgba(59, 130, 246, 0.55)' };
    }

    const parentWidth = canvas.parentElement ? canvas.parentElement.clientWidth : 300;

    const backgroundGradients = data.map(d => {
        const style = obtenerColorGradiente(d.tipo, d.color);
        const grad = ctx.createLinearGradient(0, 0, parentWidth, 0);
        grad.addColorStop(0, style.fillStart);
        grad.addColorStop(1, style.fillEnd);
        return grad;
    });

    const borderColors = data.map(d => {
        const style = obtenerColorGradiente(d.tipo, d.color);
        return style.border;
    });

    chartBarras = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Incidentes',
                data: valores,
                backgroundColor: backgroundGradients,
                borderColor: borderColors,
                borderWidth: 2,
                borderRadius: 20,
                borderSkipped: false,
                barThickness: 22
            }]
        },
        options: {
            indexAxis: 'y', // Orientación horizontal ejecutiva
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(13, 17, 23, 0.95)',
                    titleColor: '#3b82f6',
                    bodyColor: '#ffffff',
                    borderColor: '#30363d',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: (context) => {
                            const val = context.raw || 0;
                            const pct = totalCount > 0 ? ((val / totalCount) * 100).toFixed(1) : 0;
                            return ` Total: ${val} incidentes (${pct}%)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: document.body.classList.contains("tema-claro") ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: document.body.classList.contains("tema-claro") ? '#475569' : '#8b949e',
                        font: { size: 11, family: "'Outfit', sans-serif" },
                        stepSize: 1
                    },
                    beginAtZero: true,
                    border: { display: false }
                },
                y: {
                    grid: { display: false },
                    ticks: {
                        color: document.body.classList.contains("tema-claro") ? '#0f172a' : '#ffffff',
                        font: { size: 12, family: "'Outfit', sans-serif", weight: '600' }
                    },
                    border: { display: false }
                }
            }
        }
    });
}

window.addEventListener("resize", () => {
    map.invalidateSize();
    if (vistaActual === "estadisticas") {
        cargarIncidentesBarra();
    }
    if (vistaActual === "tabla") {
        const ag = document.querySelector(".map-actions-group");
        const cTabla = document.getElementById("contenedorAccionesTabla");
        const cMobile = document.getElementById("contenedorAccionesIncidentesMobile");
        const esMovil = window.innerWidth <= 768;
        const target = (esMovil && cMobile) ? cMobile : cTabla;
        if (ag && target && ag.parentElement !== target) {
            target.appendChild(ag);
        }
    }
});

/* ══════════════════════════════════════
   CLICK EN EL MAPA — Obtener Coordenadas
══════════════════════════════════════ */
map.on("click", function (e) {
    // Si el clic ocurrió sobre algún botón, control, dock de filtros, modal o panel, NO abrir popup de coordenadas
    const target = e.originalEvent && e.originalEvent.target;
    if (target) {
        if (
            target.closest('.map-actions-group') ||
            target.closest('#panelFiltros') ||
            target.closest('#filtrosOverlay') ||
            target.closest('.modal-tiempo') ||
            target.closest('#modalFiltroTiempo') ||
            target.closest('#overlayFiltroTiempo') ||
            target.closest('.leaflet-control') ||
            target.closest('.btn-abrir-kpis') ||
            target.closest('button') ||
            target.closest('input') ||
            target.closest('select') ||
            target.closest('.fab') ||
            target.closest('.leaflet-marker-icon') ||
            target.closest('.leaflet-popup')
        ) {
            return;
        }
    }

    mostrarCoordenadasMapa(e.latlng);
});

cambiarVista("mapa");
cargarIncidentesBarra();
cargarVeredas();
cargarBarrio();
cargarIncidentes();
actualizarBadgeFiltros();

function mostrarInfoTemporal(mensaje) {
    const toast = document.createElement("div");
    toast.textContent = mensaje;
    toast.style.position = "fixed";
    toast.style.top = (window.innerWidth <= 768) ? "calc(var(--mobile-header-h, 58px) + 10px)" : "20px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
    toast.style.color = "#fff";
    toast.style.padding = "10px 20px";
    toast.style.borderRadius = "8px";
    toast.style.zIndex = "99999";
    toast.style.fontSize = "0.85rem";
    toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
    toast.style.border = "1px solid var(--azul)";
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.4s ease, transform 0.4s ease";
    toast.style.textAlign = "center";
    toast.style.maxWidth = "90vw";
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(-50%) translateY(10px)";
    }, 100);
    
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-50%) translateY(-10px)";
        setTimeout(() => toast.remove(), 400);
    }, 5000);
}

setTimeout(() => {
    mostrarInfoTemporal("Mostrando incidentes de los últimos 3 meses por defecto.");
}, 800);


/* ════════════════════════════════
   MODAL FILTRO DE TIEMPO (Dashboard)
   ════════════════════════════════ */

const modalFiltroTiempo = document.getElementById("modalFiltroTiempo");
const btnAbrirFiltroTiempo = document.getElementById("btnAbrirFiltroTiempo");
const btnCerrarFiltroTiempo = document.getElementById("btnCerrarFiltroTiempo");

const anioFiltroModal = document.getElementById("anioFiltroModal");
if (anioFiltroModal) {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= 2020; y--) {
        const option = document.createElement("option");
        option.value = y;
        option.textContent = y;
        anioFiltroModal.appendChild(option);
    }
}

if (btnAbrirFiltroTiempo) {
    btnAbrirFiltroTiempo.addEventListener("click", (e) => {
        if (e) e.stopPropagation();
        if (map) map.closePopup();
        modalFiltroTiempo.style.display = "flex";
    });
}

function cerrarModalFiltroTiempo() {
    modalFiltroTiempo.style.display = "none";
}
if (btnCerrarFiltroTiempo) btnCerrarFiltroTiempo.addEventListener("click", cerrarModalFiltroTiempo);

window.addEventListener("click", (e) => {
    if (e.target === modalFiltroTiempo) {
        cerrarModalFiltroTiempo();
    }
});

function aplicarFiltroGlobal() {
    // Cuando cambia el filtro de tiempo, recargamos mapa y estadísticas
    cargarIncidentes();
    cargarResumen();
    cargarIncidentesBarra();
    cerrarModalFiltroTiempo();
}

const btnRapidos = document.querySelectorAll(".btn-rapido-modal");
btnRapidos.forEach(btn => {
    btn.addEventListener("click", () => {
        btnRapidos.forEach(b => b.classList.remove("activo"));
        btn.classList.add("activo");

        const rango = btn.dataset.rango;
        const hoyObj = new Date();
        filtroFechaHasta = formatearFecha(hoyObj);

        switch (rango) {
            case "hoy": filtroFechaDesde = formatearFecha(hoyObj); break;
            case "semana": 
                const haceUnaSemana = new Date(); haceUnaSemana.setDate(hoyObj.getDate() - 7);
                filtroFechaDesde = formatearFecha(haceUnaSemana); break;
            case "15dias":
                const hace15Dias = new Date(); hace15Dias.setDate(hoyObj.getDate() - 15);
                filtroFechaDesde = formatearFecha(hace15Dias); break;
            case "mes":
                const haceUnMes = new Date(); haceUnMes.setMonth(hoyObj.getMonth() - 1);
                filtroFechaDesde = formatearFecha(haceUnMes); break;
            case "3meses":
                const hace3Meses = new Date(); hace3Meses.setMonth(hoyObj.getMonth() - 3);
                filtroFechaDesde = formatearFecha(hace3Meses); break;
            case "1anio":
                const hace1Anio = new Date(); hace1Anio.setFullYear(hoyObj.getFullYear() - 1);
                filtroFechaDesde = formatearFecha(hace1Anio); break;
        }

        document.getElementById("fechaDesdeModal").value = "";
        document.getElementById("fechaHastaModal").value = "";
        document.getElementById("mesFiltroModal").value = "";
        if (document.getElementById("anioFiltroModal")) document.getElementById("anioFiltroModal").value = "";

        aplicarFiltroGlobal();
    });
});

const btnAplicarRango = document.getElementById("btnAplicarRangoModal");
if (btnAplicarRango) {
    btnAplicarRango.addEventListener("click", () => {
        const desde = document.getElementById("fechaDesdeModal").value;
        const hasta = document.getElementById("fechaHastaModal").value;

        if (!desde || !hasta) {
            alert("Ambos campos de fecha son obligatorios."); return;
        }
        if (new Date(desde) > new Date(hasta)) {
            alert("La fecha 'Desde' no puede ser mayor que 'Hasta'."); return;
        }

        btnRapidos.forEach(b => b.classList.remove("activo"));
        document.getElementById("mesFiltroModal").value = "";
        if (document.getElementById("anioFiltroModal")) document.getElementById("anioFiltroModal").value = "";

        filtroFechaDesde = desde;
        filtroFechaHasta = hasta;

        aplicarFiltroGlobal();
    });
}

const btnLimpiarRango = document.getElementById("btnLimpiarRangoModal");
if (btnLimpiarRango) {
    btnLimpiarRango.addEventListener("click", () => {
        document.getElementById("fechaDesdeModal").value = "";
        document.getElementById("fechaHastaModal").value = "";
        const hoy = new Date();
        const hace3 = new Date();
        hace3.setMonth(hoy.getMonth() - 3);
        filtroFechaDesde = formatearFecha(hace3);
        filtroFechaHasta = formatearFecha(hoy);
        aplicarFiltroGlobal();
    });
}

const btnFiltrarMes = document.getElementById("btnFiltrarMesModal");
if (btnFiltrarMes) {
    btnFiltrarMes.addEventListener("click", () => {
        const mesAnio = document.getElementById("mesFiltroModal").value; 
        if (!mesAnio) { alert("Debe seleccionar un mes."); return; }

        btnRapidos.forEach(b => b.classList.remove("activo"));
        document.getElementById("fechaDesdeModal").value = "";
        document.getElementById("fechaHastaModal").value = "";
        if (document.getElementById("anioFiltroModal")) document.getElementById("anioFiltroModal").value = "";

        const [anioStr, mesStr] = mesAnio.split("-");
        const anio = parseInt(anioStr);
        const mes = parseInt(mesStr) - 1;
        const primerDia = new Date(anio, mes, 1);
        const ultimoDia = new Date(anio, mes + 1, 0);

        filtroFechaDesde = formatearFecha(primerDia);
        filtroFechaHasta = formatearFecha(ultimoDia);

        aplicarFiltroGlobal();
    });
}

const btnFiltrarAnio = document.getElementById("btnFiltrarAnioModal");
if (btnFiltrarAnio) {
    btnFiltrarAnio.addEventListener("click", () => {
        const anio = document.getElementById("anioFiltroModal").value; 
        if (!anio) { alert("Debe seleccionar un año."); return; }

        btnRapidos.forEach(b => b.classList.remove("activo"));
        document.getElementById("fechaDesdeModal").value = "";
        document.getElementById("fechaHastaModal").value = "";
        document.getElementById("mesFiltroModal").value = "";

        const y = parseInt(anio);
        const primerDia = new Date(y, 0, 1);
        const ultimoDia = new Date(y, 11, 31);

        filtroFechaDesde = formatearFecha(primerDia);
        filtroFechaHasta = formatearFecha(ultimoDia);

        aplicarFiltroGlobal();
    });
}

const btnLimpiarTodo = document.getElementById("btnLimpiarTodoModal");
if (btnLimpiarTodo) {
    btnLimpiarTodo.addEventListener("click", () => {
        document.getElementById("fechaDesdeModal").value = "";
        document.getElementById("fechaHastaModal").value = "";
        document.getElementById("mesFiltroModal").value = "";
        if (document.getElementById("anioFiltroModal")) document.getElementById("anioFiltroModal").value = "";
        btnRapidos.forEach(b => b.classList.remove("activo"));
        
        const hoy = new Date();
        const hace3 = new Date();
        hace3.setMonth(hoy.getMonth() - 3);
        filtroFechaDesde = formatearFecha(hace3);
        filtroFechaHasta = formatearFecha(hoy);

        // Volver a marcar como activo el botón de 3 meses si existe
        const btn3Meses = Array.from(btnRapidos).find(b => b.dataset.rango === "3meses");
        if (btn3Meses) btn3Meses.classList.add("activo");

        aplicarFiltroGlobal();
    });
}

// Asegurar que el mapa se inicializa correctamente
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para que el DOM se renderice
    setTimeout(function() {
        if (typeof map !== 'undefined') {
            map.invalidateSize();
        }
    }, 100);
});

// También al cambiar de pestaña en móviles
window.addEventListener('resize', function() {
    if (typeof map !== 'undefined') {
        map.invalidateSize();
    }
});


// --- SIGI MAP RESIZE FIX ---
// Forzar actualización del tamaño del mapa después de que la página cargue
window.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (typeof map !== 'undefined' && map.invalidateSize) {
            map.invalidateSize();
            console.log('✅ Mapa refrescado (DOMContentLoaded)');
        }
    }, 500);
});

// También al cambiar de vista o redimensionar
window.addEventListener('resize', function() {
    if (typeof map !== 'undefined' && map.invalidateSize) {
        map.invalidateSize();
    }
});


const modalLugares = document.getElementById("modalLugares");
const btnAbrirLugares = document.getElementById("btnAbrirLugares");
const btnCerrarLugares = document.getElementById("btnCerrarLugares");
const btnAplicarLugares = document.getElementById("btnAplicarLugares");

if (btnAbrirLugares && modalLugares) {
    btnAbrirLugares.addEventListener("click", () => {
        modalLugares.classList.add("mostrar");
    });
}
if (btnCerrarLugares && modalLugares) {
    btnCerrarLugares.addEventListener("click", () => {
        modalLugares.classList.remove("mostrar");
    });
}
if (btnAplicarLugares && modalLugares) {
    btnAplicarLugares.addEventListener("click", () => {
        modalLugares.classList.remove("mostrar");
        renderizarIncidentes();
    });
}
// Cerrar al hacer clic fuera
window.addEventListener("click", (e) => {
    if (e.target === modalLugares) {
        modalLugares.classList.remove("mostrar");
    }
});

// Bloqueo estricto de auto-scroll en los contenedores del mapa para evitar desplazamientos por foco del navegador
const bloquearScrollContenedores = () => {
    const contenedores = [
        document.querySelector('.content-wrapper'),
        document.querySelector('.main-content'),
        document.getElementById('vistaMapa'),
        document.querySelector('.layout-wrapper'),
        document.querySelector('.map-wrapper')
    ];
    contenedores.forEach(el => {
        if (el) {
            el.addEventListener('scroll', () => {
                if (el.scrollTop !== 0) el.scrollTop = 0;
                if (el.scrollLeft !== 0) el.scrollLeft = 0;
            }, { passive: true });
        }
    });
};
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bloquearScrollContenedores);
} else {
    bloquearScrollContenedores();
}

// ════════════════════════════════
// CONTROLADORES NATIVOS PARA MÓVIL
// ════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
    // Sincronizar clics en las pestañas de la barra inferior móvil
    document.querySelectorAll(".mobile-nav-tab[data-view]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const vista = btn.dataset.view;
            cambiarVista(vista);
        });
    });

    const navFiltrosMobileTab = document.getElementById("navFiltrosMobileTab");
    if (navFiltrosMobileTab) {
        navFiltrosMobileTab.addEventListener("click", () => {
            abrirPanelFiltros();
        });
    }

    const btnFiltrosMobileHeader = document.getElementById("btnFiltrosMobileHeader");
    if (btnFiltrosMobileHeader) {
        btnFiltrosMobileHeader.addEventListener("click", () => {
            abrirPanelFiltros();
        });
    }

    const buscarIncidenteMobile = document.getElementById("buscarIncidenteMobile");
    if (buscarIncidenteMobile) {
        buscarIncidenteMobile.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase().trim();
            if (!term) {
                renderizarFeedIncidentesMobile(incidentesData);
                return;
            }
            const filtrados = incidentesData.filter(inc => {
                const zona = (inc.namebarrio || inc.nombrevereda || '').toLowerCase();
                const tipo = (inc.nametipoincidente || '').toLowerCase();
                const cod = (inc.codigoincidente || '').toLowerCase();
                return zona.includes(term) || tipo.includes(term) || cod.includes(term);
            });
            renderizarFeedIncidentesMobile(filtrados);
        });
    }

    // Toggle para mostrar/esconder el contenedor de métricas de incidentes sobre el mapa
    const btnCerrarKpis = document.getElementById("btnCerrarKpis");
    const btnAbrirKpis = document.getElementById("btnAbrirKpis");
    const ribbonKpis = document.getElementById("kpiRibbon");

    if (btnCerrarKpis && ribbonKpis && btnAbrirKpis) {
        btnCerrarKpis.addEventListener("click", (e) => {
            e.stopPropagation();
            ribbonKpis.classList.add("kpi-oculto");
            ribbonKpis.classList.add("esconder");
            ribbonKpis.style.setProperty("display", "none", "important");
            btnAbrirKpis.classList.add("visible");
            btnAbrirKpis.style.setProperty("display", "inline-flex", "important");
            document.getElementById("vistaMapa")?.classList.add("vista-mapa-kpi-oculto");
            setTimeout(() => {
                if (typeof map !== "undefined" && map) {
                    map.invalidateSize();
                }
            }, 300);
        });

        // Proteger el contenedor para que hacer clic o interactuar dentro NO lo cierre
        ribbonKpis.addEventListener("click", (e) => {
            if (!e.target.closest("#btnCerrarKpis")) {
                e.stopPropagation();
            }
        });

        btnAbrirKpis.addEventListener("click", (e) => {
            e.stopPropagation();
            btnAbrirKpis.classList.remove("visible");
            btnAbrirKpis.style.setProperty("display", "none", "important");
            ribbonKpis.classList.remove("kpi-oculto");
            ribbonKpis.classList.remove("esconder");
            ribbonKpis.style.setProperty("display", "flex", "important");
            document.getElementById("vistaMapa")?.classList.remove("vista-mapa-kpi-oculto");
            setTimeout(() => {
                if (typeof map !== "undefined" && map) {
                    map.invalidateSize();
                }
            }, 350);
        });
    }

    // Scroll horizontal interactivo y fluido (rueda y arrastre con mouse) para el contenedor de KPIs
    const kpiCardsScroll = document.querySelector(".kpi-cards-scroll");
    if (kpiCardsScroll) {
        // Redirigir rueda de mouse hacia scroll horizontal (eje X)
        kpiCardsScroll.addEventListener("wheel", (e) => {
            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            if (delta !== 0) {
                e.preventDefault();
                kpiCardsScroll.scrollLeft += delta;
            }
        }, { passive: false });

        // Arrastre con mouse (Click & Drag para deslizar en escritorio / emulador móvil)
        let isDown = false;
        let startClientX = 0;
        let scrollStartLeft = 0;

        kpiCardsScroll.addEventListener("mousedown", (e) => {
            if (e.button !== 0) return; // Solo clic izquierdo
            isDown = true;
            kpiCardsScroll.classList.add("kpi-dragging");
            startClientX = e.clientX;
            scrollStartLeft = kpiCardsScroll.scrollLeft;
        });

        window.addEventListener("mouseup", () => {
            if (isDown) {
                isDown = false;
                kpiCardsScroll.classList.remove("kpi-dragging");
            }
        });

        window.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            e.preventDefault();
            const walk = (e.clientX - startClientX) * 1.4;
            kpiCardsScroll.scrollLeft = scrollStartLeft - walk;
        });

        // Asegurar que el clic dentro del área de tarjetas nunca se propague hacia disparadores de cierre
        kpiCardsScroll.addEventListener("click", (e) => {
            e.stopPropagation();
        });
    }
});
