-- ============================================================
-- SCRIPT DE MIGRACIÓN: Hashear contraseñas existentes
-- Proyecto: SIGI
-- Ejecutar UNA SOLA VEZ después de actualizar auth.controller.js
-- ============================================================

-- Activar extensión pgcrypto (necesaria para crypt/gen_salt)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Hashear todas las contraseñas que aún están en texto plano
-- Las contraseñas ya hasheadas (prefijo $2a$ o $2b$) se ignoran
UPDATE usuario
SET contraseniausuario = crypt(contraseniausuario, gen_salt('bf', 10))
WHERE contraseniausuario NOT LIKE '$2a$%'
  AND contraseniausuario NOT LIKE '$2b$%';

-- Verificar que todas las contraseñas fueron hasheadas
SELECT idusuario, nombreusuario,
       CASE
         WHEN contraseniausuario LIKE '$2a$%' OR contraseniausuario LIKE '$2b$%'
         THEN 'Hasheada'
         ELSE 'Texto plano'
       END AS estado_contrasenia
FROM usuario;

