#!/usr/bin/env python3
"""
Database seeding script using SQLAlchemy ORM.

This script populates the database with initial data for roles, modules,
categories, permissions, and an admin user. It is idempotent and can be
run multiple times safely.

Usage:
    python -m scripts.seed_data

Or from backend directory:
    python scripts/seed_data.py
"""

import sys
from pathlib import Path

# Add parent directory to path to allow imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.core.database import SessionLocal
from app.models.auth.role import Role
from app.models.auth.module import Module
from app.models.auth.category import Category
from app.models.auth.permission import Permission
from app.models.auth.role_permission import RolePermission
from app.models.auth.user import User
from app.utils.security import hash_password


def seed_roles(session):
    """Seed base roles."""
    print("Seeding roles...")

    roles_data = [
        {
            "nombre_rol": "Administrador",
            "descripcion": "Acceso completo al sistema",
            "default_module": "dashboard"
        },
        {
            "nombre_rol": "Gerente",
            "descripcion": "Supervisa requisiciones y reportes",
            "default_module": "requisiciones"
        },
        {
            "nombre_rol": "Compras",
            "descripcion": "Gestiona requisiciones y órdenes de compra",
            "default_module": "requisiciones"
        },
        {
            "nombre_rol": "Almacen",
            "descripcion": "Control de inventarios y recepciones",
            "default_module": "inventarios"
        },
        {
            "nombre_rol": "PMO",
            "descripcion": "Administración y gobierno del sistema",
            "default_module": "dashboard"
        },
        {
            "nombre_rol": "Analista",
            "descripcion": "Acceso a reportes y analítica",
            "default_module": "reportes"
        },
    ]

    for role_data in roles_data:
        # Check if role exists
        stmt = select(Role).where(Role.nombre_rol == role_data["nombre_rol"])
        existing = session.execute(stmt).scalar_one_or_none()

        if existing:
            # Update existing role
            existing.descripcion = role_data["descripcion"]
            existing.default_module = role_data["default_module"]
            print(f"  ✓ Updated role: {role_data['nombre_rol']}")
        else:
            # Create new role
            role = Role(**role_data)
            session.add(role)
            print(f"  ✓ Created role: {role_data['nombre_rol']}")

    session.commit()
    print("✓ Roles seeded successfully\n")


def seed_modules(session):
    """Seed base modules."""
    print("Seeding modules...")

    modules_data = [
        {
            "clave": "dashboard",
            "nombre": "Dashboard",
            "descripcion": "Resumen ejecutivo y métricas clave",
            "icono": "dashboard",
            "orden": 1
        },
        {
            "clave": "compras",
            "nombre": "Compras",
            "descripcion": "Gestión integral de requisiciones y compras",
            "icono": "shopping-cart",
            "orden": 2
        },
        {
            "clave": "inventarios",
            "nombre": "Inventarios",
            "descripcion": "Control de existencias y movimientos",
            "icono": "boxes",
            "orden": 3
        },
        {
            "clave": "reportes",
            "nombre": "Reportes",
            "descripcion": "Analítica y reportería ejecutiva",
            "icono": "bar-chart",
            "orden": 4
        },
        {
            "clave": "usuarios",
            "nombre": "Usuarios",
            "descripcion": "Administración de usuarios y roles",
            "icono": "users",
            "orden": 5
        },
        {
            "clave": "proveedores",
            "nombre": "Proveedores",
            "descripcion": "Gestión de proveedores y homologaciones",
            "icono": "building",
            "orden": 6
        },
        {
            "clave": "auditorias",
            "nombre": "Auditorías",
            "descripcion": "Trazabilidad y cumplimiento normativo",
            "icono": "shield-check",
            "orden": 7
        },
        {
            "clave": "notificaciones",
            "nombre": "Notificaciones",
            "descripcion": "Alertas y comunicación automática",
            "icono": "bell",
            "orden": 8
        },
    ]

    for module_data in modules_data:
        # Check if module exists
        stmt = select(Module).where(Module.clave == module_data["clave"])
        existing = session.execute(stmt).scalar_one_or_none()

        if existing:
            # Update existing module
            existing.nombre = module_data["nombre"]
            existing.descripcion = module_data["descripcion"]
            existing.icono = module_data["icono"]
            existing.orden = module_data["orden"]
            print(f"  ✓ Updated module: {module_data['nombre']}")
        else:
            # Create new module
            module = Module(**module_data)
            session.add(module)
            print(f"  ✓ Created module: {module_data['nombre']}")

    session.commit()
    print("✓ Modules seeded successfully\n")


def seed_categories(session):
    """Seed categories for each module."""
    print("Seeding categories...")

    categories_data = [
        ("dashboard", "general", "Panel principal", "Indicadores y panel general", 1),
        ("compras", "requisiciones", "Requisiciones", "Gestión de requisiciones", 1),
        ("compras", "cotizaciones", "Cotizaciones", "Comparativo y análisis de proveedores", 2),
        ("compras", "ordenes_compra", "Órdenes de compra", "Autorización y seguimiento de OC", 3),
        ("inventarios", "existencias", "Existencias", "Control de stock y niveles", 1),
        ("inventarios", "movimientos", "Movimientos", "Entradas y salidas de inventario", 2),
        ("reportes", "compras", "Reportes de compras", "Indicadores del módulo de compras", 1),
        ("reportes", "finanzas", "Reportes financieros", "Visualizaciones financieras", 2),
        ("reportes", "inventarios", "Reportes de inventario", "Niveles y rotación de inventarios", 3),
        ("usuarios", "gestion", "Gestión de usuarios", "Alta, baja y modificación de usuarios", 1),
        ("proveedores", "registro", "Registro de proveedores", "Alta y mantenimiento de proveedores", 1),
        ("proveedores", "evaluacion", "Evaluación de proveedores", "Seguimiento de desempeño", 2),
        ("auditorias", "trazabilidad", "Trazabilidad", "Bitácora y auditorías cruzadas", 1),
        ("notificaciones", "alertas", "Alertas", "Notificaciones y recordatorios", 1),
    ]

    for modulo_clave, clave, nombre, descripcion, orden in categories_data:
        # Get module
        stmt = select(Module).where(Module.clave == modulo_clave)
        module = session.execute(stmt).scalar_one_or_none()

        if not module:
            print(f"  ⚠ Module not found: {modulo_clave}, skipping category {clave}")
            continue

        # Check if category exists
        stmt = select(Category).where(
            Category.modulo_id == module.modulo_id,
            Category.clave == clave
        )
        existing = session.execute(stmt).scalar_one_or_none()

        if existing:
            # Update existing category
            existing.nombre = nombre
            existing.descripcion = descripcion
            existing.orden = orden
            print(f"  ✓ Updated category: {modulo_clave}/{clave}")
        else:
            # Create new category
            category = Category(
                modulo_id=module.modulo_id,
                clave=clave,
                nombre=nombre,
                descripcion=descripcion,
                orden=orden
            )
            session.add(category)
            print(f"  ✓ Created category: {modulo_clave}/{clave}")

    session.commit()
    print("✓ Categories seeded successfully\n")


def seed_permissions(session):
    """Seed base permissions."""
    print("Seeding permissions...")

    permissions_data = [
        ("ver", "Ver", "Permite visualizar registros"),
        ("crear", "Crear", "Permite crear nuevos registros"),
        ("editar", "Editar", "Permite modificar registros existentes"),
        ("aprobar", "Aprobar", "Permite aprobar o autorizar registros"),
        ("eliminar", "Eliminar", "Permite eliminar registros"),
        ("exportar", "Exportar", "Permite exportar información"),
    ]

    for clave, nombre, descripcion in permissions_data:
        # Check if permission exists
        stmt = select(Permission).where(Permission.clave == clave)
        existing = session.execute(stmt).scalar_one_or_none()

        if existing:
            # Update existing permission
            existing.nombre_permiso = nombre
            existing.descripcion = descripcion
            print(f"  ✓ Updated permission: {nombre}")
        else:
            # Create new permission
            permission = Permission(
                clave=clave,
                nombre_permiso=nombre,
                descripcion=descripcion
            )
            session.add(permission)
            print(f"  ✓ Created permission: {nombre}")

    session.commit()
    print("✓ Permissions seeded successfully\n")


def seed_admin_permissions(session):
    """Grant all permissions to Administrador role."""
    print("Assigning permissions to Administrador role...")

    # Get Administrador role
    stmt = select(Role).where(Role.nombre_rol == "Administrador")
    admin_role = session.execute(stmt).scalar_one_or_none()

    if not admin_role:
        print("  ⚠ Administrador role not found, skipping permission assignment")
        return

    # Get all categories
    categories = session.execute(select(Category)).scalars().all()

    # Get all permissions
    permissions = session.execute(select(Permission)).scalars().all()

    count_created = 0
    count_existing = 0

    # Assign all permissions for all module/category combinations to admin
    for category in categories:
        for permission in permissions:
            # Check if assignment exists
            stmt = select(RolePermission).where(
                RolePermission.rol_id == admin_role.rol_id,
                RolePermission.modulo_id == category.modulo_id,
                RolePermission.categoria_id == category.categoria_id,
                RolePermission.permiso_id == permission.permiso_id
            )
            existing = session.execute(stmt).scalar_one_or_none()

            if not existing:
                # Create new assignment
                role_perm = RolePermission(
                    rol_id=admin_role.rol_id,
                    modulo_id=category.modulo_id,
                    categoria_id=category.categoria_id,
                    permiso_id=permission.permiso_id,
                    alcance="total"
                )
                session.add(role_perm)
                count_created += 1
            else:
                count_existing += 1

    session.commit()
    print(f"  ✓ Created {count_created} new permission assignments")
    print(f"  ✓ Found {count_existing} existing permission assignments")
    print("✓ Admin permissions assigned successfully\n")


def seed_admin_user(session):
    """Create default admin user."""
    print("Creating admin user...")

    admin_email = "admin@canalco.com"

    # Check if admin user exists
    stmt = select(User).where(User.email == admin_email)
    existing = session.execute(stmt).scalar_one_or_none()

    if existing:
        print(f"  ✓ Admin user already exists: {admin_email}")
        return

    # Get Administrador role
    stmt = select(Role).where(Role.nombre_rol == "Administrador")
    admin_role = session.execute(stmt).scalar_one_or_none()

    if not admin_role:
        print("  ⚠ Administrador role not found, cannot create admin user")
        return

    # Create admin user
    # Default password: "admin123" (should be changed on first login)
    admin_user = User(
        email=admin_email,
        password=hash_password("admin123"),
        nombre="Administrador del Sistema",
        cargo="Administrador",
        rol_id=admin_role.rol_id,
        estado=True,
        must_reset=True  # Force password change on first login
    )

    session.add(admin_user)
    session.commit()

    print(f"  ✓ Created admin user: {admin_email}")
    print(f"  ℹ Default password: admin123 (must be changed on first login)")
    print("✓ Admin user created successfully\n")


def main():
    """Run all seeding functions."""
    print("=" * 60)
    print("CANALCO DATABASE SEEDING")
    print("=" * 60)
    print()

    try:
        session = SessionLocal()

        # Run seeding in order (respecting foreign key dependencies)
        seed_roles(session)
        seed_modules(session)
        seed_categories(session)
        seed_permissions(session)
        seed_admin_permissions(session)
        seed_admin_user(session)

        print("=" * 60)
        print("✓ ALL SEEDING COMPLETED SUCCESSFULLY")
        print("=" * 60)

    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        session.close()


if __name__ == "__main__":
    main()
