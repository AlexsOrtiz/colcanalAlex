# ANÁLISIS EXHAUSTIVO DEL BACKEND NESTJS - CANALCO ERP

**Fecha de Análisis:** 11 de Noviembre de 2024  
**Versión:** 1.0.0  
**Nivel de Análisis:** Muy Exhaustivo (Very Thorough)

---

## 1. RESUMEN EJECUTIVO

### Descripción General
Canalco ERP es un sistema empresarial especializado en gestión de compras, requisiciones y autorización jerárquica. Implementado con NestJS 11, TypeORM y PostgreSQL. El backend proporciona APIs REST con autenticación JWT y control de roles basado en permisos.

### Índice de Salud General
- **Arquitectura:** 8/10 - Bien estructurada pero con algunas redundancias
- **Seguridad:** 6.5/10 - Buena base pero con vulnerabilidades identificadas
- **Validación:** 8/10 - DTOs bien estructurados con class-validator
- **Base de Datos:** 7.5/10 - Esquema robusto pero con relaciones complejas
- **Documentación API:** 9/10 - Excelente uso de Swagger con ejemplos

---

## 2. ESTRUCTURA GENERAL DEL PROYECTO

### 2.1 Stack Tecnológico
```
Framework:      NestJS 11.0.1
Language:       TypeScript 5.7
Database:       PostgreSQL (via TypeORM 0.3.27)
Authentication: JWT (Passport + JWT)
Security:       Helmet, Bcrypt
Validation:     class-validator, class-transformer
Documentation: Swagger/OpenAPI
Testing:       Jest
```

### 2.2 Organización de Directorios
```
backend-nestjs/
├── src/
│   ├── common/
│   │   ├── decorators/        (5 decoradores)
│   │   ├── filters/           (1 filtro global)
│   │   └── guards/            (3 guards)
│   ├── config/
│   │   └── configuration.ts    (Variables de entorno)
│   ├── database/
│   │   ├── entities/          (26 entidades)
│   │   ├── migrations/        (6 migraciones)
│   │   ├── seeds/             (Seed data)
│   │   ├── database.module.ts
│   │   └── data-source.ts
│   ├── modules/
│   │   ├── auth/              (Autenticación JWT)
│   │   ├── purchases/         (Requisiciones y Compras)
│   │   └── suppliers/         (Gestión de Proveedores)
│   ├── app.module.ts
│   ├── app.controller.ts
│   └── main.ts
├── package.json
├── tsconfig.json
├── .env.example
└── dist/                      (Compilado)
```

### 2.3 Configuración del Proyecto
**package.json:**
- Version: 0.0.1
- Private: true
- Scripts: build, start, start:dev, test, lint, migration:*, seed:run

**tsconfig.json:**
- Target: ES2023
- Module: nodenext
- Strict Mode: Parcialmente habilitado (noImplicitAny: false)
- SourceMap: Habilitado

---

## 3. MÓDULOS Y SERVICIOS

### 3.1 AuthModule (Autenticación)
**Ruta Base:** `/auth`

#### Controlador: AuthController
| Endpoint | Método | Descripción | Roles |
|----------|--------|-------------|-------|
| `/login` | POST | Autenticación con email/password | PUBLIC |
| `/refresh` | POST | Renovar accessToken | PUBLIC |
| `/profile` | GET | Obtener perfil del usuario actual | AUTHENTICATED |

#### Servicio: AuthService
**Métodos:**
- `login(LoginDto)` - Autentica usuario y genera tokens JWT
- `refreshToken(User)` - Renueva accessToken
- `getProfile(userId)` - Obtiene perfil del usuario

**Validaciones:**
- Email corporativo (@canalco.com, @alumbrado.com)
- Contraseña mínimo 6 caracteres
- Usuario debe estar activo (estado = true)

**Flujo de Autenticación:**
1. Usuario envía email + password
2. Sistema valida dominio corporativo
3. Sistema busca usuario y verifica contraseña (bcrypt)
4. Genera accessToken (1h) y refreshToken (7 días)
5. Almacena refreshToken hasheado en BD

---

### 3.2 PurchasesModule (Compras y Requisiciones)
**Rutas Base:** `/purchases/requisitions`, `/purchases/master-data`

#### Controlador 1: PurchasesController
| Endpoint | Método | Descripción | Protección |
|----------|--------|-------------|-----------|
| `/` | POST | Crear requisición | JWT + Roles |
| `/my-requisitions` | GET | Mis requisiciones | JWT |
| `/:id` | GET | Obtener requisición por ID | JWT |
| `/:id` | PATCH | Actualizar requisición | JWT |
| `/review/:id` | PATCH | Revisar requisición | JWT + Roles |
| `/approve/:id` | PATCH | Aprobar requisición | JWT + Roles |
| `/purchase-orders` | POST | Crear órdenes de compra | JWT |
| `/material-receipts` | POST | Registrar recepción de materiales | JWT |

#### Controlador 2: MasterDataController
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/companies` | GET | Listar empresas |
| `/projects` | GET | Listar proyectos (con filtro por empresa) |
| `/materials` | GET | Listar materiales |
| `/material-groups` | GET | Listar grupos de materiales |
| `/statuses` | GET | Listar estados de requisición |
| `/operation-centers` | GET | Listar centros de operación |
| `/project-codes` | GET | Listar códigos de proyecto |

#### Servicio: PurchasesService
**Líneas de Código:** 1910 (MUY LARGO - Refactorizar)

**Métodos Principales:**
- `createRequisition()` - Crea requisición con transacción
- `getMyRequisitions()` - Lista requisiciones del usuario
- `getRequisitionById()` - Obtiene requisición completa
- `reviewRequisition()` - Revisa y aprueba/rechaza (Nivel 1)
- `approveRequisition()` - Aprueba definitivamente (Nivel 2)
- `generateRequisitionNumber()` - Genera número automático
- `createPurchaseOrders()` - Crea órdenes de compra
- `createMaterialReceipt()` - Registra recepción

**Complejidad:** ALTA - Contiene lógica de negocio muy compleja

---

### 3.3 SuppliersModule (Gestión de Proveedores)
**Ruta Base:** `/suppliers`

#### Controlador: SuppliersController
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/` | POST | Crear proveedor |
| `/` | GET | Listar proveedores |
| `/search` | GET | Buscar proveedores |
| `/:id` | GET | Obtener proveedor |
| `/:id` | PUT | Actualizar proveedor |
| `/:id` | DELETE | Desactivar proveedor |

#### Servicio: SuppliersService
**Métodos:**
- `create(CreateSupplierDto)`
- `findAll(activeOnly: boolean)`
- `search(query: string)`
- `findOne(id: number)`
- `update(id, UpdateSupplierDto)`
- `remove(id)` - Desactiva (no borra)

---

## 4. ENTIDADES Y BASE DE DATOS

### 4.1 Lista Completa de Entidades (26 entidades)

#### Autenticación y Autorización (8)
1. **User** - Usuarios del sistema
2. **Role** - Roles (Gerencia, Director, Analista, PQRS, Compras)
3. **Permission** - Permisos granulares
4. **RolePermission** - Relación N:M (Role-Permission)
5. **Gestion** - Gestiones/Departamentos
6. **RoleGestion** - Relación N:M (Role-Gestion)
7. **Authorization** - Autorizaciones jerárquicas
8. **RoleGestion** - Relación de roles con gestiones

#### Datos Maestros (7)
1. **Company** - Empresas (Canales & Contactos, UT's)
2. **Project** - Proyectos (Ciudad Bolívar, Jericó, etc.)
3. **OperationCenter** - Centros de operación
4. **ProjectCode** - Códigos de proyecto
5. **MaterialGroup** - Grupos de materiales
6. **Material** - Catálogo de materiales
7. **RequisitionPrefix** - Prefijos para numeración automática

#### Requisiciones (6)
1. **Requisition** - Requisiciones de compra
2. **RequisitionItem** - Ítems de requisición
3. **RequisitionStatus** - Estados posibles
4. **RequisitionLog** - Historial de cambios
5. **RequisitionApproval** - Aprobaciones/Rechazos
6. **RequisitionSequence** - Secuencias para numeración

#### Compras y Proveedores (5)
1. **Supplier** - Proveedores
2. **RequisitionItemQuotation** - Cotizaciones
3. **PurchaseOrder** - Órdenes de compra
4. **PurchaseOrderItem** - Ítems de OC
5. **PurchaseOrderSequence** - Secuencias de OC
6. **MaterialReceipt** - Recepción de materiales

### 4.2 Diagrama de Relaciones Principales

```
USER (1)
├── Role (N) ──┬── Permission (N) [RolePermission]
│              └── Gestion (N) [RoleGestion]
├── Authorization (N) ─┬─ User (Autorizador)
│                      └─ User (Autorizado)
└── Requisition (N)
    └── RequisitionItem (N)
        ├── Material (1)
        │   └── MaterialGroup (1)
        ├── RequisitionItemQuotation (N)
        │   └── Supplier (1)
        └── PurchaseOrderItem (N)
            ├── PurchaseOrder (1)
            │   ├── Supplier (1)
            │   └── Requisition (1)
            └── MaterialReceipt (N)

COMPANY (1)
├── Project (N)
│   ├── OperationCenter (N)
│   └── ProjectCode (N)
├── OperationCenter (N)
└── RequisitionPrefix (N)

REQUISITION (1)
├── RequisitionStatus (1)
├── User (created_by)
├── User (reviewed_by)
├── User (approved_by)
├── RequisitionItem (N)
├── RequisitionLog (N)
├── RequisitionApproval (N)
└── PurchaseOrder (N)
```

### 4.3 Características de la BD

**Motor:** PostgreSQL  
**Transacciones:** Habilitadas y usadas  
**Cascadas:** Implementadas correctamente en relaciones críticas  
**Índices:** Algunos índices en migraciones  
**Constraints:**
- Foreign Keys: Si
- Unique Constraints: Si
- Check Constraints: No

---

## 5. MIGRACIONES

### 5.1 Migraciones Existentes

| Archivo | Nombre | Descripción | Estado |
|---------|--------|-------------|--------|
| 1762390207486 | Migration | Crear tablas requisitions, items, logs | ✓ |
| 1762390207487 | UpdateRequisitionsAndAddApprovals | Agregar approvals y modificar requisitions | ✓ |
| 1762390207488 | AddCategoryToRoles | Agregar category a roles | ✓ |
| 1762447647420 | AddSuppliersAndQuotations | Crear suppliers y quotations | ✓ |
| 1762456278436 | Migration | Crear purchase orders | ✓ |
| 1762500000000 | AddMaterialReceipts | Crear material receipts | ✓ |

### 5.2 Problemas Identificados en Migraciones

**CRÍTICO:**
1. **Falta de índice en requisition.status_id** - Consultas lenta sin índice
2. **Índices incompletos** - Solo algunas FK tienen índices en requisition_approvals

**ALTO:**
3. **Nombre de migración confusa** - "Migration1762456278436" sin descripción
4. **Sin rollback explícito** - Migraciones antiguas pueden fallar

---

## 6. DTOs Y VALIDACIÓN

### 6.1 DTOs de Autenticación
**LoginDto:**
```typescript
- email: string (IsEmail, IsNotEmpty)
- password: string (IsString, MinLength(6))
```

**LoginResponseDto:**
```typescript
- accessToken: string
- refreshToken: string
- user: UserResponseDto
```

**RefreshTokenDto:**
```typescript
- refreshToken: string
```

### 6.2 DTOs de Requisiciones
**CreateRequisitionDto:**
```typescript
- companyId: number (IsNumber, required)
- projectId: number (IsNumber, optional)
- items: CreateRequisitionItemDto[] (IsArray, ArrayMinSize(1))
```

**CreateRequisitionItemDto:**
```typescript
- materialId: number (IsNumber, required)
- quantity: number (IsNumber, required)
- observation: string (optional)
```

**FilterRequisitionsDto:**
```typescript
- page: number (default: 1)
- limit: number (default: 10, max: 100)
- status: string (optional)
- fromDate: string (IsDateString, ISO 8601)
- toDate: string (IsDateString, ISO 8601)
- projectId: number (optional)
```

### 6.3 Validación Global
**En main.ts:**
```typescript
ValidationPipe({
  whitelist: true,              // ✓ Elimina propiedades no definidas
  forbidNonWhitelisted: true,   // ✓ Lanza error si hay propiedades extras
  transform: true,              // ✓ Transforma a tipos correctos
  transformOptions: {
    enableImplicitConversion: true
  }
})
```

**Cobertura:** Muy buena - Los DTOs principales están validados

---

## 7. AUTENTICACIÓN Y AUTORIZACIÓN

### 7.1 Sistema de Autenticación: JWT

**Tokens:**
- **accessToken:** Válido por 1 hora (configuración: JWT_EXPIRATION=3600)
- **refreshToken:** Válido por 7 días (JWT_REFRESH_EXPIRATION=604800)

**Almacenamiento:**
- accessToken: En cliente (localStorage/sessionStorage)
- refreshToken: Hasheado en BD (user.refreshToken)

**Estrategias Implementadas:**
1. JwtStrategy - Valida accessToken en cada petición
2. JwtRefreshStrategy - Valida refreshToken para renovación

### 7.2 Guards (3 Guards Globales)

1. **JwtAuthGuard**
   - Extiende AuthGuard('jwt')
   - Respeta decorator @Public()
   - Lanza UnauthorizedException si no es válido

2. **RolesGuard**
   - Verifica rol del usuario contra @Roles(...)
   - Retorna false si no hay rol
   - Requiere @Roles(...) en método

3. **PermissionsGuard**
   - Valida permisos granulares
   - Consulta RolePermission tabla
   - Requiere @Permissions(...)

**Aplicación Global:** Sí (en auth.module.ts como APP_GUARD)

### 7.3 Decoradores de Seguridad

```typescript
@Public()                      // Endpoint público (sin JWT)
@Roles('Gerencia', 'Director') // Requiere rol específico
@Permissions('ver', 'editar')  // Requiere permiso específico
@CurrentUser()                 // Inyecta usuario autenticado
@GetUser()                     // Inyecta usuario (alias)
```

### 7.4 Validación de Email Corporativo

**En AuthService.login():**
```typescript
if (!email.endsWith(corporateDomain)) {
  throw new BadRequestException(
    `Email must be from ${corporateDomain} domain`
  );
}
```

**Dominios permitidos:**
- @canalco.com (por defecto)
- @alumbrado.com (configurable)

### 7.5 Roles Implementados

| Rol | Descripción | Acciones |
|-----|-------------|---------|
| Gerencia | Aprobación final | Aprueba/rechaza requisiciones (Nivel 2) |
| Director | Revisión y aprobación | Aprueba/rechaza requisiciones (Nivel 1) |
| Analista PMO | Creación | Crea requisiciones de proyectos |
| PQRS | Creación | Crea requisiciones de atención al cliente |
| Compras | Procesamiento | Solo lee y procesa requisiciones aprobadas |
| Director PMO | Revisión | Similar a Director |

---

## 8. SEGURIDAD

### 8.1 Medidas Implementadas

#### Contraseñas
- ✓ Hashing con bcrypt (10 saltos)
- ✓ No se almacenan en texto plano
- ✓ Validación: MinLength(6)

#### Tokens JWT
- ✓ Secret configurado vía variables de entorno
- ✓ Expiración configurada (1h access, 7d refresh)
- ✓ Almacenamiento de refreshToken hasheado

#### Validación de Entrada
- ✓ DTOs con class-validator
- ✓ ValidationPipe global con whitelist
- ✓ Tipos TypeScript estrictos

#### Protección de Errores
- ✓ AllExceptionsFilter captura todos los errores
- ✓ No expone detalles internos de BD (sanitiza errores)
- ✓ Logging de errores para debugging

#### Headers de Seguridad
- ✓ Helmet implementado en main.ts
- ✓ Rate limiting con ThrottlerModule (10 req/60s)

#### CORS
- ✓ Habilitado y configurado en main.ts
- ✓ Allow credentials: true
- ✓ Métodos permitidos: GET, POST, PUT, PATCH, DELETE, OPTIONS

### 8.2 Vulnerabilidades Identificadas

#### CRÍTICAS

**1. Secrets en configuración hardcodeados**
- **Severidad:** CRÍTICA
- **Ubicación:** config/configuration.ts (líneas 12-13)
- **Problema:** 
  ```typescript
  JWT_SECRET || 'change-this-secret'
  JWT_REFRESH_SECRET || 'change-this-refresh-secret'
  ```
- **Impacto:** En producción sin .env, usa secrets débiles
- **Recomendación:** Validar que .env existe y lanzar error si falta
- **Código:**
  ```typescript
  secret: configService.get('jwt.secret') || 'change-this-secret'
  ```

**2. Base de datos con credenciales por defecto**
- **Severidad:** CRÍTICA
- **Ubicación:** data-source.ts, configuration.ts
- **Problema:** 
  ```typescript
  username: process.env.DB_USERNAME || 'canalco'
  password: process.env.DB_PASSWORD || 'canalco'
  ```
- **Impacto:** Conexión fallará en prod si no hay .env, pero usa defaults débiles
- **Recomendación:** Hacer obligatorio .env en producción

**3. Email corporativo validado solo por dominio**
- **Severidad:** ALTA
- **Ubicación:** auth.service.ts (línea 31)
- **Problema:** Solo valida que termine en @canalco.com
- **Impacto:** No valida que el usuario exista en AD/LDAP
- **Recomendación:** Implementar integración con directorio activo

**4. Refresh token almacenado sin mecanismo de revocación**
- **Severidad:** ALTA
- **Ubicación:** user.entity.ts, auth.service.ts
- **Problema:** 
  - Refresh token hasheado pero no se valida en BD
  - No hay blacklist de tokens revocados
  - Si token se expone, puede ser usado hasta expiración (7 días)
- **Recomendación:** Implementar token blacklist o validar contra BD

**5. No hay protección contra fuerza bruta en login**
- **Severidad:** ALTA
- **Ubicación:** auth.service.ts login() no tiene rate limiting por usuario
- **Problema:** 
  - Rate limiting global (10 req/60s) pero no por usuario
  - Múltiples intentos fallidos no bloquean cuenta
- **Recomendación:** Implementar rate limiting por email + bloqueo de cuenta

**6. Logging de errores expone información de BD**
- **Severidad:** MEDIA
- **Ubicación:** all-exceptions.filter.ts
- **Problema:** Logs contienen detalles de errores de BD
- **Impacto:** En producción, logs deben ir a file/servicio seguro
- **Recomendación:** Separar logs por nivel, sanitizar en console

#### ALTAS

**7. Validación de email demasiado permisiva**
- **Severidad:** ALTA
- **Ubicación:** login.dto.ts - solo usa IsEmail()
- **Problema:** IsEmail() acepta formatos raros
- **Recomendación:** Custom validator para emails corporativos

**8. No hay control de acceso en endpoints de master data**
- **Severidad:** ALTA
- **Ubicación:** master-data.controller.ts
- **Problema:** Todos los usuarios ven todos los datos maestros
- **Impacto:** Usuarios de Compras ven materiales que no les corresponden
- **Recomendación:** Filtrar master data por permisos

**9. Migrations pueden fallar silenciosamente**
- **Severidad:** ALTA
- **Ubicación:** database.module.ts (migrationsRun: false)
- **Problema:** Las migraciones no se ejecutan automáticamente
- **Impacto:** Nuevo deploy sin ejecutar migrations = schema inconsistente
- **Recomendación:** Ejecutar migrations en deployment

**10. No hay validación de cantidad en requisiciones**
- **Severidad:** MEDIA-ALTA
- **Ubicación:** create-requisition-item.dto.ts
- **Problema:** No valida que cantidad > 0
- **Recomendación:** Agregar Min(0.01) o similar

#### MEDIAS

**11. Usuario puede ver requisiciones de otros usuarios**
- **Severidad:** MEDIA
- **Ubicación:** purchases.service.ts getMyRequisitions()
- **Problema:** Solo filtra por createdBy, pero no hay filtro en getRequisitionById()
- **Recomendación:** Validar acceso basado en rol/permisos

**12. No hay índices en columnas críticas**
- **Severidad:** MEDIA
- **Ubicación:** database/migrations
- **Problema:** requisition.status_id, requisition.createdBy sin índices
- **Impacto:** Consultas lentas con muchas requisiciones
- **Recomendación:** Agregar índices en migraciones

**13. Refresh token no se reemplaza al refrescar**
- **Severidad:** MEDIA
- **Ubicación:** auth.service.ts refreshToken()
- **Problema:** Retorna nuevo accessToken pero usa mismo refreshToken
- **Impacto:** Genera nuevos accessToken sin validar refreshToken contra BD
- **Recomendación:** Regenerar y almacenar nuevo refreshToken

**14. No hay validación de FK en DTOs**
- **Severidad:** MEDIA
- **Ubicación:** purchase orders, material receipts
- **Problema:** Solo validamos que sean números, no que existan
- **Recomendación:** Usar custom validators

**15. CORS permitido en desarrollo** 
- **Severidad:** MEDIA
- **Ubicación:** main.ts (origin: true)
- **Problema:** En desarrollo origin: true permite cualquier origen
- **Impacto:** CSRF en desarrollo (no es crítico pero mala práctica)
- **Recomendación:** Usar lista blanca en producción

#### BAJAS

**16. Logging en desarrollo sin rotación**
- **Severidad:** BAJA
- **Ubicación:** data-source.ts, all-exceptions.filter.ts
- **Problema:** Logs no tienen rotación, pueden crecer indefinidamente
- **Recomendación:** Usar winston o similar

**17. Enum strings sin validación**
- **Severidad:** BAJA
- **Ubicación:** Varios DTOs (action, status)
- **Problema:** Los valores de enums no se validan
- **Recomendación:** Usar @IsEnum() o custom validators

---

## 9. PROBLEMAS POTENCIALES Y BUGS

### 9.1 Problemas Identificados

#### CRÍTICOS

**1. PurchasesService es MUY LARGO (1910 líneas)**
- **Impacto:** Difícil de mantener, testear, entender
- **Solución:** Refactorizar en múltiples servicios
  - RequisitionService
  - PurchaseOrderService
  - QuotationService
  - ApprovalService

**2. Relación circular potencial entre entidades**
- **Ubicación:** User → Authorization → User
- **Impacto:** Puede causar problemas al cargar relaciones
- **Recomendación:** Usar lazy loading o seleccionar relaciones explícitamente

**3. Status_id vs Status texto inconsistente**
- **Ubicación:** Requisition entity y migraciones
- **Problema:** 
  - Vieja columna: status (text)
  - Nueva columna: status_id (int FK)
  - Migración migra texto a ID
  - Pero getMyRequisitions() filtra por status.code
- **Impacto:** Puede haber inconsistencia
- **Recomendación:** Validar migraciones completamente

**4. No hay validación de secuencia en generación de números**
- **Ubicación:** generateRequisitionNumber()
- **Problema:** Usa RequisitionSequence pero sin verificar que incremente correctamente
- **Recomendación:** Agregar validación de secuencia

#### ALTOS

**5. Operación Center se asigna automáticamente pero puede ser NULL**
- **Ubicación:** determineOperationCenter()
- **Problema:** Si no encuentra, devuelve NULL pero operationCenterId es NOT NULL
- **Recomendación:** Validar que siempre exista antes de crear

**6. ProjectCode se asigna automáticamente pero puede retornar undefined**
- **Ubicación:** determineProjectCode()
- **Problema:** Similar a #5
- **Recomendación:** Validar existencia

**7. REquisitiones creadas sin validar que usuario sea activo**
- **Ubicación:** validateUserCanCreate()
- **Problema:** No valida user.estado
- **Impacto:** Usuario inactivo puede crear requisiciones
- **Recomendación:** Agregar validación de estado

**8. Reviews y Approvals sin validar nivel jerárquico**
- **Ubicación:** reviewRequisition(), approveRequisition()
- **Problema:** No valida que revisor tenga autoridad sobre creator
- **Recomendación:** Validar authorization.nivel

**9. Quotations sin validar que supplier esté activo**
- **Ubicación:** manage quotation endpoints
- **Problema:** Permite cotizaciones de suppliers inactivos
- **Recomendación:** Validar supplier.isActive

**10. No hay atomicidad en creación de purchase orders**
- **Ubicación:** createPurchaseOrders() sin transacción
- **Problema:** Si falla a mitad, puede quedar inconsistente
- **Impacto:** Requisiciones parcialmente procesadas
- **Recomendación:** Usar QueryRunner como en createRequisition()

#### MEDIOS

**11. Debug console.log dejado en código**
- **Ubicación:** purchases.service.ts (DEBUG comments)
- **Problema:** console.log('🔍 DEBUG...') en producción
- **Recomendación:** Remover o usar logger

**12. Archivos .ts sin tests unitarios**
- **Ubicación:** Prácticamente todo (jest.spec.ts solo en app.controller)
- **Problema:** Sin cobertura de tests
- **Recomendación:** Agregar tests para servicios críticos

**13. Validaciones de negocio mezcladas con validaciones de datos**
- **Ubicación:** purchases.service.ts
- **Problema:** validateUserCanCreate() + validaciones de BD entrelazadas
- **Recomendación:** Separar en capas (validators, guards, services)

**14. No hay paginación en algunos endpoints**
- **Ubicación:** GET materials, GET suppliers
- **Problema:** Si hay 10k materiales, carga todo
- **Recomendación:** Agregar pagination

**15. Error handling inconsistente**
- **Ubicación:** Varios servicios
- **Problema:** Algunos lanzan exceptions, otros retornan null/undefined
- **Recomendación:** Standardizar error handling

#### BAJOS

**16. DTOs Response no definidos**
- **Ubicación:** Falta Requisition, Material DTOs para responses
- **Problema:** Swagger muestra entidades completas en responses
- **Recomendación:** Crear DTO response para cada endpoint

**17. Naming inconsistente en tabla**
- **Ubicación:** Algunas tablas en español (usuarios), otras en inglés (users)
- **Problema:** `users`, `roles`, pero `autorizaciones`
- **Recomendación:** Standardizar nombres

---

## 10. ANÁLISIS DE DATOS Y SEMILLAS

### 10.1 Seed Data
**Ubicación:** src/database/seeds/seed.ts

**Datos de Prueba Incluidos:**
- 6 Roles (Gerencia, Director, etc.)
- 6 Usuarios de prueba con contraseña: Canalco2025!
- 8 Empresas (Canales & Contactos + 7 UTs)
- 5 Proyectos (solo para Canales & Contactos)
- 8 Centros de operación
- 10+ Códigos de proyecto
- 40+ Materiales con grupos
- 5 Proveedores de prueba
- Secuencias para numeración automática
- Estados de requisición (pendiente, aprobada, rechazada, etc.)

### 10.2 Datos de Prueba Disponibles

**Usuario Admin:**
- Email: gerencia@canalco.com
- Password: Canalco2025!
- Rol: Gerencia

**Otros usuarios de prueba:**
- director.tecnico@canalco.com (Director)
- analista.pmo@canalco.com (Analista PMO)
- pqrs@canalco.com (PQRS)
- compras@canalco.com (Compras)
- director.pmo@canalco.com (Director PMO)

---

## 11. PROBLEMAS DE RELACIONES EN ENTIDADES

### 11.1 Relaciones Complejas Identificadas

**1. Cadena de aprobación de requisiciones:**
```
Requisition → RequisitionApproval → User
           → RequisitionApproval → RequisitionStatus
```

**2. Cotizaciones y órdenes de compra:**
```
Requisition → RequisitionItem → RequisitionItemQuotation → Supplier
          → PurchaseOrder → PurchaseOrderItem → RequisitionItemQuotation
```

**3. Autorización jerárquica:**
```
User → Authorization (usuarioAutorizador, usuarioAutorizado)
```

### 11.2 Potenciales Problemas de Relaciones

**Circular References:**
- User → Authorization → User ✓ (bien manejado)

**Missing Foreign Keys:**
- MaterialReceipt.createdBy → User (FK existe)
- PurchaseOrder.createdBy → User (FK existe)

**N+1 Queries:**
- getMyRequisitions() hace leftJoinAndSelect múltiples veces
- Podría causar lentitud con muchas requisiciones
- Recomendación: Usar pagination agresiva

---

## 12. VALIDACIONES FALTANTES

### Validaciones Críticas Faltantes:

1. **Cantidad > 0** en RequisitionItem
2. **Proveedor activo** en cotizaciones
3. **Material existe** en requisición
4. **Usuario activo** antes de crear requisición
5. **Empresa existe** (se valida con FK pero no explícitamente)
6. **Proyecto corresponde a empresa**
7. **Email único** en sistema (no hay constraint unique en user.email)
8. **Secuencia consistente** en numeración
9. **Status transitions válidas** (ej: no pasar de aprobada a pendiente)
10. **Permisos para revisar/aprobar** (según Authorization entity)

---

## 13. RECOMENDACIONES DE MEJORA

### Prioridad CRÍTICA (Implementar Inmediatamente)

1. **Validación de secrets en .env**
   ```typescript
   // En main.ts
   if (!process.env.JWT_SECRET) {
     throw new Error('JWT_SECRET must be defined in .env');
   }
   ```

2. **Implementar token blacklist**
   - Tabla: token_blacklist (token_id, token_hash, expires_at)
   - Validar en JwtAuthGuard

3. **Rate limiting por usuario**
   - Usar redis para contar intentos por email
   - Bloquear después de 5 intentos en 15 min

4. **Refactorizar PurchasesService**
   - Dividir en 4 servicios
   - Máximo 500 líneas por servicio

5. **Validar acceso a requisiciones**
   - Verificar permisos en getRequisitionById()
   - Usuario solo ve sus requisiciones o las que debe revisar/aprobar

### Prioridad ALTA (Implementar en 2 semanas)

6. **Agregar índices en BD**
   ```sql
   CREATE INDEX idx_requisition_status_id ON requisitions(status_id);
   CREATE INDEX idx_requisition_created_by ON requisitions(created_by);
   CREATE INDEX idx_approval_requisition_id ON requisition_approvals(requisition_id);
   ```

7. **Implementar logging proper**
   - Usar winston o pino
   - Separar logs por nivel
   - Almacenar en archivos con rotación

8. **Agregar response DTOs**
   - RequisitionResponseDto
   - MaterialResponseDto
   - SupplierResponseDto

9. **Validar transitions de estado**
   - Solo ciertos estados pueden transicionar a otros
   - Tabla: status_transitions

10. **Implementar paginación en todos los GETs**
    - No devolver listas completas sin limit

### Prioridad MEDIA (Implementar en 1 mes)

11. **Test coverage**
    - Unit tests para servicios
    - E2E tests para endpoints críticos
    - Target: 70%+ coverage

12. **Documentación de APIs**
    - Actualizar Swagger
    - Agregar ejemplos de error
    - Documentar transiciones de estado

13. **Caché de master data**
    - Cachear empresas, proyectos, materiales
    - Invalidar cuando cambien

14. **Audit trail**
    - Registrar quién cambió qué y cuándo
    - Implementar soft deletes

15. **Validación de negocio**
    - CustomValidator para email corporativo
    - CustomValidator para secuencias
    - CustomValidator para relaciones FK

---

## 14. MATRIZ DE PROBLEMAS Y SEVERIDAD

| # | Problema | Severidad | Categoría | Línea Estimada | Impacto |
|----|----------|-----------|-----------|---|---------|
| 1 | Secrets hardcodeados | CRÍTICA | Seguridad | 2 horas | Data breach |
| 2 | Credenciales BD default | CRÍTICA | Seguridad | 2 horas | Acceso no autorizado |
| 3 | Rate limiting por usuario | CRÍTICA | Seguridad | 4 horas | Brute force |
| 4 | Token revocation | CRÍTICA | Seguridad | 6 horas | Token reutilización |
| 5 | PurchasesService 1910 lineas | CRÍTICA | Arquitectura | 16 horas | Mantenibilidad |
| 6 | Validar acceso a requisiciones | ALTA | Seguridad | 4 horas | Acceso no autorizado |
| 7 | Índices en BD | ALTA | Performance | 2 horas | Queries lentas |
| 8 | Tests unitarios | ALTA | QA | 20 horas | Bugs no detectados |
| 9 | Response DTOs | MEDIA | Documentación | 6 horas | Swagger incorrecto |
| 10 | Debug logs | MEDIA | Código | 0.5 horas | Información expuesta |

---

## 15. CONCLUSIONES

### Fortalezas
1. Arquitectura NestJS bien estructurada
2. Seguridad básica implementada (JWT, Helmet, bcrypt)
3. Validación de entrada robusta
4. Documentación API excelente (Swagger)
5. Migraciones TypeORM correctas
6. Transacciones para operaciones críticas
7. Manejo de errores centralizado

### Debilidades
1. Servicio de compras MUY LARGO (refactorizar)
2. Vulnerabilidades de seguridad importantes
3. Falta de tests unitarios
4. Índices de BD incompletos
5. Validaciones de negocio mezcladas con lógica
6. Token refresh sin regeneración ni validación

### Recomendación Siguiente
1. Implementar cambios críticos de seguridad (máximo 2 semanas)
2. Refactorizar PurchasesService (máximo 4 semanas)
3. Agregar tests unitarios (máximo 6 semanas)
4. Implementar audit trail y logging (máximo 8 semanas)

---

## APÉNDICE A: ESTADÍSTICAS DEL CÓDIGO

```
Total Entidades:            26
Total DTOs:                 15+
Total Servicios:            3 (Auth, Purchases, Suppliers)
Total Controladores:        4 (Auth, Purchases, MasterData, Suppliers)
Total Guards:               3 (JWT, Roles, Permissions)
Total Decoradores:          5 (@Public, @Roles, @Permissions, @GetUser, @CurrentUser)
Total Migraciones:          6
Total Endpoints:            40+
Líneas Purchases Service:   1910 (MUY LARGO)
Cobertura Tests:            ~5%
```

---

**Fin del Reporte**  
**Analista:** Sistema Automatizado de Análisis de Código  
**Fecha:** 11 de Noviembre de 2024
