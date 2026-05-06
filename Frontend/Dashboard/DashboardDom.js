let tiposId = [];

const inpBuscarBarrio = document.getElementById("buscarBarrio");


/* No mas pa que sirva ese boton */
const inic = document.getElementById("iniciarSesion");
inic.addEventListener("click", function () {
    window.location.href = "../Login/Login.html";
});
/* Para el panel de filtros */
const boton = document.getElementById("btnFiltros");
const panel = document.getElementById("panelFiltros");
const cerrar = document.getElementById("cerrarFiltros");

boton.addEventListener("click", () => {
    boton.style.display = "none";
    panel.style.display = "block";
});

cerrar.addEventListener("click", () => {
    boton.style.display = "block";
    panel.style.display = "none";
});

/* Aqui le ponemos el script para que se muestre el mapa(Servidores) */
var map = L.map('map').setView([1.615, -75.606], 14);
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri'
}).addTo(map);

/* -------------------Creamos capas --------------------------*/
let capaIncidentes = L.layerGroup().addTo(map);
let capaBarrio = L.layerGroup().addTo(map);
let capaVereda = L.layerGroup().addTo(map);

/* FILTRAMOS */

document.querySelectorAll(".incidente").forEach(btn => {
    btn.addEventListener("click", function () {
        let id = btn.dataset.id;
        if (btn.classList.contains("resaltarBtnFiltro")) {
            btn.classList.remove("resaltarBtnFiltro");
            console.log("Color eliminado");
            tiposId = tiposId.filter(tipo => tipo !== id);
        } else {
            btn.classList.add("resaltarBtnFiltro");
            console.log("Color puesto");
            tiposId.push(id);
        }
        console.log(tiposId);
    });
});

function desmarcarTiposInput() {
    inpBuscarBarrio.value = "";
    inpBuscarVereda.value = "";
    contenedor.innerHTML = "";
    tiposId.length = 0;
    document.querySelectorAll(".incidente").forEach(btn => {
        if (btn.classList.contains("resaltarBtnFiltro")) {
            btn.classList.remove("resaltarBtnFiltro");
        }
    });
    console.log("Despues de reestablecer: " + tiposId.length);
}

function obtenerColor(tipo) {
    if (tipo === 1) return "red";
    if (tipo === 2) return "yellow";
    if (tipo === 3) return "magenta";
    if (tipo === 4) return "limegreen";
}

function obtenerURL() {
    let url = "/incidentes?";
    let barrio = inpBuscarBarrio.value;
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
    console.log("Consultando:", url);
    fetch(url)
        .then(res => res.json())
        .then(data => {
            console.log("Incidentes:", data);
            data.forEach(incidente => {
                L.circleMarker([incidente.lat, incidente.lng], {
                    radius: 5,
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
    let nombre = inpBuscarBarrio.value;
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
            capaGeoJSON.addTo(capaBarrio);
            //  ZOOM AUTOMÁTICO
            if (nombre && data.length > 0) {
                map.fitBounds(capaGeoJSON.getBounds());
            }
        });
}


/* Cargamos las veredas */
function cargarVeredas() {
    const nombre = document.getElementById("buscarVereda").value;
    capaVereda.clearLayers();
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
            if (nombre && data.length > 0) {
                map.fitBounds(capaGeoJSON.getBounds());
            }
        });
};
/* FILTRAMOSSSSSSS */
document.querySelector(".btnActualizar").addEventListener("click", function () {
    cargarBarrio();
    cargarIncidentes();
    cargarVeredas();
});


document.querySelector(".restablecer").addEventListener("click", function () {
    capaIncidentes.clearLayers();
    capaBarrio.clearLayers();
    desmarcarTiposInput();
    cargarBarrio();
    cargarIncidentes();
    cargarVeredas();
    resetMapa();
});

function resetMapa() {
    map.setView([1.615, -75.606], 14);
}

const contenedor = document.getElementById("sugerencias");

inpBuscarBarrio.addEventListener("input", function () {
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
                    inpBuscarBarrio.value = barrio.namebarrio;
                    contenedor.innerHTML = ""; // limpiar
                });
                contenedor.appendChild(div);
            });
        });
});


const inpBuscarVereda = document.getElementById("buscarVereda");
inpBuscarVereda.addEventListener("input", function () {
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
                    inpBuscarVereda.value = vereda.nombre;
                    contenedor.innerHTML = ""; // limpiar
                });
                contenedor.appendChild(div);
            });
        });
});

const panelEst = document.getElementById("estadisticas");
const panelMap = document.querySelector("main");
document.getElementById("estad").addEventListener("click", async function () {
    panelMap.classList.add("esconder");
    panelEst.classList.remove("esconder");

    if (!panelEst.classList.contains("esconder")) {

        const res = await fetch(`/resumen`);
        const data = await res.json();

        const total = Number(data.total);

        document.getElementById("total").textContent = total;

        document.getElementById("robos").textContent =
            ((data.robos / total) * 100).toFixed(1) + "%";

        document.getElementById("accidentes").textContent =
            ((data.accidentes / total) * 100).toFixed(1) + "%";

        document.getElementById("piques").textContent =
            ((data.piques / total) * 100).toFixed(1) + "%";

        document.getElementById("agresiones").textContent =
            ((data.agresiones / total) * 100).toFixed(1) + "%";

        const resZonas = await fetch(`/top-zonas`);
        const dataZonas = await resZonas.json();

        document.getElementById("topBarrio").textContent =
            `${dataZonas.barrio.namebarrio} (${dataZonas.barrio.total})`;

        document.getElementById("topVereda").textContent =
            `${dataZonas.vereda.nombre} (${dataZonas.vereda.total})`;
    }
});

async function cargarIncidentesBarra() {
  const res = await fetch("/top-incidentes");
  const data = await res.json();

  const contenedor = document.getElementById("panelIncidentes");
  contenedor.innerHTML = "";

  const max = Math.max(...data.map(i => i.cantidad));

  data.forEach(i => {
    const porcentaje = (i.cantidad / max) * 100;

    const div = document.createElement("div");
    div.className = "incidente-item";

    div.innerHTML = `
      <div class="linea-color" style="background:${i.color}"></div>

      <div class="nombre">${i.tipo}</div>

      <div class="barra">
        <div class="barra-fill" style="
          width:${porcentaje}%;
          background:${i.color};
        "></div>
      </div>

      <div class="cantidad">${i.cantidad}</div>
    `;

    contenedor.appendChild(div);
  });
}

cargarIncidentesBarra();

document.getElementById("ini").addEventListener("click", function () {
    panelEst.classList.add("esconder");
    panelMap.classList.remove("esconder");
});



cargarVeredas();
cargarBarrio();
cargarIncidentes();