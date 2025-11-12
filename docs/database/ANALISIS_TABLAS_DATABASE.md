# Análisis Completo de Tablas y Relaciones - Base de Datos Canalco

**Fecha Análisis:** 2025-11-06
**Fecha Correcciones:** 2025-11-06
**Total de Entidades:** 25 tablas
**Estado General:** ✅ TODAS LAS RELACIONES CORREGIDAS Y FUNCIONANDO

---

## 🎉 ACTUALIZACIÓN: CORRECCIONES COMPLETADAS

**Estado:** ✅ **TODAS LAS 9 RELACIONES FALTANTES HAN SIDO CORREGIDAS**

- ✅ 9 entidades corregidas
- ✅ 15 relaciones OneToMany agregadas
- ✅ 0 errores de compilación
- ✅ Build exitoso
- ✅ Todas las relaciones bidireccionales funcionando

**Ver detalles completos:** [CORRECCIONES_RELACIONES_DATABASE.md](CORRECCIONES_RELACIONES_DATABASE.md)

---

## 📊 Resumen Ejecutivo

### ✅ Aspectos Positivos
- Todas las tablas tienen claves primarias correctamente definidas
- Tipos de datos consistentes (especialmente decimales para montos)
- Relaciones Many-to-One bien configuradas en su mayoría
- Uso correcto de timestamps automáticos
- Cascade delete configurado donde es necesario
- Índices únicos en campos críticos (email, códigos)

### ⚠️ Problemas Encontrados
1. **9 relaciones bidireccionales incompletas** (falta OneToMany en el lado inverso)
2. **Inconsistencia en convenciones de nombres** (español/inglés, camelCase/snake_case)
3. **Falta de relaciones inversas** que pueden causar problemas en queries con TypeORM

---

## 🔍 Análisis Detallado por Módulo

## MÓDULO 1: Autenticación y Autorización (7 tablas)

### 1. **User** (users) ✅
- **PK:** userId (number)
- **FKs:** rolId → roles.rol_id
- **Campos:** email (unique), password, nombre, cargo, estado, refreshToken
- **Relaciones:**
  - ✅ ManyToOne con Role
  - ✅ OneToMany con Authorization (authorizationsGranted)
  - ✅ OneToMany con Authorization (authorizationsReceived)
- **Estado:** Correctamente configurada

### 2. **Role** (roles) ✅
- **PK:** rolId (number)
- **Campos:** nombreRol (unique), descripcion, category, defaultModule
- **Relaciones:**
  - ✅ OneToMany con User
  - ✅ OneToMany con RolePermission
  - ✅ OneToMany con RoleGestion
- **Estado:** Correctamente configurada

### 3. **Permission** (permisos) ✅
- **PK:** permisoId (number)
- **Campos:** nombrePermiso (unique), descripcion
- **Relaciones:**
  - ✅ OneToMany con RolePermission
- **Estado:** Correctamente configurada

### 4. **RolePermission** (roles_permisos) ✅
- **PK:** id (number)
- **FKs:** rolId, permisoId
- **Unique:** [rolId, permisoId]
- **Relaciones:**
  - ✅ ManyToOne con Role
  - ✅ ManyToOne con Permission
- **Estado:** Correctamente configurada - Tabla pivote

### 5. **Gestion** (gestiones) ⚠️
- **PK:** gestionId (number)
- **Campos:** nombre (unique), slug (unique), icono
- **Relaciones:**
  - ✅ OneToMany con RoleGestion
  - ⚠️ **FALTA:** OneToMany con Authorization
- **Problema:** Authorization tiene FK gestionId pero Gestion no tiene la relación inversa
- **Impacto:** Bajo - La relación funciona, pero no permite queries inversas eficientes

### 6. **RoleGestion** (roles_gestiones) ✅
- **PK:** id (number)
- **FKs:** rolId, gestionId
- **Unique:** [rolId, gestionId]
- **Relaciones:**
  - ✅ ManyToOne con Role
  - ✅ ManyToOne con Gestion
- **Estado:** Correctamente configurada - Tabla pivote

### 7. **Authorization** (autorizaciones) ✅
- **PK:** id (number)
- **FKs:** usuarioAutorizadorId, usuarioAutorizadoId, gestionId
- **Unique:** [usuarioAutorizadorId, usuarioAutorizadoId, gestionId, tipoAutorizacion]
- **Campos:** tipoAutorizacion, nivel, esActivo
- **Relaciones:**
  - ✅ ManyToOne con User (usuarioAutorizador)
  - ✅ ManyToOne con User (usuarioAutorizado)
  - ✅ ManyToOne con Gestion
- **Nota:** Usa snake_case en español (inconsistente con otras tablas)
- **Estado:** Funcional pero con naming inconsistente

---

## MÓDULO 2: Empresas y Proyectos (5 tablas)

### 8. **Company** (companies) ✅
- **PK:** companyId (number)
- **Campos:** name (unique)
- **Relaciones:**
  - ✅ OneToMany con Project
  - ✅ OneToMany con OperationCenter
  - ✅ OneToMany con ProjectCode
  - ✅ OneToMany con RequisitionPrefix
- **Estado:** Correctamente configurada

### 9. **Project** (projects) ✅
- **PK:** projectId (number)
- **FKs:** companyId → companies.company_id
- **Unique:** [companyId, name]
- **Relaciones:**
  - ✅ ManyToOne con Company
  - ✅ OneToMany con OperationCenter
  - ✅ OneToMany con ProjectCode
  - ✅ OneToMany con RequisitionPrefix
- **Estado:** Correctamente configurada

### 10. **OperationCenter** (operation_centers) ⚠️
- **PK:** centerId (number)
- **FKs:** companyId, projectId (nullable)
- **Campos:** code (varchar 3)
- **Relaciones:**
  - ✅ ManyToOne con Company
  - ✅ ManyToOne con Project (nullable)
  - ⚠️ **FALTA:** OneToMany con Requisition
  - ⚠️ **FALTA:** OneToMany con PurchaseOrderSequence
- **Problema:** Requisition y PurchaseOrderSequence tienen FK pero no existe relación inversa
- **Impacto:** Medio - Dificulta queries como "obtener todas las requisiciones de un centro"

### 11. **ProjectCode** (project_codes) ⚠️
- **PK:** codeId (number)
- **FKs:** companyId, projectId (nullable)
- **Campos:** code (text)
- **Relaciones:**
  - ✅ ManyToOne con Company
  - ✅ ManyToOne con Project (nullable)
  - ⚠️ **FALTA:** OneToMany con Requisition
- **Problema:** Requisition tiene FK projectCodeId pero ProjectCode no tiene relación inversa
- **Impacto:** Bajo - Útil para reporting

### 12. **RequisitionPrefix** (requisition_prefixes) ✅
- **PK:** prefixId (number)
- **FKs:** companyId, projectId (nullable)
- **Campos:** prefix (varchar 10)
- **Relaciones:**
  - ✅ ManyToOne con Company
  - ✅ ManyToOne con Project (nullable)
  - ✅ OneToOne con RequisitionSequence
- **Estado:** Correctamente configurada

---

## MÓDULO 3: Materiales (2 tablas)

### 13. **MaterialGroup** (material_groups) ✅
- **PK:** groupId (number)
- **Campos:** name (unique)
- **Relaciones:**
  - ✅ OneToMany con Material
- **Estado:** Correctamente configurada

### 14. **Material** (materials) ⚠️
- **PK:** materialId (number)
- **FKs:** groupId → material_groups.group_id
- **Campos:** code (unique), description
- **Relaciones:**
  - ✅ ManyToOne con MaterialGroup
  - ⚠️ **FALTA:** OneToMany con RequisitionItem
- **Problema:** RequisitionItem tiene FK materialId pero Material no tiene relación inversa
- **Impacto:** Medio - Dificulta queries como "ver todas las requisiciones que usan este material"

---

## MÓDULO 4: Requisiciones (6 tablas)

### 15. **RequisitionStatus** (requisition_statuses) ⚠️
- **PK:** statusId (number)
- **Campos:** code (unique), name, description, color, order
- **Relaciones:**
  - ⚠️ **FALTA:** OneToMany con Requisition
  - ⚠️ **FALTA:** OneToMany con RequisitionApproval (previous/new)
- **Problema:** Múltiples tablas tienen FK statusId pero no hay relaciones inversas
- **Impacto:** Medio - Útil para queries como "ver todas las requisiciones en estado X"

### 16. **Requisition** (requisitions) ⚠️
- **PK:** requisitionId (number)
- **FKs:** companyId, projectId, operationCenterId, projectCodeId, createdBy, statusId, reviewedBy, approvedBy
- **Campos:** requisitionNumber (unique), timestamps
- **Relaciones:**
  - ✅ ManyToOne con Company
  - ✅ ManyToOne con Project (nullable)
  - ✅ ManyToOne con OperationCenter
  - ✅ ManyToOne con ProjectCode (nullable)
  - ✅ ManyToOne con User (creator)
  - ✅ ManyToOne con RequisitionStatus
  - ✅ ManyToOne con User (reviewer, nullable)
  - ✅ ManyToOne con User (approver, nullable)
  - ✅ OneToMany con RequisitionItem (cascade)
  - ✅ OneToMany con RequisitionLog (cascade)
  - ✅ OneToMany con PurchaseOrder
  - ⚠️ **FALTA:** OneToMany con RequisitionApproval
- **Problema:** RequisitionApproval tiene FK pero no hay relación inversa
- **Impacto:** Bajo - Útil para historial de aprobaciones

### 17. **RequisitionItem** (requisition_items) ⚠️
- **PK:** itemId (number)
- **FKs:** requisitionId, materialId
- **Campos:** itemNumber, quantity (decimal 10,2), observation
- **Relaciones:**
  - ✅ ManyToOne con Requisition (cascade delete)
  - ✅ ManyToOne con Material
  - ⚠️ **FALTA:** OneToMany con RequisitionItemQuotation
  - ⚠️ **FALTA:** OneToMany con PurchaseOrderItem
- **Problema:** Dos tablas tienen FK itemId pero no hay relaciones inversas
- **Impacto:** Alto - Dificulta queries sobre cotizaciones y órdenes de un ítem

### 18. **RequisitionLog** (requisition_logs) ✅
- **PK:** logId (number)
- **FKs:** requisitionId, userId
- **Campos:** action, previousStatus, newStatus, comments, createdAt
- **Relaciones:**
  - ✅ ManyToOne con Requisition (cascade delete)
  - ✅ ManyToOne con User
- **Estado:** Correctamente configurada

### 19. **RequisitionSequence** (requisition_sequences) ✅
- **PK:** prefixId (number) - No autoincremental
- **FKs:** prefixId → requisition_prefixes.prefix_id
- **Campos:** lastNumber
- **Relaciones:**
  - ✅ OneToOne con RequisitionPrefix
- **Estado:** Correctamente configurada

### 20. **RequisitionApproval** (requisition_approvals) ✅
- **PK:** approvalId (number)
- **FKs:** requisitionId, userId, previousStatusId, newStatusId
- **Campos:** action, stepOrder, comments, createdAt
- **Relaciones:**
  - ✅ ManyToOne con Requisition (cascade delete)
  - ✅ ManyToOne con User
  - ✅ ManyToOne con RequisitionStatus (previousStatus, nullable)
  - ✅ ManyToOne con RequisitionStatus (newStatus)
- **Estado:** Correctamente configurada
- **Nota:** Parece duplicar funcionalidad de RequisitionLog

---

## MÓDULO 5: Compras y Proveedores (6 tablas)

### 21. **Supplier** (suppliers) ⚠️
- **PK:** supplierId (number)
- **Campos:** name, nitCc, phone, address, city, email, contactPerson, isActive, timestamps
- **Relaciones:**
  - ✅ OneToMany con RequisitionItemQuotation
  - ⚠️ **FALTA:** OneToMany con PurchaseOrder
- **Problema:** PurchaseOrder tiene FK supplierId pero no hay relación inversa
- **Impacto:** Medio - Útil para ver todas las órdenes de un proveedor

### 22. **RequisitionItemQuotation** (requisition_item_quotations) ⚠️
- **PK:** quotationId (number)
- **FKs:** requisitionItemId, supplierId (nullable), createdBy
- **Campos:** action, supplierOrder, justification, observations, version, isActive, createdAt
- **Relaciones:**
  - ✅ ManyToOne con RequisitionItem (cascade delete)
  - ✅ ManyToOne con Supplier (nullable)
  - ✅ ManyToOne con User (creator)
  - ⚠️ **FALTA:** OneToMany con PurchaseOrderItem
- **Problema:** PurchaseOrderItem tiene FK quotationId pero no hay relación inversa
- **Impacto:** Medio - Útil para rastrear qué órdenes usan una cotización

### 23. **PurchaseOrder** (purchase_orders) ✅
- **PK:** purchaseOrderId (number)
- **FKs:** requisitionId, supplierId, createdBy
- **Campos:** purchaseOrderNumber (unique), issueDate, subtotal, totalIva, totalDiscount, totalAmount, timestamps
- **Tipos de datos:** decimal(15, 2) para montos
- **Relaciones:**
  - ✅ ManyToOne con Requisition (cascade delete)
  - ✅ ManyToOne con Supplier
  - ✅ ManyToOne con User (creator)
  - ✅ OneToMany con PurchaseOrderItem
- **Estado:** Correctamente configurada

### 24. **PurchaseOrderItem** (purchase_order_items) ✅
- **PK:** poItemId (number)
- **FKs:** purchaseOrderId, requisitionItemId, quotationId
- **Campos:** quantity, unitPrice, hasIva, ivaPercentage, subtotal, ivaAmount, discount, totalAmount
- **Tipos de datos:**
  - decimal(10, 2) para quantity
  - decimal(15, 2) para montos
  - decimal(5, 2) para ivaPercentage
- **Relaciones:**
  - ✅ ManyToOne con PurchaseOrder (cascade delete)
  - ✅ ManyToOne con RequisitionItem (cascade delete)
  - ✅ ManyToOne con RequisitionItemQuotation
  - ✅ OneToMany con MaterialReceipt
- **Estado:** Correctamente configurada

### 25. **PurchaseOrderSequence** (purchase_order_sequences) ✅
- **PK:** sequenceId (number)
- **FKs:** operationCenterId (unique)
- **Campos:** lastNumber, timestamps
- **Relaciones:**
  - ✅ ManyToOne con OperationCenter (cascade delete)
- **Estado:** Correctamente configurada

### 26. **MaterialReceipt** (material_receipts) ✅
- **PK:** receiptId (number)
- **FKs:** poItemId, createdBy
- **Campos:** quantityReceived (decimal 10,2), receivedDate, observations, overdeliveryJustification, timestamps
- **Relaciones:**
  - ✅ ManyToOne con PurchaseOrderItem
  - ✅ ManyToOne con User (creator)
- **Estado:** Correctamente configurada

---

## 📋 Resumen de Problemas por Prioridad

### 🔴 Prioridad Alta (Impacto en Funcionalidad)

1. **RequisitionItem**: Falta OneToMany con RequisitionItemQuotation y PurchaseOrderItem
   - **Impacto:** Dificulta rastrear cotizaciones y órdenes de compra de un ítem
   - **Archivos:** requisition-item.entity.ts
   - **Líneas a agregar:** ~42-47

### 🟡 Prioridad Media (Impacto en Queries)

2. **OperationCenter**: Falta OneToMany con Requisition y PurchaseOrderSequence
   - **Impacto:** No se pueden obtener fácilmente todas las requisiciones o secuencias de un centro
   - **Archivos:** operation-center.entity.ts
   - **Líneas a agregar:** ~34-39

3. **Material**: Falta OneToMany con RequisitionItem
   - **Impacto:** No se puede ver qué requisiciones usan un material específico
   - **Archivos:** material.entity.ts
   - **Líneas a agregar:** ~27-29

4. **Supplier**: Falta OneToMany con PurchaseOrder
   - **Impacto:** No se pueden obtener todas las órdenes de un proveedor
   - **Archivos:** supplier.entity.ts
   - **Líneas a agregar:** ~56-58

5. **RequisitionItemQuotation**: Falta OneToMany con PurchaseOrderItem
   - **Impacto:** No se puede rastrear qué órdenes usan una cotización
   - **Archivos:** requisition-item-quotation.entity.ts
   - **Líneas a agregar:** ~75-77

6. **RequisitionStatus**: Falta OneToMany con Requisition y RequisitionApproval
   - **Impacto:** Dificulta queries de reporting por estado
   - **Archivos:** requisition-status.entity.ts
   - **Líneas a agregar:** ~22-27

### 🟢 Prioridad Baja (Nice to Have)

7. **ProjectCode**: Falta OneToMany con Requisition
   - **Impacto:** Útil para reporting pero no crítico
   - **Archivos:** project-code.entity.ts
   - **Líneas a agregar:** ~34-36

8. **Requisition**: Falta OneToMany con RequisitionApproval
   - **Impacto:** Útil para historial pero RequisitionLog ya cubre esto
   - **Archivos:** requisition.entity.ts
   - **Líneas a agregar:** ~117-119

9. **Gestion**: Falta OneToMany con Authorization
   - **Impacto:** Mínimo, solo para queries inversas
   - **Archivos:** gestion.entity.ts
   - **Líneas a agregar:** ~20-22

---

## 🔍 Análisis de Tipos de Datos

### ✅ Correctos y Consistentes

| Tipo | Uso | Estado |
|------|-----|--------|
| **number** | Todos los IDs (PK y FK) | ✅ Consistente |
| **string** | Textos, emails, nombres | ✅ Apropiado |
| **Date** | Timestamps | ✅ Con decoradores correctos |
| **boolean** | Flags (isActive, estado, hasIva) | ✅ Consistente |
| **decimal(10, 2)** | Cantidades (quantity) | ✅ Apropiado |
| **decimal(15, 2)** | Montos (precios, totales) | ✅ Apropiado |
| **decimal(5, 2)** | Porcentajes (ivaPercentage) | ✅ Apropiado |

### 📏 Longitudes de Varchar

| Campo | Longitud | Estado |
|-------|----------|--------|
| email | 120 | ✅ Apropiado |
| nombre_rol | 50 | ✅ Apropiado |
| codigo_centro | 3 | ✅ Apropiado |
| requisition_number | 20 | ✅ Apropiado |
| purchase_order_number | 50 | ✅ Apropiado |
| nombre_permiso | 100 | ✅ Apropiado |

---

## 🏗️ Análisis de Convenciones de Nombres

### ⚠️ Inconsistencias Encontradas

1. **Mezcla de Idiomas:**
   - Español: `autorizaciones`, `gestiones`, `permisos`, `roles`
   - Inglés: `users`, `companies`, `materials`, `suppliers`
   - **Recomendación:** Estandarizar a inglés en toda la BD

2. **Mezcla de Convenciones:**
   - camelCase: `userId`, `companyId`, `materialId`
   - snake_case: `usuario_autorizador_id`, `nombre_permiso`, `creado_en`
   - **Recomendación:** Usar snake_case en BD, camelCase en entities

3. **Nombres de Columnas:**
   - Algunos usan prefijo de tabla: `rol_id`, `permiso_id`
   - Otros no: `userId`, `companyId`
   - **Estado:** Funcional pero inconsistente

### ✅ Buenas Prácticas Aplicadas

- Uso de `@CreateDateColumn` y `@UpdateDateColumn`
- Constraints únicos en campos críticos
- Índices compuestos donde es necesario
- Cascade delete en relaciones apropiadas
- Nullable explícito en campos opcionales

---

## 🔧 Análisis de Integridad Referencial

### ✅ Correctamente Configuradas

1. **Cascade Delete:** Aplicado en:
   - RequisitionItem → Requisition
   - RequisitionLog → Requisition
   - PurchaseOrderItem → PurchaseOrder
   - PurchaseOrderItem → RequisitionItem
   - MaterialReceipt → (no tiene cascade, correcto)

2. **Nullable Apropiado:**
   - projectId en OperationCenter (centros sin proyecto)
   - reviewedBy/approvedBy en Requisition (pendiente aprobación)
   - previousStatusId en RequisitionApproval (primera aprobación)

3. **Unique Constraints:**
   - Composites: [companyId, name] en Project
   - Simples: email, requisitionNumber, purchaseOrderNumber

---

## 📊 Matriz de Relaciones

| Entidad | @ManyToOne | @OneToMany | @OneToOne | Estado |
|---------|------------|------------|-----------|---------|
| User | 1 | 2 | 0 | ✅ |
| Role | 0 | 3 | 0 | ✅ |
| Company | 0 | 4 | 0 | ✅ |
| Project | 1 | 3 | 0 | ✅ |
| OperationCenter | 2 | 0 | 0 | ⚠️ Falta 2 OneToMany |
| Requisition | 8 | 3 | 0 | ⚠️ Falta 1 OneToMany |
| RequisitionItem | 2 | 0 | 0 | ⚠️ Falta 2 OneToMany |
| Material | 1 | 0 | 0 | ⚠️ Falta 1 OneToMany |
| Supplier | 0 | 1 | 0 | ⚠️ Falta 1 OneToMany |
| PurchaseOrder | 3 | 1 | 0 | ✅ |
| PurchaseOrderItem | 3 | 1 | 0 | ✅ |
| MaterialReceipt | 2 | 0 | 0 | ✅ |

---

## 💡 Recomendaciones

### Corto Plazo (Funcionalidad)

1. ✅ Agregar relaciones OneToMany faltantes en RequisitionItem
2. ✅ Agregar relaciones OneToMany faltantes en OperationCenter
3. ✅ Agregar relación OneToMany en Supplier con PurchaseOrder

### Mediano Plazo (Mantenibilidad)

4. 📝 Documentar decisión de mantener RequisitionLog y RequisitionApproval (parecen duplicados)
5. 📝 Considerar estandarizar nombres de tablas a inglés
6. 📝 Estandarizar convención snake_case en nombres de columnas

### Largo Plazo (Refactoring)

7. 🔄 Evaluar si Authorization necesita estar en español o migrar a inglés
8. 🔄 Considerar añadir soft deletes en entidades críticas
9. 🔄 Evaluar agregar índices en FKs más consultadas

---

## ✅ Conclusión

El modelo de datos está **bien estructurado y funcional**. Los problemas identificados son principalmente:

1. **Relaciones bidireccionales incompletas** (9 casos) - Fácil de corregir
2. **Inconsistencias de naming** - No afectan funcionalidad
3. **Falta de relaciones inversas** - Dificulta algunos queries pero no rompe funcionalidad

**Puntuación General: 8.5/10**

- ✅ Integridad referencial: 9/10
- ✅ Tipos de datos: 10/10
- ⚠️ Relaciones bidireccionales: 7/10
- ⚠️ Convenciones de nombres: 7/10
- ✅ Configuración de constraints: 9/10

**Recomendación:** El sistema puede continuar operando sin problemas. Las mejoras sugeridas son para optimización y mantenibilidad a largo plazo.
