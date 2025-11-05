# Diseño de Base de Datos - Canalco

## Modelo Entidad-Relación

### Principios de Diseño

1. **Normalización**: Base de datos normalizada hasta 3NF
2. **Auditoría completa**: Todas las tablas principales incluyen campos de auditoría
3. **Soft deletes**: Eliminación lógica, no física
4. **UUIDs**: Identificadores únicos para seguridad
5. **Timestamps**: Control de creación y modificación
6. **Relaciones claras**: Foreign keys con cascadas apropiadas

---

## Módulo: Usuarios y Autenticación

> Nota Sprint Autenticación 1.0: Las tablas implementadas en esta fase se encuentran en el esquema `auth` con claves enteras secuenciales según `database/migrations/001_create_auth_schema.sql`. La estructura conceptual continúa alineada con el diseño original descrito a continuación.

### Tabla: users
**Esquema**: `auth`

Almacena información de usuarios del sistema.

```sql
users
├── id (UUID, PK)
├── username (VARCHAR(50), UNIQUE, NOT NULL)
├── email (VARCHAR(100), UNIQUE, NOT NULL)
├── password_hash (VARCHAR(255), NOT NULL)
├── first_name (VARCHAR(100), NOT NULL)
├── last_name (VARCHAR(100), NOT NULL)
├── phone (VARCHAR(20))
├── department (VARCHAR(100))
├── position (VARCHAR(100))
├── is_active (BOOLEAN, DEFAULT true)
├── is_superuser (BOOLEAN, DEFAULT false)
├── last_login (TIMESTAMP)
├── created_at (TIMESTAMP, DEFAULT NOW())
├── updated_at (TIMESTAMP)
├── created_by (UUID, FK -> users.id)
└── updated_by (UUID, FK -> users.id)
```

**Índices**:
- `idx_users_username` (username)
- `idx_users_email` (email)
- `idx_users_is_active` (is_active)

### Tabla: roles
Define roles en el sistema.

```sql
roles
├── id (UUID, PK)
├── name (VARCHAR(50), UNIQUE, NOT NULL)
├── description (TEXT)
├── permissions (JSONB) -- Lista de permisos
├── is_active (BOOLEAN, DEFAULT true)
├── created_at (TIMESTAMP, DEFAULT NOW())
└── updated_at (TIMESTAMP)
```

**Roles predefinidos**:
- Administrador
- Gerente
- Jefe de Departamento
- Solicitante
- Comprador
- Almacenista
- Contador
- Auditor (solo lectura)

### Tabla: user_roles
Relación muchos a muchos entre usuarios y roles.

```sql
user_roles
├── id (UUID, PK)
├── user_id (UUID, FK -> users.id, NOT NULL)
├── role_id (UUID, FK -> roles.id, NOT NULL)
├── assigned_at (TIMESTAMP, DEFAULT NOW())
└── assigned_by (UUID, FK -> users.id)

UNIQUE(user_id, role_id)
```

### Tabla: modulos
Define las áreas funcionales globales del sistema.

```sql
modulos
├── modulo_id (SERIAL, PK)
├── clave (VARCHAR(50), UNIQUE, NOT NULL)
├── nombre (VARCHAR(100), NOT NULL)
├── descripcion (TEXT)
├── icono (VARCHAR(120))
├── es_activo (BOOLEAN, DEFAULT true)
├── orden (INTEGER, DEFAULT 0)
├── creado_en (TIMESTAMP, DEFAULT NOW())
└── actualizado_en (TIMESTAMP, DEFAULT NOW())
```

### Tabla: categorias
Subdivisiones dentro de cada módulo.

```sql
categorias
├── categoria_id (SERIAL, PK)
├── modulo_id (INT, FK -> modulos.modulo_id, ON DELETE CASCADE)
├── clave (VARCHAR(50), NOT NULL)
├── nombre (VARCHAR(100), NOT NULL)
├── descripcion (TEXT)
├── es_activo (BOOLEAN, DEFAULT true)
├── orden (INTEGER, DEFAULT 0)
├── creado_en (TIMESTAMP, DEFAULT NOW())
└── actualizado_en (TIMESTAMP, DEFAULT NOW())

UNIQUE(modulo_id, clave)
UNIQUE(modulo_id, nombre)
```

### Tabla: permisos
Catálogo de acciones permitidas en el sistema.

```sql
permisos
├── permiso_id (SERIAL, PK)
├── clave (VARCHAR(100), UNIQUE, NOT NULL)
├── nombre_permiso (VARCHAR(100), UNIQUE, NOT NULL)
├── descripcion (TEXT)
├── es_activo (BOOLEAN, DEFAULT true)
├── creado_en (TIMESTAMP, DEFAULT NOW())
└── actualizado_en (TIMESTAMP, DEFAULT NOW())
```

### Tabla: roles_permisos_modulo_categoria
Asigna permisos a los roles por módulo y categoría.

```sql
roles_permisos_modulo_categoria
├── id (SERIAL, PK)
├── rol_id (INT, FK -> roles.rol_id, ON DELETE CASCADE)
├── modulo_id (INT, FK -> modulos.modulo_id, ON DELETE CASCADE)
├── categoria_id (INT, FK -> categorias.categoria_id, ON DELETE CASCADE)
├── permiso_id (INT, FK -> permisos.permiso_id, ON DELETE CASCADE)
├── alcance (VARCHAR(50), DEFAULT 'total')
├── restricciones (JSONB)
├── creado_en (TIMESTAMP, DEFAULT NOW())
└── actualizado_en (TIMESTAMP, DEFAULT NOW())

UNIQUE(rol_id, modulo_id, categoria_id, permiso_id)
```

### Tabla: autorizaciones
Modelo jerárquico de autorizadores y autorizados.

```sql
autorizaciones
├── autorizacion_id (SERIAL, PK)
├── supervisor_id (INT, FK -> users.user_id, ON DELETE CASCADE)
├── subordinado_id (INT, FK -> users.user_id, ON DELETE CASCADE)
├── modulo_id (INT, FK -> modulos.modulo_id)
├── categoria_id (INT, FK -> categorias.categoria_id)
├── tipo (VARCHAR(50), DEFAULT 'aprobacion')
├── nivel (SMALLINT, DEFAULT 1)
├── es_activo (BOOLEAN, DEFAULT true)
├── creado_en (TIMESTAMP, DEFAULT NOW())
└── actualizado_en (TIMESTAMP, DEFAULT NOW())

UNIQUE(supervisor_id, subordinado_id, modulo_id, categoria_id, tipo)
```

### Tabla: bitacora_accesos
Registro de intentos de autenticación y accesos.

```sql
bitacora_accesos
├── bitacora_id (BIGSERIAL, PK)
├── user_id (INT, FK -> users.user_id, ON DELETE SET NULL)
├── email (VARCHAR(120), NOT NULL)
├── resultado (VARCHAR(20), NOT NULL)
├── mensaje (TEXT)
├── ip_origen (INET)
├── user_agent (TEXT)
├── metadata (JSONB)
└── creado_en (TIMESTAMP, DEFAULT NOW())
```

---

## Módulo: Requisiciones

### Tabla: requisitions
Solicitudes de compra generadas por los departamentos.

```sql
requisitions
├── id (UUID, PK)
├── folio (VARCHAR(20), UNIQUE, NOT NULL) -- REQ-2025-0001
├── requester_id (UUID, FK -> users.id, NOT NULL)
├── department (VARCHAR(100), NOT NULL)
├── priority (ENUM: 'low', 'medium', 'high', 'urgent')
├── justification (TEXT, NOT NULL)
├── delivery_date_requested (DATE)
├── delivery_location (VARCHAR(255))
├── status (ENUM: 'draft', 'submitted', 'in_review', 'approved', 'rejected', 'cancelled')
├── approval_level (INTEGER, DEFAULT 0) -- Nivel actual de aprobación
├── total_amount (DECIMAL(12,2))
├── notes (TEXT)
├── submitted_at (TIMESTAMP)
├── approved_at (TIMESTAMP)
├── rejected_at (TIMESTAMP)
├── rejection_reason (TEXT)
├── is_deleted (BOOLEAN, DEFAULT false)
├── created_at (TIMESTAMP, DEFAULT NOW())
├── updated_at (TIMESTAMP)
├── created_by (UUID, FK -> users.id)
└── updated_by (UUID, FK -> users.id)
```

**Índices**:
- `idx_requisitions_folio` (folio)
- `idx_requisitions_status` (status)
- `idx_requisitions_requester` (requester_id)
- `idx_requisitions_created_at` (created_at DESC)

### Tabla: requisition_items
Artículos solicitados en cada requisición.

```sql
requisition_items
├── id (UUID, PK)
├── requisition_id (UUID, FK -> requisitions.id, ON DELETE CASCADE)
├── item_number (INTEGER, NOT NULL) -- Número de partida
├── description (TEXT, NOT NULL)
├── quantity (DECIMAL(10,2), NOT NULL)
├── unit (VARCHAR(20), NOT NULL) -- pza, kg, lt, etc.
├── estimated_unit_price (DECIMAL(10,2))
├── estimated_total (DECIMAL(12,2))
├── specifications (TEXT)
├── category_id (UUID, FK -> categories.id)
├── created_at (TIMESTAMP, DEFAULT NOW())
└── updated_at (TIMESTAMP)

UNIQUE(requisition_id, item_number)
```

**Índices**:
- `idx_requisition_items_requisition` (requisition_id)

### Tabla: requisition_approvals
Seguimiento de aprobaciones por nivel.

```sql
requisition_approvals
├── id (UUID, PK)
├── requisition_id (UUID, FK -> requisitions.id, ON DELETE CASCADE)
├── approval_level (INTEGER, NOT NULL)
├── approver_id (UUID, FK -> users.id, NOT NULL)
├── status (ENUM: 'pending', 'approved', 'rejected')
├── comments (TEXT)
├── approved_at (TIMESTAMP)
├── created_at (TIMESTAMP, DEFAULT NOW())
└── updated_at (TIMESTAMP)

UNIQUE(requisition_id, approval_level)
```

---

## Módulo: Proveedores

### Tabla: suppliers
Catálogo de proveedores.

```sql
suppliers
├── id (UUID, PK)
├── code (VARCHAR(20), UNIQUE, NOT NULL) -- PROV-001
├── business_name (VARCHAR(255), NOT NULL)
├── trade_name (VARCHAR(255))
├── tax_id (VARCHAR(50), UNIQUE, NOT NULL) -- RFC
├── email (VARCHAR(100))
├── phone (VARCHAR(20))
├── website (VARCHAR(255))
├── address (TEXT)
├── city (VARCHAR(100))
├── state (VARCHAR(100))
├── country (VARCHAR(100), DEFAULT 'México')
├── postal_code (VARCHAR(10))
├── contact_name (VARCHAR(200))
├── contact_email (VARCHAR(100))
├── contact_phone (VARCHAR(20))
├── payment_terms (VARCHAR(100)) -- 30 días, contado, etc.
├── payment_method (VARCHAR(50))
├── bank_name (VARCHAR(100))
├── bank_account (VARCHAR(50))
├── rating (DECIMAL(3,2)) -- 0.00 a 5.00
├── is_active (BOOLEAN, DEFAULT true)
├── is_deleted (BOOLEAN, DEFAULT false)
├── notes (TEXT)
├── created_at (TIMESTAMP, DEFAULT NOW())
├── updated_at (TIMESTAMP)
├── created_by (UUID, FK -> users.id)
└── updated_by (UUID, FK -> users.id)
```

**Índices**:
- `idx_suppliers_code` (code)
- `idx_suppliers_tax_id` (tax_id)
- `idx_suppliers_is_active` (is_active)

---

## Módulo: Cotizaciones

### Tabla: quotations
Cotizaciones recibidas de proveedores.

```sql
quotations
├── id (UUID, PK)
├── folio (VARCHAR(20), UNIQUE, NOT NULL) -- COT-2025-0001
├── requisition_id (UUID, FK -> requisitions.id)
├── supplier_id (UUID, FK -> suppliers.id, NOT NULL)
├── quotation_date (DATE, NOT NULL)
├── valid_until (DATE)
├── currency (VARCHAR(3), DEFAULT 'MXN')
├── exchange_rate (DECIMAL(10,4), DEFAULT 1.0)
├── subtotal (DECIMAL(12,2))
├── tax_amount (DECIMAL(12,2))
├── total_amount (DECIMAL(12,2))
├── delivery_time (VARCHAR(100)) -- "5 días hábiles"
├── payment_terms (VARCHAR(100))
├── notes (TEXT)
├── status (ENUM: 'received', 'under_review', 'selected', 'rejected')
├── file_path (VARCHAR(500)) -- Ruta en S3
├── is_deleted (BOOLEAN, DEFAULT false)
├── created_at (TIMESTAMP, DEFAULT NOW())
├── updated_at (TIMESTAMP)
├── created_by (UUID, FK -> users.id)
└── updated_by (UUID, FK -> users.id)
```

**Índices**:
- `idx_quotations_folio` (folio)
- `idx_quotations_requisition` (requisition_id)
- `idx_quotations_supplier` (supplier_id)

### Tabla: quotation_items
Artículos cotizados.

```sql
quotation_items
├── id (UUID, PK)
├── quotation_id (UUID, FK -> quotations.id, ON DELETE CASCADE)
├── requisition_item_id (UUID, FK -> requisition_items.id)
├── item_number (INTEGER, NOT NULL)
├── description (TEXT, NOT NULL)
├── quantity (DECIMAL(10,2), NOT NULL)
├── unit (VARCHAR(20), NOT NULL)
├── unit_price (DECIMAL(10,2), NOT NULL)
├── total_price (DECIMAL(12,2), NOT NULL)
├── brand (VARCHAR(100))
├── model (VARCHAR(100))
├── specifications (TEXT)
├── created_at (TIMESTAMP, DEFAULT NOW())
└── updated_at (TIMESTAMP)

UNIQUE(quotation_id, item_number)
```

---

## Módulo: Órdenes de Compra

### Tabla: purchase_orders
Órdenes de compra generadas.

```sql
purchase_orders
├── id (UUID, PK)
├── folio (VARCHAR(20), UNIQUE, NOT NULL) -- OC-2025-0001
├── requisition_id (UUID, FK -> requisitions.id)
├── quotation_id (UUID, FK -> quotations.id)
├── supplier_id (UUID, FK -> suppliers.id, NOT NULL)
├── order_date (DATE, NOT NULL)
├── delivery_date (DATE)
├── delivery_location (VARCHAR(255))
├── currency (VARCHAR(3), DEFAULT 'MXN')
├── exchange_rate (DECIMAL(10,4), DEFAULT 1.0)
├── subtotal (DECIMAL(12,2), NOT NULL)
├── tax_amount (DECIMAL(12,2), NOT NULL)
├── total_amount (DECIMAL(12,2), NOT NULL)
├── payment_terms (VARCHAR(100))
├── status (ENUM: 'draft', 'sent', 'confirmed', 'in_transit', 'received', 'cancelled')
├── sent_at (TIMESTAMP)
├── confirmed_at (TIMESTAMP)
├── received_at (TIMESTAMP)
├── invoice_required (BOOLEAN, DEFAULT true)
├── notes (TEXT)
├── file_path (VARCHAR(500)) -- PDF generado
├── is_deleted (BOOLEAN, DEFAULT false)
├── created_at (TIMESTAMP, DEFAULT NOW())
├── updated_at (TIMESTAMP)
├── created_by (UUID, FK -> users.id)
└── updated_by (UUID, FK -> users.id)
```

**Índices**:
- `idx_purchase_orders_folio` (folio)
- `idx_purchase_orders_status` (status)
- `idx_purchase_orders_supplier` (supplier_id)

### Tabla: purchase_order_items
Artículos en la orden de compra.

```sql
purchase_order_items
├── id (UUID, PK)
├── purchase_order_id (UUID, FK -> purchase_orders.id, ON DELETE CASCADE)
├── requisition_item_id (UUID, FK -> requisition_items.id)
├── quotation_item_id (UUID, FK -> quotation_items.id)
├── item_number (INTEGER, NOT NULL)
├── description (TEXT, NOT NULL)
├── quantity_ordered (DECIMAL(10,2), NOT NULL)
├── quantity_received (DECIMAL(10,2), DEFAULT 0)
├── unit (VARCHAR(20), NOT NULL)
├── unit_price (DECIMAL(10,2), NOT NULL)
├── total_price (DECIMAL(12,2), NOT NULL)
├── created_at (TIMESTAMP, DEFAULT NOW())
└── updated_at (TIMESTAMP)

UNIQUE(purchase_order_id, item_number)
```

---

## Módulo: Inventarios

### Tabla: categories
Categorías de productos.

```sql
categories
├── id (UUID, PK)
├── code (VARCHAR(20), UNIQUE, NOT NULL)
├── name (VARCHAR(100), NOT NULL)
├── description (TEXT)
├── parent_id (UUID, FK -> categories.id) -- Para subcategorías
├── is_active (BOOLEAN, DEFAULT true)
├── created_at (TIMESTAMP, DEFAULT NOW())
└── updated_at (TIMESTAMP)
```

### Tabla: products
Catálogo de productos en inventario.

```sql
products
├── id (UUID, PK)
├── sku (VARCHAR(50), UNIQUE, NOT NULL)
├── name (VARCHAR(255), NOT NULL)
├── description (TEXT)
├── category_id (UUID, FK -> categories.id)
├── unit (VARCHAR(20), NOT NULL)
├── min_stock (DECIMAL(10,2))
├── max_stock (DECIMAL(10,2))
├── reorder_point (DECIMAL(10,2))
├── current_stock (DECIMAL(10,2), DEFAULT 0)
├── average_cost (DECIMAL(10,2))
├── location (VARCHAR(100))
├── is_active (BOOLEAN, DEFAULT true)
├── is_deleted (BOOLEAN, DEFAULT false)
├── created_at (TIMESTAMP, DEFAULT NOW())
├── updated_at (TIMESTAMP)
├── created_by (UUID, FK -> users.id)
└── updated_by (UUID, FK -> users.id)
```

**Índices**:
- `idx_products_sku` (sku)
- `idx_products_category` (category_id)

### Tabla: inventory_movements
Movimientos de inventario (entradas/salidas).

```sql
inventory_movements
├── id (UUID, PK)
├── product_id (UUID, FK -> products.id, NOT NULL)
├── movement_type (ENUM: 'entry', 'exit', 'adjustment', 'transfer')
├── quantity (DECIMAL(10,2), NOT NULL)
├── unit_cost (DECIMAL(10,2))
├── reference_type (VARCHAR(50)) -- 'purchase_order', 'requisition', etc.
├── reference_id (UUID) -- ID del documento relacionado
├── from_location (VARCHAR(100))
├── to_location (VARCHAR(100))
├── reason (TEXT)
├── user_id (UUID, FK -> users.id, NOT NULL)
├── created_at (TIMESTAMP, DEFAULT NOW())
└── notes (TEXT)
```

**Índices**:
- `idx_inventory_movements_product` (product_id)
- `idx_inventory_movements_created_at` (created_at DESC)

---

## Módulo: Auditoría

### Tabla: audit_logs
Registro completo de todas las acciones en el sistema.

```sql
audit_logs
├── id (UUID, PK)
├── user_id (UUID, FK -> users.id)
├── username (VARCHAR(50)) -- Desnormalizado para histórico
├── action (VARCHAR(50), NOT NULL) -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', etc.
├── module (VARCHAR(50), NOT NULL) -- 'requisitions', 'users', etc.
├── entity_type (VARCHAR(50)) -- Tipo de entidad afectada
├── entity_id (UUID) -- ID de la entidad afectada
├── old_values (JSONB) -- Estado anterior
├── new_values (JSONB) -- Estado nuevo
├── ip_address (VARCHAR(45))
├── user_agent (TEXT)
├── timestamp (TIMESTAMP, DEFAULT NOW())
└── description (TEXT) -- Descripción legible de la acción
```

**Índices**:
- `idx_audit_logs_user` (user_id)
- `idx_audit_logs_timestamp` (timestamp DESC)
- `idx_audit_logs_module` (module)
- `idx_audit_logs_entity` (entity_type, entity_id)

**Particionamiento**: Por mes/año para optimizar consultas históricas.

---

## Módulo: Notificaciones

### Tabla: notifications
Notificaciones en la aplicación.

```sql
notifications
├── id (UUID, PK)
├── user_id (UUID, FK -> users.id, NOT NULL)
├── type (VARCHAR(50), NOT NULL) -- 'requisition_approved', 'new_quotation', etc.
├── title (VARCHAR(200), NOT NULL)
├── message (TEXT, NOT NULL)
├── reference_type (VARCHAR(50))
├── reference_id (UUID)
├── is_read (BOOLEAN, DEFAULT false)
├── read_at (TIMESTAMP)
├── priority (ENUM: 'low', 'medium', 'high')
├── created_at (TIMESTAMP, DEFAULT NOW())
└── expires_at (TIMESTAMP)
```

**Índices**:
- `idx_notifications_user` (user_id, is_read)
- `idx_notifications_created_at` (created_at DESC)

### Tabla: email_logs
Registro de correos enviados.

```sql
email_logs
├── id (UUID, PK)
├── recipient (VARCHAR(100), NOT NULL)
├── subject (VARCHAR(255), NOT NULL)
├── body (TEXT)
├── type (VARCHAR(50)) -- Tipo de notificación
├── reference_type (VARCHAR(50))
├── reference_id (UUID)
├── status (ENUM: 'pending', 'sent', 'failed', 'bounced')
├── sent_at (TIMESTAMP)
├── error_message (TEXT)
├── provider (VARCHAR(20)) -- 'SES', 'SMTP', etc.
├── provider_message_id (VARCHAR(255))
├── created_at (TIMESTAMP, DEFAULT NOW())
└── attempts (INTEGER, DEFAULT 0)
```

**Índices**:
- `idx_email_logs_status` (status)
- `idx_email_logs_created_at` (created_at DESC)

---

## Tablas de Configuración

### Tabla: system_settings
Configuraciones del sistema.

```sql
system_settings
├── id (UUID, PK)
├── key (VARCHAR(100), UNIQUE, NOT NULL)
├── value (TEXT)
├── data_type (ENUM: 'string', 'number', 'boolean', 'json')
├── description (TEXT)
├── is_public (BOOLEAN, DEFAULT false) -- Si está disponible sin autenticación
├── updated_at (TIMESTAMP)
└── updated_by (UUID, FK -> users.id)
```

**Ejemplos de configuraciones**:
- `company_name`
- `company_logo_url`
- `approval_levels_count`
- `auto_approval_threshold`
- `email_notifications_enabled`

### Tabla: approval_workflows
Define flujos de aprobación por tipo de requisición.

```sql
approval_workflows
├── id (UUID, PK)
├── name (VARCHAR(100), NOT NULL)
├── description (TEXT)
├── min_amount (DECIMAL(12,2))
├── max_amount (DECIMAL(12,2))
├── department (VARCHAR(100)) -- NULL = aplica a todos
├── levels (JSONB) -- [{level: 1, role_id: 'uuid', required: true}, ...]
├── is_active (BOOLEAN, DEFAULT true)
├── created_at (TIMESTAMP, DEFAULT NOW())
└── updated_at (TIMESTAMP)
```

---

## Relaciones Principales

```
users ──┬─── requisitions (requester)
        ├─── purchase_orders (created_by)
        ├─── audit_logs (user)
        └─── notifications (recipient)

requisitions ──┬─── requisition_items
               ├─── requisition_approvals
               ├─── quotations
               └─── purchase_orders

suppliers ──┬─── quotations
            └─── purchase_orders

quotations ──┬─── quotation_items
             └─── purchase_orders

purchase_orders ──┬─── purchase_order_items
                  └─── inventory_movements

products ──┬─── inventory_movements
           └─── requisition_items (indirecto)

categories ──── products
```

---

## Triggers y Funciones Automáticas

### 1. Auto-actualización de timestamps
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

Aplicar a todas las tablas con `updated_at`.

### 2. Auditoría automática
Trigger para registrar cambios en `audit_logs` automáticamente.

### 3. Actualización de stock
Trigger para actualizar `products.current_stock` al insertar en `inventory_movements`.

### 4. Cálculo de totales
Trigger para calcular automáticamente totales en requisiciones, cotizaciones y OC.

---

## Vistas Útiles

### vista: v_requisitions_summary
Resumen de requisiciones con información relacionada.

### vista: v_purchase_orders_pending
Órdenes de compra pendientes de recepción.

### vista: v_low_stock_products
Productos bajo su punto de reorden.

### vista: v_supplier_performance
Desempeño de proveedores (entregas a tiempo, calidad, etc.).

---

## Próximos Pasos

1. ✅ Definir esquema de base de datos
2. ⏳ Crear scripts de migración inicial
3. ⏳ Definir datos semilla (roles, categorías, configuraciones)
4. ⏳ Implementar triggers y funciones
5. ⏳ Crear vistas para reportes comunes
