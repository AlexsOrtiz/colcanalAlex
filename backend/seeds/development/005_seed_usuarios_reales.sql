-- ==============================================
-- 🌟 Usuarios reales iniciales del sistema Canalco
-- ==============================================

-- 🧑‍💼 Directores de Proyecto
INSERT INTO auth.users (email, password, nombre, cargo, rol_id, estado)
VALUES
('proyecto.antioquia@canalco.com', '$2b$12$WMjSBPWtmi2zohby0Q3hcuCW6Qx0ocD4cQ4OE.9m13OlKl9IXuKNy', 'Director Proyecto Antioquia', 'Director de Proyecto Antioquia', (SELECT rol_id FROM auth.roles WHERE nombre_rol = 'Director de Proyecto Antioquia'), TRUE),
('proyecto.quindio@canalco.com', '$2b$12$aUv0w7jgXrmljZu5X8s2UeQjeS7Iqe2ULAaqaFsGom5HGjHBrR5gm', 'Director Proyecto Quindío', 'Director de Proyecto Quindío', (SELECT rol_id FROM auth.roles WHERE nombre_rol = 'Director de Proyecto Quindío'), TRUE),
('proyecto.valle@canalco.com', '$2b$12$iPaB9dAHUxhhMBvawKxk3e/fuKAoqfvNJf1SPvUem8m38K41tjyda', 'Director Proyecto Valle', 'Director de Proyecto Valle', (SELECT rol_id FROM auth.roles WHERE nombre_rol = 'Director de Proyecto Valle'), TRUE),
('proyecto.putumayo@canalco.com', '$2b$12$IHxLo8iYVNK5pD6YqkDrEu1ZQ838u8R/INsS.rm3V2DOlJXD4mEKC', 'Director Proyecto Putumayo', 'Director de Proyecto Putumayo', (SELECT rol_id FROM auth.roles WHERE nombre_rol = 'Director de Proyecto Putumayo'), TRUE);

-- 🧑‍💼 Directores de Área
INSERT INTO auth.users (email, password, nombre, cargo, rol_id, estado)
VALUES
('area1@canalco.com', '$2b$12$0d5slz5GxdaOOBgPP5VSaeGIDSKNQbbX8aGcUjoRUT/46cHjhckbu', 'Director Área 1', 'Director de Área TICs', (SELECT rol_id FROM auth.roles WHERE nombre_rol = 'Director TICs'), TRUE),
('area2@canalco.com', '$2b$12$MSjAj7JsMdJfH1dBltg1K.lhYJdaL20J7YKv15.PziE.5Ur8H5ogy', 'Director Área 2', 'Director de Área Jurídica', (SELECT rol_id FROM auth.roles WHERE nombre_rol = 'Director Jurídico'), TRUE),
('area3@canalco.com', '$2b$12$70UAz8fn5aPPjotRaReN9eKF.FJixqQB4WktmEdYy70oLts6bDCu', 'Director Área 3', 'Director de Área Comercial', (SELECT rol_id FROM auth.roles WHERE nombre_rol = 'Director Comercial'), TRUE),
('area4@canalco.com', '$2b$12$UelaTjgi.WBcTKNF2JTPMeNQNJvXunqSm4jPXKoOGw4ZVhW4gkYGq', 'Director Área 4', 'Director de Área Financiera', (SELECT rol_id FROM auth.roles WHERE nombre_rol = 'Director Financiero y Administrativo'), TRUE),
('area5@canalco.com', '$2b$12$czIxd77YLh0rbU989FuAneXRw6ngFZZmySRPuLzBU0syMxykjqNRS', 'Director Área 5', 'Director de Área PMO', (SELECT rol_id FROM auth.roles WHERE nombre_rol = 'Director PMO'), TRUE);

-- 📨 PQRS Municipios
INSERT INTO auth.users (email, password, nombre, cargo, rol_id, estado)
VALUES
('pqrs.elcerrito@canalco.com', '$2b$12$2pjUXittDltss.kesu4AxOPHQPRoMw.q1BzriHdd61jYPxUv5Zxje', 'PQRS El Cerrito', 'Gestión PQRS El Cerrito', (SELECT rol_id FROM auth.roles WHERE nombre_rol = 'PQRS El Cerrito'), TRUE),
('pqrs.guacari@canalco.com', '$2b$12$fKFuKXKj3m1m71C9OxLx9.KbyZJGept6TlJn7ALHmVTEi..y8lweS', 'PQRS Guacarí', 'Gestión PQRS Guacarí', (SELECT rol_id FROM auth.roles WHERE nombre_rol = 'PQRS Guacarí'), TRUE),
('pqrs.circasia@canalco.com', '$2b$12$GCCjZCoDRhgdEu.hJi3fxO4AunhNj7LJeWU5KAjNlQXuwb8xNJP/q', 'PQRS Circasia', 'Gestión PQRS Circasia', (SELECT rol_id FROM auth.roles WHERE nombre_rol = 'PQRS Circasia'), TRUE),
('pqrs.quimbaya@canalco.com', '$2b$12$qS8u88D9leUHDbkyUmzJ/OaaP7XqKDPPw0k8MEKF4qbaKr6PPMfvy', 'PQRS Quimbaya', 'Gestión PQRS Quimbaya', (SELECT rol_id FROM auth.roles WHERE nombre_rol = 'PQRS Quimbaya'), TRUE),
('pqrs.jerico@canalco.com', '$2b$12$kmPie55qEoSmkTWjjg6US.yAlhyx2oz1iaU3NHuer7la8LRkccXF6', 'PQRS Jericó', 'Gestión PQRS Jericó', (SELECT rol_id FROM auth.roles WHERE nombre_rol = 'PQRS Jericó'), TRUE),
('pqrs.ciudadbolivar@canalco.com', '$2b$12$7gDa1LMo2B.uBq9JfwqIC.eAmy21rnKwt5gQX/arg6MlEXxswNK2y', 'PQRS Ciudad Bolívar', 'Gestión PQRS Ciudad Bolívar', (SELECT rol_id FROM auth.roles WHERE nombre_rol = 'PQRS Ciudad Bolívar'), TRUE);

-- 🛒 Compras
INSERT INTO auth.users (email, password, nombre, cargo, rol_id, estado)
VALUES
('compras@canalco.com', '$2b$12$CTNqaDTw9x2dzQZ0bwPd5eZBoeXcAAmV9rLFQB1l7lpdSqduhwaba', 'Usuario Compras', 'Área de Compras', (SELECT rol_id FROM auth.roles WHERE nombre_rol = 'Compras'), TRUE);
