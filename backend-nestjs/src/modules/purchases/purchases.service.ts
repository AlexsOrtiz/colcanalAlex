import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, IsNull } from 'typeorm';
import { Requisition } from '../../database/entities/requisition.entity';
import { RequisitionItem } from '../../database/entities/requisition-item.entity';
import { RequisitionLog } from '../../database/entities/requisition-log.entity';
import { RequisitionPrefix } from '../../database/entities/requisition-prefix.entity';
import { RequisitionSequence } from '../../database/entities/requisition-sequence.entity';
import { OperationCenter } from '../../database/entities/operation-center.entity';
import { ProjectCode } from '../../database/entities/project-code.entity';
import { User } from '../../database/entities/user.entity';
import { Authorization } from '../../database/entities/authorization.entity';
import { Company } from '../../database/entities/company.entity';
import { CreateRequisitionDto } from './dto/create-requisition.dto';
import { UpdateRequisitionDto } from './dto/update-requisition.dto';
import { FilterRequisitionsDto } from './dto/filter-requisitions.dto';
import { ReviewRequisitionDto } from './dto/review-requisition.dto';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Requisition)
    private requisitionRepository: Repository<Requisition>,
    @InjectRepository(RequisitionItem)
    private requisitionItemRepository: Repository<RequisitionItem>,
    @InjectRepository(RequisitionLog)
    private requisitionLogRepository: Repository<RequisitionLog>,
    @InjectRepository(RequisitionPrefix)
    private requisitionPrefixRepository: Repository<RequisitionPrefix>,
    @InjectRepository(RequisitionSequence)
    private requisitionSequenceRepository: Repository<RequisitionSequence>,
    @InjectRepository(OperationCenter)
    private operationCenterRepository: Repository<OperationCenter>,
    @InjectRepository(ProjectCode)
    private projectCodeRepository: Repository<ProjectCode>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Authorization)
    private authorizationRepository: Repository<Authorization>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private dataSource: DataSource,
  ) {}

  // ============================================
  // MÉTODOS CRUD BÁSICOS
  // ============================================

  async createRequisition(userId: number, dto: CreateRequisitionDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validar que el usuario puede crear requisiciones
      const user = await this.userRepository.findOne({
        where: { userId },
        relations: ['role'],
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      await this.validateUserCanCreate(user);

      // 2. Validar empresa
      const company = await this.companyRepository.findOne({
        where: { companyId: dto.companyId },
      });

      if (!company) {
        throw new NotFoundException('Empresa no encontrada');
      }

      // 3. Validar que si es Canales & Contactos, projectId es requerido
      if (company.name.includes('Canales & Contactos') && !dto.projectId) {
        throw new BadRequestException(
          'El proyecto es requerido para Canales & Contactos',
        );
      }

      // 4. Determinar centro de operación automáticamente
      const operationCenterId = await this.determineOperationCenter(
        dto.companyId,
        dto.projectId,
      );

      // 5. Determinar código de proyecto automáticamente
      const projectCodeId = await this.determineProjectCode(
        dto.companyId,
        dto.projectId,
      );

      // 6. Generar número de requisición
      const requisitionNumber = await this.generateRequisitionNumber(
        dto.companyId,
        dto.projectId,
        queryRunner,
      );

      // 7. Crear requisición
      const requisition = queryRunner.manager.create(Requisition, {
        requisitionNumber,
        companyId: dto.companyId,
        projectId: dto.projectId,
        operationCenterId,
        projectCodeId: projectCodeId || undefined,
        createdBy: userId,
        status: 'pendiente',
      });

      const savedRequisition = await queryRunner.manager.save(requisition);

      // 8. Crear ítems
      const items = dto.items.map((item, index) =>
        queryRunner.manager.create(RequisitionItem, {
          requisitionId: savedRequisition.requisitionId,
          itemNumber: index + 1,
          materialId: item.materialId,
          quantity: item.quantity,
          observation: item.observation,
        }),
      );

      await queryRunner.manager.save(RequisitionItem, items);

      // 9. Registrar log
      const log = queryRunner.manager.create(RequisitionLog, {
        requisitionId: savedRequisition.requisitionId,
        userId,
        action: 'crear_requisicion',
        previousStatus: undefined,
        newStatus: 'pendiente',
        comments: `Requisición creada: ${requisitionNumber}`,
      });

      await queryRunner.manager.save(log);

      await queryRunner.commitTransaction();

      // 10. Retornar requisición completa
      return this.getRequisitionById(savedRequisition.requisitionId, userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Mejorar mensaje de error para problemas de foreign key
      if (error.code === '23503') {
        const detail = error.detail || '';
        throw new BadRequestException(
          `Error de referencia en base de datos: ${detail}. Verifica que companyId, projectId, materialIds existan en la base de datos.`,
        );
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getMyRequisitions(userId: number, filters: FilterRequisitionsDto) {
    const {
      page = 1,
      limit = 10,
      status,
      fromDate,
      toDate,
      projectId,
    } = filters;

    const queryBuilder = this.requisitionRepository
      .createQueryBuilder('requisition')
      .leftJoinAndSelect('requisition.company', 'company')
      .leftJoinAndSelect('requisition.project', 'project')
      .leftJoinAndSelect('requisition.operationCenter', 'operationCenter')
      .leftJoinAndSelect('requisition.projectCode', 'projectCode')
      .leftJoinAndSelect('requisition.creator', 'creator')
      .leftJoinAndSelect('creator.role', 'role')
      .leftJoinAndSelect('requisition.items', 'items')
      .leftJoinAndSelect('items.material', 'material')
      .leftJoinAndSelect('material.materialGroup', 'materialGroup')
      .where('requisition.createdBy = :userId', { userId })
      .orderBy('requisition.createdAt', 'DESC');

    // Filtros opcionales
    if (status) {
      queryBuilder.andWhere('requisition.status = :status', { status });
    }

    if (projectId) {
      queryBuilder.andWhere('requisition.projectId = :projectId', {
        projectId,
      });
    }

    if (fromDate && toDate) {
      queryBuilder.andWhere(
        'requisition.createdAt BETWEEN :fromDate AND :toDate',
        {
          fromDate: new Date(fromDate),
          toDate: new Date(toDate),
        },
      );
    }

    // Paginación
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [requisitions, total] = await queryBuilder.getManyAndCount();

    return {
      data: requisitions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getRequisitionById(requisitionId: number, userId: number) {
    const requisition = await this.requisitionRepository.findOne({
      where: { requisitionId },
      relations: [
        'company',
        'project',
        'operationCenter',
        'projectCode',
        'creator',
        'creator.role',
        'items',
        'items.material',
        'items.material.materialGroup',
        'logs',
        'logs.user',
      ],
    });

    if (!requisition) {
      throw new NotFoundException('Requisición no encontrada');
    }

    // Validar que el usuario tiene permiso para ver esta requisición
    // (creador o autorizador en la cadena)
    const canView = await this.canViewRequisition(requisition, userId);
    if (!canView) {
      throw new ForbiddenException(
        'No tiene permiso para ver esta requisición',
      );
    }

    return requisition;
  }

  async updateRequisition(
    requisitionId: number,
    userId: number,
    dto: UpdateRequisitionDto,
  ) {
    const requisition = await this.requisitionRepository.findOne({
      where: { requisitionId },
      relations: ['items'],
    });

    if (!requisition) {
      throw new NotFoundException('Requisición no encontrada');
    }

    // Validar que el usuario es el creador
    if (requisition.createdBy !== userId) {
      throw new ForbiddenException(
        'Solo el creador puede modificar la requisición',
      );
    }

    // Validar que el estado permite edición
    const editableStatuses = [
      'pendiente',
      'rechazada_revisor',
      'rechazada_gerencia',
    ];
    if (!editableStatuses.includes(requisition.status)) {
      throw new BadRequestException(
        'Esta requisición ya no puede ser modificada',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const previousStatus = requisition.status;

      // Actualizar campos de la requisición
      if (dto.companyId) {
        requisition.companyId = dto.companyId;
        // Recalcular centro de operación y código de proyecto
        requisition.operationCenterId = await this.determineOperationCenter(
          dto.companyId,
          dto.projectId,
        );
        const projectCodeId = await this.determineProjectCode(
          dto.companyId,
          dto.projectId,
        );
        if (projectCodeId !== undefined) {
          requisition.projectCodeId = projectCodeId;
        }
      }

      if (dto.projectId !== undefined) {
        requisition.projectId = dto.projectId;
      }

      // Si estaba rechazada, volver a estado pendiente
      if (
        previousStatus === 'rechazada_revisor' ||
        previousStatus === 'rechazada_gerencia'
      ) {
        requisition.status = 'pendiente';
      }

      await queryRunner.manager.save(requisition);

      // Actualizar ítems si se proporcionan
      if (dto.items) {
        // Eliminar ítems existentes
        await queryRunner.manager.delete(RequisitionItem, {
          requisitionId,
        });

        // Crear nuevos ítems
        const items = dto.items.map((item, index) =>
          queryRunner.manager.create(RequisitionItem, {
            requisitionId,
            itemNumber: index + 1,
            materialId: item.materialId,
            quantity: item.quantity,
            observation: item.observation,
          }),
        );

        await queryRunner.manager.save(RequisitionItem, items);
      }

      // Registrar log
      const log = queryRunner.manager.create(RequisitionLog, {
        requisitionId,
        userId,
        action: 'editar_requisicion',
        previousStatus,
        newStatus: requisition.status,
        comments: 'Requisición actualizada',
      });

      await queryRunner.manager.save(log);

      await queryRunner.commitTransaction();

      return this.getRequisitionById(requisitionId, userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteRequisition(requisitionId: number, userId: number) {
    const requisition = await this.requisitionRepository.findOne({
      where: { requisitionId },
    });

    if (!requisition) {
      throw new NotFoundException('Requisición no encontrada');
    }

    // Validar que el usuario es el creador
    if (requisition.createdBy !== userId) {
      throw new ForbiddenException(
        'Solo el creador puede eliminar la requisición',
      );
    }

    // Validar que está en estado pendiente
    if (requisition.status !== 'pendiente') {
      throw new BadRequestException(
        'Solo se pueden eliminar requisiciones en estado pendiente',
      );
    }

    await this.requisitionRepository.remove(requisition);

    return { message: 'Requisición eliminada exitosamente' };
  }

  // ============================================
  // MÉTODOS DE AUTORIZACIONES
  // ============================================

  async getPendingActions(userId: number, filters: FilterRequisitionsDto) {
    const user = await this.userRepository.findOne({
      where: { userId },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Obtener subordinados
    const authorizations = await this.authorizationRepository.find({
      where: {
        usuarioAutorizadorId: userId,
        esActivo: true,
      },
      relations: ['usuarioAutorizado'],
    });

    const subordinateIds = authorizations.map(
      (auth) => auth.usuarioAutorizadoId,
    );

    if (subordinateIds.length === 0) {
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
    }

    const { page = 1, limit = 10 } = filters;

    // Determinar estados según rol
    let statuses: string[] = [];
    const roleName = user.role.nombreRol;

    if (roleName === 'Gerencia') {
      statuses = ['aprobada_revisor'];
    } else if (roleName.includes('Director')) {
      statuses = ['pendiente', 'en_revision'];
    } else if (roleName === 'Compras') {
      statuses = ['aprobada_gerencia'];
    }

    const queryBuilder = this.requisitionRepository
      .createQueryBuilder('requisition')
      .leftJoinAndSelect('requisition.company', 'company')
      .leftJoinAndSelect('requisition.project', 'project')
      .leftJoinAndSelect('requisition.creator', 'creator')
      .leftJoinAndSelect('creator.role', 'creatorRole')
      .leftJoinAndSelect('requisition.items', 'items')
      .leftJoinAndSelect('items.material', 'material')
      .where('requisition.createdBy IN (:...subordinateIds)', {
        subordinateIds,
      })
      .andWhere('requisition.status IN (:...statuses)', { statuses })
      .orderBy('requisition.createdAt', 'ASC');

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [requisitions, total] = await queryBuilder.getManyAndCount();

    return {
      data: requisitions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async reviewRequisition(
    requisitionId: number,
    userId: number,
    dto: ReviewRequisitionDto,
  ) {
    const requisition = await this.requisitionRepository.findOne({
      where: { requisitionId },
      relations: ['creator'],
    });

    if (!requisition) {
      throw new NotFoundException('Requisición no encontrada');
    }

    // Validar que el usuario es autorizador del creador
    const isAuthorizer = await this.isAuthorizer(userId, requisition.createdBy);

    if (!isAuthorizer) {
      throw new ForbiddenException(
        'No tiene permiso para revisar esta requisición',
      );
    }

    // Validar estado actual
    if (
      requisition.status !== 'pendiente' &&
      requisition.status !== 'en_revision'
    ) {
      throw new BadRequestException(
        'Esta requisición no puede ser revisada en su estado actual',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const previousStatus = requisition.status;
      let newStatus: string;
      let action: string;

      if (dto.decision === 'approve') {
        // Cambiar a estado "aprobada por revisor"
        newStatus = 'aprobada_revisor';
        action = 'revisar_aprobar';
      } else {
        // Rechazar
        newStatus = 'rechazada_revisor';
        action = 'revisar_rechazar';
      }

      requisition.status = newStatus;
      await queryRunner.manager.save(requisition);

      // Registrar log
      const log = queryRunner.manager.create(RequisitionLog, {
        requisitionId,
        userId,
        action,
        previousStatus,
        newStatus,
        comments:
          dto.comments ||
          `Requisición ${dto.decision === 'approve' ? 'aprobada' : 'rechazada'} por revisor`,
      });

      await queryRunner.manager.save(log);

      await queryRunner.commitTransaction();

      return this.getRequisitionById(requisitionId, userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async approveRequisition(
    requisitionId: number,
    userId: number,
    dto: { comments?: string },
  ) {
    const requisition = await this.requisitionRepository.findOne({
      where: { requisitionId },
    });

    if (!requisition) {
      throw new NotFoundException('Requisición no encontrada');
    }

    const user = await this.userRepository.findOne({
      where: { userId },
      relations: ['role'],
    });

    // Validar que el usuario es Gerencia
    if (user?.role.nombreRol !== 'Gerencia') {
      throw new ForbiddenException('Solo Gerencia puede aprobar requisiciones');
    }

    // Validar estado actual
    if (requisition.status !== 'aprobada_revisor') {
      throw new BadRequestException(
        'La requisición debe estar aprobada por un revisor primero',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const previousStatus = requisition.status;
      requisition.status = 'aprobada_gerencia';
      await queryRunner.manager.save(requisition);

      // Registrar log
      const log = queryRunner.manager.create(RequisitionLog, {
        requisitionId,
        userId,
        action: 'aprobar_gerencia',
        previousStatus,
        newStatus: 'aprobada_gerencia',
        comments: dto.comments || 'Requisición aprobada por gerencia',
      });

      await queryRunner.manager.save(log);

      await queryRunner.commitTransaction();

      return this.getRequisitionById(requisitionId, userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async rejectRequisitionByManager(
    requisitionId: number,
    userId: number,
    dto: { comments: string },
  ) {
    const requisition = await this.requisitionRepository.findOne({
      where: { requisitionId },
    });

    if (!requisition) {
      throw new NotFoundException('Requisición no encontrada');
    }

    const user = await this.userRepository.findOne({
      where: { userId },
      relations: ['role'],
    });

    // Validar que el usuario es Gerencia
    if (user?.role.nombreRol !== 'Gerencia') {
      throw new ForbiddenException(
        'Solo Gerencia puede rechazar requisiciones',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const previousStatus = requisition.status;
      requisition.status = 'rechazada_gerencia';
      await queryRunner.manager.save(requisition);

      // Registrar log
      const log = queryRunner.manager.create(RequisitionLog, {
        requisitionId,
        userId,
        action: 'rechazar_gerencia',
        previousStatus,
        newStatus: 'rechazada_gerencia',
        comments: dto.comments,
      });

      await queryRunner.manager.save(log);

      await queryRunner.commitTransaction();

      return this.getRequisitionById(requisitionId, userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ============================================
  // MÉTODOS AUXILIARES
  // ============================================

  private async generateRequisitionNumber(
    companyId: number,
    projectId: number | undefined,
    queryRunner: any,
  ): Promise<string> {
    // Buscar el prefijo correspondiente
    // Si projectId es undefined o null, buscar prefijos sin proyecto
    const prefix = await this.requisitionPrefixRepository.findOne({
      where: {
        companyId,
        projectId: projectId !== undefined ? projectId : IsNull(),
      },
    });

    if (!prefix) {
      throw new NotFoundException(
        `No se encontró prefijo para companyId=${companyId}, projectId=${projectId}. Verifica que exista un prefijo configurado para esta combinación.`,
      );
    }

    // Obtener y actualizar secuencia (con lock)
    const sequence = await queryRunner.manager.findOne(RequisitionSequence, {
      where: { prefixId: prefix.prefixId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!sequence) {
      throw new NotFoundException('Secuencia no encontrada');
    }

    sequence.lastNumber += 1;
    await queryRunner.manager.save(sequence);

    // Formatear número
    const formattedNumber = String(sequence.lastNumber).padStart(3, '0');
    return `${prefix.prefix}-${formattedNumber}`;
  }

  private async determineOperationCenter(
    companyId: number,
    projectId?: number,
  ): Promise<number> {
    const operationCenter = await this.operationCenterRepository.findOne({
      where: {
        companyId,
        projectId: projectId !== undefined ? projectId : IsNull(),
      },
    });

    if (!operationCenter) {
      throw new NotFoundException(
        `Centro de operación no encontrado para companyId=${companyId}, projectId=${projectId}`,
      );
    }

    return operationCenter.centerId;
  }

  private async determineProjectCode(
    companyId: number,
    projectId?: number,
  ): Promise<number | undefined> {
    const projectCode = await this.projectCodeRepository.findOne({
      where: {
        companyId,
        projectId: projectId !== undefined ? projectId : IsNull(),
      },
    });

    return projectCode?.codeId;
  }

  private async validateUserCanCreate(user: User): Promise<void> {
    const restrictedRoles = ['Gerencia', 'Compras'];
    if (restrictedRoles.includes(user.role.nombreRol)) {
      throw new ForbiddenException('Su rol no puede crear requisiciones');
    }
  }

  private async isAuthorizer(
    autorizadorId: number,
    autorizadoId: number,
  ): Promise<boolean> {
    const authorization = await this.authorizationRepository.findOne({
      where: {
        usuarioAutorizadorId: autorizadorId,
        usuarioAutorizadoId: autorizadoId,
        esActivo: true,
      },
    });

    return !!authorization;
  }

  private async canViewRequisition(
    requisition: Requisition,
    userId: number,
  ): Promise<boolean> {
    // El creador siempre puede ver
    if (requisition.createdBy === userId) {
      return true;
    }

    // Verificar si es autorizador en la cadena
    const isAuthorizer = await this.isAuthorizer(userId, requisition.createdBy);

    return isAuthorizer;
  }
}
