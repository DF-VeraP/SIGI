# 📊 Módulo 04: Analítica, Indicadores KPI & Importación Masiva CSV

[⬅️ Volver al Índice General de Documentación](./README.md)

---

## 📌 1. Descripción del Módulo

El Módulo de Analítica transforma la información espacial y temporal de la base de datos en información estratégica para la toma de decisiones. Ofrece un panel de control con **Indicadores Clave de Rendimiento (KPIs)**, rankings de **Top 10 Zonas Críticas** y un motor de **Importación Masiva de CSV** con capacidad de reversión en lote (*Undo*).

---

## 📈 2. Tarjetas KPI Contextuales (Variación Mensual)

El dashboard cuenta con indicadores KPI de alto impacto visual diseñados para ofrecer contexto inmediato:

1. **Total de Incidentes (Periodo Actual):** Conteo dinámico según los filtros aplicados.
2. **Variación Mensual Contextual (vs. Mes Anterior):** 
   * Compara el volumen de incidentes del mes en curso contra el mes inmediatamente anterior.
   * Muestra la flecha de dirección e indicador de cambio procentual:
     * 📈 **↑ +12.5% vs. mes anterior** (Si incrementaron los casos - Alerta).
     * 📉 **↓ -8.3% vs. mes anterior** (Si se redujeron los casos - Positivo).
3. **Tasa de Atención y Verificación:** Porcentaje de incidentes atendidos exitosamente.

---

## 🏆 3. Ranking de Top 10 Zonas Críticas

Permite identificar rápidamente los 10 barrios o veredas con mayor concentración de criminalidad o emergencias:

```mermaid
graph LR
    DB[(PostgreSQL)] -->|GROUP BY idbarrio/idvereda| SQL[Consulta SQL Aggregation]
    SQL --> API[GET /api/estadisticas/top-barrios]
    API --> UI[Gráfico de Barras Horizontal Chart.js]
    UI -->|Clic en Barra| MAP[Filtra el Mapa al Barrio Seleccionado]
```

---

## 📥 4. Motor de Importación Masiva CSV & Función Deshacer (Undo)

Para procesar historiales masivos o datos provenientes de la Policía Nacional o Gestión del Riesgo, el sistema permite cargar archivos CSV masivos con trazabilidad de lotes (*Batch Import*).

### Proceso de Importación Masiva:
1. El usuario sube un archivo CSV con las columnas: `tipo_incidente, fecha, hora, latitud, longitud, direccion, descripcion`.
2. El servidor asigna un identificador de lote único: `id_lote_importacion = UUID()`.
3. Procesa el lote en una sola transacción SQL para garantizar integridad.

### Mecanismo de Reversión en Lote (Undo Import):
Si el usuario cargó un archivo incorrecto por error:
```sql
-- Eliminar todo el lote importado con un solo clic
DELETE FROM incidente WHERE id_lote_importacion = $1;
```

---

## 📡 5. Endpoints de la API Analítica

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/estadisticas/kpis` | Retorna los totales del periodo y la variación comparativa mensual (%) |
| `GET` | `/api/estadisticas/top-barrios` | Retorna el listado ordenado de los 10 barrios con más incidentes |
| `POST` | `/api/incidentes/importar-csv` | Carga un archivo CSV y genera el identificador de lote |
| `DELETE` | `/api/incidentes/deshacer-importacion/:idLote` | Revierte y elimina todos los registros creados por ese lote |
