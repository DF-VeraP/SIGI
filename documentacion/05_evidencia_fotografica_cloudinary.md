# 📸 Módulo 05: Servicio de Evidencia Fotográfica con Cloudinary CDN

[⬅️ Volver al Índice General de Documentación](./README.md)

---

## 📌 1. Introducción y Justificación Técnica

El módulo de evidencia fotográfica permite a los **Reporteros de Campo** adjuntar capturas fotográficas en tiempo real al registrar incidentes en el territorio. 

### ¿Por qué Cloudinary?
1. **Descarga de Servidor VPS / Local:** Guardar imágenes pesadas en el servidor local de la entidad satura el disco duro y reduce la velocidad del sistema.
2. **Red de Distribución CDN:** Cloudinary distribuye y optimiza automáticamente la resolución de las fotos según el dispositivo que la consulta.
3. **Escalabilidad y Seguridad:** Garantiza URLs públicas HTTPS protegidas y organizadas por carpetas (`sigi_incidentes`).

---

## 🔄 2. Diagrama de Secuencia del Flujo (End-to-End)

El siguiente diagrama ilustra el recorrido completo desde la captura en el dispositivo móvil del reportero hasta la visualización en la Mesa de Control del Administrador:

```mermaid
sequenceDiagram
    autonumber
    actor R as Reportero (Móvil)
    participant F as Frontend Reportero (JS / FormData)
    participant B as Backend Express (Node.js / Multer)
    participant U as Utilidad Cloudinary (utils/cloudinary.js)
    participant C as Cloudinary CDN (Nube)
    participant DB as PostgreSQL / PostGIS
    actor A as Administrador (Mesa de Control)

    R->>F: Toma/Adjunta foto & presiona "Registrar Incidente"
    F->>B: Envía POST /api/incidentes (multipart/form-data con foto)
    B->>U: Pasa el Buffer del archivo y el código de incidente
    
    alt Conexión a Nube Exitosa
        U->>C: Sube la imagen usando unsigned_upload ("sigi_preset")
        C-->>U: Retorna URL segura HTTPS (ej: https://res.cloudinary.com/...)
    else Falla de Internet / Error de Nube (Fallback)
        U->>U: Almacena foto localmente en /public/uploads/incidentes/
        U-->>B: Retorna URL relativa local (ej: /uploads/incidentes/INC-XXXX.jpg)
    end

    B->>DB: INSERT INTO incidente (..., imagen_url)
    DB-->>B: Confirma registro creado
    B-->>F: Responde HTTP 201 (Incidente Registrado con éxito)
    
    Note over A, DB: El Administrador revisa la Mesa de Control
    A->>DB: Consulta la tabla de incidentes
    DB-->>A: Retorna filas incluyendo la columna imagen_url
    A->>A: Presiona el botón "🖼️ Ver Foto" -> Despliega Modal Lightbox
```

---

## 🏗️ 3. Diagrama de Arquitectura de Componentes

```mermaid
graph TD
    subgraph Cliente Móvil
        R1[App Reportero - index.html] --> R2[Envío FormData con Foto]
    end

    subgraph Backend Node.js / Express
        R2 --> M[Middleware Multer - MemoryStorage]
        M --> C[Controlador incidentes.controller.js]
        C --> U[Utilidad utils/cloudinary.js]
    end

    subgraph Almacenamiento & Persistencia
        U -->|Primario: Subida CDN| CL[Cloudinary Nube - sigi_preset]
        U -->|Reserva: Fallback Local| FS[Disco Servidor - /public/uploads/incidentes/]
        C -->|Guarda URL| DB[(PostgreSQL + PostGIS)]
    end

    subgraph Mesa de Control
        DB -->|Carga Registro| AD[Admin Dashboard - admin.js]
        AD -->|Clic en Ver Foto| LB[Modal Visor Lightbox Alta Res.]
    end
```

---

## 🛡️ 4. Mecanismo de Resiliencia (Tolerancia a Fallos / Fallback Local)

El sistema cuenta con una arquitectura resiliente para garantizar **disponibilidad del 100%**, previniendo la pérdida de reportes si se agota el paquete de datos del móvil o si la API de la nube no responde:

| Estado de la Nube | Acción del Sistema | Resultado en Base de Datos |
| :--- | :--- | :--- |
| **Nube Disponible (Online)** | Sube a Cloudinary con `sigi_preset` | `imagen_url = 'https://res.cloudinary.com/...'` |
| **Nube Inaccesible / Sin Red** | Guarda copia local en `/public/uploads/incidentes/` | `imagen_url = '/uploads/incidentes/INC-XXXXXX.jpg'` |

---

## ⚙️ 5. Variables de Entorno y Configuración (`.env`)

Para conectar el servicio con tu cuenta de Cloudinary, se requieren las siguientes variables en el archivo `.env`:

```env
# CLOUDINARY CONFIG
CLOUDINARY_CLOUD_NAME=jhstpfiw
CLOUDINARY_API_KEY=287989477625174
CLOUDINARY_API_SECRET=S0wJrzPVRXgkJg7HUbCW7FBLI_o
CLOUDINARY_UPLOAD_PRESET=sigi_preset
```

---

## 📡 6. Especificación del Endpoint API

### `POST /api/incidentes`
* **Tipo de Contenido:** `multipart/form-data`
* **Respuesta Exitosa (HTTP 201 Created):**
```json
{
  "mensaje": "Incidente registrado exitosamente",
  "incidente": {
    "idincidente": 681,
    "codigoincidente": "RO0109261805A0681",
    "imagen_url": "https://res.cloudinary.com/jhstpfiw/image/upload/v1788305406/sigi_incidentes/INC-RO0109261805A0681.png"
  }
}
```
