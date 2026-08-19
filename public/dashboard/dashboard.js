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

function setBottomNavActive(view) {
    document.querySelectorAll(".bottom-nav-item").forEach(btn => {
        const active = btn.dataset.view === view;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-current", active ? "page" : "false");
    });
}

function mostrarMapa() {
    panelEst.classList.add("esconder");
    panelMap.classList.remove("esconder");
    vistaActual = "mapa";
    setBottomNavActive("mapa");
    setTimeout(() => map.invalidateSize(), 150);
}

async function mostrarEstadisticas() {
    cerrarPanelFiltros(false);
    panelMap.classList.add("esconder");
    panelEst.classList.remove("esconder");
    vistaActual = "estadisticas";
    setBottomNavActive("estadisticas");
    await cargarResumen();
}

async function cargarResumen() {
    const q = `?fechaDesde=${filtroFechaDesde}&fechaHasta=${filtroFechaHasta}`;
    const res = await fetch(`/resumen${q}`);
    const data = await res.json();
    const total = Number(data.total) || 0;

    document.getElementById("total").textContent = total;

    const pct = (val) => total > 0 ? ((val / total) * 100).toFixed(1) + "%" : "0%";

    document.getElementById("robos").textContent = pct(data.robos);
    document.getElementById("accidentes").textContent = pct(data.accidentes);
    document.getElementById("piques").textContent = pct(data.piques);
    document.getElementById("agresiones").textContent = pct(data.agresiones);

    const resZonas = await fetch(`/top-zonas${q}`);
    const dataZonas = await resZonas.json();

    document.getElementById("topBarrio").textContent =
        dataZonas.barrio ? `${dataZonas.barrio.namebarrio} (${dataZonas.barrio.total})` : "Sin datos";

    document.getElementById("topVereda").textContent =
        dataZonas.vereda ? `${dataZonas.vereda.nombre} (${dataZonas.vereda.total})` : "Sin datos";
}

function irLogin() {
    window.location.href = "/login/index.html";
}

document.getElementById("iniciarSesion").addEventListener("click", irLogin);
document.getElementById("navPerfil").addEventListener("click", irLogin);
document.getElementById("ini").addEventListener("click", mostrarMapa);
document.getElementById("estad").addEventListener("click", mostrarEstadisticas);

document.querySelectorAll(".bottom-nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
        const view = btn.dataset.view;
        if (view === "mapa") {
            mostrarMapa();
        } else if (view === "filtros") {
            mostrarMapa();
            abrirPanelFiltros(true);
        } else if (view === "estadisticas") {
            mostrarEstadisticas();
        } else if (view === "perfil") {
            irLogin();
        }
    });
});

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

L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles © Esri"
}).addTo(map);

let capaIncidentes = L.layerGroup().addTo(map);
let capaBarrio = L.layerGroup().addTo(map);
let capaVereda = L.layerGroup().addTo(map);

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

function cargarIncidentes() {
    capaIncidentes.clearLayers();
    const url = obtenerURL();
    fetch(url)
        .then(res => res.json())
        .then(data => {
            data.forEach(incidente => {
                const marker = L.circleMarker([incidente.lat, incidente.lng], {
                    pane: 'incidentesPane',
                    radius: esMobile() ? 6 : 5,
                    color: obtenerColor(incidente.idtipoincidente),
                    fillColor: obtenerColor(incidente.idtipoincidente),
                    fillOpacity: 0.7
                }).addTo(capaIncidentes);

                // HOVER → mostrar código
                marker.on("mouseover", function () {
                    if (incidente.codigoincidente) {
                        marker.bindTooltip(incidente.codigoincidente, {
                            permanent: false,
                            direction: "top",
                            offset: [0, -10]
                        }).openTooltip();
                    }
                });

                // Salir del punto
                marker.on("mouseout", function () {
                    marker.closeTooltip();
                });

                // CLICK → mostrar detalles
                marker.on("click", function () {
                    const hora = incidente.horaincidente ? incidente.horaincidente.slice(0, 5) : "N/A";
                    const contenido = `
                        <b>Código:</b> ${incidente.codigoincidente || 'N/A'}<br>
                        <b>Tipo:</b> ${incidente.nametipoincidente || 'N/A'}<br>
                        <b>Fecha:</b> ${new Date(incidente.fechaincidente).toLocaleDateString("es-CO", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit"
                        })}<br>
                        <b>Hora:</b> ${hora}<br>
                        <b>Descripción:</b> ${incidente.descripcionincidente || 'Sin descripción'}
                    `;
                    marker.bindPopup(contenido).openPopup();
                });
            });
        })
        .catch(error => console.error("Error:", error));
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
    capaBarrio.clearLayers();
    capaVereda.clearLayers();
    desmarcarTiposInput();
    inpBuscarBarrio.value = "";
    inpBuscarVereda.value = "";
    
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
