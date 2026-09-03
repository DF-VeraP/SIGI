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

    // Reubicación dinámica de la barra de filtros
    const actionsGroup = document.querySelector(".map-actions-group");
    const contenedorTabla = document.getElementById("contenedorAccionesTabla");
    const btnExportarCsv = document.getElementById("btnExportarCsv");

    if (actionsGroup) {
        if (vistaId === "tabla" && contenedorTabla && btnExportarCsv) {
            contenedorTabla.insertBefore(actionsGroup, btnExportarCsv);
        } else {
            const gisTools = document.querySelector(".gis-tools-group");
            if (gisTools && gisTools.parentElement) {
                gisTools.parentElement.insertBefore(actionsGroup, gisTools);
            }
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
    const botonesPaginacion = document.getElementById("botonesPaginacionTabla");

    // Llenar Feed Nativo Móvil si aplica
    renderizarFeedIncidentesMobile();

    if (!tbody) return;
    tbody.innerHTML = "";

    if (!incidentesData || incidentesData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No hay incidentes para mostrar.</td></tr>`;
        if (infoPaginacion) infoPaginacion.textContent = "Mostrando 0 - 0 de 0 incidentes";
        if (botonesPaginacion) botonesPaginacion.innerHTML = "";
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
    const totalPaginas = Math.ceil(totalRegistros / REGISTROS_POR_PAGINA);
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

    // Actualizar info de paginación
    if (infoPaginacion) {
        infoPaginacion.textContent = `Mostrando ${totalRegistros > 0 ? inicio + 1 : 0} - ${fin} de ${totalRegistros} incidentes`;
    }

    // Renderizar botones de paginación
    if (botonesPaginacion) {
        let htmlBotones = '';

        // Botón Anterior
        htmlBotones += `<button class="btn-pag" ${paginaActualTabla === 1 ? 'disabled' : ''} onclick="cambiarPaginaTabla(${paginaActualTabla - 1})"><i class="bi bi-chevron-left"></i> Anterior</button>`;

        // Botones numéricos
        for (let i = 1; i <= totalPaginas; i++) {
            if (i === 1 || i === totalPaginas || (i >= paginaActualTabla - 1 && i <= paginaActualTabla + 1)) {
                htmlBotones += `<button class="btn-pag ${i === paginaActualTabla ? 'activa' : ''}" onclick="cambiarPaginaTabla(${i})">${i}</button>`;
            } else if (i === paginaActualTabla - 2 || i === paginaActualTabla + 2) {
                htmlBotones += `<span class="pag-dots">...</span>`;
            }
        }

        // Botón Siguiente
        htmlBotones += `<button class="btn-pag" ${paginaActualTabla === totalPaginas ? 'disabled' : ''} onclick="cambiarPaginaTabla(${paginaActualTabla + 1})">Siguiente <i class="bi bi-chevron-right"></i></button>`;

        botonesPaginacion.innerHTML = htmlBotones;
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

        let iconClass = "bi-exclamation-triangle-fill";
        let colorClass = "#38bdf8";
        let badgeBg = "rgba(56, 189, 248, 0.15)";

        if (inc.idtipoincidente === 1) { // Robo
            iconClass = "bi-shield-exclamation";
            colorClass = "#ff4d4d";
            badgeBg = "rgba(255, 77, 77, 0.15)";
        } else if (inc.idtipoincidente === 2) { // Agresión
            iconClass = "bi-person-badge-fill";
            colorClass = "#f59e0b";
            badgeBg = "rgba(245, 158, 11, 0.15)";
        } else if (inc.idtipoincidente === 3) { // Pique
            iconClass = "bi-lightning-charge-fill";
            colorClass = "#a855f7";
            badgeBg = "rgba(168, 85, 247, 0.15)";
        } else if (inc.idtipoincidente === 4) { // Accidente
            iconClass = "bi-car-front-fill";
            colorClass = "#10b981";
            badgeBg = "rgba(16, 185, 129, 0.15)";
        }

        const card = document.createElement("div");
        card.className = "mobile-incident-card";
        card.innerHTML = `
            <div class="mic-header">
                <div class="mic-type-badge">
                    <div class="mic-icon-box" style="background: ${badgeBg}; color: ${colorClass};">
                        <i class="bi ${iconClass}"></i>
                    </div>
                    <span>${tipoName}</span>
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
    const zona = inc.namebarrio || inc.nombrevereda || 'Sin zona';

    let badgeClass = "badge-default";
    if (inc.idtipoincidente === 1) badgeClass = "badge-robo";
    if (inc.idtipoincidente === 2) badgeClass = "badge-agresion";
    if (inc.idtipoincidente === 3) badgeClass = "badge-pique";
    if (inc.idtipoincidente === 4) badgeClass = "badge-accidente";

    cuerpo.innerHTML = `
        <div class="detalle-grid">
            <div class="detalle-item">
                <span class="detalle-label"><i class="bi bi-hash"></i> Código</span>
                <span class="detalle-valor"><strong>${inc.codigoincidente || 'N/A'}</strong></span>
            </div>
            <div class="detalle-item">
                <span class="detalle-label"><i class="bi bi-tag"></i> Tipo</span>
                <span class="detalle-valor"><span class="badge-tipo ${badgeClass}">${inc.nametipoincidente || 'N/A'}</span></span>
            </div>
            <div class="detalle-item">
                <span class="detalle-label"><i class="bi bi-geo-alt"></i> Zona / Ubicación</span>
                <span class="detalle-valor">${zona}</span>
            </div>
            <div class="detalle-item">
                <span class="detalle-label"><i class="bi bi-calendar3"></i> Fecha</span>
                <span class="detalle-valor">${fecha}</span>
            </div>
            <div class="detalle-item">
                <span class="detalle-label"><i class="bi bi-clock"></i> Hora del Incidente</span>
                <span class="detalle-valor">${hora}</span>
            </div>
            <div class="detalle-item full-width">
                <span class="detalle-label"><i class="bi bi-card-text"></i> Descripción</span>
                <p class="detalle-descripcion">${inc.descripcionincidente || 'Sin descripción detallada.'}</p>
            </div>
        </div>
    `;

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

    sidebar.addEventListener("mouseleave", () => {
        sidebar.classList.remove("hover-disabled");
        setTimeout(reajustarMapaSeguro, 350);
    });

    sidebar.addEventListener("mouseenter", () => {
        setTimeout(reajustarMapaSeguro, 350);
    });

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
                sidebar.classList.add("hover-disabled");
            } else {
                icono.classList.replace("bi-chevron-right", "bi-chevron-left");
                sidebar.classList.remove("hover-disabled");
            }
        }

        setTimeout(reajustarMapaSeguro, 350);
    });
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
    let csv = "Código,Tipo,Zona,Fecha,Hora\n";
    incidentesData.forEach(inc => {
        const fecha = new Date(inc.fechaincidente).toLocaleDateString("es-CO");
        const hora = inc.horaincidente ? inc.horaincidente.slice(0, 5) : "N/A";
        const zona = inc.namebarrio || inc.nombrevereda || "Sin zona";
        csv += `${inc.codigoincidente || 'N/A'},${inc.nametipoincidente || 'N/A'},${zona},${fecha},${hora}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "incidentes.csv";
    a.click();
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
                color: '#00d2ff',
                fillColor: '#00d2ff',
                fillOpacity: 0.15,
                weight: 1.5,
                dashArray: '4, 6'
            }).addTo(map);

            // Marcador del usuario
            marcadorUsuario = L.marker([lat, lng], { icon: userIcon })
                .addTo(map)
                .bindPopup(`
                    <div style="font-family: system-ui; padding: 4px;">
                        <strong style="color: #00d2ff;">📍 Tu ubicación actual</strong><br>
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

    // --- RENDERING TOP 10 ZONAS CRÍTICAS ---
    const sortedBarrios = Object.entries(conteoBarrio)
        .sort((a, b) => b[1] - a[1]) // Mayor a menor
        .slice(0, 10); // Top 10
        
    const topZonasList = document.getElementById("topZonasList");
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
                            <span class="zona-rank">#${index + 1}</span>
                            <span class="zona-name">${barrio}</span>
                        </div>
                        <span class="zona-count"><i class="bi bi-exclamation-circle-fill"></i> ${count} incidentes</span>
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
                        '#ef4444',
                        '#f59e0b',
                        '#a855f7',
                        '#ec4899'
                    ],
                    borderColor: '#0d1117',
                    borderWidth: 3,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#c9d1d9',
                            font: { size: 12, family: "'Outfit', sans-serif" },
                            padding: 14,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(13, 17, 23, 0.95)',
                        titleColor: '#00d2ff',
                        bodyColor: '#ffffff',
                        borderColor: '#30363d',
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
                    const ratio = maxHeatmap > 0 ? (val / maxHeatmap) : 0;
                    if (ratio <= 0.33) {
                        cell.style.backgroundColor = 'rgba(0, 210, 255, 0.75)';
                        cell.style.boxShadow = '0 0 6px rgba(0, 210, 255, 0.3)';
                    } else if (ratio <= 0.66) {
                        cell.style.backgroundColor = 'rgba(245, 158, 11, 0.85)';
                        cell.style.boxShadow = '0 0 8px rgba(245, 158, 11, 0.4)';
                    } else {
                        cell.style.backgroundColor = 'rgba(239, 68, 68, 0.95)';
                        cell.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.6)';
                    }
                    cell.style.color = '#000000';
                    cell.style.fontWeight = '700';
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
    if (typeof inpBuscarLugar !== 'undefined' && inpBuscarLugar && inpBuscarLugar.value.trim()) count++;
    return count;
}

function actualizarBadgeFiltros() {
    const count = contarFiltrosActivos();
    badgeFiltros.textContent = count;
    badgeFiltros.classList.toggle("visible", count > 0);
}

function abrirPanelFiltros(desdeNav = false) {
    if (panelFiltros) {
        panelFiltros.classList.add("abierto");
        panelFiltros.setAttribute("aria-hidden", "false");
    }
    if (panelMap) {
        panelMap.classList.add("filtros-abiertos");
    }
    if (filtrosOverlay) {
        filtrosOverlay.classList.add("visible");
        filtrosOverlay.setAttribute("aria-hidden", "false");
    }

    if (esMobile() && desdeNav) {
        setBottomNavActive("filtros");
    }
}

function cerrarPanelFiltros(actualizarNav = true) {
    /* El foco debe salir del panel antes de marcarlo como aria-hidden */
    if (panelFiltros && panelFiltros.contains(document.activeElement) && btnFiltros) {
        btnFiltros.focus();
    }

    if (panelFiltros) {
        panelFiltros.classList.remove("abierto");
        panelFiltros.setAttribute("aria-hidden", "true");
    }
    if (panelMap) {
        panelMap.classList.remove("filtros-abiertos");
    }
    if (filtrosOverlay) {
        filtrosOverlay.classList.remove("visible");
        filtrosOverlay.setAttribute("aria-hidden", "true");
    }
    if (btnFiltros) {
        btnFiltros.style.display = "";
    }

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
                    <div class="popup-card">
                        <div class="popup-card-header">
                            <span class="popup-badge ${tipoClase}">${incidente.nametipoincidente || 'Incidente'}</span>
                            <span class="popup-code">${incidente.codigoincidente || 'N/A'}</span>
                        </div>
                        
                        <div class="popup-location-box">
                            <i class="bi bi-geo-alt-fill popup-loc-icon"></i>
                            <div class="popup-loc-text">
                                <span class="popup-loc-label">Zona / Barrio</span>
                                <strong class="popup-loc-name">${incidente.namebarrio || incidente.nombrevereda || 'Sin zona asignada'}</strong>
                            </div>
                        </div>

                        <div class="popup-grid-2x2">
                            <div class="popup-grid-item">
                                <span class="pg-label"><i class="bi bi-calendar3"></i> Fecha</span>
                                <span class="pg-val">${fecha}</span>
                            </div>
                            <div class="popup-grid-item">
                                <span class="pg-label"><i class="bi bi-clock"></i> Hora</span>
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
                marker.bindPopup(contenido, {
                    className: 'custom-popup-container',
                    minWidth: 260,
                    autoPanPaddingTopLeft: L.point(20, 90),
                    autoPanPaddingBottomRight: L.point(20, 20)
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

// ════════════════════════════════
// LÓGICA DE MI UBICACIÓN EN TIEMPO REAL
// ════════════════════════════════
let miUbicacionMarker = null;
let miUbicacionCircle = null;

const btnMiUbicacion = document.getElementById("btnMiUbicacion");
if (btnMiUbicacion) {
    btnMiUbicacion.addEventListener("click", () => {
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
                    color: '#38bdf8',
                    fillColor: '#38bdf8',
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
                            <i class="bi bi-geo-alt-fill" style="color: #38bdf8; font-size: 1.1rem;"></i>
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

                        <div style="font-size: 0.72rem; color: #94a3b8; display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.03); padding: 6px 10px; border-radius: 8px;">
                            <span style="display: flex; align-items: center; gap: 5px;">
                                <i class="bi bi-bullseye" style="color: #38bdf8;"></i> Precisión:
                            </span>
                            <strong style="color: #e2e8f0;">±${accuracy} metros</strong>
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

    if(elZona) elZona.innerHTML = maxZona !== "N/A" ? `${maxZona} <span style="font-size: 0.7em; font-weight: normal; color: var(--secundario, #94a3b8); margin-left: 4px;">- ${maxZonaCount} incidente${maxZonaCount === 1 ? '' : 's'}</span>` : "Sin zona";
    let tipoColor = "gray";
    if (maxTipo.toLowerCase().includes("robo")) tipoColor = "red";
    else if (maxTipo.toLowerCase().includes("agresion") || maxTipo.toLowerCase().includes("amenaza")) tipoColor = "yellow";
    else if (maxTipo.toLowerCase().includes("pique")) tipoColor = "magenta";
    else if (maxTipo.toLowerCase().includes("accidente")) tipoColor = "limegreen";
    if(elTipo) elTipo.innerHTML = maxTipo !== "N/A" ? `<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${tipoColor}; margin-right:4px;"></span>${maxTipo}` : "---";
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
            elVariacion.innerHTML = `${countRecent > 0 ? "↑" : ""} ${countRecent > 0 ? "100%" : "0%"} <span style="font-size: 0.55em; font-weight: normal; color: var(--secundario, #94a3b8); margin-left: 5px;">vs. mes anterior</span>`;
            elVariacion.className = "kpi-valor " + (countRecent > 0 ? "kpi-variacion-negativa" : ""); // Aumento de crimen = negativo (rojo)
        } else {
            const pct = Math.round(((countRecent - countPrevious) / countPrevious) * 100);
            const symbol = pct > 0 ? "↑" : (pct < 0 ? "↓" : "");
            elVariacion.innerHTML = `${symbol} ${Math.abs(pct)}% <span style="font-size: 0.55em; font-weight: normal; color: var(--secundario, #94a3b8); margin-left: 5px;">vs. mes anterior</span>`;
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
    cerrarPanelFiltros();
});

document.querySelector(".restablecer").addEventListener("click", function () {
    capaIncidentes.clearLayers();
    heatLayer.setLatLngs([]);
    capaBarrio.clearLayers();
    capaVereda.clearLayers();
    desmarcarTiposInput();
    if (typeof inpBuscarLugar !== "undefined" && inpBuscarLugar) inpBuscarLugar.value = "";
    lugarSeleccionado = { nombre: "", tipo: "" };
    
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


if (inpBuscarLugar) {
    inpBuscarLugar.addEventListener("input", async function () {
        this.after(contenedor);
        actualizarBadgeFiltros();
        const texto = this.value;
        if (texto.length < 2) {
            contenedor.innerHTML = "";
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
            sugerencias.forEach(item => {
                const div = document.createElement("div");
                div.innerHTML = `${item.nombre} <small style="color:var(--secundario); font-size:10px;">(${item.tipo})</small>`;
                div.classList.add("itemSugerencia");
                div.addEventListener("click", function () {
                    inpBuscarLugar.value = item.nombre;
                    lugarSeleccionado = item;
                    contenedor.innerHTML = "";
                    actualizarBadgeFiltros();
                });
                contenedor.appendChild(div);
            });
        } catch(e) {
            console.error(e);
        }
    });
}


let graficoAnimFrame = null;

async function cargarIncidentesBarra() {
    const q = `?fechaDesde=${filtroFechaDesde}&fechaHasta=${filtroFechaHasta}`;
    const res = await fetch(`/top-incidentes${q}`);
    const data = await res.json();
    if (!data.length) return;

    const canvas = document.getElementById("graficoBarras");
    if (!canvas) return;
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
            return { border: '#ef4444', fillStart: 'rgba(239, 68, 68, 0.12)', fillEnd: 'rgba(239, 68, 68, 0.45)' };
        } else if (t.includes('accidente') || t.includes('tránsito') || t.includes('transito')) {
            return { border: '#f59e0b', fillStart: 'rgba(245, 158, 11, 0.12)', fillEnd: 'rgba(245, 158, 11, 0.45)' };
        } else if (t.includes('pique')) {
            return { border: '#a855f7', fillStart: 'rgba(168, 85, 247, 0.12)', fillEnd: 'rgba(168, 85, 247, 0.45)' };
        } else if (t.includes('agresi') || t.includes('amenaza')) {
            return { border: '#ec4899', fillStart: 'rgba(236, 72, 153, 0.12)', fillEnd: 'rgba(236, 72, 153, 0.45)' };
        }
        const base = colorBackend || '#00d2ff';
        return { border: base, fillStart: 'rgba(0, 210, 255, 0.12)', fillEnd: 'rgba(0, 210, 255, 0.45)' };
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
                    titleColor: '#00d2ff',
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
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: '#8b949e',
                        font: { size: 11, family: "'Outfit', sans-serif" },
                        stepSize: 1
                    },
                    beginAtZero: true,
                    border: { display: false }
                },
                y: {
                    grid: { display: false },
                    ticks: {
                        color: '#ffffff',
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
});
