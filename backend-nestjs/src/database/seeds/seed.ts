import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';
import dataSource from '../data-source';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { Gestion } from '../entities/gestion.entity';
import { RoleGestion } from '../entities/role-gestion.entity';
import { User } from '../entities/user.entity';

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

    // Clear existing data (in reverse order of dependencies)
    console.log('Clearing existing data...');
    await dataSource.query('TRUNCATE TABLE "roles_permisos" CASCADE');
    await dataSource.query('TRUNCATE TABLE "roles_gestiones" CASCADE');
    await dataSource.query('TRUNCATE TABLE "users" CASCADE');
    await dataSource.query('TRUNCATE TABLE "permisos" CASCADE');
    await dataSource.query('TRUNCATE TABLE "gestiones" CASCADE');
    await dataSource.query('TRUNCATE TABLE "roles" RESTART IDENTITY CASCADE');

    // Seed Roles
    console.log('Seeding roles...');
    const rolesData = [
      { nombreRol: 'Administrador', descripcion: 'Acceso completo al sistema' },
      { nombreRol: 'Gerente', descripcion: 'Supervisa requisiciones y reportes' },
      { nombreRol: 'Compras', descripcion: 'Gestiona requisiciones y órdenes de compra' },
      { nombreRol: 'Almacen', descripcion: 'Control de inventarios y recepciones' },
      { nombreRol: 'PMO', descripcion: 'Administración y gobierno del sistema' },
      { nombreRol: 'Analista', descripcion: 'Acceso a reportes y analítica' },
    ];

    const roles = await roleRepository.save(rolesData);
    console.log(`Created ${roles.length} roles`);

    // Seed Permissions
    console.log('Seeding permissions...');
    const permissionsData = [
      { nombrePermiso: 'Ver', descripcion: 'Permiso para ver recursos' },
      { nombrePermiso: 'Crear', descripcion: 'Permiso para crear recursos' },
      { nombrePermiso: 'Editar', descripcion: 'Permiso para editar recursos' },
      { nombrePermiso: 'Eliminar', descripcion: 'Permiso para eliminar recursos' },
      { nombrePermiso: 'Aprobar', descripcion: 'Permiso para aprobar requisiciones' },
      { nombrePermiso: 'Exportar', descripcion: 'Permiso para exportar datos' },
    ];

    const permissions = await permissionRepository.save(permissionsData);
    console.log(`Created ${permissions.length} permissions`);

    // Seed Gestiones (Modules)
    console.log('Seeding gestiones...');
    const gestionesData = [
      { nombre: 'Dashboard', slug: 'dashboard', icono: 'dashboard' },
      { nombre: 'Compras', slug: 'compras', icono: 'shopping_cart' },
      { nombre: 'Inventarios', slug: 'inventarios', icono: 'inventory' },
      { nombre: 'Reportes', slug: 'reportes', icono: 'assessment' },
      { nombre: 'Usuarios', slug: 'usuarios', icono: 'people' },
      { nombre: 'Proveedores', slug: 'proveedores', icono: 'business' },
      { nombre: 'Auditorías', slug: 'auditorias', icono: 'history' },
      { nombre: 'Notificaciones', slug: 'notificaciones', icono: 'notifications' },
    ];

    const gestiones = await gestionRepository.save(gestionesData);
    console.log(`Created ${gestiones.length} gestiones`);

    // Assign all permissions to Admin role
    console.log('Assigning permissions to Admin role...');
    const adminRole = roles.find((r) => r.nombreRol === 'Administrador');
    if (adminRole) {
      const adminRolePermissions = permissions.map((permission) => ({
        rolId: adminRole.rolId,
        permisoId: permission.permisoId,
      }));
      await rolePermissionRepository.save(adminRolePermissions);
      console.log(`Assigned ${permissions.length} permissions to Admin role`);
    }

    // Assign all gestiones to Admin role
    console.log('Assigning gestiones to Admin role...');
    if (adminRole) {
      const adminRoleGestiones = gestiones.map((gestion) => ({
        rolId: adminRole.rolId,
        gestionId: gestion.gestionId,
      }));
      await roleGestionRepository.save(adminRoleGestiones);
      console.log(`Assigned ${gestiones.length} gestiones to Admin role`);
    }

    // Create admin user
    console.log('Creating admin user...');
    if (!adminRole) {
      throw new Error('Admin role not found. Cannot create admin user.');
    }
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await userRepository.save({
      email: 'admin@canalco.com',
      password: hashedPassword,
      nombre: 'Administrador General',
      cargo: 'Administrador del Sistema',
      rolId: adminRole.rolId,
      estado: true,
    });
    console.log('Admin user created:', adminUser.email);

    console.log('\nSeeding completed successfully! ✅');
    console.log('\nDefault credentials:');
    console.log('Email: admin@canalco.com');
    console.log('Password: admin123');

    await dataSource.destroy();
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seed();
