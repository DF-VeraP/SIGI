// Control de Sidebar Vertical (Admin / Superadmin)
const adminSidebar = document.getElementById("adminSidebar");
const btnToggleSidebarAdmin = document.getElementById("btnToggleSidebarAdmin");

function reajustarMapasAdmin() {
    if (typeof map !== 'undefined' && map) map.invalidateSize();
    if (typeof map2 !== 'undefined' && map2) map2.invalidateSize();
}

if (btnToggleSidebarAdmin && adminSidebar) {
    // Restaurar preferencia persistida de colapso
    const estabaColapsada = localStorage.getItem("sigi_admin_sidebar_colapsada") === "true";
    if (estabaColapsada) {
        adminSidebar.classList.add("colapsada");
        const iconoToggle = btnToggleSidebarAdmin.querySelector("i");
        if (iconoToggle) iconoToggle.className = "bi bi-chevron-right";
    }

    btnToggleSidebarAdmin.addEventListener("click", () => {
        const estaColapsada = adminSidebar.classList.toggle("colapsada");
        const iconoToggle = btnToggleSidebarAdmin.querySelector("i");
        if (iconoToggle) {
            iconoToggle.className = estaColapsada ? "bi bi-chevron-right" : "bi bi-chevron-left";
        }
        localStorage.setItem("sigi_admin_sidebar_colapsada", estaColapsada ? "true" : "false");
        setTimeout(reajustarMapasAdmin, 360);
    });

    adminSidebar.addEventListener("transitionend", (e) => {
        if (e.propertyName === "width") {
            reajustarMapasAdmin();
        }
    });
}

// Botones de navegación activa en Sidebar y Móvil
document.querySelectorAll(".admin-sidebar .sidebar-nav button, header nav button:not(.toggle-iphone-header)").forEach(btn => {
    btn.addEventListener("click", function () {
        document.querySelectorAll(".admin-sidebar .sidebar-nav button, header nav button:not(.toggle-iphone-header)").forEach(b => {
            b.classList.remove("pintarBotonNav");
        });
        btn.classList.add("pintarBotonNav");
    });
});

// Toggle Tema Claro / Oscuro Header (Tipo iPhone) - Escritorio y Móvil
const btnTemaHeader = document.getElementById("btnTemaHeader");
const btnTemaHeaderMobile = document.getElementById("btnTemaHeaderMobile");

function alternarTemaAdmin(e) {
    if (e) e.stopPropagation();
    document.body.classList.toggle("tema-claro");
    document.documentElement.classList.toggle("tema-claro");
    const esClaro = document.body.classList.contains("tema-claro");
    const nuevoTema = esClaro ? "claro" : "oscuro";
    localStorage.setItem("tema_sigi_admin", nuevoTema);
    localStorage.setItem("tema_sigi_dashboard", nuevoTema);
    if (typeof btnVerMapa !== "undefined" && btnVerMapa && !btnVerMapa.classList.contains("activo")) {
        btnVerMapa.style.background = "";
        btnVerMapa.style.color = "";
    }
}

const temaGuardadoAdmin = localStorage.getItem("tema_sigi_admin") || localStorage.getItem("tema_sigi_dashboard");
if (temaGuardadoAdmin === "claro") {
    document.body.classList.add("tema-claro");
    document.documentElement.classList.add("tema-claro");
}
if (btnTemaHeader) btnTemaHeader.addEventListener("click", alternarTemaAdmin);
if (btnTemaHeaderMobile) btnTemaHeaderMobile.addEventListener("click", alternarTemaAdmin);

// Menú Hamburguesa Responsivo en Móvil
const btnHamburguesa = document.getElementById("btnHamburguesa");
const navHeaderMenu = document.getElementById("navHeaderMenu");
const iconoHamburguesa = document.getElementById("iconoHamburguesa");

if (btnHamburguesa && navHeaderMenu) {
    btnHamburguesa.addEventListener("click", function (e) {
        e.stopPropagation();
        const estaAbierto = navHeaderMenu.classList.toggle("abierto");
        btnHamburguesa.classList.toggle("activo", estaAbierto);
        if (iconoHamburguesa) {
            iconoHamburguesa.className = estaAbierto ? "bi bi-x-lg" : "bi bi-list";
        }
    });

    // Cerrar menú al hacer clic en cualquier opción
    navHeaderMenu.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", () => {
            if (window.innerWidth <= 820) {
                navHeaderMenu.classList.remove("abierto");
                btnHamburguesa.classList.remove("activo");
                if (iconoHamburguesa) iconoHamburguesa.className = "bi bi-list";
            }
        });
    });

    // Cerrar si se hace clic fuera del menú
    document.addEventListener("click", function (e) {
        if (window.innerWidth <= 820 && !e.target.closest("header")) {
            navHeaderMenu.classList.remove("abierto");
            btnHamburguesa.classList.remove("activo");
            if (iconoHamburguesa) iconoHamburguesa.className = "bi bi-list";
        }
    });
}

// Lógica para desplegar / colapsar filtros en el panel de incidentes (Verificación)
const btnToggleFiltros = document.getElementById("btnToggleFiltrosIncidentes");
const headerFiltros = document.getElementById("headerFiltrosIncidentes");
const cuerpoFiltros = document.getElementById("cuerpoFiltrosIncidentes");
const iconoDesplegar = document.getElementById("iconoDesplegarFiltros");

if (btnToggleFiltros && cuerpoFiltros) {
    btnToggleFiltros.addEventListener("click", (e) => {
        e.stopPropagation();
        const estaColapsado = cuerpoFiltros.classList.toggle("colapsado");
        btnToggleFiltros.classList.toggle("rotado", !estaColapsado);
        if (iconoDesplegar) {
            iconoDesplegar.className = estaColapsado ? "bi bi-chevron-down" : "bi bi-chevron-up";
        }
    });
}


function cambiarPestana(pestañaNombre) {
    const contMain = document.querySelector(".contMain");
    const secUsuarios = document.getElementById("secUsuarios");
    const secAuditoria = document.getElementById("secAuditoria");
    const secTiposIncidentes = document.getElementById("secTiposIncidentes");
    const secPerfil = document.getElementById("secPerfil");

    // Sincronizar resaltado de botones de navegación (Sidebar y Móvil)
    document.querySelectorAll(".admin-sidebar .sidebar-nav button, header nav button:not(.toggle-iphone-header)").forEach(b => {
        b.classList.remove("pintarBotonNav");
    });
    if (pestañaNombre === 'inicio') {
        document.getElementById("btnInicio")?.classList.add("pintarBotonNav");
        document.getElementById("btnInicioMobile")?.classList.add("pintarBotonNav");
    } else if (pestañaNombre === 'verif') {
        document.getElementById("btnVerif")?.classList.add("pintarBotonNav");
        document.getElementById("btnVerifMobile")?.classList.add("pintarBotonNav");
    } else if (pestañaNombre === 'usuarios') {
        document.getElementById("btnUsuarios")?.classList.add("pintarBotonNav");
        document.getElementById("btnUsuariosMobile")?.classList.add("pintarBotonNav");
    } else if (pestañaNombre === 'auditoria') {
        document.getElementById("btnAuditoria")?.classList.add("pintarBotonNav");
        document.getElementById("btnAuditoriaMobile")?.classList.add("pintarBotonNav");
    } else if (pestañaNombre === 'tipos') {
        document.getElementById("btnTiposIncidentes")?.classList.add("pintarBotonNav");
        document.getElementById("btnTiposIncidentesMobile")?.classList.add("pintarBotonNav");
    } else if (pestañaNombre === 'perfil') {
        document.getElementById("btnPerfil")?.classList.add("pintarBotonNav");
        document.getElementById("btnPerfilMobile")?.classList.add("pintarBotonNav");
    }

    if (pestañaNombre === 'inicio' || pestañaNombre === 'verif') {
        if (secUsuarios) secUsuarios.style.display = 'none';
        if (secAuditoria) secAuditoria.style.display = 'none';
        if (secTiposIncidentes) secTiposIncidentes.style.display = 'none';
        if (secPerfil) secPerfil.style.display = 'none';

        if (contMain) {
            contMain.style.display = "flex";
            contMain.style.width = "200%";
        }

        const secInicio = document.querySelector(".inicio");
        if (pestañaNombre === 'inicio') {
            if (secInicio) secInicio.style.visibility = "visible";
            if (contMain) contMain.style.transform = "translateX(0%)";
            setTimeout(() => {
                if (typeof map !== 'undefined') map.invalidateSize();
                if (typeof map2 !== 'undefined') map2.invalidateSize();
            }, 300);
        } else if (pestañaNombre === 'verif') {
            if (contMain) contMain.style.transform = "translateX(-50%)";
            if (secInicio) {
                if (window.innerWidth <= 820) {
                    secInicio.style.visibility = "hidden";
                } else {
                    setTimeout(() => {
                        if (contMain && contMain.style.transform.includes("-50%")) {
                            secInicio.style.visibility = "hidden";
                        }
                    }, 280);
                }
            }
        }
    } else {
        const secInicio = document.querySelector(".inicio");
        if (secInicio) secInicio.style.visibility = "hidden";
        if (contMain) contMain.style.display = "none";

        if (secUsuarios) {
            secUsuarios.style.display = pestañaNombre === 'usuarios' ? 'block' : 'none';
        }
        if (secAuditoria) {
            secAuditoria.style.display = pestañaNombre === 'auditoria' ? 'block' : 'none';
        }
        if (secTiposIncidentes) {
            secTiposIncidentes.style.display = pestañaNombre === 'tipos' ? 'block' : 'none';
        }
        if (secPerfil) {
            secPerfil.style.display = pestañaNombre === 'perfil' ? 'block' : 'none';
        }
    }

    if (pestañaNombre === 'usuarios') cargarUsuarios();
    if (pestañaNombre === 'auditoria') cargarAuditoriaLogs();
    if (pestañaNombre === 'tipos') cargarTiposIncidentes();
    if (pestañaNombre === 'perfil') cargarDatosPerfil();
}

window.addEventListener("resize", () => {
    if (typeof map !== 'undefined' && map) map.invalidateSize();
    if (typeof map2 !== 'undefined' && map2) map2.invalidateSize();
});

// Event listeners de navegación (Escritorio)
document.getElementById("btnInicio")?.addEventListener("click", () => cambiarPestana('inicio'));
document.getElementById("btnVerif")?.addEventListener("click", () => cambiarPestana('verif'));

const btnUsuariosEl = document.getElementById("btnUsuarios");
if (btnUsuariosEl) btnUsuariosEl.addEventListener("click", () => cambiarPestana('usuarios'));

const btnAuditoriaEl = document.getElementById("btnAuditoria");
if (btnAuditoriaEl) btnAuditoriaEl.addEventListener("click", () => cambiarPestana('auditoria'));

const btnTiposIncidentesEl = document.getElementById("btnTiposIncidentes");
if (btnTiposIncidentesEl) btnTiposIncidentesEl.addEventListener("click", () => cambiarPestana('tipos'));

const btnPerfilEl = document.getElementById("btnPerfil");
if (btnPerfilEl) btnPerfilEl.addEventListener("click", () => cambiarPestana('perfil'));

document.getElementById("contenedorUsuarioHeader")?.addEventListener("click", () => cambiarPestana('perfil'));

// Event listeners de navegación (Móvil)
document.getElementById("btnInicioMobile")?.addEventListener("click", () => cambiarPestana('inicio'));
document.getElementById("btnVerifMobile")?.addEventListener("click", () => cambiarPestana('verif'));
document.getElementById("btnUsuariosMobile")?.addEventListener("click", () => cambiarPestana('usuarios'));
document.getElementById("btnAuditoriaMobile")?.addEventListener("click", () => cambiarPestana('auditoria'));
document.getElementById("btnTiposIncidentesMobile")?.addEventListener("click", () => cambiarPestana('tipos'));
document.getElementById("btnPerfilMobile")?.addEventListener("click", () => cambiarPestana('perfil'));
document.getElementById("btnReportePDFMobile")?.addEventListener("click", (e) => {
    e.preventDefault();
    abrirVisorPDF();
});
document.getElementById("cerrarSesionMobile")?.addEventListener("click", () => {
    window.location.href = "/logout";
});

// --- SISTEMA DE TOASTS ---
function mostrarToast(mensaje, tipo = "info") {
    let contenedor = document.getElementById("contenedorToast");
    if (!contenedor) {
        contenedor = document.createElement("div");
        contenedor.id = "contenedorToast";
        document.body.appendChild(contenedor);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${tipo}`;
    
    // Iconos según el tipo
    let icono = "bi-info-circle-fill";
    if (tipo === "exito") icono = "bi-check-circle-fill";
    if (tipo === "error") icono = "bi-x-circle-fill";

    toast.innerHTML = `<i class="bi ${icono}"></i><span>${mensaje}</span>`;
    
    contenedor.appendChild(toast);

    // Animación de entrada
    setTimeout(() => {
        toast.classList.add("mostrar");
    }, 10);

    // Auto eliminar
    setTimeout(() => {
        toast.classList.remove("mostrar");
        setTimeout(() => {
            toast.remove();
        }, 400); // Tiempo de la transición CSS
    }, 4000);
}

// Crear el mapa
const map = L.map('map').setView([1.6144, -75.6062], 13); // Florencia aprox
let capaBarrio1 = L.layerGroup().addTo(map);
let capaVereda1 = L.layerGroup().addTo(map);


const map2 = L.map('mapa2').setView([1.6144, -75.6062], 13); // Florencia aprox

// Crear paneles personalizados en map2 para asegurar que los incidentes queden sobre los polígonos
map2.createPane('poligonosPane');
map2.getPane('poligonosPane').style.zIndex = 400;

map2.createPane('incidentesPane');
map2.getPane('incidentesPane').style.zIndex = 450;

//  Definir capas (NO recrearlas cada vez)
// Modo oscuro real con CartoDB Dark Matter (evita bloqueo 403 de OSM)
const capaOscura = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
});

const capaSatelital = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri'
});

const capaSatelital2 = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri'
});


// Agregar capa inicial: primero se muestra la vista satelital
capaSatelital.addTo(map);

//  Funciones de cambio (sin borrar todo)
function activarMapaOscuro() {
    map.removeLayer(capaSatelital);
    capaOscura.addTo(map);
}

function activarMapaSatelital() {
    map.removeLayer(capaOscura);
    capaSatelital.addTo(map);
}

capaSatelital2.addTo(map2);
let capaBarrio = L.layerGroup().addTo(map2);
let capaIncidentes = L.layerGroup().addTo(map2);
let capaVereda = L.layerGroup().addTo(map2);

function cargarBarrio() {
    capaBarrio.clearLayers();
    fetch("/poligonoBarrio")
        .then(res => res.json())
        .then(data => {
            let capaGeoJSON = L.geoJSON(null, {
                pane: 'poligonosPane',
                style: {
                    color: "white",
                    fillColor: "black",
                    weight: 0.5,
                    fillOpacity: 0.4
                }
            });
            data.forEach(barrio => {
                const geoJson = JSON.parse(barrio.geom);
                capaGeoJSON.addData(geoJson);
            });
            capaGeoJSON.addTo(capaBarrio);
            //  ZOOM AUTOMÁTICO
            if (data.length > 0) {
                map.fitBounds(capaGeoJSON.getBounds());
            }
        });
}
cargarBarrio();

function cargarVeredas() {
    capaVereda.clearLayers();
    fetch(`/poligonoVereda`)
        .then(res => res.json())
        .then(data => {
            let capaGeoJSON = L.geoJSON(null, {
                pane: 'poligonosPane',
                style: {
                    color: "blue",
                    fillColor: "black",
                    weight: 0.9,
                    fillOpacity: 0.4
                },
                onEachFeature: function (feature, layer) {
                    const desc = "Vereda: " + feature.properties.nombre + "<br>Corregimiento: " + feature.properties.corregimiento;
                    layer.bindPopup(desc);
                }
            });
            data.forEach(vereda => {
                const geometry = JSON.parse(vereda.geom);
                const feature = {
                    type: "Feature",
                    geometry: geometry,
                    properties: {
                        nombre: vereda.nombre,
                        corregimiento: vereda.namecorregimiento
                    }
                };
                capaGeoJSON.addData(feature);
            });
            capaGeoJSON.addTo(capaVereda);
        });
};

cargarVeredas();

let catalogoTiposMap = {};

function obtenerColor(tipo) {
    const tipoId = parseInt(tipo);
    if (catalogoTiposMap && catalogoTiposMap[tipoId] && catalogoTiposMap[tipoId].color) {
        return catalogoTiposMap[tipoId].color;
    }
    if (tipoId === 1) return "#ef4444";
    if (tipoId === 2) return "#f59e0b";
    if (tipoId === 3) return "#8b5cf6";
    if (tipoId === 4) return "#10b981";
    return "#3b82f6";
}
// Renderiza marcadores en el mapa de verificación con los datos recibidos
function renderMapa(data) {
    capaIncidentes.clearLayers();
    data.forEach(incidente => {
        // Algunos endpoints devuelven lat/lng como string
        const lat = parseFloat(incidente.lat);
        const lng = parseFloat(incidente.lng);
        if (isNaN(lat) || isNaN(lng)) return;

        const marker = L.circleMarker([lat, lng], {
            pane: 'incidentesPane',
            radius: 5,
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

        marker.on("click", function () {
            const contenido = `
                <b>Código:</b> ${incidente.codigoincidente}<br>
                <b>Tipo:</b> ${incidente.nametipoincidente}<br>
                <b>Fecha:</b> ${new Date(incidente.fechaincidente).toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit"
                })}<br>
                <b>Hora:</b> ${incidente.horaincidente.slice(0, 5)}<br>
                <b>Descripción:</b> ${incidente.descripcionincidente || 'Sin descripción'}
            `;
            marker.bindPopup(contenido).openPopup();
        });
    });
}

function cargarIncidentes() {
    cargarTabla();
}
//  Ubicación en tiempo real (persistente)
let marcadorUsuario;
let circuloUsuario;

function ubicacionTiempoReal() {
    navigator.geolocation.watchPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;

        const nuevaPos = [lat, lng];

        // marcador
        if (marcadorUsuario) {
            marcadorUsuario.setLatLng(nuevaPos);
        } else {
            marcadorUsuario = L.marker(nuevaPos)
                .addTo(map)
        }

        // círculo de precisión
        if (circuloUsuario) {
            circuloUsuario.setLatLng(nuevaPos);
            circuloUsuario.setRadius(accuracy);
        } else {
            circuloUsuario = L.circle(nuevaPos, {
                radius: accuracy,
                color: 'blue',
                fillColor: 'blue',
                fillOpacity: 0.2
            }).addTo(map);
        }

    }, (err) => {
        console.log("Error ubicación:", err);
    }, {
        enableHighAccuracy: true
    });
}

ubicacionTiempoReal();

const bolita = document.querySelector(".btnClaroNoche div");
const btnbolita = document.querySelector(".btnClaroNoche");

if (btnbolita) {
    if (typeof L !== "undefined" && L.DomEvent) {
        L.DomEvent.disableClickPropagation(btnbolita);
        L.DomEvent.disableScrollPropagation(btnbolita);
    }
    btnbolita.addEventListener("click", function (e) {
        e.stopPropagation();
        // Si ya está activo en modo oscuro, volver a satelital
        if (bolita.classList.contains("colorBolita")) {
            btnbolita.classList.remove("colorBolita");
            bolita.classList.remove("colorBolita");
            bolita.style.transform = "translateX(0)";
            activarMapaSatelital();
            console.log("modo satelital activo");
        } else {
            // Pasar a modo oscuro
            btnbolita.classList.add("colorBolita");
            bolita.classList.add("colorBolita");
            bolita.style.transform = "translateX(1.5em)";
            activarMapaOscuro();
            console.log("modo oscuro activo");
        }
    });
}

let marcadorClick = null;

function manejarClickMapa(e) {
    // Si el clic proviene de elementos de la interfaz dentro del mapa, ignorar
    if (e.originalEvent && e.originalEvent.target) {
        if (e.originalEvent.target.closest("#contenedorBusquedaMapa") || e.originalEvent.target.closest(".btnClaroNoche") || e.originalEvent.target.closest(".leaflet-control")) {
            return;
        }
    }

    // Ocultar sugerencias si estuvieran abiertas
    const sug = document.getElementById("sugerenciasMapa");
    if (sug) {
        sug.style.display = "none";
    }

    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    // llenar inputs
    document.getElementById("latitud").value = lat;
    document.getElementById("longitud").value = lng;

    if (marcadorClick) {
        marcadorClick.setLatLng([lat, lng]); // mueve el existente
    } else {
        marcadorClick = L.circleMarker([lat, lng], {
            radius: 3,
            color: "black",
            fillColor: "red",
            fillOpacity: 1
        }).addTo(map);
    }

    // 🔥 consultar barrio
    try {
        fetch(`/buscarBarrioPorCoordenada?lat=${lat}&lng=${lng}`)
            .then(res => res.json())
            .then(data => {
                let texto = "";
                if (data.barrio && data.vereda) {
                    texto = `${data.barrio} - ${data.vereda}`;
                } else if (data.barrio) {
                    texto = data.barrio;
                } else if (data.vereda) {
                    texto = data.vereda;
                } else {
                    texto = "Sin información";
                }
                document.getElementById("barrio").value = texto;
            })
    } catch (error) {
        console.error(error);
    }
}

map.on("click", manejarClickMapa);

document.getElementById("cerrarSesion").addEventListener("click", function () {
    window.location.href = "/logout";
});

window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
        window.location.reload();
    }
});


let usuarioActual = null;

async function cargarUsuario() {
    try {
        const response = await fetch("/usuario");
        const data = await response.json();

        if (response.ok) {
            usuarioActual = data;
            document.body.style.visibility = "visible";
            const rolLabel = data.rol === 'superadmin' ? 'Superadmin' : (data.rol === 'admin' ? 'Admin' : 'Reportero');
            const textoBienvenidaEl = document.getElementById("textoBienvenida");
            if (textoBienvenidaEl) textoBienvenidaEl.innerText = `Bienvenido ${data.usuario} (${rolLabel})`;
            const textoBienvenidaMobileEl = document.getElementById("textoBienvenidaMobile");
            if (textoBienvenidaMobileEl) textoBienvenidaMobileEl.innerText = `Bienvenido ${data.usuario} (${rolLabel})`;

            // Actualizar etiqueta del logo acorde al rol
            const rolTagLabel = data.rol === 'superadmin' ? 'Superadmin' : (data.rol === 'admin' ? 'Administrador' : 'Gestión');
            const sidebarLogoTag = document.getElementById("sidebarLogoTag");
            if (sidebarLogoTag) sidebarLogoTag.innerText = rolTagLabel;
            const headerBrandTag = document.getElementById("headerBrandTag");
            if (headerBrandTag) headerBrandTag.innerText = rolTagLabel;

            // Mostrar u ocultar pestañas según el rol (Escritorio y Móvil)
            const btnUsuarios = document.getElementById("btnUsuarios");
            const btnAuditoria = document.getElementById("btnAuditoria");
            const btnTiposIncidentes = document.getElementById("btnTiposIncidentes");
            const btnUsuariosMobile = document.getElementById("btnUsuariosMobile");
            const btnAuditoriaMobile = document.getElementById("btnAuditoriaMobile");
            const btnTiposIncidentesMobile = document.getElementById("btnTiposIncidentesMobile");

            if (data.rol === 'superadmin') {
                if (btnUsuarios) btnUsuarios.style.display = "flex";
                if (btnAuditoria) btnAuditoria.style.display = "flex";
                if (btnTiposIncidentes) btnTiposIncidentes.style.display = "flex";
                if (btnUsuariosMobile) btnUsuariosMobile.style.display = "flex";
                if (btnAuditoriaMobile) btnAuditoriaMobile.style.display = "flex";
                if (btnTiposIncidentesMobile) btnTiposIncidentesMobile.style.display = "flex";
            } else if (data.rol === 'admin') {
                if (btnUsuarios) btnUsuarios.style.display = "none";
                if (btnAuditoria) btnAuditoria.style.display = "none";
                if (btnTiposIncidentes) btnTiposIncidentes.style.display = "none";
                if (btnUsuariosMobile) btnUsuariosMobile.style.display = "none";
                if (btnAuditoriaMobile) btnAuditoriaMobile.style.display = "none";
                if (btnTiposIncidentesMobile) btnTiposIncidentesMobile.style.display = "none";
            } else {
                window.location.href = "/reportero/index.html";
            }
        } else {
            window.location.href = "/login/index.html";
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

cargarUsuario();

const contMap1 = document.getElementById("map");
const contMap2 = document.getElementById("mapa2");
const btnVerMapa = document.getElementById("ver");

if (btnVerMapa) {
    btnVerMapa.addEventListener("click", function () {
        contMap1.classList.toggle("esconderMapa");
        contMap2.classList.toggle("mostrarMapa");
        const estaMostrandoIncidentes = contMap2.classList.contains("mostrarMapa");

        btnVerMapa.classList.toggle("activo", estaMostrandoIncidentes);
        btnVerMapa.style.background = "";
        btnVerMapa.style.color = "";

        if (estaMostrandoIncidentes) {
            setTimeout(() => {
                map2.invalidateSize();
            }, 100);
        } else {
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        }
    });
}

const contBusquedaMapa = document.getElementById("contenedorBusquedaMapa");
const inputBusquedaMapa = document.getElementById("inputBusquedaMapa");
const btnLimpiarBusquedaMapa = document.getElementById("btnLimpiarBusquedaMapa");
const sugerenciasMapa = document.getElementById("sugerenciasMapa");

// Desactivar propagación de clics y de scroll hacia el mapa de Leaflet
if (contBusquedaMapa) {
    if (typeof L !== "undefined" && L.DomEvent) {
        L.DomEvent.disableClickPropagation(contBusquedaMapa);
        L.DomEvent.disableScrollPropagation(contBusquedaMapa);
    }

    // Detener propagación de eventos táctiles, ratón y puntero
    const detenerPropagacion = (e) => e.stopPropagation();
    ['click', 'mousedown', 'mouseup', 'pointerdown', 'pointerup', 'touchstart', 'touchend', 'dblclick'].forEach(evt => {
        contBusquedaMapa.addEventListener(evt, detenerPropagacion);
    });
}

if (sugerenciasMapa) {
    if (typeof L !== "undefined" && L.DomEvent) {
        L.DomEvent.disableScrollPropagation(sugerenciasMapa);
    }

    // Detener la propagación de eventos de rueda/scroll para que no hagan zoom al mapa
    ['wheel', 'mousewheel', 'DOMMouseScroll', 'touchmove'].forEach(evt => {
        sugerenciasMapa.addEventListener(evt, (e) => {
            e.stopPropagation();
        }, { passive: true });
    });
}

let timerBusquedaMapa = null;

if (inputBusquedaMapa) {
    inputBusquedaMapa.addEventListener("input", function (e) {
        e.stopPropagation();
        const query = this.value.trim();

        if (btnLimpiarBusquedaMapa) {
            btnLimpiarBusquedaMapa.style.display = query.length > 0 ? "flex" : "none";
        }

        if (query.length < 2) {
            if (sugerenciasMapa) {
                sugerenciasMapa.innerHTML = "";
                sugerenciasMapa.style.display = "none";
            }
            return;
        }

        clearTimeout(timerBusquedaMapa);
        timerBusquedaMapa = setTimeout(() => {
            ejecutarBusquedaUnificadaMapa(query);
        }, 200);
    });

    inputBusquedaMapa.addEventListener("focus", function (e) {
        e.stopPropagation();
        if (this.value.trim().length >= 2 && sugerenciasMapa && sugerenciasMapa.children.length > 0) {
            sugerenciasMapa.style.display = "flex";
        }
    });

    document.addEventListener("click", (e) => {
        const contBus = document.getElementById("contenedorBusquedaMapa");
        if (contBus && !contBus.contains(e.target) && sugerenciasMapa) {
            sugerenciasMapa.style.display = "none";
        }
    });
}

if (btnLimpiarBusquedaMapa) {
    btnLimpiarBusquedaMapa.addEventListener("click", (e) => {
        e.stopPropagation();
        if (inputBusquedaMapa) inputBusquedaMapa.value = "";
        btnLimpiarBusquedaMapa.style.display = "none";
        if (sugerenciasMapa) {
            sugerenciasMapa.innerHTML = "";
            sugerenciasMapa.style.display = "none";
        }
        capaBarrio1.clearLayers();
        capaVereda1.clearLayers();
        map.setView([1.6144, -75.6062], 13);
    });
}

async function ejecutarBusquedaUnificadaMapa(q) {
    if (!sugerenciasMapa) return;
    try {
        const [resBarrios, resVeredas] = await Promise.all([
            fetch(`/buscarBarrios?q=${encodeURIComponent(q)}`).then(r => r.json()),
            fetch(`/buscarVeredas?q=${encodeURIComponent(q)}`).then(r => r.json())
        ]);

        const barrios = Array.isArray(resBarrios) ? resBarrios : [];
        const veredas = Array.isArray(resVeredas) ? resVeredas : [];

        sugerenciasMapa.innerHTML = "";

        if (barrios.length === 0 && veredas.length === 0) {
            const divVacio = document.createElement("div");
            divVacio.className = "sin-sugerencias";
            divVacio.innerText = "No se encontraron barrios ni veredas";
            sugerenciasMapa.appendChild(divVacio);
            sugerenciasMapa.style.display = "flex";
            return;
        }

        // Categoría Barrios
        if (barrios.length > 0) {
            const titBarrio = document.createElement("div");
            titBarrio.className = "sugerencia-categoria-titulo";
            titBarrio.innerHTML = `<i class="bi bi-buildings"></i> Barrios (${barrios.length})`;
            sugerenciasMapa.appendChild(titBarrio);

            barrios.forEach(b => {
                const item = document.createElement("div");
                item.className = "item-sugerencia-mapa";
                item.innerHTML = `<i class="bi bi-geo-alt"></i> <span>${b.namebarrio}</span>`;
                item.addEventListener("click", (e) => {
                    e.stopPropagation();
                    seleccionarUbicacionMapa('barrio', b.namebarrio);
                });
                sugerenciasMapa.appendChild(item);
            });
        }

        // Categoría Veredas
        if (veredas.length > 0) {
            const titVereda = document.createElement("div");
            titVereda.className = "sugerencia-categoria-titulo";
            titVereda.innerHTML = `<i class="bi bi-tree"></i> Veredas (${veredas.length})`;
            sugerenciasMapa.appendChild(titVereda);

            veredas.forEach(v => {
                const item = document.createElement("div");
                item.className = "item-sugerencia-mapa";
                item.innerHTML = `<i class="bi bi-geo-alt"></i> <span>${v.nombre}</span>`;
                item.addEventListener("click", (e) => {
                    e.stopPropagation();
                    seleccionarUbicacionMapa('vereda', v.nombre);
                });
                sugerenciasMapa.appendChild(item);
            });
        }

        sugerenciasMapa.style.display = "flex";

    } catch (err) {
        console.error("Error en búsqueda unificada del mapa:", err);
    }
}

function seleccionarUbicacionMapa(tipo, nombre) {
    if (inputBusquedaMapa) inputBusquedaMapa.value = nombre;
    if (btnLimpiarBusquedaMapa) btnLimpiarBusquedaMapa.style.display = "flex";
    if (sugerenciasMapa) {
        sugerenciasMapa.innerHTML = "";
        sugerenciasMapa.style.display = "none";
    }

    if (tipo === 'barrio') {
        capaVereda1.clearLayers();
        cargarBarrio1(nombre);
    } else if (tipo === 'vereda') {
        capaBarrio1.clearLayers();
        cargarVeredas1(nombre);
    }
}

function cargarVeredas1(vere) {
    const nombre = vere;
    capaVereda1.clearLayers();
    fetch(`/poligonoVereda?nombre=${encodeURIComponent(nombre)}`)
        .then(res => res.json())
        .then(data => {
            let capaGeoJSON = L.geoJSON(null, {
                style: {
                    color: "blue",
                    fillColor: "gray",
                    weight: 0.9,
                    fillOpacity: 0.4
                },
                onEachFeature: function (feature, layer) {
                    layer.on("click", function (e) {
                        L.DomEvent.stopPropagation(e);
                        manejarClickMapa(e);
                    });
                    const desc = "Vereda: " + feature.properties.nombre + "<br>Corregimiento: " + feature.properties.corregimiento;
                    layer.bindPopup(desc);
                }
            });
            data.forEach(vereda => {
                const geometry = JSON.parse(vereda.geom);
                const feature = {
                    type: "Feature",
                    geometry: geometry,
                    properties: {
                        nombre: vereda.nombre,
                        corregimiento: vereda.namecorregimiento
                    }
                };
                capaGeoJSON.addData(feature);
            });
            capaGeoJSON.addTo(capaVereda1);
            if (nombre && data.length > 0) {
                map.fitBounds(capaGeoJSON.getBounds());
            }
        });
};

function cargarBarrio1(barr) {
    let nombre = barr;
    capaBarrio1.clearLayers();
    let url = "/poligonoBarrio";
    if (nombre) {
        url += `?nombre=${encodeURIComponent(nombre)}`;
    }
    fetch(url)
        .then(res => res.json())
        .then(data => {
            let capaGeoJSON = L.geoJSON(null, {
                style: {
                    color: "white",
                    fillColor: "black",
                    weight: 0.5,
                    fillOpacity: 0.4
                },
                onEachFeature: function (feature, layer) {
                    layer.on("click", function (e) {
                        L.DomEvent.stopPropagation(e);
                        manejarClickMapa(e);
                    });
                    layer.bindPopup(feature.properties.namebarrio);
                }
            });
            data.forEach(barrio => {
                const geometry = JSON.parse(barrio.geom);
                const feature = {
                    type: "Feature",
                    geometry: geometry,
                    properties: {
                        namebarrio: barrio.namebarrio
                    }
                };
                capaGeoJSON.addData(feature);
            });
            capaGeoJSON.addTo(capaBarrio1);
            //  ZOOM AUTOMÁTICO
            if (nombre && data.length > 0) {
                map.fitBounds(capaGeoJSON.getBounds());
            }
        });
}

const btnImportar = document.querySelector(".impDat");
const ventana = document.querySelector(".ventana");
const closeModal = document.getElementById("cerrarModal");
closeModal.addEventListener("click", function () {
    ventana.classList.add("esconder");
});
const cancelModal = document.getElementById("cancelarModal");
cancelModal.addEventListener("click", function () {
    ventana.classList.add("esconder");
});
btnImportar.addEventListener("click", function (e) {
    e.preventDefault();
    ventana.classList.remove("esconder");
});

async function cargarTipos() {
    const res = await fetch("/tiposIncidente");
    const data = await res.json();

    const select = document.getElementById("tipoIncidente");
    const select2 = document.getElementById("tipoIncidenteFiltro");

    if (select) {
        select.innerHTML = '<option value="" disabled selected>Seleccione el tipo de incidente</option>';
    }
    if (select2) {
        select2.innerHTML = '<option value="">Todos los tipos</option>';
    }

    data.forEach(tipo => {
        catalogoTiposMap[tipo.idtipoincidente] = tipo;

        if (select) {
            const option1 = document.createElement("option");
            option1.value = tipo.idtipoincidente;
            option1.textContent = tipo.nametipoincidente;
            select.appendChild(option1);
        }

        if (select2) {
            const option2 = document.createElement("option");
            option2.value = tipo.idtipoincidente;
            option2.textContent = tipo.nametipoincidente;
            select2.appendChild(option2);
        }
    });

    // Inicializar Asistente Predictivo de Inteligencia Artificial (SIGI ML)
    if (window.SigiMLAssistant) {
        new SigiMLAssistant({
            textareaId: 'descripcion',
            tipoSelectId: 'tipoIncidente',
            horaInputId: 'hora'
        });
    }
}

// Configuración de límites en Fecha y Hora
const inputFechaInc = document.getElementById("fecha");
const inputHoraInc = document.getElementById("hora");

function configurarLimitesFechaHora() {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    const fechaActualStr = `${anio}-${mes}-${dia}`;

    if (inputFechaInc) {
        inputFechaInc.max = fechaActualStr;
    }
}
configurarLimitesFechaHora();

function esFechaHoraFutura(fechaVal, horaVal) {
    if (!fechaVal) return false;
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");
    const hoyStr = `${anio}-${mes}-${dia}`;

    if (fechaVal > hoyStr) {
        return { invalido: true, mensaje: "La fecha del incidente no puede ser futura." };
    }

    if (fechaVal === hoyStr && horaVal) {
        const [horas, minutos] = horaVal.split(":").map(Number);
        const horaActual = ahora.getHours();
        const minActual = ahora.getMinutes();

        if (horas > horaActual || (horas === horaActual && minutos > minActual)) {
            return { invalido: true, mensaje: "Si la fecha es hoy, la hora no puede ser mayor a la hora actual." };
        }
    }
    return { invalido: false };
}

if (inputFechaInc) {
    inputFechaInc.addEventListener("change", () => {
        const val = esFechaHoraFutura(inputFechaInc.value, inputHoraInc ? inputHoraInc.value : null);
        if (val.invalido) {
            mostrarToast(val.mensaje, "error");
        }
    });
}

if (inputHoraInc) {
    inputHoraInc.addEventListener("change", () => {
        const val = esFechaHoraFutura(inputFechaInc ? inputFechaInc.value : null, inputHoraInc.value);
        if (val.invalido) {
            mostrarToast(val.mensaje, "error");
        }
    });
}

// Botón "Ahora" para llenar automáticamente fecha y hora actual
const btnAhora = document.getElementById("btnAhora");
if (btnAhora) {
    btnAhora.addEventListener("click", () => {
        const ahora = new Date();
        const anio = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, "0");
        const dia = String(ahora.getDate()).padStart(2, "0");
        const horas = String(ahora.getHours()).padStart(2, "0");
        const minutos = String(ahora.getMinutes()).padStart(2, "0");

        if (inputFechaInc) inputFechaInc.value = `${anio}-${mes}-${dia}`;
        if (inputHoraInc) inputHoraInc.value = `${horas}:${minutos}`;

        mostrarToast("Fecha y hora establecidas al momento actual.", "info");
    });
}

document.querySelector(".registrarD").addEventListener("click", async (e) => {
    e.preventDefault();
    const tipInc = document.getElementById("tipoIncidente").value;
    const fechaInc = document.getElementById("fecha").value;
    const horaInc = document.getElementById("hora").value;
    const latitudInc = document.getElementById("latitud").value;
    const longitudInc = document.getElementById("longitud").value;

    if (!tipInc || !fechaInc || !horaInc || !latitudInc || !longitudInc) {
        mostrarToast("Favor rellenar campos obligatorios *", "error");
        return;
    }

    // Validación estricta de fecha y hora futura
    const validacionTiempo = esFechaHoraFutura(fechaInc, horaInc);
    if (validacionTiempo.invalido) {
        mostrarToast(validacionTiempo.mensaje, "error");
        return;
    }

    const data = {
        tipo: tipInc,
        fecha: fechaInc,
        hora: horaInc,
        lat: latitudInc,
        lng: longitudInc,
        descripcion: document.getElementById("descripcion").value
    };

    try {
        const res = await fetch("/registrarIncidente", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (!res.ok) {
            mostrarToast(result.mensaje || result.error || "Error en el servidor", "error");
            return;
        }
        mostrarToast(result.mensaje || "Incidente registrado exitosamente.", "exito");
        limpiarFormulario();
        cargarTabla();
        contar();
        cargarIncidentes();
    } catch (err) {
        console.error("El error es: " + err);
        mostrarToast("Error de conexión en el servidor", "error");
    }
});

cargarTipos();

function limpiarFormulario() {

    // 🔹 Inputs
    document.getElementById("tipoIncidente").value = "";
    document.getElementById("fecha").value = "";
    document.getElementById("hora").value = "";
    document.getElementById("latitud").value = "";
    document.getElementById("longitud").value = "";
    document.getElementById("descripcion").value = "";

    // 🔹 Barrio (aunque esté disabled)
    document.getElementById("barrio").value = "";

    // 🔥 Borrar marcador del mapa
    if (marcadorClick) {
        map.removeLayer(marcadorClick);
        marcadorClick = null;
    }
}


const contInc = document.getElementById("conteoTotalVerificacion") || document.querySelector(".numero");
async function contar() {
    try {
        const res = await fetch("/conteoIncidente");
        const data = await res.json();
        // acceder al count
        const total = data[0].count;
        contInc.innerText = total;
    } catch (error) {
        console.error("Error:", error);
        contInc.innerText = "Error";
    }
}
// ejecutar
contar();

function actualizarBadgePendientes(incidentes) {
    // Se elimina el conteo de incidentes en el sidebar a petición del usuario
    const badge = document.getElementById("badgePendientes");
    const badgeMobile = document.getElementById("badgePendientesMobile");
    if (badge) badge.style.display = "none";
    if (badgeMobile) badgeMobile.style.display = "none";
}

let ultimosIdsConocidos = new Set();
let primerCargaRealizada = false;

async function cargarTabla(silencioso = false) {
    try {
        const res = await fetch("/incidentesFiltroAdmin");
        const data = await res.json();

        if (Array.isArray(data)) {
            actualizarBadgePendientes(data);

            // Notificación flotante si llega un incidente totalmente nuevo desde terreno
            if (primerCargaRealizada && silencioso) {
                data.forEach(inc => {
                    if (!ultimosIdsConocidos.has(inc.idincidente) && parseInt(inc.id_estado || 1) === 1) {
                        mostrarMensajeFlotante(`⚡ ¡Nuevo reporte de terreno recibido! (${inc.nametipoincidente || 'Incidente'} por ${inc.nombreusuario || 'Reportero'})`, false);
                    }
                });
            }

            ultimosIdsConocidos = new Set(data.map(i => i.idincidente));
            primerCargaRealizada = true;
            todosLosIncidentes = data;
            aplicarFiltrosIncidentes(false);
        }
    } catch (error) {
        console.error("Error al cargar tabla:", error);
    }
}

cargarTabla();

// Polling automático cada 10 segundos para consultar nuevos reportes de terreno
setInterval(() => {
    cargarTabla(true);
}, 10000);

const select = document.getElementById("tipoIncidenteFiltro");

select.addEventListener("change", () => aplicarFiltrosIncidentes(true));

function obtenerRangoDefault3Meses() {
    const hoyObj = new Date();
    const hace3MesesObj = new Date();
    hace3MesesObj.setMonth(hoyObj.getMonth() - 3);
    return {
        desde: formatearFecha(hace3MesesObj),
        hasta: formatearFecha(hoyObj)
    };
}

const rangoInicial3Meses = obtenerRangoDefault3Meses();
let filtroFechaDesde = rangoInicial3Meses.desde;
let filtroFechaHasta = rangoInicial3Meses.hasta;

function filtrar() {
    aplicarFiltrosIncidentes(true);
}

function mostrarMensajeFlotante(mensaje, esError = false) {
    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.style.cssText = "position: fixed; top: 20px; right: 20px; z-index: 99999; display: flex; flex-direction: column; gap: 10px;";
        document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.style.cssText = `padding: 12px 18px; border-radius: 8px; font-size: 0.85rem; font-weight: 500; color: #fff; background: ${esError ? '#ef4444' : '#10b981'}; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: opacity 0.3s ease; opacity: 1;`;
    toast.innerText = mensaje;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

let todosLosIncidentes = [];
let incidentesFiltrados = [];
let paginaActualIncidentes = 1;
const filasPorPaginaIncidentes = 10;

function aplicarFiltrosIncidentes(resetPagina = true) {
    const busqueda = (document.getElementById("buscarIncidenteInput")?.value || "").toLowerCase().trim();
    const busquedaCodigo = (document.getElementById("buscarCodigoIncidenteInput")?.value || "").toLowerCase().trim();
    const filtroEstado = (document.getElementById("estadoIncidenteFiltro")?.value || "");
    const filtroTipo = (document.getElementById("tipoIncidenteFiltro")?.value || "");

    incidentesFiltrados = todosLosIncidentes.filter(inc => {
        const coincideCodigo = !busquedaCodigo ||
            (inc.codigoincidente || "").toLowerCase().includes(busquedaCodigo) ||
            String(inc.idincidente || "").toLowerCase().includes(busquedaCodigo) ||
            (`inc-${inc.idincidente}`).toLowerCase().includes(busquedaCodigo);

        const coincideBusqueda = !busqueda ||
            (inc.namebarrio || "").toLowerCase().includes(busqueda) ||
            (inc.nombre || "").toLowerCase().includes(busqueda) ||
            (inc.nombreusuario || "").toLowerCase().includes(busqueda) ||
            (inc.descripcionincidente || "").toLowerCase().includes(busqueda) ||
            (inc.nametipoincidente || "").toLowerCase().includes(busqueda) ||
            (inc.admin_revisor_nombre || "").toLowerCase().includes(busqueda) ||
            (inc.codigoincidente || "").toLowerCase().includes(busqueda);

        const coincideEstado = !filtroEstado || String(inc.id_estado || 1) === String(filtroEstado);
        const coincideTipo = !filtroTipo || String(inc.idtipoincidente) === String(filtroTipo);

        let coincideFecha = true;
        if (filtroFechaDesde || filtroFechaHasta) {
            const fechaInc = inc.fechaincidente ? inc.fechaincidente.slice(0, 10) : '';
            if (filtroFechaDesde && fechaInc < filtroFechaDesde) coincideFecha = false;
            if (filtroFechaHasta && fechaInc > filtroFechaHasta) coincideFecha = false;
        }

        return coincideCodigo && coincideBusqueda && coincideEstado && coincideTipo && coincideFecha;
    });

    // Actualizar badge de filtros activos
    actualizarBadgeFiltrosActivos(busquedaCodigo, busqueda, filtroEstado, filtroTipo);

    if (resetPagina) {
        paginaActualIncidentes = 1;
    }
    renderTabla();
    renderMapa(incidentesFiltrados);
}

function actualizarBadgeFiltrosActivos(codigo, busqueda, estado, tipo) {
    const badge = document.getElementById("badgeFiltrosActivosIncidentes");
    const texto = document.getElementById("textoFiltrosActivos");
    if (!badge || !texto) return;

    let activos = 0;
    if (codigo) activos++;
    if (busqueda) activos++;
    if (estado) activos++;
    if (tipo) activos++;

    // Verificar si el rango de fecha no es el default o está activo
    const r3m = obtenerRangoDefault3Meses();
    const esRangoDefault = (filtroFechaDesde === r3m.desde && filtroFechaHasta === r3m.hasta);
    if (!esRangoDefault && (filtroFechaDesde || filtroFechaHasta)) {
        activos++;
    }

    // Actualizar etiqueta del botón de tiempo
    const labelTiempo = document.getElementById("labelBotonTiempo");
    if (labelTiempo) {
        if (esRangoDefault) {
            labelTiempo.textContent = "3 meses";
        } else if (!filtroFechaDesde && !filtroFechaHasta) {
            labelTiempo.textContent = "Todo el tiempo";
        } else if (filtroFechaDesde && filtroFechaHasta) {
            if (filtroFechaDesde === filtroFechaHasta) {
                labelTiempo.textContent = "Hoy";
            } else {
                labelTiempo.textContent = `${filtroFechaDesde} a ${filtroFechaHasta}`;
            }
        } else {
            labelTiempo.textContent = "Personalizado";
        }
    }

    if (activos > 0) {
        texto.textContent = `${activos} ${activos === 1 ? 'filtro' : 'filtros'}`;
        badge.style.display = "inline-flex";
    } else {
        badge.style.display = "none";
    }
}

function renderTabla(data) {
    if (data && Array.isArray(data)) {
        todosLosIncidentes = data;
        aplicarFiltrosIncidentes(false);
        return;
    }

    const tbody = document.getElementById("tablaIncidentes");
    const infoPag = document.getElementById("infoPaginacionIncidentes");
    const labelPag = document.getElementById("labelPaginaIncidente");
    const btnAnt = document.getElementById("btnPagAntIncidente");
    const btnSig = document.getElementById("btnPagSigIncidente");

    if (!tbody) return;

    if (incidentesFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--texto-suave);">No se encontraron incidentes coincidentes.</td></tr>';
        if (infoPag) infoPag.innerText = "Mostrando 0 de 0 incidentes";
        if (labelPag) labelPag.innerText = "Página 1 de 1";
        if (btnAnt) btnAnt.disabled = true;
        if (btnSig) btnSig.disabled = true;
        return;
    }

    const totalRegs = incidentesFiltrados.length;
    const totalPaginas = Math.ceil(totalRegs / filasPorPaginaIncidentes) || 1;

    if (paginaActualIncidentes > totalPaginas) paginaActualIncidentes = totalPaginas;
    if (paginaActualIncidentes < 1) paginaActualIncidentes = 1;

    const inicio = (paginaActualIncidentes - 1) * filasPorPaginaIncidentes;
    const fin = Math.min(inicio + filasPorPaginaIncidentes, totalRegs);
    const paginados = incidentesFiltrados.slice(inicio, fin);

    const adminLogueado = usuarioActual ? (usuarioActual.usuario || usuarioActual.nombreusuario) : '';
    const idAdminLogueado = usuarioActual ? (usuarioActual.idusuario || usuarioActual.id) : null;
    const isSuperadmin = usuarioActual && usuarioActual.rol === 'superadmin';

    tbody.innerHTML = "";
    paginados.forEach((incidente, index) => {
        const fila = document.createElement("tr");

        const nombreTipo = incidente.nametipoincidente || 'Incidente';
        let tipoBadge = '';
        const tipoId = parseInt(incidente.idtipoincidente);
        if (tipoId === 1) { // Robo
            tipoBadge = `<span class="badge-tipo badge-tipo-robo" title="${nombreTipo}">${nombreTipo}</span>`;
        } else if (tipoId === 2) { // Agresión
            tipoBadge = `<span class="badge-tipo badge-tipo-agresion" title="${nombreTipo}">${nombreTipo}</span>`;
        } else if (tipoId === 3) { // Piques
            tipoBadge = `<span class="badge-tipo badge-tipo-piques" title="${nombreTipo}">${nombreTipo}</span>`;
        } else if (tipoId === 4) { // Accidente
            tipoBadge = `<span class="badge-tipo badge-tipo-accidente" title="${nombreTipo}">${nombreTipo}</span>`;
        } else {
            tipoBadge = `<span class="badge-tipo badge-tipo-otro" title="${nombreTipo}">${nombreTipo}</span>`;
        }

        // Estado Badge
        const estadoId = parseInt(incidente.id_estado) || 1;
        let estadoBadge = '';
        let botonAccionRapida = '';

        if (estadoId === 1) { // 1 = En cola
            estadoBadge = `<span class="badge-estado badge-estado-cola" title="Pendiente en cola de revisión">En Cola</span>`;
            botonAccionRapida = `<button type="button" class="btnTomarIncidente btn-secundario-accion" data-id="${incidente.idincidente}" title="Tomar reporte para revisión">Tomar</button>`;
        } else if (estadoId === 2) { // 2 = En evaluación
            estadoBadge = `<span class="badge-estado badge-estado-proceso" title="Tomado para revisión">En Evaluación</span>`;
        } else if (estadoId === 5) { // 5 = Aprobado
            estadoBadge = `<span class="badge-estado badge-estado-aprobado" title="Incidente verificado y aprobado">Aprobado</span>`;
        } else { // 6 = Desestimado
            estadoBadge = `<span class="badge-estado badge-estado-rechazado" title="Incidente desestimado">Desestimado</span>`;
        }

        const consecutivo = inicio + index + 1;
        const codigoLimpio = incidente.codigoincidente || `INC-${incidente.idincidente}`;
        const barrioNombre = incidente.namebarrio || (incidente.nombre ? incidente.nombre : 'Sin zona');

        let fechaTexto = '--';
        if (incidente.fechaincidente) {
            try {
                const d = new Date(incidente.fechaincidente);
                const dia = d.getDate();
                const mes = d.getMonth() + 1;
                const anio = d.getFullYear();
                const hora = incidente.horaincidente ? incidente.horaincidente.slice(0, 5) : '';
                fechaTexto = `${dia}/${mes}/${anio}${hora ? ' ' + hora : ''}`;
            } catch(e) {
                fechaTexto = incidente.fechaincidente.slice(0, 10);
            }
        }

        fila.className = "fila-incidente-hover";
        fila.innerHTML = `
            <td class="celda-consecutivo">${consecutivo}</td>
            <td class="celda-codigo">
                <span class="codigo-incidente-texto" title="Código: ${codigoLimpio}">${codigoLimpio}</span>
            </td>
            <td class="celda-centrada">${tipoBadge}</td>
            <td class="celda-centrada">${estadoBadge}</td>
            <td class="celda-barrio" title="${barrioNombre}">${barrioNombre}</td>
            <td class="celda-acciones">
                <div class="acciones-celda-wrap">
                    <button type="button" onclick="verDetalleIncidente(${incidente.idincidente})" class="btn-primario-detalle" title="Ver detalle completo y opciones">Detalle</button>
                    ${botonAccionRapida}
                </div>
            </td>
        `;
        tbody.appendChild(fila);
    });

    if (infoPag) infoPag.innerText = `Mostrando ${inicio + 1} a ${fin} de ${totalRegs} incidentes`;
    if (labelPag) labelPag.innerText = `Página ${paginaActualIncidentes} de ${totalPaginas}`;
    if (btnAnt) btnAnt.disabled = paginaActualIncidentes === 1;
    if (btnSig) btnSig.disabled = paginaActualIncidentes === totalPaginas;
}

function togglePanelFiltros() {
    const cont = document.getElementById("contenedorFiltrosIncidentes");
    const btn = document.getElementById("btnToggleFiltros");
    if (!cont) return;

    if (cont.classList.contains("activo")) {
        cont.classList.remove("activo");
        setTimeout(() => {
            if (!cont.classList.contains("activo")) {
                cont.style.display = "none";
            }
        }, 300);
        if (btn) {
            btn.style.background = "var(--bg-input)";
            btn.innerHTML = `<span>Filtros</span>`;
        }
    } else {
        cont.style.display = "block";
        void cont.offsetWidth; // Trigger layout reflow for CSS transition start
        cont.classList.add("activo");
        if (btn) {
            btn.style.background = "rgba(255, 255, 255, 0.08)";
            btn.innerHTML = `<span>Ocultar Filtros</span>`;
        }
    }
}
window.togglePanelFiltros = togglePanelFiltros;

function verDetalleIncidente(id) {
    const incidente = (todosLosIncidentes || []).find(i => parseInt(i.idincidente) === parseInt(id));
    if (!incidente) {
        console.warn("⚠️ No se encontró el incidente ID:", id);
        return;
    }

    const modal = document.getElementById("modalDetalleIncidente");
    if (!modal) return;

    // Código sin "#"
    const idEl = document.getElementById("detModalId");
    const codigoLimpio = incidente.codigoincidente || `INC-${incidente.idincidente}`;
    if (idEl) {
        idEl.innerText = codigoLimpio;
    }
    
    // Categoría / Tipo Badge
    const detTipoBadge = document.getElementById("detModalTipoBadge");
    const tipoId = parseInt(incidente.idtipoincidente);
    const nombreTipo = incidente.nametipoincidente || 'Incidente';
    let tipoClase = 'badge-tipo-otro';
    if (tipoId === 1) tipoClase = 'badge-tipo-robo';
    else if (tipoId === 2) tipoClase = 'badge-tipo-agresion';
    else if (tipoId === 3) tipoClase = 'badge-tipo-piques';
    else if (tipoId === 4) tipoClase = 'badge-tipo-accidente';

    if (detTipoBadge) {
        detTipoBadge.innerHTML = `<span class="badge-tipo ${tipoClase}">${nombreTipo}</span>`;
    }

    // Estado Badge
    const estadoId = parseInt(incidente.id_estado) || 1;
    const detEstadoBadge = document.getElementById("detModalEstadoBadge");
    if (detEstadoBadge) {
        let estadoBadgeHtml = '';
        if (estadoId === 1) estadoBadgeHtml = '<span class="badge-estado badge-estado-cola">En Cola</span>';
        else if (estadoId === 2) estadoBadgeHtml = '<span class="badge-estado badge-estado-proceso">En Evaluación</span>';
        else if (estadoId === 5) estadoBadgeHtml = '<span class="badge-estado badge-estado-aprobado">Aprobado</span>';
        else estadoBadgeHtml = '<span class="badge-estado badge-estado-rechazado">Desestimado</span>';
        detEstadoBadge.innerHTML = estadoBadgeHtml;
    }

    let fechaFmt = '--';
    if (incidente.fechaincidente) {
        try {
            const d = new Date(incidente.fechaincidente);
            const dia = d.getDate();
            const mes = d.getMonth() + 1;
            const anio = d.getFullYear();
            fechaFmt = `${dia}/${mes}/${anio}`;
        } catch(e) {
            fechaFmt = incidente.fechaincidente.slice(0, 10);
        }
    }
    const horaFmt = incidente.horaincidente ? incidente.horaincidente.slice(0, 5) : '--';
    
    const fhEl = document.getElementById("detModalFechaHora");
    const ubEl = document.getElementById("detModalUbicacion");
    const repEl = document.getElementById("detModalReportadoPor");
    const revEl = document.getElementById("detModalRevisor");
    const dsEl = document.getElementById("detModalDescripcion");

    if (fhEl) fhEl.innerText = `${fechaFmt} · ${horaFmt}`;

    const barrioTxt = incidente.namebarrio || "Sin barrio";
    const veredaTxt = incidente.nombre ? ` / ${incidente.nombre}` : '';
    if (ubEl) ubEl.innerText = `${barrioTxt}${veredaTxt}`;
    if (repEl) repEl.innerText = incidente.nombreusuario || "Ciudadano / Sistema";
    if (revEl) revEl.innerText = incidente.admin_revisor_nombre || "Sin asignar";
    if (dsEl) dsEl.innerText = incidente.descripcionincidente || "Sin descripción proporcionada.";

    // Coordenadas
    const coordsCont = document.getElementById("detModalCoordsCont");
    const coordsEl = document.getElementById("detModalCoords");
    if (incidente.latitud && incidente.longitud && coordsCont && coordsEl) {
        coordsEl.innerText = `Lat: ${parseFloat(incidente.latitud).toFixed(5)}, Lng: ${parseFloat(incidente.longitud).toFixed(5)}`;
        coordsCont.style.display = "flex";
    } else if (coordsCont) {
        coordsCont.style.display = "none";
    }

    // Evidencia Fotográfica
    const contFoto = document.getElementById("detModalFotoCont");
    const imgFoto = document.getElementById("detModalFotoImg");
    if (incidente.imagen_url && contFoto && imgFoto) {
        imgFoto.src = incidente.imagen_url;
        imgFoto.onclick = () => abrirVisorFoto(incidente.imagen_url, codigoLimpio, incidente.descripcionincidente);
        contFoto.style.display = "block";
    } else if (contFoto) {
        contFoto.style.display = "none";
    }

    // Acciones operativas dinámicas en el Modal
    const accionesBar = document.getElementById("detModalAcciones");
    if (accionesBar) {
        const adminLogueado = usuarioActual ? (usuarioActual.usuario || usuarioActual.nombreusuario) : '';
        const idAdminLogueado = usuarioActual ? (usuarioActual.idusuario || usuarioActual.id) : null;
        const isSuperadmin = usuarioActual && usuarioActual.rol === 'superadmin';
        const esMio = (idAdminLogueado && parseInt(incidente.id_admin_revisor) === parseInt(idAdminLogueado)) || 
                       (adminLogueado && incidente.admin_revisor_nombre === adminLogueado);

        let btnsHtml = '';
        if (estadoId === 1) {
            btnsHtml += `<button type="button" class="btn-modal-op btn-modal-tomar" onclick="accionModal('tomar', ${incidente.idincidente}, this)">Tomar Reporte</button>`;
        } else if (estadoId === 2) {
            if (esMio || isSuperadmin) {
                btnsHtml += `
                    <button type="button" class="btn-modal-op btn-modal-aprobar" onclick="accionModal('resolver', ${incidente.idincidente}, this)">Aprobar</button>
                    <button type="button" class="btn-modal-op btn-modal-desestimar" onclick="accionModal('cerrar', ${incidente.idincidente}, this)">Desestimar</button>
                    <button type="button" class="btn-modal-op btn-modal-liberar" onclick="accionModal('liberar', ${incidente.idincidente}, this)">Liberar</button>
                `;
            } else {
                btnsHtml += `<span class="badge-modal-en-revision">En revisión por ${incidente.admin_revisor_nombre || 'otro admin'}</span>`;
            }
        } else {
            btnsHtml += `
                <button type="button" class="btn-modal-op btn-modal-editar" onclick="accionModal('editar', ${incidente.idincidente}, this)">Editar</button>
                <button type="button" class="btn-modal-op btn-modal-eliminar" onclick="accionModal('eliminar', ${incidente.idincidente}, this)">Eliminar</button>
            `;
        }
        btnsHtml += `<button type="button" class="btn-modal-op btn-modal-cerrar" onclick="cerrarModalDetalle()">Cerrar</button>`;
        accionesBar.innerHTML = btnsHtml;
    }

    modal.style.display = "flex";
}

async function accionModal(tipo, id, btn) {
    if (tipo === 'tomar') {
        await tomarIncidente(id, btn);
        cerrarModalDetalle();
    } else if (tipo === 'resolver') {
        await resolverIncidente(id, btn);
        cerrarModalDetalle();
    } else if (tipo === 'cerrar') {
        cerrarModalDetalle();
        await cerrarIncidente(id, null);
    } else if (tipo === 'liberar') {
        await liberarIncidente(id, btn);
        cerrarModalDetalle();
    } else if (tipo === 'editar') {
        cerrarModalDetalle();
        editarIncidente(id);
    } else if (tipo === 'eliminar') {
        cerrarModalDetalle();
        eliminarIncidente(id);
    }
}
window.accionModal = accionModal;

function cerrarModalDetalle() {
    const modal = document.getElementById("modalDetalleIncidente");
    if (modal) modal.style.display = "none";
}

const modalDetalleIncidenteEl = document.getElementById("modalDetalleIncidente");
if (modalDetalleIncidenteEl) {
    modalDetalleIncidenteEl.addEventListener("click", (e) => {
        if (e.target === modalDetalleIncidenteEl) {
            cerrarModalDetalle();
        }
    });
}

window.verDetalleIncidente = verDetalleIncidente;
window.cerrarModalDetalle = cerrarModalDetalle;

function abrirVisorFoto(url, codigo, descripcion) {
    console.log("📸 Abriendo visor de foto:", { url, codigo, descripcion });
    const modal = document.getElementById("modalVisorFoto");
    const img = document.getElementById("imgVisorModal");
    const titulo = document.getElementById("tituloVisorFoto");
    const desc = document.getElementById("descVisorFoto");
    if (!modal || !img) {
        console.error("❌ No se encontró modalVisorFoto o imgVisorModal en el DOM");
        return;
    }

    img.onerror = function() {
        console.warn("No se pudo cargar la imagen desde la URL:", url);
        if (desc) desc.innerText = `${descripcion || ''}\n⚠️ (La imagen no se encuentra disponible o fue movida)`;
    };

    img.src = url;
    if (titulo) titulo.innerText = `📷 Evidencia — ${codigo}`;
    if (desc) desc.innerText = descripcion || '';
    modal.style.display = "flex";
    modal.classList.add("active");
}

function cerrarVisorFoto() {
    const modal = document.getElementById("modalVisorFoto");
    if (modal) {
        modal.style.display = "none";
        modal.classList.remove("active");
    }
}

window.abrirVisorFoto = abrirVisorFoto;
window.cerrarVisorFoto = cerrarVisorFoto;

// Funciones de Acción para Cola Compartida
async function tomarIncidente(id, btnElement = null) {
    if (btnElement) {
        btnElement.disabled = true;
        btnElement.dataset.originalHtml = btnElement.innerHTML;
        btnElement.innerHTML = '<i class="bi bi-arrow-repeat spin-icon"></i> Tomando...';
    }
    try {
        const response = await fetch(`/api/incidentes/${id}/tomar`, { method: 'POST' });
        await response.json();
        await cargarTabla(true);
    } catch (err) {
        console.error("Error al tomar incidente:", err);
    } finally {
        if (btnElement && btnElement.dataset.originalHtml) {
            btnElement.disabled = false;
            btnElement.innerHTML = btnElement.dataset.originalHtml;
        }
    }
}

async function liberarIncidente(id, btnElement = null) {
    if (btnElement) {
        btnElement.disabled = true;
        btnElement.dataset.originalHtml = btnElement.innerHTML;
        btnElement.innerHTML = '<i class="bi bi-arrow-repeat spin-icon"></i> Liberando...';
    }
    try {
        const response = await fetch(`/api/incidentes/${id}/liberar`, { method: 'POST' });
        await response.json();
        await cargarTabla(true);
    } catch (err) {
        console.error("Error al liberar incidente:", err);
    } finally {
        if (btnElement && btnElement.dataset.originalHtml) {
            btnElement.disabled = false;
            btnElement.innerHTML = btnElement.dataset.originalHtml;
        }
    }
}

async function resolverIncidente(id, btnElement = null) {
    if (btnElement) {
        btnElement.disabled = true;
        btnElement.dataset.originalHtml = btnElement.innerHTML;
        btnElement.innerHTML = '<i class="bi bi-arrow-repeat spin-icon"></i> Aprobando...';
    }
    try {
        const response = await fetch(`/api/incidentes/${id}/resolver`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notas: 'Aprobado desde mesa de validación' })
        });
        await response.json();
        await cargarTabla(true);
    } catch (err) {
        console.error("Error al resolver incidente:", err);
    } finally {
        if (btnElement && btnElement.dataset.originalHtml) {
            btnElement.disabled = false;
            btnElement.innerHTML = btnElement.dataset.originalHtml;
        }
    }
}

async function cerrarIncidente(id, btnElement = null) {
    const motivo = prompt("Por favor ingresa el motivo por el cual se desestima/cierra este incidente:");
    if (motivo === null || motivo.trim() === '') return;

    if (btnElement) {
        btnElement.disabled = true;
        btnElement.dataset.originalHtml = btnElement.innerHTML;
        btnElement.innerHTML = '<i class="bi bi-arrow-repeat spin-icon"></i> Desestimando...';
    }

    try {
        const response = await fetch(`/api/incidentes/${id}/cerrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ motivo: motivo.trim() })
        });
        await response.json();
        await cargarTabla(true);
    } catch (err) {
        console.error("Error al desestimar incidente:", err);
    } finally {
        if (btnElement && btnElement.dataset.originalHtml) {
            btnElement.disabled = false;
            btnElement.innerHTML = btnElement.dataset.originalHtml;
        }
    }
}

const tabla = document.getElementById("tablaIncidentes");
if (tabla) {
    tabla.addEventListener("click", function (e) {
        const btn = e.target.closest("button");
        if (!btn) return;
        const id = btn.dataset.id;
        if (!id) return;

        if (btn.classList.contains("btnEliminar")) {
            eliminarIncidente(id);
        } else if (btn.classList.contains("btnEditar")) {
            editarIncidente(id);
        } else if (btn.classList.contains("btnTomarIncidente")) {
            tomarIncidente(id, btn);
        } else if (btn.classList.contains("btnLiberarIncidente")) {
            liberarIncidente(id, btn);
        } else if (btn.classList.contains("btnResolverIncidente")) {
            resolverIncidente(id, btn);
        } else if (btn.classList.contains("btnCerrarIncidente")) {
            cerrarIncidente(id, btn);
        }
    });
}

// Event Listeners de Filtros y Paginación de Incidentes
document.getElementById("buscarIncidenteInput")?.addEventListener("input", aplicarFiltrosIncidentes);
document.getElementById("buscarCodigoIncidenteInput")?.addEventListener("input", aplicarFiltrosIncidentes);
document.getElementById("estadoIncidenteFiltro")?.addEventListener("change", aplicarFiltrosIncidentes);
document.getElementById("tipoIncidenteFiltro")?.addEventListener("change", aplicarFiltrosIncidentes);

document.getElementById("btnResetFiltrosIncidentes")?.addEventListener("click", () => {
    const buscarInput = document.getElementById("buscarIncidenteInput");
    const buscarCodigoInput = document.getElementById("buscarCodigoIncidenteInput");
    const tipoFiltro = document.getElementById("tipoIncidenteFiltro");
    const estadoFiltro = document.getElementById("estadoIncidenteFiltro");
    if (buscarInput) buscarInput.value = "";
    if (buscarCodigoInput) buscarCodigoInput.value = "";
    if (tipoFiltro) tipoFiltro.value = "";
    if (estadoFiltro) estadoFiltro.value = "";

    const r3m = obtenerRangoDefault3Meses();
    filtroFechaDesde = r3m.desde;
    filtroFechaHasta = r3m.hasta;

    const btnRapidos = document.querySelectorAll(".btn-rapido-modal");
    btnRapidos.forEach(b => {
        if (b.dataset.rango === "3meses") b.classList.add("activo");
        else b.classList.remove("activo");
    });

    filtrar();
});

document.getElementById("btnPagAntIncidente")?.addEventListener("click", () => {
    if (paginaActualIncidentes > 1) {
        paginaActualIncidentes--;
        renderTabla();
    }
});

document.getElementById("btnPagSigIncidente")?.addEventListener("click", () => {
    const totalPaginas = Math.ceil(incidentesFiltrados.length / filasPorPaginaIncidentes) || 1;
    if (paginaActualIncidentes < totalPaginas) {
        paginaActualIncidentes++;
        renderTabla();
    }
});


let idIncidenteAEliminar = null;
const modalConfirmarEliminar = document.getElementById("modalConfirmarEliminar");
const btnConfirmarEliminar = document.getElementById("btnConfirmarEliminar");
const btnCancelarEliminar = document.getElementById("btnCancelarEliminar");
const btnCerrarModalEliminar = document.getElementById("cerrarModalEliminar");

function cerrarModalEliminar() {
    modalConfirmarEliminar.classList.add("esconder");
    idIncidenteAEliminar = null;
}

if (btnCancelarEliminar) btnCancelarEliminar.addEventListener("click", cerrarModalEliminar);
if (btnCerrarModalEliminar) btnCerrarModalEliminar.addEventListener("click", cerrarModalEliminar);

btnConfirmarEliminar.addEventListener("click", async () => {
    if (!idIncidenteAEliminar) return;
    try {
        const res = await fetch(`/incidente/${idIncidenteAEliminar}`, {
            method: "DELETE"
        });
        if (res.ok) {
            filtrar();
            contar();
        } else {
            console.error("Error al eliminar el incidente");
        }
    } catch (error) {
        console.error("Error eliminando:", error);
    } finally {
        cerrarModalEliminar();
    }
});

function eliminarIncidente(id) {
    idIncidenteAEliminar = id;
    modalConfirmarEliminar.classList.remove("esconder");
}

async function editarIncidente(id) {
    try {
        const res = await fetch(`/incidente/${id}`);
        const data = await res.json();

        // llenar campos
        document.getElementById("editId").value = data.idincidente;
        document.getElementById("editFecha").value = data.fechaincidente.split("T")[0];
        document.getElementById("editHora").value = data.horaincidente;
        document.getElementById("editDescripcion").value = data.descripcionincidente;

        // mostrar modal
        document.getElementById("modalEditar").style.display = "flex";

    } catch (error) {
        console.error("Error cargando datos:", error);
    }
}

document.getElementById("btnGuardar").addEventListener("click", async () => {
    const id = document.getElementById("editId").value;
    const fecha = document.getElementById("editFecha").value;
    const hora = document.getElementById("editHora").value;
    const descripcion = document.getElementById("editDescripcion").value;

    try {
        const res = await fetch(`/incidente/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fechaincidente: fecha,
                horaincidente: hora,
                descripcionincidente: descripcion
            })
        });

        if (res.ok) {
            cerrarModal();
            filtrar(); // refresca tabla
        } else {
            console.error("Error al actualizar incidente");
        }

    } catch (error) {
        console.error("Error:", error);
    }
});

function cerrarModal() {
    document.getElementById("modalEditar").style.display = "none";
}

document.getElementById("btnCerrar").addEventListener("click", cerrarModal);


/* Sacamos todos lo años */
const selectAnio = document.getElementById("filtroAnio");
// Año actual
const anioActual = new Date().getFullYear();
// Año inicial (puedes cambiarlo)
const anioInicio = 2000;
for (let i = anioActual; i >= anioInicio; i--) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    selectAnio.appendChild(option);
}

/* ════════════════════════════════
   MODAL FILTRO DE TIEMPO
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

// Abrir modal
btnAbrirFiltroTiempo.addEventListener("click", () => {
    modalFiltroTiempo.style.display = "flex";
});

// Cerrar modal
function cerrarModalFiltroTiempo() {
    modalFiltroTiempo.style.display = "none";
}
btnCerrarFiltroTiempo.addEventListener("click", cerrarModalFiltroTiempo);

// Cerrar al hacer clic fuera del modal
window.addEventListener("click", (e) => {
    if (e.target === modalFiltroTiempo) {
        cerrarModalFiltroTiempo();
    }
});

// Helper para dar formato YYYY-MM-DD
function formatearFecha(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Botones rápidos
const btnRapidos = document.querySelectorAll(".btn-rapido-modal");
btnRapidos.forEach(btn => {
    btn.addEventListener("click", () => {
        // Remover clase activo de todos
        btnRapidos.forEach(b => b.classList.remove("activo"));
        // Agregar clase activo al seleccionado
        btn.classList.add("activo");

        const rango = btn.dataset.rango;
        const hoyObj = new Date();
        filtroFechaHasta = formatearFecha(hoyObj);

        switch (rango) {
            case "hoy":
                filtroFechaDesde = formatearFecha(hoyObj);
                break;
            case "semana":
                const haceUnaSemana = new Date();
                haceUnaSemana.setDate(hoyObj.getDate() - 7);
                filtroFechaDesde = formatearFecha(haceUnaSemana);
                break;
            case "15dias":
                const hace15Dias = new Date();
                hace15Dias.setDate(hoyObj.getDate() - 15);
                filtroFechaDesde = formatearFecha(hace15Dias);
                break;
            case "mes":
                const haceUnMes = new Date();
                haceUnMes.setMonth(hoyObj.getMonth() - 1);
                filtroFechaDesde = formatearFecha(haceUnMes);
                break;
            case "3meses":
                const hace3Meses = new Date();
                hace3Meses.setMonth(hoyObj.getMonth() - 3);
                filtroFechaDesde = formatearFecha(hace3Meses);
                break;
            case "1anio":
                const hace1Anio = new Date();
                hace1Anio.setFullYear(hoyObj.getFullYear() - 1);
                filtroFechaDesde = formatearFecha(hace1Anio);
                break;
            case "todo":
                filtroFechaDesde = "";
                filtroFechaHasta = "";
                break;
        }

        // Limpiar inputs del modal para evitar conflicto visual
        document.getElementById("fechaDesdeModal").value = "";
        document.getElementById("fechaHastaModal").value = "";
        document.getElementById("mesFiltroModal").value = "";
        if (document.getElementById("anioFiltroModal")) document.getElementById("anioFiltroModal").value = "";

        // Filtrar y cerrar
        filtrar();
        cerrarModalFiltroTiempo();
    });
});

// Rango personalizado - Aplicar
document.getElementById("btnAplicarRangoModal").addEventListener("click", () => {
    const desde = document.getElementById("fechaDesdeModal").value;
    const hasta = document.getElementById("fechaHastaModal").value;

    if (!desde || !hasta) {
        mostrarToast("Ambos campos de fecha son obligatorios.", "error");
        return;
    }

    if (new Date(desde) > new Date(hasta)) {
        mostrarToast("La fecha 'Desde' no puede ser mayor que 'Hasta'.", "error");
        return;
    }

    // Quitar activo de botones rápidos
    btnRapidos.forEach(b => b.classList.remove("activo"));
    // Limpiar input de mes y año
    document.getElementById("mesFiltroModal").value = "";
    if (document.getElementById("anioFiltroModal")) document.getElementById("anioFiltroModal").value = "";

    filtroFechaDesde = desde;
    filtroFechaHasta = hasta;

    filtrar();
    cerrarModalFiltroTiempo();
});

// Rango personalizado - Limpiar (limpia las fechas del rango)
document.getElementById("btnLimpiarRangoModal").addEventListener("click", () => {
    document.getElementById("fechaDesdeModal").value = "";
    document.getElementById("fechaHastaModal").value = "";
    
    const r3m = obtenerRangoDefault3Meses();
    filtroFechaDesde = r3m.desde;
    filtroFechaHasta = r3m.hasta;

    btnRapidos.forEach(b => {
        if (b.dataset.rango === "3meses") b.classList.add("activo");
        else b.classList.remove("activo");
    });

    filtrar();
    cerrarModalFiltroTiempo();
});

// Mes específico - Filtrar
document.getElementById("btnFiltrarMesModal").addEventListener("click", () => {
    const mesAnio = document.getElementById("mesFiltroModal").value; // Formato YYYY-MM

    if (!mesAnio) {
        mostrarToast("Debe seleccionar un mes.", "error");
        return;
    }

    // Quitar activo de botones rápidos y rango
    btnRapidos.forEach(b => b.classList.remove("activo"));
    document.getElementById("fechaDesdeModal").value = "";
    document.getElementById("fechaHastaModal").value = "";

    const [anioStr, mesStr] = mesAnio.split("-");
    const anio = parseInt(anioStr);
    const mes = parseInt(mesStr) - 1; // Mes 0-indexed

    // Primer día del mes
    const primerDia = new Date(anio, mes, 1);
    // Último día del mes
    const ultimoDia = new Date(anio, mes + 1, 0);

    filtroFechaDesde = formatearFecha(primerDia);
    filtroFechaHasta = formatearFecha(ultimoDia);

    filtrar();
    cerrarModalFiltroTiempo();
});

// Año específico - Filtrar
const btnFiltrarAnio = document.getElementById("btnFiltrarAnioModal");
if (btnFiltrarAnio) {
    btnFiltrarAnio.addEventListener("click", () => {
        const anio = document.getElementById("anioFiltroModal").value; 
        if (!anio) {
            mostrarToast("Debe seleccionar un año.", "error");
            return;
        }

        btnRapidos.forEach(b => b.classList.remove("activo"));
        document.getElementById("fechaDesdeModal").value = "";
        document.getElementById("fechaHastaModal").value = "";
        document.getElementById("mesFiltroModal").value = "";

        const y = parseInt(anio);
        const primerDia = new Date(y, 0, 1);
        const ultimoDia = new Date(y, 11, 31);

        filtroFechaDesde = formatearFecha(primerDia);
        filtroFechaHasta = formatearFecha(ultimoDia);

        filtrar();
        cerrarModalFiltroTiempo();
    });
}

// Limpiar todo (pie del modal)
document.getElementById("btnLimpiarTodoModal").addEventListener("click", () => {
    // Resetear campos
    document.getElementById("fechaDesdeModal").value = "";
    document.getElementById("fechaHastaModal").value = "";
    document.getElementById("mesFiltroModal").value = "";
    if (document.getElementById("anioFiltroModal")) document.getElementById("anioFiltroModal").value = "";

    // Restablecer al rango por defecto de 3 meses
    const r3m = obtenerRangoDefault3Meses();
    filtroFechaDesde = r3m.desde;
    filtroFechaHasta = r3m.hasta;

    btnRapidos.forEach(b => {
        if (b.dataset.rango === "3meses") b.classList.add("activo");
        else b.classList.remove("activo");
    });

    filtrar();
    cerrarModalFiltroTiempo();
});

//  Modals y Botones de Importación
const modalImportar = document.querySelector(".ventana");
const btnAbrirImportar = document.querySelector(".impDat");
const btnCerrarImportar = document.getElementById("cerrarModal");
const btnCancelarImportar = document.getElementById("cancelarModal");
const btnImportarDatos = document.querySelector(".btn.importar");
const inputArchivo = document.getElementById("archivo");

if (btnAbrirImportar) {
    btnAbrirImportar.addEventListener("click", (e) => {
        e.preventDefault();
        modalImportar.classList.remove("esconder");
    });
}

function cerrarModalImportar() {
    modalImportar.classList.add("esconder");
    inputArchivo.value = "";
}

if (btnCerrarImportar) btnCerrarImportar.addEventListener("click", cerrarModalImportar);
if (btnCancelarImportar) btnCancelarImportar.addEventListener("click", cerrarModalImportar);

if (btnImportarDatos) {
    btnImportarDatos.addEventListener("click", async () => {
        const file = inputArchivo.files[0];
        if (!file) {
            mostrarToast("Por favor selecciona un archivo (.csv)", "error");
            return;
        }

        const formData = new FormData();
        formData.append("archivo", file);

        btnImportarDatos.textContent = "Cargando…";
        btnImportarDatos.disabled = true;

        try {
            const res = await fetch("/importar-incidentes", {
                method: "POST",
                body: formData
            });
            const result = await res.json();
            
            if (!res.ok) {
                mostrarToast(result.error || "Error al importar", "error");
            } else {
                mostrarToast(`${result.mensaje}: ${result.exitos} exitosos, ${result.fallidos} fallidos`, "exito");
                cerrarModalImportar();
                filtrar(); // Recargar tabla y mapa
                contar();  // Recargar total de incidentes
            }
        } catch (error) {
            console.error(error);
            mostrarToast("Error de conexión al importar", "error");
        } finally {
            btnImportarDatos.textContent = "Importar datos";
            btnImportarDatos.disabled = false;
        }
    });
}

const btnDeshacerImportacion = document.getElementById("btnDeshacerImportacion");
const modalConfirmarDeshacer = document.getElementById("modalConfirmarDeshacer");
const btnConfirmarDeshacer = document.getElementById("btnConfirmarDeshacer");
const btnCancelarDeshacer = document.getElementById("btnCancelarDeshacer");
const cerrarModalDeshacer = document.getElementById("cerrarModalDeshacer");

if (btnDeshacerImportacion) {
    btnDeshacerImportacion.addEventListener("click", (e) => {
        e.preventDefault();
        modalConfirmarDeshacer.classList.remove("esconder");
    });
}

const ocultarModalDeshacer = () => {
    modalConfirmarDeshacer.classList.add("esconder");
};

if (btnCancelarDeshacer) btnCancelarDeshacer.addEventListener("click", ocultarModalDeshacer);
if (cerrarModalDeshacer) cerrarModalDeshacer.addEventListener("click", ocultarModalDeshacer);

if (btnConfirmarDeshacer) {
    btnConfirmarDeshacer.addEventListener("click", async () => {
        ocultarModalDeshacer();
        btnDeshacerImportacion.disabled = true;
        btnDeshacerImportacion.textContent = "Deshaciendo...";

        try {
            const res = await fetch("/importados/ultimo", {
                method: "DELETE"
            });
            const result = await res.json();
            
            if (!res.ok) {
                mostrarToast(result.error || "Error al deshacer", "error");
            } else {
                mostrarToast(`${result.mensaje} (${result.eliminados} incidentes)`, "exito");
                cerrarModalImportar();
                filtrar(); // Recargar mapa y tabla
                contar();  // Actualizar el total de incidentes
            }
        } catch (error) {
            console.error(error);
            mostrarToast("Error de conexión", "error");
        } finally {
            btnDeshacerImportacion.innerHTML = 'Deshacer última importación masiva';
            btnDeshacerImportacion.disabled = false;
        }
    });
}

/* ════════════════════════════════════════════════════════════════
   FASE 4: GESTIÓN DE USUARIOS (RBAC COMPLETA), AUDITORÍA Y FILTROS
   ════════════════════════════════════════════════════════════════ */

let allUsuarios = [];
let usuariosFiltrados = [];
let paginaActualUsuarios = 1;
const filasPorPaginaUsuarios = 10;
let usuarioAEliminarId = null;

// Cargar lista de usuarios desde API
async function cargarUsuarios() {
    const tbody = document.getElementById("tablaUsuarios");
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--texto-suave);">Cargando usuarios…</td></tr>';

    try {
        const res = await fetch("/api/usuarios");
        if (res.status === 401) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #f87171; padding: 20px;">🔒 Sesión no válida o expirada. Redirigiendo a inicio de sesión…</td></tr>';
            setTimeout(() => { window.location.href = "/login/index.html"; }, 1200);
            return;
        }
        if (res.status === 403) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #f87171; padding: 20px;">⛔ Acceso denegado: Permisos insuficientes para administrar usuarios.</td></tr>';
            return;
        }
        if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
        allUsuarios = await res.json();

        if (!Array.isArray(allUsuarios)) allUsuarios = [];

        // 1. Actualizar KPIs Resumen
        actualizarKpisUsuarios(allUsuarios);

        // 2. Aplicar Filtros y Renderizar Tabla
        aplicarFiltrosUsuarios();

    } catch (err) {
        console.error("Error en cargarUsuarios:", err);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #f87171; padding: 20px;">Error al consultar usuarios del sistema.</td></tr>';
    }
}

// Calcular y renderizar Tarjetas KPI de Usuarios
function actualizarKpisUsuarios(lista) {
    const elTotal = document.getElementById("kpiTotalUsuarios");
    const elSupers = document.getElementById("kpiSuperadmins");
    const elAdmins = document.getElementById("kpiAdmins");
    const elRepors = document.getElementById("kpiReporteros");
    const elBloq = document.getElementById("kpiBloqueados");

    if (elTotal) elTotal.innerText = lista.length;
    if (elSupers) elSupers.innerText = lista.filter(u => u.rol === 'superadmin').length;
    if (elAdmins) elAdmins.innerText = lista.filter(u => u.rol === 'admin').length;
    if (elRepors) elRepors.innerText = lista.filter(u => u.rol === 'reportero').length;
    if (elBloq) elBloq.innerText = lista.filter(u => u.estado !== 'activo').length;
}

// Aplicar búsqueda y filtros
function aplicarFiltrosUsuarios() {
    const query = (document.getElementById("buscarUsuarioInput")?.value || "").toLowerCase().trim();
    const rolFiltro = document.getElementById("filtroRolUsuario")?.value || "todos";
    const estadoFiltro = document.getElementById("filtroEstadoUsuario")?.value || "todos";

    usuariosFiltrados = allUsuarios.filter(u => {
        const cumpleNombre = !query || 
            (u.nombreusuario && u.nombreusuario.toLowerCase().includes(query)) ||
            (u.email && u.email.toLowerCase().includes(query)) ||
            (u.dependencia && u.dependencia.toLowerCase().includes(query));

        const cumpleRol = rolFiltro === "todos" || u.rol === rolFiltro;
        const cumpleEstado = estadoFiltro === "todos" || u.estado === estadoFiltro;

        return cumpleNombre && cumpleRol && cumpleEstado;
    });

    paginaActualUsuarios = 1;
    renderizarTablaUsuarios();
}

// Formatear Fecha
function formatearFechaHora(fechaStr) {
    if (!fechaStr) return 'Nunca';
    try {
        const f = new Date(fechaStr);
        if (isNaN(f.getTime())) return 'Nunca';
        return f.toLocaleString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return 'Nunca';
    }
}

// Renderizar Tabla con Paginación
function renderizarTablaUsuarios() {
    const tbody = document.getElementById("tablaUsuarios");
    const infoPag = document.getElementById("infoPaginacionUsuarios");
    const labelPag = document.getElementById("labelPaginaUsuario");
    const btnAnt = document.getElementById("btnPagAntUsuario");
    const btnSig = document.getElementById("btnPagSigUsuario");

    if (!tbody) return;

    const totalRegs = usuariosFiltrados.length;

    if (totalRegs === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 25px; color: var(--texto-suave);">No se encontraron usuarios coincidentes.</td></tr>';
        if (infoPag) infoPag.innerText = "Mostrando 0 de 0 usuarios";
        if (labelPag) labelPag.innerText = "Página 0 de 0";
        if (btnAnt) btnAnt.disabled = true;
        if (btnSig) btnSig.disabled = true;
        return;
    }

    const totalPaginas = Math.ceil(totalRegs / filasPorPaginaUsuarios);
    if (paginaActualUsuarios > totalPaginas) paginaActualUsuarios = totalPaginas;

    const inicio = (paginaActualUsuarios - 1) * filasPorPaginaUsuarios;
    const fin = Math.min(inicio + filasPorPaginaUsuarios, totalRegs);
    const paginados = usuariosFiltrados.slice(inicio, fin);

    tbody.innerHTML = "";
    paginados.forEach((u, idx) => {
        let rolBadge = '';
        if (u.rol === 'superadmin') {
            rolBadge = `<span class="badge-rol badge-rol-superadmin">Superadmin</span>`;
        } else if (u.rol === 'admin') {
            rolBadge = `<span class="badge-rol badge-rol-admin">Admin</span>`;
        } else {
            rolBadge = `<span class="badge-rol badge-rol-reportero">Reportero</span>`;
        }

        let estadoBadge = '';
        if (u.estado === 'activo') {
            estadoBadge = `<span class="badge-estado-usr badge-usr-activo">Activo</span>`;
        } else if (u.estado === 'bloqueado') {
            estadoBadge = `<span class="badge-estado-usr badge-usr-bloqueado">Bloqueado</span>`;
        } else {
            estadoBadge = `<span class="badge-estado-usr badge-usr-inactivo">Inactivo</span>`;
        }

        const fechaRegFmt = formatearFechaHora(u.fecha_registro);

        const tr = document.createElement("tr");
        tr.className = "fila-incidente-hover";
        tr.innerHTML = `
            <td class="celda-consecutivo" style="text-align: center;">${inicio + idx + 1}</td>
            <td style="font-weight: 600; color: var(--texto);">${u.nombreusuario}</td>
            <td>${rolBadge}</td>
            <td>${estadoBadge}</td>
            <td style="color: var(--texto-suave); font-size: 0.82rem;">${fechaRegFmt}</td>
            <td class="celda-acciones celda-centrada">
                <div class="acciones-iconos-wrap">
                    <button type="button" class="btn-icon-usr btn-view-user" data-id="${u.idusuario}" title="Ver todos los detalles del usuario" aria-label="Ver usuario">
                        <i class="bi bi-eye" aria-hidden="true"></i>
                    </button>
                    <button type="button" class="btn-icon-usr btn-edit-user" data-id="${u.idusuario}" title="Editar usuario" aria-label="Editar usuario">
                        <i class="bi bi-pencil" aria-hidden="true"></i>
                    </button>
                    <button type="button" class="btn-icon-usr btn-toggle-estado ${u.estado === 'activo' ? 'btn-usr-bloquear' : 'btn-usr-activar'}" data-id="${u.idusuario}" data-estado="${u.estado}" title="${u.estado === 'activo' ? 'Bloquear acceso' : 'Activar acceso'}" aria-label="${u.estado === 'activo' ? 'Bloquear usuario' : 'Activar usuario'}">
                        <i class="bi ${u.estado === 'activo' ? 'bi-slash-circle' : 'bi-check-circle'}" aria-hidden="true"></i>
                    </button>
                    <button type="button" class="btn-icon-usr btn-delete-user" data-id="${u.idusuario}" data-nombre="${u.nombreusuario}" title="Eliminar usuario" aria-label="Eliminar usuario">
                        <i class="bi bi-trash3" aria-hidden="true"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Actualizar Paginación Info
    if (infoPag) infoPag.innerText = `Mostrando ${inicio + 1} - ${fin} de ${totalRegs} usuarios`;
    if (labelPag) labelPag.innerText = `Página ${paginaActualUsuarios} de ${totalPaginas}`;
    if (btnAnt) btnAnt.disabled = paginaActualUsuarios === 1;
    if (btnSig) btnSig.disabled = paginaActualUsuarios === totalPaginas;

    // Asignar Event Listeners a Botones de la Tabla
    asignarEventosAccionesUsuarios();
}

// Event Listeners de Acciones en la Tabla
function asignarEventosAccionesUsuarios() {
    // 1. Botones Conmutar Estado (Bloquear / Activar)
    document.querySelectorAll(".btn-toggle-estado").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const targetBtn = e.target.closest(".btn-toggle-estado");
            if (!targetBtn) return;

            const id = targetBtn.dataset.id;
            const estadoActual = targetBtn.dataset.estado;
            const nuevoEstado = estadoActual === 'activo' ? 'bloqueado' : 'activo';

            try {
                const res = await fetch(`/api/usuarios/${id}/estado`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ estado: nuevoEstado })
                });
                const data = await res.json();
                if (res.ok) {
                    mostrarToast(`✅ Estado actualizado a '${nuevoEstado}'`, "exito");
                    cargarUsuarios();
                } else {
                    mostrarToast(`❌ ${data.mensaje || "Error actualizando estado"}`, "error");
                }
            } catch (err) {
                console.error("Error al cambiar estado usuario:", err);
                mostrarToast("❌ Error de conexión al actualizar usuario", "error");
            }
        });
    });

    // Event delegation global en la tabla de usuarios
    const tablaUsuarios = document.getElementById("tablaUsuarios");
    if (tablaUsuarios) {
        tablaUsuarios.onclick = (e) => {
            const btnView = e.target.closest(".btn-view-user");
            if (btnView) {
                const id = parseInt(btnView.dataset.id);
                abrirModalDetalleUsuario(id);
                return;
            }

            const btnEdit = e.target.closest(".btn-edit-user");
            if (btnEdit) {
                const id = parseInt(btnEdit.dataset.id);
                const userObj = allUsuarios.find(u => u.idusuario === id);
                if (userObj) abrirModalEditarUsuario(userObj);
                return;
            }

            const btnDel = e.target.closest(".btn-delete-user");
            if (btnDel) {
                const id = parseInt(btnDel.dataset.id);
                const nombre = btnDel.dataset.nombre;
                abrirModalEliminarUsuario(id, nombre);
                return;
            }
        };
    }
}

// Abrir Modal de Detalles Completos de Usuario
function abrirModalDetalleUsuario(id) {
    const usuario = allUsuarios.find(u => u.idusuario === parseInt(id));
    if (!usuario) return;

    const modal = document.getElementById("modalDetalleUsuario");
    if (!modal) return;

    const elDetUserId = document.getElementById("detUserId");
    if (elDetUserId) elDetUserId.innerText = "";
    document.getElementById("detUserNombre").innerText = usuario.nombreusuario || "Sin nombre";
    document.getElementById("detUserEmail").innerText = usuario.email || "No registrado";
    document.getElementById("detUserDependencia").innerText = usuario.dependencia || usuario.entidadusuario || "General";
    document.getElementById("detUserTelefono").innerText = usuario.telefono || "No registrado";
    document.getElementById("detUserFechaRegistro").innerText = formatearFechaHora(usuario.fecha_registro);
    document.getElementById("detUserUltimoAcceso").innerText = formatearFechaHora(usuario.ultimo_acceso);

    // Inicial Avatar
    const initial = (usuario.nombreusuario || "U").charAt(0).toUpperCase();
    const avatarEl = document.getElementById("detUserAvatar");
    if (avatarEl) avatarEl.innerText = initial;

    // Rol badge & Nivel de Permisos
    const elRolBadge = document.getElementById("detUserRolBadge");
    const elPermisos = document.getElementById("detUserNivelPermisos");
    if (usuario.rol === 'superadmin') {
        if (elRolBadge) elRolBadge.innerHTML = `<span style="background: rgba(124, 58, 237, 0.15); color: #a78bfa; border: 1px solid rgba(124, 58, 237, 0.3); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">Superadmin</span>`;
        if (elPermisos) elPermisos.innerText = "Acceso Total al Sistema y Auditoría";
    } else if (usuario.rol === 'admin') {
        if (elRolBadge) elRolBadge.innerHTML = `<span style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">Admin</span>`;
        if (elPermisos) elPermisos.innerText = "Gestión de Incidentes y Reportes";
    } else {
        if (elRolBadge) elRolBadge.innerHTML = `<span style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">Reportero</span>`;
        if (elPermisos) elPermisos.innerText = "Creación y Consulta de Reportes";
    }

    // Estado badge
    const elEstadoBadge = document.getElementById("detUserEstadoBadge");
    if (usuario.estado === 'activo') {
        if (elEstadoBadge) elEstadoBadge.innerHTML = `<span style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">Activo</span>`;
    } else if (usuario.estado === 'bloqueado') {
        if (elEstadoBadge) elEstadoBadge.innerHTML = `<span style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">Bloqueado</span>`;
    } else {
        if (elEstadoBadge) elEstadoBadge.innerHTML = `<span style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">Inactivo</span>`;
    }

    modal.style.display = "flex";
}

function cerrarModalDetalleUsuario() {
    const modal = document.getElementById("modalDetalleUsuario");
    if (modal) modal.style.display = "none";
}

// Abrir Modal para Crear Usuario
function abrirModalCrearUsuario() {
    console.log("abrirModalCrearUsuario ejecutado");
    const modal = document.getElementById("modalNuevoUsuario");
    const form = document.getElementById("formCrearUsuario");
    const title = document.getElementById("modalUsuarioTitle");
    const editUserId = document.getElementById("editUserId");

    if (!modal || !form) {
        console.error("No se encontró el elemento modalNuevoUsuario en el DOM");
        return;
    }

    form.reset();
    const modalAlert = document.getElementById("modalUserAlert");
    if (modalAlert) modalAlert.style.display = "none";
    if (editUserId) editUserId.value = "";
    if (title) title.innerHTML = "Crear nuevo usuario";

    modal.classList.add("active");
    modal.style.setProperty("display", "flex", "important");
    modal.style.setProperty("visibility", "visible", "important");
    modal.style.setProperty("opacity", "1", "important");
    modal.style.setProperty("z-index", "999999", "important");
}

// Cerrar Modal de Usuario
function cerrarModalUsuario() {
    const modal = document.getElementById("modalNuevoUsuario");
    if (modal) {
        modal.classList.remove("active");
        modal.style.setProperty("display", "none", "important");
    }
}

// Abrir Modal para Editar Usuario
function abrirModalEditarUsuario(u) {
    console.log("abrirModalEditarUsuario ejecutado para:", u);
    const modal = document.getElementById("modalNuevoUsuario");
    const title = document.getElementById("modalUsuarioTitle");

    if (!modal) {
        console.error("No se encontró el elemento modalNuevoUsuario en el DOM");
        return;
    }

    const modalAlert = document.getElementById("modalUserAlert");
    if (modalAlert) modalAlert.style.display = "none";

    document.getElementById("editUserId").value = u.idusuario;
    document.getElementById("newNombreUsuario").value = u.nombreusuario || "";
    document.getElementById("newEmail").value = u.email || "";
    document.getElementById("newRol").value = u.rol || "reportero";
    document.getElementById("newEstado").value = u.estado || "activo";
    document.getElementById("newDependencia").value = u.dependencia || u.entidadusuario || "";
    document.getElementById("newTelefono").value = u.telefono || "";

    if (title) title.innerText = `Editar usuario: ${u.nombreusuario || u.idusuario}`;

    modal.classList.add("active");
    modal.style.setProperty("display", "flex", "important");
    modal.style.setProperty("visibility", "visible", "important");
    modal.style.setProperty("opacity", "1", "important");
    modal.style.setProperty("z-index", "999999", "important");
}

// Abrir Modal para Confirmar Eliminación
function abrirModalEliminarUsuario(id, nombre) {
    const modal = document.getElementById("modalEliminarUsuario");
    const labelNombre = document.getElementById("deleteNombreUsuario");
    if (!modal) return;

    usuarioAEliminarId = id;
    if (labelNombre) labelNombre.innerText = nombre || `ID ${id}`;
    modal.style.display = "flex";
}

// Exportar a objeto window para acceso inline directo
window.abrirModalCrearUsuario = abrirModalCrearUsuario;
window.abrirModalEditarUsuario = abrirModalEditarUsuario;
window.abrirModalEliminarUsuario = abrirModalEliminarUsuario;
window.cerrarModalUsuario = cerrarModalUsuario;

// Event Listeners de Filtros y Buscador de Usuarios
document.getElementById("buscarUsuarioInput")?.addEventListener("input", aplicarFiltrosUsuarios);
document.getElementById("filtroRolUsuario")?.addEventListener("change", aplicarFiltrosUsuarios);
document.getElementById("filtroEstadoUsuario")?.addEventListener("change", aplicarFiltrosUsuarios);

document.getElementById("btnResetFiltrosUsuarios")?.addEventListener("click", () => {
    const inpSearch = document.getElementById("buscarUsuarioInput");
    const selRol = document.getElementById("filtroRolUsuario");
    const selEstado = document.getElementById("filtroEstadoUsuario");

    if (inpSearch) inpSearch.value = "";
    if (selRol) selRol.value = "todos";
    if (selEstado) selEstado.value = "todos";

    aplicarFiltrosUsuarios();
});

// Event Listeners de Paginación de Usuarios
document.getElementById("btnPagAntUsuario")?.addEventListener("click", () => {
    if (paginaActualUsuarios > 1) {
        paginaActualUsuarios--;
        renderizarTablaUsuarios();
    }
});

document.getElementById("btnPagSigUsuario")?.addEventListener("click", () => {
    const totalPaginas = Math.ceil(usuariosFiltrados.length / filasPorPaginaUsuarios);
    if (paginaActualUsuarios < totalPaginas) {
        paginaActualUsuarios++;
        renderizarTablaUsuarios();
    }
});

// Submit Formulario Crear / Editar Usuario
const formCrearUsuario = document.getElementById("formCrearUsuario");
if (formCrearUsuario) {
    formCrearUsuario.addEventListener("submit", async (e) => {
        e.preventDefault();

        const editId = document.getElementById("editUserId").value;
        const isEditing = !!editId;

        const payload = {
            nombreusuario: document.getElementById("newNombreUsuario").value,
            email: document.getElementById("newEmail").value,
            rol: document.getElementById("newRol").value,
            estado: document.getElementById("newEstado").value,
            dependencia: document.getElementById("newDependencia").value,
            telefono: document.getElementById("newTelefono").value
        };

        const url = isEditing ? `/api/usuarios/${editId}` : "/api/usuarios";
        const method = isEditing ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            const modalAlert = document.getElementById("modalUserAlert");

            if (res.ok) {
                // Inmediatamente salir del modal y limpiar los campos
                formCrearUsuario.reset();
                if (modalAlert) {
                    modalAlert.textContent = "";
                    modalAlert.style.display = "none";
                }
                cerrarModalUsuario();

                const toastMsg = isEditing ? "Usuario actualizado" : "Usuario registrado";
                mostrarToast(toastMsg, "exito");
                cargarUsuarios();
            } else {
                // Controlar error sin romper la app: mostrar el mensaje retornado por el backend
                if (modalAlert) {
                    modalAlert.textContent = data.mensaje || "Error al procesar usuario";
                    modalAlert.style.display = "block";
                }
                mostrarToast(data.mensaje || "Error al procesar usuario", "error");
            }
        } catch (err) {
            console.error("Error al procesar usuario:", err);
            const modalAlert = document.getElementById("modalUserAlert");
            if (modalAlert) {
                modalAlert.textContent = "❌ Error de conexión con el servidor";
                modalAlert.style.display = "block";
            }
            mostrarToast("❌ Error de conexión con el servidor", "error");
        }
    });
}

// Botones Abrir / Cerrar Modales de Usuario
const btnNuevoUsuario = document.getElementById("btnNuevoUsuario");
const btnCerrarModalUsuario = document.getElementById("btnCerrarModalUsuario");

if (btnCerrarModalUsuario) {
    btnCerrarModalUsuario.addEventListener("click", cerrarModalUsuario);
}

// Modal Confirmar Eliminar Usuario
const btnConfirmarEliminarUser = document.getElementById("btnConfirmarEliminarUser");
const btnCancelarEliminarUser = document.getElementById("btnCancelarEliminarUser");

if (btnCancelarEliminarUser) {
    btnCancelarEliminarUser.addEventListener("click", () => {
        document.getElementById("modalEliminarUsuario").style.display = "none";
        usuarioAEliminarId = null;
    });
}

if (btnConfirmarEliminarUser) {
    btnConfirmarEliminarUser.addEventListener("click", async () => {
        if (!usuarioAEliminarId) return;

        try {
            const res = await fetch(`/api/usuarios/${usuarioAEliminarId}`, {
                method: "DELETE"
            });
            const data = await res.json();

            if (res.ok) {
                mostrarToast(`✅ ${data.mensaje}`, "exito");
                document.getElementById("modalEliminarUsuario").style.display = "none";
                usuarioAEliminarId = null;
                cargarUsuarios();
            } else {
                mostrarToast(`❌ ${data.mensaje || "Error eliminando usuario"}`, "error");
            }
        } catch (err) {
            console.error("Error al eliminar usuario:", err);
            mostrarToast("❌ Error de conexión al eliminar usuario", "error");
        }
    });
}

// Cierre de Modales por Click en Fondo o Tecla ESC
window.addEventListener("click", (e) => {
    const modalUser = document.getElementById("modalNuevoUsuario");
    const modalDel = document.getElementById("modalEliminarUsuario");
    if (modalUser && e.target === modalUser) modalUser.style.display = "none";
    if (modalDel && e.target === modalDel) modalDel.style.display = "none";
});

window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        if (typeof cerrarModalUsuario === "function") cerrarModalUsuario();
        const modalDel = document.getElementById("modalEliminarUsuario");
        if (modalDel) modalDel.style.display = "none";
        
        const modalEdit = document.getElementById("modalEditar");
        if (modalEdit) modalEdit.style.display = "none";

        const modalTiempo = document.getElementById("modalFiltroTiempo");
        if (modalTiempo) modalTiempo.style.display = "none";

        if (typeof cerrarModalDetalle === "function") cerrarModalDetalle();
        if (typeof cerrarVisorFoto === "function") cerrarVisorFoto();
        if (typeof cerrarModalDetalleUsuario === "function") cerrarModalDetalleUsuario();

        const ventanaImport = document.querySelector(".ventana");
        if (ventanaImport) ventanaImport.classList.add("esconder");
        const modalConfirmDel = document.getElementById("modalConfirmarEliminar");
        if (modalConfirmDel) modalConfirmDel.classList.add("esconder");
        const modalConfirmDeshacer = document.getElementById("modalConfirmarDeshacer");
        if (modalConfirmDeshacer) modalConfirmDeshacer.classList.add("esconder");
    }
});

// ════════════════════════════════
// AUDITORÍA Y LOGS (SUPERADMIN)
// ════════════════════════════════
let todosLosLogs = [];
let logsFiltrados = [];
let paginaActualLogs = 1;
const filasPorPaginaLogs = 10;

// Cargar lista de logs de auditoría
async function cargarAuditoriaLogs() {
    const tbody = document.getElementById("tablaAuditoria");
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: var(--texto-suave);">Cargando registros de auditoría…</td></tr>';

    try {
        const res = await fetch("/api/usuarios/auditoria/logs");
        if (res.status === 401) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #f87171; padding: 20px;">🔒 Sesión no válida o expirada. Redirigiendo a inicio de sesión…</td></tr>';
            setTimeout(() => { window.location.href = "/login/index.html"; }, 1200);
            return;
        }
        if (res.status === 403) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #f87171; padding: 20px;">Acceso denegado: Permisos insuficientes para ver auditoría.</td></tr>';
            return;
        }
        if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
        todosLosLogs = await res.json();
        
        if (!Array.isArray(todosLosLogs)) todosLosLogs = [];

        // Actualizar KPIs de Auditoría
        const totalLogsEl = document.getElementById("kpiTotalLogs");
        const logsHoyEl = document.getElementById("kpiLogsHoy");
        if (totalLogsEl) totalLogsEl.innerText = todosLosLogs.length;
        if (logsHoyEl) {
            const hoyStr = new Date().toISOString().slice(0, 10);
            const countHoy = todosLosLogs.filter(l => {
                if (!l.fecha_hora) return false;
                const d = new Date(l.fecha_hora).toISOString().slice(0, 10);
                return d === hoyStr;
            }).length;
            logsHoyEl.innerText = countHoy;
        }

        aplicarFiltrosLogs();
    } catch (err) {
        console.error("Error en cargarAuditoriaLogs:", err);
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #f87171; padding: 20px;">Error al cargar auditoría.</td></tr>';
    }
}

function aplicarFiltrosLogs() {
    const busqueda = (document.getElementById("buscarLogInput")?.value || "").toLowerCase().trim();

    logsFiltrados = todosLosLogs.filter(l => {
        const coincideBusqueda = !busqueda || 
            (l.nombreusuario || "").toLowerCase().includes(busqueda) ||
            (l.accion || "").toLowerCase().includes(busqueda) ||
            (l.tabla_afectada || "").toLowerCase().includes(busqueda) ||
            (l.descripcion || "").toLowerCase().includes(busqueda) ||
            (l.ip_origen || "").toLowerCase().includes(busqueda);

        return coincideBusqueda;
    });

    paginaActualLogs = 1;
    renderizarTablaAuditoria();
}

function renderizarTablaAuditoria() {
    const tbody = document.getElementById("tablaAuditoria");
    const infoPag = document.getElementById("infoPaginacionLogs");
    const labelPag = document.getElementById("labelPaginaLog");
    const btnAnt = document.getElementById("btnPagAntLog");
    const btnSig = document.getElementById("btnPagSigLog");

    if (!tbody) return;

    if (logsFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--texto-suave);">No se encontraron registros de auditoría.</td></tr>';
        if (infoPag) infoPag.innerText = "Mostrando 0 de 0 logs";
        if (labelPag) labelPag.innerText = "Página 1 de 1";
        if (btnAnt) btnAnt.disabled = true;
        if (btnSig) btnSig.disabled = true;
        return;
    }

    const totalRegs = logsFiltrados.length;
    const totalPaginas = Math.ceil(totalRegs / filasPorPaginaLogs) || 1;

    if (paginaActualLogs > totalPaginas) paginaActualLogs = totalPaginas;
    if (paginaActualLogs < 1) paginaActualLogs = 1;

    const inicio = (paginaActualLogs - 1) * filasPorPaginaLogs;
    const fin = Math.min(inicio + filasPorPaginaLogs, totalRegs);
    const paginados = logsFiltrados.slice(inicio, fin);

    tbody.innerHTML = "";
    paginados.forEach((l, idx) => {
        const fechaFmt = formatearFechaHora(l.fecha_hora);
        const accionStr = (l.accion || "ACCION").toUpperCase();
        
        let accionBadge = '';
        if (accionStr.includes("CREAR") || accionStr.includes("INSERT") || accionStr.includes("NUEVO")) {
            accionBadge = `<span class="badge-accion badge-accion-crear">${accionStr}</span>`;
        } else if (accionStr.includes("ACTUALIZAR") || accionStr.includes("EDITAR") || accionStr.includes("UPDATE")) {
            accionBadge = `<span class="badge-accion badge-accion-actualizar">${accionStr}</span>`;
        } else if (accionStr.includes("ELIMINAR") || accionStr.includes("DELETE") || accionStr.includes("BLOQUEAR")) {
            accionBadge = `<span class="badge-accion badge-accion-eliminar">${accionStr}</span>`;
        } else {
            accionBadge = `<span class="badge-accion badge-accion-otro">${accionStr}</span>`;
        }

        const tr = document.createElement("tr");
        tr.className = "fila-incidente-hover";
        tr.innerHTML = `
            <td style="text-align: center;" class="celda-consecutivo">${inicio + idx + 1}</td>
            <td style="text-align: center; white-space: nowrap;">${fechaFmt}</td>
            <td style="font-weight: 600; color: var(--texto); text-align: center;">${l.nombreusuario || 'Sistema'}</td>
            <td style="text-align: center;">${accionBadge}</td>
            <td style="text-align: center;">${l.tabla_afectada || 'General'}</td>
            <td style="text-align: center;" class="celda-acciones">
                <button type="button" class="btn-primario-detalle btn-view-log" onclick="verDetalleLog(${l.id_log})" title="Ver todos los detalles del registro de auditoría">
                    <i class="bi bi-eye" aria-hidden="true"></i> Detalle
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (infoPag) infoPag.innerText = `Mostrando ${inicio + 1} - ${fin} de ${totalRegs} logs`;
    if (labelPag) labelPag.innerText = `Página ${paginaActualLogs} de ${totalPaginas}`;
    if (btnAnt) btnAnt.disabled = paginaActualLogs === 1;
    if (btnSig) btnSig.disabled = paginaActualLogs === totalPaginas;
}

// Ventana emergente con el detalle completo de un registro de auditoría
function verDetalleLog(idLog) {
    const log = todosLosLogs.find(l => l.id_log === parseInt(idLog));
    if (!log) return;

    const modal = document.getElementById("modalDetalleLog");
    if (!modal) return;

    const detTitulo = document.getElementById("detLogTitulo");
    const detBadge = document.getElementById("detLogBadgeAccion");
    const detFecha = document.getElementById("detLogFechaHora");
    const detUser = document.getElementById("detLogUsuario");
    const detEntidad = document.getElementById("detLogEntidad");
    const detIdReg = document.getElementById("detLogIdRegistro");
    const detIp = document.getElementById("detLogIp");
    const detDesc = document.getElementById("detLogDescripcion");

    if (detTitulo) detTitulo.innerText = `Actividad #${log.id_log}`;
    if (detFecha) detFecha.innerText = formatearFechaHora(log.fecha_hora);
    if (detUser) detUser.innerText = log.nombreusuario || 'Sistema';
    if (detEntidad) detEntidad.innerText = log.tabla_afectada || 'General';
    if (detIdReg) detIdReg.innerText = log.id_registro ? String(log.id_registro) : 'No aplica';
    if (detIp) detIp.innerText = log.ip_origen || '127.0.0.1';
    if (detDesc) detDesc.innerText = log.descripcion || 'Sin descripción adicional registrada.';

    if (detBadge) {
        const accionStr = (log.accion || "ACCION").toUpperCase();
        detBadge.innerText = accionStr;
        detBadge.className = "badge-accion";
        if (accionStr.includes("CREAR") || accionStr.includes("INSERT") || accionStr.includes("NUEVO")) {
            detBadge.classList.add("badge-accion-crear");
        } else if (accionStr.includes("ACTUALIZAR") || accionStr.includes("EDITAR") || accionStr.includes("UPDATE")) {
            detBadge.classList.add("badge-accion-actualizar");
        } else if (accionStr.includes("ELIMINAR") || accionStr.includes("DELETE") || accionStr.includes("BLOQUEAR")) {
            detBadge.classList.add("badge-accion-eliminar");
        } else {
            detBadge.classList.add("badge-accion-otro");
        }
    }

    modal.style.display = "flex";
}

function cerrarModalDetalleLog() {
    const modal = document.getElementById("modalDetalleLog");
    if (modal) modal.style.display = "none";
}

window.verDetalleLog = verDetalleLog;
window.cerrarModalDetalleLog = cerrarModalDetalleLog;

// Cerrar modal al hacer clic en el backdrop
const modalDetalleLogEl = document.getElementById("modalDetalleLog");
if (modalDetalleLogEl) {
    modalDetalleLogEl.addEventListener("click", (e) => {
        if (e.target === modalDetalleLogEl) {
            cerrarModalDetalleLog();
        }
    });
}

// Inicialización de Event Listeners de Auditoría Logs
document.getElementById("btnRefreshLogs")?.addEventListener("click", cargarAuditoriaLogs);

document.getElementById("buscarLogInput")?.addEventListener("input", aplicarFiltrosLogs);

document.getElementById("btnResetFiltrosLogs")?.addEventListener("click", () => {
    const buscarInput = document.getElementById("buscarLogInput");
    if (buscarInput) buscarInput.value = "";
    aplicarFiltrosLogs();
});

document.getElementById("btnPagAntLog")?.addEventListener("click", () => {
    if (paginaActualLogs > 1) {
        paginaActualLogs--;
        renderizarTablaAuditoria();
    }
});

document.getElementById("btnPagSigLog")?.addEventListener("click", () => {
    const totalPaginas = Math.ceil(logsFiltrados.length / filasPorPaginaLogs) || 1;
    if (paginaActualLogs < totalPaginas) {
        paginaActualLogs++;
        renderizarTablaAuditoria();
    }
});

let blobUrlActualPDF = null;

async function abrirVisorPDF() {
    const modal = document.getElementById("modalVisorPDF");
    const iframe = document.getElementById("iframeVisorPDF");
    const loader = document.getElementById("cargandoVisorPDF");
    const btnDescargar = document.getElementById("btnDescargarPDFModal");
    const btnAbrir = document.getElementById("btnAbrirNuevaPestanaPDF");
    const titulo = document.getElementById("tituloVisorPDF");

    if (!modal) return;

    modal.style.display = "flex";

    const ahora = new Date();
    const mes = ahora.getMonth() + 1;
    const anio = ahora.getFullYear();

    const nombreMeses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const nombreMes = nombreMeses[mes - 1] || 'Mes actual';

    if (titulo) {
        titulo.innerText = `Informe Ejecutivo — ${nombreMes} ${anio}`;
    }

    if (loader) {
        loader.classList.remove("oculto");
        loader.innerText = "Generando vista previa del documento…";
        loader.style.removeProperty("display");
    }

    try {
        const previewUrl = `/api/reportes/pdf?mes=${mes}&anio=${anio}&t=${Date.now()}`;
        const res = await fetch(previewUrl);
        if (!res.ok) {
            throw new Error(`Error en el servidor al generar el PDF (${res.status})`);
        }

        const blob = await res.blob();

        // Liberar URL anterior si existiera
        if (blobUrlActualPDF) {
            URL.revokeObjectURL(blobUrlActualPDF);
        }

        blobUrlActualPDF = URL.createObjectURL(blob);

        if (iframe) {
            iframe.src = blobUrlActualPDF;
        }

        if (btnDescargar) {
            btnDescargar.href = blobUrlActualPDF;
            btnDescargar.setAttribute("download", `Informe_Ejecutivo_SIGI_${nombreMes}_${anio}.pdf`);
        }

        if (btnAbrir) {
            btnAbrir.href = blobUrlActualPDF;
        }

        // Ocultar overlay de carga de forma inmediata y garantizada
        if (loader) {
            loader.classList.add("oculto");
            loader.style.setProperty("display", "none", "important");
        }
    } catch (err) {
        console.error("Error al cargar PDF:", err);
        if (loader) {
            loader.classList.remove("oculto");
            loader.style.removeProperty("display");
            loader.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <p style="color: #f87171; margin-bottom: 12px; font-weight: 600;">No se pudo previsualizar el documento automáticamente.</p>
                    <a href="/api/reportes/pdf?download=1" class="btn-modal-op btn-modal-tomar" style="text-decoration: none;">Descargar PDF directamente</a>
                </div>
            `;
        }
    }
}

function cerrarVisorPDF() {
    const modal = document.getElementById("modalVisorPDF");
    const iframe = document.getElementById("iframeVisorPDF");
    const loader = document.getElementById("cargandoVisorPDF");
    if (modal) modal.style.display = "none";
    if (iframe) iframe.src = "";
    if (loader) {
        loader.classList.remove("oculto");
        loader.style.removeProperty("display");
    }
    if (blobUrlActualPDF) {
        URL.revokeObjectURL(blobUrlActualPDF);
        blobUrlActualPDF = null;
    }
}

window.abrirVisorPDF = abrirVisorPDF;
window.cerrarVisorPDF = cerrarVisorPDF;

// Botón de Informe Ejecutivo en PDF (Abre ventana emergente de vista previa)
document.getElementById("btnReportePDF")?.addEventListener("click", (e) => {
    e.preventDefault();
    abrirVisorPDF();
});

// ════════════════════════════════
// GESTIÓN DE PERFIL (SUPERADMIN & ADMIN)
// ════════════════════════════════
let perfilUsuarioActual = null;

async function cargarDatosPerfil() {
    const alertaBox = document.getElementById("perfilAlertaBox");
    if (alertaBox) alertaBox.style.display = "none";

    try {
        const res = await fetch("/api/perfil");
        if (res.status === 401) {
            window.location.href = "/login/index.html";
            return;
        }
        if (!res.ok) throw new Error("Error al obtener información de tu perfil");

        const data = await res.json();
        perfilUsuarioActual = data;

        // Llenar Ficha Resumen
        const resumenNombre = document.getElementById("perfilResumenNombre");
        const resumenEmail = document.getElementById("perfilResumenEmail");
        const resumenId = document.getElementById("perfilResumenId");
        const resumenRol = document.getElementById("perfilResumenRol");
        const resumenEstado = document.getElementById("perfilResumenEstado");
        const resumenFechaReg = document.getElementById("perfilResumenFechaReg");
        const resumenUltimoAcceso = document.getElementById("perfilResumenUltimoAcceso");
        const avatarLetra = document.getElementById("perfilAvatarLetra");
        const rolTexto = document.getElementById("perfilRolTexto");

        const nombre = data.nombreusuario || "Usuario";
        if (resumenNombre) resumenNombre.innerText = nombre;
        if (avatarLetra) avatarLetra.innerText = nombre.charAt(0).toUpperCase();
        if (resumenEmail) resumenEmail.innerText = data.email || "No registrado";
        if (resumenId) resumenId.innerText = data.idusuario || "--";
        if (resumenRol) resumenRol.innerText = data.rol === 'superadmin' ? 'Superadministrador' : (data.rol === 'admin' ? 'Administrador' : 'Reportero');
        if (rolTexto) rolTexto.innerText = data.rol || '--';
        if (resumenEstado) resumenEstado.innerText = (data.estado || 'activo').toUpperCase();
        if (resumenFechaReg) resumenFechaReg.innerText = data.fecha_registro ? formatearFechaHora(data.fecha_registro) : '--';
        if (resumenUltimoAcceso) resumenUltimoAcceso.innerText = data.ultimo_acceso ? formatearFechaHora(data.ultimo_acceso) : 'Sesión activa';

        // Llenar Formulario
        const inputEmail = document.getElementById("perfilInputEmail");
        const inputTelefono = document.getElementById("perfilInputTelefono");
        const inputDependencia = document.getElementById("perfilInputDependencia");
        const passActual = document.getElementById("perfilPasswordActual");
        const passNuevo = document.getElementById("perfilPasswordNuevo");
        const passConfirmar = document.getElementById("perfilPasswordConfirmar");

        if (inputEmail) inputEmail.value = data.email || "";
        if (inputTelefono) inputTelefono.value = data.telefono || "";
        if (inputDependencia) inputDependencia.value = data.dependencia || "";
        if (passActual) passActual.value = "";
        if (passNuevo) passNuevo.value = "";
        if (passConfirmar) passConfirmar.value = "";
    } catch (err) {
        console.error("Error al cargar datos del perfil:", err);
        mostrarToast("No se pudo cargar la información del perfil", "error");
    }
}

// Envío del formulario de actualización de perfil
document.getElementById("formPerfilUsuario")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const alertaBox = document.getElementById("perfilAlertaBox");
    const email = document.getElementById("perfilInputEmail")?.value.trim();
    const telefono = document.getElementById("perfilInputTelefono")?.value.trim();
    const dependencia = document.getElementById("perfilInputDependencia")?.value.trim();
    const password_actual = document.getElementById("perfilPasswordActual")?.value;
    const password_nuevo = document.getElementById("perfilPasswordNuevo")?.value;
    const password_confirmar = document.getElementById("perfilPasswordConfirmar")?.value;

    if (alertaBox) {
        alertaBox.style.display = "none";
        alertaBox.className = "modal-alerta-box";
    }

    if (password_nuevo || password_confirmar) {
        if (!password_actual) {
            if (alertaBox) {
                alertaBox.innerText = "Debes ingresar tu contraseña actual para autorizar el cambio de clave.";
                alertaBox.style.display = "block";
            }
            return;
        }
        if (password_nuevo !== password_confirmar) {
            if (alertaBox) {
                alertaBox.innerText = "La nueva contraseña y su confirmación no coinciden.";
                alertaBox.style.display = "block";
            }
            return;
        }
        if (password_nuevo.length < 8) {
            if (alertaBox) {
                alertaBox.innerText = "La nueva contraseña debe tener al menos 8 caracteres.";
                alertaBox.style.display = "block";
            }
            return;
        }
        if (!/[A-Z]/.test(password_nuevo) || !/[a-z]/.test(password_nuevo) || !/\d/.test(password_nuevo)) {
            if (alertaBox) {
                alertaBox.innerText = "La nueva contraseña debe incluir al menos una mayúscula, una minúscula y un número.";
                alertaBox.style.display = "block";
            }
            return;
        }
    }

    const payload = { email, telefono, dependencia };
    if (password_nuevo) {
        payload.password_actual = password_actual;
        payload.password_nuevo = password_nuevo;
    }

    const btnSubmit = document.getElementById("btnGuardarPerfilSubmit");
    const textoOriginal = btnSubmit ? btnSubmit.innerText : "Guardar cambios";
    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerText = "Guardando...";
    }

    try {
        const res = await fetch("/api/perfil", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.mensaje || "Error al actualizar el perfil");
        }

        mostrarToast(data.mensaje || "Perfil actualizado correctamente", "exito");
        if (alertaBox) {
            alertaBox.className = "modal-alerta-box alerta-exito";
            alertaBox.innerText = data.mensaje || "Perfil actualizado exitosamente.";
            alertaBox.style.display = "block";
        }

        // Limpiar campos de contraseña
        const passActualEl = document.getElementById("perfilPasswordActual");
        const passNuevoEl = document.getElementById("perfilPasswordNuevo");
        const passConfirmarEl = document.getElementById("perfilPasswordConfirmar");
        if (passActualEl) passActualEl.value = "";
        if (passNuevoEl) passNuevoEl.value = "";
        if (passConfirmarEl) passConfirmarEl.value = "";

        // Refrescar datos del perfil
        cargarDatosPerfil();
    } catch (err) {
        console.error("Error al guardar perfil:", err);
        if (alertaBox) {
            alertaBox.className = "modal-alerta-box";
            alertaBox.innerText = err.message || "Error al procesar la actualización del perfil.";
            alertaBox.style.display = "block";
        }
        mostrarToast(err.message || "Error al actualizar perfil", "error");
    } finally {
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerText = textoOriginal;
        }
    }
});

document.getElementById("btnRestablecerFormPerfil")?.addEventListener("click", () => {
    cargarDatosPerfil();
});

// Sincronización en tiempo real recibida por WebSockets (Socket.io)
window.addEventListener("sigi:nuevo_incidente", () => {
    if (typeof cargarVerificaciones === "function") {
        cargarVerificaciones();
    }
});

window.addEventListener("sigi:incidente_actualizado", () => {
    if (typeof cargarVerificaciones === "function") {
        cargarVerificaciones();
    }
});

// ══════════════════════════════════════════════════════════════════
// GESTIÓN DE CATÁLOGO DE TIPOS DE INCIDENTES (EXCLUSIVO SUPERADMIN)
// ══════════════════════════════════════════════════════════════════

let allTipos = [];
let tiposFiltrados = [];
let paginaActualTipos = 1;
const registrosPorPaginaTipos = 10;
let tipoAEliminarId = null;

// Paleta institucional de colores recomendados (altamente contrastantes)
const PALETA_SUGERIDA = [
    '#06B6D4', '#2563EB', '#EC4899', '#6366F1', 
    '#64748B', '#EA580C', '#84CC16', '#0D9488', 
    '#E11D48', '#8B5CF6', '#D97706', '#14B8A6'
];

/**
 * Normaliza texto para comparaciones estrictas anti-duplicados
 */
function normalizarTextoLocal(txt) {
    if (!txt || typeof txt !== 'string') return '';
    return txt
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ');
}

/**
 * Convierte código HEX a RGB
 */
function hexToRgbLocal(hex) {
    let c = (hex || '').replace('#', '').trim();
    if (c.length === 3) {
        c = c.split('').map(x => x + x).join('');
    }
    const num = parseInt(c, 16);
    if (isNaN(num)) return { r: 0, g: 0, b: 0 };
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
}

/**
 * Calcula la distancia perceptual ponderada de color (Redmean)
 */
function calcularDistanciaColorLocal(hex1, hex2) {
    if (!hex1 || !hex2) return 999;
    const rgb1 = hexToRgbLocal(hex1);
    const rgb2 = hexToRgbLocal(hex2);
    const rMean = (rgb1.r + rgb2.r) / 2;
    const deltaR = rgb1.r - rgb2.r;
    const deltaG = rgb1.g - rgb2.g;
    const deltaB = rgb1.b - rgb2.b;
    return Math.sqrt(
        (2 + rMean / 256) * deltaR * deltaR +
        4 * deltaG * deltaG +
        (2 + (255 - rMean) / 256) * deltaB * deltaB
    );
}

/**
 * Consulta la lista completa de tipos de incidentes y actualiza el mapa de colores
 */
async function cargarTiposIncidentes() {
    const tbody = document.getElementById("cuerpoTablaTipos");
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 24px; color: var(--texto-suave);">Cargando catálogo de tipos de incidentes…</td></tr>';

    try {
        const [resTipos, resCatalogos] = await Promise.all([
            fetch("/api/catalogos/tipos"),
            fetch("/api/catalogos")
        ]);

        if (resTipos.status === 401 || resTipos.status === 403) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #f87171; padding: 20px;">⛔ Acceso restringido: Solo el Superadministrador puede gestionar este catálogo.</td></tr>';
            return;
        }

        if (!resTipos.ok) throw new Error(`Error HTTP ${resTipos.status}`);
        allTipos = await resTipos.json();
        if (!Array.isArray(allTipos)) allTipos = [];

        // Poblar mapa global de tipos para colores dinámicos en mapa y badges
        allTipos.forEach(t => {
            catalogoTiposMap[t.idtipoincidente] = t;
        });

        // Cargar categorías en el select de filtros y en el modal
        if (resCatalogos.ok) {
            const dataCat = await resCatalogos.json();
            poblarSelectsCategorias(dataCat.categorias || []);
        }

        // 1. Actualizar KPIs
        actualizarKpisTipos(allTipos);

        // 2. Aplicar filtros y renderizar
        aplicarFiltrosTipos();

    } catch (err) {
        console.error("Error al cargarTiposIncidentes:", err);
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #f87171; padding: 20px;">Error al consultar tipos de incidentes.</td></tr>';
    }
}

/**
 * Llena los selects de categorías en la barra de filtros y en el modal
 */
function poblarSelectsCategorias(categorias) {
    const filtroCat = document.getElementById("filtroCategoriaTipo");
    const modalCat = document.getElementById("tipoCategoriaSelect");

    if (filtroCat) {
        const valorPrevio = filtroCat.value;
        filtroCat.innerHTML = '<option value="todas">Todas las categorías</option>';
        categorias.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.id_categoria;
            opt.textContent = c.nombre;
            filtroCat.appendChild(opt);
        });
        if (valorPrevio) filtroCat.value = valorPrevio;
    }

    if (modalCat) {
        modalCat.innerHTML = '<option value="" disabled selected>Seleccione categoría macro</option>';
        categorias.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.id_categoria;
            opt.textContent = c.nombre;
            modalCat.appendChild(opt);
        });
    }
}

/**
 * Actualiza los badges de métricas en la parte superior
 */
function actualizarKpisTipos(lista) {
    const elTotal = document.getElementById("kpiTotalTipos");
    const elActivos = document.getElementById("kpiTiposActivos");
    const elInactivos = document.getElementById("kpiTiposInactivos");
    const elConInc = document.getElementById("kpiTiposConIncidentes");

    if (elTotal) elTotal.innerText = lista.length;
    if (elActivos) elActivos.innerText = lista.filter(t => t.activo).length;
    if (elInactivos) elInactivos.innerText = lista.filter(t => !t.activo).length;
    if (elConInc) elConInc.innerText = lista.filter(t => (t.total_incidentes || 0) > 0).length;
}

/**
 * Filtra los tipos según búsqueda, categoría y estado
 */
function aplicarFiltrosTipos() {
    const query = normalizarTextoLocal(document.getElementById("buscarTipoInput")?.value || "");
    const catFiltro = document.getElementById("filtroCategoriaTipo")?.value || "todas";
    const estadoFiltro = document.getElementById("filtroEstadoTipo")?.value || "todos";

    tiposFiltrados = allTipos.filter(t => {
        const nombreNorm = normalizarTextoLocal(t.nametipoincidente);
        const descNorm = normalizarTextoLocal(t.descripcion || "");
        const coincideTexto = !query || nombreNorm.includes(query) || descNorm.includes(query);

        const coincideCat = catFiltro === "todas" || String(t.id_categoria) === String(catFiltro);
        const coincideEstado = estadoFiltro === "todos" || 
            (estadoFiltro === "activo" && t.activo) || 
            (estadoFiltro === "inactivo" && !t.activo);

        return coincideTexto && coincideCat && coincideEstado;
    });

    paginaActualTipos = 1;
    renderizarTablaTipos();
}

/**
 * Renderiza la tabla de tipos con paginación de 10 registros, numeración consecutiva y diseño unificado SIGI
 */
function renderizarTablaTipos() {
    const tbody = document.getElementById("cuerpoTablaTipos");
    const infoPag = document.getElementById("infoPaginacionTipos");
    const labelPag = document.getElementById("labelPaginaTipos");
    const btnAnt = document.getElementById("btnPagAntTipos");
    const btnSig = document.getElementById("btnPagSigTipos");

    if (!tbody) return;

    if (tiposFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 24px; color: var(--texto-suave);">No se encontraron tipos de incidentes que coincidan con los filtros.</td></tr>';
        if (infoPag) infoPag.innerText = "Mostrando 0 de 0 tipos";
        if (labelPag) labelPag.innerText = "Página 1 de 1";
        if (btnAnt) btnAnt.disabled = true;
        if (btnSig) btnSig.disabled = true;
        return;
    }

    const totalRegistros = tiposFiltrados.length;
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPaginaTipos) || 1;
    if (paginaActualTipos > totalPaginas) paginaActualTipos = totalPaginas;

    const inicio = (paginaActualTipos - 1) * registrosPorPaginaTipos;
    const fin = Math.min(inicio + registrosPorPaginaTipos, totalRegistros);
    const paginaTipos = tiposFiltrados.slice(inicio, fin);

    let html = "";
    paginaTipos.forEach((t, index) => {
        const numConsecutivo = inicio + index + 1;
        const colorHex = (t.color || "#3b82f6").toUpperCase();
        const categoriaTxt = t.categoria_nombre || "General";
        const riesgo = (t.nivel_riesgo_base || "media").toLowerCase();
        const tieneIncidentes = (t.total_incidentes || 0) > 0;

        let badgeRiesgoStyle = "background: rgba(148, 163, 184, 0.15); color: var(--texto-suave); border: 1px solid rgba(148, 163, 184, 0.25);";
        if (riesgo === 'baja') badgeRiesgoStyle = "background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);";
        if (riesgo === 'media') badgeRiesgoStyle = "background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3);";
        if (riesgo === 'alta') badgeRiesgoStyle = "background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3);";
        if (riesgo === 'critica') badgeRiesgoStyle = "background: rgba(220, 38, 38, 0.25); color: #f87171; border: 1px solid rgba(220, 38, 38, 0.45); font-weight: 700;";

        html += `
            <tr class="fila-incidente-hover" style="border-bottom: 1px solid var(--borde); transition: background 0.15s ease;">
                <td class="celda-consecutivo" style="text-align: center; font-weight: 700; color: var(--texto-suave); font-size: 0.8rem;">
                    ${numConsecutivo}
                </td>
                <td class="celda-color-tipo" style="text-align: center;">
                    <div style="display: inline-flex; align-items: center; gap: 6px; background: var(--bg-card); padding: 3px 8px; border-radius: 20px; border: 1px solid var(--borde);">
                        <span style="width: 14px; height: 14px; border-radius: 50%; background: ${colorHex}; display: inline-block; box-shadow: 0 0 6px ${colorHex}80;"></span>
                        <code style="font-size: 0.72rem; font-weight: 700; color: var(--texto);">${colorHex}</code>
                    </div>
                </td>
                <td class="celda-nombre-tipo">
                    <div class="tipo-nombre-titulo">
                        ${t.nametipoincidente}
                    </div>
                    ${t.descripcion ? `<div class="tipo-descripcion-sub">${t.descripcion}</div>` : ''}
                </td>
                <td class="celda-cat-tipo" style="font-size: 0.82rem; color: var(--texto);">
                    ${categoriaTxt}
                </td>
                <td class="celda-riesgo-tipo" style="text-align: center;">
                    <span style="padding: 3px 9px; border-radius: 12px; font-size: 0.72rem; font-weight: 600; text-transform: capitalize; ${badgeRiesgoStyle}">
                        ${riesgo}
                    </span>
                </td>
                <td class="celda-incidentes-tipo" style="text-align: center;">
                    <span style="display: inline-block; padding: 2px 10px; border-radius: 12px; font-weight: 700; font-size: 0.78rem; background: ${tieneIncidentes ? 'rgba(59, 130, 246, 0.15)' : 'rgba(148, 163, 184, 0.1)'}; color: ${tieneIncidentes ? '#60a5fa' : 'var(--texto-suave)'}; border: 1px solid ${tieneIncidentes ? 'rgba(59, 130, 246, 0.3)' : 'var(--borde)'};">
                        ${t.total_incidentes || 0}
                    </span>
                </td>
                <td class="celda-estado-tipo" style="text-align: center;">
                    <span class="badge-estado-usr ${t.activo ? 'badge-usr-activo' : 'badge-usr-inactivo'}">
                        ${t.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td class="celda-acciones celda-centrada celda-acciones-tipo">
                    <div class="acciones-iconos-wrap">
                        <button type="button" class="btn-icon-usr btn-edit-user" title="Editar tipo de incidente" onclick="abrirModalEditarTipo(${t.idtipoincidente})" aria-label="Editar tipo">
                            <i class="bi bi-pencil" aria-hidden="true"></i>
                        </button>
                        <button type="button" class="btn-icon-usr ${t.activo ? 'btn-usr-bloquear' : 'btn-usr-activar'}" title="${t.activo ? 'Inactivar tipo de incidente' : 'Activar tipo de incidente'}" onclick="solicitarCambioEstadoTipo(${t.idtipoincidente}, ${!t.activo})" aria-label="${t.activo ? 'Inactivar' : 'Activar'}">
                            <i class="bi ${t.activo ? 'bi-toggle-on' : 'bi-toggle-off'}" style="font-size: 1.15rem;" aria-hidden="true"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;

    if (infoPag) infoPag.innerText = `Mostrando ${inicio + 1} a ${fin} de ${totalRegistros} tipos`;
    if (labelPag) labelPag.innerText = `Página ${paginaActualTipos} de ${totalPaginas}`;
    if (btnAnt) btnAnt.disabled = paginaActualTipos <= 1;
    if (btnSig) btnSig.disabled = paginaActualTipos >= totalPaginas;
}

/**
 * Paginación de tabla de tipos (Tope estándar de 10 registros por página)
 */
document.getElementById("btnPagAntTipos")?.addEventListener("click", () => {
    if (paginaActualTipos > 1) {
        paginaActualTipos--;
        renderizarTablaTipos();
    }
});
document.getElementById("btnPagSigTipos")?.addEventListener("click", () => {
    const totalPaginas = Math.ceil(tiposFiltrados.length / registrosPorPaginaTipos) || 1;
    if (paginaActualTipos < totalPaginas) {
        paginaActualTipos++;
        renderizarTablaTipos();
    }
});

// Event listeners de filtros de tipos
document.getElementById("buscarTipoInput")?.addEventListener("input", () => aplicarFiltrosTipos());
document.getElementById("filtroCategoriaTipo")?.addEventListener("change", () => aplicarFiltrosTipos());
document.getElementById("filtroEstadoTipo")?.addEventListener("change", () => aplicarFiltrosTipos());
document.getElementById("btnResetFiltrosTipos")?.addEventListener("click", () => {
    const bInput = document.getElementById("buscarTipoInput");
    const cSelect = document.getElementById("filtroCategoriaTipo");
    const eSelect = document.getElementById("filtroEstadoTipo");
    if (bInput) bInput.value = "";
    if (cSelect) cSelect.value = "todas";
    if (eSelect) eSelect.value = "todos";
    aplicarFiltrosTipos();
});

/**
 * Ventana emergente de advertencia previa al inactivar o activar un tipo de incidente
 */
let estadoTipoPendiente = { id: null, nuevoEstado: null };

function solicitarCambioEstadoTipo(id, nuevoEstado) {
    const tipo = allTipos.find(t => t.idtipoincidente === parseInt(id));
    if (!tipo) return;

    estadoTipoPendiente = { id, nuevoEstado };
    const modal = document.getElementById("modalConfirmarEstadoTipo");
    const titulo = document.getElementById("tituloConfirmarEstadoTipo");
    const mensaje = document.getElementById("mensajeConfirmarEstadoTipo");
    const btnConfirmar = document.getElementById("btnConfirmarAccionEstadoTipo");

    if (nuevoEstado === false) {
        // Confirmación para inactivar
        if (titulo) titulo.innerText = "Inactivar tipo de incidente";
        if (mensaje) {
            mensaje.innerHTML = `
                ¿Deseas inactivar el tipo de incidente <strong style="color: var(--texto); font-weight: 700;">"${tipo.nametipoincidente}"</strong>?
                <div style="margin-top: 14px; padding: 12px 14px; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 8px; font-size: 0.8rem; color: #fbbf24; line-height: 1.5;">
                    <div style="font-weight: 700; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.04em; margin-bottom: 4px; color: #f59e0b;">Efecto en el sistema</div>
                    Al inactivarlo, este tipo no aparecerá en los formularios para nuevos reportes de incidentes. Sin embargo, se conservará intacto en todos los registros históricos, estadísticas y mapas previos.
                </div>
            `;
        }
        if (btnConfirmar) {
            btnConfirmar.innerText = "Sí, inactivar";
            btnConfirmar.style.background = "#f59e0b";
            btnConfirmar.style.color = "#000000";
        }
    } else {
        // Confirmación para activar
        if (titulo) titulo.innerText = "Activar tipo de incidente";
        if (mensaje) {
            mensaje.innerHTML = `
                ¿Deseas activar el tipo de incidente <strong style="color: var(--texto); font-weight: 700;">"${tipo.nametipoincidente}"</strong>?
                <div style="margin-top: 14px; padding: 12px 14px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; font-size: 0.8rem; color: #34d399; line-height: 1.5;">
                    <div style="font-weight: 700; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.04em; margin-bottom: 4px; color: #10b981;">Disponibilidad inmediata</div>
                    Volverá a estar habilitado para la selección en los formularios de registro y actualización de incidentes.
                </div>
            `;
        }
        if (btnConfirmar) {
            btnConfirmar.innerText = "Sí, activar";
            btnConfirmar.style.background = "#10b981";
            btnConfirmar.style.color = "#ffffff";
        }
    }

    if (modal) modal.style.display = "flex";
}

function cerrarModalConfirmarEstadoTipo() {
    estadoTipoPendiente = { id: null, nuevoEstado: null };
    const modal = document.getElementById("modalConfirmarEstadoTipo");
    if (modal) modal.style.display = "none";
}

document.getElementById("btnConfirmarAccionEstadoTipo")?.addEventListener("click", async () => {
    if (!estadoTipoPendiente.id) return;
    const { id, nuevoEstado } = estadoTipoPendiente;
    cerrarModalConfirmarEstadoTipo();
    await cambiarEstadoTipoIncidente(id, nuevoEstado);
});

/**
 * Construye la paleta sugerida de colores en el modal
 */
function inicializarPaletaSugeridaModal() {
    const cont = document.getElementById("paletaSugeridaTipos");
    if (!cont) return;
    cont.innerHTML = "";
    PALETA_SUGERIDA.forEach(colorHex => {
        const chip = document.createElement("span");
        chip.className = "chip-color-sugerido";
        chip.style.backgroundColor = colorHex;
        chip.title = `Seleccionar ${colorHex}`;
        chip.onclick = () => {
            seleccionarColorModal(colorHex);
        };
        cont.appendChild(chip);
    });
}

function seleccionarColorModal(colorHex) {
    const picker = document.getElementById("tipoColorPicker");
    const hexInput = document.getElementById("tipoColorHex");
    if (picker) picker.value = colorHex;
    if (hexInput) hexInput.value = colorHex.toUpperCase();
    actualizarPrevisualizacionColor(colorHex);
    evaluarSimilitudColorEnVivo(colorHex);
}

function actualizarPrevisualizacionColor(colorHex) {
    const preview = document.getElementById("tipoBadgePreview");
    if (preview) {
        preview.style.background = `${colorHex}22`;
        preview.style.color = colorHex;
        preview.style.borderColor = `${colorHex}66`;
    }
}

/**
 * Evalúa en tiempo real si el color elegido es casi igual o idéntico a un tipo existente
 */
function evaluarSimilitudColorEnVivo(nuevoHex) {
    const alerta = document.getElementById("alertaColorTipo");
    const btnSubmit = document.getElementById("btnGuardarTipoSubmit");
    const idActual = document.getElementById("tipoEditId")?.value;

    if (!alerta) return true;

    const hexRegex = /^#([0-9a-fA-F]{6})$/;
    if (!hexRegex.test(nuevoHex)) {
        alerta.style.display = "block";
        alerta.style.background = "rgba(239, 68, 68, 0.12)";
        alerta.style.border = "1px solid rgba(239, 68, 68, 0.35)";
        alerta.style.color = "#f87171";
        alerta.innerHTML = "⚠️ Ingrese un código hexadecimal válido de 6 caracteres (ej: #06B6D4).";
        if (btnSubmit) btnSubmit.disabled = true;
        return false;
    }

    // Comparar contra todos los tipos existentes activos
    let tipoColision = null;
    let menorDistancia = 999;

    for (const t of allTipos) {
        if (idActual && String(t.idtipoincidente) === String(idActual)) continue;
        if (!t.activo || !t.color) continue;

        const dist = calcularDistanciaColorLocal(nuevoHex, t.color);
        if (dist < menorDistancia) {
            menorDistancia = dist;
            if (dist < 85) {
                tipoColision = t;
            }
        }
    }

    if (tipoColision) {
        alerta.style.display = "block";
        alerta.style.background = "rgba(239, 68, 68, 0.15)";
        alerta.style.border = "1px solid rgba(239, 68, 68, 0.45)";
        alerta.style.color = "#f87171";
        alerta.innerHTML = `<b>Color muy similar</b> al tipo existente <b>"${tipoColision.nametipoincidente}"</b> (${(tipoColision.color || '').toUpperCase()}). Por favor elija un tono con mayor contraste para diferenciar los puntos en el mapa.`;
        if (btnSubmit) btnSubmit.disabled = true;
        return false;
    } else {
        alerta.style.display = "block";
        alerta.style.background = "rgba(16, 185, 129, 0.12)";
        alerta.style.border = "1px solid rgba(16, 185, 129, 0.35)";
        alerta.style.color = "#10b981";
        alerta.innerHTML = `<b>Color contrastante</b>: Tono con excelente diferenciación visual para cartografía.`;
        if (btnSubmit) btnSubmit.disabled = false;
        return true;
    }
}

/**
 * Evalúa en tiempo real si el nombre ya existe en el catálogo
 */
function evaluarNombreDuplicadoEnVivo(nuevoNombre) {
    const feedback = document.getElementById("feedbackNombreTipo");
    const idActual = document.getElementById("tipoEditId")?.value;
    if (!feedback) return true;

    const nombreNorm = normalizarTextoLocal(nuevoNombre);
    if (nombreNorm.length < 3) {
        feedback.style.display = "none";
        return true;
    }

    const duplicado = allTipos.find(t => {
        if (idActual && String(t.idtipoincidente) === String(idActual)) return false;
        return normalizarTextoLocal(t.nametipoincidente) === nombreNorm;
    });

    if (duplicado) {
        feedback.style.display = "block";
        feedback.style.color = "#ef4444";
        feedback.innerText = `Ya existe un tipo de incidente registrado con el nombre "${duplicado.nametipoincidente}".`;
        return false;
    } else {
        feedback.style.display = "none";
        return true;
    }
}

// Event listeners interactivos del modal de tipos
document.getElementById("tipoColorPicker")?.addEventListener("input", (e) => {
    const hex = e.target.value.toUpperCase();
    const hexInput = document.getElementById("tipoColorHex");
    if (hexInput) hexInput.value = hex;
    actualizarPrevisualizacionColor(hex);
    evaluarSimilitudColorEnVivo(hex);
});

document.getElementById("tipoColorHex")?.addEventListener("input", (e) => {
    let hex = e.target.value.trim();
    if (!hex.startsWith('#') && hex.length > 0) hex = '#' + hex;
    e.target.value = hex.toUpperCase();
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
        const picker = document.getElementById("tipoColorPicker");
        if (picker) picker.value = hex;
        actualizarPrevisualizacionColor(hex);
        evaluarSimilitudColorEnVivo(hex);
    }
});

document.getElementById("tipoNombreInput")?.addEventListener("input", (e) => {
    evaluarNombreDuplicadoEnVivo(e.target.value);
});

/**
 * Abrir modal para crear nuevo tipo de incidente
 */
function abrirModalCrearTipo() {
    const modal = document.getElementById("modalTipoIncidente");
    const titulo = document.getElementById("tituloModalTipo");
    const form = document.getElementById("formTipoIncidente");
    const alertBox = document.getElementById("modalTipoAlert");
    const editIdInput = document.getElementById("tipoEditId");

    if (form) form.reset();
    if (editIdInput) editIdInput.value = "";
    if (alertBox) {
        alertBox.style.display = "none";
        alertBox.innerText = "";
    }
    if (titulo) titulo.innerText = "Nuevo Tipo de Incidente";

    inicializarPaletaSugeridaModal();
    seleccionarColorModal("#06B6D4");

    if (modal) modal.style.display = "flex";
}

/**
 * Abrir modal para editar un tipo de incidente existente
 */
function abrirModalEditarTipo(id) {
    const tipo = allTipos.find(t => t.idtipoincidente === parseInt(id));
    if (!tipo) {
        mostrarToast("No se encontró el tipo de incidente seleccionado", "error");
        return;
    }

    const modal = document.getElementById("modalTipoIncidente");
    const titulo = document.getElementById("tituloModalTipo");
    const alertBox = document.getElementById("modalTipoAlert");
    const editIdInput = document.getElementById("tipoEditId");
    const nombreInput = document.getElementById("tipoNombreInput");
    const catSelect = document.getElementById("tipoCategoriaSelect");
    const riesgoSelect = document.getElementById("tipoRiesgoSelect");
    const descInput = document.getElementById("tipoDescripcionInput");

    if (alertBox) {
        alertBox.style.display = "none";
        alertBox.innerText = "";
    }
    if (titulo) titulo.innerText = `Editar Tipo: ${tipo.nametipoincidente}`;
    if (editIdInput) editIdInput.value = tipo.idtipoincidente;
    if (nombreInput) nombreInput.value = tipo.nametipoincidente;
    if (catSelect && tipo.id_categoria) catSelect.value = tipo.id_categoria;
    if (riesgoSelect) riesgoSelect.value = (tipo.nivel_riesgo_base || "media").toLowerCase();
    if (descInput) descInput.value = tipo.descripcion || "";

    inicializarPaletaSugeridaModal();
    const colorInicial = (tipo.color || "#3b82f6").toUpperCase();
    seleccionarColorModal(colorInicial);

    if (modal) modal.style.display = "flex";
}

function cerrarModalTipo() {
    const modal = document.getElementById("modalTipoIncidente");
    if (modal) modal.style.display = "none";
}

/**
 * Guardar tipo de incidente (Crear o Actualizar)
 */
async function guardarTipoIncidente(e) {
    e.preventDefault();
    const alertBox = document.getElementById("modalTipoAlert");
    const btnSubmit = document.getElementById("btnGuardarTipoSubmit");
    const editId = document.getElementById("tipoEditId")?.value;

    const nombre = document.getElementById("tipoNombreInput")?.value.trim();
    const id_categoria = document.getElementById("tipoCategoriaSelect")?.value;
    const nivel_riesgo_base = document.getElementById("tipoRiesgoSelect")?.value;
    const descripcion = document.getElementById("tipoDescripcionInput")?.value.trim();
    const color = (document.getElementById("tipoColorHex")?.value || document.getElementById("tipoColorPicker")?.value || "").trim().toLowerCase();

    // 1. Validaciones de cliente
    if (!nombre || nombre.length < 3) {
        mostrarAlertaModalTipo("El nombre debe tener al menos 3 caracteres.");
        return;
    }
    if (!id_categoria) {
        mostrarAlertaModalTipo("Debe seleccionar una categoría macro para el tipo.");
        return;
    }
    if (!/^#([0-9a-fA-F]{6})$/.test(color)) {
        mostrarAlertaModalTipo("El color debe tener un formato hexadecimal válido (ej: #06B6D4).");
        return;
    }

    // Verificar similitud de color
    const colorEsValido = evaluarSimilitudColorEnVivo(color);
    if (!colorEsValido) {
        mostrarAlertaModalTipo("El color elegido es demasiado similar al de otro tipo existente. Seleccione un color diferente.");
        return;
    }

    // Verificar nombre duplicado
    const nombreEsUnico = evaluarNombreDuplicadoEnVivo(nombre);
    if (!nombreEsUnico) {
        mostrarAlertaModalTipo(`Ya existe un tipo de incidente registrado con el nombre "${nombre}".`);
        return;
    }

    const payload = {
        nametipoincidente: nombre,
        id_categoria: parseInt(id_categoria),
        nivel_riesgo_base,
        color,
        descripcion
    };

    const textoOriginal = btnSubmit ? btnSubmit.innerText : "Guardar";
    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerText = "Guardando…";
    }

    try {
        const url = editId ? `/api/catalogos/tipos/${editId}` : "/api/catalogos/tipos";
        const method = editId ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.mensaje || `Error al guardar tipo (HTTP ${res.status})`);
        }

        mostrarToast(data.mensaje || "Tipo de incidente guardado exitosamente", "success");
        cerrarModalTipo();
        await cargarTiposIncidentes();
        if (typeof cargarTipos === "function") cargarTipos();

    } catch (err) {
        console.error("Error al guardar tipo de incidente:", err);
        mostrarAlertaModalTipo(err.message || "Error al procesar la solicitud.");
    } finally {
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerText = textoOriginal;
        }
    }
}

function mostrarAlertaModalTipo(mensaje) {
    const alertBox = document.getElementById("modalTipoAlert");
    if (!alertBox) return;
    alertBox.style.display = "block";
    alertBox.style.background = "rgba(239, 68, 68, 0.15)";
    alertBox.style.border = "1px solid rgba(239, 68, 68, 0.4)";
    alertBox.style.color = "#f87171";
    alertBox.innerText = mensaje;
}

/**
 * Cambiar estado de activación del tipo de incidente
 */
async function cambiarEstadoTipoIncidente(id, nuevoEstado) {
    try {
        const res = await fetch(`/api/catalogos/tipos/${id}/estado`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ activo: nuevoEstado })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.mensaje || "Error al cambiar estado");

        mostrarToast(data.mensaje || "Estado actualizado exitosamente", "success");
        await cargarTiposIncidentes();
        if (typeof cargarTipos === "function") cargarTipos();

    } catch (err) {
        console.error("Error al cambiar estado de tipo:", err);
        mostrarToast(err.message || "Error al actualizar estado", "error");
    }
}




