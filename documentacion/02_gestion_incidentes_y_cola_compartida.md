# 🚨 Módulo 02: Registro de Incidentes y Cola Compartida (Shared Queue & Takeover)

[⬅️ Volver al Índice General de Documentación](./README.md)

---

## 📌 1. Descripción del Módulo

Este módulo gestiona la captura, validación y ciclo de vida operacional de los reportes de incidentes. Incluye la **Cola Compartida con Toma de Control (Takeover)**, un mecanismo diseñado para evitar conflictos de edición concurrente cuando múltiples administradores verifican incidentes simultáneamente en el territorio.

---

## 🔄 2. Ciclo de Vida del Incidente

Todo incidente pasa por los siguientes estados dentro de su flujo de atención:

```mermaid
stateDiagram-v2
    [*] --> Reportado : Reportero registra incidente
    Reportado --> En_Verificacion : Admin toma control (Takeover)
    En_Verificacion --> Verificado : Admin aprueba el reporte
    En_Verificacion --> Rechazado : Admin desestima reporte (duplicado/falso)
    Verificado --> En_Atencion : Asignación de patrulla / equipo
    En_Atencion --> Cerrado : Caso resuelto en terreno
    Rechazado --> [*]
    Cerrado --> [*]
```

---

## 🔒 3. Mecanismo de Bloqueo Atómico (Shared Queue & Takeover)

### Problema Resuelto:
Cuando 3 administradores abren el dashboard al mismo tiempo, el sistema debe evitar que dos administradores aprueben o modifiquen la gravedad del mismo incidente simultáneamente.

### Solución Implementada:
1. **Atenticidad de Bloqueo:** Cuando un Admin presiona "Atender / Verificar Incidente", el servidor ejecuta una consulta atómica en la BD PostgreSQL marcando:
   * `en_revision = true`
   * `id_usuario_revisando = id_admin_actual`
   * `fecha_inicio_revision = NOW()`
2. **Indicador Visual en Tiempo Real:** Para los demás administradores, el incidente aparece resaltado en la tabla como 🔒 **"En revisión por [Nombre Admin]"**, deshabilitando los botones de acción.
3. **Liberación Automática / Toma de Control:** Si un administrador abandona la sesión o pasa más de 15 minutos inactivas, otro administrador puede solicitar la **Toma de Control (Takeover)** para desbloquear el registro.

---

## 📊 4. Diagrama de Secuencia del Bloqueo Atómico

```mermaid
sequenceDiagram
    autonumber
    actor A1 as Admin 1 (Carlos)
    actor A2 as Admin 2 (María)
    participant B as Backend Express (/api/incidentes/:id/tomar)
    participant DB as PostgreSQL

    A1->>B: POST /api/incidentes/681/tomar
    B->>DB: UPDATE incidente SET en_revision = true, id_usuario_revisando = A1 WHERE en_revision = false
    DB-->>B: Exito (Filas afectadas = 1)
    B-->>A1: HTTP 200 (Bloqueo concedido a Carlos)

    Note over A2: María intenta tomar el mismo incidente simultáneamente
    A2->>B: POST /api/incidentes/681/tomar
    B->>DB: SELECT en_revision, id_usuario_revisando FROM incidente WHERE id = 681
    DB-->>B: Retorna en_revision = true (Revisando por Carlos)
    B-->>A2: HTTP 409 Conflict ("Incidente en revisión por Carlos")
```

---

## 🗄️ 5. Campos Clave en la Tabla `incidente`

```sql
ALTER TABLE incidente ADD COLUMN IF NOT EXISTS en_revision BOOLEAN DEFAULT false;
ALTER TABLE incidente ADD COLUMN IF NOT EXISTS id_usuario_revisando INT REFERENCES usuario(idusuario);
ALTER TABLE incidente ADD COLUMN IF NOT EXISTS fecha_inicio_revision TIMESTAMP;
```

---

## 📡 6. Endpoints de la API

| Método | Ruta | Descripción | Roles Autorizados |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/incidentes` | Registrar nuevo incidente con foto (`multipart/form-data`) | `reportero`, `admin`, `superadmin` |
| `GET` | `/incidentesFiltroAdmin` | Consultar cola compartida con filtros y estado de revisión | `admin`, `superadmin` |
| `POST` | `/api/incidentes/:id/tomar` | Adquirir el bloqueo atómico del incidente | `admin`, `superadmin` |
| `POST` | `/api/incidentes/:id/liberar` | Liberar el bloqueo del incidente | `admin`, `superadmin` |
| `PUT` | `/api/incidentes/:id/estado` | Cambiar estado (Verificado, Rechazado, Cerrado) | `admin`, `superadmin` |
