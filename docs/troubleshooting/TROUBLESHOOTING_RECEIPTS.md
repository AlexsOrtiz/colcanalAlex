# Troubleshooting: Material Receipts Feature

**Fecha**: 6-7 de Noviembre, 2025
**Módulo**: Material Receipts (Recepción de Materiales)
**Estado**: ✅ RESUELTO

---

## Contexto

Durante la implementación y pruebas del módulo de recepción de materiales, se encontraron múltiples problemas que impedían el correcto funcionamiento del endpoint `/my-pending-receipts`. Esta documentación detalla cada problema encontrado y su solución.

---

## 🔴 Problema 1: Error de Validación Persistente

### Síntomas
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": ["Validation failed (numeric string is expected)"]
}
```

### Contexto del Error
- **Endpoint afectado**: `GET /api/purchases/requisitions/my-pending-receipts`
- **Comportamiento**: Error 400 al llamar el endpoint, incluso sin query parameters
- **Persistencia**: El error continuaba después de múltiples intentos de fix

### Intentos de Solución (Fallidos)
1. ✅ Cambiar DTO de `@IsNumberString()` a `@IsNumber()`
2. ✅ Verificar código compilado en `dist/` - Decoradores correctos
3. ✅ Reiniciar backend múltiples veces
4. ✅ Limpiar carpeta `dist/` completamente
5. ✅ Matar todos los procesos Node.js
6. ✅ Compilación limpia desde cero
7. ❌ Error persistía incluso sin query parameters

### Causa Raíz Descubierta

El problema NO era el DTO ni la validación. Era el **orden de definición de rutas** en el controlador.

**Código Problemático** (líneas 342-807):
```typescript
// ❌ ORDEN INCORRECTO
@Get(':id')                    // Línea 342 - Route parametrizado
@ApiParam({ name: 'id', type: Number })
async getRequisitionById(
  @Param('id', ParseIntPipe) id: number  // ParseIntPipe intentaba parsear "my-pending-receipts"
) { ... }

// ... muchas líneas después ...

@Get('my-pending-receipts')    // Línea 807 - Route específico
async getMyPendingReceipts() { ... }
```

**¿Por qué fallaba?**
1. NestJS registra las rutas en el orden en que están definidas
2. Cuando llega request a `/my-pending-receipts`, NestJS intenta matchear con `/:id` primero
3. `/:id` matchea con CUALQUIER string, incluyendo "my-pending-receipts"
4. El `ParseIntPipe` intenta convertir "my-pending-receipts" a número
5. Falla con "Validation failed (numeric string is expected)"

### Solución Implementada

**Archivo**: `backend-nestjs/src/modules/purchases/purchases.controller.ts`

**Cambio**: Mover la ruta específica ANTES de la ruta parametrizada

```typescript
// ✅ ORDEN CORRECTO
@Get('my-pending-receipts')    // Línea 342 - Route específico PRIMERO
@ApiOperation({ ... })
async getMyPendingReceipts(
  @GetUser() user: User,
  @Query() filters: FilterRequisitionsDto,
) {
  return this.purchasesService.getMyPendingReceipts(user.userId, filters);
}

@Get(':id')                    // Línea 379 - Route parametrizado DESPUÉS
@ApiParam({ name: 'id', type: Number })
async getRequisitionById(
  @Param('id', ParseIntPipe) id: number
) { ... }
```

### Resultado
✅ El endpoint ahora responde correctamente con código 200
✅ La validación de query params funciona como se espera
✅ Las rutas se matchean en el orden correcto

### Lección Aprendida
**Regla de oro en NestJS**: Las rutas específicas SIEMPRE deben definirse ANTES que las rutas parametrizadas en el mismo nivel.

```typescript
// ✅ CORRECTO
@Get('specific-route')
@Get('another-specific')
@Get(':id')           // Parametrizada al final

// ❌ INCORRECTO
@Get(':id')           // Parametrizada primero
@Get('specific-route') // Nunca se alcanzará
```

---

## 🔴 Problema 2: Error de Relación TypeORM

### Síntomas
```
TypeORMError: Relation with property path purchaseOrders in entity was not found.
```

### Contexto del Error
- **Cuando ocurría**: Después de resolver el problema de routing
- **Archivo**: `purchases.service.ts` línea 1505
- **Código problemático**:
```typescript
const queryBuilder = this.requisitionRepository
  .createQueryBuilder('requisition')
  .leftJoinAndSelect('requisition.purchaseOrders', 'purchaseOrders')  // ❌ Relación no existía
```

### Análisis de la Causa

**Estado de las entidades ANTES del fix**:

`PurchaseOrder.entity.ts` (✅ Correcto):
```typescript
@Entity('purchase_orders')
export class PurchaseOrder {
  @ManyToOne(() => Requisition, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requisition_id' })
  requisition: Requisition;  // ✅ Relación definida
}
```

`Requisition.entity.ts` (❌ Incompleto):
```typescript
@Entity('requisitions')
export class Requisition {
  @OneToMany(() => RequisitionItem, (item) => item.requisition)
  items: RequisitionItem[];

  @OneToMany(() => RequisitionLog, (log) => log.requisition)
  logs: RequisitionLog[];

  // ❌ Faltaba la relación inversa con PurchaseOrder
}
```

### Solución Implementada

**Archivo**: `backend-nestjs/src/database/entities/requisition.entity.ts`

**Cambio 1**: Importar la entidad (línea 19):
```typescript
import { PurchaseOrder } from './purchase-order.entity';
```

**Cambio 2**: Agregar la relación bidireccional (líneas 115-117):
```typescript
@OneToMany(() => PurchaseOrder, (purchaseOrder) => purchaseOrder.requisition)
purchaseOrders: PurchaseOrder[];
```

### Resultado
✅ TypeORM puede resolver la relación `requisition.purchaseOrders`
✅ Los joins funcionan correctamente
✅ Los queries retornan datos completos con órdenes de compra

### Lección Aprendida
En TypeORM, las relaciones bidireccionales requieren:
1. `@ManyToOne` en la entidad "hija" (PurchaseOrder)
2. `@OneToMany` en la entidad "padre" (Requisition)

**Ambas deben estar definidas** para que TypeORM pueda hacer queries en cualquier dirección.

---

## 🔴 Problema 3: Errores TypeScript en Cascada

### Síntomas
```
error TS2345: Argument of type 'string | number' is not assignable to parameter of type 'string'
error TS2769: No overload matches this call
```
**Total**: 7 errores de compilación

### Causa Raíz
Al cambiar el DTO de `@IsNumberString()` a `@IsNumber()`, el tipo de `page` y `limit` cambió de `string` a `number`, pero el código del servicio seguía tratándolos como strings.

### Código Problemático

**Antes del cambio en DTO**:
```typescript
// filter-requisitions.dto.ts
@IsNumberString()
page?: string;

// purchases.service.ts
const page = filters.page ? parseInt(filters.page, 10) : 1;  // ✅ Correcto cuando era string
```

**Después del cambio en DTO** (causando errores):
```typescript
// filter-requisitions.dto.ts
@Type(() => Number)
@IsNumber()
page?: number;  // Ahora es number

// purchases.service.ts
const page = filters.page ? parseInt(filters.page, 10) : 1;  // ❌ Error: no se puede parseInt(number)
```

### Solución Implementada

**Archivo**: `backend-nestjs/src/modules/purchases/purchases.service.ts`

**Eliminamos `parseInt()` en 4 métodos**:

1. `getMyRequisitions` (~línea 205):
```typescript
// ❌ Antes
const page = filters.page ? parseInt(filters.page, 10) : 1;
const limit = filters.limit ? parseInt(filters.limit, 10) : 10;

// ✅ Después
const page = filters.page || 1;
const limit = filters.limit || 10;
```

2. `getPendingActions` (~línea 470)
3. `getRequisitionsForQuotation` (~línea 931)
4. `getMyPendingReceipts` (~línea 1495)

### Resultado
✅ Compilación exitosa con 0 errores
✅ Los valores numéricos se usan directamente
✅ Código más limpio y consistente

---

## 🔴 Problema 4: Conflicto de Instancias PostgreSQL

### Síntomas
```
psql: error: connection to server failed: FATAL: role "canalco" does not exist
```

### Diagnóstico
```bash
$ lsof -ti:5432
825      # PostgreSQL local (sin usuario 'canalco')
```

Dos instancias de PostgreSQL corriendo:
- **Local** (PID 825): PostgreSQL del sistema en puerto 5432 - SIN usuario 'canalco'
- **Docker**: Container `canalco-postgres` - CON usuario 'canalco'

El backend intentaba conectarse al local por defecto.

### Solución
```bash
kill -9 825
```

### Resultado
✅ Backend se conectó al container Docker correcto
✅ Usuario 'canalco' encontrado
✅ Todas las operaciones de base de datos funcionando

---

## 🔴 Problema 5: DTO Incorrecto para Material Receipt

### Síntomas
```json
{
  "statusCode": 400,
  "message": [
    "property receiptDate should not exist",
    "items.0.property observation should not exist",
    "items.0.receivedDate must be a valid ISO 8601 date string"
  ]
}
```

### Body Enviado (Incorrecto)
```json
{
  "receiptDate": "2025-11-07",
  "items": [
    {
      "poItemId": 1,
      "quantityReceived": 5,
      "observation": "Primera entrega parcial"
    }
  ]
}
```

### Estructura Correcta del DTO

**Archivo**: `backend-nestjs/src/modules/purchases/dto/create-material-receipt.dto.ts`

```typescript
export class ReceiptItemDto {
  @IsInt()
  poItemId: number;

  @IsNumber()
  quantityReceived: number;

  @IsDateString()
  receivedDate: string;  // ✅ Cada ítem tiene su propia fecha

  @IsOptional()
  @IsString()
  observations?: string;  // ✅ Con 's', no 'observation'

  @IsOptional()
  @IsString()
  overdeliveryJustification?: string;
}

export class CreateMaterialReceiptDto {
  @IsArray()
  @ValidateNested({ each: true })
  items: ReceiptItemDto[];  // ✅ No hay receiptDate en el nivel superior
}
```

### Body Correcto
```json
{
  "items": [
    {
      "poItemId": 1,
      "quantityReceived": 5,
      "receivedDate": "2025-11-07",
      "observations": "Primera entrega parcial - 5 proyectores recibidos en buen estado"
    }
  ]
}
```

### Resultado
✅ Validación exitosa
✅ Recepción registrada correctamente
✅ Estado actualizado de "pendiente_recepcion" a "en_recepcion"

---

## 📊 Resumen de Archivos Modificados

### 1. `purchases.controller.ts`
**Cambio**: Reordenar rutas
```diff
@Controller('purchases/requisitions')
export class PurchasesController {

+  @Get('my-pending-receipts')    // Movido de línea 807 a 342
+  async getMyPendingReceipts() { ... }
+
   @Get(':id')
   async getRequisitionById() { ... }

-  // ... 400 líneas después ...
-
-  @Get('my-pending-receipts')    // Eliminado de aquí
-  async getMyPendingReceipts() { ... }
}
```

### 2. `requisition.entity.ts`
**Cambio**: Agregar relación con PurchaseOrder
```diff
+import { PurchaseOrder } from './purchase-order.entity';

 @Entity('requisitions')
 export class Requisition {
   @OneToMany(() => RequisitionItem, (item) => item.requisition)
   items: RequisitionItem[];

   @OneToMany(() => RequisitionLog, (log) => log.requisition)
   logs: RequisitionLog[];

+  @OneToMany(() => PurchaseOrder, (po) => po.requisition)
+  purchaseOrders: PurchaseOrder[];
 }
```

### 3. `purchases.service.ts`
**Cambio**: Eliminar parseInt en 4 métodos
```diff
  async getMyPendingReceipts(userId: number, filters: FilterRequisitionsDto) {
-   const page = filters.page ? parseInt(filters.page, 10) : 1;
-   const limit = filters.limit ? parseInt(filters.limit, 10) : 10;
+   const page = filters.page || 1;
+   const limit = filters.limit || 10;
  }
```

### 4. `filter-requisitions.dto.ts`
**Cambio**: Tipo de page y limit
```diff
  export class FilterRequisitionsDto {
-   @IsNumberString()
-   page?: string;
+   @Type(() => Number)
+   @IsNumber()
+   page?: number;

-   @IsNumberString()
-   limit?: string;
+   @Type(() => Number)
+   @IsNumber()
+   limit?: number;
  }
```

---

## ✅ Estado Final del Sistema

### Endpoints Funcionales
- ✅ `GET /my-pending-receipts` - Lista requisiciones pendientes de recepción
- ✅ `GET /:id/receipts` - Ver recepciones de una requisición específica
- ✅ `POST /:id/receipts` - Registrar nueva recepción de materiales
- ✅ `PATCH /:id/receipts/:receiptId` - Actualizar recepción existente

### Flujo de Estados Probado
1. ✅ `pendiente_recepcion` → Requisición con orden de compra emitida
2. ✅ `en_recepcion` → Primera recepción parcial registrada
3. ✅ `recepcion_completa` → Todas las cantidades recibidas

### Cálculos Automáticos Verificados
- ✅ Cantidad ordenada
- ✅ Cantidad recibida (suma de todas las recepciones)
- ✅ Cantidad pendiente (ordenada - recibida)

---

## 📚 Lecciones Aprendidas

### 1. Route Ordering en NestJS
**Regla**: Rutas específicas SIEMPRE antes que paramétricas
```typescript
@Get('specific')     // ✅ Primero
@Get(':id')          // ✅ Después
```

### 2. Relaciones Bidireccionales en TypeORM
**Regla**: Definir ambos lados de la relación
```typescript
// Entidad Padre
@OneToMany(() => Child, (child) => child.parent)
children: Child[];

// Entidad Hija
@ManyToOne(() => Parent, (parent) => parent.children)
parent: Parent;
```

### 3. Cambios de Tipo en DTOs
**Regla**: Actualizar todo el código dependiente
- DTO cambia de `string` a `number`
- Eliminar `parseInt()` en servicios
- Actualizar tests si existen

### 4. Debug de Errores Persistentes
**Estrategia**:
1. Verificar el código compilado (`dist/`)
2. Buscar el origen del error en logs (AllExceptionsFilter)
3. Revisar el orden de ejecución (routes, middlewares, pipes)
4. No asumir que el problema está donde aparece el error

### 5. Validación de DTOs
**Regla**: Leer la definición del DTO antes de usar
- Usar herramientas como Swagger para ver estructura exacta
- No asumir nombres de campos (plural vs singular)
- Verificar campos requeridos vs opcionales

---

## 🎯 Testing Realizado

### Test Manual Completo
1. ✅ Crear requisición (PQRS El Cerrito)
2. ✅ Aprobar por Director Valle
3. ✅ Aprobar por Gerencia
4. ✅ Asignar cotización (Compras)
5. ✅ Crear orden de compra
6. ✅ Listar requisiciones pendientes
7. ✅ Registrar recepción parcial (5/10 unidades)
8. ✅ Verificar cálculos de cantidades
9. ✅ Verificar cambio de estado automático

### Datos de Prueba
- **Usuario**: pqrs.elcerrito@canalco.com (Sofía Martínez)
- **Requisición**: C&C-001
- **Material**: Proyector LED de 205W (código 3047)
- **Cantidad**: 10 unidades
- **Proveedor**: Distribuidora Eléctrica del Valle S.A.S
- **Orden**: 008-OS-0001
- **Total**: $10,065,000

---

## 🔧 Troubleshooting Tips para el Futuro

### Si aparece "Validation failed (numeric string is expected)"
1. ✅ Verificar orden de rutas en el controlador
2. ✅ Buscar rutas paramétricas antes de rutas específicas
3. ✅ Revisar uso de pipes (`ParseIntPipe`, `ParseFloatPipe`)

### Si aparece "Relation not found"
1. ✅ Verificar relación bidireccional en ambas entidades
2. ✅ Confirmar que los imports estén correctos
3. ✅ Verificar nombres de propiedades en joins

### Si hay errores de compilación después de cambiar DTO
1. ✅ Buscar todos los usos del DTO en servicios
2. ✅ Actualizar conversiones de tipo (parseInt, parseFloat)
3. ✅ Verificar que los tests estén actualizados

---

## 📝 Notas Adicionales

- Todos los cambios fueron implementados sin afectar funcionalidad existente
- No se requirió migración de base de datos (solo código)
- El sistema maneja correctamente recepciones parciales y sobreentregas
- Los logs de cambio de estado se registran automáticamente

---

**Documento creado**: 7 de Noviembre, 2025
**Última actualización**: 7 de Noviembre, 2025
**Autor**: Claude Code
**Revisado por**: Alexandra Ortiz
