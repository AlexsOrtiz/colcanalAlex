# Canalco - Sistema de Gestión Empresarial

## Descripción General

Plataforma web modular para la gestión empresarial, diseñada para aproximadamente 20 usuarios con distintos roles. Sistema escalable con capacidad para hasta 10 módulos distintos.

## Características Técnicas

### Tipo de Aplicación
- **Arquitectura**: Web App (Frontend + Backend)
- **Acceso**: Navegador web (multi-plataforma)
- **Usuarios**: ~20 personas con roles diferenciados
- **Despliegue**: AWS Cloud Infrastructure

### Stack Tecnológico

#### Backend
- **Framework**: FastAPI o Django (por definir)
- **Lenguaje**: Python 3.x
- **API**: RESTful

#### Frontend
- **Framework**: React
- **Diseño**: Interfaz moderna y profesional basada en formato físico de requisición actual

#### Base de Datos
- **Motor**: PostgreSQL
- **Gestión**: AWS RDS

### Infraestructura AWS

| Servicio | Uso Principal |
|----------|---------------|
| **AWS EC2** | Servidor para backend (FastAPI/Django) |
| **AWS S3** | Almacenamiento de archivos (cotizaciones, facturas, adjuntos) |
| **AWS RDS (PostgreSQL)** | Base de datos relacional y segura |
| **AWS SES** | Envío automatizado de correos corporativos (o integración con Outlook SMTP) |
| **AWS Lambda** (opcional) | Procesos en background (notificaciones, auditoría, limpieza de datos) |
| **AWS CloudWatch** | Monitoreo y registros de sistema (logs de auditoría y uso) |

## Módulos Planificados

1. **Dashboard** - Panel principal de control
2. **Requisiciones** - Gestión de solicitudes de compra
3. **Cotizaciones** - Manejo de cotizaciones de proveedores
4. **Órdenes de Compra** - Creación y seguimiento de OC
5. **Inventarios** - Control de stock y productos
6. **Reportes** - Generación de reportes y análisis
7. **Usuarios** - Gestión de usuarios y roles
8. **Proveedores** - Catálogo y gestión de proveedores
9. **Auditorías** - Registro completo de acciones
10. **Notificaciones** - Sistema de alertas y notificaciones

## Características de Seguridad y Auditoría

### Sistema de Auditoría
Toda acción queda registrada en base de datos:
- Usuario que ejecuta la acción
- Acción realizada
- Fecha y hora
- Módulo afectado
- Datos modificados (antes/después)

### Notificaciones
- Correos automáticos vía Outlook (Microsoft 365 SMTP) o AWS SES
- Alertas en tiempo real dentro de la aplicación
- Notificaciones de cambios de estado
- Recordatorios automáticos

## Escalabilidad

- **Arquitectura modular**: Permite agregar/modificar módulos independientemente
- **Cloud-native**: Aprovecha servicios AWS para alta disponibilidad
- **Horizontal scaling**: Capacidad de escalar según demanda
- **Separación de concerns**: Backend, Frontend y BD independientes

## Estructura del Proyecto (Monolito)

```
Canalco/
├── backend/                      # Monolito Backend (todo consolidado aquí)
│   ├── alembic/                  # Migraciones con Alembic
│   │   ├── versions/             # Archivos de migración versionados
│   │   └── env.py                # Configuración de Alembic
│   ├── alembic.ini               # Configuración principal de Alembic
│   ├── app/                      # Aplicación FastAPI
│   │   ├── api/                  # Endpoints REST
│   │   ├── models/               # Modelos SQLAlchemy
│   │   ├── services/             # Lógica de negocio
│   │   ├── core/                 # Configuración central
│   │   ├── utils/                # Utilidades
│   │   └── middleware/           # Middleware personalizado
│   ├── docs/                     # Documentación del backend
│   │   ├── MIGRATIONS.md         # Guía de migraciones
│   │   └── SEEDS.md              # Guía de semillas
│   ├── scripts/                  # Scripts de utilidad
│   │   └── seed_data.py          # Script de semillas en Python
│   ├── seeds/                    # Datos iniciales (seeds)
│   │   ├── development/          # Seeds para desarrollo
│   │   └── production/           # Seeds para producción
│   ├── Dockerfile                # Imagen Docker del backend
│   ├── requirements.txt          # Dependencias Python
│   └── .env.example              # Variables de entorno de ejemplo
├── frontend/                     # Aplicación React
│   └── src/
│       ├── components/           # Componentes reutilizables
│       ├── pages/                # Páginas/vistas
│       ├── services/             # Servicios API
│       ├── utils/                # Utilidades frontend
│       └── assets/               # Recursos estáticos
├── docs/                         # Documentación general
│   ├── architecture/             # Arquitectura del sistema
│   ├── api/                      # Documentación API
│   └── PROJECT_ROADMAP.md        # Hoja de ruta del proyecto
├── docker-compose.yml            # Orquestación de servicios
├── .gitignore                    # Archivos ignorados por Git
└── README.md                     # Este archivo

```

## Estado Actual

**Fase**: Planificación y diseño de arquitectura
**Próximos pasos**: Definir modelos de datos y configuración inicial

## Inicio Rápido con Docker (Recomendado)

### Prerequisitos

- Docker y Docker Compose instalados
- Git

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd Canalco
   ```

2. **Configurar variables de entorno** (opcional)
   ```bash
   cp backend/.env.example backend/.env
   # Editar backend/.env si necesitas cambiar configuraciones
   ```

3. **Iniciar servicios con Docker Compose**
   ```bash
   docker-compose up -d
   ```

   Esto iniciará:
   - PostgreSQL (puerto 5432)
   - Backend FastAPI (puerto 8000)
   - Migraciones automáticas con Alembic

4. **Ejecutar semillas de datos**
   ```bash
   docker-compose exec backend python scripts/seed_data.py
   ```

5. **Verificar que funciona**
   ```bash
   # Ver logs
   docker-compose logs -f backend

   # Probar la API
   curl http://localhost:8000/api/health
   ```

6. **Iniciar el frontend** (en otra terminal)
   ```bash
   cd frontend/
   npm install
   npm run dev
   ```

### Usuario Administrador por Defecto

```
Email: admin@canalco.com
Password: admin123
```

**⚠️ IMPORTANTE**: Cambia esta contraseña inmediatamente en producción.

---

## Inicio Manual (Sin Docker)

### Backend

1. **Instalar PostgreSQL** (si no lo tienes)
   ```bash
   # macOS
   brew install postgresql@16

   # Ubuntu/Debian
   sudo apt install postgresql-16
   ```

2. **Crear base de datos**
   ```bash
   createdb canalco
   ```

3. **Instalar dependencias Python**
   ```bash
   cd backend/
   pip install -r requirements.txt
   ```

4. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

5. **Ejecutar migraciones**
   ```bash
   alembic upgrade head
   ```

6. **Ejecutar semillas**
   ```bash
   python scripts/seed_data.py
   ```

7. **Iniciar servidor**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend

1. **Instalar dependencias**
   ```bash
   cd frontend/
   npm install
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env si necesitas cambiar configuraciones
   ```

3. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

   Por defecto abre en `http://localhost:5173`

4. **Login de prueba**
   - Email: `admin@canalco.com`
   - Password: `admin123`

---

## Gestión de Base de Datos

### Migraciones con Alembic

Ver documentación completa: [backend/docs/MIGRATIONS.md](backend/docs/MIGRATIONS.md)

```bash
# Ver estado actual
cd backend/
alembic current

# Aplicar migraciones
alembic upgrade head

# Crear nueva migración
alembic revision --autogenerate -m "descripción del cambio"

# Revertir última migración
alembic downgrade -1
```

### Semillas (Seeds)

Ver documentación completa: [backend/docs/SEEDS.md](backend/docs/SEEDS.md)

```bash
# Ejecutar semillas
cd backend/
python scripts/seed_data.py

# En Docker
docker-compose exec backend python scripts/seed_data.py
```

---

## Comandos Útiles

### Docker Compose

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Detener servicios
docker-compose down

# Reconstruir imágenes
docker-compose build --no-cache

# Limpiar todo (¡cuidado! borra datos)
docker-compose down -v
```

### Base de Datos

```bash
# Conectar a PostgreSQL
docker-compose exec postgres psql -U canalco -d canalco

# Backup
docker-compose exec postgres pg_dump -U canalco canalco > backup.sql

# Restore
docker-compose exec -T postgres psql -U canalco -d canalco < backup.sql
```

---

## Tecnologías Utilizadas

### Backend
- **FastAPI** 0.110+ - Framework web moderno y rápido
- **SQLAlchemy** 2.0+ - ORM Python
- **Alembic** 1.12+ - Migraciones de base de datos
- **Pydantic** 2.0+ - Validación de datos
- **PostgreSQL** 16 - Base de datos relacional
- **psycopg** 3.1+ - Driver PostgreSQL moderno
- **python-jose** - JWT para autenticación
- **passlib** - Hashing de contraseñas (bcrypt)

### Frontend
- **React** 18+ - Biblioteca UI
- **Vite** - Build tool y dev server
- **TypeScript** - Tipado estático
- **Lucide React** - Iconos

### DevOps
- **Docker** - Contenedores
- **Docker Compose** - Orquestación local

## Notas de Desarrollo

- Arquitectura modular para facilitar mantenimiento y escalabilidad
- Prioridad en seguridad y auditoría completa
- Diseño cloud-first aprovechando servicios AWS
- Interfaz basada en formato físico existente para facilitar adopción
