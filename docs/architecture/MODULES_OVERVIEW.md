# Visión General de Módulos - Canalco

## Arquitectura Modular

El sistema Canalco está diseñado con una arquitectura modular que permite:
- Desarrollo independiente de módulos
- Mantenimiento simplificado
- Escalabilidad granular
- Reutilización de componentes
- Facilidad para agregar nuevos módulos (hasta 10 totales)

---

## Módulos del Sistema

### 1. Dashboard (Panel Principal)

**Propósito**: Centro de control y visualización de información clave.

**Funcionalidades**:
- KPIs en tiempo real
- Gráficas de gestión
- Alertas y notificaciones
- Accesos rápidos a módulos
- Resumen de actividad reciente
- Indicadores por usuario/departamento

**Widgets principales**:
- Requisiciones pendientes de aprobación
- Órdenes de compra activas
- Productos bajo stock mínimo
- Presupuesto vs. gastado
- Desempeño de proveedores
- Timeline de actividades

**Roles con acceso**: Todos

---

### 2. Requisiciones

**Propósito**: Gestión del proceso de solicitud de compras.

**Funcionalidades**:
- Crear nuevas requisiciones
- Agregar múltiples artículos (partidas)
- Adjuntar documentos de soporte
- Enviar a flujo de aprobación
- Seguimiento de estado
- Historial de cambios
- Cancelación de requisiciones
- Duplicar requisiciones anteriores

**Estados del flujo**:
1. Borrador
2. Enviada
3. En revisión
4. Aprobada (por nivel)
5. Completamente aprobada
6. Rechazada
7. Cancelada

**Roles principales**:
- Solicitante: Crea y da seguimiento
- Jefe de Departamento: Aprueba nivel 1
- Gerente: Aprueba nivel 2
- Director: Aprueba nivel 3 (montos altos)

**Integraciones**:
- Notificaciones por email
- Auditoría de cambios
- Generación de PDF
- Vinculación con cotizaciones

---

### 3. Cotizaciones

**Propósito**: Gestión de cotizaciones de proveedores.

**Funcionalidades**:
- Registro de cotizaciones recibidas
- Vinculación con requisiciones
- Comparativa de cotizaciones (cuadro comparativo)
- Carga de documentos PDF
- Selección de cotización ganadora
- Historial de cotizaciones por proveedor
- Análisis de precios históricos

**Proceso típico**:
1. Requisición aprobada
2. Solicitar cotizaciones a proveedores
3. Registrar cotizaciones recibidas
4. Analizar y comparar
5. Seleccionar ganador
6. Generar orden de compra

**Roles principales**:
- Comprador: Gestiona cotizaciones
- Gerente: Aprueba selección

**Reportes**:
- Cuadro comparativo de cotizaciones
- Análisis de precios por artículo
- Desempeño de proveedores

---

### 4. Órdenes de Compra

**Propósito**: Generación y seguimiento de órdenes de compra.

**Funcionalidades**:
- Crear OC desde cotización seleccionada
- Generar PDF con formato oficial
- Envío automático por email al proveedor
- Seguimiento de estados
- Confirmación de proveedor
- Registro de recepción parcial/total
- Cancelación de OC
- Reimpresión de documentos

**Estados del flujo**:
1. Borrador
2. Enviada
3. Confirmada por proveedor
4. En tránsito
5. Recibida (parcial/total)
6. Facturada
7. Cerrada
8. Cancelada

**Roles principales**:
- Comprador: Crea y envía OC
- Almacenista: Registra recepción
- Contador: Confirma facturación

**Integraciones**:
- Email automático al proveedor
- Inventarios (al recibir)
- Auditoría completa

---

### 5. Inventarios

**Propósito**: Control de productos y stock.

**Funcionalidades**:
- Catálogo de productos
- Gestión de categorías
- Control de stock actual
- Movimientos de entrada/salida
- Ajustes de inventario
- Alertas de stock bajo
- Punto de reorden
- Costos promedio
- Ubicaciones físicas
- Transferencias entre ubicaciones

**Tipos de movimientos**:
- Entrada (por OC)
- Salida (requisiciones internas)
- Ajuste (correcciones)
- Transferencia (entre ubicaciones)

**Alertas automáticas**:
- Stock por debajo de mínimo
- Stock en punto de reorden
- Productos sin movimiento (90+ días)

**Roles principales**:
- Almacenista: Gestiona inventario
- Comprador: Consulta disponibilidad

**Reportes**:
- Kardex por producto
- Valuación de inventario
- Productos de baja rotación
- Histórico de movimientos

---

### 6. Proveedores

**Propósito**: Catálogo y gestión de proveedores.

**Funcionalidades**:
- Alta de proveedores
- Datos fiscales completos
- Información de contacto
- Condiciones de pago
- Datos bancarios
- Calificación/rating
- Historial de compras
- Documentos adjuntos (constancias fiscales, etc.)
- Activar/desactivar proveedores

**Información capturada**:
- Datos generales (razón social, RFC, dirección)
- Contactos principales
- Términos de pago
- Métodos de pago
- Datos bancarios
- Certificaciones
- Rating de desempeño

**Evaluación de proveedores**:
- Entregas a tiempo
- Calidad de productos
- Precios competitivos
- Servicio post-venta
- Cumplimiento de especificaciones

**Roles principales**:
- Comprador: Gestiona catálogo
- Gerente: Aprueba altas

**Reportes**:
- Directorio de proveedores
- Top proveedores por volumen
- Análisis de desempeño
- Compras por proveedor

---

### 7. Reportes

**Propósito**: Generación de reportes y análisis.

**Funcionalidades**:
- Reportes predefinidos
- Reportes personalizados
- Filtros avanzados
- Exportación (PDF, Excel, CSV)
- Programación de reportes
- Envío automático por email
- Dashboards interactivos
- Gráficas y visualizaciones

**Reportes principales**:

**Requisiciones**:
- Requisiciones por periodo
- Requisiciones por departamento
- Tiempo promedio de aprobación
- Requisiciones rechazadas (con razones)

**Órdenes de Compra**:
- OC por periodo
- OC por proveedor
- Análisis de precios
- Cumplimiento de entregas

**Inventario**:
- Valuación de inventario
- Movimientos por periodo
- Rotación de productos
- Productos obsoletos

**Proveedores**:
- Compras por proveedor
- Desempeño de proveedores
- Comparativo de precios

**Financieros**:
- Presupuesto vs. real
- Gastos por departamento
- Gastos por categoría
- Proyecciones

**Roles con acceso**:
- Gerentes y Directores: Todos los reportes
- Jefes de Departamento: Reportes de su departamento
- Auditor: Solo lectura de todos

---

### 8. Usuarios

**Propósito**: Gestión de usuarios, roles y permisos.

**Funcionalidades**:
- Alta/baja de usuarios
- Asignación de roles
- Gestión de permisos
- Activación/desactivación
- Cambio de contraseñas
- Historial de accesos
- Configuración de perfil

**Roles del sistema**:
1. **Administrador**: Control total
2. **Gerente**: Aprobaciones nivel alto, reportes
3. **Jefe de Departamento**: Aprobaciones nivel 1
4. **Solicitante**: Crea requisiciones
5. **Comprador**: Gestiona cotizaciones y OC
6. **Almacenista**: Maneja inventario
7. **Contador**: Valida facturación
8. **Auditor**: Solo lectura completa

**Permisos granulares por módulo**:
- Crear
- Leer
- Actualizar
- Eliminar
- Aprobar
- Exportar

**Roles principales**:
- Administrador: Gestiona usuarios

**Seguridad**:
- Contraseñas encriptadas
- Sesiones con timeout
- Registro de accesos
- Intentos de login fallidos

---

### 9. Auditorías

**Propósito**: Registro y consulta de todas las acciones del sistema.

**Funcionalidades**:
- Registro automático de todas las acciones
- Consulta de logs
- Filtros avanzados (usuario, fecha, módulo, acción)
- Exportación de auditoría
- Trazabilidad completa
- Comparación de cambios (antes/después)

**Información registrada**:
- Usuario que ejecuta
- Acción realizada (crear, modificar, eliminar)
- Módulo afectado
- Entidad y ID afectado
- Valores anteriores y nuevos (JSON)
- Fecha y hora exacta
- IP y user agent
- Descripción legible

**Acciones auditadas**:
- Login/logout
- Creación de registros
- Modificación de datos
- Eliminación (soft delete)
- Aprobaciones/rechazos
- Cambios de estado
- Exportación de datos
- Configuraciones del sistema

**Roles con acceso**:
- Auditor: Acceso completo solo lectura
- Administrador: Acceso completo
- Gerentes: Consulta limitada

**Reportes de auditoría**:
- Actividad por usuario
- Actividad por módulo
- Cambios en periodo
- Accesos al sistema

---

### 10. Notificaciones

**Propósito**: Sistema de alertas y comunicación.

**Funcionalidades**:
- Notificaciones en tiempo real (in-app)
- Envío de emails automáticos
- Centro de notificaciones
- Marcar como leídas
- Priorización de notificaciones
- Configuración de preferencias
- Historial de notificaciones

**Tipos de notificaciones**:

**Requisiciones**:
- Nueva requisición para aprobar
- Requisición aprobada
- Requisición rechazada
- Requisición completada

**Cotizaciones**:
- Nueva cotización registrada
- Cotización seleccionada

**Órdenes de Compra**:
- Nueva OC enviada
- OC confirmada por proveedor
- OC recibida en almacén

**Inventario**:
- Stock bajo mínimo
- Producto en punto de reorden
- Ajuste de inventario

**Sistema**:
- Cambio de contraseña
- Nuevo acceso detectado
- Mantenimiento programado

**Canales**:
- In-app (web)
- Email (SES/SMTP)
- (Futuro: SMS, Push notifications)

**Configuración por usuario**:
- Activar/desactivar por tipo
- Preferencia de canal
- Frecuencia de resumen

---

## Flujo Principal de Trabajo

```
1. REQUISICIÓN
   Usuario crea requisición → Envía a aprobación
   ↓
2. APROBACIÓN
   Jefe Depto aprueba → Gerente aprueba → [Director aprueba]
   ↓
3. COTIZACIÓN
   Comprador solicita cotizaciones → Registra en sistema
   ↓
4. ANÁLISIS
   Comprador compara cotizaciones → Selecciona ganador
   ↓
5. ORDEN DE COMPRA
   Comprador genera OC → Envía a proveedor
   ↓
6. RECEPCIÓN
   Almacenista recibe productos → Registra en inventario
   ↓
7. FACTURACIÓN
   Contador valida factura → Cierra orden

Durante todo el proceso:
- Auditoría registra cada acción
- Notificaciones alertan a involucrados
- Reportes disponibles en tiempo real
```

---

## Dependencias entre Módulos

```
Dashboard
  ├─ Consulta: Todos los módulos
  └─ Muestra: Resúmenes y KPIs

Requisiciones
  ├─ Usa: Usuarios (solicitantes, aprobadores)
  ├─ Genera: Notificaciones
  └─ Registra: Auditoría

Cotizaciones
  ├─ Requiere: Requisiciones aprobadas
  ├─ Usa: Proveedores
  └─ Alimenta: Órdenes de Compra

Órdenes de Compra
  ├─ Requiere: Cotizaciones seleccionadas
  ├─ Usa: Proveedores
  ├─ Genera: Notificaciones
  └─ Alimenta: Inventarios

Inventarios
  ├─ Recibe: Órdenes de Compra
  ├─ Usa: Categorías, Productos
  └─ Genera: Alertas (Notificaciones)

Proveedores
  ├─ Usado por: Cotizaciones, Órdenes de Compra
  └─ Alimenta: Reportes

Reportes
  ├─ Consulta: Todos los módulos
  └─ Genera: PDFs, Excel

Usuarios
  ├─ Base de: Todo el sistema
  └─ Controla: Permisos y accesos

Auditorías
  ├─ Registra: Todos los módulos
  └─ No modifica: Ningún módulo

Notificaciones
  ├─ Generada por: Todos los módulos
  └─ Consume: Plantillas, Preferencias de usuario
```

---

## Tecnologías por Módulo

### Backend (Python)
- **API**: FastAPI o Django REST Framework
- **ORM**: SQLAlchemy o Django ORM
- **Validación**: Pydantic
- **Auth**: JWT tokens
- **Tasks**: Celery (background jobs)

### Frontend (React)
- **UI Framework**: Material-UI o Ant Design
- **State Management**: Redux o Context API
- **Forms**: Formik + Yup
- **Tables**: React Table
- **Charts**: Recharts o Chart.js
- **HTTP**: Axios

### Comunes
- **PDFs**: ReportLab (backend) / jsPDF (frontend)
- **Excel**: openpyxl (backend) / xlsx (frontend)
- **Emails**: Jinja2 templates

---

## Próximos Pasos

1. ✅ Documentar visión general de módulos
2. ⏳ Crear especificaciones detalladas por módulo
3. ⏳ Diseñar wireframes de interfaces
4. ⏳ Definir APIs RESTful por módulo
5. ⏳ Establecer prioridades de desarrollo
