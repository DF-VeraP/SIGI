document.querySelectorAll("header nav button:not(.toggle-iphone-header)").forEach(btn => {
    btn.addEventListener("click", function () {
        document.querySelectorAll("header nav button:not(.toggle-iphone-header)").forEach(btn => {
            btn.classList.remove("pintarBotonNav");
        });
        btn.classList.add("pintarBotonNav");
    });
});

// Toggle Tema Claro / Oscuro Header (Tipo iPhone)
const btnTemaHeader = document.getElementById("btnTemaHeader");
if (localStorage.getItem("tema_sigi_admin") === "claro") {
    document.body.classList.add("tema-claro");
}
if (btnTemaHeader) {
    btnTemaHeader.addEventListener("click", function (e) {
        e.stopPropagation();
        document.body.classList.toggle("tema-claro");
        const esClaro = document.body.classList.contains("tema-claro");
        localStorage.setItem("tema_sigi_admin", esClaro ? "claro" : "oscuro");
        if (typeof mostrarToast === 'function') {
            mostrarToast(`Modo ${esClaro ? 'Claro' : 'Oscuro'} activado`, "info");
        }
    });
}

// Menú Hamburguesa Responsivo
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

if (headerFiltros && cuerpoFiltros) {
    headerFiltros.addEventListener("click", (e) => {
        if (e.target.closest("#btnResetFiltrosIncidentes")) return;
        
        const estaColapsado = cuerpoFiltros.classList.toggle("colapsado");
        if (btnToggleFiltros) btnToggleFiltros.classList.toggle("rotado", !estaColapsado);
        if (iconoDesplegar) {
            iconoDesplegar.className = estaColapsado ? "bi bi-chevron-down" : "bi bi-chevron-up";
        }
    });
}


function cambiarPestana(pestañaNombre) {
    const contMain = document.querySelector(".contMain");
    const secUsuarios = document.getElementById("secUsuarios");
    const secAuditoria = document.getElementById("secAuditoria");

    if (pestañaNombre === 'inicio' || pestañaNombre === 'verif') {
        if (secUsuarios) secUsuarios.style.display = 'none';
        if (secAuditoria) secAuditoria.style.display = 'none';

        if (contMain) {
            contMain.style.display = "flex";
            contMain.style.width = "200%";
        }

        if (pestañaNombre === 'inicio') {
            if (contMain) contMain.style.transform = "translateX(0%)";
            setTimeout(() => {
                if (typeof map !== 'undefined') map.invalidateSize();
                if (typeof map2 !== 'undefined') map2.invalidateSize();
            }, 300);
        } else if (pestañaNombre === 'verif') {
            if (contMain) contMain.style.transform = "translateX(-50%)";
        }
    } else {
        if (contMain) contMain.style.display = "none";

        if (secUsuarios) {
            secUsuarios.style.display = pestañaNombre === 'usuarios' ? 'block' : 'none';
        }
        if (secAuditoria) {
            secAuditoria.style.display = pestañaNombre === 'auditoria' ? 'block' : 'none';
        }
    }

    if (pestañaNombre === 'usuarios') cargarUsuarios();
    if (pestañaNombre === 'auditoria') cargarAuditoriaLogs();
}

window.addEventListener("resize", () => {
    if (typeof map !== 'undefined' && map) map.invalidateSize();
    if (typeof map2 !== 'undefined' && map2) map2.invalidateSize();
});

document.getElementById("btnInicio").addEventListener("click", () => cambiarPestana('inicio'));
document.getElementById("btnVerif").addEventListener("click", () => cambiarPestana('verif'));

const btnUsuariosEl = document.getElementById("btnUsuarios");
if (btnUsuariosEl) btnUsuariosEl.addEventListener("click", () => cambiarPestana('usuarios'));

const btnAuditoriaEl = document.getElementById("btnAuditoria");
if (btnAuditoriaEl) btnAuditoriaEl.addEventListener("click", () => cambiarPestana('auditoria'));

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
const capaOscura = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

const capaSatelital = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri'
});

const capaSatelital2 = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri'
});


// Agregar capa inicial
capaOscura.addTo(map);

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

function obtenerColor(tipo) {
    if (tipo === 1) return "red";
    if (tipo === 2) return "yellow";
    if (tipo === 3) return "magenta";
    if (tipo === 4) return "limegreen";
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

btnbolita.addEventListener("click", function () {
    console.log("Presionado noche dia");

    if (bolita.classList.contains("colorBolita")) {
        btnbolita.classList.remove("colorBolita");
        bolita.classList.remove("colorBolita");
        bolita.style.transform = "translateX(0)";
        activarMapaOscuro();
        console.log("modo oscuro");
    } else {
        console.log("modo satelital");
        activarMapaSatelital();
        btnbolita.classList.add("colorBolita");
        bolita.style.transform = "translateX(1.5em)";
        bolita.classList.add("colorBolita");
    }
});

let marcadorClick = null;

function manejarClickMapa(e) {
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
            document.getElementById("textoBienvenida").innerText = `Bienvenido ${data.usuario} (${rolLabel})`;

            // Mostrar u ocultar pestañas según el rol
            const btnUsuarios = document.getElementById("btnUsuarios");
            const btnAuditoria = document.getElementById("btnAuditoria");

            if (data.rol === 'superadmin') {
                if (btnUsuarios) btnUsuarios.style.display = "inline-block";
                if (btnAuditoria) btnAuditoria.style.display = "inline-block";
            } else if (data.rol === 'admin') {
                if (btnUsuarios) btnUsuarios.style.display = "none";
                if (btnAuditoria) btnAuditoria.style.display = "none";
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

        if (estaMostrandoIncidentes) {
            btnVerMapa.style.background = "var(--acento)";
            btnVerMapa.style.color = "#000";
            setTimeout(() => {
                map2.invalidateSize();
            }, 100);
        } else {
            btnVerMapa.style.background = "rgba(22, 27, 39, 0.88)";
            btnVerMapa.style.color = "var(--acento)";
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        }
    });
}

const inputBusquedaMapa = document.getElementById("inputBusquedaMapa");
const btnLimpiarBusquedaMapa = document.getElementById("btnLimpiarBusquedaMapa");
const sugerenciasMapa = document.getElementById("sugerenciasMapa");

let timerBusquedaMapa = null;

if (inputBusquedaMapa) {
    inputBusquedaMapa.addEventListener("input", function () {
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

    inputBusquedaMapa.addEventListener("focus", function () {
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
    btnLimpiarBusquedaMapa.addEventListener("click", () => {
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
                item.addEventListener("click", () => {
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
                item.addEventListener("click", () => {
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

    data.forEach(tipo => {
        const option1 = document.createElement("option");
        option1.value = tipo.idtipoincidente;
        option1.textContent = tipo.nametipoincidente;

        const option2 = document.createElement("option");
        option2.value = tipo.idtipoincidente;
        option2.textContent = tipo.nametipoincidente;

        select.appendChild(option1);
        select2.appendChild(option2);
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
        mostrarToast("Favor rellenar campos obligatorios *");
        return;
    } else {
        const data = {
            tipo: document.getElementById("tipoIncidente").value,
            fecha: document.getElementById("fecha").value,
            hora: document.getElementById("hora").value,
            lat: document.getElementById("latitud").value,
            lng: document.getElementById("longitud").value,
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
                mostrarToast(result.error || "Error en el servidor", "error");
                return;
            }
            mostrarToast(result.mensaje, "exito");
        } catch (err) {
            console.error("El error es: " + err)
            mostrarToast("Error de conexion en el servidor", "error");
        }
/*         limpiarFormulario() */;
        cargarTabla();
        contar();
        cargarIncidentes();
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

function mostrarToast(mensaje) {
    const contenedor = document.getElementById("contenedorToast");

    const toast = document.createElement("div");
    toast.classList.add("toastMensaje");
    toast.textContent = mensaje;

    contenedor.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("toastMostrar");
    }, 10);

    setTimeout(() => {
        toast.classList.remove("toastMostrar");

        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 3000);
}

const contInc = document.querySelector(".numero");
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
    const badge = document.getElementById("badgePendientes");
    if (!badge || !Array.isArray(incidentes)) return;
    const pendientes = incidentes.filter(inc => parseInt(inc.id_estado || 1) === 1).length;
    if (pendientes > 0) {
        badge.innerText = pendientes;
        badge.style.display = "inline-block";
    } else {
        badge.style.display = "none";
    }
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
    const filtroEstado = (document.getElementById("estadoIncidenteFiltro")?.value || "");
    const filtroTipo = (document.getElementById("tipoIncidenteFiltro")?.value || "");

    incidentesFiltrados = todosLosIncidentes.filter(inc => {
        const coincideBusqueda = !busqueda ||
            (inc.namebarrio || "").toLowerCase().includes(busqueda) ||
            (inc.nombre || "").toLowerCase().includes(busqueda) ||
            (inc.nombreusuario || "").toLowerCase().includes(busqueda) ||
            (inc.descripcionincidente || "").toLowerCase().includes(busqueda) ||
            (inc.nametipoincidente || "").toLowerCase().includes(busqueda) ||
            (inc.admin_revisor_nombre || "").toLowerCase().includes(busqueda);

        const coincideEstado = !filtroEstado || String(inc.id_estado || 1) === String(filtroEstado);
        const coincideTipo = !filtroTipo || String(inc.idtipoincidente) === String(filtroTipo);

        let coincideFecha = true;
        if (filtroFechaDesde || filtroFechaHasta) {
            const fechaInc = inc.fechaincidente ? inc.fechaincidente.slice(0, 10) : '';
            if (filtroFechaDesde && fechaInc < filtroFechaDesde) coincideFecha = false;
            if (filtroFechaHasta && fechaInc > filtroFechaHasta) coincideFecha = false;
        }

        return coincideBusqueda && coincideEstado && coincideTipo && coincideFecha;
    });

    if (resetPagina) {
        paginaActualIncidentes = 1;
    }
    renderTabla();
    renderMapa(incidentesFiltrados);
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
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 20px; color: var(--texto-suave);">No se encontraron incidentes coincidentes.</td></tr>';
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
        fila.style.borderBottom = "1px solid var(--borde)";

        const nombreTipo = incidente.nametipoincidente || 'Incidente';
        let tipoBadge = '';
        const tipoId = parseInt(incidente.idtipoincidente);
        if (tipoId === 1) { // Robo
            tipoBadge = `<span style="background: rgba(239, 68, 68, 0.12); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.25); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 600; white-space: nowrap;" title="${nombreTipo}">${nombreTipo}</span>`;
        } else if (tipoId === 2) { // Agresión
            tipoBadge = `<span style="background: rgba(245, 158, 11, 0.12); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.25); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 600; white-space: nowrap;" title="${nombreTipo}">${nombreTipo}</span>`;
        } else if (tipoId === 3) { // Piques
            tipoBadge = `<span style="background: rgba(168, 85, 247, 0.12); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.25); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 600; white-space: nowrap;" title="${nombreTipo}">${nombreTipo}</span>`;
        } else if (tipoId === 4) { // Accidente
            tipoBadge = `<span style="background: rgba(59, 130, 246, 0.12); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.25); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 600; white-space: nowrap;" title="${nombreTipo}">${nombreTipo}</span>`;
        } else {
            tipoBadge = `<span style="background: rgba(16, 185, 129, 0.12); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.25); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 600; white-space: nowrap;" title="${nombreTipo}">${nombreTipo}</span>`;
        }

        // Estado y Revisor Badge
        const estadoId = parseInt(incidente.id_estado) || 1;
        let estadoBadge = '';
        let opcionesHtml = '';

        const esMio = (idAdminLogueado && parseInt(incidente.id_admin_revisor) === parseInt(idAdminLogueado)) || 
                       (adminLogueado && incidente.admin_revisor_nombre === adminLogueado);

        if (estadoId === 1) { // 1 = Reportado (Pendiente en Cola Pública)
            estadoBadge = `<span style="background: rgba(245, 158, 11, 0.12); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.25); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 600; white-space: nowrap;" title="Disponible en la cola pública">En Cola</span>`;
            opcionesHtml = `<button class="btnTomarIncidente" data-id="${incidente.idincidente}" style="padding: 4px 10px; background: transparent; border: 1px solid rgba(59, 130, 246, 0.4); color: #60a5fa; border-radius: 6px; font-size: 0.75rem; cursor: pointer; font-weight: 500; white-space: nowrap; transition: all 0.2s ease;">Tomar Revisión</button>`;
        } else if (estadoId === 2) { // 2 = En evaluación
            const revisorNombre = incidente.admin_revisor_nombre || 'un Admin';
            if (esMio || isSuperadmin) {
                estadoBadge = `<span style="background: rgba(59, 130, 246, 0.12); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.25); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 600; white-space: nowrap;" title="Revisando por ti">Revisando: ${revisorNombre}</span>`;
                opcionesHtml = `
                    <button class="btnResolverIncidente" data-id="${incidente.idincidente}" style="padding: 4px 10px; background: transparent; border: 1px solid rgba(52, 211, 153, 0.4); color: #34d399; border-radius: 6px; font-size: 0.75rem; cursor: pointer; font-weight: 500; white-space: nowrap;">Aprobar</button>
                    <button class="btnCerrarIncidente" data-id="${incidente.idincidente}" style="padding: 4px 10px; background: transparent; border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; border-radius: 6px; font-size: 0.75rem; cursor: pointer; font-weight: 500; white-space: nowrap;">Desestimar</button>
                    <button class="btnLiberarIncidente" data-id="${incidente.idincidente}" style="padding: 4px 10px; background: transparent; border: 1px solid var(--borde); color: var(--texto-suave); border-radius: 6px; font-size: 0.75rem; cursor: pointer; font-weight: 500; white-space: nowrap;" title="Devolver a la cola pública">Liberar</button>
                `;
            } else {
                estadoBadge = `<span style="background: rgba(107, 114, 128, 0.12); color: #9ca3af; border: 1px solid rgba(107, 114, 128, 0.25); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 600; white-space: nowrap;">Revisando por ${revisorNombre}</span>`;
                opcionesHtml = `<span style="font-size: 0.75rem; color: var(--texto-suave); font-style: italic;">En revisión</span>`;
            }
        } else if (estadoId === 5) { // 5 = Resuelto / Aprobado
            estadoBadge = `<span style="background: rgba(16, 185, 129, 0.12); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.25); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 600; white-space: nowrap;">Aprobado</span>`;
            opcionesHtml = `
                <button class="btnEditar" data-id="${incidente.idincidente}" style="padding: 4px 10px; background: transparent; border: 1px solid rgba(96, 165, 250, 0.3); color: #60a5fa; border-radius: 6px; font-size: 0.75rem; cursor: pointer; font-weight: 500; white-space: nowrap;">Editar</button>
                <button class="btnEliminar" data-id="${incidente.idincidente}" style="padding: 4px 10px; background: transparent; border: 1px solid rgba(248, 113, 113, 0.3); color: #f87171; border-radius: 6px; font-size: 0.75rem; cursor: pointer; font-weight: 500; white-space: nowrap;">Eliminar</button>
            `;
        } else { // 6 = Cerrado / Desestimado
            estadoBadge = `<span style="background: rgba(239, 68, 68, 0.12); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.25); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 600; white-space: nowrap;">Desestimado</span>`;
            opcionesHtml = `
                <button class="btnEditar" data-id="${incidente.idincidente}" style="padding: 4px 10px; background: transparent; border: 1px solid rgba(96, 165, 250, 0.3); color: #60a5fa; border-radius: 6px; font-size: 0.75rem; cursor: pointer; font-weight: 500; white-space: nowrap;">Editar</button>
                <button class="btnEliminar" data-id="${incidente.idincidente}" style="padding: 4px 10px; background: transparent; border: 1px solid rgba(248, 113, 113, 0.3); color: #f87171; border-radius: 6px; font-size: 0.75rem; cursor: pointer; font-weight: 500; white-space: nowrap;">Eliminar</button>
            `;
        }

        const consecutivo = inicio + index + 1;
        const revisorNombre = incidente.admin_revisor_nombre || 'Sin asignar';
        const creadorNombre = incidente.nombreusuario || 'Sistema';

        fila.innerHTML = `
            <td style="padding: 10px 12px; text-align: center; vertical-align: middle; color: var(--texto-suave); font-size: 0.8rem;">
                #${consecutivo}
            </td>
            <td style="padding: 10px 12px; text-align: center; vertical-align: middle;">
                <span style="font-weight: 700; color: #60a5fa; font-size: 0.78rem; background: rgba(96, 165, 250, 0.12); padding: 3px 7px; border-radius: 5px; white-space: nowrap;">#INC-${incidente.idincidente}</span>
            </td>
            <td style="padding: 10px 12px; text-align: center; vertical-align: middle;">
                <div style="display: flex; justify-content: center; align-items: center;">
                    ${tipoBadge}
                </div>
            </td>
            <td style="padding: 10px 12px; text-align: center; vertical-align: middle;">
                <div style="display: flex; justify-content: center; align-items: center;">
                    ${estadoBadge}
                </div>
            </td>
            <td style="padding: 10px 12px; color: var(--texto); text-align: center; vertical-align: middle; font-size: 0.82rem; font-weight: 500; white-space: nowrap;">
                ${revisorNombre}
            </td>
            <td style="padding: 10px 12px; color: var(--texto); text-align: center; vertical-align: middle; font-size: 0.82rem; font-weight: 500; white-space: nowrap;">
                ${creadorNombre}
            </td>
            <td style="padding: 10px 12px; text-align: center; vertical-align: middle;">
                <div style="display: flex; gap: 6px; justify-content: center; align-items: center; align-content: center; flex-wrap: wrap; width: 100%; text-align: center;">
                    <button onclick="verDetalleIncidente(${incidente.idincidente})" style="padding: 4px 10px; background: transparent; border: 1px solid rgba(96, 165, 250, 0.3); color: #60a5fa; border-radius: 6px; font-size: 0.75rem; cursor: pointer; font-weight: 500; white-space: nowrap; transition: all 0.2s ease;">Detalle</button>
                    ${opcionesHtml}
                </div>
            </td>
        `;
        tbody.appendChild(fila);
    });

    if (infoPag) infoPag.innerText = `Mostrando ${inicio + 1} - ${fin} de ${totalRegs} incidentes`;
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
            btn.style.background = "rgba(59, 130, 246, 0.12)";
            btn.innerHTML = `<span>Filtros</span>`;
        }
    } else {
        cont.style.display = "block";
        void cont.offsetWidth; // Trigger layout reflow for CSS transition start
        cont.classList.add("activo");
        if (btn) {
            btn.style.background = "rgba(59, 130, 246, 0.25)";
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

    // Llenar metadatos del modal (Sin redundancia con la tabla)
    const idEl = document.getElementById("detModalId");
    if (idEl) idEl.innerText = `#INC-${incidente.idincidente}`;
    
    // Categoría / Tipo Badge
    const detTipoBadge = document.getElementById("detModalTipoBadge");
    const tipoId = parseInt(incidente.idtipoincidente);
    const nombreTipo = incidente.nametipoincidente || 'Incidente';
    let colorBg = 'rgba(16, 185, 129, 0.12)', colorFg = '#34d399', colorBrd = 'rgba(16, 185, 129, 0.25)';
    if (tipoId === 1) { colorBg = 'rgba(239, 68, 68, 0.12)'; colorFg = '#f87171'; colorBrd = 'rgba(239, 68, 68, 0.25)'; }
    else if (tipoId === 2) { colorBg = 'rgba(245, 158, 11, 0.12)'; colorFg = '#fbbf24'; colorBrd = 'rgba(245, 158, 11, 0.25)'; }
    else if (tipoId === 3) { colorBg = 'rgba(168, 85, 247, 0.12)'; colorFg = '#c084fc'; colorBrd = 'rgba(168, 85, 247, 0.25)'; }
    else if (tipoId === 4) { colorBg = 'rgba(59, 130, 246, 0.12)'; colorFg = '#60a5fa'; colorBrd = 'rgba(59, 130, 246, 0.25)'; }

    if (detTipoBadge) {
        detTipoBadge.innerHTML = `<span style="background: ${colorBg}; color: ${colorFg}; border: 1px solid ${colorBrd}; padding: 4px 10px; border-radius: 6px; font-size: 0.78rem; font-weight: 600;">${nombreTipo}</span>`;
    }

    const fechaFmt = new Date(incidente.fechaincidente).toLocaleDateString("es-CO");
    const horaFmt = incidente.horaincidente || '--';
    
    const fhEl = document.getElementById("detModalFechaHora");
    const ubEl = document.getElementById("detModalUbicacion");
    const dsEl = document.getElementById("detModalDescripcion");

    if (fhEl) fhEl.innerText = `${fechaFmt} — ${horaFmt}`;

    const barrioTxt = incidente.namebarrio || "Sin barrio";
    const veredaTxt = incidente.nombre ? ` / Vereda: ${incidente.nombre}` : '';
    if (ubEl) ubEl.innerText = `${barrioTxt}${veredaTxt}`;
    if (dsEl) dsEl.innerText = incidente.descripcionincidente || "Sin descripción proporcionada.";

    // Evidencia Fotográfica
    const contFoto = document.getElementById("detModalFotoCont");
    const imgFoto = document.getElementById("detModalFotoImg");
    if (incidente.imagen_url && contFoto && imgFoto) {
        imgFoto.src = incidente.imagen_url;
        imgFoto.onclick = () => abrirVisorFoto(incidente.imagen_url, `INC-${incidente.idincidente}`, incidente.descripcionincidente);
        contFoto.style.display = "block";
    } else if (contFoto) {
        contFoto.style.display = "none";
    }

    modal.style.display = "flex";
}

function cerrarModalDetalle() {
    const modal = document.getElementById("modalDetalleIncidente");
    if (modal) modal.style.display = "none";
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
async function tomarIncidente(id) {
    try {
        const response = await fetch(`/api/incidentes/${id}/tomar`, { method: 'POST' });
        const resData = await response.json();
        if (response.ok) {
            mostrarMensajeFlotante(resData.mensaje || "Has tomado la revisión del incidente ✅");
            filtrar();
        } else {
            mostrarMensajeFlotante(resData.mensaje || "No se pudo tomar el incidente ⚠️", true);
            filtrar();
        }
    } catch (err) {
        console.error("Error al tomar incidente:", err);
        mostrarMensajeFlotante("Error de conexión al tomar el incidente", true);
    }
}

async function liberarIncidente(id) {
    try {
        const response = await fetch(`/api/incidentes/${id}/liberar`, { method: 'POST' });
        const resData = await response.json();
        if (response.ok) {
            mostrarMensajeFlotante(resData.mensaje || "Incidente devuelto a la cola pública ↩️");
            filtrar();
        } else {
            mostrarMensajeFlotante(resData.mensaje || "Error al liberar ⚠️", true);
        }
    } catch (err) {
        console.error("Error al liberar incidente:", err);
        mostrarMensajeFlotante("Error de conexión al liberar el incidente", true);
    }
}

async function resolverIncidente(id) {
    try {
        const response = await fetch(`/api/incidentes/${id}/resolver`, { method: 'POST' });
        const resData = await response.json();
        if (response.ok) {
            mostrarMensajeFlotante(resData.mensaje || "Incidente verificado y aprobado ✅");
            filtrar();
        } else {
            mostrarMensajeFlotante(resData.mensaje || "Error al aprobar ⚠️", true);
        }
    } catch (err) {
        console.error("Error al resolver incidente:", err);
        mostrarMensajeFlotante("Error de conexión al aprobar el incidente", true);
    }
}

async function cerrarIncidente(id) {
    const motivo = prompt("Por favor ingresa el motivo por el cual se desestima/cierra este incidente:");
    if (motivo === null) return;

    try {
        const response = await fetch(`/api/incidentes/${id}/cerrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ motivo })
        });
        const resData = await response.json();
        if (response.ok) {
            mostrarMensajeFlotante(resData.mensaje || "Incidente desestimado / cerrado ❌");
            filtrar();
        } else {
            mostrarMensajeFlotante(resData.mensaje || "Error al desestimar ⚠️", true);
        }
    } catch (err) {
        console.error("Error al desestimar incidente:", err);
        mostrarMensajeFlotante("Error de conexión al desestimar el incidente", true);
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
            tomarIncidente(id);
        } else if (btn.classList.contains("btnLiberarIncidente")) {
            liberarIncidente(id);
        } else if (btn.classList.contains("btnResolverIncidente")) {
            resolverIncidente(id);
        } else if (btn.classList.contains("btnCerrarIncidente")) {
            cerrarIncidente(id);
        }
    });
}

// Event Listeners de Filtros y Paginación de Incidentes
document.getElementById("buscarIncidenteInput")?.addEventListener("input", aplicarFiltrosIncidentes);
document.getElementById("estadoIncidenteFiltro")?.addEventListener("change", aplicarFiltrosIncidentes);
document.getElementById("tipoIncidenteFiltro")?.addEventListener("change", aplicarFiltrosIncidentes);

document.getElementById("btnResetFiltrosIncidentes")?.addEventListener("click", () => {
    const buscarInput = document.getElementById("buscarIncidenteInput");
    const tipoFiltro = document.getElementById("tipoIncidenteFiltro");
    const estadoFiltro = document.getElementById("estadoIncidenteFiltro");
    if (buscarInput) buscarInput.value = "";
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
            mostrarToast("Incidente eliminado correctamente", "exito");
            filtrar();
            contar();
        } else {
            mostrarToast("Error al eliminar el incidente", "error");
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
            mostrarToast("Actualizado correctamente", "exito");
            cerrarModal();
            filtrar(); // refresca tabla
        } else {
            mostrarToast("Error al actualizar", "error");
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

        btnImportarDatos.textContent = "Cargando...";
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
            btnDeshacerImportacion.innerHTML = '<i class="bi bi-arrow-counterclockwise"></i> Deshacer última importación masiva';
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
    tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px; color: var(--texto-suave);">Cargando usuarios...</td></tr>';

    try {
        const res = await fetch("/api/usuarios");
        if (res.status === 401) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #f87171; padding: 20px;">🔒 Sesión no válida o expirada. Redirigiendo a inicio de sesión...</td></tr>';
            setTimeout(() => { window.location.href = "/login/index.html"; }, 1200);
            return;
        }
        if (res.status === 403) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #f87171; padding: 20px;">⛔ Acceso denegado: Permisos insuficientes para administrar usuarios.</td></tr>';
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
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #f87171; padding: 20px;">Error al consultar usuarios del sistema.</td></tr>';
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
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 25px; color: var(--texto-suave);">No se encontraron usuarios coincidentes.</td></tr>';
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
    paginados.forEach(u => {
        let rolBadge = '';
        if (u.rol === 'superadmin') {
            rolBadge = `<span style="background: rgba(124, 58, 237, 0.12); color: #a78bfa; border: 1px solid rgba(124, 58, 237, 0.25); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 600;">Superadmin</span>`;
        } else if (u.rol === 'admin') {
            rolBadge = `<span style="background: rgba(37, 99, 235, 0.12); color: #60a5fa; border: 1px solid rgba(37, 99, 235, 0.25); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 600;">Admin</span>`;
        } else {
            rolBadge = `<span style="background: rgba(16, 185, 129, 0.12); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.25); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 600;">Reportero</span>`;
        }

        let estadoBadge = '';
        if (u.estado === 'activo') {
            estadoBadge = `<span style="background: rgba(16, 185, 129, 0.12); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.25); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 600;">Activo</span>`;
        } else if (u.estado === 'bloqueado') {
            estadoBadge = `<span style="background: rgba(239, 68, 68, 0.12); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.25); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 600;">Bloqueado</span>`;
        } else {
            estadoBadge = `<span style="background: rgba(245, 158, 11, 0.12); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.25); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 600;">Inactivo</span>`;
        }

        const fechaRegFmt = formatearFechaHora(u.fecha_registro);
        const ultimoAccesoFmt = formatearFechaHora(u.ultimo_acceso);

        const tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid var(--borde)";
        tr.innerHTML = `
            <td style="padding: 10px 12px; color: var(--texto-suave);">#${u.idusuario}</td>
            <td style="padding: 10px 12px; font-weight: 600; color: var(--texto);">${u.nombreusuario}</td>
            <td style="padding: 10px 12px;">${rolBadge}</td>
            <td style="padding: 10px 12px;">${estadoBadge}</td>
            <td style="padding: 10px 12px; color: var(--texto-suave); font-size: 0.78rem;">${fechaRegFmt}</td>
            <td style="padding: 10px 12px; color: var(--texto-suave); font-size: 0.78rem;">${ultimoAccesoFmt}</td>
            <td style="padding: 10px 12px; text-align: center;">
                <div style="display: flex; gap: 5px; justify-content: center;">
                    <button type="button" class="btn-view-user" data-id="${u.idusuario}" title="Ver todos los detalles del usuario" style="padding: 4px 8px; background: rgba(70, 214, 247, 0.12); color: var(--acento); border: 1px solid var(--borde-acento); border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: 600;">
                        <i class="bi bi-eye"></i> Ver
                    </button>
                    <button type="button" class="btn-edit-user" data-id="${u.idusuario}" title="Editar usuario" style="padding: 4px 8px; background: transparent; color: var(--texto); border: 1px solid var(--borde); border-radius: 6px; cursor: pointer; font-size: 0.75rem;">
                        Editar
                    </button>
                    <button type="button" class="btn-toggle-estado" data-id="${u.idusuario}" data-estado="${u.estado}" title="${u.estado === 'activo' ? 'Bloquear acceso' : 'Activar acceso'}" style="padding: 4px 8px; background: transparent; color: var(--texto-suave); border: 1px solid var(--borde); border-radius: 6px; cursor: pointer; font-size: 0.75rem;">
                        ${u.estado === 'activo' ? 'Bloquear' : 'Activar'}
                    </button>
                    <button type="button" class="btn-delete-user" data-id="${u.idusuario}" data-nombre="${u.nombreusuario}" title="Eliminar usuario" style="padding: 4px 8px; background: transparent; color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; cursor: pointer; font-size: 0.75rem;">
                        Eliminar
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

    document.getElementById("detUserId").innerText = `ID Usuario: #${usuario.idusuario}`;
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
        if (elRolBadge) elRolBadge.innerHTML = `<span style="background: rgba(37, 99, 235, 0.15); color: #60a5fa; border: 1px solid rgba(37, 99, 235, 0.3); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">Admin</span>`;
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
    const passHelpText = document.getElementById("passHelpText");
    const passInput = document.getElementById("newPassword");
    const editUserId = document.getElementById("editUserId");

    if (!modal || !form) {
        console.error("No se encontró el elemento modalNuevoUsuario en el DOM");
        return;
    }

    form.reset();
    if (editUserId) editUserId.value = "";
    if (title) title.innerHTML = "Crear nuevo usuario";
    if (passHelpText) passHelpText.innerText = "(Requerida para nuevo usuario)";
    if (passInput) passInput.required = true;

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
    const passHelpText = document.getElementById("passHelpText");
    const passInput = document.getElementById("newPassword");

    if (!modal) {
        console.error("No se encontró el elemento modalNuevoUsuario en el DOM");
        return;
    }

    document.getElementById("editUserId").value = u.idusuario;
    document.getElementById("newNombreUsuario").value = u.nombreusuario || "";
    document.getElementById("newEmail").value = u.email || "";
    document.getElementById("newPassword").value = "";
    document.getElementById("newRol").value = u.rol || "reportero";
    document.getElementById("newEstado").value = u.estado || "activo";
    document.getElementById("newDependencia").value = u.dependencia || u.entidadusuario || "";
    document.getElementById("newTelefono").value = u.telefono || "";

    if (title) title.innerHTML = `Editar usuario #${u.idusuario}`;
    if (passHelpText) passHelpText.innerText = "(Dejar en blanco para mantener la actual)";
    if (passInput) passInput.required = false;

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
    if (labelNombre) labelNombre.innerText = nombre || `ID #${id}`;
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
            contrasenia: document.getElementById("newPassword").value,
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

            if (res.ok) {
                mostrarToast(`✅ ${data.mensaje}`, "exito");
                formCrearUsuario.reset();
                document.getElementById("modalNuevoUsuario").style.display = "none";
                cargarUsuarios();
            } else {
                mostrarToast(`❌ ${data.mensaje || "Error al procesar usuario"}`, "error");
            }
        } catch (err) {
            console.error("Error al procesar usuario:", err);
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
        const modalUser = document.getElementById("modalNuevoUsuario");
        const modalDel = document.getElementById("modalEliminarUsuario");
        if (modalUser) modalUser.style.display = "none";
        if (modalDel) modalDel.style.display = "none";
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
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: var(--texto-suave);">Cargando logs de auditoría...</td></tr>';

    try {
        const res = await fetch("/api/usuarios/auditoria/logs");
        if (res.status === 401) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #f87171; padding: 20px;">🔒 Sesión no válida o expirada. Redirigiendo a inicio de sesión...</td></tr>';
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
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: var(--texto-suave);">No se encontraron registros de auditoría.</td></tr>';
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
            accionBadge = `<span style="background: rgba(16, 185, 129, 0.12); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.25); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 600;">${accionStr}</span>`;
        } else if (accionStr.includes("ACTUALIZAR") || accionStr.includes("EDITAR") || accionStr.includes("UPDATE")) {
            accionBadge = `<span style="background: rgba(37, 99, 235, 0.12); color: #60a5fa; border: 1px solid rgba(37, 99, 235, 0.25); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 600;">${accionStr}</span>`;
        } else if (accionStr.includes("ELIMINAR") || accionStr.includes("DELETE") || accionStr.includes("BLOQUEAR")) {
            accionBadge = `<span style="background: rgba(239, 68, 68, 0.12); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.25); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 600;">${accionStr}</span>`;
        } else {
            accionBadge = `<span style="background: rgba(124, 58, 237, 0.12); color: #a78bfa; border: 1px solid rgba(124, 58, 237, 0.25); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 600;">${accionStr}</span>`;
        }

        const tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid var(--borde)";
        tr.innerHTML = `
            <td style="padding: 10px 12px; color: var(--texto-suave); font-weight: 500; font-size: 0.78rem; text-align: center;">${inicio + idx + 1}</td>
            <td style="padding: 10px 12px; color: var(--texto); font-size: 0.78rem; text-align: center; white-space: nowrap;">${fechaFmt}</td>
            <td style="padding: 10px 12px; font-weight: 600; color: var(--texto); text-align: center;">${l.nombreusuario || 'Sistema'}</td>
            <td style="padding: 10px 12px; text-align: center;">${accionBadge}</td>
            <td style="padding: 10px 12px; color: var(--texto); text-align: center;">${l.tabla_afectada || 'General'}</td>
            <td style="padding: 10px 12px; color: #60a5fa; font-weight: 600; text-align: center;">${l.id_registro ? `#${l.id_registro}` : '--'}</td>
            <td style="padding: 10px 12px; color: var(--texto-suave); text-align: center; max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${l.descripcion || ''}">${l.descripcion || '--'}</td>
            <td style="padding: 10px 12px; color: var(--texto-suave); font-size: 0.78rem; text-align: center; white-space: nowrap;">${l.ip_origen || '127.0.0.1'}</td>
        `;
        tbody.appendChild(tr);
    });

    if (infoPag) infoPag.innerText = `Mostrando ${inicio + 1} - ${fin} de ${totalRegs} logs`;
    if (labelPag) labelPag.innerText = `Página ${paginaActualLogs} de ${totalPaginas}`;
    if (btnAnt) btnAnt.disabled = paginaActualLogs === 1;
    if (btnSig) btnSig.disabled = paginaActualLogs === totalPaginas;
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


