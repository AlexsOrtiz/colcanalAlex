-- Canalco Auth schema expansion for modular access control

-- Create modules (top-level functional areas)
CREATE TABLE IF NOT EXISTS auth.modulos (
    modulo_id SERIAL PRIMARY KEY,
    clave VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(120),
    es_activo BOOLEAN DEFAULT TRUE,
    orden INTEGER DEFAULT 0,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_modulos_activos ON auth.modulos (es_activo);
CREATE INDEX IF NOT EXISTS idx_auth_modulos_orden ON auth.modulos (orden);


-- Create categories per module
CREATE TABLE IF NOT EXISTS auth.categorias (
    categoria_id SERIAL PRIMARY KEY,
    modulo_id INT NOT NULL REFERENCES auth.modulos (modulo_id) ON DELETE CASCADE,
    clave VARCHAR(50) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    es_activo BOOLEAN DEFAULT TRUE,
    orden INTEGER DEFAULT 0,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (modulo_id, clave),
    UNIQUE (modulo_id, nombre)
);

CREATE INDEX IF NOT EXISTS idx_auth_categorias_modulo ON auth.categorias (modulo_id);
CREATE INDEX IF NOT EXISTS idx_auth_categorias_activos ON auth.categorias (es_activo);


-- Extend permissions catalog with additional metadata
ALTER TABLE auth.permisos
    ADD COLUMN IF NOT EXISTS clave VARCHAR(100),
    ADD COLUMN IF NOT EXISTS es_activo BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW();

UPDATE auth.permisos
SET clave = COALESCE(
        clave,
        LOWER(
            REGEXP_REPLACE(nombre_permiso, '[^a-zA-Z0-9]+', '_', 'g')
        )
    )
WHERE clave IS NULL;

ALTER TABLE auth.permisos
    ALTER COLUMN clave SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uq_auth_permisos_clave'
    ) THEN
        ALTER TABLE auth.permisos
            ADD CONSTRAINT uq_auth_permisos_clave UNIQUE (clave);
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_auth_permisos_activo ON auth.permisos (es_activo);


-- Roles to permissions per module and category
CREATE TABLE IF NOT EXISTS auth.roles_permisos_modulo_categoria (
    id SERIAL PRIMARY KEY,
    rol_id INT NOT NULL REFERENCES auth.roles (rol_id) ON DELETE CASCADE,
    modulo_id INT NOT NULL REFERENCES auth.modulos (modulo_id) ON DELETE CASCADE,
    categoria_id INT NOT NULL REFERENCES auth.categorias (categoria_id) ON DELETE CASCADE,
    permiso_id INT NOT NULL REFERENCES auth.permisos (permiso_id) ON DELETE CASCADE,
    alcance VARCHAR(50) DEFAULT 'total',
    restricciones JSONB,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'uq_roles_permisos_modulo_categoria'
          AND table_schema = 'auth'
    ) THEN
        ALTER TABLE auth.roles_permisos_modulo_categoria
            ADD CONSTRAINT uq_roles_permisos_modulo_categoria
                UNIQUE (rol_id, modulo_id, categoria_id, permiso_id);
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_auth_rpmc_modulo ON auth.roles_permisos_modulo_categoria (modulo_id);
CREATE INDEX IF NOT EXISTS idx_auth_rpmc_categoria ON auth.roles_permisos_modulo_categoria (categoria_id);
CREATE INDEX IF NOT EXISTS idx_auth_rpmc_permiso ON auth.roles_permisos_modulo_categoria (permiso_id);


-- User authorization hierarchy
CREATE TABLE IF NOT EXISTS auth.autorizaciones (
    autorizacion_id SERIAL PRIMARY KEY,
    supervisor_id INT NOT NULL REFERENCES auth.users (user_id) ON DELETE CASCADE,
    subordinado_id INT NOT NULL REFERENCES auth.users (user_id) ON DELETE CASCADE,
    modulo_id INT REFERENCES auth.modulos (modulo_id) ON DELETE CASCADE,
    categoria_id INT REFERENCES auth.categorias (categoria_id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL DEFAULT 'aprobacion',
    nivel SMALLINT DEFAULT 1,
    es_activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_auth_autorizaciones_relacion
        UNIQUE (supervisor_id, subordinado_id, modulo_id, categoria_id, tipo)
);

CREATE INDEX IF NOT EXISTS idx_auth_autorizaciones_supervisor ON auth.autorizaciones (supervisor_id);
CREATE INDEX IF NOT EXISTS idx_auth_autorizaciones_subordinado ON auth.autorizaciones (subordinado_id);
CREATE INDEX IF NOT EXISTS idx_auth_autorizaciones_modulo ON auth.autorizaciones (modulo_id);


-- Access log
CREATE TABLE IF NOT EXISTS auth.bitacora_accesos (
    bitacora_id BIGSERIAL PRIMARY KEY,
    user_id INT REFERENCES auth.users (user_id) ON DELETE SET NULL,
    email VARCHAR(120) NOT NULL,
    resultado VARCHAR(20) NOT NULL,
    mensaje TEXT,
    ip_origen INET,
    user_agent TEXT,
    metadata JSONB,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_bitacora_user ON auth.bitacora_accesos (user_id);
CREATE INDEX IF NOT EXISTS idx_auth_bitacora_email ON auth.bitacora_accesos (email);
CREATE INDEX IF NOT EXISTS idx_auth_bitacora_fecha ON auth.bitacora_accesos (creado_en DESC);
