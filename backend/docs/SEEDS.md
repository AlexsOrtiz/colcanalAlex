# Guía de Semillas (Seeds) de Base de Datos

Esta guía explica cómo gestionar los datos iniciales (seeds) en el proyecto Canalco.

## Tabla de Contenidos

- [¿Qué son las Semillas?](#qué-son-las-semillas)
- [Estructura de Archivos](#estructura-de-archivos)
- [Ejecutar Semillas](#ejecutar-semillas)
- [Cómo Funcionan las Semillas](#cómo-funcionan-las-semillas)
- [Datos que se Insertan](#datos-que-se-insertan)
- [Modificar Datos de Semillas](#modificar-datos-de-semillas)
- [Semillas por Ambiente](#semillas-por-ambiente)
- [Buenas Prácticas](#buenas-prácticas)
- [Solución de Problemas](#solución-de-problemas)

---

## ¿Qué son las Semillas?

Las semillas (seeds) son datos iniciales que se insertan en la base de datos para:

- **Configuración inicial**: Roles, permisos, módulos del sistema
- **Usuario administrador**: Cuenta inicial para acceder al sistema
- **Datos de desarrollo**: Datos de prueba para ambiente de desarrollo
- **Datos de referencia**: Catálogos, configuraciones, etc.

---

## Estructura de Archivos

```
backend/
├── scripts/
│   └── seed_data.py          # Script principal de semillas (Python)
└── seeds/
    ├── development/           # Semillas para desarrollo
    │   ├── 001_seed_roles.sql
    │   ├── 002_seed_admin_user.sql
    │   ├── 003_seed_auth_metadata.sql
    │   ├── 004_seed_extra_roles.sql
    │   └── 005_seed_usuarios_reales.sql
    └── production/            # Semillas para producción (mínimas)
```

**Nota**: El script Python (`seed_data.py`) es el método recomendado. Los archivos SQL son de referencia/legacy.

---

## Ejecutar Semillas

### Método Recomendado: Script Python

```bash
# Desde el directorio backend/
cd backend/

# Ejecutar script de semillas
python scripts/seed_data.py

# O usando módulo
python -m scripts.seed_data
```

### Con Docker Compose

```bash
# Iniciar servicios (las migraciones se ejecutan automáticamente)
docker-compose up -d

# Ejecutar semillas
docker-compose exec backend python scripts/seed_data.py
```

### Flujo Completo de Inicialización

```bash
# 1. Iniciar base de datos
docker-compose up -d postgres

# 2. Aplicar migraciones
cd backend/
alembic upgrade head

# 3. Ejecutar semillas
python scripts/seed_data.py

# 4. Iniciar backend
cd ..
docker-compose up -d backend
```

---

## Cómo Funcionan las Semillas

El script `scripts/seed_data.py` es **idempotente**, lo que significa que:

- ✅ Puede ejecutarse múltiples veces sin causar errores
- ✅ Actualiza datos existentes en lugar de crear duplicados
- ✅ Inserta solo datos nuevos que no existan

### Ejemplo de Idempotencia

```python
# El script verifica si el registro ya existe
stmt = select(Role).where(Role.nombre_rol == "Administrador")
existing = session.execute(stmt).scalar_one_or_none()

if existing:
    # Actualiza el registro existente
    existing.descripcion = "Acceso completo al sistema"
else:
    # Crea nuevo registro
    role = Role(nombre_rol="Administrador", ...)
    session.add(role)
```

---

## Datos que se Insertan

### 1. Roles (`seed_roles`)

Se crean 6 roles base:

| Rol | Descripción | Módulo Por Defecto |
|-----|-------------|-------------------|
| Administrador | Acceso completo al sistema | dashboard |
| Gerente | Supervisa requisiciones y reportes | requisiciones |
| Compras | Gestiona requisiciones y órdenes de compra | requisiciones |
| Almacen | Control de inventarios y recepciones | inventarios |
| PMO | Administración y gobierno del sistema | dashboard |
| Analista | Acceso a reportes y analítica | reportes |

### 2. Módulos (`seed_modules`)

Se crean 8 módulos principales:

1. **Dashboard**: Resumen ejecutivo y métricas clave
2. **Compras**: Gestión integral de requisiciones y compras
3. **Inventarios**: Control de existencias y movimientos
4. **Reportes**: Analítica y reportería ejecutiva
5. **Usuarios**: Administración de usuarios y roles
6. **Proveedores**: Gestión de proveedores y homologaciones
7. **Auditorías**: Trazabilidad y cumplimiento normativo
8. **Notificaciones**: Alertas y comunicación automática

### 3. Categorías (`seed_categories`)

Cada módulo tiene sus categorías. Ejemplos:

- **Compras**: requisiciones, cotizaciones, ordenes_compra
- **Inventarios**: existencias, movimientos
- **Reportes**: compras, finanzas, inventarios
- etc.

### 4. Permisos (`seed_permissions`)

Se crean 6 permisos estándar:

| Clave | Nombre | Descripción |
|-------|--------|-------------|
| ver | Ver | Permite visualizar registros |
| crear | Crear | Permite crear nuevos registros |
| editar | Editar | Permite modificar registros existentes |
| aprobar | Aprobar | Permite aprobar o autorizar registros |
| eliminar | Eliminar | Permite eliminar registros |
| exportar | Exportar | Permite exportar información |

### 5. Asignación de Permisos al Administrador (`seed_admin_permissions`)

El rol **Administrador** recibe **TODOS** los permisos para **TODOS** los módulos y categorías automáticamente.

### 6. Usuario Administrador (`seed_admin_user`)

Se crea un usuario administrador con:

- **Email**: `admin@canalco.com`
- **Password**: `admin123` (debe cambiarse en primer login)
- **Nombre**: Administrador del Sistema
- **Cargo**: Administrador
- **Estado**: Activo
- **Must Reset**: `true` (obliga a cambiar contraseña)

---

## Modificar Datos de Semillas

### Agregar un Nuevo Rol

Edita `scripts/seed_data.py`:

```python
def seed_roles(session):
    roles_data = [
        # ... roles existentes ...
        {
            "nombre_rol": "Operador",
            "descripcion": "Acceso operativo limitado",
            "default_module": "inventarios"
        },
    ]
    # ... resto del código
```

Ejecuta:

```bash
python scripts/seed_data.py
```

### Agregar un Nuevo Módulo

```python
def seed_modules(session):
    modules_data = [
        # ... módulos existentes ...
        {
            "clave": "configuracion",
            "nombre": "Configuración",
            "descripcion": "Configuración del sistema",
            "icono": "settings",
            "orden": 9
        },
    ]
    # ... resto del código
```

### Agregar Categorías a un Módulo

```python
def seed_categories(session):
    categories_data = [
        # ... categorías existentes ...
        ("configuracion", "general", "General", "Configuración general", 1),
        ("configuracion", "seguridad", "Seguridad", "Configuración de seguridad", 2),
    ]
    # ... resto del código
```

### Cambiar Contraseña del Admin

Genera un nuevo hash:

```bash
cd backend/
python -c "from app.utils.security import hash_password; print(hash_password('nueva_contraseña'))"
```

Luego edita `seed_data.py`:

```python
def seed_admin_user(session):
    # ...
    admin_user = User(
        email=admin_email,
        password=hash_password("nueva_contraseña"),  # Cambiar aquí
        # ...
    )
```

O simplemente ejecuta el script y luego cambia la contraseña desde la aplicación.

---

## Semillas por Ambiente

### Development (Desarrollo)

Incluye:
- Todos los datos base (roles, módulos, permisos)
- Usuario administrador
- Usuarios de prueba adicionales
- Datos de ejemplo para testing

### Production (Producción)

Debe incluir **SOLO**:
- Datos base mínimos (roles, módulos, permisos)
- Usuario administrador
- **NO** usuarios de prueba
- **NO** datos de ejemplo

### Crear Semillas de Producción

Crea un nuevo archivo `scripts/seed_data_production.py` con solo datos esenciales:

```python
#!/usr/bin/env python3
"""Production seeds - minimal data only."""

def main():
    session = SessionLocal()

    # Solo datos esenciales
    seed_roles(session)
    seed_modules(session)
    seed_categories(session)
    seed_permissions(session)
    seed_admin_permissions(session)
    seed_admin_user(session)  # Solo admin, no usuarios de prueba

    session.close()
```

---

## Buenas Prácticas

### 1. Mantener Semillas Idempotentes

✅ **Bueno**: Verificar antes de insertar

```python
existing = session.execute(
    select(Role).where(Role.nombre_rol == "Administrador")
).scalar_one_or_none()

if not existing:
    session.add(Role(...))
```

❌ **Malo**: Insertar directamente

```python
# Esto fallará si ya existe
session.add(Role(nombre_rol="Administrador", ...))
session.commit()
```

### 2. No Hardcodear Contraseñas en Producción

Para producción, usa variables de entorno:

```python
import os

admin_password = os.getenv("ADMIN_INITIAL_PASSWORD", "admin123")
admin_user = User(
    password=hash_password(admin_password),
    # ...
)
```

### 3. Usar Transacciones

El script ya usa transacciones automáticamente:

```python
try:
    session = SessionLocal()
    seed_roles(session)
    session.commit()  # Solo hace commit si todo funcionó
except Exception as e:
    session.rollback()  # Revierte si hubo error
    raise
```

### 4. Logging Claro

El script imprime mensajes claros:

```
Seeding roles...
  ✓ Created role: Administrador
  ✓ Updated role: Gerente
✓ Roles seeded successfully
```

### 5. Separar Datos por Función

En lugar de un script monolítico, usa funciones separadas:

- `seed_roles()` - Solo roles
- `seed_modules()` - Solo módulos
- `seed_permissions()` - Solo permisos

Esto permite ejecutar partes individuales si es necesario.

---

## Solución de Problemas

### Error: "IntegrityError: duplicate key value violates unique constraint"

**Causa**: Intentaste insertar un registro duplicado.

**Solución**: El script debería ser idempotente. Revisa la lógica de verificación:

```python
# Asegúrate de verificar existencia antes de insertar
stmt = select(Model).where(Model.unique_field == value)
existing = session.execute(stmt).scalar_one_or_none()
if not existing:
    session.add(Model(...))
```

### Error: "relation 'auth.roles' does not exist"

**Causa**: Las migraciones no se han ejecutado.

**Solución**:

```bash
cd backend/
alembic upgrade head
python scripts/seed_data.py
```

### Error: "ModuleNotFoundError: No module named 'app'"

**Causa**: Python no encuentra el módulo `app`.

**Solución**: Ejecuta desde el directorio `backend/`:

```bash
cd backend/
python scripts/seed_data.py
```

O usa import absoluto:

```bash
# Desde cualquier lugar
python -m backend.scripts.seed_data
```

### Las Semillas No Actualizan Datos Existentes

**Causa**: La lógica de actualización no está funcionando.

**Verifica**:

```python
if existing:
    # Debe haber código aquí para actualizar
    existing.descripcion = new_description
    print(f"✓ Updated: {existing.nombre}")
else:
    # Crear nuevo
    session.add(Model(...))
```

### Error: "Foreign key constraint violation"

**Causa**: Intentas insertar datos que dependen de otros datos que no existen.

**Solución**: Respeta el orden de inserción:

1. Roles (sin dependencias)
2. Módulos (sin dependencias)
3. Categorías (depende de módulos)
4. Permisos (sin dependencias)
5. RolePermissions (depende de roles, módulos, categorías, permisos)
6. Users (depende de roles)

El script `seed_data.py` ya respeta este orden.

---

## Ejecutar Solo Parte de las Semillas

Si solo quieres ejecutar ciertas funciones:

```python
# Crear un script personalizado
from scripts.seed_data import seed_roles, seed_modules
from app.core.database import SessionLocal

session = SessionLocal()

# Solo ejecutar estas dos
seed_roles(session)
seed_modules(session)

session.close()
```

O modificar `main()` temporalmente:

```python
def main():
    session = SessionLocal()

    # Comentar las que no quieres ejecutar
    seed_roles(session)
    seed_modules(session)
    # seed_categories(session)  # Comentado
    # seed_permissions(session)  # Comentado

    session.close()
```

---

## Automatización en CI/CD

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
- name: Run migrations and seeds
  run: |
    cd backend/
    alembic upgrade head
    python scripts/seed_data.py
```

### Docker Compose Con Semillas Automáticas

Modifica `docker-compose.yml`:

```yaml
backend:
  # ...
  command: sh -c "alembic upgrade head && python scripts/seed_data.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"
```

---

## Resumen de Comandos

```bash
# Ejecutar semillas localmente
cd backend/
python scripts/seed_data.py

# Ejecutar semillas en Docker
docker-compose exec backend python scripts/seed_data.py

# Flujo completo desde cero
docker-compose up -d postgres
cd backend/
alembic upgrade head
python scripts/seed_data.py
cd ..
docker-compose up -d backend

# Verificar que funcionó
docker-compose exec postgres psql -U canalco -d canalco -c "SELECT * FROM auth.roles;"
```

---

## Usuario Administrador Por Defecto

**⚠️ IMPORTANTE PARA PRODUCCIÓN**

El usuario administrador creado por las semillas es:

```
Email: admin@canalco.com
Password: admin123
```

**DEBES CAMBIAR ESTA CONTRASEÑA INMEDIATAMENTE** después del primer login, especialmente en producción.

El campo `must_reset=True` obliga al usuario a cambiar la contraseña en el primer inicio de sesión.

---

## Archivos SQL Legados

Los archivos en `backend/seeds/development/*.sql` son de referencia únicamente. El script Python (`seed_data.py`) es el método recomendado porque:

✅ Es idempotente
✅ Usa los modelos SQLAlchemy (type-safe)
✅ Más fácil de mantener
✅ Mejor manejo de errores
✅ No hay riesgo de SQL injection

---

## Recursos Adicionales

- [SQLAlchemy ORM Tutorial](https://docs.sqlalchemy.org/en/20/orm/tutorial.html)
- [Documentación de Modelos](../app/models/README.md)
- [Guía de Migraciones](./MIGRATIONS.md)
