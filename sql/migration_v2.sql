-- ============================================================
-- SCRIPT DE MIGRACIÓN BASE DE DATOS - SIGI V2
-- Proyecto: SIGI - Mapeo de Incidentes
-- Descripción: Implementación del nuevo modelo relacional,
--              roles (Superadmin, Admin, Reportero), estados,
--              gravedades, categorías, auditoría y notificaciones.
-- ============================================================

BEGIN;

-- 1. TABLA: categoria_incidente
CREATE TABLE IF NOT EXISTS public.categoria_incidente
(
    id_categoria serial NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    color character varying(20) DEFAULT '#6c757d',
    icono character varying(50),
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT categoria_incidente_pkey PRIMARY KEY (id_categoria)
);

-- 2. MODIFICAR TABLA: tipo_incidente
ALTER TABLE IF EXISTS public.tipo_incidente
    ADD COLUMN IF NOT EXISTS id_categoria integer,
    ADD COLUMN IF NOT EXISTS codigo character varying(10),
    ADD COLUMN IF NOT EXISTS nivel_riesgo_base character varying(20) DEFAULT 'media',
    ADD COLUMN IF NOT EXISTS tiempo_resolucion_promedio integer,
    ADD COLUMN IF NOT EXISTS requiere_visita boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS activo boolean DEFAULT true,
    ADD COLUMN IF NOT EXISTS fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_tipo_categoria') THEN
        ALTER TABLE public.tipo_incidente 
        ADD CONSTRAINT fk_tipo_categoria FOREIGN KEY (id_categoria) 
        REFERENCES public.categoria_incidente (id_categoria) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. TABLA: gravedad_incidente
CREATE TABLE IF NOT EXISTS public.gravedad_incidente
(
    id_gravedad serial NOT NULL,
    nombre character varying(50) NOT NULL,
    nivel integer NOT NULL CHECK (nivel BETWEEN 1 AND 5),
    color character varying(20) NOT NULL,
    prioridad integer NOT NULL CHECK (prioridad BETWEEN 1 AND 5),
    tiempo_respuesta_horas integer,
    descripcion text,
    icono character varying(50),
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT gravedad_incidente_pkey PRIMARY KEY (id_gravedad)
);

-- 4. TABLA: estado_incidente
CREATE TABLE IF NOT EXISTS public.estado_incidente
(
    id_estado serial NOT NULL,
    nombre character varying(50) NOT NULL,
    descripcion text,
    color character varying(20) NOT NULL,
    orden integer NOT NULL,
    es_final boolean DEFAULT false,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT estado_incidente_pkey PRIMARY KEY (id_estado)
);

-- 5. TABLA: modalidad_incidente
CREATE TABLE IF NOT EXISTS public.modalidad_incidente
(
    id_modalidad serial NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    tipo character varying(50) CHECK (tipo IN ('violencia', 'engano', 'fuerza', 'vial', 'otro')),
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT modalidad_incidente_pkey PRIMARY KEY (id_modalidad)
);

-- 6. TABLA: factores_incidente
CREATE TABLE IF NOT EXISTS public.factores_incidente
(
    id_factor serial NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    categoria character varying(50) CHECK (categoria IN ('social', 'economico', 'ambiental', 'infraestructura', 'otro')),
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT factores_incidente_pkey PRIMARY KEY (id_factor)
);

-- 7. MODIFICAR TABLA: usuario
ALTER TABLE IF EXISTS public.usuario
    ADD COLUMN IF NOT EXISTS email character varying(150),
    ADD COLUMN IF NOT EXISTS rol character varying(20) DEFAULT 'reportero',
    ADD COLUMN IF NOT EXISTS estado character varying(20) DEFAULT 'activo',
    ADD COLUMN IF NOT EXISTS email_verificado boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS dependencia character varying(100),
    ADD COLUMN IF NOT EXISTS telefono character varying(20),
    ADD COLUMN IF NOT EXISTS foto_perfil text,
    ADD COLUMN IF NOT EXISTS ultimo_acceso timestamp without time zone,
    ADD COLUMN IF NOT EXISTS fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS created_by integer,
    ADD COLUMN IF NOT EXISTS fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'usuario_created_by_fkey') THEN
        ALTER TABLE public.usuario
        ADD CONSTRAINT usuario_created_by_fkey FOREIGN KEY (created_by)
        REFERENCES public.usuario (idusuario) ON DELETE SET NULL;
    END IF;
END $$;

-- 8. TABLA: token
CREATE TABLE IF NOT EXISTS public.token
(
    id_token serial NOT NULL,
    id_usuario integer NOT NULL,
    token character varying(255) NOT NULL,
    tipo character varying(30) NOT NULL CHECK (tipo IN ('verificacion', 'reset_password', 'invitacion')),
    expiracion timestamp without time zone NOT NULL,
    usado boolean DEFAULT false,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT token_pkey PRIMARY KEY (id_token),
    CONSTRAINT token_token_key UNIQUE (token),
    CONSTRAINT token_id_usuario_fkey FOREIGN KEY (id_usuario)
        REFERENCES public.usuario (idusuario) ON DELETE CASCADE
);

-- 9. TABLA: logs_actividad
CREATE TABLE IF NOT EXISTS public.logs_actividad
(
    id_log serial NOT NULL,
    id_usuario integer,
    accion character varying(50) NOT NULL,
    tabla_afectada character varying(50),
    id_registro integer,
    descripcion text,
    ip character varying(45),
    user_agent text,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT logs_actividad_pkey PRIMARY KEY (id_log),
    CONSTRAINT logs_actividad_id_usuario_fkey FOREIGN KEY (id_usuario)
        REFERENCES public.usuario (idusuario) ON DELETE SET NULL
);

-- 10. TABLA: notificaciones
CREATE TABLE IF NOT EXISTS public.notificaciones
(
    id_notificacion serial NOT NULL,
    id_usuario integer NOT NULL,
    tipo character varying(50) NOT NULL CHECK (tipo IN ('bienvenida', 'creacion_usuario', 'cambio_rol', 'alerta', 'recordatorio')),
    asunto character varying(200) NOT NULL,
    mensaje text NOT NULL,
    leido boolean DEFAULT false,
    enviado boolean DEFAULT false,
    fecha_envio timestamp without time zone,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notificaciones_pkey PRIMARY KEY (id_notificacion),
    CONSTRAINT notificaciones_id_usuario_fkey FOREIGN KEY (id_usuario)
        REFERENCES public.usuario (idusuario) ON DELETE CASCADE
);

-- 11. TABLA: sesiones
CREATE TABLE IF NOT EXISTS public.sesiones
(
    id_sesion serial NOT NULL,
    id_usuario integer NOT NULL,
    token_jwt character varying(500) NOT NULL,
    ip character varying(45),
    user_agent text,
    fecha_inicio timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion timestamp without time zone,
    activo boolean DEFAULT true,
    CONSTRAINT sesiones_pkey PRIMARY KEY (id_sesion),
    CONSTRAINT sesiones_id_usuario_fkey FOREIGN KEY (id_usuario)
        REFERENCES public.usuario (idusuario) ON DELETE CASCADE
);

-- 12. MODIFICAR TABLA: incidente
ALTER TABLE IF EXISTS public.incidente
    ADD COLUMN IF NOT EXISTS id_gravedad integer,
    ADD COLUMN IF NOT EXISTS id_estado integer,
    ADD COLUMN IF NOT EXISTS id_modalidad integer,
    ADD COLUMN IF NOT EXISTS direccion text,
    ADD COLUMN IF NOT EXISTS comentarios_adicionales text,
    ADD COLUMN IF NOT EXISTS id_usuario_creador integer,
    ADD COLUMN IF NOT EXISTS id_usuario_editor integer,
    ADD COLUMN IF NOT EXISTS fecha_edicion timestamp without time zone,
    ADD COLUMN IF NOT EXISTS numero_victimas integer DEFAULT 1,
    ADD COLUMN IF NOT EXISTS numero_vehiculos_afectados integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS valor_perdidas numeric(15,2),
    ADD COLUMN IF NOT EXISTS requiere_ambulancia boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS requiere_policia boolean DEFAULT true,
    ADD COLUMN IF NOT EXISTS requiere_bomberos boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS hora_pico boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS dia_semana integer CHECK (dia_semana BETWEEN 1 AND 7),
    ADD COLUMN IF NOT EXISTS mes integer CHECK (mes BETWEEN 1 AND 12),
    ADD COLUMN IF NOT EXISTS anio integer,
    ADD COLUMN IF NOT EXISTS temporada character varying(20);

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_incidente_gravedad') THEN
        ALTER TABLE public.incidente ADD CONSTRAINT fk_incidente_gravedad FOREIGN KEY (id_gravedad) REFERENCES public.gravedad_incidente (id_gravedad) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_incidente_estado') THEN
        ALTER TABLE public.incidente ADD CONSTRAINT fk_incidente_estado FOREIGN KEY (id_estado) REFERENCES public.estado_incidente (id_estado) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_incidente_modalidad') THEN
        ALTER TABLE public.incidente ADD CONSTRAINT fk_incidente_modalidad FOREIGN KEY (id_modalidad) REFERENCES public.modalidad_incidente (id_modalidad) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_incidente_creador') THEN
        ALTER TABLE public.incidente ADD CONSTRAINT fk_incidente_creador FOREIGN KEY (id_usuario_creador) REFERENCES public.usuario (idusuario) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_incidente_editor') THEN
        ALTER TABLE public.incidente ADD CONSTRAINT fk_incidente_editor FOREIGN KEY (id_usuario_editor) REFERENCES public.usuario (idusuario) ON DELETE SET NULL;
    END IF;
END $$;

-- 13. TABLA: incidente_factores (Relación N:N)
CREATE TABLE IF NOT EXISTS public.incidente_factores
(
    id_incidente_factor serial NOT NULL,
    id_incidente integer NOT NULL,
    id_factor integer NOT NULL,
    CONSTRAINT incidente_factores_pkey PRIMARY KEY (id_incidente_factor),
    CONSTRAINT incidente_factores_unique UNIQUE (id_incidente, id_factor),
    CONSTRAINT fk_incidente_factores_incidente FOREIGN KEY (id_incidente)
        REFERENCES public.incidente (idincidente) ON DELETE CASCADE,
    CONSTRAINT fk_incidente_factores_factor FOREIGN KEY (id_factor)
        REFERENCES public.factores_incidente (id_factor) ON DELETE CASCADE
);

-- 14. TABLA: analisis_incidentes
CREATE TABLE IF NOT EXISTS public.analisis_incidentes
(
    id_analisis serial NOT NULL,
    id_tipo integer,
    zona_id integer,
    zona_tipo character varying(20) CHECK (zona_tipo IN ('barrio', 'vereda')),
    prediccion_cantidad integer,
    nivel_riesgo character varying(20) CHECK (nivel_riesgo IN ('bajo', 'medio', 'alto', 'critico')),
    fecha_prediccion date,
    precision_estimada numeric(5,2),
    modelo_utilizado character varying(100),
    fecha_analisis timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT analisis_incidentes_pkey PRIMARY KEY (id_analisis),
    CONSTRAINT fk_analisis_tipo FOREIGN KEY (id_tipo)
        REFERENCES public.tipo_incidente (idtipoincidente) ON DELETE CASCADE
);

-- ============================================================
-- DATOS SEMILLA (SEEDERS) PARA INICIALIZACIÓN
-- ============================================================

-- Insertar Estados del Incidente si no existen
INSERT INTO public.estado_incidente (id_estado, nombre, descripcion, color, orden, es_final) VALUES
(1, 'Reportado', 'Incidente recién creado en espera de revisión por un Admin', '#ffc107', 1, false),
(2, 'En evaluación', 'El reporte está siendo clasificado y evaluado por el Admin', '#17a2b8', 2, false),
(3, 'En investigación', 'Incidente en proceso de verificación detallada', '#6f42c1', 3, false),
(4, 'En proceso judicial', 'Derivado a autoridades correspondientes', '#fd7e14', 4, false),
(5, 'Resuelto', 'Incidente atendido y finalizado exitosamente', '#28a745', 5, true),
(6, 'Cerrado sin resolver', 'Incidente desestimado o cerrado por duplicidad/falta de evidencia', '#6c757d', 6, true)
ON CONFLICT (id_estado) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    color = EXCLUDED.color,
    orden = EXCLUDED.orden,
    es_final = EXCLUDED.es_final;

-- Actualizar secuencia de estado_incidente
SELECT setval('estado_incidente_id_estado_seq', (SELECT MAX(id_estado) FROM public.estado_incidente));

-- Insertar Gravedades del Incidente si no existen
INSERT INTO public.gravedad_incidente (id_gravedad, nombre, nivel, color, prioridad, tiempo_respuesta_horas, descripcion) VALUES
(1, 'Muy baja', 1, '#6c757d', 5, 48, 'Incidentes leves de impacto mínimo'),
(2, 'Baja', 2, '#28a745', 4, 24, 'Incidentes menores sin lesiones ni pérdidas considerables'),
(3, 'Media', 3, '#ffc107', 3, 12, 'Incidentes estándar que requieren atención moderada'),
(4, 'Alta', 4, '#fd7e14', 2, 4, 'Incidentes de impacto severo con pérdidas o heridos'),
(5, 'Crítica', 5, '#dc3545', 1, 1, 'Incidentes de urgencia máxima con riesgo vital o gran afectación')
ON CONFLICT (id_gravedad) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    nivel = EXCLUDED.nivel,
    color = EXCLUDED.color,
    prioridad = EXCLUDED.prioridad,
    tiempo_respuesta_horas = EXCLUDED.tiempo_respuesta_horas;

SELECT setval('gravedad_incidente_id_gravedad_seq', (SELECT MAX(id_gravedad) FROM public.gravedad_incidente));

-- Insertar Categorías principales
INSERT INTO public.categoria_incidente (id_categoria, nombre, descripcion, color, icono) VALUES
(1, 'Delitos contra la propiedad', 'Hurtos, robos, daños a bienes', '#dc3545', 'bi-shield-exclamation'),
(2, 'Delitos contra las personas', 'Homicidios, agresiones, lesiones', '#d9534f', 'bi-person-exclamation'),
(3, 'Accidentes y Movilidad', 'Accidentes de tránsito, atropellos, choques', '#f0ad4e', 'bi-car-front-fill'),
(4, 'Convivencia y Orden Público', 'Piques ilegales, riñas, perturbación', '#0275d8', 'bi-people-fill'),
(5, 'Otros Incidentes', 'Categoría general para otros eventos', '#5bc0de', 'bi-info-circle-fill')
ON CONFLICT (id_categoria) DO NOTHING;

SELECT setval('categoria_incidente_id_categoria_seq', (SELECT MAX(id_categoria) FROM public.categoria_incidente));

-- Insertar Modalidades
INSERT INTO public.modalidad_incidente (id_modalidad, nombre, tipo, descripcion) VALUES
(1, 'Con arma de fuego', 'violencia', 'Uso de armas de fuego durante el evento'),
(2, 'Con arma cortopunzante', 'violencia', 'Uso de objetos punzocortantes'),
(3, 'Sin violencia / Factor oportunidad', 'engano', 'Hurto o evento sin violencia física directa'),
(4, 'Fuerza sobre las cosas', 'fuerza', 'Forzamiento de cerraduras o ventanas'),
(5, 'Accidente / Choque vehicular', 'vial', 'Evento originado por colisión de tránsito')
ON CONFLICT (id_modalidad) DO NOTHING;

SELECT setval('modalidad_incidente_id_modalidad_seq', (SELECT MAX(id_modalidad) FROM public.modalidad_incidente));

-- Insertar Factores de Incidente
INSERT INTO public.factores_incidente (id_factor, nombre, categoria, descripcion) VALUES
(1, 'Falta de iluminación', 'infraestructura', 'Deficiencia o ausencia de alumbrado público en la zona'),
(2, 'Zona desolada / Sin vigilancia', 'ambiental', 'Poca afluencia de personas o ausencia de presencia policial'),
(3, 'Consumo de sustancias en vía pública', 'social', 'Presencia de consumo activo de alcohol o estupefacientes'),
(4, 'Falta de señalización vial', 'infraestructura', 'Inexistencia de pares, semáforos o reductores de velocidad')
ON CONFLICT (id_factor) DO NOTHING;

SELECT setval('factores_incidente_id_factor_seq', (SELECT MAX(id_factor) FROM public.factores_incidente));

-- ============================================================
-- HOMOLOGACIÓN Y ACTUALIZACIÓN DE REGISTROS EXISTENTES
-- ============================================================

-- Asignar estado por defecto (Reportado = 1) a incidentes existentes
UPDATE public.incidente SET id_estado = 1 WHERE id_estado IS NULL;

-- Asignar gravedad por defecto (Media = 3) a incidentes existentes
UPDATE public.incidente SET id_gravedad = 3 WHERE id_gravedad IS NULL;

-- Vincular id_usuario_creador a idusuario existente si está nulo
UPDATE public.incidente SET id_usuario_creador = idusuario WHERE id_usuario_creador IS NULL AND idusuario IS NOT NULL;

-- Asignar rol 'superadmin' al primer usuario o usuarios existentes si están sin rol definido
UPDATE public.usuario SET rol = 'superadmin' WHERE rol IS NULL OR rol = 'reportero' AND idusuario = 1;

COMMIT;
