let tiposId = [];

// Variables globales para el filtro de tiempo
let filtroFechaDesde = "";
let filtroFechaHasta = "";

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

const inpBuscarBarrio = document.getElementById("buscarBarrio");
const inpBuscarVereda = document.getElementById("buscarVereda");
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

let vistaActual = "mapa";

function cambiarVista(vistaId) {
    vistaActual = vistaId;
    cerrarPanelFiltros(false);

    // Ocultar todo
    panelMap.classList.add("esconder");
    panelMap.classList.remove("vista-activa");
    
    const vistaTabla = document.getElementById("vistaTabla");
    vistaTabla.classList.add("esconder");
    vistaTabla.classList.remove("vista-activa");
    
    panelEst.classList.add("esconder");
    panelEst.classList.remove("vista-activa");


    // Lógica por vista
    if (vistaId === "mapa") {
        panelMap.classList.remove("esconder");
        panelMap.classList.add("vista-activa");
        panelMap.classList.remove("modo-explorar");
        panelFiltros.classList.remove("esconder-desktop"); // Mostrar panel derecho
        setTimeout(() => map.invalidateSize(), 350); // Ajuste: 350ms para esperar que termine la transición CSS
    } else if (vistaId === "mapa-completo") {
        panelMap.classList.remove("esconder");
        panelMap.classList.add("vista-activa");
        panelMap.classList.add("modo-explorar");
        panelFiltros.classList.add("esconder-desktop"); // Ocultar panel derecho
        setTimeout(() => map.invalidateSize(), 350); // Ajuste: 350ms para esperar que termine la transición CSS
    } else if (vistaId === "tabla") {
        vistaTabla.classList.remove("esconder");
        vistaTabla.classList.add("vista-activa");
        llenarTablaIncidentes();
    } else if (vistaId === "estadisticas") {
        panelEst.classList.remove("esconder");
        panelEst.classList.add("vista-activa");
        cargarResumen();
    }

    // Actualizar botones de navegación
    document.querySelectorAll(".nav-btn[data-view]").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.view === vistaId);
    });
    document.querySelectorAll(".bottom-nav-item[data-view]").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.view === vistaId);
    });
}

function llenarTablaIncidentes() {
    const tbody = document.getElementById("tbodyIncidentesPublica");
    tbody.innerHTML = "";

    if (!incidentesData || incidentesData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No hay incidentes para mostrar.</td></tr>`;
        return;
    }

    incidentesData.forEach(inc => {
        const tr = document.createElement("tr");
        
        const fecha = new Date(inc.fechaincidente).toLocaleDateString("es-CO");
        const hora = inc.horaincidente ? inc.horaincidente.slice(0, 5) : "N/A";
        
        let badgeClass = "badge-default";
        if (inc.idtipoincidente === 1) badgeClass = "badge-robo";
        if (inc.idtipoincidente === 2) badgeClass = "badge-agresion";
        if (inc.idtipoincidente === 3) badgeClass = "badge-pique";
        if (inc.idtipoincidente === 4) badgeClass = "badge-accidente";

        tr.innerHTML = `
            <td><strong>${inc.codigoincidente || 'N/A'}</strong></td>
            <td><span class="badge-tipo ${badgeClass}">${inc.nametipoincidente || 'N/A'}</span></td>
            <td>${inc.namebarrio || 'N/A'}</td>
            <td>${fecha}</td>
            <td>${hora}</td>
        `;
        tbody.appendChild(tr);
    });
}

function irLogin() {
    window.location.href = "/login/index.html";
}

// Listeners Desktop
document.querySelectorAll(".nav-btn[data-view]").forEach(btn => {
    btn.addEventListener("click", () => cambiarVista(btn.dataset.view));
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

// Listener Exportar CSV
document.getElementById("btnExportarCsv")?.addEventListener("click", () => {
    if(!incidentesData || incidentesData.length === 0) return alert("No hay datos para exportar.");
    let csv = "Código,Tipo,Barrio,Fecha,Hora,Descripción\n";
    incidentesData.forEach(inc => {
        const fecha = new Date(inc.fechaincidente).toLocaleDateString("es-CO");
        const hora = inc.horaincidente ? inc.horaincidente.slice(0, 5) : "N/A";
        const desc = (inc.descripcionincidente || "").replace(/,/g, " ");
        csv += `${inc.codigoincidente},${inc.nametipoincidente},${inc.namebarrio},${fecha},${hora},${desc}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "incidentes.csv";
    a.click();
});

function setBottomNavActive(viewId) {
    document.querySelectorAll(".bottom-nav-item[data-view]").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.view === viewId);
    });
}

let chartTendencia = null;
let chartHoras = null;

function cargarResumen() {
    if (!incidentesData || incidentesData.length === 0) return;

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
    const elTotal = document.getElementById("total");
    if(elTotal) elTotal.textContent = incidentesData.length;
    const elRobos = document.getElementById("robos");
    if(elRobos) elRobos.textContent = r;
    const elAcci = document.getElementById("accidentes");
    if(elAcci) elAcci.textContent = a;
    const elPiques = document.getElementById("piques");
    if(elPiques) elPiques.textContent = p;
    const elAgres = document.getElementById("agresiones");
    if(elAgres) elAgres.textContent = ag;

    const elTopB = document.getElementById("topBarrio");
    if(elTopB) {
        let maxB = "N/A", maxCount = 0;
        for(let [b, c] of Object.entries(conteoBarrio)) {
            if(c > maxCount) { maxB = b; maxCount = c; }
        }
        elTopB.textContent = maxB;
    }

    const elTopV = document.getElementById("topVereda");
    if(elTopV) {
        let maxV = "N/A", maxCount = 0;
        for(let [v, c] of Object.entries(conteoVereda)) {
            if(c > maxCount) { maxV = v; maxCount = c; }
        }
        elTopV.textContent = maxV;
    }

    // Ordenar las llaves cronológicamente
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

    // Colores basados en el CSS (var(--acento) o azul)
    const colorAcento = '#388bfd';
    
    chartTendencia = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labelsFormatted,
            datasets: [{
                label: 'Total Incidentes',
                data: data,
                borderColor: colorAcento,
                backgroundColor: 'rgba(56, 139, 253, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: colorAcento,
                pointBorderColor: '#0d1117',
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
                        color: '#8b949e',
                        font: { size: 11 }
                    },
                    border: { display: false }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#8b949e',
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
                backgroundColor: 'rgba(188, 140, 255, 0.7)',
                borderColor: 'rgba(188, 140, 255, 1)',
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
                    ticks: { color: '#8b949e', font: { size: 10 } },
                    border: { display: false }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#8b949e', font: { size: 11 }, stepSize: 1 },
                    beginAtZero: true,
                    border: { display: false }
                }
            }
        }
    });

    // ── MATRIZ DE CONCENTRACIÓN ──
    const contMatriz = document.getElementById("matrizDiaHora");
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
                    // Calcular opacidad relativa al máximo, con un mínimo visible
                    const opacity = Math.max(0.15, val / maxHeatmap);
                    cell.style.backgroundColor = `rgba(248, 81, 73, ${opacity})`; // Rojo heatmap
                    cell.title = `${diasSemana[d]} ${String(h).padStart(2, '0')}:00\nIncidentes: ${val}`;
                    cell.textContent = val;
                }
                
                contMatriz.appendChild(cell);
            }
        }
    }
}

function contarFiltrosActivos() {
    let count = tiposId.length;
    if (inpBuscarBarrio.value.trim()) count++;
    if (inpBuscarVereda.value.trim()) count++;
    return count;
}

function actualizarBadgeFiltros() {
    const count = contarFiltrosActivos();
    badgeFiltros.textContent = count;
    badgeFiltros.classList.toggle("visible", count > 0);
}

function abrirPanelFiltros(desdeNav = false) {
    panelFiltros.classList.add("abierto");
    panelFiltros.setAttribute("aria-hidden", "false");
    panelMap.classList.add("filtros-abiertos");

    if (esMobile()) {
        filtrosOverlay.classList.add("visible");
        filtrosOverlay.setAttribute("aria-hidden", "false");
        if (desdeNav) {
            setBottomNavActive("filtros");
        }
    } else {
        btnFiltros.style.display = "none";
    }
}

function cerrarPanelFiltros(actualizarNav = true) {
    /* El foco debe salir del panel antes de marcarlo como aria-hidden */
    if (panelFiltros.contains(document.activeElement)) {
        btnFiltros.focus();
    }

    panelFiltros.classList.remove("abierto");
    panelFiltros.setAttribute("aria-hidden", "true");
    panelMap.classList.remove("filtros-abiertos");
    filtrosOverlay.classList.remove("visible");
    filtrosOverlay.setAttribute("aria-hidden", "true");
    btnFiltros.style.display = "";

    if (actualizarNav && esMobile() && vistaActual === "mapa") {
        setBottomNavActive("mapa");
    }
}

btnFiltros.addEventListener("click", abrirPanelFiltros);
cerrarFiltros.addEventListener("click", () => cerrarPanelFiltros());
filtrosOverlay.addEventListener("click", () => cerrarPanelFiltros());

const map = L.map("map").setView([1.615, -75.606], 14);

// Crear paneles personalizados para controlar el z-index (quién se dibuja sobre quién)
map.createPane('poligonosPane');
map.getPane('poligonosPane').style.zIndex = 400; // Nivel base para polígonos

map.createPane('incidentesPane');
map.getPane('incidentesPane').style.zIndex = 450; // Siempre encima de polígonos

const esriSat = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles © Esri"
});

const cartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CartoDB'
});

const osmStreet = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OSM'
});

// Por defecto mostramos la oscura o satelital, dejemos oscuro como default para el Dashboard
cartoDark.addTo(map);

const baseMaps = {
    "Modo Oscuro": cartoDark,
    "Satelital": esriSat,
    "Calles (Normal)": osmStreet
};

// Control de capas abajo a la izquierda para no estorbar arriba a la derecha
L.control.layers(baseMaps, null, { position: 'bottomleft' }).addTo(map);

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

let capaBarrio = L.layerGroup().addTo(map);
let capaVereda = L.layerGroup().addTo(map);

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
    inpBuscarBarrio.value = "";
    inpBuscarVereda.value = "";
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

function obtenerURL() {
    let url = "/incidentes?";
    const barrio = inpBuscarBarrio.value;
    if (barrio) {
        url += `barrio=${encodeURIComponent(barrio)}&`;
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

            marker.on("mouseover", function () {
                if (incidente.codigoincidente) {
                    marker.bindTooltip(incidente.codigoincidente, {
                        permanent: false,
                        direction: "top",
                        offset: [0, -10]
                    }).openTooltip();
                }
            });

            marker.on("mouseout", function () {
                marker.closeTooltip();
            });

            marker.on("click", function () {
                const hora = incidente.horaincidente ? incidente.horaincidente.slice(0, 5) : "N/A";
                const fechaObj = new Date(incidente.fechaincidente);
                const fecha = isNaN(fechaObj) ? "N/A" : fechaObj.toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                });
                
                let iconClass = "bi-exclamation-circle";
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

                const contenido = `
                    <div class="popup-incidente">
                        <div class="popup-header ${tipoClase}">
                            <i class="bi ${iconClass}"></i>
                            <span>${incidente.nametipoincidente || 'Incidente'}</span>
                        </div>
                        <div class="popup-body">
                            <div class="popup-grid">
                                <div class="pg-item">
                                    <span class="pg-label">Fecha</span>
                                    <span class="pg-valor"><i class="bi bi-calendar3"></i> ${fecha}</span>
                                </div>
                                <div class="pg-item">
                                    <span class="pg-label">Hora</span>
                                    <span class="pg-valor"><i class="bi bi-clock"></i> ${hora}</span>
                                </div>
                                <div class="pg-item">
                                    <span class="pg-label">Estado</span>
                                    <span class="badge ${estadoClase}">${estado}</span>
                                </div>
                                <div class="pg-item">
                                    <span class="pg-label">Severidad</span>
                                    <span class="badge ${severidadClase}">${severidad}</span>
                                </div>
                            </div>
                            <div class="popup-row zona-row">
                                <i class="bi bi-geo-alt"></i> <b>Zona:</b> ${incidente.namebarrio || incidente.nombrevereda || 'Sin zona asignada'}
                            </div>
                            <div class="popup-desc">
                                <b>Descripción del reporte:</b><br>
                                ${incidente.descripcionincidente || 'No hay detalles adicionales.'}
                            </div>
                        </div>
                        <div class="popup-footer">
                            <small>Ref: ${incidente.codigoincidente || 'N/A'}</small>
                        </div>
                    </div>
                `;
                marker.bindPopup(contenido, {
                    className: 'custom-popup-container',
                    minWidth: 280
                }).openPopup();
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
        })
        .catch(error => console.error("Error:", error));
}

const btnToggleHeatmap = document.getElementById("btnToggleHeatmap");
if(btnToggleHeatmap) {
    btnToggleHeatmap.addEventListener("click", () => {
        modoCalor = !modoCalor;
        if(modoCalor) {
            btnToggleHeatmap.classList.add("activo");
        } else {
            btnToggleHeatmap.classList.remove("activo");
        }
        renderizarIncidentes();
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

    if (data.length === 0) {
        if(elVariacion) { elVariacion.textContent = "0%"; elVariacion.className = "kpi-valor"; }
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

    if(elZona) elZona.textContent = maxZona !== "N/A" ? maxZona : "Sin zona";
    if(elTipo) elTipo.textContent = maxTipo !== "N/A" ? maxTipo : "...";
    if(elBarrio) elBarrio.textContent = maxZona !== "N/A" ? maxZona : "Sin zona";
    if(elOldTipo) elOldTipo.textContent = maxTipo !== "N/A" ? maxTipo : "...";
    if(elHora) elHora.textContent = maxHora !== "N/A" ? maxHora : "...";

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
            elVariacion.textContent = countRecent > 0 ? "+100%" : "0%";
            elVariacion.className = "kpi-valor " + (countRecent > 0 ? "kpi-variacion-negativa" : ""); // Aumento de crimen = negativo (rojo)
        } else {
            const pct = Math.round(((countRecent - countPrevious) / countPrevious) * 100);
            elVariacion.textContent = (pct > 0 ? "+" : "") + pct + "%";
            elVariacion.className = "kpi-valor";
            if (pct > 0) elVariacion.classList.add("kpi-variacion-negativa"); // Rojo
            if (pct < 0) elVariacion.classList.add("kpi-variacion-positiva"); // Verde
        }
    }
}

function cargarBarrio() {
    capaBarrio.clearLayers();
    const nombre = inpBuscarBarrio.value;
    let url = "/poligonoBarrio";
    if (nombre) {
        url += `?nombre=${encodeURIComponent(nombre)}`;
    }
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
                    layer.bindPopup(feature.properties.namebarrio);
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
    const nombre = inpBuscarVereda.value;
    capaVereda.clearLayers();
    fetch(`/poligonoVereda?nombre=${encodeURIComponent(nombre)}`)
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
                        "<br>Corregimiento: " + feature.properties.corregimiento;
                    layer.bindPopup(desc);
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

document.querySelector(".btnActualizar").addEventListener("click", function () {
    actualizarBadgeFiltros();
    cargarBarrio();
    cargarIncidentes();
    cargarVeredas();
    if (esMobile()) {
        cerrarPanelFiltros();
    }
});

document.querySelector(".restablecer").addEventListener("click", function () {
    capaIncidentes.clearLayers();
    heatLayer.setLatLngs([]);
    capaBarrio.clearLayers();
    capaVereda.clearLayers();
    desmarcarTiposInput();
    inpBuscarBarrio.value = "";
    inpBuscarVereda.value = "";
    
    // Apagar heatmap si estaba encendido
    modoCalor = false;
    if(btnToggleHeatmap) btnToggleHeatmap.classList.remove("activo");
    
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

inpBuscarBarrio.addEventListener("input", function () {
    this.after(contenedor);
    actualizarBadgeFiltros();
    const texto = this.value;
    if (texto.length < 2) {
        contenedor.innerHTML = "";
        return;
    }
    fetch(`/buscarBarrios?q=${encodeURIComponent(texto)}`)
        .then(res => res.json())
        .then(data => {
            contenedor.innerHTML = "";
            data.forEach(barrio => {
                const div = document.createElement("div");
                div.textContent = barrio.namebarrio;
                div.classList.add("itemSugerencia");
                div.addEventListener("click", function () {
                    inpBuscarBarrio.value = barrio.namebarrio;
                    contenedor.innerHTML = "";
                    actualizarBadgeFiltros();
                });
                contenedor.appendChild(div);
            });
        });
});

inpBuscarVereda.addEventListener("input", function () {
    this.after(contenedor);
    actualizarBadgeFiltros();
    const texto = this.value;
    if (texto.length < 2) {
        contenedor.innerHTML = "";
        return;
    }
    fetch(`/buscarVeredas?q=${encodeURIComponent(texto)}`)
        .then(res => res.json())
        .then(data => {
            contenedor.innerHTML = "";
            data.forEach(vereda => {
                const div = document.createElement("div");
                div.textContent = vereda.nombre;
                div.classList.add("itemSugerencia");
                div.addEventListener("click", function () {
                    inpBuscarVereda.value = vereda.nombre;
                    contenedor.innerHTML = "";
                    actualizarBadgeFiltros();
                });
                contenedor.appendChild(div);
            });
        });
});

/* ══════════════════════════════════════
   GRÁFICO DE BARRAS VERTICALES — Canvas
══════════════════════════════════════ */
let graficoAnimFrame = null;

async function cargarIncidentesBarra() {
    const q = `?fechaDesde=${filtroFechaDesde}&fechaHasta=${filtroFechaHasta}`;
    const res = await fetch(`/top-incidentes${q}`);
    const data = await res.json();
    if (!data.length) return;

    const canvas = document.getElementById("graficoBarras");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Tamaño responsivo
    const parent = canvas.parentElement;
    const W = parent.clientWidth || 340;
    const H = esMobile() ? 220 : 280;
    canvas.width  = W;
    canvas.height = H;
    canvas.style.width  = W + "px";
    canvas.style.height = H + "px";

    const PAD_LEFT   = 48;
    const PAD_RIGHT  = 16;
    const PAD_TOP    = 24;
    const PAD_BOTTOM = 56;

    const chartW = W - PAD_LEFT - PAD_RIGHT;
    const chartH = H - PAD_TOP  - PAD_BOTTOM;

    const max       = Math.max(...data.map(d => d.cantidad));
    const barCount  = data.length;
    const barGap    = chartW * 0.08;
    const barW      = (chartW - barGap * (barCount + 1)) / barCount;

    // ── Animación ──
    if (graficoAnimFrame) cancelAnimationFrame(graficoAnimFrame);
    const duration  = 700; // ms
    const startTime = performance.now();

    // Estado de hover
    let hoveredIdx = -1;
    canvas.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        hoveredIdx = -1;
        data.forEach((_, i) => {
            const x = PAD_LEFT + barGap * (i + 1) + barW * i;
            if (mx >= x && mx <= x + barW) hoveredIdx = i;
        });
    };
    canvas.onmouseleave = () => { hoveredIdx = -1; };

    function draw(progress) {
        ctx.clearRect(0, 0, W, H);

        // Fondo
        ctx.fillStyle = "transparent";
        ctx.fillRect(0, 0, W, H);

        // Líneas de cuadrícula horizontales
        const gridLines = 4;
        for (let g = 0; g <= gridLines; g++) {
            const y = PAD_TOP + chartH - (g / gridLines) * chartH;
            ctx.beginPath();
            ctx.moveTo(PAD_LEFT, y);
            ctx.lineTo(PAD_LEFT + chartW, y);
            ctx.strokeStyle = g === 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)";
            ctx.lineWidth = g === 0 ? 1.5 : 1;
            ctx.stroke();

            // Etiqueta eje Y
            const val = Math.round((g / gridLines) * max);
            ctx.fillStyle = "rgba(255,255,255,0.35)";
            ctx.font = `${esMobile() ? 9 : 10}px Arial`;
            ctx.textAlign = "right";
            ctx.fillText(val, PAD_LEFT - 6, y + 3.5);
        }

        // Barras
        data.forEach((d, i) => {
            const x         = PAD_LEFT + barGap * (i + 1) + barW * i;
            const fullH     = (d.cantidad / max) * chartH;
            const animH     = fullH * progress;
            const y         = PAD_TOP + chartH - animH;
            const isHovered = hoveredIdx === i;
            const radius    = Math.min(6, barW * 0.25);

            // Sombra glow
            ctx.save();
            ctx.shadowColor = d.color;
            ctx.shadowBlur  = isHovered ? 20 : 10;

            // Gradiente vertical
            const grad = ctx.createLinearGradient(x, y, x, PAD_TOP + chartH);
            grad.addColorStop(0, d.color);
            grad.addColorStop(1, d.color + "55");
            ctx.fillStyle = grad;
            ctx.globalAlpha = isHovered ? 1 : 0.82;

            // Barra con esquinas redondeadas arriba
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + barW - radius, y);
            ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
            ctx.lineTo(x + barW, PAD_TOP + chartH);
            ctx.lineTo(x, PAD_TOP + chartH);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // Valor encima de la barra
            if (progress > 0.6) {
                const alpha = Math.min(1, (progress - 0.6) / 0.4);
                ctx.globalAlpha = alpha;
                ctx.fillStyle = "#fff";
                ctx.font = `bold ${esMobile() ? 11 : 13}px Arial`;
                ctx.textAlign = "center";
                ctx.fillText(d.cantidad, x + barW / 2, y - 6);
                ctx.globalAlpha = 1;
            }

            // Etiqueta eje X
            ctx.fillStyle = isHovered ? "#fff" : "rgba(255,255,255,0.6)";
            ctx.font = `${isHovered ? "bold " : ""}${esMobile() ? 9 : 11}px Arial`;
            ctx.textAlign = "center";
            // Etiqueta abreviada si no cabe
            const label = d.tipo.length > 10 ? d.tipo.split("/")[0].trim() : d.tipo;
            ctx.fillText(label, x + barW / 2, PAD_TOP + chartH + 18);

            // Segunda línea si hay barra (split agresiones)
            if (d.tipo.includes("/")) {
                ctx.fillStyle = isHovered ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)";
                ctx.font = `${esMobile() ? 8 : 9}px Arial`;
                ctx.fillText("/ Amenazas", x + barW / 2, PAD_TOP + chartH + 30);
            }
        });
    }

    function animate(now) {
        const elapsed  = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        draw(eased);
        if (progress < 1 || hoveredIdx !== -1) {
            graficoAnimFrame = requestAnimationFrame(animate);
        }
    }

    // Re-render en hover para que el glow sea reactivo
    canvas.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        hoveredIdx = -1;
        data.forEach((_, i) => {
            const x = PAD_LEFT + barGap * (i + 1) + barW * i;
            if (mx >= x && mx <= x + barW) hoveredIdx = i;
        });
        draw(1);
    };
    canvas.onmouseleave = () => { hoveredIdx = -1; draw(1); };

    graficoAnimFrame = requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
    map.invalidateSize();
    if (vistaActual === "estadisticas") {
        cargarIncidentesBarra();
    }
});

/* ══════════════════════════════════════
   CLICK EN EL MAPA — Obtener Coordenadas
══════════════════════════════════════ */
let popupUbicacion = L.popup();

map.on("click", function (e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    popupUbicacion
        .setLatLng(e.latlng)
        .setContent("<div style='text-align:center;'>Cargando ubicación...</div>")
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
            } else {
                texto = "Sin información de zona";
            }

            const contenido = `
                <div style="text-align: center; font-family: sans-serif; min-width: 150px;">
                    <div style="font-size: 13px; color: #555; margin-bottom: 5px;">📍 Coordenada seleccionada</div>
                    <b>Lat:</b> ${lat.toFixed(5)}<br>
                    <b>Lng:</b> ${lng.toFixed(5)}
                    <hr style="margin: 8px 0; border: 0; border-top: 1px solid #ddd;">
                    ${texto}
                </div>
            `;
            popupUbicacion.setContent(contenido);
        })
        .catch(err => {
            console.error("Error obteniendo ubicación:", err);
            popupUbicacion.setContent("<div style='text-align:center; color:red;'>Error al obtener ubicación</div>");
        });
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
    toast.style.top = "20px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
    toast.style.color = "#fff";
    toast.style.padding = "12px 24px";
    toast.style.borderRadius = "8px";
    toast.style.zIndex = "99999";
    toast.style.fontSize = "0.9rem";
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
    btnAbrirFiltroTiempo.addEventListener("click", () => {
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
