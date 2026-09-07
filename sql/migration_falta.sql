-- ============================================================
-- MIGRACIÓN: CONTROL DE ACCESO, REGISTRO E INACTIVIDAD (Falta.txt)
-- ============================================================

-- 1. Asegurar columna 'debe_cambiar_password' en usuario
ALTER TABLE IF EXISTS public.usuario 
ADD COLUMN IF NOT EXISTS debe_cambiar_password boolean DEFAULT false;

-- 2. Asegurar que email exista y tenga restricción UNIQUE
ALTER TABLE IF EXISTS public.usuario 
ADD COLUMN IF NOT EXISTS email character varying(150);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'usuario_email_key' 
        AND table_name = 'usuario'
    ) THEN
        ALTER TABLE public.usuario ADD CONSTRAINT usuario_email_key UNIQUE (email);
    END IF;
END $$;

-- 3. Asegurar existencia de la tabla token para recuperación y verificación
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

CREATE INDEX IF NOT EXISTS idx_token_lookup ON public.token (token, tipo, usado);
