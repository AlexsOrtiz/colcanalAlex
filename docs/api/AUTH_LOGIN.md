# Autenticación - Login

## Descripción

Endpoint para validar credenciales de usuarios corporativos y obtener un token JWT con la sesión activa.

## URL

- **POST** `/api/auth/login`

## Headers

| Cabecera        | Valor                  |
|-----------------|------------------------|
| `Content-Type`  | `application/json`     |

## Request

```json
{
  "email": "usuario@canalco.com",
  "password": "contraseña-asignada"
}
```

- El correo debe pertenecer a alguno de los dominios configurados en `CANALCO_CORPORATE_DOMAINS` (por defecto `@canalco.com`).
- La contraseña corresponde al valor fijo asignado por PMO/Administrador (almacenado con hash bcrypt).

## Response `200 OK`

```json
{
  "access_token": "jwt-token",
  "token_type": "bearer",
  "user": {
    "user_id": 1,
    "email": "usuario@canalco.com",
    "nombre": "Nombre del Usuario",
    "rol_id": 3,
    "nombre_rol": "Compras",
    "default_module": "requisiciones"
  }
}
```

- `access_token`: Token JWT con expiración configurable (`CANALCO_JWT_ACCESS_TOKEN_EXPIRE_MINUTES`).
- `default_module`: Módulo inicial al que debe redirigirse al usuario en el frontend.

## Response `400 Bad Request`

```json
{
  "detail": "El correo debe pertenecer a uno de los dominios permitidos: @canalco.com."
}
```

## Response `401 Unauthorized`

```json
{
  "detail": "Credenciales incorrectas o usuario no autorizado."
}
```

## Notas

- El backend registra automáticamente `ultimo_login` al autenticar correctamente.
- Sólo los usuarios con `estado = TRUE` pueden acceder.
- Las contraseñas deben guardarse con hash usando `bcrypt` (ver `backend/app/utils/security.py`).
