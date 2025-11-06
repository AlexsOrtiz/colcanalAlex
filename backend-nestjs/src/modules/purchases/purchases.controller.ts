import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { PurchasesService } from './purchases.service';
import { CreateRequisitionDto } from './dto/create-requisition.dto';
import { UpdateRequisitionDto } from './dto/update-requisition.dto';
import { FilterRequisitionsDto } from './dto/filter-requisitions.dto';
import { ReviewRequisitionDto } from './dto/review-requisition.dto';
import {
  ApproveRequisitionDto,
  RejectRequisitionDto,
} from './dto/approve-requisition.dto';
import { User } from '../../database/entities/user.entity';

@ApiTags('Purchases - Requisitions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('purchases/requisitions')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  // ========================
  // CRUD Endpoints
  // ========================

  @Post()
  @ApiOperation({
    summary: 'Crear nueva requisición de compra',
    description: `
    Crea una nueva requisición de compra con numeración automática según empresa/proyecto.

    ## ¿Quién puede crear requisiciones?

    Solo los siguientes roles pueden crear requisiciones:
    - **Analistas PMO**: Requisiciones de proyectos
    - **PQRS**: Requisiciones de atención al cliente
    - **Directores**: Requisiciones especiales

    ❌ **NO pueden crear**: Gerencia y Compras (solo revisan/aprueban)

    ## Numeración automática

    El sistema genera automáticamente el número de requisición basado en:
    - **Empresa seleccionada** (companyId)
    - **Proyecto seleccionado** (projectId, si aplica)

    Ejemplos de números generados:
    - \`CB-0001\` → Canales & Contactos, Proyecto Ciudad Bolívar
    - \`ADM-0001\` → Canales & Contactos, Proyecto Administrativo
    - \`CE-0001\` → UT El Cerrito (sin proyecto)

    ## Estado inicial

    La requisición se crea en estado **"Pendiente"** y queda en espera de:
    1. **Revisión** por un Director (Nivel 1)
    2. **Aprobación** por Gerencia (Nivel 2)

    ## Ejemplo completo de request

    \`\`\`json
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
    \`\`\`
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Requisición creada exitosamente con número automático',
    schema: {
      example: {
        requisitionId: 1,
        requisitionNumber: 'CB-0001',
        status: 'pendiente',
        companyId: 1,
        projectId: 2,
        operationCenterId: 2,
        projectCodeId: 2,
        createdBy: 5,
        createdAt: '2025-11-06T01:30:00.000Z',
        items: [
          {
            itemId: 1,
            itemNumber: 1,
            materialId: 1,
            quantity: 10,
            observation: 'Cable #10 para instalación principal',
            material: {
              materialId: 1,
              code: 'ELEC-001',
              description: 'Cable #10 AWG',
            },
          },
          {
            itemId: 2,
            itemNumber: 2,
            materialId: 3,
            quantity: 5,
            observation: 'Breakers para tablero secundario',
            material: {
              materialId: 3,
              code: 'ELEC-003',
              description: 'Breaker 2x20A',
            },
          },
        ],
        company: {
          companyId: 1,
          name: 'Canales & Contactos',
        },
        project: {
          projectId: 2,
          name: 'Ciudad Bolívar',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos de entrada inválidos. Causas posibles:\n' +
      '- companyId o projectId no existen\n' +
      '- materialId no existe\n' +
      '- No se encontró prefijo para empresa/proyecto\n' +
      '- Items vacío o sin al menos un elemento',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'No se encontró prefijo para companyId=1, projectId=99. Verifica que exista un prefijo configurado para esta combinación.',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description:
      'Usuario no tiene permisos para crear requisiciones. Solo Analistas, PQRS y Directores pueden crear.',
    schema: {
      example: {
        statusCode: 403,
        message:
          'Los usuarios con rol Gerencia o Compras no pueden crear requisiciones',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Token inválido o expirado.',
  })
  async createRequisition(
    @GetUser() user: User,
    @Body() createRequisitionDto: CreateRequisitionDto,
  ) {
    return this.purchasesService.createRequisition(
      user.userId,
      createRequisitionDto,
    );
  }

  @Get('my-requisitions')
  @ApiOperation({
    summary: 'Obtener mis requisiciones creadas',
    description: `
    Retorna todas las requisiciones creadas por el usuario autenticado.

    ## Características

    - **Paginación**: Usa \`page\` y \`limit\` para navegar por páginas
    - **Filtros disponibles**: estado, rango de fechas, proyecto
    - **Ordenamiento**: Por fecha de creación (más recientes primero)
    - **Datos completos**: Incluye ítems, materiales, empresa, proyecto

    ## Ejemplos de uso

    - Ver todas mis requisiciones: \`GET /my-requisitions\`
    - Solo pendientes: \`GET /my-requisitions?status=pendiente\`
    - Página 2, 20 por página: \`GET /my-requisitions?page=2&limit=20\`
    - Por rango de fechas: \`GET /my-requisitions?fromDate=2025-01-01&toDate=2025-12-31\`
    - De un proyecto específico: \`GET /my-requisitions?projectId=2\`

    ## Estados posibles

    - \`pendiente\`: Esperando revisión
    - \`aprobada_revisor\`: Aprobada por Director
    - \`rechazada_revisor\`: Rechazada por Director
    - \`aprobada_gerencia\`: Aprobada por Gerencia (final)
    - \`rechazada_gerencia\`: Rechazada por Gerencia
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de requisiciones retornada exitosamente',
    schema: {
      example: {
        data: [
          {
            requisitionId: 1,
            requisitionNumber: 'CB-0001',
            status: 'pendiente',
            companyId: 1,
            projectId: 2,
            createdAt: '2025-11-06T01:30:00.000Z',
            items: [
              {
                itemId: 1,
                materialId: 1,
                quantity: 10,
                observation: 'Cable #10 para instalación principal',
                material: {
                  code: 'ELEC-001',
                  description: 'Cable #10 AWG',
                },
              },
            ],
            company: {
              name: 'Canales & Contactos',
            },
            project: {
              name: 'Ciudad Bolívar',
            },
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Token inválido o expirado.',
  })
  async getMyRequisitions(
    @GetUser() user: User,
    @Query() filters: FilterRequisitionsDto,
  ) {
    return this.purchasesService.getMyRequisitions(user.userId, filters);
  }

  @Get('pending-actions')
  @ApiOperation({
    summary: 'Obtener requisiciones pendientes de acción',
    description:
      'Retorna las requisiciones que requieren revisión o aprobación del usuario actual según su rol y autorizaciones',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de requisiciones pendientes retornada exitosamente',
  })
  async getPendingActions(
    @GetUser() user: User,
    @Query() filters: FilterRequisitionsDto,
  ) {
    return this.purchasesService.getPendingActions(user.userId, filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener detalle de requisición',
    description:
      'Retorna el detalle completo de una requisición específica con todos sus ítems y logs',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la requisición',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Detalle de requisición retornado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Requisición no encontrada',
  })
  async getRequisitionById(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.purchasesService.getRequisitionById(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar requisición',
    description:
      'Actualiza una requisición existente. Solo el creador puede editarla y únicamente si está en estado "Pendiente", "Rechazada por Revisor" o "Rechazada por Gerencia"',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la requisición a actualizar',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Requisición actualizada exitosamente',
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para editar esta requisición',
  })
  @ApiResponse({
    status: 404,
    description: 'Requisición no encontrada',
  })
  async updateRequisition(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRequisitionDto: UpdateRequisitionDto,
  ) {
    return this.purchasesService.updateRequisition(
      id,
      user.userId,
      updateRequisitionDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar requisición',
    description:
      'Elimina una requisición. Solo el creador puede eliminarla y únicamente si está en estado "Pendiente"',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la requisición a eliminar',
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: 'Requisición eliminada exitosamente',
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para eliminar esta requisición',
  })
  @ApiResponse({
    status: 404,
    description: 'Requisición no encontrada',
  })
  async deleteRequisition(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.purchasesService.deleteRequisition(id, user.userId);
  }

  // ========================
  // Approval Workflow Endpoints
  // ========================

  @Post(':id/review')
  @ApiOperation({
    summary: 'Revisar requisición (Directores)',
    description:
      'Permite a los Directores aprobar o rechazar una requisición en revisión. Solo usuarios con autorización de nivel 1 pueden revisar.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la requisición a revisar',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Requisición revisada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'La requisición no está en estado válido para revisión',
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para revisar esta requisición',
  })
  @ApiResponse({
    status: 404,
    description: 'Requisición no encontrada',
  })
  async reviewRequisition(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() reviewDto: ReviewRequisitionDto,
  ) {
    return this.purchasesService.reviewRequisition(id, user.userId, reviewDto);
  }

  @Post(':id/approve')
  @ApiOperation({
    summary: 'Aprobar requisición (Gerencia)',
    description:
      'Permite a la Gerencia aprobar una requisición que ya fue revisada por un Director. Solo usuarios con rol de Gerencia pueden aprobar.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la requisición a aprobar',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Requisición aprobada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'La requisición no está en estado válido para aprobación',
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para aprobar esta requisición',
  })
  @ApiResponse({
    status: 404,
    description: 'Requisición no encontrada',
  })
  async approveRequisition(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() approveDto: ApproveRequisitionDto,
  ) {
    return this.purchasesService.approveRequisition(
      id,
      user.userId,
      approveDto,
    );
  }

  @Post(':id/reject')
  @ApiOperation({
    summary: 'Rechazar requisición (Gerencia)',
    description:
      'Permite a la Gerencia rechazar una requisición que ya fue revisada por un Director. Los comentarios son obligatorios.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la requisición a rechazar',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Requisición rechazada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'La requisición no está en estado válido para rechazo',
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para rechazar esta requisición',
  })
  @ApiResponse({
    status: 404,
    description: 'Requisición no encontrada',
  })
  async rejectRequisition(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() rejectDto: RejectRequisitionDto,
  ) {
    return this.purchasesService.rejectRequisitionByManager(
      id,
      user.userId,
      rejectDto,
    );
  }
}
