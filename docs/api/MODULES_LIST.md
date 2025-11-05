# Módulos - Listado con permisos

## Descripción

Devuelve todos los módulos del sistema, indicando si el usuario autenticado tiene permisos para acceder a cada uno.

## URL

- **GET** `/api/modules`

## Autenticación

- Requiere encabezado `Authorization: Bearer <token JWT>` obtenido en `/api/auth/login`.

## Response `200 OK`

```json
[
  {
    "modulo_id": 1,
    "clave": "dashboard",
    "nombre": "Dashboard",
    "descripcion": "Resumen ejecutivo y métricas clave",
    "icono": "dashboard",
    "has_access": true
  },
  {
    "modulo_id": 2,
    "clave": "compras",
    "nombre": "Compras",
    "descripcion": "Gestión integral de requisiciones y compras",
    "icono": "shopping-cart",
    "has_access": false
  }
]
```

- `has_access`: `true` si el rol del usuario tiene permisos configurados en `auth.roles_permisos_modulo_categoria`.
- Todos los módulos se devuelven sin filtrar para que el frontend pueda mostrarlos y controlar el acceso visualmente.

## Errores Comunes

- `401 Unauthorized`: token faltante, inválido o usuario inactivo.
- `500 Internal Server Error`: fallo inesperado al consultar la base de datos.
