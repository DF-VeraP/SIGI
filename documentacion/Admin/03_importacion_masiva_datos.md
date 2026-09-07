# Módulo 03: Importación Masiva de Datos y Rollback

## 1. Identificación y Propósito
- **Rol:** Admin (y Superadmin)
- **Ruta Frontend:** `/admin` (Botón de base de datos `#impDat` / Modal de importación)
- **Archivos Clave:**
  - `public/admin/admin.js`
  - `controllers/incidentes.controller.js`
  - `routes/incidentes.routes.js`
- **Propósito:** Permitir la carga por lotes de cientos o miles de incidentes históricos o provenientes de entidades externas (Policía, Fiscalía, Alcaldía) a través de archivos Excel o CSV, incluyendo la posibilidad de revertir la última carga en caso de error en los datos.

---

## 2. Submódulos y Especificaciones Técnicas

### 2.1. Carga y Procesamiento de Archivos (CSV / XLSX)
- **Endpoint:** `POST /importar-incidentes`
- **Formato:** `multipart/form-data` con campo de archivo `archivo`.
- **Librería Backend:** Procesamiento con `xlsx` / `csv-parser` en memoria.
- **Validaciones Automáticas:**
  - Existencia de columnas obligatorias: Tipo, Fecha, Latitud, Longitud.
  - Validación de rango geográfico (evita coordenadas fuera del municipio o en formato invertido Longitud/Latitud).
  - Sanitización de formatos de fecha y hora.

### 2.2. Inserción Transaccional por Lote
- **Identificador de Lote (`batch_id`):** Cada importación genera un UUID o timestamp único que etiqueta a todas las filas insertadas en esa ejecución.
- **Transacción Atómica en PostgreSQL (`BEGIN ... COMMIT`):** Si una fila presenta un error irrecuperable de base de datos, toda la transacción se cancela (`ROLLBACK`), evitando inconsistencias parciales.

### 2.3. Mecanismo de Reversión (Deshacer Última Importación)
- **Endpoint:** `DELETE /importados/ultimo`
- **Utilidad:** Si el analista nota que el archivo importado tenía columnas corridas o fechas erróneas, puede presionar *"Deshacer última importación"*.
- **Acción:** El servidor localiza el lote más reciente (`MAX(batch_id)`) y elimina de forma limpia todos los incidentes asociados a esa carga masiva.

---

## 3. Dependencias y Flujo de Interacción
- **Dependencia:** Requiere permisos administrativos y que la base de datos soporte inserción en bloque.
- **Impacto:** Altera instantáneamente las métricas y los mapas de calor de toda la plataforma.

---

## 4. Diagrama de Arquitectura y Flujo
El diagrama de este módulo se encuentra en:
👉 [`Admin/diagramas/03_importacion_masiva_datos.drawio`](diagramas/03_importacion_masiva_datos.drawio)
