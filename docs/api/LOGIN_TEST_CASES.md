# Casos de Uso - Login de Usuario

Este documento contiene los casos de uso para probar el endpoint de login con ejemplos de curl y sus respuestas esperadas.

## Configuración Base

**URL Base:** `http://localhost:8000`
**Endpoint:** `POST /api/login`
**Content-Type:** `application/json`
**Dominio Permitido:** `@canalco.com`

---

## Casos de Uso Exitosos

### 1. Login como Administrador

**Descripción:** Usuario administrador con acceso completo al sistema.

**Curl:**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@canalco.com",
    "password": "PasswordActual123"
  }'
```

**Respuesta Esperada (HTTP 200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "user_id": 1,
    "email": "admin@canalco.com",
    "nombre": "Administrador del Sistema",
    "rol_id": 1,
    "nombre_rol": "Administrador",
    "default_module": "dashboard"
  }
}
```

**Notas:**
- Rol: Administrador (acceso completo)
- Módulo por defecto: dashboard
- Token JWT válido por 60 minutos

---

### 2. Login como Director de Proyecto - Antioquia

**Descripción:** Director de proyecto con acceso a gestión de proyectos específicos.

**Curl:**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "proyecto.antioquia@canalco.com",
    "password": "PasswordActual123"
  }'
```

**Respuesta Esperada (HTTP 200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "user_id": 6,
    "email": "proyecto.antioquia@canalco.com",
    "nombre": "Director Proyecto Antioquia",
    "rol_id": 12,
    "nombre_rol": "Director de Proyecto Antioquia",
    "default_module": "dashboard"
  }
}
```

**Notas:**
- Rol: Director de Proyecto Antioquia
- Módulo por defecto: dashboard
- Acceso nivel 4 (project directors)

---

### 3. Login como Director de Proyecto - Quindío

**Descripción:** Director de proyecto para la región del Quindío.

**Curl:**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "proyecto.quindio@canalco.com",
    "password": "PasswordActual123"
  }'
```

**Respuesta Esperada (HTTP 200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "user_id": 7,
    "email": "proyecto.quindio@canalco.com",
    "nombre": "Director Proyecto Quindío",
    "rol_id": 13,
    "nombre_rol": "Director de Proyecto Quindío",
    "default_module": "dashboard"
  }
}
```

---

### 4. Login como Director de Proyecto - Valle

**Descripción:** Director de proyecto para la región del Valle.

**Curl:**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "proyecto.valle@canalco.com",
    "password": "PasswordActual123"
  }'
```

**Respuesta Esperada (HTTP 200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "user_id": 8,
    "email": "proyecto.valle@canalco.com",
    "nombre": "Director Proyecto Valle",
    "rol_id": 14,
    "nombre_rol": "Director de Proyecto Valle",
    "default_module": "dashboard"
  }
}
```

---

### 5. Login como Director de Proyecto - Putumayo

**Descripción:** Director de proyecto para la región del Putumayo.

**Curl:**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "proyecto.putumayo@canalco.com",
    "password": "PasswordActual123"
  }'
```

**Respuesta Esperada (HTTP 200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "user_id": 9,
    "email": "proyecto.putumayo@canalco.com",
    "nombre": "Director Proyecto Putumayo",
    "rol_id": 15,
    "nombre_rol": "Director de Proyecto Putumayo",
    "default_module": "dashboard"
  }
}
```

---

### 6. Login como Director de TICs

**Descripción:** Director de área de Tecnologías de la Información.

**Curl:**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "area1@canalco.com",
    "password": "PasswordActual123"
  }'
```

**Respuesta Esperada (HTTP 200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "user_id": 10,
    "email": "area1@canalco.com",
    "nombre": "Director TICs",
    "rol_id": 6,
    "nombre_rol": "Director TICs",
    "default_module": "dashboard"
  }
}
```

**Notas:**
- Rol: Director de Área - TICs
- Módulo por defecto: dashboard
- Acceso nivel 1 (directores de área)

---

### 7. Login como Director Jurídico

**Descripción:** Director del área jurídica.

**Curl:**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "area2@canalco.com",
    "password": "PasswordActual123"
  }'
```

**Respuesta Esperada (HTTP 200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "user_id": 11,
    "email": "area2@canalco.com",
    "nombre": "Director Jurídico",
    "rol_id": 7,
    "nombre_rol": "Director Jurídico",
    "default_module": "dashboard"
  }
}
```

---

### 8. Login como Director Comercial

**Descripción:** Director del área comercial.

**Curl:**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "area3@canalco.com",
    "password": "PasswordActual123"
  }'
```

**Respuesta Esperada (HTTP 200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "user_id": 12,
    "email": "area3@canalco.com",
    "nombre": "Director Comercial",
    "rol_id": 8,
    "nombre_rol": "Director Comercial",
    "default_module": "dashboard"
  }
}
```

---

### 9. Login como Director Financiero y Administrativo

**Descripción:** Director del área financiera y administrativa.

**Curl:**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "area4@canalco.com",
    "password": "PasswordActual123"
  }'
```

**Respuesta Esperada (HTTP 200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "user_id": 13,
    "email": "area4@canalco.com",
    "nombre": "Director Financiero y Administrativo",
    "rol_id": 9,
    "nombre_rol": "Director Financiero y Administrativo",
    "default_module": "dashboard"
  }
}
```

---

### 10. Login como Director PMO

**Descripción:** Director de la oficina de gestión de proyectos.

**Curl:**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "area5@canalco.com",
    "password": "PasswordActual123"
  }'
```

**Respuesta Esperada (HTTP 200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "user_id": 14,
    "email": "area5@canalco.com",
    "nombre": "Director PMO",
    "rol_id": 10,
    "nombre_rol": "Director PMO",
    "default_module": "dashboard"
  }
}
```

---

### 11. Login como Usuario PQRS - El Cerrito

**Descripción:** Usuario de PQRS para el municipio de El Cerrito.

**Curl:**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pqrs.elcerrito@canalco.com",
    "password": "PasswordActual123"
  }'
```

**Respuesta Esperada (HTTP 200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "user_id": 15,
    "email": "pqrs.elcerrito@canalco.com",
    "nombre": "Usuario PQRS El Cerrito",
    "rol_id": 16,
    "nombre_rol": "PQRS El Cerrito",
    "default_module": null
  }
}
```

**Notas:**
- Rol: PQRS Municipios (nivel 5)
- Módulo por defecto: null (sin módulo predeterminado)

---

### 12. Login como Usuario PQRS - Guacarí

**Descripción:** Usuario de PQRS para el municipio de Guacarí.

**Curl:**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pqrs.guacari@canalco.com",
    "password": "PasswordActual123"
  }'
```

**Respuesta Esperada (HTTP 200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "user_id": 16,
    "email": "pqrs.guacari@canalco.com",
    "nombre": "Usuario PQRS Guacarí",
    "rol_id": 17,
    "nombre_rol": "PQRS Guacarí",
    "default_module": null
  }
}
```

---

### 13. Login como Usuario de Compras

**Descripción:** Usuario con permisos para gestión de compras.

**Curl:**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "compras@canalco.com",
    "password": "PasswordActual123"
  }'
```

**Respuesta Esperada (HTTP 200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "user_id": 2,
    "email": "compras@canalco.com",
    "nombre": "Usuario de Compras",
    "rol_id": 3,
    "nombre_rol": "Compras",
    "default_module": "requisiciones"
  }
}
```

**Notas:**
- Rol: Compras
- Módulo por defecto: requisiciones
- Gestiona requisiciones y órdenes de compra

---

## Casos de Uso de Error

### 14. Email con Dominio No Permitido

**Descripción:** Intento de login con email de dominio externo (no autorizado).

**Curl:**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@gmail.com",
    "password": "PasswordActual123"
  }'
```

**Respuesta Esperada (HTTP 400):**
```json
{
  "detail": "El correo debe pertenecer a uno de los dominios permitidos: @canalco.com"
}
```

**Notas:**
- Error de validación de dominio corporativo
- Solo se permiten emails con dominio @canalco.com

---

### 15. Credenciales Inválidas

**Descripción:** Intento de login con contraseña incorrecta.

**Curl:**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@canalco.com",
    "password": "contraseña_incorrecta"
  }'
```

**Respuesta Esperada (HTTP 401):**
```json
{
  "detail": "Credenciales inválidas"
}
```

**Notas:**
- Error de autenticación
- La contraseña no coincide con el hash almacenado en bcrypt

---

### 16. Email con Formato Inválido

**Descripción:** Intento de login con formato de email incorrecto.

**Curl:**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "no-es-un-email",
    "password": "PasswordActual123"
  }'
```

**Respuesta Esperada (HTTP 422):**
```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "input": "no-es-un-email"
    }
  ]
}
```

**Notas:**
- Error de validación de Pydantic
- El email debe tener formato válido (EmailStr)

---

### 17. Campos Requeridos Faltantes

**Descripción:** Intento de login sin proporcionar contraseña.

**Curl:**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@canalco.com"
  }'
```

**Respuesta Esperada (HTTP 422):**
```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "password"],
      "msg": "Field required",
      "input": {
        "email": "admin@canalco.com"
      }
    }
  ]
}
```

**Notas:**
- Error de validación
- Ambos campos (email y password) son requeridos

---

### 18. Email Case Insensitive

**Descripción:** Verificación de que el email se maneja sin distinción de mayúsculas/minúsculas.

**Curl:**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ADMIN@CANALCO.COM",
    "password": "PasswordActual123"
  }'
```

**Respuesta Esperada (HTTP 200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "user_id": 1,
    "email": "admin@canalco.com",
    "nombre": "Administrador del Sistema",
    "rol_id": 1,
    "nombre_rol": "Administrador",
    "default_module": "dashboard"
  }
}
```

**Notas:**
- El email se convierte a minúsculas automáticamente
- Login exitoso independientemente del case del email

---

### 19. Usuario No Existente

**Descripción:** Intento de login con email que no existe en la base de datos.

**Curl:**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "noexiste@canalco.com",
    "password": "PasswordActual123"
  }'
```

**Respuesta Esperada (HTTP 401):**
```json
{
  "detail": "Credenciales inválidas"
}
```

**Notas:**
- Mismo mensaje que credenciales incorrectas por seguridad
- No se revela si el usuario existe o no

---

## Uso del Token JWT

Una vez obtenido el `access_token`, debe incluirse en las siguientes peticiones:

```bash
curl -X GET http://localhost:8000/api/modules \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Configuración del Token:**
- **Algoritmo:** HS256
- **Expiración:** 60 minutos
- **Header:** `Authorization: Bearer <token>`

---

## Información Técnica

### Password Hashing
- **Algoritmo:** bcrypt
- **Salt Rounds:** 12
- **Formato:** `$2b$12$...`

### Roles Disponibles
1. Administrador (dashboard)
2. Gerente (requisiciones)
3. Compras (requisiciones)
4. Almacen (inventarios)
5. PMO (dashboard)
6. Analista (reportes)
7. Director TICs (dashboard)
8. Director Jurídico (dashboard)
9. Director Comercial (dashboard)
10. Director Financiero y Administrativo (dashboard)
11. Director PMO (dashboard)
12-15. Directores de Proyecto (dashboard)
16-21. PQRS Municipios (null)

### Módulos del Sistema
- **dashboard** - Panel de control general
- **requisiciones** - Gestión de requisiciones
- **inventarios** - Control de inventario
- **reportes** - Informes y análisis
- **compras** - Gestión de compras
- **usuarios** - Administración de usuarios
- **proveedores** - Gestión de proveedores
- **auditorias** - Registro de auditoría
- **notificaciones** - Sistema de notificaciones

---

## Notas Importantes

1. **Contraseñas:** Las contraseñas en este documento son placeholders. Las contraseñas reales están hasheadas en la base de datos.

2. **Tokens JWT:** Los tokens mostrados son ejemplos. Los tokens reales serán diferentes y únicos para cada sesión.

3. **Puerto:** El backend corre por defecto en el puerto 8000. Ajustar según configuración.

4. **CORS:** El backend está configurado para permitir requests desde `http://localhost:5173` y `http://localhost:3000`.

5. **Seguridad:** En producción, cambiar el `SECRET_KEY` desde el valor por defecto `change-me`.
