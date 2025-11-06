import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';
import dataSource from '../data-source';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { Gestion } from '../entities/gestion.entity';
import { RoleGestion } from '../entities/role-gestion.entity';
import { User } from '../entities/user.entity';
import { Company } from '../entities/company.entity';
import { Project } from '../entities/project.entity';
import { OperationCenter } from '../entities/operation-center.entity';
import { ProjectCode } from '../entities/project-code.entity';
import { RequisitionPrefix } from '../entities/requisition-prefix.entity';
import { RequisitionSequence } from '../entities/requisition-sequence.entity';
import { RequisitionStatus } from '../entities/requisition-status.entity';
import { MaterialGroup } from '../entities/material-group.entity';
import { Material } from '../entities/material.entity';
import { Authorization } from '../entities/authorization.entity';

config();

async function seed() {
  try {
    await dataSource.initialize();
    console.log('Data Source has been initialized!');

    const roleRepository = dataSource.getRepository(Role);
    const permissionRepository = dataSource.getRepository(Permission);
    const rolePermissionRepository = dataSource.getRepository(RolePermission);
    const gestionRepository = dataSource.getRepository(Gestion);
    const roleGestionRepository = dataSource.getRepository(RoleGestion);
    const userRepository = dataSource.getRepository(User);
    const companyRepository = dataSource.getRepository(Company);
    const projectRepository = dataSource.getRepository(Project);
    const operationCenterRepository = dataSource.getRepository(OperationCenter);
    const projectCodeRepository = dataSource.getRepository(ProjectCode);
    const requisitionPrefixRepository =
      dataSource.getRepository(RequisitionPrefix);
    const requisitionSequenceRepository =
      dataSource.getRepository(RequisitionSequence);
    const requisitionStatusRepository =
      dataSource.getRepository(RequisitionStatus);
    const materialGroupRepository = dataSource.getRepository(MaterialGroup);
    const materialRepository = dataSource.getRepository(Material);
    const authorizationRepository = dataSource.getRepository(Authorization);

    // Clear existing data (in reverse order of dependencies)
    console.log('Clearing existing data...');
    await dataSource.query(
      'TRUNCATE TABLE "autorizaciones" RESTART IDENTITY CASCADE',
    );
    await dataSource.query(
      'TRUNCATE TABLE "requisition_logs" RESTART IDENTITY CASCADE',
    );
    await dataSource.query(
      'TRUNCATE TABLE "requisition_items" RESTART IDENTITY CASCADE',
    );
    await dataSource.query(
      'TRUNCATE TABLE "requisitions" RESTART IDENTITY CASCADE',
    );
    await dataSource.query(
      'TRUNCATE TABLE "materials" RESTART IDENTITY CASCADE',
    );
    await dataSource.query(
      'TRUNCATE TABLE "material_groups" RESTART IDENTITY CASCADE',
    );
    await dataSource.query(
      'TRUNCATE TABLE "requisition_sequences" RESTART IDENTITY CASCADE',
    );
    await dataSource.query(
      'TRUNCATE TABLE "requisition_prefixes" RESTART IDENTITY CASCADE',
    );
    await dataSource.query(
      'TRUNCATE TABLE "project_codes" RESTART IDENTITY CASCADE',
    );
    await dataSource.query(
      'TRUNCATE TABLE "operation_centers" RESTART IDENTITY CASCADE',
    );
    await dataSource.query(
      'TRUNCATE TABLE "projects" RESTART IDENTITY CASCADE',
    );
    await dataSource.query(
      'TRUNCATE TABLE "companies" RESTART IDENTITY CASCADE',
    );
    await dataSource.query(
      'TRUNCATE TABLE "roles_permisos" RESTART IDENTITY CASCADE',
    );
    await dataSource.query(
      'TRUNCATE TABLE "roles_gestiones" RESTART IDENTITY CASCADE',
    );
    await dataSource.query('TRUNCATE TABLE "users" RESTART IDENTITY CASCADE');
    await dataSource.query(
      'TRUNCATE TABLE "permisos" RESTART IDENTITY CASCADE',
    );
    await dataSource.query(
      'TRUNCATE TABLE "gestiones" RESTART IDENTITY CASCADE',
    );
    await dataSource.query('TRUNCATE TABLE "roles" RESTART IDENTITY CASCADE');
    await dataSource.query(
      'TRUNCATE TABLE "requisition_statuses" RESTART IDENTITY CASCADE',
    );

    // ============================================
    // 1. SEED ROLES - Según organigrama completo
    // ============================================
    console.log('Seeding roles...');
    const rolesData = [
      {
        nombreRol: 'Gerencia',
        descripcion: 'Aprueba requisiciones revisadas por el nivel anterior',
      },
      {
        nombreRol: 'Director PMO',
        descripcion: 'Dirige área de PMO y revisa requisiciones de analistas',
      },
      {
        nombreRol: 'Director Comercial',
        descripcion:
          'Dirige área comercial y revisa requisiciones de analistas',
      },
      {
        nombreRol: 'Director Jurídico',
        descripcion: 'Dirige área jurídica y revisa requisiciones de analistas',
      },
      {
        nombreRol: 'Director Técnico',
        descripcion:
          'Revisa requisiciones de Dirección Operativa y crea las propias',
      },
      {
        nombreRol: 'Director Financiero y Administrativo',
        descripcion:
          'Dirige área financiera y administrativa, revisa requisiciones',
      },
      {
        nombreRol: 'Director de Proyecto Antioquia',
        descripcion: 'Supervisa PQRS de Antioquia y crea requisiciones propias',
      },
      {
        nombreRol: 'Director de Proyecto Quindío',
        descripcion: 'Supervisa PQRS de Quindío y crea requisiciones propias',
      },
      {
        nombreRol: 'Director de Proyecto Valle',
        descripcion: 'Supervisa PQRS de Valle y crea requisiciones propias',
      },
      {
        nombreRol: 'Director de Proyecto Putumayo',
        descripcion: 'Supervisa PQRS de Putumayo y crea requisiciones propias',
      },
      {
        nombreRol: 'Analista PMO',
        descripcion: 'Crea requisiciones, reporta a Director PMO',
      },
      {
        nombreRol: 'Analista Comercial',
        descripcion: 'Crea requisiciones, reporta a Director Comercial',
      },
      {
        nombreRol: 'Analista Jurídico',
        descripcion: 'Crea requisiciones, reporta a Director Jurídico',
      },
      {
        nombreRol: 'Analista Administrativo',
        descripcion:
          'Crea requisiciones, reporta a Director Financiero y Administrativo',
      },
      {
        nombreRol: 'Coordinador Financiero',
        descripcion:
          'Crea requisiciones, reporta a Director Financiero y Administrativo',
      },
      {
        nombreRol: 'Coordinador Jurídico',
        descripcion: 'Crea requisiciones, reporta a Director Jurídico',
      },
      {
        nombreRol: 'PQRS El Cerrito',
        descripcion: 'Crea requisiciones locales de El Cerrito',
      },
      {
        nombreRol: 'PQRS Guacarí',
        descripcion: 'Crea requisiciones locales de Guacarí',
      },
      {
        nombreRol: 'PQRS Circasia',
        descripcion: 'Crea requisiciones locales de Circasia',
      },
      {
        nombreRol: 'PQRS Quimbaya',
        descripcion: 'Crea requisiciones locales de Quimbaya',
      },
      {
        nombreRol: 'PQRS Jericó',
        descripcion: 'Crea requisiciones locales de Jericó',
      },
      {
        nombreRol: 'PQRS Ciudad Bolívar',
        descripcion: 'Crea requisiciones locales de Ciudad Bolívar',
      },
      {
        nombreRol: 'PQRS Tarso',
        descripcion: 'Crea requisiciones locales de Tarso',
      },
      {
        nombreRol: 'PQRS Pueblo Rico',
        descripcion: 'Crea requisiciones locales de Pueblo Rico',
      },
      {
        nombreRol: 'PQRS Santa Bárbara',
        descripcion: 'Crea requisiciones locales de Santa Bárbara',
      },
      {
        nombreRol: 'PQRS Puerto Asís',
        descripcion: 'Crea requisiciones locales de Puerto Asís',
      },
      {
        nombreRol: 'Compras',
        descripcion:
          'Cotiza y gestiona órdenes de compra, no crea requisiciones',
      },
    ];

    const roles = await roleRepository.save(rolesData);
    console.log(`✅ Created ${roles.length} roles`);

    // ============================================
    // 2. SEED PERMISSIONS
    // ============================================
    console.log('Seeding permissions...');
    const permissionsData = [
      { nombrePermiso: 'Ver', descripcion: 'Permiso para ver recursos' },
      { nombrePermiso: 'Crear', descripcion: 'Permiso para crear recursos' },
      {
        nombrePermiso: 'Revisar',
        descripcion: 'Permiso para revisar/editar recursos',
      },
      {
        nombrePermiso: 'Aprobar',
        descripcion: 'Permiso para aprobar requisiciones',
      },
      { nombrePermiso: 'Cotizar', descripcion: 'Permiso para cotizar' },
      { nombrePermiso: 'Exportar', descripcion: 'Permiso para exportar datos' },
    ];

    const permissions = await permissionRepository.save(permissionsData);
    console.log(`✅ Created ${permissions.length} permissions`);

    // ============================================
    // 3. SEED GESTIONES (Modules)
    // ============================================
    console.log('Seeding gestiones...');
    const gestionesData = [
      { nombre: 'Dashboard', slug: 'dashboard', icono: 'LayoutDashboard' },
      { nombre: 'Compras', slug: 'compras', icono: 'ShoppingCart' },
      { nombre: 'Inventarios', slug: 'inventarios', icono: 'Package' },
      { nombre: 'Reportes', slug: 'reportes', icono: 'BarChart3' },
      { nombre: 'Usuarios', slug: 'usuarios', icono: 'Users' },
      { nombre: 'Proveedores', slug: 'proveedores', icono: 'Building2' },
      { nombre: 'Auditorías', slug: 'auditorias', icono: 'FileText' },
      {
        nombre: 'Notificaciones',
        slug: 'notificaciones',
        icono: 'Bell',
      },
    ];

    const gestiones = await gestionRepository.save(gestionesData);
    console.log(`✅ Created ${gestiones.length} gestiones`);

    // ============================================
    // 4. ASSIGN GESTIONES TO ROLES (todos tienen acceso a Compras)
    // ============================================
    console.log('Assigning gestiones to roles...');
    const comprasGestion = gestiones.find((g) => g.slug === 'compras');
    if (comprasGestion) {
      const allRoleGestiones = roles.map((role) => ({
        rolId: role.rolId,
        gestionId: comprasGestion.gestionId,
      }));
      await roleGestionRepository.save(allRoleGestiones);
      console.log(`✅ Assigned Compras gestion to all ${roles.length} roles`);
    }

    // ============================================
    // 5. SEED COMPANIES
    // ============================================
    console.log('Seeding companies...');
    const companiesData = [
      { name: 'Canales & Contactos' },
      { name: 'Unión Temporal Alumbrado Público El Cerrito' },
      { name: 'Unión Temporal Alumbrado Público Circasia' },
      { name: 'Unión Temporal Alumbrado Público Guacarí' },
      { name: 'Unión Temporal Alumbrado Público Jamundí' },
      { name: 'Unión Temporal Alumbrado Público Puerto Asís' },
      { name: 'Unión Temporal Alumbrado Público Quimbaya' },
      { name: 'Unión Temporal Alumbrado Público Santa Bárbara' },
    ];

    const companies = await companyRepository.save(companiesData);
    console.log(`✅ Created ${companies.length} companies`);

    // ============================================
    // 6. SEED PROJECTS (solo para Canales & Contactos)
    // ============================================
    console.log('Seeding projects...');
    const canalesCompany = companies.find((c) =>
      c.name.includes('Canales & Contactos'),
    )!;
    const projectsData = [
      { companyId: canalesCompany.companyId, name: 'Administrativo' },
      { companyId: canalesCompany.companyId, name: 'Ciudad Bolívar' },
      { companyId: canalesCompany.companyId, name: 'Jericó' },
      { companyId: canalesCompany.companyId, name: 'Pueblo Rico' },
      { companyId: canalesCompany.companyId, name: 'Tarso' },
    ];

    const projects = await projectRepository.save(projectsData);
    console.log(`✅ Created ${projects.length} projects`);

    // ============================================
    // 7. SEED OPERATION CENTERS
    // ============================================
    console.log('Seeding operation centers...');
    const operationCentersData = [
      // Canales & Contactos projects
      {
        companyId: canalesCompany.companyId,
        projectId: projects.find((p) => p.name === 'Administrativo')!.projectId,
        code: '8',
      },
      {
        companyId: canalesCompany.companyId,
        projectId: projects.find((p) => p.name === 'Ciudad Bolívar')!.projectId,
        code: '961',
      },
      {
        companyId: canalesCompany.companyId,
        projectId: projects.find((p) => p.name === 'Jericó')!.projectId,
        code: '960',
      },
      {
        companyId: canalesCompany.companyId,
        projectId: projects.find((p) => p.name === 'Pueblo Rico')!.projectId,
        code: '962',
      },
      {
        companyId: canalesCompany.companyId,
        projectId: projects.find((p) => p.name === 'Tarso')!.projectId,
        code: '963',
      },
      // Uniones Temporales (sin projectId)
      {
        companyId: companies.find((c) => c.name.includes('El Cerrito'))!
          .companyId,
        projectId: undefined,
        code: '2',
      },
      {
        companyId: companies.find((c) => c.name.includes('Circasia'))!
          .companyId,
        projectId: undefined,
        code: '1',
      },
      {
        companyId: companies.find((c) => c.name.includes('Guacarí'))!.companyId,
        projectId: undefined,
        code: '3',
      },
      {
        companyId: companies.find((c) => c.name.includes('Jamundí'))!.companyId,
        projectId: undefined,
        code: '4',
      },
      {
        companyId: companies.find((c) => c.name.includes('Puerto Asís'))!
          .companyId,
        projectId: undefined,
        code: '5',
      },
      {
        companyId: companies.find((c) => c.name.includes('Quimbaya'))!
          .companyId,
        projectId: undefined,
        code: '6',
      },
      {
        companyId: companies.find((c) => c.name.includes('Santa Bárbara'))!
          .companyId,
        projectId: undefined,
        code: '7',
      },
    ];

    const operationCenters =
      await operationCenterRepository.save(operationCentersData);
    console.log(`✅ Created ${operationCenters.length} operation centers`);

    // ============================================
    // 8. SEED PROJECT CODES
    // ============================================
    console.log('Seeding project codes...');
    const projectCodesData = [
      {
        companyId: canalesCompany.companyId,
        projectId: projects.find((p) => p.name === 'Ciudad Bolívar')!.projectId,
        code: '08. C&C - Ciudad Bolívar - 2022',
      },
      {
        companyId: canalesCompany.companyId,
        projectId: projects.find((p) => p.name === 'Jericó')!.projectId,
        code: '07. C&C - Jericó - 2021',
      },
      {
        companyId: canalesCompany.companyId,
        projectId: projects.find((p) => p.name === 'Pueblo Rico')!.projectId,
        code: '09. C&C - Pueblorico - 2022',
      },
      {
        companyId: canalesCompany.companyId,
        projectId: projects.find((p) => p.name === 'Tarso')!.projectId,
        code: '10. C&C - Tarso - 2022',
      },
      {
        companyId: companies.find((c) => c.name.includes('El Cerrito'))!
          .companyId,
        projectId: undefined,
        code: '03. UT - El Cerrito - 2015',
      },
      {
        companyId: companies.find((c) => c.name.includes('Circasia'))!
          .companyId,
        projectId: undefined,
        code: '05. UT - Circasia - 2015',
      },
      {
        companyId: companies.find((c) => c.name.includes('Guacarí'))!.companyId,
        projectId: undefined,
        code: '01. UT - Guacarí - 2014',
      },
      {
        companyId: companies.find((c) => c.name.includes('Jamundí'))!.companyId,
        projectId: undefined,
        code: '02. UT - Jamundi - 2014',
      },
      {
        companyId: companies.find((c) => c.name.includes('Puerto Asís'))!
          .companyId,
        projectId: undefined,
        code: '06. UT - Puerto Asís - 2015',
      },
      {
        companyId: companies.find((c) => c.name.includes('Quimbaya'))!
          .companyId,
        projectId: undefined,
        code: '04. UT - Quimbaya - 2015',
      },
      {
        companyId: companies.find((c) => c.name.includes('Santa Bárbara'))!
          .companyId,
        projectId: undefined,
        code: '11. UT - Santa Bárbara - 2022',
      },
    ];

    const projectCodes = await projectCodeRepository.save(projectCodesData);
    console.log(`✅ Created ${projectCodes.length} project codes`);

    // ============================================
    // 9. SEED REQUISITION PREFIXES
    // ============================================
    console.log('Seeding requisition prefixes...');
    const requisitionPrefixesData = [
      {
        companyId: canalesCompany.companyId,
        projectId: undefined,
        prefix: 'C&C',
      },
      {
        companyId: canalesCompany.companyId,
        projectId: projects.find((p) => p.name === 'Administrativo')!.projectId,
        prefix: 'ADM',
      },
      {
        companyId: canalesCompany.companyId,
        projectId: projects.find((p) => p.name === 'Ciudad Bolívar')!.projectId,
        prefix: 'CB',
      },
      {
        companyId: canalesCompany.companyId,
        projectId: projects.find((p) => p.name === 'Jericó')!.projectId,
        prefix: 'JE',
      },
      {
        companyId: canalesCompany.companyId,
        projectId: projects.find((p) => p.name === 'Pueblo Rico')!.projectId,
        prefix: 'PR',
      },
      {
        companyId: canalesCompany.companyId,
        projectId: projects.find((p) => p.name === 'Tarso')!.projectId,
        prefix: 'TA',
      },
      {
        companyId: companies.find((c) => c.name.includes('El Cerrito'))!
          .companyId,
        projectId: undefined,
        prefix: 'CE',
      },
      {
        companyId: companies.find((c) => c.name.includes('Circasia'))!
          .companyId,
        projectId: undefined,
        prefix: 'CI',
      },
      {
        companyId: companies.find((c) => c.name.includes('Guacarí'))!.companyId,
        projectId: undefined,
        prefix: 'GU',
      },
      {
        companyId: companies.find((c) => c.name.includes('Jamundí'))!.companyId,
        projectId: undefined,
        prefix: 'JA',
      },
      {
        companyId: companies.find((c) => c.name.includes('Puerto Asís'))!
          .companyId,
        projectId: undefined,
        prefix: 'PA',
      },
      {
        companyId: companies.find((c) => c.name.includes('Quimbaya'))!
          .companyId,
        projectId: undefined,
        prefix: 'QY',
      },
      {
        companyId: companies.find((c) => c.name.includes('Santa Bárbara'))!
          .companyId,
        projectId: undefined,
        prefix: 'SB',
      },
    ];

    const requisitionPrefixes = await requisitionPrefixRepository.save(
      requisitionPrefixesData,
    );
    console.log(
      `✅ Created ${requisitionPrefixes.length} requisition prefixes`,
    );

    // ============================================
    // 10. SEED REQUISITION SEQUENCES (iniciar en 0)
    // ============================================
    console.log('Seeding requisition sequences...');
    const requisitionSequencesData = requisitionPrefixes.map((prefix) => ({
      prefixId: prefix.prefixId,
      lastNumber: 0,
    }));

    const requisitionSequences = await requisitionSequenceRepository.save(
      requisitionSequencesData,
    );
    console.log(
      `✅ Created ${requisitionSequences.length} requisition sequences`,
    );

    // ============================================
    // 11. SEED REQUISITION STATUSES
    // ============================================
    console.log('Seeding requisition statuses...');
    const requisitionStatusesData = [
      {
        code: 'pendiente',
        name: 'Pendiente',
        description: 'Requisición recién creada, sin revisar',
        color: 'gray',
        order: 1,
      },
      {
        code: 'en_revision',
        name: 'En revisión',
        description: 'En proceso de revisión por Director de área',
        color: 'blue',
        order: 2,
      },
      {
        code: 'aprobada_revisor',
        name: 'Aprobada por revisor',
        description: 'Lista para revisión de Gerencia',
        color: 'green',
        order: 3,
      },
      {
        code: 'aprobada_gerencia',
        name: 'Aprobada por gerencia',
        description: 'Lista para cotización por Compras',
        color: 'emerald',
        order: 4,
      },
      {
        code: 'rechazada_revisor',
        name: 'Rechazada por revisor',
        description: 'Devuelta al solicitante',
        color: 'orange',
        order: 5,
      },
      {
        code: 'rechazada_gerencia',
        name: 'Rechazada por gerencia',
        description: 'Devuelta al solicitante por Gerencia',
        color: 'red',
        order: 6,
      },
      {
        code: 'cotizada',
        name: 'Cotizada',
        description: 'Cotizaciones registradas',
        color: 'yellow',
        order: 7,
      },
      {
        code: 'en_orden_compra',
        name: 'En orden de compra',
        description: 'Orden generada y en trámite',
        color: 'indigo',
        order: 8,
      },
      {
        code: 'pendiente_recepcion',
        name: 'Pendiente de recepción',
        description: 'Orden emitida, en espera de materiales',
        color: 'purple',
        order: 9,
      },
      {
        code: 'finalizada',
        name: 'Finalizada',
        description: 'Recepción completada',
        color: 'teal',
        order: 10,
      },
    ];

    const requisitionStatuses = await requisitionStatusRepository.save(
      requisitionStatusesData,
    );
    console.log(
      `✅ Created ${requisitionStatuses.length} requisition statuses`,
    );

    // ============================================
    // 12. SEED MATERIAL GROUPS
    // ============================================
    console.log('Seeding material groups...');
    const materialGroupsData = [
      { name: 'Eléctrico' },
      { name: 'Construcción' },
      { name: 'Herramientas' },
      { name: 'Suministros de Oficina' },
      { name: 'Iluminación' },
      { name: 'Seguridad Industrial' },
    ];

    const materialGroups =
      await materialGroupRepository.save(materialGroupsData);
    console.log(`✅ Created ${materialGroups.length} material groups`);

    // ============================================
    // 13. SEED MATERIALS (catálogo básico)
    // ============================================
    console.log('Seeding materials...');
    const electricoGroup = materialGroups.find((g) => g.name === 'Eléctrico')!;
    const construccionGroup = materialGroups.find(
      (g) => g.name === 'Construcción',
    )!;
    const herramientasGroup = materialGroups.find(
      (g) => g.name === 'Herramientas',
    )!;
    const oficinaGroup = materialGroups.find(
      (g) => g.name === 'Suministros de Oficina',
    )!;
    const iluminacionGroup = materialGroups.find(
      (g) => g.name === 'Iluminación',
    )!;

    const materialsData = [
      {
        code: 'ELEC-001',
        description: 'Cable #10 AWG',
        groupId: electricoGroup.groupId,
      },
      {
        code: 'ELEC-002',
        description: 'Cable #12 AWG',
        groupId: electricoGroup.groupId,
      },
      {
        code: 'ELEC-003',
        description: 'Breaker 2x20A',
        groupId: electricoGroup.groupId,
      },
      {
        code: 'CONST-001',
        description: 'Poste de concreto 12m',
        groupId: construccionGroup.groupId,
      },
      {
        code: 'CONST-002',
        description: 'Cemento gris 50kg',
        groupId: construccionGroup.groupId,
      },
      {
        code: 'HERR-001',
        description: 'Alicate universal 8"',
        groupId: herramientasGroup.groupId,
      },
      {
        code: 'HERR-002',
        description: 'Destornillador plano',
        groupId: herramientasGroup.groupId,
      },
      {
        code: 'OFIC-001',
        description: 'Resma papel carta',
        groupId: oficinaGroup.groupId,
      },
      {
        code: 'OFIC-002',
        description: 'Carpeta AZ',
        groupId: oficinaGroup.groupId,
      },
      {
        code: 'ILUM-001',
        description: 'Lámpara LED 50W',
        groupId: iluminacionGroup.groupId,
      },
      {
        code: 'ILUM-002',
        description: 'Lámpara LED 100W',
        groupId: iluminacionGroup.groupId,
      },
      {
        code: 'ILUM-003',
        description: 'Reflector LED 150W',
        groupId: iluminacionGroup.groupId,
      },
    ];

    const materials = await materialRepository.save(materialsData);
    console.log(`✅ Created ${materials.length} materials`);

    // ============================================
    // 14. SEED TEST USERS (27 usuarios - uno por cada rol)
    // ============================================
    console.log('Seeding test users...');
    const hashedPassword = await bcrypt.hash('Canalco2025!', 10);

    // Obtener roles
    const gerenciaRole = roles.find((r) => r.nombreRol === 'Gerencia')!;
    const dirPMORole = roles.find((r) => r.nombreRol === 'Director PMO')!;
    const dirComercialRole = roles.find(
      (r) => r.nombreRol === 'Director Comercial',
    )!;
    const dirJuridicoRole = roles.find(
      (r) => r.nombreRol === 'Director Jurídico',
    )!;
    const dirTecnicoRole = roles.find(
      (r) => r.nombreRol === 'Director Técnico',
    )!;
    const dirFinancieroRole = roles.find(
      (r) => r.nombreRol === 'Director Financiero y Administrativo',
    )!;
    const dirProyAntioquiaRole = roles.find(
      (r) => r.nombreRol === 'Director de Proyecto Antioquia',
    )!;
    const dirProyQuindioRole = roles.find(
      (r) => r.nombreRol === 'Director de Proyecto Quindío',
    )!;
    const dirProyValleRole = roles.find(
      (r) => r.nombreRol === 'Director de Proyecto Valle',
    )!;
    const dirProyPutumayoRole = roles.find(
      (r) => r.nombreRol === 'Director de Proyecto Putumayo',
    )!;
    const analistaPMORole = roles.find((r) => r.nombreRol === 'Analista PMO')!;
    const analistaComercialRole = roles.find(
      (r) => r.nombreRol === 'Analista Comercial',
    )!;
    const analistaJuridicoRole = roles.find(
      (r) => r.nombreRol === 'Analista Jurídico',
    )!;
    const analistaAdminRole = roles.find(
      (r) => r.nombreRol === 'Analista Administrativo',
    )!;
    const coordFinancieroRole = roles.find(
      (r) => r.nombreRol === 'Coordinador Financiero',
    )!;
    const coordJuridicoRole = roles.find(
      (r) => r.nombreRol === 'Coordinador Jurídico',
    )!;
    const pqrsElCerritoRole = roles.find(
      (r) => r.nombreRol === 'PQRS El Cerrito',
    )!;
    const pqrsGuacariRole = roles.find((r) => r.nombreRol === 'PQRS Guacarí')!;
    const pqrsCircasiaRole = roles.find(
      (r) => r.nombreRol === 'PQRS Circasia',
    )!;
    const pqrsQuimbayaRole = roles.find(
      (r) => r.nombreRol === 'PQRS Quimbaya',
    )!;
    const pqrsJericoRole = roles.find((r) => r.nombreRol === 'PQRS Jericó')!;
    const pqrsCiudadBolivarRole = roles.find(
      (r) => r.nombreRol === 'PQRS Ciudad Bolívar',
    )!;
    const pqrsTarsoRole = roles.find((r) => r.nombreRol === 'PQRS Tarso')!;
    const pqrsPuebloRicoRole = roles.find(
      (r) => r.nombreRol === 'PQRS Pueblo Rico',
    )!;
    const pqrsSantaBarbaraRole = roles.find(
      (r) => r.nombreRol === 'PQRS Santa Bárbara',
    )!;
    const pqrsPuertoAsisRole = roles.find(
      (r) => r.nombreRol === 'PQRS Puerto Asís',
    )!;
    const comprasRole = roles.find((r) => r.nombreRol === 'Compras')!;

    const usersData = [
      // Gerencia
      {
        email: 'gerencia@canalco.com',
        password: hashedPassword,
        nombre: 'Laura Pérez',
        cargo: 'Gerente General',
        rolId: gerenciaRole.rolId,
        estado: true,
      },
      // Directores de Área
      {
        email: 'director.pmo@canalco.com',
        password: hashedPassword,
        nombre: 'Roberto Mendoza',
        cargo: 'Director PMO',
        rolId: dirPMORole.rolId,
        estado: true,
      },
      {
        email: 'director.comercial@canalco.com',
        password: hashedPassword,
        nombre: 'Patricia Vargas',
        cargo: 'Directora Comercial',
        rolId: dirComercialRole.rolId,
        estado: true,
      },
      {
        email: 'director.juridico@canalco.com',
        password: hashedPassword,
        nombre: 'Andrés Morales',
        cargo: 'Director Jurídico',
        rolId: dirJuridicoRole.rolId,
        estado: true,
      },
      {
        email: 'director.tecnico@canalco.com',
        password: hashedPassword,
        nombre: 'Carlos Rivas',
        cargo: 'Director Técnico',
        rolId: dirTecnicoRole.rolId,
        estado: true,
      },
      {
        email: 'director.financiero@canalco.com',
        password: hashedPassword,
        nombre: 'Diana Torres',
        cargo: 'Directora Financiera y Administrativa',
        rolId: dirFinancieroRole.rolId,
        estado: true,
      },
      // Directores de Proyecto
      {
        email: 'director.antioquia@canalco.com',
        password: hashedPassword,
        nombre: 'Ana Restrepo',
        cargo: 'Directora de Proyecto Antioquia',
        rolId: dirProyAntioquiaRole.rolId,
        estado: true,
      },
      {
        email: 'director.quindio@canalco.com',
        password: hashedPassword,
        nombre: 'Jorge Cardona',
        cargo: 'Director de Proyecto Quindío',
        rolId: dirProyQuindioRole.rolId,
        estado: true,
      },
      {
        email: 'director.valle@canalco.com',
        password: hashedPassword,
        nombre: 'Claudia Ramírez',
        cargo: 'Directora de Proyecto Valle',
        rolId: dirProyValleRole.rolId,
        estado: true,
      },
      {
        email: 'director.putumayo@canalco.com',
        password: hashedPassword,
        nombre: 'Miguel Ángel Castro',
        cargo: 'Director de Proyecto Putumayo',
        rolId: dirProyPutumayoRole.rolId,
        estado: true,
      },
      // Analistas y Coordinadores
      {
        email: 'analista.pmo@canalco.com',
        password: hashedPassword,
        nombre: 'Sandra Jiménez',
        cargo: 'Analista PMO',
        rolId: analistaPMORole.rolId,
        estado: true,
      },
      {
        email: 'analista.comercial@canalco.com',
        password: hashedPassword,
        nombre: 'Luis Fernando López',
        cargo: 'Analista Comercial',
        rolId: analistaComercialRole.rolId,
        estado: true,
      },
      {
        email: 'analista.juridico@canalco.com',
        password: hashedPassword,
        nombre: 'Carolina Herrera',
        cargo: 'Analista Jurídica',
        rolId: analistaJuridicoRole.rolId,
        estado: true,
      },
      {
        email: 'analista.admin@canalco.com',
        password: hashedPassword,
        nombre: 'Javier Sánchez',
        cargo: 'Analista Administrativo',
        rolId: analistaAdminRole.rolId,
        estado: true,
      },
      {
        email: 'coordinador.financiero@canalco.com',
        password: hashedPassword,
        nombre: 'Marcela Rojas',
        cargo: 'Coordinadora Financiera',
        rolId: coordFinancieroRole.rolId,
        estado: true,
      },
      {
        email: 'coordinador.juridico@canalco.com',
        password: hashedPassword,
        nombre: 'Ricardo Bermúdez',
        cargo: 'Coordinador Jurídico',
        rolId: coordJuridicoRole.rolId,
        estado: true,
      },
      // PQRS (Personal de campo)
      {
        email: 'pqrs.elcerrito@canalco.com',
        password: hashedPassword,
        nombre: 'Sofía Martínez',
        cargo: 'PQRS El Cerrito',
        rolId: pqrsElCerritoRole.rolId,
        estado: true,
      },
      {
        email: 'pqrs.guacari@canalco.com',
        password: hashedPassword,
        nombre: 'Juan Pablo García',
        cargo: 'PQRS Guacarí',
        rolId: pqrsGuacariRole.rolId,
        estado: true,
      },
      {
        email: 'pqrs.circasia@canalco.com',
        password: hashedPassword,
        nombre: 'María Fernanda Álvarez',
        cargo: 'PQRS Circasia',
        rolId: pqrsCircasiaRole.rolId,
        estado: true,
      },
      {
        email: 'pqrs.quimbaya@canalco.com',
        password: hashedPassword,
        nombre: 'Andrés Felipe Ospina',
        cargo: 'PQRS Quimbaya',
        rolId: pqrsQuimbayaRole.rolId,
        estado: true,
      },
      {
        email: 'pqrs.jerico@canalco.com',
        password: hashedPassword,
        nombre: 'Natalia Vélez',
        cargo: 'PQRS Jericó',
        rolId: pqrsJericoRole.rolId,
        estado: true,
      },
      {
        email: 'pqrs.ciudadbolivar@canalco.com',
        password: hashedPassword,
        nombre: 'Daniel Mejía',
        cargo: 'PQRS Ciudad Bolívar',
        rolId: pqrsCiudadBolivarRole.rolId,
        estado: true,
      },
      {
        email: 'pqrs.tarso@canalco.com',
        password: hashedPassword,
        nombre: 'Mario Gómez',
        cargo: 'PQRS Tarso',
        rolId: pqrsTarsoRole.rolId,
        estado: true,
      },
      {
        email: 'pqrs.pueblorico@canalco.com',
        password: hashedPassword,
        nombre: 'Laura Cristina Montoya',
        cargo: 'PQRS Pueblo Rico',
        rolId: pqrsPuebloRicoRole.rolId,
        estado: true,
      },
      {
        email: 'pqrs.santabarbara@canalco.com',
        password: hashedPassword,
        nombre: 'Camilo Andrés Quintero',
        cargo: 'PQRS Santa Bárbara',
        rolId: pqrsSantaBarbaraRole.rolId,
        estado: true,
      },
      {
        email: 'pqrs.puertoasis@canalco.com',
        password: hashedPassword,
        nombre: 'Valentina Garzón',
        cargo: 'PQRS Puerto Asís',
        rolId: pqrsPuertoAsisRole.rolId,
        estado: true,
      },
      // Compras
      {
        email: 'compras@canalco.com',
        password: hashedPassword,
        nombre: 'Paola Silva',
        cargo: 'Coordinadora de Compras',
        rolId: comprasRole.rolId,
        estado: true,
      },
    ];

    const users = await userRepository.save(usersData);
    console.log(`✅ Created ${users.length} test users`);

    // ============================================
    // 15. SEED AUTHORIZATIONS (jerarquía de supervisión completa)
    // ============================================
    console.log('Seeding authorizations...');

    // Obtener usuarios
    const gerenciaUser = users.find((u) => u.email === 'gerencia@canalco.com')!;
    const dirPMOUser = users.find((u) => u.email === 'director.pmo@canalco.com')!;
    const dirComercialUser = users.find(
      (u) => u.email === 'director.comercial@canalco.com',
    )!;
    const dirJuridicoUser = users.find(
      (u) => u.email === 'director.juridico@canalco.com',
    )!;
    const dirTecnicoUser = users.find(
      (u) => u.email === 'director.tecnico@canalco.com',
    )!;
    const dirFinancieroUser = users.find(
      (u) => u.email === 'director.financiero@canalco.com',
    )!;
    const dirProyAntioquiaUser = users.find(
      (u) => u.email === 'director.antioquia@canalco.com',
    )!;
    const dirProyQuindioUser = users.find(
      (u) => u.email === 'director.quindio@canalco.com',
    )!;
    const dirProyValleUser = users.find(
      (u) => u.email === 'director.valle@canalco.com',
    )!;
    const dirProyPutumayoUser = users.find(
      (u) => u.email === 'director.putumayo@canalco.com',
    )!;
    const analistaPMOUser = users.find(
      (u) => u.email === 'analista.pmo@canalco.com',
    )!;
    const analistaComercialUser = users.find(
      (u) => u.email === 'analista.comercial@canalco.com',
    )!;
    const analistaJuridicoUser = users.find(
      (u) => u.email === 'analista.juridico@canalco.com',
    )!;
    const analistaAdminUser = users.find(
      (u) => u.email === 'analista.admin@canalco.com',
    )!;
    const coordFinancieroUser = users.find(
      (u) => u.email === 'coordinador.financiero@canalco.com',
    )!;
    const coordJuridicoUser = users.find(
      (u) => u.email === 'coordinador.juridico@canalco.com',
    )!;

    // PQRS de cada región
    const pqrsElCerritoUser = users.find(
      (u) => u.email === 'pqrs.elcerrito@canalco.com',
    )!;
    const pqrsGuacariUser = users.find(
      (u) => u.email === 'pqrs.guacari@canalco.com',
    )!;
    const pqrsCircasiaUser = users.find(
      (u) => u.email === 'pqrs.circasia@canalco.com',
    )!;
    const pqrsQuimbayaUser = users.find(
      (u) => u.email === 'pqrs.quimbaya@canalco.com',
    )!;
    const pqrsJericoUser = users.find(
      (u) => u.email === 'pqrs.jerico@canalco.com',
    )!;
    const pqrsCiudadBolivarUser = users.find(
      (u) => u.email === 'pqrs.ciudadbolivar@canalco.com',
    )!;
    const pqrsTarsoUser = users.find(
      (u) => u.email === 'pqrs.tarso@canalco.com',
    )!;
    const pqrsPuebloRicoUser = users.find(
      (u) => u.email === 'pqrs.pueblorico@canalco.com',
    )!;
    const pqrsSantaBarbaraUser = users.find(
      (u) => u.email === 'pqrs.santabarbara@canalco.com',
    )!;
    const pqrsPuertoAsisUser = users.find(
      (u) => u.email === 'pqrs.puertoasis@canalco.com',
    )!;

    const authorizationsData = [
      // ============================================
      // FLUJO 1: PQRS → Director Proyecto → Director Técnico → Gerencia
      // ============================================

      // PQRS ANTIOQUIA (Jericó, Ciudad Bolívar, Tarso, Santa Bárbara)
      {
        usuarioAutorizadorId: dirProyAntioquiaUser.userId,
        usuarioAutorizadoId: pqrsJericoUser.userId,
        gestionId: comprasGestion!.gestionId,
        tipoAutorizacion: 'revision',
        nivel: 1,
        esActivo: true,
      },
      {
        usuarioAutorizadorId: dirProyAntioquiaUser.userId,
        usuarioAutorizadoId: pqrsCiudadBolivarUser.userId,
        gestionId: comprasGestion!.gestionId,
        tipoAutorizacion: 'revision',
        nivel: 1,
        esActivo: true,
      },
      {
        usuarioAutorizadorId: dirProyAntioquiaUser.userId,
        usuarioAutorizadoId: pqrsTarsoUser.userId,
        gestionId: comprasGestion!.gestionId,
        tipoAutorizacion: 'revision',
        nivel: 1,
        esActivo: true,
      },
      {
        usuarioAutorizadorId: dirProyAntioquiaUser.userId,
        usuarioAutorizadoId: pqrsSantaBarbaraUser.userId,
        gestionId: comprasGestion!.gestionId,
        tipoAutorizacion: 'revision',
        nivel: 1,
        esActivo: true,
      },

      // PQRS QUINDÍO (Circasia, Quimbaya)
      {
        usuarioAutorizadorId: dirProyQuindioUser.userId,
        usuarioAutorizadoId: pqrsCircasiaUser.userId,
        gestionId: comprasGestion!.gestionId,
        tipoAutorizacion: 'revision',
        nivel: 1,
        esActivo: true,
      },
      {
        usuarioAutorizadorId: dirProyQuindioUser.userId,
        usuarioAutorizadoId: pqrsQuimbayaUser.userId,
        gestionId: comprasGestion!.gestionId,
        tipoAutorizacion: 'revision',
        nivel: 1,
        esActivo: true,
      },

      // PQRS VALLE (El Cerrito, Guacarí, Pueblo Rico)
      {
        usuarioAutorizadorId: dirProyValleUser.userId,
        usuarioAutorizadoId: pqrsElCerritoUser.userId,
        gestionId: comprasGestion!.gestionId,
        tipoAutorizacion: 'revision',
        nivel: 1,
        esActivo: true,
      },
      {
        usuarioAutorizadorId: dirProyValleUser.userId,
        usuarioAutorizadoId: pqrsGuacariUser.userId,
        gestionId: comprasGestion!.gestionId,
        tipoAutorizacion: 'revision',
        nivel: 1,
        esActivo: true,
      },
      {
        usuarioAutorizadorId: dirProyValleUser.userId,
        usuarioAutorizadoId: pqrsPuebloRicoUser.userId,
        gestionId: comprasGestion!.gestionId,
        tipoAutorizacion: 'revision',
        nivel: 1,
        esActivo: true,
      },

      // PQRS PUTUMAYO (Puerto Asís)
      {
        usuarioAutorizadorId: dirProyPutumayoUser.userId,
        usuarioAutorizadoId: pqrsPuertoAsisUser.userId,
        gestionId: comprasGestion!.gestionId,
        tipoAutorizacion: 'revision',
        nivel: 1,
        esActivo: true,
      },

      // Directores de Proyecto → Director Técnico (nivel 2)
      {
        usuarioAutorizadorId: dirTecnicoUser.userId,
        usuarioAutorizadoId: dirProyAntioquiaUser.userId,
        gestionId: comprasGestion!.gestionId,
        tipoAutorizacion: 'revision',
        nivel: 2,
        esActivo: true,
      },
      {
        usuarioAutorizadorId: dirTecnicoUser.userId,
        usuarioAutorizadoId: dirProyQuindioUser.userId,
        gestionId: comprasGestion!.gestionId,
        tipoAutorizacion: 'revision',
        nivel: 2,
        esActivo: true,
      },
      {
        usuarioAutorizadorId: dirTecnicoUser.userId,
        usuarioAutorizadoId: dirProyValleUser.userId,
        gestionId: comprasGestion!.gestionId,
        tipoAutorizacion: 'revision',
        nivel: 2,
        esActivo: true,
      },
      {
        usuarioAutorizadorId: dirTecnicoUser.userId,
        usuarioAutorizadoId: dirProyPutumayoUser.userId,
        gestionId: comprasGestion!.gestionId,
        tipoAutorizacion: 'revision',
        nivel: 2,
        esActivo: true,
      },

      // ============================================
      // FLUJO 2 y 3: Director Técnico → Gerencia
      // ============================================
      {
        usuarioAutorizadorId: gerenciaUser.userId,
        usuarioAutorizadoId: dirTecnicoUser.userId,
        gestionId: comprasGestion!.gestionId,
        tipoAutorizacion: 'aprobacion',
        nivel: 3,
        esActivo: true,
      },

      // ============================================
      // FLUJO 4: Analistas/Coordinadores → Director Área → Gerencia
      // ============================================

      // Analista PMO → Director PMO
      {
        usuarioAutorizadorId: dirPMOUser.userId,
        usuarioAutorizadoId: analistaPMOUser.userId,
        gestionId: comprasGestion!.gestionId,
        tipoAutorizacion: 'revision',
        nivel: 1,
        esActivo: true,
      },

      // Analista Comercial → Director Comercial
      {
        usuarioAutorizadorId: dirComercialUser.userId,
        usuarioAutorizadoId: analistaComercialUser.userId,
        gestionId: comprasGestion!.gestionId,
        tipoAutorizacion: 'revision',
        nivel: 1,
        esActivo: true,
      },

      // Analista Jurídico → Director Jurídico
      {
        usuarioAutorizadorId: dirJuridicoUser.userId,
        usuarioAutorizadoId: analistaJuridicoUser.userId,
        gestionId: comprasGestion!.gestionId,
        tipoAutorizacion: 'revision',
        nivel: 1,
        esActivo: true,
      },

      // Coordinador Jurídico → Director Jurídico
      {
        usuarioAutorizadorId: dirJuridicoUser.userId,
        usuarioAutorizadoId: coordJuridicoUser.userId,
        gestionId: comprasGestion!.gestionId,
        tipoAutorizacion: 'revision',
        nivel: 1,
        esActivo: true,
      },

      // Analista Administrativo → Director Financiero
      {
        usuarioAutorizadorId: dirFinancieroUser.userId,
        usuarioAutorizadoId: analistaAdminUser.userId,
        gestionId: comprasGestion!.gestionId,
        tipoAutorizacion: 'revision',
        nivel: 1,
        esActivo: true,
      },

      // Coordinador Financiero → Director Financiero
      {
        usuarioAutorizadorId: dirFinancieroUser.userId,
        usuarioAutorizadoId: coordFinancieroUser.userId,
        gestionId: comprasGestion!.gestionId,
        tipoAutorizacion: 'revision',
        nivel: 1,
        esActivo: true,
      },

      // Directores de Área → Gerencia (aprobación nivel 2)
      {
        usuarioAutorizadorId: gerenciaUser.userId,
        usuarioAutorizadoId: dirPMOUser.userId,
        gestionId: comprasGestion!.gestionId,
        tipoAutorizacion: 'aprobacion',
        nivel: 2,
        esActivo: true,
      },
      {
        usuarioAutorizadorId: gerenciaUser.userId,
        usuarioAutorizadoId: dirComercialUser.userId,
        gestionId: comprasGestion!.gestionId,
        tipoAutorizacion: 'aprobacion',
        nivel: 2,
        esActivo: true,
      },
      {
        usuarioAutorizadorId: gerenciaUser.userId,
        usuarioAutorizadoId: dirJuridicoUser.userId,
        gestionId: comprasGestion!.gestionId,
        tipoAutorizacion: 'aprobacion',
        nivel: 2,
        esActivo: true,
      },
      {
        usuarioAutorizadorId: gerenciaUser.userId,
        usuarioAutorizadoId: dirFinancieroUser.userId,
        gestionId: comprasGestion!.gestionId,
        tipoAutorizacion: 'aprobacion',
        nivel: 2,
        esActivo: true,
      },
    ];

    const authorizations =
      await authorizationRepository.save(authorizationsData);
    console.log(`✅ Created ${authorizations.length} authorizations`);

    // ============================================
    // 16. SEED ROLE PERMISSIONS (permisos por rol para módulo Compras)
    // ============================================
    console.log('Seeding role permissions...');

    const verPermission = permissions.find((p) => p.nombrePermiso === 'Ver')!;
    const crearPermission = permissions.find(
      (p) => p.nombrePermiso === 'Crear',
    )!;
    const revisarPermission = permissions.find(
      (p) => p.nombrePermiso === 'Revisar',
    )!;
    const aprobarPermission = permissions.find(
      (p) => p.nombrePermiso === 'Aprobar',
    )!;
    const cotizarPermission = permissions.find(
      (p) => p.nombrePermiso === 'Cotizar',
    )!;

    const rolePermissionsData: any[] = [];

    // Función helper para agregar permisos a un rol
    const addRolePermissions = (roleName: string, permissionNames: string[]) => {
      const role = roles.find((r) => r.nombreRol === roleName);
      if (!role) return;

      permissionNames.forEach((permName) => {
        const permission = permissions.find((p) => p.nombrePermiso === permName);
        if (permission) {
          rolePermissionsData.push({
            rolId: role.rolId,
            permisoId: permission.permisoId,
          });
        }
      });
    };

    // PQRS (todos los municipios): Ver, Crear
    addRolePermissions('PQRS El Cerrito', ['Ver', 'Crear']);
    addRolePermissions('PQRS Guacarí', ['Ver', 'Crear']);
    addRolePermissions('PQRS Circasia', ['Ver', 'Crear']);
    addRolePermissions('PQRS Quimbaya', ['Ver', 'Crear']);
    addRolePermissions('PQRS Jericó', ['Ver', 'Crear']);
    addRolePermissions('PQRS Ciudad Bolívar', ['Ver', 'Crear']);
    addRolePermissions('PQRS Tarso', ['Ver', 'Crear']);
    addRolePermissions('PQRS Pueblo Rico', ['Ver', 'Crear']);
    addRolePermissions('PQRS Santa Bárbara', ['Ver', 'Crear']);
    addRolePermissions('PQRS Puerto Asís', ['Ver', 'Crear']);

    // Directores de Proyecto: Ver, Crear, Revisar
    addRolePermissions('Director de Proyecto Antioquia', [
      'Ver',
      'Crear',
      'Revisar',
    ]);
    addRolePermissions('Director de Proyecto Quindío', [
      'Ver',
      'Crear',
      'Revisar',
    ]);
    addRolePermissions('Director de Proyecto Valle', ['Ver', 'Crear', 'Revisar']);
    addRolePermissions('Director de Proyecto Putumayo', [
      'Ver',
      'Crear',
      'Revisar',
    ]);

    // Analistas y Coordinadores: Ver, Crear
    addRolePermissions('Analista PMO', ['Ver', 'Crear']);
    addRolePermissions('Analista Comercial', ['Ver', 'Crear']);
    addRolePermissions('Analista Jurídico', ['Ver', 'Crear']);
    addRolePermissions('Analista Administrativo', ['Ver', 'Crear']);
    addRolePermissions('Coordinador Financiero', ['Ver', 'Crear']);
    addRolePermissions('Coordinador Jurídico', ['Ver', 'Crear']);

    // Directores de Área: Ver, Crear, Revisar
    addRolePermissions('Director PMO', ['Ver', 'Crear', 'Revisar']);
    addRolePermissions('Director Comercial', ['Ver', 'Crear', 'Revisar']);
    addRolePermissions('Director Jurídico', ['Ver', 'Crear', 'Revisar']);
    addRolePermissions('Director Financiero y Administrativo', [
      'Ver',
      'Crear',
      'Revisar',
    ]);

    // Director Técnico: Ver, Crear, Revisar
    addRolePermissions('Director Técnico', ['Ver', 'Crear', 'Revisar']);

    // Gerencia: Ver, Aprobar
    addRolePermissions('Gerencia', ['Ver', 'Aprobar']);

    // Compras: Ver, Cotizar
    addRolePermissions('Compras', ['Ver', 'Cotizar']);

    const rolePermissions =
      await rolePermissionRepository.save(rolePermissionsData);
    console.log(`✅ Created ${rolePermissions.length} role permissions`);

    // ============================================
    // RESUMEN FINAL
    // ============================================
    console.log('\n' + '='.repeat(50));
    console.log('✅ Seeding completed successfully!');
    console.log('='.repeat(50));
    console.log('\n📊 Summary:');
    console.log(`   - ${roles.length} roles`);
    console.log(`   - ${permissions.length} permissions`);
    console.log(`   - ${rolePermissions.length} role permissions`);
    console.log(`   - ${gestiones.length} gestiones`);
    console.log(`   - ${companies.length} companies`);
    console.log(`   - ${projects.length} projects`);
    console.log(`   - ${operationCenters.length} operation centers`);
    console.log(`   - ${projectCodes.length} project codes`);
    console.log(`   - ${requisitionPrefixes.length} requisition prefixes`);
    console.log(`   - ${requisitionSequences.length} requisition sequences`);
    console.log(`   - ${requisitionStatuses.length} requisition statuses`);
    console.log(`   - ${materialGroups.length} material groups`);
    console.log(`   - ${materials.length} materials`);
    console.log(`   - ${users.length} test users (27 roles completos)`);
    console.log(`   - ${authorizations.length} authorizations (cadenas completas)`);
    console.log('\n🔑 Credenciales de prueba (Password: Canalco2025!):');
    console.log('\n   GERENCIA:');
    console.log('   - gerencia@canalco.com');
    console.log('\n   DIRECTORES DE ÁREA:');
    console.log('   - director.pmo@canalco.com');
    console.log('   - director.comercial@canalco.com');
    console.log('   - director.juridico@canalco.com');
    console.log('   - director.tecnico@canalco.com');
    console.log('   - director.financiero@canalco.com');
    console.log('\n   DIRECTORES DE PROYECTO:');
    console.log('   - director.antioquia@canalco.com');
    console.log('   - director.quindio@canalco.com');
    console.log('   - director.valle@canalco.com');
    console.log('   - director.putumayo@canalco.com');
    console.log('\n   ANALISTAS/COORDINADORES:');
    console.log('   - analista.pmo@canalco.com');
    console.log('   - analista.comercial@canalco.com');
    console.log('   - analista.juridico@canalco.com');
    console.log('   - analista.admin@canalco.com');
    console.log('   - coordinador.financiero@canalco.com');
    console.log('   - coordinador.juridico@canalco.com');
    console.log('\n   PQRS (10 municipios):');
    console.log('   - pqrs.elcerrito@canalco.com');
    console.log('   - pqrs.guacari@canalco.com');
    console.log('   - pqrs.circasia@canalco.com');
    console.log('   - pqrs.quimbaya@canalco.com');
    console.log('   - pqrs.jerico@canalco.com');
    console.log('   - pqrs.ciudadbolivar@canalco.com');
    console.log('   - pqrs.tarso@canalco.com');
    console.log('   - pqrs.pueblorico@canalco.com');
    console.log('   - pqrs.santabarbara@canalco.com');
    console.log('   - pqrs.puertoasis@canalco.com');
    console.log('\n   COMPRAS:');
    console.log('   - compras@canalco.com');
    console.log('\n' + '='.repeat(50) + '\n');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

seed();
