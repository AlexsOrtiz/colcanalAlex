# Progreso Requisición JE-001 - Sesión 2025-11-06

## Resumen
Se completó el flujo de aprobación de la requisición JE-001 creada por Director Antioquia.

**Estado actual:** COTIZADA ✅
**Próximo paso:** Crear Orden de Compra

---

## Datos de la Requisición JE-001

- **Requisition ID:** 3
- **Requisition Number:** JE-001
- **Item ID:** 4
- **Creador:** Ana Restrepo (Director Antioquia, userId: 7)
- **Empresa:** Canales & Contactos (companyId: 1)
- **Proyecto:** Jericó (projectId: 3)
- **Centro de Operación:** 960 (centerId: 3)
- **Código de Proyecto:** 07. C&C - Jericó - 2021
- **Material:** Luminaria solar LED de 60W (materialId: 4, código: 3053)
- **Cantidad:** 25 unidades
- **Observación:** "Luminarias solares para expansión de red en Jericó - Sector Las Palmas"

---

## Flujo Completado

### 1. Creación de Requisición ✅
**Usuario:** Director Antioquia
**Email:** director.antioquia@canalco.com
**Password:** Canalco2025!

```
POST http://localhost:3000/api/auth/login
Body:
{
  "email": "director.antioquia@canalco.com",
  "password": "Canalco2025!"
}
```

```
POST http://localhost:3000/api/purchases/requisitions
Body:
{
  "companyId": 1,
  "projectId": 3,
  "items": [
    {
      "materialId": 4,
      "quantity": 25,
      "observation": "Luminarias solares para expansión de red en Jericó - Sector Las Palmas"
    }
  ]
}
```

**Resultado:** Requisición JE-001 creada en estado "pendiente"

---

### 2. Revisión por Director Técnico ✅
**Usuario:** Director Técnico
**Email:** director.tecnico@canalco.com
**Password:** Canalco2025!

```
POST http://localhost:3000/api/auth/login
Body:
{
  "email": "director.tecnico@canalco.com",
  "password": "Canalco2025!"
}
```

```
POST http://localhost:3000/api/purchases/requisitions/3/review
Body:
{
  "decision": "approve",
  "comments": "Materiales aprobados para expansión de red en Jericó"
}
```

**Resultado:** Estado cambió a "aprobada_revisor"

---

### 3. Aprobación por Gerencia ✅
**Usuario:** Gerencia
**Email:** gerencia@canalco.com
**Password:** Canalco2025!

```
POST http://localhost:3000/api/auth/login
Body:
{
  "email": "gerencia@canalco.com",
  "password": "Canalco2025!"
}
```

```
POST http://localhost:3000/api/purchases/requisitions/3/approve
Body:
{
  "comments": "Requisición aprobada para proceder con cotizaciones"
}
```

**Resultado:** Estado cambió a "aprobada_gerencia"

---

### 4. Cotización por Compras ✅
**Usuario:** Compras
**Email:** compras@canalco.com
**Password:** Canalco2025!

```
POST http://localhost:3000/api/auth/login
Body:
{
  "email": "compras@canalco.com",
  "password": "Canalco2025!"
}
```

**Ver requisiciones listas para cotización:**
```
GET http://localhost:3000/api/purchases/requisitions/for-quotation
```

**Asignar cotización con proveedor:**
```
POST http://localhost:3000/api/purchases/requisitions/3/quotation
Body:
{
  "items": [
    {
      "itemId": 4,
      "action": "cotizar",
      "suppliers": [
        {
          "supplierId": 1,
          "supplierOrder": 1,
          "observations": "Proveedor principal para luminarias solares"
        }
      ]
    }
  ]
}
```

**Resultado:** Estado cambió a "cotizada"

---

## PRÓXIMO PASO: Crear Orden de Compra

**Usuario:** Compras (mismo token)

```
POST http://localhost:3000/api/purchases/requisitions/3/purchase-orders
Headers:
  Authorization: Bearer {token_compras}
Body:
{
  "issueDate": "2025-11-06",
  "items": [
    {
      "itemId": 4,
      "supplierId": 1,
      "unitPrice": 85000,
      "hasIVA": true,
      "discount": 0
    }
  ]
}
```

**Esto generará:**
- Número de orden: `960-OS-XXXX` (basado en centro de operación 960)
- Subtotal: 25 × 85,000 = 2,125,000
- IVA (19%): 403,750
- Total: 2,528,750
- Estado de requisición cambia a: "pendiente_recepcion"

---

## Logs de la Requisición

1. **Creación** (Director Antioquia)
   - Acción: crear_requisicion
   - Estado: null → pendiente

2. **Revisión** (Director Técnico)
   - Acción: revisar_aprobar
   - Estado: pendiente → aprobada_revisor

3. **Aprobación** (Gerencia)
   - Acción: aprobar_gerencia
   - Estado: aprobada_revisor → aprobada_gerencia

4. **Cotización** (Compras)
   - Acción: gestionar_cotizacion
   - Estado: aprobada_gerencia → cotizada

---

## Notas Importantes

### Credenciales de Usuarios
Todos los usuarios tienen password: **Canalco2025!**

- **Director Antioquia:** director.antioquia@canalco.com (userId: 7)
- **Director Técnico:** director.tecnico@canalco.com (userId: 5)
- **Gerencia:** gerencia@canalco.com (userId: 1)
- **Compras:** compras@canalco.com (userId: 27)

### Endpoints Clave

**Ver estado de requisición (como creador):**
```
GET http://localhost:3000/api/purchases/requisitions/3
Authorization: Bearer {token_director_antioquia}
```

**Ver requisiciones para cotizar (como Compras):**
```
GET http://localhost:3000/api/purchases/requisitions/for-quotation
Authorization: Bearer {token_compras}
```

### Proveedores Disponibles
- supplierId: 1 (usado en cotización)

### IDs Importantes
- requisitionId: 3
- itemId: 4
- materialId: 4
- companyId: 1
- projectId: 3
- operationCenterId: 3

---

## Después de Crear la Orden de Compra

El siguiente paso será **registrar la recepción de materiales** cuando lleguen físicamente.

**Endpoint para recepción:**
```
POST http://localhost:3000/api/purchases/requisitions/3/receipts
```

---

## Documentos de Referencia

- **Troubleshooting anterior:** `/TROUBLESHOOTING_RECEIPTS.md`
- **Backend:** `backend-nestjs/src/modules/purchases/`
- **Entidades:** `backend-nestjs/src/database/entities/`

---

**Última actualización:** 2025-11-06
**Estado:** Listo para crear Orden de Compra
