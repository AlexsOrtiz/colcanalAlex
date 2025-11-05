-- Seed base roles for Canalco
INSERT INTO auth.roles (nombre_rol, descripcion, default_module)
VALUES
    ('Administrador', 'Acceso completo al sistema', 'dashboard'),
    ('Gerente', 'Supervisa requisiciones y reportes', 'requisiciones'),
    ('Compras', 'Gestiona requisiciones y órdenes de compra', 'requisiciones'),
    ('Almacen', 'Control de inventarios y recepciones', 'inventarios'),
    ('PMO', 'Administración y gobierno del sistema', 'dashboard'),
    ('Analista', 'Acceso a reportes y analítica', 'reportes')
ON CONFLICT (nombre_rol) DO UPDATE
SET
    descripcion = EXCLUDED.descripcion,
    default_module = EXCLUDED.default_module;
