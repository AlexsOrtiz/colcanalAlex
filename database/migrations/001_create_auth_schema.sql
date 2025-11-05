-- Canalco Auth schema bootstrap

CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.roles (
    rol_id SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    default_module VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS auth.permisos (
    permiso_id SERIAL PRIMARY KEY,
    nombre_permiso VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS auth.users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    cargo VARCHAR(120),
    rol_id INT NOT NULL REFERENCES auth.roles (rol_id),
    estado BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ultimo_login TIMESTAMP WITH TIME ZONE,
    must_reset BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth.users (email);
