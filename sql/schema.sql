-- ============================================================
-- SCRIPT COMPLETO DE BASE DE DATOS
-- Proyecto: SIGI - Mapeo de Incidentes
-- ============================================================

BEGIN;

-- ============================================================
-- ACTIVAR POSTGIS (si no está activado)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- TABLA: barrio
-- ============================================================
CREATE TABLE IF NOT EXISTS public.barrio
(
    gid serial NOT NULL,
    idbarrio character varying(80) COLLATE pg_catalog."default",
    namebarrio character varying(100) COLLATE pg_catalog."default",
    idcomuna character varying(25) COLLATE pg_catalog."default",
    geom geometry(MultiPolygon,4326),
    CONSTRAINT barrio_pkey PRIMARY KEY (gid)
);

-- ============================================================
-- TABLA: corregimiento
-- ============================================================
CREATE TABLE IF NOT EXISTS public.corregimiento
(
    idcorregimiento serial NOT NULL,
    namecorregimiento character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT corregimineto_pkey PRIMARY KEY (idcorregimiento)
);

-- ============================================================
-- TABLA: tipo_incidente
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tipo_incidente
(
    idtipoincidente serial NOT NULL,
    nametipoincidente character varying(100) COLLATE pg_catalog."default",
    CONSTRAINT tipo_incidente_pkey PRIMARY KEY (idtipoincidente)
);

-- ============================================================
-- TABLA: usuario
-- ============================================================
CREATE TABLE IF NOT EXISTS public.usuario
(
    idusuario serial NOT NULL,
    nombreusuario character varying(50) COLLATE pg_catalog."default" NOT NULL,
    contraseniausuario character varying(255) COLLATE pg_catalog."default" NOT NULL,
    entidadusuario character varying(100) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT usuario_pkey PRIMARY KEY (idusuario),
    CONSTRAINT usuario_nombreusuario_key UNIQUE (nombreusuario)
);

-- ============================================================
-- TABLA: vereda
-- ============================================================
CREATE TABLE IF NOT EXISTS public.vereda
(
    id serial NOT NULL,
    geom geometry(MultiPolygon,4326),
    nombre character varying COLLATE pg_catalog."default",
    idcorregimiento integer,
    CONSTRAINT Vereda_pkey PRIMARY KEY (id)
);

-- ============================================================
-- TABLA: incidente
-- ============================================================
CREATE TABLE IF NOT EXISTS public.incidente
(
    idincidente serial NOT NULL,
    descripcionincidente text COLLATE pg_catalog."default" NOT NULL,
    idtipoincidente integer,
    fechaincidente date NOT NULL,
    horaincidente time without time zone NOT NULL,
    idbarrio integer,
    geom geometry(Point,4326),
    idusuario integer,
    idvereda integer,
    codigoincidente character varying(50) COLLATE pg_catalog."default",
    CONSTRAINT incidente_pkey PRIMARY KEY (idincidente),
    CONSTRAINT incidente_codigoincidente_key UNIQUE (codigoincidente)
);

-- ============================================================
-- CREAR ÍNDICES PARA MEJORAR EL RENDIMIENTO
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_incidente_geom ON incidente USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_barrio_geom ON barrio USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_vereda_geom ON vereda USING GIST (geom);

-- ============================================================
-- AGREGAR LAS LLAVES FORÁNEAS (RELACIONES)
-- ============================================================
ALTER TABLE IF EXISTS public.incidente
    ADD CONSTRAINT fk_vereda FOREIGN KEY (idvereda)
    REFERENCES public.vereda (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public.incidente
    ADD CONSTRAINT fkusuario FOREIGN KEY (idusuario)
    REFERENCES public.usuario (idusuario) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public.incidente
    ADD CONSTRAINT incidente_idbarrio_fkey FOREIGN KEY (idbarrio)
    REFERENCES public.barrio (gid) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public.incidente
    ADD CONSTRAINT incidente_idtipoincidente_fkey FOREIGN KEY (idtipoincidente)
    REFERENCES public.tipo_incidente (idtipoincidente) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public.vereda
    ADD CONSTRAINT fk_idcorregimiento FOREIGN KEY (idcorregimiento)
    REFERENCES public.corregimiento (idcorregimiento) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

-- ============================================================
-- VERIFICAR QUE TODO ESTÁ BIEN
-- ============================================================
SELECT PostGIS_Version();

COMMIT;