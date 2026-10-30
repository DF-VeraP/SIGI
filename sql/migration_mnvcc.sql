-- ============================================================
-- MIGRACIÓN MNVCC (TOMO 2.2 CAPÍTULOS 3, 5 Y 6 - POLICÍA NACIONAL)
-- Proyecto: SIGI - Sistema de Información Geográfica de Incidentes
-- Jurisdicción: Departamento de Policía Caquetá (DECAQ) - Florencia
-- ============================================================

BEGIN;

-- 1. TABLA: cuadrante (Unidades territoriales urbanas y rurales del MNVCC)
CREATE TABLE IF NOT EXISTS public.cuadrante (
    id_cuadrante serial PRIMARY KEY,
    codigo_cuadrante character varying(40) NOT NULL UNIQUE,
    nombre character varying(120) NOT NULL,
    tipo character varying(20) NOT NULL DEFAULT 'urbano'
        CHECK (tipo IN ('urbano', 'rural', 'vial', 'fluvial')),
    unidad_base character varying(120) DEFAULT 'Estación de Policía Florencia',
    telefono_contacto character varying(30),
    color character varying(20) DEFAULT '#2563eb',
    sectores_barrios text,
    geom geometry(MultiPolygon, 4326),
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cuadrante_geom ON public.cuadrante USING GIST (geom);

-- 2. TABLA: manzana_urbana_igac (Manzanas exclusivamente urbanas filtradas de 18001.gdb / bd_geo)
CREATE TABLE IF NOT EXISTS public.manzana_urbana_igac (
    objectid integer PRIMARY KEY,
    codigo character varying(35),
    sector_catastral character varying(15),
    id_cuadrante integer REFERENCES public.cuadrante(id_cuadrante) ON DELETE SET NULL,
    geom geometry(MultiPolygon, 4326)
);

CREATE INDEX IF NOT EXISTS idx_manzana_urbana_geom ON public.manzana_urbana_igac USING GIST (geom);

-- 3. VINCULACIÓN TERRITORIAL CON BARRIO, VEREDA E INCIDENTE
ALTER TABLE IF EXISTS public.barrio
    ADD COLUMN IF NOT EXISTS id_cuadrante integer REFERENCES public.cuadrante(id_cuadrante) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.vereda
    ADD COLUMN IF NOT EXISTS id_cuadrante integer REFERENCES public.cuadrante(id_cuadrante) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.incidente
    ADD COLUMN IF NOT EXISTS id_cuadrante integer REFERENCES public.cuadrante(id_cuadrante) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_incidente_id_cuadrante ON public.incidente (id_cuadrante);

-- Trigger automático en PostGIS para asignar id_cuadrante a cada incidente nuevo o editado
CREATE OR REPLACE FUNCTION public.fn_asignar_cuadrante_incidente()
RETURNS trigger AS $$
BEGIN
    IF NEW.id_cuadrante IS NULL AND NEW.geom IS NOT NULL THEN
        SELECT c.id_cuadrante INTO NEW.id_cuadrante
        FROM public.cuadrante c
        WHERE c.geom IS NOT NULL AND ST_Intersects(c.geom, NEW.geom)
        ORDER BY CASE WHEN c.tipo = 'urbano' THEN 1 ELSE 2 END ASC
        LIMIT 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_asignar_cuadrante_incidente ON public.incidente;
CREATE TRIGGER trg_asignar_cuadrante_incidente
BEFORE INSERT OR UPDATE OF geom ON public.incidente
FOR EACH ROW EXECUTE FUNCTION public.fn_asignar_cuadrante_incidente();

-- 4. TABLA: problema_cuadrante (Puntos Críticos y Análisis Causal CIEPS - Cap. 5.1.3 y 5.1.4)
CREATE TABLE IF NOT EXISTS public.problema_cuadrante (
    id_problema serial PRIMARY KEY,
    id_cuadrante integer REFERENCES public.cuadrante(id_cuadrante) ON DELETE CASCADE,
    titulo character varying(160) NOT NULL,
    tipologia_punto_critico character varying(40) NOT NULL DEFAULT 'facilitador_infracciones'
        CHECK (tipologia_punto_critico IN ('generador_oportunidad', 'atractor_infractores', 'facilitador_infracciones')),
    delito_predominante character varying(100),
    nivel_riesgo character varying(20) DEFAULT 'ALTO',
    cantidad_incidentes integer DEFAULT 1,
    radio_metros integer DEFAULT 200,
    lat numeric(10,6),
    lng numeric(10,6),
    geom geometry(Point, 4326),
    porque_1 text,
    porque_2 text,
    porque_3 text,
    porque_4 text,
    porque_5 text,
    causa_raiz text,
    factores_ishikawa jsonb DEFAULT '{}'::jsonb,
    actores_corresponsables text DEFAULT 'Policía Nacional (DECAQ), Alcaldía de Florencia, Secretaría de Gobierno',
    estado character varying(30) DEFAULT 'activo'
        CHECK (estado IN ('activo', 'en_intervencion', 'mitigado')),
    id_usuario_analista integer REFERENCES public.usuario(idusuario) ON DELETE SET NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_problema_cuadrante_geom ON public.problema_cuadrante USING GIST (geom);

-- 5. TABLA: tamir_actividad (Tabla de Acciones Mínimas Requeridas - Cap. 5.2.3 y 6.1.7)
CREATE TABLE IF NOT EXISTS public.tamir_actividad (
    id_tamir serial PRIMARY KEY,
    id_cuadrante integer NOT NULL REFERENCES public.cuadrante(id_cuadrante) ON DELETE CASCADE,
    id_problema integer REFERENCES public.problema_cuadrante(id_problema) ON DELETE SET NULL,
    id_patrullero_asignado integer REFERENCES public.usuario(idusuario) ON DELETE SET NULL,
    id_usuario_creador integer REFERENCES public.usuario(idusuario) ON DELETE SET NULL,
    semana_vigencia character varying(30) NOT NULL,
    dias_semana character varying(100) NOT NULL DEFAULT 'Lunes a Domingo',
    franja_horaria character varying(40) NOT NULL DEFAULT '16:00 a 19:59',
    lugar_especifico character varying(160) NOT NULL,
    problematica_priorizada text NOT NULL,
    actividad_preventiva text NOT NULL,
    actores_apoyo character varying(160) DEFAULT 'Patrulla del Cuadrante',
    estado_cumplimiento character varying(30) DEFAULT 'pendiente'
        CHECK (estado_cumplimiento IN ('pendiente', 'en_ejecucion', 'cumplida', 'reprogramada')),
    observacion_turno text,
    evidencia_url text,
    fecha_cumplimiento timestamp without time zone,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
