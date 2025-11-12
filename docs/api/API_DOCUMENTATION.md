# Documentación API - Backend Canalco (NestJS)

## URL Base
Todos los endpoints tienen el prefijo `/api` (configurable vía variables de entorno)

---

## 🔐 Autenticación

Todos los endpoints requieren autenticación JWT vía Bearer token en el header `Authorization`, **EXCEPTO** los marcados como "Público" (login y refresh token).

**Formato del header:**
```
Authorization: Bearer <tu_access_token>
```

---

## 1. MÓDULO DE AUTENTICACIÓN

### 1.1 Login
- **Endpoint:** `POST /auth/login`
- **Descripción:** Autenticar usuario con email y contraseña
- **Autenticación:** No (Público)

**Request Body:**
```json
{
  "email": "gerencia@canalco.com",
  "password": "Canalco2025!"
}
```

**Validación:**
- Email debe ser formato válido
- Solo acepta dominios: `@canalco.com` o `@alumbrado.com`
- Contraseña mínimo 6 caracteres

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "email": "gerencia@canalco.com",
    "nombre": "Juan Carlos Rodríguez",
    "cargo": "Gerente General",
    "rolId": 1,
    "nombreRol": "Gerencia"
  }
}
```

**Usuarios de Prueba:**
- `gerencia@canalco.com` / `Canalco2025!` (Gerencia)
- `director.tecnico@canalco.com` / `Canalco2025!` (Director Técnico)
- `analista.pmo@canalco.com` / `Canalco2025!` (Analista PMO)
- `pqrs@canalco.com` / `Canalco2025!` (PQRS)
- `compras@canalco.com` / `Canalco2025!` (Compras)
- `director.pmo@canalco.com` / `Canalco2025!` (Director PMO)

---

### 1.2 Refresh Token
- **Endpoint:** `POST /auth/refresh`
- **Descripción:** Obtener nuevo access token usando refresh token
- **Autenticación:** No (Público - pero requiere refresh token válido)

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

**Notas:**
- Access token válido por 1 hora
- Refresh token válido por 7 días

---

### 1.3 Get Profile
- **Endpoint:** `GET /auth/profile`
- **Descripción:** Obtener perfil del usuario autenticado
- **Autenticación:** Sí

**Response (200):**
```json
{
  "userId": 1,
  "email": "gerencia@canalco.com",
  "nombre": "Juan Carlos Rodríguez",
  "cargo": "Gerente General",
  "rolId": 1,
  "nombreRol": "Gerencia"
}
```

---

## 2. DATOS MAESTROS (MASTER DATA)

**Base Route:** `/purchases/master-data`

### 2.1 Get Companies
- **Endpoint:** `GET /purchases/master-data/companies`
- **Autenticación:** Sí

**Response:**
```json
{
  "data": [
    { "companyId": 1, "name": "Canales & Contactos" },
    { "companyId": 2, "name": "UT El Cerrito" }
  ],
  "total": 8
}
```

---

### 2.2 Get Projects
- **Endpoint:** `GET /purchases/master-data/projects`
- **Autenticación:** Sí
- **Query Params:** `companyId` (opcional)

**Ejemplos:**
- Todos los proyectos: `GET /purchases/master-data/projects`
- Proyectos de empresa 1: `GET /purchases/master-data/projects?companyId=1`

**Response:**
```json
{
  "data": [
    {
      "projectId": 1,
      "name": "Administrativo",
      "companyId": 1,
      "company": { "companyId": 1, "name": "Canales & Contactos" }
    }
  ],
  "total": 5
}
```

---

### 2.3 Get Operation Centers
- **Endpoint:** `GET /purchases/master-data/operation-centers`
- **Autenticación:** Sí

**Response:**
```json
{
  "data": [
    {
      "operationCenterId": 1,
      "code": "001",
      "name": "Centro Principal",
      "company": {...},
      "project": {...}
    }
  ],
  "total": 10
}
```

---

### 2.4 Get Project Codes
- **Endpoint:** `GET /purchases/master-data/project-codes`
- **Autenticación:** Sí

**Response:**
```json
{
  "data": [
    {
      "projectCodeId": 1,
      "code": "CB",
      "name": "Ciudad Bolívar",
      "company": {...},
      "project": {...}
    }
  ],
  "total": 15
}
```

---

### 2.5 Get Material Groups
- **Endpoint:** `GET /purchases/master-data/material-groups`
- **Autenticación:** Sí

**Response:**
```json
{
  "data": [
    { "groupId": 1, "name": "Eléctrico" },
    { "groupId": 2, "name": "Construcción" },
    { "groupId": 3, "name": "Herramientas" },
    { "groupId": 4, "name": "Suministros de Oficina" },
    { "groupId": 5, "name": "Iluminación" },
    { "groupId": 6, "name": "Seguridad Industrial" }
  ],
  "total": 6
}
```

---

### 2.6 Get Materials
- **Endpoint:** `GET /purchases/master-data/materials`
- **Autenticación:** Sí
- **Query Params:** `groupId` (opcional)

**Ejemplos:**
- Todos los materiales: `GET /purchases/master-data/materials`
- Materiales eléctricos: `GET /purchases/master-data/materials?groupId=1`

**Response:**
```json
{
  "data": [
    {
      "materialId": 1,
      "code": "ELEC-001",
      "description": "Cable #10 AWG",
      "materialGroup": { "groupId": 1, "name": "Eléctrico" }
    }
  ],
  "total": 12
}
```

---

### 2.7 Get Statuses
- **Endpoint:** `GET /purchases/master-data/statuses`
- **Autenticación:** Sí

**Response:**
```json
{
  "data": [
    { "statusId": 1, "code": "pendiente", "name": "Pendiente", "order": 1 },
    { "statusId": 2, "code": "aprobada_revisor", "name": "Aprobada por Revisor", "order": 2 }
  ],
  "total": 10
}
```

**Flujo de Estados:**
1. `pendiente` - Creada, esperando revisión
2. `aprobada_revisor` - Aprobada por Director (Nivel 1)
3. `rechazada_revisor` - Rechazada por Director
4. `aprobada_gerencia` - Aprobada por Gerencia (Nivel 2)
5. `rechazada_gerencia` - Rechazada por Gerencia
6. `en_cotizacion` - En proceso de cotización
7. `cotizada` - Cotizada
8. `pendiente_recepcion` - Esperando recepción de material
9. `en_recepcion` - Parcialmente recibida
10. `recepcion_completa` - Completamente recibida

---

## 3. MÓDULO DE REQUISICIONES

**Base Route:** `/purchases/requisitions`

### 3.1 Create Requisition
- **Endpoint:** `POST /purchases/requisitions`
- **Descripción:** Crear nueva requisición con numeración automática
- **Autenticación:** Sí
- **Roles Permitidos:** Analistas PMO, PQRS, Directores
- **Roles Denegados:** Gerencia, Compras

**Request Body:**
```json
{
  "companyId": 1,
  "projectId": 2,
  "items": [
    {
      "materialId": 1,
      "quantity": 10,
      "observation": "Cable #10 para instalación principal"
    },
    {
      "materialId": 3,
      "quantity": 5,
      "observation": "Breakers para tablero secundario"
    }
  ]
}
```

**Validación:**
- `companyId`: Requerido, debe existir
- `projectId`: Opcional, debe existir si se provee
- `items`: Requerido, mínimo 1 item
- `materialId`: Requerido, debe existir
- `quantity`: Requerido, mínimo 1
- `observation`: Opcional

**Response (201):**
```json
{
  "requisitionId": 1,
  "requisitionNumber": "CB-0001",
  "status": "pendiente",
  "companyId": 1,
  "projectId": 2,
  "createdBy": 5,
  "createdAt": "2025-11-06T01:30:00.000Z",
  "items": [...],
  "company": {...},
  "project": {...}
}
```

---

### 3.2 Get My Requisitions
- **Endpoint:** `GET /purchases/requisitions/my-requisitions`
- **Descripción:** Obtener todas las requisiciones creadas por el usuario autenticado
- **Autenticación:** Sí

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Items por página (default: 10, max: 100)
- `status` (opcional): Filtrar por código de estado
- `fromDate` (opcional): Fecha inicio (YYYY-MM-DD)
- `toDate` (opcional): Fecha fin (YYYY-MM-DD)
- `projectId` (opcional): Filtrar por proyecto

**Ejemplos:**
- Todas mis requisiciones: `GET /purchases/requisitions/my-requisitions`
- Solo pendientes: `GET /purchases/requisitions/my-requisitions?status=pendiente`
- Página 2: `GET /purchases/requisitions/my-requisitions?page=2&limit=20`
- Rango de fechas: `GET /purchases/requisitions/my-requisitions?fromDate=2025-01-01&toDate=2025-12-31`

**Response (200):**
```json
{
  "data": [...],
  "total": 15,
  "page": 1,
  "limit": 10,
  "totalPages": 2
}
```

---

### 3.3 Get Pending Actions
- **Endpoint:** `GET /purchases/requisitions/pending-actions`
- **Descripción:** Obtener requisiciones que requieren revisión/aprobación del usuario actual según su rol
- **Autenticación:** Sí
- **Query Parameters:** Mismos que "Get My Requisitions"

**Notas:**
- Directores ven requisiciones en estado "pendiente"
- Gerencia ve requisiciones en estado "aprobada_revisor"

---

### 3.4 Get Requisitions for Quotation
- **Endpoint:** `GET /purchases/requisitions/for-quotation`
- **Descripción:** Listar requisiciones aprobadas por gerencia listas para cotización
- **Autenticación:** Sí
- **Roles Permitidos:** Compras únicamente
- **Query Parameters:** Mismos que "Get My Requisitions"

---

### 3.5 Get My Pending Receipts
- **Endpoint:** `GET /purchases/requisitions/my-pending-receipts`
- **Descripción:** Listar requisiciones creadas por el usuario pendientes de recepción de material
- **Autenticación:** Sí
- **Query Parameters:** Mismos que "Get My Requisitions"

---

### 3.6 Get Requisition by ID
- **Endpoint:** `GET /purchases/requisitions/:id`
- **Descripción:** Obtener detalles completos de una requisición específica
- **Autenticación:** Sí

**Response (200):**
```json
{
  "requisitionId": 1,
  "requisitionNumber": "CB-0001",
  "status": "pendiente",
  "items": [...],
  "company": {...},
  "project": {...},
  "creator": {...},
  "approvals": [...],
  "logs": [...]
}
```

---

### 3.7 Update Requisition
- **Endpoint:** `PATCH /purchases/requisitions/:id`
- **Descripción:** Actualizar requisición existente (solo creador, estados específicos)
- **Autenticación:** Sí

**Estados Permitidos:** Solo cuando el estado es:
- `pendiente`
- `rechazada_revisor`
- `rechazada_gerencia`

**Request Body:**
```json
{
  "companyId": 1,
  "projectId": 2,
  "items": [
    {
      "materialId": 1,
      "quantity": 15,
      "observation": "Cantidad actualizada"
    }
  ]
}
```

---

### 3.8 Delete Requisition
- **Endpoint:** `DELETE /purchases/requisitions/:id`
- **Descripción:** Eliminar requisición (solo creador, solo estado pendiente)
- **Autenticación:** Sí
- **Estado Permitido:** Solo `pendiente`

**Response (204):** Sin contenido

---

### 3.9 Review Requisition (Directores)
- **Endpoint:** `POST /purchases/requisitions/:id/review`
- **Descripción:** Directores aprueban o rechazan requisición (Revisión Nivel 1)
- **Autenticación:** Sí
- **Roles Permitidos:** Directores con autorización Nivel 1

**Request Body:**
```json
{
  "decision": "approve",
  "comments": "Requisición aprobada, materiales necesarios para el proyecto"
}
```

**Campos:**
- `decision`: Requerido, "approve" o "reject"
- `comments`: Opcional para aprobar, recomendado para rechazar

**Response (200):**
```json
{
  "requisitionId": 1,
  "requisitionNumber": "CB-0001",
  "status": "aprobada_revisor",
  "approvals": [...]
}
```

**Notas:**
- Si aprueba: Estado cambia a "aprobada_revisor"
- Si rechaza: Estado cambia a "rechazada_revisor"

---

### 3.10 Approve Requisition (Gerencia)
- **Endpoint:** `POST /purchases/requisitions/:id/approve`
- **Descripción:** Gerencia aprueba requisición (Nivel 2 - aprobación final)
- **Autenticación:** Sí
- **Roles Permitidos:** Gerencia únicamente
- **Estado Requerido:** Debe estar en "aprobada_revisor"

**Request Body:**
```json
{
  "comments": "Aprobado por gerencia, proceder con la compra"
}
```

**Response (200):**
```json
{
  "requisitionId": 1,
  "status": "aprobada_gerencia",
  "approvals": [...]
}
```

---

### 3.11 Reject Requisition (Gerencia)
- **Endpoint:** `POST /purchases/requisitions/:id/reject`
- **Descripción:** Gerencia rechaza requisición (Nivel 2)
- **Autenticación:** Sí
- **Roles Permitidos:** Gerencia únicamente
- **Estado Requerido:** Debe estar en "aprobada_revisor"

**Request Body:**
```json
{
  "comments": "Presupuesto insuficiente para esta requisición en el trimestre actual"
}
```

**Campos:**
- `comments`: **REQUERIDO** - Debe explicar razón del rechazo

**Response (200):**
```json
{
  "requisitionId": 1,
  "status": "rechazada_gerencia",
  "approvals": [...]
}
```

---

### 3.12 Get Requisition Quotation
- **Endpoint:** `GET /purchases/requisitions/:id/quotation`
- **Descripción:** Obtener detalles de requisición con información de cotización actual
- **Autenticación:** Sí
- **Roles Permitidos:** Compras únicamente
- **Estados Válidos:** "aprobada_gerencia" o "en_cotizacion"

**Response (200):**
```json
{
  "requisitionId": 1,
  "requisitionNumber": "CB-0001",
  "status": "aprobada_gerencia",
  "items": [
    {
      "itemId": 1,
      "material": {...},
      "quantity": 10,
      "quotation": {
        "action": "cotizar",
        "version": 1,
        "suppliers": [...]
      }
    }
  ]
}
```

---

### 3.13 Manage Quotation
- **Endpoint:** `POST /purchases/requisitions/:id/quotation`
- **Descripción:** Asignar proveedores y acciones a los items de la requisición
- **Autenticación:** Sí
- **Roles Permitidos:** Compras únicamente
- **Estados Válidos:** "aprobada_gerencia" o "en_cotizacion"

**Request Body:**
```json
{
  "items": [
    {
      "itemId": 1,
      "action": "cotizar",
      "suppliers": [
        {
          "supplierId": 3,
          "supplierOrder": 1,
          "observations": "Solicitar entrega en 5 días"
        },
        {
          "supplierId": 7,
          "supplierOrder": 2,
          "observations": "Proveedor alternativo"
        }
      ]
    },
    {
      "itemId": 2,
      "action": "no_requiere",
      "justification": "Material disponible en inventario"
    }
  ]
}
```

**Campos:**
- `itemId`: Requerido
- `action`: Requerido, "cotizar" o "no_requiere"
- `suppliers`: Requerido si action es "cotizar", máximo 2 proveedores
- `justification`: Requerido si action es "no_requiere"

**Notas:**
- Estado cambia a "en_cotizacion" cuando se asigna primer item
- Estado cambia a "cotizada" cuando TODOS los items tienen acciones asignadas

---

### 3.14 Create Purchase Orders
- **Endpoint:** `POST /purchases/requisitions/:id/purchase-orders`
- **Descripción:** Generar órdenes de compra desde requisición cotizada
- **Autenticación:** Sí
- **Roles Permitidos:** Compras únicamente
- **Estado Requerido:** Debe estar en "cotizada"

**Request Body:**
```json
{
  "issueDate": "2025-11-06",
  "items": [
    {
      "itemId": 1,
      "supplierId": 3,
      "unitPrice": 50000,
      "hasIVA": true,
      "discount": 5000
    },
    {
      "itemId": 2,
      "supplierId": 3,
      "unitPrice": 25000,
      "hasIVA": false,
      "discount": 0
    }
  ]
}
```

**Campos:**
- `issueDate`: Opcional (default: fecha actual)
- `items`: Requerido, mínimo 1
  - `itemId`: Requerido
  - `supplierId`: Requerido
  - `unitPrice`: Requerido (mínimo 0)
  - `hasIVA`: Opcional (default: true - 19% IVA)
  - `discount`: Opcional (default: 0)

**Response (201):**
```json
{
  "requisitionId": 1,
  "status": "pendiente_recepcion",
  "purchaseOrders": [
    {
      "poId": 1,
      "poNumber": "001-OC-0001",
      "supplierId": 3,
      "issueDate": "2025-11-06",
      "subtotal": 575000,
      "ivaTotal": 85550,
      "total": 655550,
      "items": [...]
    }
  ]
}
```

**Notas:**
- Los items se agrupan automáticamente por proveedor
- Se crea una OC por cada proveedor
- Formato número OC: `{code}-{type}-{sequence}`
  - Code: Código del centro de operación
  - Type: "OC" para Unión Temporal, "OS" para otros
  - Sequence: 4 dígitos auto-incremental por centro de operación
- Cálculos:
  - Subtotal = cantidad × precioUnitario
  - IVA = subtotal × 19% (si hasIVA es true)
  - Total = subtotal + IVA - descuento
- Estado cambia a "pendiente_recepcion"

---

### 3.15 Get Requisition Receipts
- **Endpoint:** `GET /purchases/requisitions/:id/receipts`
- **Descripción:** Ver todas las recepciones de material de una requisición
- **Autenticación:** Sí
- **Roles Permitidos:** Solo creador
- **Estados Válidos:** "pendiente_recepcion", "en_recepcion", o "recepcion_completa"

**Response (200):**
```json
{
  "requisitionId": 1,
  "requisitionNumber": "CB-0001",
  "status": "en_recepcion",
  "purchaseOrders": [
    {
      "poId": 1,
      "poNumber": "001-OC-0001",
      "supplier": {...},
      "items": [
        {
          "poItemId": 1,
          "material": {...},
          "quantity": 10,
          "quantityReceived": 7,
          "quantityPending": 3,
          "receipts": [...]
        }
      ]
    }
  ]
}
```

---

### 3.16 Create Material Receipt
- **Endpoint:** `POST /purchases/requisitions/:id/receipts`
- **Descripción:** Registrar recepción de material para uno o más items
- **Autenticación:** Sí
- **Roles Permitidos:** Solo creador
- **Estados Válidos:** "pendiente_recepcion" o "en_recepcion"

**Request Body:**
```json
{
  "items": [
    {
      "poItemId": 1,
      "quantityReceived": 5,
      "receivedDate": "2025-11-06",
      "observations": "Material en buen estado"
    },
    {
      "poItemId": 2,
      "quantityReceived": 12,
      "receivedDate": "2025-11-06",
      "overdeliveryJustification": "Proveedor envió de más por error",
      "observations": "2 unidades extra recibidas"
    }
  ]
}
```

**Campos:**
- `poItemId`: Requerido
- `quantityReceived`: Requerido (mín 0.01)
- `receivedDate`: Requerido (formato YYYY-MM-DD)
- `observations`: Opcional
- `overdeliveryJustification`: **Requerido si la cantidad excede la cantidad pendiente**

**Response (201):**
```json
{
  "requisitionId": 1,
  "status": "en_recepcion",
  "receipts": [...]
}
```

**Notas:**
- Se permiten recepciones parciales
- Se permite sobre-entrega con justificación
- Estado cambia a "en_recepcion" después de primera recepción
- Estado cambia a "recepcion_completa" cuando todos los items están completamente recibidos

---

### 3.17 Update Material Receipt
- **Endpoint:** `PATCH /purchases/requisitions/:id/receipts/:receiptId`
- **Descripción:** Actualizar/corregir recepción de material existente
- **Autenticación:** Sí
- **Roles Permitidos:** Solo creador

**Request Body:**
```json
{
  "quantityReceived": 8,
  "receivedDate": "2025-11-07",
  "observations": "Cantidad corregida después de reconteo",
  "overdeliveryJustification": "Actualización de conteo"
}
```

**Campos:** Todos opcionales
- `quantityReceived`: Número (mín 0.01)
- `receivedDate`: Fecha (YYYY-MM-DD)
- `observations`: String
- `overdeliveryJustification`: String (requerido si nueva cantidad causa sobre-entrega)

**Response (200):**
```json
{
  "receiptId": 1,
  "poItemId": 1,
  "quantityReceived": 8,
  "receivedDate": "2025-11-07",
  "observations": "Cantidad corregida después de reconteo"
}
```

---

## 4. MÓDULO DE PROVEEDORES

**Base Route:** `/suppliers`

### 4.1 Create Supplier
- **Endpoint:** `POST /suppliers`
- **Descripción:** Crear nuevo proveedor
- **Autenticación:** Sí

**Request Body:**
```json
{
  "name": "Proveedor Eléctrico S.A.S.",
  "nitCc": "900123456-7",
  "phone": "3001234567",
  "address": "Calle 123 #45-67",
  "city": "Bogotá",
  "email": "contacto@proveedor.com",
  "contactPerson": "Juan Pérez"
}
```

**Campos:**
- `name`: Requerido, máx 200 chars
- `nitCc`: Requerido, máx 50 chars, debe ser único
- `phone`: Requerido, máx 50 chars
- `address`: Requerido, máx 200 chars
- `city`: Requerido, máx 100 chars
- `email`: Opcional, email válido, máx 100 chars
- `contactPerson`: Opcional, máx 100 chars

**Response (201):**
```json
{
  "supplierId": 1,
  "name": "Proveedor Eléctrico S.A.S.",
  "nitCc": "900123456-7",
  "phone": "3001234567",
  "address": "Calle 123 #45-67",
  "city": "Bogotá",
  "email": "contacto@proveedor.com",
  "contactPerson": "Juan Pérez",
  "isActive": true
}
```

---

### 4.2 Get All Suppliers
- **Endpoint:** `GET /suppliers`
- **Descripción:** Obtener lista de todos los proveedores
- **Autenticación:** Sí
- **Query Parameters:**
  - `activeOnly`: Opcional, default "true", acepta "true" o "false"

**Ejemplos:**
- Solo activos: `GET /suppliers` o `GET /suppliers?activeOnly=true`
- Todos (incluyendo inactivos): `GET /suppliers?activeOnly=false`

**Response (200):**
```json
[
  {
    "supplierId": 1,
    "name": "Proveedor Eléctrico S.A.S.",
    "nitCc": "900123456-7",
    "phone": "3001234567",
    "city": "Bogotá",
    "isActive": true
  }
]
```

---

### 4.3 Search Suppliers
- **Endpoint:** `GET /suppliers/search`
- **Descripción:** Buscar proveedores por nombre, NIT, o ciudad
- **Autenticación:** Sí
- **Query Parameters:**
  - `q`: Requerido, término de búsqueda

**Ejemplo:**
- `GET /suppliers/search?q=eléctrico`

**Response (200):**
```json
[
  {
    "supplierId": 1,
    "name": "Proveedor Eléctrico S.A.S.",
    "nitCc": "900123456-7",
    "city": "Bogotá",
    "isActive": true
  }
]
```

**Notas:**
- Búsqueda case-insensitive
- Busca en: name, nitCc, city
- Solo retorna proveedores activos

---

### 4.4 Get Supplier by ID
- **Endpoint:** `GET /suppliers/:id`
- **Descripción:** Obtener detalles de un proveedor específico
- **Autenticación:** Sí

**Response (200):**
```json
{
  "supplierId": 1,
  "name": "Proveedor Eléctrico S.A.S.",
  "nitCc": "900123456-7",
  "phone": "3001234567",
  "address": "Calle 123 #45-67",
  "city": "Bogotá",
  "email": "contacto@proveedor.com",
  "contactPerson": "Juan Pérez",
  "isActive": true
}
```

---

### 4.5 Update Supplier
- **Endpoint:** `PUT /suppliers/:id`
- **Descripción:** Actualizar proveedor existente
- **Autenticación:** Sí

**Request Body:** Igual que Create Supplier (todos los campos opcionales)
```json
{
  "name": "Proveedor Eléctrico S.A.S.",
  "phone": "3009876543",
  "email": "nuevo@proveedor.com"
}
```

**Response (200):**
```json
{
  "supplierId": 1,
  "name": "Proveedor Eléctrico S.A.S.",
  "phone": "3009876543",
  "email": "nuevo@proveedor.com",
  "isActive": true
}
```

**Notas:**
- Si se actualiza NIT, debe permanecer único
- No se puede actualizar a un NIT duplicado

---

### 4.6 Delete Supplier (Soft Delete)
- **Endpoint:** `DELETE /suppliers/:id`
- **Descripción:** Desactivar proveedor (eliminación lógica)
- **Autenticación:** Sí

**Response (200):**
```json
{
  "message": "Proveedor desactivado exitosamente"
}
```

**Notas:**
- Eliminación lógica: establece `isActive = false`
- El proveedor no se elimina de la base de datos
- Oculto de los listados activos

---

## 📊 RESUMEN DE ENDPOINTS

### Total: 33 Endpoints

#### Autenticación (3)
1. POST /auth/login
2. POST /auth/refresh
3. GET /auth/profile

#### Datos Maestros (7)
4. GET /purchases/master-data/companies
5. GET /purchases/master-data/projects
6. GET /purchases/master-data/operation-centers
7. GET /purchases/master-data/project-codes
8. GET /purchases/master-data/material-groups
9. GET /purchases/master-data/materials
10. GET /purchases/master-data/statuses

#### Requisiciones (17)
11. POST /purchases/requisitions
12. GET /purchases/requisitions/my-requisitions
13. GET /purchases/requisitions/pending-actions
14. GET /purchases/requisitions/for-quotation
15. GET /purchases/requisitions/my-pending-receipts
16. GET /purchases/requisitions/:id
17. PATCH /purchases/requisitions/:id
18. DELETE /purchases/requisitions/:id
19. POST /purchases/requisitions/:id/review
20. POST /purchases/requisitions/:id/approve
21. POST /purchases/requisitions/:id/reject
22. GET /purchases/requisitions/:id/quotation
23. POST /purchases/requisitions/:id/quotation
24. POST /purchases/requisitions/:id/purchase-orders
25. GET /purchases/requisitions/:id/receipts
26. POST /purchases/requisitions/:id/receipts
27. PATCH /purchases/requisitions/:id/receipts/:receiptId

#### Proveedores (6)
28. POST /suppliers
29. GET /suppliers
30. GET /suppliers/search
31. GET /suppliers/:id
32. PUT /suppliers/:id
33. DELETE /suppliers/:id

---

## 🔒 CONTROL DE ACCESO BASADO EN ROLES

### Endpoints Públicos (Sin Autenticación)
- POST /auth/login
- POST /auth/refresh

### Todos los Usuarios Autenticados
- GET /auth/profile
- Todos los endpoints de datos maestros
- Endpoints GET de proveedores

### Analistas PMO, PQRS, Directores (Pueden Crear)
- POST /purchases/requisitions

### Directores (Revisión Nivel 1)
- GET /purchases/requisitions/pending-actions
- POST /purchases/requisitions/:id/review

### Gerencia (Aprobación Nivel 2)
- GET /purchases/requisitions/pending-actions
- POST /purchases/requisitions/:id/approve
- POST /purchases/requisitions/:id/reject

### Compras Únicamente
- GET /purchases/requisitions/for-quotation
- GET /purchases/requisitions/:id/quotation
- POST /purchases/requisitions/:id/quotation
- POST /purchases/requisitions/:id/purchase-orders

### Solo Creador (Usuario que creó la requisición)
- PATCH /purchases/requisitions/:id (si el estado lo permite)
- DELETE /purchases/requisitions/:id (si estado es pendiente)
- GET /purchases/requisitions/:id/receipts
- POST /purchases/requisitions/:id/receipts
- PATCH /purchases/requisitions/:id/receipts/:receiptId

---

## ⚠️ RESPUESTAS DE ERROR

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["Mensajes detallados de error de validación"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Token inválido o expirado",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "No tienes permiso para acceder a este recurso",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Recurso no encontrado",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Error interno del servidor",
  "error": "Internal Server Error"
}
```

---

## 📝 NOTAS IMPORTANTES

1. **Rate Limiting:** Todos los endpoints están limitados a 10 solicitudes por 60 segundos por dirección IP

2. **Timestamps:** Todas las fechas/horas se retornan en formato ISO 8601 (UTC)

3. **Paginación:** La mayoría de endpoints de lista soportan paginación con parámetros `page` y `limit`

4. **Filtrado:** Los endpoints de lista soportan varios filtros como `status`, `fromDate`, `toDate`, `projectId`

5. **Flujo de Requisiciones:**
   - Crear (Analista/PQRS) → Pendiente
   - Revisar (Director) → Aprobada/Rechazada por Revisor
   - Aprobar (Gerencia) → Aprobada por Gerencia
   - Cotización (Compras) → En Cotización → Cotizada
   - Órdenes de Compra (Compras) → Pendiente Recepción
   - Recepción Material (Creador) → En Recepción → Recepción Completa

6. **Numeración Automática:**
   - Requisiciones: Basado en prefijo de empresa/proyecto + secuencia
   - Órdenes de Compra: Basado en centro de operación + tipo (OC/OS) + secuencia

7. **JWT Tokens:**
   - Access Token: Válido por 1 hora
   - Refresh Token: Válido por 7 días
