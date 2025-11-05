-- Seed base modules, categories, permissions and admin assignments

-- Modules
WITH upsert_modules AS (
    INSERT INTO auth.modulos (clave, nombre, descripcion, icono, orden)
    VALUES
        ('dashboard', 'Dashboard', 'Resumen ejecutivo y métricas clave', 'dashboard', 1),
        ('compras', 'Compras', 'Gestión integral de requisiciones y compras', 'shopping-cart', 2),
        ('inventarios', 'Inventarios', 'Control de existencias y movimientos', 'boxes', 3),
        ('reportes', 'Reportes', 'Analítica y reportería ejecutiva', 'bar-chart', 4),
        ('usuarios', 'Usuarios', 'Administración de usuarios y roles', 'users', 5),
        ('proveedores', 'Proveedores', 'Gestión de proveedores y homologaciones', 'building', 6),
        ('auditorias', 'Auditorías', 'Trazabilidad y cumplimiento normativo', 'shield-check', 7),
        ('notificaciones', 'Notificaciones', 'Alertas y comunicación automática', 'bell', 8)
    ON CONFLICT (clave) DO UPDATE
        SET nombre = EXCLUDED.nombre,
            descripcion = EXCLUDED.descripcion,
            icono = EXCLUDED.icono,
            orden = EXCLUDED.orden,
            actualizado_en = NOW()
    RETURNING modulo_id, clave
)
SELECT 1;


-- Categories per module
WITH categoria_data (modulo_clave, clave, nombre, descripcion, orden) AS (
    VALUES
        ('dashboard', 'general', 'Panel principal', 'Indicadores y panel general', 1),
        ('compras', 'requisiciones', 'Requisiciones', 'Gestión de requisiciones', 1),
        ('compras', 'cotizaciones', 'Cotizaciones', 'Comparativo y análisis de proveedores', 2),
        ('compras', 'ordenes_compra', 'Órdenes de compra', 'Autorización y seguimiento de OC', 3),
        ('inventarios', 'existencias', 'Existencias', 'Control de stock y niveles', 1),
        ('inventarios', 'movimientos', 'Movimientos', 'Entradas y salidas de inventario', 2),
        ('reportes', 'compras', 'Reportes de compras', 'Indicadores del módulo de compras', 1),
        ('reportes', 'finanzas', 'Reportes financieros', 'Visualizaciones financieras', 2),
        ('reportes', 'inventarios', 'Reportes de inventario', 'Niveles y rotación de inventarios', 3),
        ('usuarios', 'gestion', 'Gestión de usuarios', 'Alta, baja y modificación de usuarios', 1),
        ('proveedores', 'registro', 'Registro de proveedores', 'Alta y mantenimiento de proveedores', 1),
        ('proveedores', 'evaluacion', 'Evaluación de proveedores', 'Seguimiento de desempeño', 2),
        ('auditorias', 'trazabilidad', 'Trazabilidad', 'Bitácora y auditorías cruzadas', 1),
        ('notificaciones', 'alertas', 'Alertas', 'Notificaciones y recordatorios', 1)
),
upsert_categorias AS (
    INSERT INTO auth.categorias (modulo_id, clave, nombre, descripcion, orden)
    SELECT m.modulo_id, c.clave, c.nombre, c.descripcion, c.orden
    FROM categoria_data c
    JOIN auth.modulos m ON m.clave = c.modulo_clave
    ON CONFLICT (modulo_id, clave) DO UPDATE
        SET nombre = EXCLUDED.nombre,
            descripcion = EXCLUDED.descripcion,
            orden = EXCLUDED.orden,
            actualizado_en = NOW()
    RETURNING categoria_id
)
SELECT 1;


-- Permissions catalogue
WITH upsert_permisos AS (
    INSERT INTO auth.permisos (clave, nombre_permiso, descripcion, es_activo, actualizado_en)
    VALUES
        ('ver', 'Ver', 'Permite visualizar registros', TRUE, NOW()),
        ('crear', 'Crear', 'Permite crear nuevos registros', TRUE, NOW()),
        ('editar', 'Editar', 'Permite modificar registros existentes', TRUE, NOW()),
        ('aprobar', 'Aprobar', 'Permite aprobar o autorizar registros', TRUE, NOW()),
        ('eliminar', 'Eliminar', 'Permite eliminar registros', TRUE, NOW()),
        ('exportar', 'Exportar', 'Permite exportar información', TRUE, NOW())
    ON CONFLICT (clave) DO UPDATE
        SET nombre_permiso = EXCLUDED.nombre_permiso,
            descripcion = EXCLUDED.descripcion,
            es_activo = EXCLUDED.es_activo,
            actualizado_en = NOW()
    RETURNING permiso_id, clave
)
SELECT 1;


-- Assign full access to Administrador role
WITH admin_role AS (
    SELECT rol_id FROM auth.roles WHERE nombre_rol = 'Administrador'
),
module_categories AS (
    SELECT c.modulo_id, c.categoria_id
    FROM auth.categorias c
),
all_permissions AS (
    SELECT permiso_id FROM auth.permisos
),
insert_data AS (
    SELECT
        r.rol_id,
        mc.modulo_id,
        mc.categoria_id,
        p.permiso_id
    FROM admin_role r
    CROSS JOIN module_categories mc
    CROSS JOIN all_permissions p
)
INSERT INTO auth.roles_permisos_modulo_categoria
    (rol_id, modulo_id, categoria_id, permiso_id, alcance, actualizado_en)
SELECT
    d.rol_id,
    d.modulo_id,
    d.categoria_id,
    d.permiso_id,
    'total',
    NOW()
FROM insert_data d
ON CONFLICT (rol_id, modulo_id, categoria_id, permiso_id) DO UPDATE
    SET alcance = EXCLUDED.alcance,
        actualizado_en = NOW();
