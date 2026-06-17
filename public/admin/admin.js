document.querySelectorAll("header nav button").forEach(btn => {
    btn.addEventListener("click", function () {
        document.querySelectorAll("header nav button").forEach(btn => {
            btn.classList.remove("pintarBotonNav");
        });
        btn.classList.add("pintarBotonNav");
    });
});


const main = document.querySelector(".contMain");
document.getElementById("btnInicio").addEventListener("click", () => {
    main.style.transform = "translateX(0%)";
});
document.getElementById("btnVerif").addEventListener("click", () => {
    main.style.transform = "translateX(-50%)";
});

// Crear el mapa
const map = L.map('map').setView([1.6144, -75.6062], 13); // Florencia aprox
let capaBarrio1 = L.layerGroup().addTo(map);
let capaVereda1 = L.layerGroup().addTo(map);


const map2 = L.map('mapa2').setView([1.6144, -75.6062], 13); // Florencia aprox

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
function cargarIncidentes() {
    capaIncidentes.clearLayers();
    fetch("/incidentes")
        .then(res => res.json())
        .then(data => {
            data.forEach(incidente => {
                const marker = L.circleMarker([incidente.lat, incidente.lng], {
                    radius: 5,
                    color: obtenerColor(incidente.idtipoincidente),
                    fillColor: obtenerColor(incidente.idtipoincidente),
                    fillOpacity: 0.7
                }).addTo(capaIncidentes);
                // 🖱️ HOVER → mostrar código
                marker.on("mouseover", function () {
                    if (incidente.codigoincidente) {
                        marker.bindTooltip(incidente.codigoincidente, {
                            permanent: false,
                            direction: "top",
                            offset: [0, -10]
                        }).openTooltip();
                    }
                });

                // 🖱️ salir del punto
                marker.on("mouseout", function () {
                    marker.closeTooltip();
                });

                marker.on("click", function () {
                    const contenido = `
                                        <b>Código:</b> ${incidente.codigoincidente}<br>
                                        <b>Tipo:</b> ${incidente.nametipoincidente}<br>
                                        <b>Fecha:</b> ${new Date(incidente.fechaincidente).toLocaleDateString("es-CO",{
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "2-digit"
                                        })}<br>
                                        <b>Hora:</b> ${incidente.horaincidente.slice(0,  5)}<br>
                                        <b>Descripción:</b> ${incidente.descripcionincidente || 'Sin descripción'}
                                    `;
                    marker.bindPopup(contenido).openPopup();
                });
            });
        })
        .catch(error => console.error("Error:", error));
}
cargarIncidentes();
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


async function cargarUsuario() {
    try {
        const response = await fetch("/usuario");
        const data = await response.json();

        if (response.ok) {
            document.getElementById("textoBienvenida").innerText =
                "Bienvenido " + data.usuario;
        } else {
            window.location.href = "/Login/Login.html";
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

cargarUsuario();

const contMap1 = document.getElementById("map");
const contMap2 = document.getElementById("mapa2");
document.getElementById("ver").addEventListener("click", function () {
    contMap1.classList.toggle("esconderMapa");
    contMap2.classList.toggle("mostrarMapa");
    if (contMap2.classList.contains("mostrarMapa")) {
        setTimeout(() => {
            map2.invalidateSize();
        }, 100);
    }
});

const inpBusBarr = document.getElementById("buscarBarrio");
const inpBusVere = document.getElementById("buscarVereda");
const formBuscar = document.querySelector(".formBuscar");

const contenedor = document.getElementById("sugerencias");
inpBusBarr.addEventListener("input", function () {
    let texto = this.value;
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
                // CLICK en sugerencia
                div.addEventListener("click", function () {
                    inpBusBarr.value = barrio.namebarrio;
                    contenedor.innerHTML = ""; // limpiar
                });
                contenedor.appendChild(div);
            });
        });
});

inpBusVere.addEventListener("input", function () {
    let texto = this.value;
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
                // CLICK en sugerencia
                div.addEventListener("click", function () {
                    inpBusVere.value = vereda.nombre;
                    contenedor.innerHTML = ""; // limpiar
                });
                contenedor.appendChild(div);
            });
        });
});

const btnBusPol = document.getElementById("buscaPol");
const btnRestab = document.getElementById("restab");

btnBusPol.addEventListener("click", function (e) {
    e.preventDefault();
    if (!inpBusBarr.value && !inpBusVere.value) {
        return;
    }
    if (inpBusVere.value) {
        capaBarrio1.clearLayers();
        cargarVeredas1(inpBusVere.value);
    }
    if (inpBusBarr.value) {
        capaVereda1.clearLayers();
        cargarBarrio1(inpBusBarr.value);
    }
    contenedor.innerHTML = "";
    verificarPantalla();
});

btnRestab.addEventListener("click", function (e) {
    e.preventDefault();
    inpBusBarr.value = "";
    inpBusVere.value = "";
    map.setView([1.6144, -75.6062], 13);
    verificarPantalla();
    capaBarrio1.clearLayers();
    capaVereda1.clearLayers();
});

function verificarPantalla() {
    console.log("Entro", window.innerWidth);
    if (window.innerWidth <= (480 * 2)) {
        formBuscar.style.display = "none";
    } else {
        formBuscar.style.display = "";
    }
}

window.addEventListener("resize", verificarPantalla);

verificarPantalla();

const mostrarContBus = document.getElementById("btnMostrarBuscador");

mostrarContBus.addEventListener("click", function () {
    formBuscar.style.display = "";
});

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
                alert(result.error || "Error en el servidor");
                return;
            }
            alert(result.mensaje);
        } catch (err) {
            console.error("El error es: " + err)
            alert("Error de conexion en el servidor");
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

async function cargarTabla() {
    try {
        const res = await fetch("/incidentesTabla");
        const data = await res.json();

        const tbody = document.getElementById("tablaIncidentes");
        tbody.innerHTML = "";


        data.forEach(incidente => {
            const fila = document.createElement("tr");
            let claseTipo = "";
            switch (incidente.idtipoincidente) {
                case 1:
                    claseTipo = "tipo-robo";
                    break;
                case 2:
                    claseTipo = "tipo-agresion";
                    break;
                case 3:
                    claseTipo = "tipo-piques";
                    break;
                case 4:
                    claseTipo = "tipo-accidente";
                    break;
            }

            fila.innerHTML = `
                <td>${incidente.idincidente}</td>
                <td class="${claseTipo}">${incidente.nametipoincidente}</td>
                <td>${new Date(incidente.fechaincidente).toLocaleDateString("es-CO")}</td>
                <td>${incidente.horaincidente}</td>
                <td>${incidente.namebarrio || "Sin barrio"}</td>
                <td>${incidente.nombre || "Sin vereda"}</td>
                <td>${incidente.lat}, ${incidente.lng}</td>
                <td>${incidente.nombreusuario}</td>
                <td>${incidente.descripcionincidente || "No hay descripcion"}</td>
                <td>
                    <button class="btnEditar" data-id="${incidente.idincidente}">Editar</button>
                    <button class="btnEliminar" data-id="${incidente.idincidente}">Eliminar</button>
                </td>
            `;
            tbody.appendChild(fila);
        });
    } catch (error) {
        console.error("Error:", error);
    }
}

cargarTabla();

const select = document.getElementById("tipoIncidenteFiltro");

select.addEventListener("change", filtrar);

async function filtrar() {
    const tipo = select.value;

    try {
        // ✅ si no hay filtro → cargar todo
        if (!tipo) {
            cargarTabla();
            return;
        }

        let params = new URLSearchParams();
        params.append("idtipoincidente", tipo);

        const url = `/incidentesFiltroAdmin?${params.toString()}`;

        const res = await fetch(url);
        const data = await res.json();

        renderTabla(data);

    } catch (error) {
        console.error("Error filtrando:", error);
    }
}

function renderTabla(data) {
    const tbody = document.getElementById("tablaIncidentes");
    tbody.innerHTML = "";
    console.log(data);
    data.forEach(incidente => {
        const fila = document.createElement("tr");
        let claseTipo = "";
        console.log(incidente);

        switch (parseInt(incidente.idtipoincidente)) {
            case 1:
                claseTipo = "tipo-robo";
                break;
            case 2:
                claseTipo = "tipo-agresion";
                break;
            case 3:
                claseTipo = "tipo-piques";
                break;
            case 4:
                claseTipo = "tipo-accidente";
                break;
        }

        fila.innerHTML = `
            <td>${incidente.idincidente}</td>
                <td class="${claseTipo}">${incidente.nametipoincidente}</td>
                <td>${new Date(incidente.fechaincidente).toLocaleDateString("es-CO")}</td>
                <td>${incidente.horaincidente}</td>
                <td>${incidente.namebarrio || "Sin barrio"}</td>
                <td>${incidente.nombre || "Sin vereda"}</td>
                <td>${incidente.lat}, ${incidente.lng}</td>
                <td>${incidente.nombreusuario}</td>
                <td>${incidente.descripcionincidente || "No hay descripcion"}</td>
                <td>
                    <button class="btnEditar" data-id="${incidente.idincidente}">Editar</button>
                    <button class="btnEliminar" data-id="${incidente.idincidente}">Eliminar</button>
                </td>
        `;
        tbody.appendChild(fila);
    });
}

const tabla = document.getElementById("tablaIncidentes");
tabla.addEventListener("click", function (e) {
    const id = e.target.dataset.id;
    if (e.target.classList.contains("btnEliminar")) {
        eliminarIncidente(id);
    }
    if (e.target.classList.contains("btnEditar")) {
        editarIncidente(id);
    }
});


async function eliminarIncidente(id) {
    const confirmar = confirm("¿Seguro que quieres eliminar este incidente?");
    if (!confirmar) return;
    try {
        const res = await fetch(`/incidente/${id}`, {
            method: "DELETE"
        });
        if (res.ok) {
            alert("Incidente eliminado ✅");
            filtrar(); // recarga con filtro activo
            contar();
        } else {
            alert("Error al eliminar ❌");
        }
    } catch (error) {
        console.error("Error eliminando:", error);
    }
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
            alert("Actualizado correctamente ✅");
            cerrarModal();
            filtrar(); // refresca tabla
        } else {
            alert("Error al actualizar ❌");
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
