# Análisis Completo del Módulo de Cotizaciones

**Fecha**: 2025-11-09
**Versión**: 1.0
**Autor**: Claude Code Analysis

---

## 📋 Índice

1. [Visión General](#visión-general)
2. [Arquitectura de Base de Datos](#arquitectura-de-base-de-datos)
3. [Flujo de Negocio](#flujo-de-negocio)
4. [Backend - API](#backend---api)
5. [Frontend - UI](#frontend---ui)
6. [Casos de Uso](#casos-de-uso)
7. [Diagrama de Flujo](#diagrama-de-flujo)

---

## 1. Visión General

El módulo de cotizaciones permite al departamento de **Compras** gestionar proveedores y cotizaciones para las requisiciones que han sido aprobadas por Gerencia.

### Objetivo Principal
Asignar proveedores (hasta 2 por ítem) o marcar ítems como "no requiere cotización" antes de generar órdenes de compra.

### Roles Involucrados
- **Compras**: Único rol con acceso al módulo de cotizaciones
- **Analistas/PQRS/Directores**: Crean requisiciones
- **Directores**: Revisan requisiciones (nivel 1)
- **Gerencia**: Aprueban requisiciones (nivel 2)

---

## 2. Arquitectura de Base de Datos

### 2.1 Tabla: `suppliers` (Proveedores)

```sql
CREATE TABLE suppliers (
  supplier_id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  nit_cc VARCHAR(50) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address VARCHAR(200) NOT NULL,
  city VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  contact_person VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**Propósito**: Almacena información de proveedores disponibles para cotizaciones.

**Campos clave**:
- `nit_cc`: NIT o CC del proveedor (identificador fiscal)
- `is_active`: Permite desactivar proveedores sin eliminarlos
- `contact_person`: Persona de contacto en el proveedor

### 2.2 Tabla: `requisition_item_quotations` (Cotizaciones por Ítem)

```sql
CREATE TABLE requisition_item_quotations (
  quotation_id SERIAL PRIMARY KEY,
  requisition_item_id INTEGER NOT NULL,
  action VARCHAR(20) NOT NULL,           -- 'cotizar' | 'no_requiere'
  supplier_id INTEGER,                   -- NULL si action = 'no_requiere'
  supplier_order SMALLINT DEFAULT 1,     -- 1 = primer proveedor, 2 = segundo
  justification TEXT,                    -- Obligatorio si action = 'no_requiere'
  observations TEXT,                     -- Opcional
  version INTEGER DEFAULT 1,             -- Versionamiento
  is_active BOOLEAN DEFAULT true,        -- Solo la versión activa es válida
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (requisition_item_id) REFERENCES requisition_items(item_id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
  FOREIGN KEY (created_by) REFERENCES users(user_id)
);
```

**Propósito**: Almacena las cotizaciones asignadas a cada ítem de una requisición.

**Características importantes**:

1. **Múltiples Proveedores por Ítem**:
   - Se pueden tener hasta 2 proveedores por ítem
   - `supplier_order` determina si es el 1º o 2º proveedor
   - Cada proveedor se almacena en un registro separado

2. **Versionamiento**:
   - Cada vez que se cambian los proveedores de un ítem, se crea una nueva versión
   - Las versiones anteriores se marcan como `is_active = false`
   - Solo la versión activa más reciente se considera válida

3. **Dos Acciones Posibles**:
   - **`cotizar`**: Se asignan proveedores (1 o 2)
   - **`no_requiere`**: No se cotiza (requiere justificación)

### 2.3 Relaciones

```
requisitions
    └─── requisition_items
            └─── requisition_item_quotations
                    └─── suppliers
```

**Cascade DELETE**: Si se elimina un ítem de requisición, sus cotizaciones también se eliminan automáticamente.

---

## 3. Flujo de Negocio

### 3.1 Estados de una Requisición

```
pendiente → en_revision → aprobada_revisor → aprobada_gerencia
                                                    ↓
                                            [MÓDULO COTIZACIONES]
                                                    ↓
                                            en_cotizacion → cotizada
                                                              ↓
                                                    en_orden_compra
```

### 3.2 Flujo Detallado del Módulo

#### Paso 1: Requisición Aprobada por Gerencia

- Estado inicial: `aprobada_gerencia`
- La requisición aparece en la lista de "Cotizaciones" para el rol Compras

#### Paso 2: Compras Gestiona Cotizaciones

Para cada ítem de la requisición, Compras debe elegir una de dos acciones:

**Opción A: Cotizar**
1. Seleccionar al menos 1 proveedor (máximo 2)
2. Asignar orden (1º o 2º)
3. Opcionalmente agregar observaciones por proveedor

**Opción B: No Requiere Cotización**
1. Marcar como "No Requiere"
2. Proporcionar justificación obligatoria (ej: "Material en inventario")

#### Paso 3: Cambios de Estado Automáticos

- **Primera asignación**: `aprobada_gerencia` → `en_cotizacion`
- **Todos los ítems con acción asignada**: `en_cotizacion` → `cotizada`

#### Paso 4: Versionamiento

Si se cambian los proveedores de un ítem:
1. Se desactivan las cotizaciones anteriores (`is_active = false`)
2. Se crea una nueva versión con `version = version + 1`
3. Se registra log de la acción

---

## 4. Backend - API

### 4.1 Endpoints de Cotización

#### GET `/api/purchases/requisitions/for-quotation`

**Descripción**: Lista todas las requisiciones aprobadas por gerencia listas para cotizar.

**Permisos**: Solo rol `Compras`

**Query Parameters**:
```typescript
{
  page?: number,      // Página actual (default: 1)
  limit?: number,     // Registros por página (default: 10)
  status?: string,    // Filtrar por estado
  projectId?: number, // Filtrar por proyecto
  fromDate?: string,  // Fecha desde
  toDate?: string     // Fecha hasta
}
```

**Response**:
```json
{
  "data": [
    {
      "requisitionId": 1,
      "requisitionNumber": "CB-0001",
      "status": { "code": "aprobada_gerencia", "name": "Aprobada por Gerencia" },
      "company": { "name": "Canales & Contactos" },
      "project": { "name": "Ciudad Bolívar" },
      "items": [
        {
          "itemId": 1,
          "material": { "code": "3047", "description": "Proyector LED de 205W" },
          "quantity": 10
        }
      ]
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

#### GET `/api/purchases/requisitions/:id/quotation`

**Descripción**: Obtiene detalle de una requisición con sus cotizaciones activas.

**Permisos**: Solo rol `Compras`

**Estados válidos**: `aprobada_gerencia`, `en_cotizacion`

**Response**:
```json
{
  "requisitionId": 1,
  "requisitionNumber": "CB-0001",
  "items": [
    {
      "itemId": 1,
      "material": { "code": "3047", "description": "Proyector LED de 205W" },
      "quantity": 10,
      "quotations": [
        {
          "quotationId": 1,
          "action": "cotizar",
          "supplierOrder": 1,
          "supplier": {
            "supplierId": 3,
            "name": "Materiales Eléctricos Express S.A",
            "nitCc": "700555888-9"
          },
          "observations": "Solicitar entrega en 5 días",
          "version": 1,
          "isActive": true
        },
        {
          "quotationId": 2,
          "action": "cotizar",
          "supplierOrder": 2,
          "supplier": {
            "supplierId": 7,
            "name": "Suministros Colombia Ltda",
            "nitCc": "800987654-3"
          },
          "version": 1,
          "isActive": true
        }
      ]
    }
  ]
}
```

#### POST `/api/purchases/requisitions/:id/quotation`

**Descripción**: Gestiona cotizaciones de una requisición (crear/actualizar).

**Permisos**: Solo rol `Compras`

**Estados válidos**: `aprobada_gerencia`, `en_cotizacion`

**Request Body**:
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

**Validaciones**:
- `action` debe ser `'cotizar'` o `'no_requiere'`
- Si `action = 'cotizar'`: mínimo 1, máximo 2 proveedores
- Si `action = 'no_requiere'`: justification es obligatoria
- Los proveedores deben existir y estar activos (`is_active = true`)

**Response**: Igual que GET `/quotation` pero con datos actualizados

### 4.2 Lógica de Servicio (purchases.service.ts)

#### Método: `manageQuotation()`

**Ubicación**: [purchases.service.ts:1052-1265](backend-nestjs/src/modules/purchases/purchases.service.ts#L1052-L1265)

**Flujo**:

1. **Validar permisos**: Usuario debe ser rol `Compras`

2. **Validar estado**: Requisición debe estar en `aprobada_gerencia` o `en_cotizacion`

3. **Iniciar transacción**: Usar QueryRunner para atomicidad

4. **Por cada ítem**:
   - Obtener cotizaciones activas actuales
   - Determinar si hay cambios en proveedores
   - Si hay cambios o cambio de acción:
     - Desactivar versiones anteriores (`is_active = false`)
     - Incrementar número de versión
   - Crear nuevas cotizaciones activas

5. **Verificar completitud**:
   ```typescript
   const totalItems = requisition.items.length;
   const itemsWithAction = (count distinct itemIds with active quotations);

   if (itemsWithAction === totalItems) {
     newStatus = 'cotizada';
   } else {
     newStatus = 'en_cotizacion';
   }
   ```

6. **Actualizar estado** de la requisición

7. **Registrar log** de la acción

8. **Commit transacción**

9. **Retornar** requisición actualizada con cotizaciones

---

## 5. Frontend - UI

### 5.1 Página: CotizacionesPage.tsx

**Ruta**: `/dashboard/compras/cotizaciones`

**Propósito**: Listar todas las requisiciones disponibles para cotización.

**Componentes principales**:
- Tabla con requisiciones en estados: `aprobada_gerencia`, `en_cotizacion`, `cotizada`
- Badges de color por estado:
  - Verde (`emerald`): Aprobada por Gerencia
  - Azul (`blue`): En Cotización
  - Índigo (`indigo`): Cotizada
- Botones de acción:
  - **Gestionar**: Abre GestionarCotizacionPage
  - **Ver**: Abre detalle de requisición

**Estados manejados**:
```typescript
const STATUS_COLORS = {
  aprobada_gerencia: 'bg-emerald-100 text-emerald-800',
  en_cotizacion: 'bg-blue-100 text-blue-800',
  cotizada: 'bg-indigo-100 text-indigo-800',
};
```

### 5.2 Página: GestionarCotizacionPage.tsx

**Ruta**: `/dashboard/compras/cotizaciones/gestionar/:requisitionId`

**Propósito**: Asignar proveedores y acciones a cada ítem de una requisición.

#### Estado del Componente

```typescript
interface ItemQuotationState {
  itemId: number;
  action: 'cotizar' | 'no_requiere' | '';
  suppliers: Array<{
    supplier: Supplier | null;
    supplierOrder: number;
    observations: string;
  }>;
  justification: string;
  searchQuery1: string;
  searchQuery2: string;
  searchResults1: Supplier[];
  searchResults2: Supplier[];
  showResults1: boolean;
  showResults2: boolean;
}
```

#### Funcionalidades

**1. Inicialización**:
- Carga la requisición con `getRequisitionQuotation()`
- Si ya tiene cotizaciones, las muestra pre-cargadas
- Si no tiene cotizaciones, inicializa estado vacío

**2. Búsqueda de Proveedores**:
- Input de búsqueda con autocompletar
- Búsqueda en tiempo real usando `suppliersService.search()`
- Muestra resultados en dropdown
- Permite seleccionar proveedor

**3. Selección de Acción**:
- Select con opciones: "Cotizar" o "No Requiere Cotización"
- Si elige "Cotizar": muestra campos de proveedores
- Si elige "No Requiere": muestra campo de justificación

**4. Asignación de Proveedores**:
```typescript
// Proveedor 1º (obligatorio si action = 'cotizar')
<div className="supplier-1">
  <Input
    placeholder="Buscar proveedor..."
    onChange={handleSearch1}
  />
  {state.suppliers[0].supplier && (
    <div className="selected-supplier">
      <p>{supplier.name}</p>
      <p>NIT: {supplier.nitCc}</p> {/* ✅ NIT se muestra aquí */}
    </div>
  )}
  <Textarea
    placeholder="Observaciones..."
    value={state.suppliers[0].observations}
  />
</div>

// Proveedor 2º (opcional)
<div className="supplier-2">
  {/* Mismo patrón */}
</div>
```

**5. Validación**:
```typescript
const validateForm = (): string | null => {
  for (const [itemId, state] of Object.entries(itemStates)) {
    if (!state.action) {
      return 'Debe seleccionar una acción para todos los ítems';
    }

    if (state.action === 'cotizar') {
      // ✅ Solo requiere AL MENOS un proveedor (no ambos)
      const hasSuppliers = state.suppliers.some(s => s.supplier !== null);
      if (!hasSuppliers) {
        return 'Debe seleccionar al menos un proveedor';
      }
    }

    if (state.action === 'no_requiere') {
      if (!state.justification.trim()) {
        return 'Debe proporcionar justificación';
      }
    }
  }
  return null;
};
```

**6. Cálculo de Progreso**:
```typescript
const calculateProgress = () => {
  const total = Object.keys(itemStates).length;
  const completed = Object.values(itemStates).filter(state => {
    if (!state.action) return false;

    if (state.action === 'cotizar') {
      return state.suppliers.some(s => s.supplier !== null);
    }

    if (state.action === 'no_requiere') {
      return state.justification.trim().length > 0;
    }

    return false;
  }).length;

  return { completed, total, percentage: Math.round((completed / total) * 100) };
};
```

**7. Guardar Cotizaciones**:
```typescript
const handleSave = async () => {
  const error = validateForm();
  if (error) {
    toast.error(error);
    return;
  }

  const items: ItemQuotationDto[] = Object.values(itemStates).map(state => ({
    itemId: state.itemId,
    action: state.action,
    ...(state.action === 'cotizar' && {
      suppliers: state.suppliers
        .filter(s => s.supplier !== null)
        .map(s => ({
          supplierId: s.supplier!.supplierId,
          supplierOrder: s.supplierOrder,
          observations: s.observations
        }))
    }),
    ...(state.action === 'no_requiere' && {
      justification: state.justification
    })
  }));

  await manageQuotation(requisitionId, { items });
  toast.success('Cotizaciones guardadas exitosamente');
  navigate('/dashboard/compras/cotizaciones');
};
```

### 5.3 Servicio: quotation.service.ts

**Ubicación**: [frontend-app/src/services/quotation.service.ts](frontend-app/src/services/quotation.service.ts)

**Métodos**:

```typescript
// Obtener requisiciones para cotizar
export const getRequisitionsForQuotation = async (
  filters?: FilterRequisitionsDto
): Promise<PaginatedResponse<Requisition>>;

// Obtener detalle con cotizaciones
export const getRequisitionQuotation = async (
  requisitionId: number
): Promise<RequisitionWithQuotations>;

// Gestionar cotizaciones
export const manageQuotation = async (
  requisitionId: number,
  data: ManageQuotationDto
): Promise<RequisitionWithQuotations>;
```

---

## 6. Casos de Uso

### Caso 1: Cotizar Ítem con 2 Proveedores

**Escenario**: Ítem nuevo sin cotizaciones previas

**Pasos**:
1. Usuario de Compras accede a "Cotizaciones"
2. Hace clic en "Gestionar" de requisición CB-0001
3. Para el ítem 1 (Proyector LED):
   - Selecciona acción: "Cotizar"
   - Busca y selecciona Proveedor 1º: "Materiales Eléctricos Express"
   - Ve el NIT automáticamente: "700555888-9"
   - Agrega observación: "Solicitar entrega en 5 días"
   - Busca y selecciona Proveedor 2º: "Suministros Colombia"
   - Ve el NIT automáticamente: "800987654-3"
4. Guarda cotizaciones
5. Backend crea 2 registros:
   ```sql
   INSERT INTO requisition_item_quotations (...)
   VALUES
     (1, 1, 'cotizar', 3, 1, NULL, 'Solicitar...', 1, true, 27),
     (1, 1, 'cotizar', 7, 2, NULL, NULL, 1, true, 27);
   ```
6. Estado cambia a `en_cotizacion`

### Caso 2: Marcar Ítem como "No Requiere"

**Escenario**: Material ya disponible en inventario

**Pasos**:
1. Para el ítem 2 (Cable):
   - Selecciona acción: "No Requiere Cotización"
   - Escribe justificación: "Material disponible en inventario"
2. Guarda
3. Backend crea 1 registro:
   ```sql
   INSERT INTO requisition_item_quotations (...)
   VALUES (2, 2, 'no_requiere', NULL, 1, 'Material disponible...', NULL, 1, true, 27);
   ```

### Caso 3: Cambiar Proveedores (Versionamiento)

**Escenario**: Cambiar proveedor después de cotizar

**Estado actual**:
```
Item 1:
  - Quotation 1: supplier=3, order=1, version=1, active=true
  - Quotation 2: supplier=7, order=2, version=1, active=true
```

**Acción**: Cambiar proveedor 1º de ID 3 a ID 5

**Pasos**:
1. Usuario edita cotización
2. Cambia Proveedor 1º a "Ferretería Los Andes" (ID 5)
3. Guarda
4. Backend detecta cambio:
   ```typescript
   currentSupplierIds = [3, 7]
   newSupplierIds = [5, 7]
   needsNewVersion = true
   ```
5. Desactiva versión anterior:
   ```sql
   UPDATE requisition_item_quotations
   SET is_active = false
   WHERE requisition_item_id = 1 AND is_active = true;
   ```
6. Crea nueva versión:
   ```sql
   INSERT INTO requisition_item_quotations (...)
   VALUES
     (1, 1, 'cotizar', 5, 1, NULL, NULL, 2, true, 27),
     (1, 1, 'cotizar', 7, 2, NULL, NULL, 2, true, 27);
   ```

**Estado final**:
```
Item 1:
  - Quotation 1: supplier=3, order=1, version=1, active=false ❌
  - Quotation 2: supplier=7, order=2, version=1, active=false ❌
  - Quotation 3: supplier=5, order=1, version=2, active=true ✅
  - Quotation 4: supplier=7, order=2, version=2, active=true ✅
```

### Caso 4: Completar Todas las Cotizaciones

**Escenario**: Requisición con 3 ítems

**Estado inicial**: `aprobada_gerencia`

**Pasos**:
1. Cotiza ítem 1 → Estado: `en_cotizacion` (1/3 completado)
2. Cotiza ítem 2 → Estado: `en_cotizacion` (2/3 completado)
3. Cotiza ítem 3 → Estado: `cotizada` ✅ (3/3 completado)

**Lógica en backend**:
```typescript
const totalItems = 3;
const itemsWithAction = await countDistinctItemsWithActiveQuotations();
// itemsWithAction = 3

if (itemsWithAction === totalItems) {
  newStatus = 'cotizada'; // ✅
}
```

---

## 7. Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                    MÓDULO DE COTIZACIONES                   │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  Requisición     │
│  aprobada_       │
│  gerencia        │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│ Compras accede a "Cotizaciones"                          │
│ GET /api/purchases/requisitions/for-quotation            │
└────────┬─────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│ Lista de requisiciones aprobadas                         │
│ - CB-0001 (Canales & Contactos - Ciudad Bolívar)        │
│ - GU-0003 (UT Guacarí)                                   │
└────────┬─────────────────────────────────────────────────┘
         │
         ▼ Click "Gestionar"
┌──────────────────────────────────────────────────────────┐
│ GestionarCotizacionPage                                  │
│ GET /api/purchases/requisitions/:id/quotation            │
└────────┬─────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│ Por cada ítem:                                           │
│                                                           │
│ ┌─ Ítem 1: Proyector LED ──────────────────────┐        │
│ │ Acción: [ Cotizar ▼ ]                         │        │
│ │                                                │        │
│ │ Proveedor 1º:                                 │        │
│ │ ┌────────────────────────────────────────┐    │        │
│ │ │ Materiales Eléctricos Express S.A     │    │        │
│ │ │ NIT: 700555888-9                      │    │        │
│ │ └────────────────────────────────────────┘    │        │
│ │ Observaciones: [Solicitar entrega...]         │        │
│ │                                                │        │
│ │ Proveedor 2º:                                 │        │
│ │ ┌────────────────────────────────────────┐    │        │
│ │ │ Suministros Colombia Ltda             │    │        │
│ │ │ NIT: 800987654-3                      │    │        │
│ │ └────────────────────────────────────────┘    │        │
│ │ Observaciones: [Proveedor alternativo]        │        │
│ └────────────────────────────────────────────────┘        │
│                                                           │
│ ┌─ Ítem 2: Cable #10 AWG ──────────────────────┐        │
│ │ Acción: [ No Requiere ▼ ]                     │        │
│ │                                                │        │
│ │ Justificación:                                │        │
│ │ [Material disponible en inventario]           │        │
│ └────────────────────────────────────────────────┘        │
│                                                           │
│ Progreso: [████████░░] 66% (2/3 ítems)                  │
│                                                           │
│ [ Guardar Cotizaciones ]                                 │
└────────┬─────────────────────────────────────────────────┘
         │
         ▼ Click "Guardar"
┌──────────────────────────────────────────────────────────┐
│ POST /api/purchases/requisitions/:id/quotation           │
│                                                           │
│ Body: {                                                  │
│   items: [                                               │
│     {                                                    │
│       itemId: 1,                                         │
│       action: 'cotizar',                                 │
│       suppliers: [                                       │
│         { supplierId: 3, supplierOrder: 1, ... },       │
│         { supplierId: 7, supplierOrder: 2, ... }        │
│       ]                                                  │
│     },                                                   │
│     {                                                    │
│       itemId: 2,                                         │
│       action: 'no_requiere',                             │
│       justification: '...'                               │
│     }                                                    │
│   ]                                                      │
│ }                                                        │
└────────┬─────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│ Backend: manageQuotation()                               │
│                                                           │
│ 1. Validar permisos (rol Compras)                       │
│ 2. Validar estado (aprobada_gerencia | en_cotizacion)   │
│ 3. START TRANSACTION                                     │
│ 4. Para cada ítem:                                       │
│    - Obtener cotizaciones activas actuales              │
│    - Detectar cambios (versionamiento)                  │
│    - Desactivar versiones anteriores si hay cambios     │
│    - Crear nuevas cotizaciones activas                  │
│ 5. Contar ítems con acción:                             │
│    itemsWithAction = 2 de 3 total                       │
│ 6. Determinar estado:                                    │
│    2 ≠ 3 → newStatus = 'en_cotizacion'                  │
│ 7. UPDATE requisitions SET status = 'en_cotizacion'     │
│ 8. INSERT INTO requisition_logs                         │
│ 9. COMMIT                                                │
└────────┬─────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│ ✅ Cotizaciones guardadas                                │
│ Estado: en_cotizacion                                    │
│ Progreso: 2/3 ítems (66%)                                │
└────────┬─────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│ Usuario cotiza ítem 3 (faltante)                         │
└────────┬─────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│ Backend: manageQuotation()                               │
│                                                           │
│ itemsWithAction = 3 de 3 total                          │
│ 3 === 3 → newStatus = 'cotizada' ✅                      │
│ UPDATE requisitions SET status = 'cotizada'              │
└────────┬─────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│ ✅ Requisición completamente cotizada                    │
│ Estado: cotizada                                         │
│ Progreso: 3/3 ítems (100%)                               │
│                                                           │
│ ➡️  Lista para generar Órdenes de Compra                │
└──────────────────────────────────────────────────────────┘
```

---

## 📌 Resumen de Características Clave

### ✅ Características Implementadas

1. **NIT Automático**: Se muestra el NIT del proveedor automáticamente al seleccionarlo ([GestionarCotizacionPage.tsx:589-591](frontend-app/src/pages/GestionarCotizacionPage.tsx#L589-L591), [664-666](frontend-app/src/pages/GestionarCotizacionPage.tsx#L664-L666))

2. **Segundo Proveedor Opcional**: Solo requiere al menos 1 proveedor, el segundo es opcional ([GestionarCotizacionPage.tsx:284-285](frontend-app/src/pages/GestionarCotizacionPage.tsx#L284-L285), [304-307](frontend-app/src/pages/GestionarCotizacionPage.tsx#L304-L307))

3. **Versionamiento**: Al cambiar proveedores, se crea una nueva versión y se desactivan las anteriores

4. **Estados Automáticos**: El sistema cambia automáticamente entre `aprobada_gerencia` → `en_cotizacion` → `cotizada`

5. **Validación Robusta**: No permite guardar sin acción asignada, sin proveedores (si acción=cotizar), o sin justificación (si acción=no_requiere)

6. **Progreso Visual**: Barra de progreso que muestra ítems completados vs totales

7. **Búsqueda de Proveedores**: Autocompletar en tiempo real con resultados filtrados

8. **Transacciones Atómicas**: Uso de QueryRunner para garantizar consistencia de datos

---

## 🔧 Mejoras Potenciales Futuras

1. **Historial de Versiones**: Mostrar versiones anteriores de cotizaciones
2. **Comparación de Precios**: Agregar campo de precio estimado por proveedor
3. **Notificaciones**: Alertar cuando una requisición está lista para cotizar
4. **Reportes**: Dashboard con estadísticas de proveedores más usados
5. **Exportación**: Permitir exportar cotizaciones a Excel/PDF
6. **Tiempo de Entrega**: Agregar campo de tiempo estimado de entrega por proveedor
7. **Calificación de Proveedores**: Sistema de rating basado en desempeño histórico

---

**Fin del Documento**
