# Stack Tecnológico - Canalco

## Resumen Ejecutivo

Stack moderno cloud-native diseñado para escalabilidad, seguridad y mantenibilidad.

---

## Backend

### Framework Principal
**Opciones en evaluación**:

#### Opción A: FastAPI (Recomendado)
```
Pros:
+ Alto rendimiento (async/await nativo)
+ Documentación automática (OpenAPI/Swagger)
+ Validación automática (Pydantic)
+ Type hints nativos
+ Comunidad activa y creciente
+ Ideal para APIs RESTful

Contras:
- Menos "batteries included" que Django
- Requiere más configuración inicial
```

#### Opción B: Django + Django REST Framework
```
Pros:
+ Framework completo con admin panel
+ ORM potente incluido
+ Autenticación robusta out-of-the-box
+ Gran ecosistema de paquetes
+ Más maduro y establecido

Contras:
- Mayor overhead
- Menos rendimiento en async
- Curva de aprendizaje más empinada
```

**Decisión pendiente**: Por definir según experiencia del equipo

### Lenguaje
- **Python 3.11+**
  - Type hints obligatorios
  - Async/await para operaciones I/O
  - Dataclasses para modelos
  - Pattern matching (Python 3.10+)

### ORM/Database
- **SQLAlchemy 2.0+** (con FastAPI) o **Django ORM** (con Django)
  - Async support
  - Migrations automáticas
  - Query optimization
  - Connection pooling

### Autenticación/Autorización
- **JWT** (JSON Web Tokens)
  - `python-jose` para manejo de tokens
  - `passlib` + `bcrypt` para hashing de passwords
- **OAuth2** con Password Flow
- **RBAC** (Role-Based Access Control)

### Validación
- **Pydantic** (con FastAPI) o **Django Forms/Serializers** (con Django)
  - Validación de requests
  - Serialización de responses
  - Type safety

### Background Tasks
- **Celery** + **Redis**
  - Procesamiento asíncrono
  - Envío de emails
  - Generación de reportes
  - Limpieza de datos
  - Scheduled tasks (Celery Beat)

### Testing
- **pytest**
  - Tests unitarios
  - Tests de integración
  - Fixtures reutilizables
  - Coverage reports
- **pytest-asyncio** (async tests)
- **factory-boy** (test data generation)
- **Faker** (datos fake para testing)

### Dependencias Principales
```python
# requirements.txt (ejemplo con FastAPI)
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
asyncpg==0.29.0              # PostgreSQL async driver
pydantic==2.5.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
celery==5.3.4
redis==5.0.1
boto3==1.29.7                # AWS SDK
jinja2==3.1.2                # Templates
reportlab==4.0.7             # PDF generation
openpyxl==3.1.2              # Excel
python-dotenv==1.0.0
alembic==1.12.1              # Migrations
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.1                # HTTP client for testing
```

---

## Frontend

### Framework
- **React 18+**
  - Hooks-based components
  - Functional components
  - TypeScript obligatorio
  - Strict mode habilitado

### Lenguaje
- **TypeScript 5.0+**
  - Strict mode
  - Type safety completo
  - Interfaces para API responses

### UI Framework
**Opciones en evaluación**:

#### Opción A: Material-UI (MUI)
```
Pros:
+ Componentes empresariales robustos
+ Theming potente
+ Amplia documentación
+ Gran ecosistema
+ Accesibilidad incluida

Contras:
- Bundle size mayor
- Personalización puede ser compleja
```

#### Opción B: Ant Design
```
Pros:
+ Diseñado para aplicaciones empresariales
+ Componentes complejos (tables, forms)
+ Excelente para dashboards
+ i18n incluido

Contras:
- Estilo más opinionado
- Menor flexibilidad de diseño
```

**Decisión pendiente**: MUI recomendado por flexibilidad

### State Management
- **React Context API** (para estado global simple)
- **TanStack Query (React Query)** (para estado del servidor)
  - Caché automático
  - Refetch inteligente
  - Optimistic updates
  - Mutations

### Routing
- **React Router v6**
  - Nested routes
  - Protected routes
  - Lazy loading

### Forms
- **React Hook Form**
  - Performance optimizado
  - Validación integrada
  - Type-safe
- **Yup** o **Zod** (schemas de validación)

### HTTP Client
- **Axios**
  - Interceptores para auth
  - Error handling centralizado
  - Request/response transformation

### Data Visualization
- **Recharts** (gráficas)
  - Composable
  - Responsive
  - Fácil integración con React
- **React Table (TanStack Table)** (tablas complejas)
  - Sorting, filtering, pagination
  - Virtualization para grandes datasets

### File Upload
- **React Dropzone**
  - Drag & drop
  - Validación de archivos
  - Preview de imágenes

### PDF Generation (Client-side)
- **jsPDF** + **html2canvas**
  - Generación de PDFs en cliente
  - Export de reportes

### Date Handling
- **date-fns** o **Day.js**
  - Manipulación de fechas
  - Formateo
  - i18n

### Notifications
- **React Toastify**
  - Alertas y notificaciones
  - Customizable
  - Auto-dismiss

### Dependencias Principales
```json
// package.json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "typescript": "^5.0.0",
    "@mui/material": "^5.14.18",
    "@mui/icons-material": "^5.14.18",
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "react-hook-form": "^7.48.2",
    "yup": "^1.3.3",
    "axios": "^1.6.2",
    "@tanstack/react-query": "^5.8.4",
    "recharts": "^2.10.0",
    "@tanstack/react-table": "^8.10.7",
    "react-dropzone": "^14.2.3",
    "date-fns": "^2.30.0",
    "react-toastify": "^9.1.3",
    "jspdf": "^2.5.1",
    "html2canvas": "^1.4.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "eslint": "^8.54.0",
    "prettier": "^3.1.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5"
  }
}
```

### Build Tool
- **Vite**
  - Hot Module Replacement (HMR) rápido
  - Build optimizado
  - Plugin ecosystem

---

## Base de Datos

### Motor
- **PostgreSQL 15+**
  - ACID compliant
  - JSONB para datos flexibles
  - Full-text search
  - Array types
  - Partitioning
  - Replication

### Hosting
- **AWS RDS PostgreSQL**
  - Multi-AZ deployment
  - Automated backups
  - Point-in-time recovery
  - Performance Insights
  - Connection pooling

### Migrations
- **Alembic** (con SQLAlchemy) o **Django Migrations**
  - Version control de esquema
  - Auto-generation de migrations
  - Rollback support

### Connection Pooling
- **PgBouncer** (opcional, para alto tráfico)
  - Reduce connections overhead
  - Session pooling

---

## Infraestructura AWS

### Compute
- **EC2** (Backend)
  - Auto Scaling Groups
  - Application Load Balancer
  - Amazon Linux 2023 AMI
  - Instance type: t3.medium (inicial)

### Storage
- **S3** (Files)
  - Standard tier para archivos activos
  - Glacier para archivos antiguos
  - Versioning habilitado
  - Lifecycle policies
- **EBS** (EC2 volumes)
  - gp3 (General Purpose SSD)

### Database
- **RDS PostgreSQL**
  - Multi-AZ
  - db.t3.medium (inicial)
  - Storage: gp3, 100GB (auto-scaling)

### CDN
- **CloudFront**
  - Global edge locations
  - SSL/TLS termination
  - Cache optimization

### Serverless
- **Lambda**
  - Python 3.11 runtime
  - Background jobs
  - Scheduled tasks

### Messaging
- **SQS** (Queue)
  - Desacoplar servicios
  - Procesos asíncronos
- **SNS** (Notifications)
  - Pub/sub pattern
  - Alertas de sistema

### Email
- **SES** (Simple Email Service)
  - Transactional emails
  - Templates
  - Bounce handling
- **Alternativa**: Outlook SMTP (Microsoft 365)

### Monitoring
- **CloudWatch**
  - Logs aggregation
  - Metrics
  - Alarms
  - Dashboards

### Security
- **Secrets Manager**
  - Credenciales de BD
  - API keys
  - Rotation automática
- **IAM**
  - Roles y policies
  - Least privilege principle
- **WAF** (opcional)
  - Protección contra ataques
- **Certificate Manager**
  - SSL/TLS certificates

### Networking
- **VPC**
  - Subnets públicas y privadas
  - NAT Gateways
  - Security Groups
  - Network ACLs

---

## DevOps & CI/CD

### Version Control
- **Git**
- **GitHub** (o GitLab/Bitbucket)
  - Branch protection rules
  - Pull request reviews
  - Issue tracking

### CI/CD
- **GitHub Actions** (recomendado)
  ```yaml
  # Ejemplo workflow
  - Test (pytest, eslint, type checking)
  - Build (Docker images)
  - Deploy (to AWS)
  ```
- **Alternativas**: GitLab CI, AWS CodePipeline

### Containerization
- **Docker**
  - Multi-stage builds
  - Optimized images
- **Docker Compose** (desarrollo local)

### Container Registry
- **Amazon ECR** (Elastic Container Registry)
  - Private repository
  - Image scanning

### Infrastructure as Code
- **Terraform** (recomendado)
  - Declarative infrastructure
  - State management
  - Reusable modules
- **Alternativa**: AWS CloudFormation

### Configuration Management
- **Ansible** (opcional)
  - Server provisioning
  - Application deployment

---

## Seguridad

### Autenticación
- JWT tokens (access + refresh)
- HTTPS obligatorio
- Password hashing (bcrypt)
- MFA (futuro)

### Autorización
- RBAC (Role-Based Access Control)
- Permisos granulares
- Row-level security (RLS) en BD

### Encryption
- **At rest**: AES-256 (RDS, S3, EBS)
- **In transit**: TLS 1.3
- Secrets en AWS Secrets Manager

### API Security
- Rate limiting
- CORS configurado
- Input validation
- SQL injection prevention (ORM)
- XSS prevention
- CSRF tokens

### Monitoring & Auditing
- Logs centralizados (CloudWatch)
- Audit trail completo en BD
- Security alerts

---

## Desarrollo Local

### Backend
```bash
# Python virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Run development server
uvicorn app.main:app --reload
```

### Frontend
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
```

### Database (Docker)
```bash
docker run --name canalco-postgres \
  -e POSTGRES_DB=canalco \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=localdev123 \
  -p 5432:5432 \
  -d postgres:15
```

### Redis (para Celery)
```bash
docker run --name canalco-redis \
  -p 6379:6379 \
  -d redis:7-alpine
```

---

## Testing

### Backend
```bash
# Run all tests
pytest

# With coverage
pytest --cov=app --cov-report=html

# Specific test file
pytest tests/test_requisitions.py
```

### Frontend
```bash
# Run all tests
npm test

# With coverage
npm run test:coverage

# E2E tests (futuro)
npm run test:e2e
```

---

## Environments

### Development
- Local machines
- Docker containers
- Mocks de servicios AWS

### Staging
- AWS infrastructure (reduced scale)
- Same stack as production
- Testing environment

### Production
- AWS infrastructure (full scale)
- Multi-AZ deployment
- Monitoring completo

---

## Performance

### Backend
- Async I/O (FastAPI)
- Database query optimization
- Connection pooling
- Caching (Redis)
- Pagination en APIs

### Frontend
- Code splitting
- Lazy loading
- Image optimization
- Bundle size monitoring
- CDN para assets estáticos

### Database
- Proper indexing
- Query optimization
- Partitioning (para tablas grandes)
- Read replicas (futuro)

---

## Accessibility (a11y)

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance (WCAG AA)

---

## Internationalization (i18n)

- **Fase 1**: Solo español
- **Futuro**: Soporte multi-idioma
  - react-i18next (frontend)
  - Flask-Babel o similar (backend)

---

## Próximos Pasos

1. ✅ Documentar stack tecnológico
2. ⏳ Decidir FastAPI vs Django
3. ⏳ Decidir MUI vs Ant Design
4. ⏳ Crear proyecto base (boilerplate)
5. ⏳ Configurar ambiente de desarrollo
6. ⏳ Setup CI/CD pipeline
7. ⏳ Crear infraestructura base en AWS (Terraform)
