# ESTIMACIÓN ECONÓMICA Y PRESUPUESTO DEL PROYECTO
## Sistema de Información Geográfica de Incidentes — SIGI
**Estudio Financiero Realista, Estructuración de Costos y Valor Comercial**

---

### Control del Documento
- **Proyecto:** SIGI - Sistema de Información Geográfica de Incidentes
- **Institución:** Servicio Nacional de Aprendizaje (SENA) — Regional Caquetá
- **Programa:** Análisis y Desarrollo de Software (ADSO) - Ficha 3142784
- **Autor y Desarrollador:** Daniel Felipe Vera Perdomo
- **Localización del Estudio:** Florencia, Caquetá, Colombia
- **Moneda Base:** Pesos Colombianos (COP)
- **Tarifa Base Aplicada:** \$15.000 COP / Hora (Perfil Aprendiz ADSO / Desarrollador Junior Local)
- **Versión del Estudio:** 2.1 (Ajuste Realista y Operativo del Proyecto en Ejecución)
- **Fecha:** Septiembre 2026

---

## ÍNDICE GENERAL

1. [INTRODUCCIÓN Y MARCO METODOLÓGICO REAL](#1-introducción-y-marco-metodológico-real)  
   1.1 [Propósito del Estudio Económico](#11-propósito-del-estudio-económico)  
   1.2 [Enfoque Práctico y Condiciones Reales de Ejecución](#12-enfoque-práctico-y-condiciones-reales-de-ejecución)  
2. [ESTRUCTURA DE COSTOS DIRECTOS (MANO DE OBRA Y DESARROLLO)](#2-estructura-de-costos-directos-mano-de-obra-y-desarrollo)  
   2.1 [Definición de la Tarifa Horaria ($15.000 COP/Hora)](#21-definición-de-la-tarifa-horaria-15000-cophora)  
   2.2 [Desglose Realista de Horas por Fases y Módulos](#22-desglose-realista-de-horas-por-fases-y-módulos)  
   2.3 [Consolidado del Costo Directo de Mano de Obra](#23-consolidado-del-costo-directo-de-mano-de-obra)  
3. [COSTOS INDIRECTOS DE DESARROLLO (EQUIPOS Y SERVICIOS)](#3-costos-indirectos-de-desarrollo-equipos-y-servicios)  
   3.1 [Depreciación Proporcional de Equipo de Cómputo Propio](#31-depreciación-proporcional-de-equipo-de-cómputo-propio)  
   3.2 [Conectividad y Energía Eléctrica Residencial](#32-conectividad-y-energía-eléctrica-residencial)  
4. [COSTOS REALES DE INFRAESTRUCTURA Y SERVICIOS ACTIVOS (OPEX)](#4-costos-reales-de-infraestructura-y-servicios-activos-opex)  
   4.1 [Servidor VPS en la Nube (Hostinger / DigitalOcean)](#41-servidor-vps-en-la-nube-hostinger--digitalocean)  
   4.2 [Dominio Web (.online / .xyz en Promoción Inicial)](#42-dominio-web-online--xyz-en-promoción-inicial)  
   4.3 [Cloudinary (Plan Gratuito Permanente / Free Tier)](#43-cloudinary-plan-gratuito-permanente--free-tier)  
   4.4 [Servicio SMTP de Notificaciones (Gmail App Password Gratuito)](#44-servicio-smtp-de-notificaciones-gmail-app-password-gratuito)  
   4.5 [Certificados SSL/TLS (Let's Encrypt Gratuito)](#45-certificados-ssltls-lets-encrypt-gratuito)  
   4.6 [Consolidado Real de Infraestructura (Mensual y Anual)](#46-consolidado-real-de-infraestructura-mensual-y-anual)  
5. [DETERMINACIÓN DEL VALOR COMERCIAL Y PRECIO DE VENTA](#5-determinación-del-valor-comercial-y-precio-de-venta)  
   5.1 [Estructura del Precio de Venta (Margen y Contingencia)](#51-estructura-del-precio-de-venta-margen-y-contingencia)  
   5.2 [Modelos de Comercialización Accesibles (Venta Directa vs. Mensualidad)](#52-modelos-de-comercialización-accesibles-venta-directa-vs-mensualidad)  
   5.3 [Póliza de Soporte Técnico y Mantenimiento Preventivo](#53-póliza-de-soporte-técnico-y-mantenimiento-preventivo)  
6. [EVALUACIÓN FINANCIERA, RETORNO DE INVERSIÓN (ROI) Y VIABILIDAD](#6-evaluación-financiera-retorno-de-inversión-roi-y-viabilidad)  
   6.1 [Ahorro Tangible Frente al Proceso Manual Anterior](#61-ahorro-tangible-frente-al-proceso-manual-anterior)  
   6.2 [Punto de Equilibrio Financiero](#62-punto-de-equilibrio-financiero)  
   6.3 [Conclusión y Dictamen de Viabilidad](#63-conclusión-y-dictamen-de-viabilidad)  

---

## 1. INTRODUCCIÓN Y MARCO METODOLÓGICO REAL

### 1.1 Propósito del Estudio Económico
Este documento presenta la estimación económica ajustada estrictamente a la **realidad operativa y financiera** en la que se está ejecutando el proyecto **SIGI**. 

A diferencia de estimaciones teóricas sobredimensionadas, aquí se reflejan las decisiones inteligentes de ingeniería y arquitectura adoptadas en el proyecto: uso de **planes gratuitos (Free Tier)** para servicios de alta tecnología (Cloudinary y SMTP de Gmail), adquisición de un **servidor VPS optimizado** donde coexisten la base de datos PostgreSQL/PostGIS y el backend Node.js, y el aprovechamiento de un **dominio web promocional** de bajo costo.

### 1.2 Enfoque Práctico y Condiciones Reales de Ejecución
- **Tarifa Horaria Realista:** Ajustada a **$15.000 COP / hora**, valor coherente para un proyecto formativo SENA ADSO en la región de la Amazonía (Florencia, Caquetá).
- **Aprovechamiento de Free Tier:** Cero costo de licenciamiento en software base (Node.js, PostgreSQL, PostGIS, Leaflet, Chart.js, VS Code, Git).
- **Costos de Producción Mínimos pero Profesionales:** El sistema ya se encuentra en capacidad de desplegarse en producción con una infraestructura que ronda apenas los \$80.000 COP mensuales.

---

## 2. ESTRUCTURA DE COSTOS DIRECTOS (MANO DE OBRA Y DESARROLLO)

> **ESPACIO PARA DIAGRAMA:**  
> *(Insertar aquí Gráfico Circular: Distribución de Horas y Costos por Módulos del Sistema)*

### 2.1 Definición de la Tarifa Horaria ($15.000 COP/Hora)
Para el contexto de Florencia, Caquetá y como proyecto de titulación técnica/tecnológica ADSO, se fija una tarifa de **\$15.000 COP por hora de desarrollo efectivo**:
- Representa un valor justo y competitivo que supera ampliamente el salario mínimo por hora legal colombiano, reconociendo la habilidad técnica en bases de datos espaciales y desarrollo web moderno.
- Permite formular un presupuesto viable y atractivo para entidades locales, pequeñas empresas de seguridad o juntas de acción comunal.

---

### 2.2 Desglose Realista de Horas por Fases y Módulos

El esfuerzo técnico real invertido en la construcción del ecosistema SIGI comprende **210 horas** de trabajo técnico especializado:

| Fase / Módulo de Trabajo | Tareas Técnicas Desarrolladas | Horas Invertidas | Subtotal ($15.000/h) |
| :--- | :--- | :---: | :---: |
| **Fase 1: Levantamiento y Requisitos (ERS IEEE 830)** | Análisis de requerimientos funcionales, matriz RBAC de 4 perfiles, casos de uso y diagramación. | 20 h | $300.000 COP |
| **Fase 2: Base de Datos Espacial (PostGIS)** | Diseño de esquemas DDL/DML, importación de shapefiles de barrios y veredas de Florencia, consultas `ST_Contains` e índices `GiST`. | 28 h | $420.000 COP |
| **Fase 3: Backend API REST y Seguridad Core** | Servidor Express 5, controladores modulares, autenticación Bcrypt, middlewares Helmet, Rate-Limit, guards y bitácora de auditoría. | 46 h | $690.000 COP |
| **Fase 4: Mesa de Validación y Concurrencia** | Cola compartida de incidentes, algoritmo de bloqueo concurrente (candado 10 min), dictámenes atómicos e importación masiva CSV con rollback. | 34 h | $510.000 COP |
| **Fase 5: Integración Multimedia y Correo** | SDK Cloudinary con upload en streaming de memoria (sin disco local), fallback local de contingencia y servicio SMTP Nodemailer. | 18 h | $270.000 COP |
| **Fase 6: Frontend Interactivo y Geocatálogos** | Diseño responsive Glassmorphism, integración de mapas Leaflet.js, geolocalización GPS móvil para reporteros y tableros analíticos en Chart.js. | 44 h | $660.000 COP |
| **Fase 7: Pruebas y Despliegue en VPS** | Configuración de Jest/Supertest, pruebas de endpoints, instalación en VPS Ubuntu (Node.js, PostgreSQL, Nginx) y pruebas de campo. | 20 h | $300.000 COP |
| **TOTALES ESFUERZO DE DESARROLLO** | **Ciclo de Vida Completo del Software** | **210 Horas** | **$3.150.000 COP** |

---

### 2.3 Consolidado del Costo Directo de Mano de Obra
El valor total de la inversión directa en mano de obra técnica para la programación y entrega del sistema asciende a **TRES MILLONES CIENTO CINCUENTA MIL PESOS COP (\$3.150.000 COP)**.

---

## 3. COSTOS INDIRECTOS DE DESARROLLO (EQUIPOS Y SERVICIOS)

Corresponden a los gastos operativos asumidos por el desarrollador durante el período de desarrollo (estimado en 2 meses):

| Concepto | Detalle de Cálculo | Duración | Subtotal (COP) |
| :--- | :--- | :---: | :---: |
| **Depreciación de Equipo de Cómputo** | Portátil personal de desarrollo (\$2.400.000 COP con depreciación a 3 años). | 2 meses | $133.333 COP |
| **Conectividad a Internet Residencial** | Servicio de internet fijo hogar (\$70.000 COP/mes — Proporción 50% atribuible al proyecto). | 2 meses | $70.000 COP |
| **Energía Eléctrica Proporcional** | Consumo eléctrico del equipo de cómputo y pruebas (\$40.000 COP/mes — Proporción 50%). | 2 meses | $40.000 COP |
| **Herramientas de Software** | VS Code, Git, DBeaver, Postman, Node.js (Todas herramientas Open Source / Gratuitas). | 2 meses | $0 COP |
| **TOTAL COSTOS INDIRECTOS** | **Gastos Generales de Desarrollo** | — | **$243.333 COP** |

---

## 4. COSTOS REALES DE INFRAESTRUCTURA Y SERVICIOS ACTIVOS (OPEX)

Aquí se describe el esquema **real y optimizado** que soporta la operación del sistema actualmente:

> **ESPACIO PARA DIAGRAMA:**  
> *(Insertar aquí Diagrama de Arquitectura de Costos de Infraestructura y Servicios Gratuitos/Pagos)*

### 4.1 Servidor VPS en la Nube (Hostinger / DigitalOcean)
- **Costo Real:** **$80.000 COP / mes**.
- **Detalle Técnico:** Servidor Virtual Privado (VPS) ejecutando Ubuntu Server 22.04 LTS con 2 vCPU, 4 GB de RAM y 50 GB de almacenamiento SSD NVMe.
- **Ventaja de Arquitectura:** En este único servidor conviven eficientemente el contenedor Node.js (gestionado por PM2), el servidor web inverso Nginx y el motor de base de datos PostgreSQL con PostGIS, evitando la necesidad de contratar servicios de bases de datos administradas independientes de alto costo.

### 4.2 Dominio Web (.online / .xyz en Promoción Inicial)
- **Costo Real:** **$4.000 COP (Pago único anual)**.
- **Detalle Técnico:** Adquisición de dominio personalizado mediante oferta de registro de primer año en proveedores como Hostinger, Namecheap o GoDaddy (extensiones accesibles como `.online`, `.site` o `.xyz`), brindando una presencia web formal e institucional para el geoportal por un costo prácticamente simbólico.

### 4.3 Cloudinary (Plan Gratuito Permanente / Free Tier)
- **Costo Real:** **$0 COP / mes ($0 USD)**.
- **Detalle Técnico:** El Plan Gratuito de Cloudinary otorga **25 créditos mensuales**, equivalentes a aproximadamente:
  - 25.000 transformaciones de imágenes al mes.
  - 25 GB de almacenamiento gestionado.
  - 25 GB de ancho de banda mensual.
- **Suficiencia para SIGI:** Para el volumen operativo de Florencia (estimado en 150 a 500 incidentes mensuales con foto comprimida en WebP), el consumo no supera el 5% de la cuota gratuita, garantizando **cero costo** de almacenamiento de evidencias en la nube.

### 4.4 Servicio SMTP de Notificaciones (Gmail App Password Gratuito)
- **Costo Real:** **$0 COP / mes**.
- **Detalle Técnico:** El sistema utiliza una cuenta de correo institucional o departamental configurada mediante **Contraseña de Aplicación de Google (App Password)** sobre Nodemailer con cifrado TLS/SSL.
- **Capacidad:** Permite despachar hasta **500 correos diarios gratuitos**, volumen más que suficiente para el envío de bienvenidas de usuarios, tokens de recuperación y notificaciones de alerta.

### 4.5 Certificados SSL/TLS (Let's Encrypt Gratuito)
- **Costo Real:** **$0 COP**.
- **Detalle Técnico:** Certificado de seguridad criptográfico SSL/TLS de validación de dominio emitido y renovado automáticamente mediante **Certbot / Let's Encrypt** sobre el servidor Nginx, habilitando HTTPS seguro sin costo de licencias.

---

### 4.6 Consolidado Real de Infraestructura (Mensual y Anual)

| Recurso / Servicio | Proveedor / Modalidad | Frecuencia de Pago | Costo Unitario (COP) | Costo Anual Proyectado (COP) |
| :--- | :--- | :---: | :---: | :---: |
| **Servidor VPS (Node + Postgres + PostGIS)** | Hostinger / DigitalOcean | Mensual | $80.000 COP / mes | $960.000 COP |
| **Dominio Web Personalizado** | Registrador DNS (Promoción 1er año) | Anual | $4.000 COP / año | $4.000 COP |
| **Almacenamiento Cloudinary (CDN)** | Cloudinary (Free Tier - 25 Créditos) | Mensual | $0 COP (Gratis) | $0 COP |
| **Servidor de Correo SMTP** | Gmail App Password (Hasta 500 emails/día) | Mensual | $0 COP (Gratis) | $0 COP |
| **Certificado de Seguridad SSL/TLS** | Let's Encrypt (Certbot Auto-renew) | Trimestral | $0 COP (Gratis) | $0 COP |
| **TOTAL INFRAESTRUCTURA DE PRODUCCIÓN (OPEX)** | **Operación Real del Sistema** | — | **$80.000 COP / mes** | **$964.000 COP / año** |

---

## 5. DETERMINACIÓN DEL VALOR COMERCIAL Y PRECIO DE VENTA

### 5.1 Estructura del Precio de Venta (Margen y Contingencia)
Integrando los costos directos de mano de obra ajustados a la realidad, los gastos indirectos y una provisión prudencial de utilidad para el desarrollador:

```
Costo Directo de Mano de Obra (210 horas @ $15.000):   $3.150.000 COP
Costos Indirectos de Desarrollo:                         $243.333 COP
Subtotal Costo de Fabricación:                        $3.393.333 COP
+ Reserva de Contingencias e Imprevistos (10%):           $339.333 COP
Subtotal Costo Técnico Total:                         $3.732.666 COP
+ Margen de Ganancia / Utilidad Comercial (30%):        $1.119.800 COP
---------------------------------------------------------------------
PRECIO DE VENTA SUGERIDO (LICENCIA SOFTWARE):         $4.852.466 COP
VALOR DE VENTA COMERCIAL REDONDEADO:                  $4.800.000 COP
```

---

### 5.2 Modelos de Comercialización Accesibles

Con el ajuste realista, el software se vuelve sumamente atractivo para la contratación pública o comercial en el Caquetá:

| Modalidad de Adquisición | Qué Incluye | Valor Sugerido (COP) |
| :--- | :--- | :--- |
| **Opción A: Venta de Licencia Propietaria (Llave en Mano)** | Código fuente completo, despliegue y puesta a punto en el VPS del cliente, configuración de PostGIS y capacitación inicial de 8 horas al personal. | **$4.800.000 COP** (Pago único) |
| **Opción B: Modalidad de Servicio Mensual (SaaS Completo)** | Acceso completo al sistema sin pagar licencia inicial; el cliente solo asume una mensualidad que cubre el VPS, soporte técnico, copias de seguridad continuas y mantenimiento. | **$350.000 COP / mes** (Contrato mínimo 1 año) |
| **Opción C: Bolsa de Horas de Evolución / Nuevos Módulos** | Desarrollo de funcionalidades adicionales solicitadas a demanda (nuevas capas cartográficas, reportes especiales). | **$25.000 COP / Hora** |

---

### 5.3 Póliza de Soporte Técnico y Mantenimiento Preventivo
Para la Opción A (Venta Propietaria), se ofrece una póliza de mantenimiento mensual muy económica:
- **Valor Mensual de Soporte:** **$120.000 COP / mes** ($1.440.000 COP al año).
- **Alcance:** Monitoreo del estado del VPS, ejecución de respaldos de base de datos semanales, renovación del certificado SSL y soporte técnico telefónico/remoto de segundo nivel ante incidencias.

---

## 6. EVALUACIÓN FINANCIERA, RETORNO DE INVERSIÓN (ROI) Y VIABILIDAD

> **ESPACIO PARA DIAGRAMA:**  
> *(Insertar aquí Gráfico de Punto de Equilibrio y Retorno de Inversión)*

### 6.1 Ahorro Tangible Frente al Proceso Manual Anterior
Antes de la implementación de SIGI, la recepción de novedades en Florencia demandaba minutas físicas de papel, transcripciones manuales en hojas de cálculo y llamadas telefónicas desorganizadas:
- **Ahorro en Personal de Transcripción:** Se elimina la necesidad de un digitador dedicado a consolidar planillas (ahorro mínimo de medio salario mínimo legal mensual: ~\$700.000 COP/mes).
- **Ahorro en Papelería y Formatos Físicos:** Reducción en talonarios y carpetas físicas de archivo (~\$80.000 COP/mes).
- **Ahorro Operativo Total Estimado:** **~$780.000 COP mensuales**.

### 6.2 Punto de Equilibrio Financiero
Si una entidad municipal adquiere el sistema bajo la modalidad de **Venta Directa ($4.800.000 COP)** y asume los costos operativos del VPS ($80.000 COP/mes):
- **Ahorro Neto Mensual Generado:**  
  $$\text{Ahorro Neto} = \$780.000 - \$80.000 = \$700.000 \text{ COP / mes}$$
- **Tiempo de Retorno de Inversión (Payback Period):**  
  $$\text{Período de Recuperación} = \frac{\$4.800.000}{\$700.000} \approx \mathbf{6.8 \text{ meses}}$$

El cliente recupera el 100% del dinero invertido en **menos de 7 meses**, convirtiendo al software en una inversión de altísima rentabilidad social y financiera.

---

### 6.3 Conclusión y Dictamen de Viabilidad
El nuevo modelo económico demuestra que **SIGI es una solución técnicamente de vanguardia y económicamente viable en el mundo real**:
1. **Aprovechamiento Eficiente de la Nube:** Al no pagar Cloudinary (Free Tier), ni correo (SMTP Google), ni licencias de BD (PostGIS nativo), los costos operativos se limitan estrictamente a los **\$80.000 COP mensuales del VPS** y **\$4.000 COP anuales del dominio**.
2. **Precio Competitivo y Real:** Con una tarifa de \$15.000/hora y un valor total de comercialización de **\$4.800.000 COP**, el proyecto es totalmente viable de vender, financiar o sustentar formalmente ante el SENA sin caer en cifras infladas o irreales.
