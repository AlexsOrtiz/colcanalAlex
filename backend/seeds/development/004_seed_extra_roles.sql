INSERT INTO auth.roles (nombre_rol, descripcion, default_module) VALUES
-- Nivel 1
('Gerente General', 'Acceso total al sistema y aprobación final de todas las requisiciones', 'dashboard'),

-- Nivel 2
('Director PMO', 'Dirección de proyectos y supervisión de módulos', 'dashboard'),
('Director Técnico', 'Supervisa directores de proyecto y ejecución técnica', 'proyectos'),
('Director Jurídico', 'Gestión de temas legales y contractuales', 'juridico'),
('Director Comercial', 'Gestión de comercializadoras***', 'comercial'),
('Director TICs', 'Administración de infraestructura tecnológica', 'sistemas'),
('Director Financiero y Administrativo', 'Supervisa finanzas, pagos y administración general', 'finanzas'),

-- Nivel 3
('Analista PMO', 'Apoya a la dirección PMO en seguimiento y control', 'dashboard'),
('Coordinador Jurídico', 'Coordina actividades legales y contractuales', 'juridico'),
('Analista Jurídico', 'Apoya en documentación legal y control normativo', 'juridico'),
('Analista Comercial', 'Ejecuta tareas operativas en el área comercial', 'comercial'),
('Analista TICs', 'Da soporte técnico y mantenimiento a sistemas', 'sistemas'),
('Coordinador SST', 'Supervisa seguridad y salud en el trabajo', 'administrativo'),
('Coordinador TH', 'Coordina gestión de talento humano', 'administrativo'),
('Coordinador Financiero', 'Coordina ejecución financiera y presupuestal', 'finanzas'),
('Analista Administrativo y Logístico', 'Gestiona procesos administrativos y de logística', 'administrativo'),
('Asistente Administrativo y de Mensajería', 'Apoya gestión documental y logística', 'administrativo'),
('Auxiliar de Gestión Documental', 'Apoya archivo y control documental', 'administrativo'),
('Auxiliar de Aseo y Cafetería', 'Apoya servicios generales y mantenimiento', 'administrativo'),

-- Nivel 4
('Director de Proyecto Antioquia', 'Supervisa proyectos en el departamento de Antioquia', 'proyectos'),
('Director de Proyecto Quindío', 'Supervisa proyectos en el departamento del Quindío', 'proyectos'),
('Director de Proyecto Valle', 'Supervisa proyectos en el departamento del Valle del Cauca', 'proyectos'),
('Director de Proyecto Putumayo', 'Supervisa proyectos en el departamento del Putumayo', 'proyectos'),

-- Nivel 5
('PQRS El Cerrito', 'Gestión de peticiones, quejas y reclamos en El Cerrito', 'pqrs'),
('PQRS Guacarí', 'Gestión de peticiones, quejas y reclamos en Guacarí', 'pqrs'),
('PQRS Circasia', 'Gestión de peticiones, quejas y reclamos en Circasia', 'pqrs'),
('PQRS Quimbaya', 'Gestión de peticiones, quejas y reclamos en Quimbaya', 'pqrs'),
('PQRS Jericó', 'Gestión de peticiones, quejas y reclamos en Jericó', 'pqrs'),
('PQRS Ciudad Bolívar', 'Gestión de peticiones, quejas y reclamos en Ciudad Bolívar', 'pqrs'),
('PQRS Tarso', 'Gestión de peticiones, quejas y reclamos en Tarso', 'pqrs'),
('PQRS Pueblo Rico', 'Gestión de peticiones, quejas y reclamos en Pueblo Rico', 'pqrs'),
('PQRS Santa Bárbara', 'Gestión de peticiones, quejas y reclamos en Santa Bárbara', 'pqrs'),
('PQRS Puerto Asís', 'Gestión de peticiones, quejas y reclamos en Puerto Asís', 'pqrs')
ON CONFLICT (nombre_rol) DO UPDATE
SET descripcion = EXCLUDED.descripcion,
    default_module = EXCLUDED.default_module;
