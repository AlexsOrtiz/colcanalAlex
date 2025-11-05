# Arquitectura AWS - Canalco

## Visión General

La plataforma Canalco está diseñada para ejecutarse completamente en AWS, aprovechando servicios gestionados para garantizar alta disponibilidad, seguridad y escalabilidad.

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIOS (Navegador)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AWS CloudFront (CDN)                          │
│                    - Distribución estática                       │
│                    - Cache de contenido                          │
└────────────┬────────────────────────────────┬───────────────────┘
             │                                │
             │ Frontend (S3)                  │ Backend (ALB)
             ▼                                ▼
┌──────────────────────┐          ┌────────────────────────────┐
│     AWS S3 Bucket    │          │  Application Load Balancer │
│   - React App Build  │          │    - SSL Termination       │
│   - Assets estáticos │          │    - Routing               │
└──────────────────────┘          └─────────────┬──────────────┘
                                                 │
                                                 ▼
                               ┌──────────────────────────────────┐
                               │      AWS EC2 Auto Scaling        │
                               │    - Backend (FastAPI/Django)    │
                               │    - Multi-AZ deployment         │
                               │    - Health checks               │
                               └────┬─────────────────────┬───────┘
                                    │                     │
                   ┌────────────────┴─────┐      ┌────────▼──────────┐
                   │                      │      │                   │
                   ▼                      ▼      ▼                   │
         ┌──────────────────┐   ┌──────────────────┐               │
         │   AWS RDS        │   │     AWS S3       │               │
         │  PostgreSQL      │   │   File Storage   │               │
         │  - Multi-AZ      │   │  - Cotizaciones  │               │
         │  - Automated     │   │  - Facturas      │               │
         │    Backups       │   │  - Adjuntos      │               │
         │  - Encryption    │   │  - Versioning    │               │
         └──────────────────┘   └──────────────────┘               │
                                                                    │
                               ┌────────────────────────────────────┘
                               │
                               ▼
                     ┌──────────────────────┐
                     │    AWS Lambda        │
                     │  - Notificaciones    │
                     │  - Auditoría async   │
                     │  - Limpieza datos    │
                     │  - Reportes batch    │
                     └──────────┬───────────┘
                                │
                                ▼
                     ┌──────────────────────┐
                     │   Amazon SES         │
                     │  - Email transac.    │
                     │  - Notificaciones    │
                     │  - Alertas           │
                     └──────────────────────┘
                                │
                                ▼
                     ┌──────────────────────┐
                     │  AWS CloudWatch      │
                     │  - Logs              │
                     │  - Metrics           │
                     │  - Alarms            │
                     │  - Dashboards        │
                     └──────────────────────┘
```

## Componentes Detallados

### 1. Frontend Layer

#### AWS S3 + CloudFront
- **Propósito**: Hosting de aplicación React estática
- **Configuración**:
  - S3 Bucket con hosting web habilitado
  - CloudFront distribution para CDN global
  - SSL/TLS con AWS Certificate Manager
  - Compresión Gzip/Brotli automática
  - Cache invalidation para deployments

**Beneficios**:
- Alta disponibilidad (99.99%)
- Baja latencia global
- Costos reducidos
- Auto-scaling integrado

### 2. Backend Layer

#### AWS EC2 con Auto Scaling
- **Propósito**: Ejecutar aplicación Python (FastAPI/Django)
- **Configuración**:
  - Launch Template con AMI personalizada
  - Auto Scaling Group (min: 2, max: 10)
  - Application Load Balancer
  - Health checks cada 30 segundos
  - Multi-AZ deployment (2+ zonas)
  - Security Groups restrictivos

**Instancia recomendada inicial**: t3.medium (2 vCPU, 4 GB RAM)

**Beneficios**:
- Escalamiento automático según carga
- Alta disponibilidad multi-zona
- Balanceo de carga automático
- Recuperación automática ante fallos

### 3. Database Layer

#### AWS RDS PostgreSQL
- **Propósito**: Base de datos principal
- **Configuración**:
  - PostgreSQL 15.x (última versión estable)
  - Multi-AZ deployment para HA
  - Automated backups (retención 7-30 días)
  - Encryption at rest (AES-256)
  - Encryption in transit (SSL/TLS)
  - Performance Insights habilitado
  - Read Replicas (opcional para reportes)

**Instancia recomendada inicial**: db.t3.medium (2 vCPU, 4 GB RAM)

**Beneficios**:
- Backups automáticos
- Failover automático
- Actualizaciones gestionadas
- Monitoreo integrado

### 4. Storage Layer

#### AWS S3 (Archivos)
- **Propósito**: Almacenamiento de documentos y archivos adjuntos
- **Buckets**:
  - `canalco-cotizaciones`: PDFs de cotizaciones
  - `canalco-facturas`: Facturas y comprobantes
  - `canalco-adjuntos`: Archivos adjuntos generales
  - `canalco-backups`: Respaldos de BD

**Configuración**:
- Versioning habilitado
- Lifecycle policies (archivado a Glacier después de 1 año)
- Server-side encryption (SSE-S3)
- Access logs habilitados
- CORS configurado para frontend

**Beneficios**:
- Durabilidad 99.999999999%
- Versionado de archivos
- Costos bajos
- Integración con CloudFront

### 5. Compute Serverless

#### AWS Lambda
- **Propósito**: Procesos asíncronos y background jobs
- **Funciones previstas**:

1. **Notificaciones Email**
   - Trigger: EventBridge schedule / SNS
   - Integración con SES
   - Plantillas dinámicas

2. **Auditoría Asíncrona**
   - Trigger: SQS queue
   - Procesamiento de logs
   - Escritura a RDS/S3

3. **Limpieza de Datos**
   - Trigger: EventBridge cron
   - Eliminación de registros temporales
   - Archivado de datos antiguos

4. **Generación de Reportes**
   - Trigger: SQS/Manual
   - Procesamiento batch
   - Export a PDF/Excel

**Runtime**: Python 3.11+

**Beneficios**:
- Sin gestión de servidores
- Pago por uso
- Auto-scaling automático
- Integración nativa con otros servicios AWS

### 6. Email Service

#### Amazon SES (Simple Email Service)
- **Propósito**: Envío de correos transaccionales
- **Configuración**:
  - Domain verification (dominio corporativo)
  - DKIM configurado
  - SPF records
  - Plantillas de email
  - Supresión de bounces automática

**Tipos de correos**:
- Notificaciones de requisiciones
- Alertas de aprobaciones
- Confirmaciones de órdenes
- Reportes programados
- Alertas del sistema

**Alternativa**: Integración con Outlook SMTP (Microsoft 365)

### 7. Monitoring & Logging

#### AWS CloudWatch
- **Propósito**: Monitoreo, logs y alertas
- **Configuración**:

**Logs**:
- Application logs (EC2/Lambda)
- Access logs (ALB, S3, CloudFront)
- Database logs (RDS)
- Auditoría de acciones de usuarios

**Metrics**:
- CPU, memoria, disco (EC2)
- Conexiones BD (RDS)
- Latencia requests (ALB)
- Errores 4xx/5xx
- Custom metrics (negocio)

**Alarms**:
- CPU > 80% → Scale out
- Errores > threshold → SNS notification
- Espacio disco bajo → Alert admin
- Conexiones BD > 80% → Warning

**Dashboards**:
- Vista general del sistema
- Métricas de negocio
- Estado de servicios
- Costos y uso

## Seguridad

### Network Security

#### VPC (Virtual Private Cloud)
```
VPC: 10.0.0.0/16

Public Subnets (ALB, NAT Gateway):
  - 10.0.1.0/24 (AZ-a)
  - 10.0.2.0/24 (AZ-b)

Private Subnets (EC2 Backend):
  - 10.0.10.0/24 (AZ-a)
  - 10.0.11.0/24 (AZ-b)

Database Subnets (RDS):
  - 10.0.20.0/24 (AZ-a)
  - 10.0.21.0/24 (AZ-b)
```

#### Security Groups

1. **ALB Security Group**
   - Inbound: 443 (HTTPS) from 0.0.0.0/0
   - Outbound: 8000 to Backend SG

2. **Backend Security Group**
   - Inbound: 8000 from ALB SG
   - Outbound: 5432 to RDS SG, 443 to Internet

3. **RDS Security Group**
   - Inbound: 5432 from Backend SG
   - Outbound: None

### Data Security

- **Encryption at rest**: Todos los servicios (S3, RDS, EBS)
- **Encryption in transit**: SSL/TLS obligatorio
- **Secrets Management**: AWS Secrets Manager para credenciales
- **IAM Roles**: Acceso basado en roles, no credenciales hardcoded
- **MFA**: Requerido para usuarios administrativos

### Backup Strategy

- **RDS**: Backups automáticos diarios, retención 30 días
- **S3**: Versioning habilitado, replicación cross-region (opcional)
- **EC2**: Snapshots semanales de volúmenes
- **Lambda**: Code versionado en S3

## Escalabilidad

### Horizontal Scaling

- **Frontend**: Auto-scaling vía CloudFront
- **Backend**: Auto Scaling Group (2-10 instancias)
- **Database**: Read Replicas para lecturas pesadas
- **Lambda**: Auto-scaling nativo (hasta 1000 concurrentes)

### Vertical Scaling

- **EC2**: Cambio de tipo de instancia sin downtime (con ASG)
- **RDS**: Cambio de instancia con ventana de mantenimiento

## Costos Estimados (USD/mes)

| Servicio | Uso | Costo Estimado |
|----------|-----|----------------|
| EC2 (2x t3.medium) | 730 hrs/mes | $60 |
| RDS (db.t3.medium) | Multi-AZ | $120 |
| S3 | 100 GB storage + transfer | $10 |
| CloudFront | 1 TB transfer | $85 |
| SES | 10,000 emails | $1 |
| Lambda | 1M requests | $5 |
| CloudWatch | Logs + metrics | $15 |
| **TOTAL ESTIMADO** | | **~$300/mes** |

*Nota: Costos pueden variar según uso real. Usar AWS Cost Explorer para monitoreo.*

## Deployment Strategy

### CI/CD Pipeline

```
Código → GitHub → GitHub Actions → Build → Deploy
```

**Frontend**:
1. Build React app
2. Upload a S3
3. Invalidate CloudFront cache

**Backend**:
1. Run tests
2. Build Docker image
3. Push to ECR
4. Update EC2 instances (rolling deployment)
5. Run migrations

### Ambientes

- **Development**: Instancias más pequeñas, single-AZ
- **Staging**: Configuración similar a producción
- **Production**: Multi-AZ, full redundancy

## Disaster Recovery

- **RTO** (Recovery Time Objective): < 1 hora
- **RPO** (Recovery Point Objective): < 5 minutos
- **Estrategia**: Multi-AZ deployment + automated backups
- **Plan de contingencia**: Documentado en `/docs/deployment/disaster-recovery.md`

## Próximos Pasos

1. ✅ Documentar arquitectura AWS
2. ⏳ Crear diagrama de red VPC detallado
3. ⏳ Definir políticas IAM específicas
4. ⏳ Diseñar estrategia de CI/CD completa
5. ⏳ Establecer presupuesto y alertas de costos
