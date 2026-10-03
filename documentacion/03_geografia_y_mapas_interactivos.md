# Modulo 03: Motor Geoespacial PostGIS y Mapas Interactivos (Leaflet)

[Volver al Indice General de Documentacion](./README.md)

---

## 1. Descripcion del Modulo

El Modulo Geoespacial procesa y georreferencia las coordenadas latitud/longitud de los incidentes en el sistema de referencia espacial **SRID 4326 (WGS84)**. Mediante la extension espacial **PostGIS**, realiza la identificacion automatica del poligono urbano (Barrio) o rural (Vereda) donde ocurrio el evento mediante analisis de punto en poligono (`ST_Contains`).

Adicionalmente, gestiona la integracion con **Leaflet.js**, proveyendo soporte multicapa para mapas base (Modo Claro, Modo Oscuro y Satelital), capas tematicas poligonales vectoriales, agrupamiento dinamico de marcadores (*Clustering*) y mapas de calor (*Heatmap*) para identificacion visual de zonas calientes (*hotspots*).

---

## 2. Arquitectura Cartografica (Leaflet.js y Capas Vectoriales)

El cliente web integra las siguientes capas cartograficas:

1. **Mapas Base (Tilesets):**
   - **Modo Claro:** Tiles de alta legibilidad urbana (OpenStreetMap / CartoDB Positron).
   - **Modo Oscuro:** CartoDB Dark Matter optimizado para interfaces nocturnas y visualizacion de marcadores de alto contraste.
   - **Modo Satelital:** Ortofotografia satelital de alta resolucion (Esri World Imagery) para inspeccion del relieve y areas rurales.
2. **Capa Urbana (Barrios):** Poligonos vectoriales cargados via GeoJSON (`/poligonoBarrio`) con los limites de las comunas y barrios del perimetro urbano.
3. **Capa Rural (Veredas):** Poligonos vectoriales cargados via GeoJSON (`/poligonoVereda`) que delimitan los corregimientos y veredas de Florencia.
4. **Capa de Incidentes (Clustering & Heatmap):** Marcadores geoespaciales interactivos con codificacion de color segun el nivel de gravedad:
   - Nivel 5 / Critico: Rojo
   - Nivel 4 / Alto: Naranja
   - Nivel 3 / Medio: Amarillo
   - Nivel 2 / Bajo: Azul
   - Nivel 1 / Leve: Verde

---

## 3. Consultas Espaciales PostGIS (Point-in-Polygon)

Al radicar o editar un incidente con coordenadas `(lng, lat)`, PostGIS determina de forma autonoma y precisa la pertenencia territorial:

```sql
-- 1. Evaluacion de pertenencia a Barrio (Perimetro Urbano)
SELECT gid, namebarrio 
FROM barrio 
WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)) 
LIMIT 1;

-- 2. Evaluacion de pertenencia a Vereda (Sector Rural)
SELECT id, nombre 
FROM vereda 
WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)) 
LIMIT 1;
```

---

## 4. Busqueda Geoespacial con Autocompletado Predictivo

El buscador del mapa permite localizar rapidamente sectores urbanos y rurales sin requerir conocimiento previo de la cartografia:

```mermaid
graph TD
    INP[Usuario digita texto en buscador] --> API1[GET /buscarBarrios?q=texto]
    INP --> API2[GET /buscarVeredas?q=texto]
    API1 --> DB1[SELECT namebarrio FROM barrio WHERE LOWER(namebarrio) LIKE LOWER('%...%')]
    API2 --> DB2[SELECT nombre FROM vereda WHERE nombre ILIKE '%...%']
    DB1 --> RES[Consolida lista desplegable con badges distintivos]
    DB2 --> RES
    RES --> UI[Usuario selecciona barrio o vereda]
    UI --> MAP[Leaflet ejecuta flyTo / panToBounds centrando el poligono]
```

---

## 5. Endpoints Geoespaciales de la API

| Metodo | Ruta | Descripcion | Respuesta |
| :--- | :--- | :--- | :--- |
| `GET` | `/incidentes` | Retorna los incidentes verificados y aprobados en formato GeoJSON FeatureCollection | GeoJSON FeatureCollection con puntos e informacion en properties |
| `GET` | `/poligonoBarrio` | Retorna la geometria vectorial completa de todos los barrios urbanos | GeoJSON MultiPolygon |
| `GET` | `/poligonoVereda` | Retorna la geometria vectorial completa de todas las veredas rurales | GeoJSON MultiPolygon |
| `GET` | `/buscarBarrioPorCoordenada` | Ejecuta ST_Contains dada una latitud y longitud enviadas por query params (`?lat=...&lng=...`) | Objeto JSON con barrio o vereda correspondiente |
| `GET` | `/buscarBarrios` | Autocompletado de barrios urbanos (`?q=nombre`) con limite de 10 registros | Array JSON `[ { "namebarrio": "..." } ]` |
| `GET` | `/buscarVeredas` | Autocompletado de veredas rurales (`?q=nombre`) con limite de 10 registros | Array JSON `[ { "nombre": "..." } ]` |
| `GET` | `/tiposIncidente` | Catalogo de tipos de incidente para asociacion y filtrado | Array JSON `[ { "idtipoincidente": 1, "nametipoincidente": "..." } ]` |
