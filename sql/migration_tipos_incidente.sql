-- MIGRACIÓN: Soporte de colores y descripción para tipos de incidentes
ALTER TABLE IF EXISTS public.tipo_incidente 
    ADD COLUMN IF NOT EXISTS color character varying(20),
    ADD COLUMN IF NOT EXISTS descripcion text;

-- Inicializar colores y descripciones predeterminados para los 4 tipos iniciales
UPDATE public.tipo_incidente 
SET color = '#ef4444', 
    descripcion = 'Hurtos, atracos, robos a personas o establecimientos comerciales' 
WHERE idtipoincidente = 1 AND (color IS NULL OR color = '');

UPDATE public.tipo_incidente 
SET color = '#f59e0b', 
    descripcion = 'Riñas callejeras, agresiones físicas, violencia y amenazas' 
WHERE idtipoincidente = 2 AND (color IS NULL OR color = '');

UPDATE public.tipo_incidente 
SET color = '#8b5cf6', 
    descripcion = 'Carreras clandestinas y maniobras peligrosas de motocicletas' 
WHERE idtipoincidente = 3 AND (color IS NULL OR color = '');

UPDATE public.tipo_incidente 
SET color = '#10b981', 
    descripcion = 'Choques, colisiones vehiculares, atropellos y volcamientos viales' 
WHERE idtipoincidente = 4 AND (color IS NULL OR color = '');
