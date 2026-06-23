let tiposId = [];

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
    const res = await fetch("/resumen");
    const data = await res.json();
    const total = Number(data.total) || 0;

    document.getElementById("total").textContent = total;

    const pct = (val) => total > 0 ? ((val / total) * 100).toFixed(1) + "%" : "0%";

    document.getElementById("robos").textContent = pct(data.robos);
    document.getElementById("accidentes").textContent = pct(data.accidentes);
    document.getElementById("piques").textContent = pct(data.piques);
    document.getElementById("agresiones").textContent = pct(data.agresiones);

    const resZonas = await fetch("/top-zonas");
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
    return url;
}

function cargarIncidentes() {
    capaIncidentes.clearLayers();
    const url = obtenerURL();
    fetch(url)
        .then(res => res.json())
        .then(data => {
            data.forEach(incidente => {
                L.circleMarker([incidente.lat, incidente.lng], {
                    radius: esMobile() ? 6 : 5,
                    color: obtenerColor(incidente.idtipoincidente),
                    fillColor: obtenerColor(incidente.idtipoincidente),
                    fillOpacity: 0.7
                }).addTo(capaIncidentes);
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
    cargarBarrio();
    cargarIncidentes();
    cargarVeredas();
    resetMapa();
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
    const res = await fetch("/top-incidentes");
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

cargarIncidentesBarra();
cargarVeredas();
cargarBarrio();
cargarIncidentes();
actualizarBadgeFiltros();
