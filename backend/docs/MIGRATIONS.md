# Guía de Migraciones con Alembic

Esta guía explica cómo gestionar las migraciones de base de datos en el proyecto Canalco usando Alembic.

## Tabla de Contenidos

- [¿Qué es Alembic?](#qué-es-alembic)
- [Estructura de Archivos](#estructura-de-archivos)
- [Comandos Básicos](#comandos-básicos)
- [Flujo de Trabajo](#flujo-de-trabajo)
- [Casos de Uso Comunes](#casos-de-uso-comunes)
- [Buenas Prácticas](#buenas-prácticas)
- [Solución de Problemas](#solución-de-problemas)

---

## ¿Qué es Alembic?

Alembic es una herramienta de migración de bases de datos para SQLAlchemy. Permite:

- **Versionamiento de esquema**: Cada cambio en la base de datos se registra como una migración versionada
- **Rollback**: Puedes revertir cambios si algo sale mal
- **Auto-generación**: Detecta cambios en tus modelos SQLAlchemy y genera migraciones automáticamente
- **Control de historial**: Mantiene un registro de qué migraciones se han aplicado

---

## Estructura de Archivos

```
backend/
├── alembic/
│   ├── versions/           # Archivos de migración
│   │   └── 7b72e8658d11_initial_auth_schema.py
│   ├── env.py             # Configuración de Alembic
│   ├── script.py.mako     # Template para nuevas migraciones
│   └── README
├── alembic.ini            # Archivo de configuración principal
└── app/
    └── models/            # Tus modelos SQLAlchemy
```

---

## Comandos Básicos

Todos los comandos deben ejecutarse desde el directorio `backend/`:

```bash
cd backend/
```

### Ver el Estado Actual

```bash
# Ver la migración actual aplicada
alembic current

# Ver el historial de migraciones
alembic history --verbose

# Ver migraciones pendientes
alembic heads
```

### Aplicar Migraciones

```bash
# Aplicar todas las migraciones pendientes (actualizar a la última versión)
alembic upgrade head

# Aplicar una migración específica
alembic upgrade <revision_id>

# Aplicar las siguientes N migraciones
alembic upgrade +2
```

### Revertir Migraciones

```bash
# Revertir la última migración
alembic downgrade -1

# Revertir a una revisión específica
alembic downgrade <revision_id>

# Revertir TODAS las migraciones (cuidado!)
alembic downgrade base
```

### Crear Nuevas Migraciones

```bash
# Auto-generar migración detectando cambios en modelos
alembic revision --autogenerate -m "descripción del cambio"

# Crear migración vacía (para llenado manual)
alembic revision -m "descripción del cambio"
```

---

## Flujo de Trabajo

### 1. Iniciar con Base de Datos Limpia

```bash
# Desde el directorio raíz del proyecto
docker-compose up -d postgres

# Esperar a que PostgreSQL esté listo
docker-compose logs -f postgres

# Aplicar migraciones
cd backend/
alembic upgrade head
```

### 2. Hacer Cambios en los Modelos

Ejemplo: Agregar un campo a un modelo existente

```python
# backend/app/models/auth/user.py
class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "auth"}

    # ... campos existentes ...

    # Nuevo campo
    telefono: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
```

### 3. Generar Migración Automáticamente

```bash
cd backend/
alembic revision --autogenerate -m "add telefono field to users"
```

Esto creará un archivo en `alembic/versions/` como:

```
alembic/versions/abc123def456_add_telefono_field_to_users.py
```

### 4. Revisar la Migración Generada

**IMPORTANTE**: Siempre revisa el archivo generado antes de aplicarlo.

```python
# alembic/versions/abc123def456_add_telefono_field_to_users.py
def upgrade() -> None:
    op.add_column('users',
        sa.Column('telefono', sa.String(length=20), nullable=True),
        schema='auth'
    )

def downgrade() -> None:
    op.drop_column('users', 'telefono', schema='auth')
```

### 5. Aplicar la Migración

```bash
# Aplicar la nueva migración
alembic upgrade head

# Verificar que se aplicó correctamente
alembic current
```

### 6. Si Algo Sale Mal, Revertir

```bash
# Revertir la última migración
alembic downgrade -1
```

---

## Casos de Uso Comunes

### Caso 1: Agregar una Nueva Tabla

**1. Crear el modelo:**

```python
# backend/app/models/nuevaentidad.py
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class NuevaEntidad(Base):
    __tablename__ = "nueva_entidad"
    __table_args__ = {"schema": "auth"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
```

**2. Importar en `alembic/env.py`:**

```python
# Agregar al inicio de alembic/env.py
from app.models.nuevaentidad import NuevaEntidad
```

**3. Generar y aplicar migración:**

```bash
alembic revision --autogenerate -m "add nueva_entidad table"
alembic upgrade head
```

### Caso 2: Agregar un Índice

```bash
# Crear migración vacía
alembic revision -m "add index to users email"
```

Editar el archivo generado:

```python
def upgrade() -> None:
    op.create_index(
        'idx_users_email_search',
        'users',
        ['email'],
        schema='auth'
    )

def downgrade() -> None:
    op.drop_index('idx_users_email_search', 'users', schema='auth')
```

Aplicar:

```bash
alembic upgrade head
```

### Caso 3: Modificar Datos Durante Migración

Ejemplo: Actualizar valores por defecto

```python
def upgrade() -> None:
    # Primero agregar la columna como nullable
    op.add_column('users',
        sa.Column('status', sa.String(20), nullable=True),
        schema='auth'
    )

    # Actualizar valores existentes
    op.execute("""
        UPDATE auth.users
        SET status = 'active'
        WHERE status IS NULL
    """)

    # Hacer la columna NOT NULL
    op.alter_column('users', 'status',
        nullable=False,
        schema='auth'
    )

def downgrade() -> None:
    op.drop_column('users', 'status', schema='auth')
```

### Caso 4: Crear una Función de PostgreSQL

```python
def upgrade() -> None:
    op.execute("""
    CREATE OR REPLACE FUNCTION auth.validate_email()
    RETURNS TRIGGER AS $$
    BEGIN
        IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$' THEN
            RAISE EXCEPTION 'Email inválido: %', NEW.email;
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """)

    op.execute("""
    CREATE TRIGGER validate_email_trigger
        BEFORE INSERT OR UPDATE ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION auth.validate_email();
    """)

def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS validate_email_trigger ON auth.users")
    op.execute("DROP FUNCTION IF EXISTS auth.validate_email()")
```

---

## Buenas Prácticas

### 1. Siempre Revisar Migraciones Auto-generadas

Alembic no siempre detecta todos los cambios correctamente. Revisa:

- Cambios en constraints
- Cambios en índices
- Renombramientos (Alembic los ve como drop + add)
- Cambios en tipos de datos

### 2. Probar Migraciones Localmente Primero

```bash
# Aplicar migración
alembic upgrade head

# Probar rollback
alembic downgrade -1

# Volver a aplicar
alembic upgrade head
```

### 3. Migraciones Pequeñas y Frecuentes

Es mejor tener muchas migraciones pequeñas que una migración gigante.

### 4. Nombres Descriptivos

```bash
# ✅ Bueno
alembic revision -m "add index to users email for faster lookups"

# ❌ Malo
alembic revision -m "changes"
```

### 5. No Modificar Migraciones Ya Aplicadas

Una vez que una migración se ha aplicado en producción, **NUNCA** la modifiques. Crea una nueva migración para corregir.

### 6. Backup Antes de Migraciones en Producción

```bash
# Backup de PostgreSQL
pg_dump -U canalco -h localhost canalco > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 7. Usar Transacciones

Alembic usa transacciones por defecto. Para operaciones que no soportan transacciones:

```python
def upgrade() -> None:
    # Para operaciones que requieren ser fuera de transacciones
    connection = op.get_bind()
    connection.execute(text("COMMIT"))  # Commit transacción actual
    connection.execute(text("CREATE INDEX CONCURRENTLY idx_name ON table(column)"))
```

---

## Solución de Problemas

### Error: "Can't locate revision identified by '...'"

**Causa**: El historial de migraciones en tu código no coincide con lo que está en la base de datos.

**Solución**:

```bash
# Ver qué migración está aplicada en la BD
alembic current

# Ver qué migraciones existen en el código
alembic history

# Si necesitas forzar la versión (CUIDADO)
alembic stamp head
```

### Error: "Target database is not up to date"

**Causa**: Hay migraciones pendientes.

**Solución**:

```bash
alembic upgrade head
```

### Error: Migración falla a la mitad

**Solución**: Revertir y arreglar

```bash
# Ver el estado actual
alembic current

# Si la migración falló parcialmente, la BD podría estar en mal estado
# Opción 1: Arreglar manualmente con SQL
psql -U canalco -d canalco < fix.sql

# Opción 2: Restaurar desde backup
psql -U canalco -d canalco < backup.sql

# Luego marcar la versión correcta
alembic stamp <revision_antes_del_error>
```

### Alembic No Detecta Cambios en Modelos

**Causas comunes**:

1. El modelo no está importado en `alembic/env.py`
2. El modelo no hereda de `Base`
3. El modelo no tiene `__tablename__` o `__table_args__`

**Solución**:

```python
# En alembic/env.py, asegúrate de importar TODOS los modelos
from app.models.auth.user import User
from app.models.auth.role import Role
# ... etc
```

### Conflictos de Merge en Migraciones

**Causa**: Múltiples developers crearon migraciones al mismo tiempo.

**Solución**: Crear una migración de "merge"

```bash
alembic merge -m "merge heads" <rev1> <rev2>
```

---

## Comandos de Docker

### Ejecutar Migraciones en Contenedor Docker

```bash
# El docker-compose ya ejecuta migraciones automáticamente
docker-compose up -d

# Para ejecutar manualmente
docker-compose exec backend alembic upgrade head

# Ver estado de migraciones
docker-compose exec backend alembic current

# Revertir última migración
docker-compose exec backend alembic downgrade -1
```

---

## Variables de Entorno

Alembic usa las mismas variables de entorno que la aplicación:

```bash
# .env (no commitear)
CANALCO_DATABASE_URL=postgresql+psycopg://canalco:canalco@localhost:5432/canalco
```

En Docker, estas variables se configuran en `docker-compose.yml`.

---

## Recursos Adicionales

- [Documentación Oficial de Alembic](https://alembic.sqlalchemy.org/)
- [Tutorial de Alembic](https://alembic.sqlalchemy.org/en/latest/tutorial.html)
- [SQLAlchemy 2.0 Documentation](https://docs.sqlalchemy.org/en/20/)

---

## Resumen de Comandos Más Usados

```bash
# Ver estado
alembic current
alembic history

# Crear migración
alembic revision --autogenerate -m "descripción"

# Aplicar migraciones
alembic upgrade head

# Revertir
alembic downgrade -1

# En Docker
docker-compose exec backend alembic upgrade head
```
