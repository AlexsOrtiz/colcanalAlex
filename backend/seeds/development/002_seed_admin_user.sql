-- Seed initial administrator user.
-- Replace the placeholder hash with a bcrypt hash generated via backend/app/utils/security.hash_password.

INSERT INTO auth.users (email, password, nombre, cargo, rol_id, estado)
VALUES (
    'admin@canalco.com',
    '$2b$12$O3ogGtFneN0rDsJgKpjQ1ulhM.Qm97mXxEC1VjNqgIDLEAz00XBS6',
    'Administrador General',
    'PMO',
    (SELECT rol_id FROM auth.roles WHERE nombre_rol = 'Administrador'),
    TRUE
)
ON CONFLICT (email) DO UPDATE
SET
    password = EXCLUDED.password,
    nombre = EXCLUDED.nombre,
    cargo = EXCLUDED.cargo,
    rol_id = EXCLUDED.rol_id,
    estado = EXCLUDED.estado;
