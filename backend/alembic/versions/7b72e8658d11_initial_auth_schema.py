"""initial_auth_schema

Revision ID: 7b72e8658d11
Revises:
Create Date: 2025-11-04 19:42:40.376442

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '7b72e8658d11'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create auth schema
    op.execute("CREATE SCHEMA IF NOT EXISTS auth")

    # Create roles table
    op.create_table(
        'roles',
        sa.Column('rol_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('nombre_rol', sa.String(length=50), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.Column('default_module', sa.String(length=50), nullable=True),
        sa.PrimaryKeyConstraint('rol_id'),
        sa.UniqueConstraint('nombre_rol'),
        schema='auth'
    )

    # Create permisos table
    op.create_table(
        'permisos',
        sa.Column('permiso_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('nombre_permiso', sa.String(length=100), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.Column('clave', sa.String(length=100), nullable=False),
        sa.Column('es_activo', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('creado_en', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('actualizado_en', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('permiso_id'),
        sa.UniqueConstraint('nombre_permiso'),
        sa.UniqueConstraint('clave', name='uq_auth_permisos_clave'),
        schema='auth'
    )
    op.create_index('idx_auth_permisos_activo', 'permisos', ['es_activo'], schema='auth')

    # Create users table
    op.create_table(
        'users',
        sa.Column('user_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('email', sa.String(length=120), nullable=False),
        sa.Column('password', sa.String(length=255), nullable=False),
        sa.Column('nombre', sa.String(length=120), nullable=False),
        sa.Column('cargo', sa.String(length=120), nullable=True),
        sa.Column('rol_id', sa.Integer(), nullable=False),
        sa.Column('estado', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('creado_en', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('ultimo_login', sa.DateTime(timezone=True), nullable=True),
        sa.Column('must_reset', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.ForeignKeyConstraint(['rol_id'], ['auth.roles.rol_id']),
        sa.PrimaryKeyConstraint('user_id'),
        sa.UniqueConstraint('email'),
        schema='auth'
    )
    op.create_index('idx_auth_users_email', 'users', ['email'], schema='auth')

    # Create modulos table
    op.create_table(
        'modulos',
        sa.Column('modulo_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('clave', sa.String(length=50), nullable=False),
        sa.Column('nombre', sa.String(length=100), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.Column('icono', sa.String(length=120), nullable=True),
        sa.Column('es_activo', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('orden', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('creado_en', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('actualizado_en', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('modulo_id'),
        sa.UniqueConstraint('clave'),
        schema='auth'
    )
    op.create_index('idx_auth_modulos_activos', 'modulos', ['es_activo'], schema='auth')
    op.create_index('idx_auth_modulos_orden', 'modulos', ['orden'], schema='auth')

    # Create categorias table
    op.create_table(
        'categorias',
        sa.Column('categoria_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('modulo_id', sa.Integer(), nullable=False),
        sa.Column('clave', sa.String(length=50), nullable=False),
        sa.Column('nombre', sa.String(length=100), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.Column('es_activo', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('orden', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('creado_en', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('actualizado_en', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['modulo_id'], ['auth.modulos.modulo_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('categoria_id'),
        sa.UniqueConstraint('modulo_id', 'clave'),
        sa.UniqueConstraint('modulo_id', 'nombre'),
        schema='auth'
    )
    op.create_index('idx_auth_categorias_modulo', 'categorias', ['modulo_id'], schema='auth')
    op.create_index('idx_auth_categorias_activos', 'categorias', ['es_activo'], schema='auth')

    # Create roles_permisos_modulo_categoria table
    op.create_table(
        'roles_permisos_modulo_categoria',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('rol_id', sa.Integer(), nullable=False),
        sa.Column('modulo_id', sa.Integer(), nullable=False),
        sa.Column('categoria_id', sa.Integer(), nullable=False),
        sa.Column('permiso_id', sa.Integer(), nullable=False),
        sa.Column('alcance', sa.String(length=50), nullable=False, server_default=sa.text("'total'")),
        sa.Column('restricciones', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('creado_en', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('actualizado_en', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['rol_id'], ['auth.roles.rol_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['modulo_id'], ['auth.modulos.modulo_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['categoria_id'], ['auth.categorias.categoria_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['permiso_id'], ['auth.permisos.permiso_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('rol_id', 'modulo_id', 'categoria_id', 'permiso_id',
                          name='uq_roles_permisos_modulo_categoria'),
        schema='auth'
    )
    op.create_index('idx_auth_rpmc_modulo', 'roles_permisos_modulo_categoria', ['modulo_id'], schema='auth')
    op.create_index('idx_auth_rpmc_categoria', 'roles_permisos_modulo_categoria', ['categoria_id'], schema='auth')
    op.create_index('idx_auth_rpmc_permiso', 'roles_permisos_modulo_categoria', ['permiso_id'], schema='auth')

    # Create autorizaciones table
    op.create_table(
        'autorizaciones',
        sa.Column('autorizacion_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('supervisor_id', sa.Integer(), nullable=False),
        sa.Column('subordinado_id', sa.Integer(), nullable=False),
        sa.Column('modulo_id', sa.Integer(), nullable=True),
        sa.Column('categoria_id', sa.Integer(), nullable=True),
        sa.Column('tipo', sa.String(length=50), nullable=False, server_default=sa.text("'aprobacion'")),
        sa.Column('nivel', sa.SmallInteger(), nullable=False, server_default=sa.text('1')),
        sa.Column('es_activo', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('creado_en', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('actualizado_en', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['supervisor_id'], ['auth.users.user_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['subordinado_id'], ['auth.users.user_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['modulo_id'], ['auth.modulos.modulo_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['categoria_id'], ['auth.categorias.categoria_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('autorizacion_id'),
        sa.UniqueConstraint('supervisor_id', 'subordinado_id', 'modulo_id', 'categoria_id', 'tipo',
                          name='uq_auth_autorizaciones_relacion'),
        schema='auth'
    )
    op.create_index('idx_auth_autorizaciones_supervisor', 'autorizaciones', ['supervisor_id'], schema='auth')
    op.create_index('idx_auth_autorizaciones_subordinado', 'autorizaciones', ['subordinado_id'], schema='auth')
    op.create_index('idx_auth_autorizaciones_modulo', 'autorizaciones', ['modulo_id'], schema='auth')

    # Create bitacora_accesos table
    op.create_table(
        'bitacora_accesos',
        sa.Column('bitacora_id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('email', sa.String(length=120), nullable=False),
        sa.Column('resultado', sa.String(length=20), nullable=False),
        sa.Column('mensaje', sa.Text(), nullable=True),
        sa.Column('ip_origen', postgresql.INET(), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('creado_en', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['user_id'], ['auth.users.user_id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('bitacora_id'),
        schema='auth'
    )
    op.create_index('idx_auth_bitacora_user', 'bitacora_accesos', ['user_id'], schema='auth')
    op.create_index('idx_auth_bitacora_email', 'bitacora_accesos', ['email'], schema='auth')
    op.create_index('idx_auth_bitacora_fecha', 'bitacora_accesos', [sa.text('creado_en DESC')], schema='auth')

    # Create trigger function for auto-updating updated_at
    op.execute("""
    CREATE OR REPLACE FUNCTION auth.update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.actualizado_en = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';
    """)

    # Apply triggers to tables with updated_at column
    op.execute("""
    CREATE TRIGGER update_modulos_updated_at
        BEFORE UPDATE ON auth.modulos
        FOR EACH ROW
        EXECUTE FUNCTION auth.update_updated_at_column();
    """)

    op.execute("""
    CREATE TRIGGER update_categorias_updated_at
        BEFORE UPDATE ON auth.categorias
        FOR EACH ROW
        EXECUTE FUNCTION auth.update_updated_at_column();
    """)

    op.execute("""
    CREATE TRIGGER update_permisos_updated_at
        BEFORE UPDATE ON auth.permisos
        FOR EACH ROW
        EXECUTE FUNCTION auth.update_updated_at_column();
    """)

    op.execute("""
    CREATE TRIGGER update_rpmc_updated_at
        BEFORE UPDATE ON auth.roles_permisos_modulo_categoria
        FOR EACH ROW
        EXECUTE FUNCTION auth.update_updated_at_column();
    """)

    op.execute("""
    CREATE TRIGGER update_autorizaciones_updated_at
        BEFORE UPDATE ON auth.autorizaciones
        FOR EACH ROW
        EXECUTE FUNCTION auth.update_updated_at_column();
    """)


def downgrade() -> None:
    # Drop triggers
    op.execute("DROP TRIGGER IF EXISTS update_autorizaciones_updated_at ON auth.autorizaciones")
    op.execute("DROP TRIGGER IF EXISTS update_rpmc_updated_at ON auth.roles_permisos_modulo_categoria")
    op.execute("DROP TRIGGER IF EXISTS update_permisos_updated_at ON auth.permisos")
    op.execute("DROP TRIGGER IF EXISTS update_categorias_updated_at ON auth.categorias")
    op.execute("DROP TRIGGER IF EXISTS update_modulos_updated_at ON auth.modulos")

    # Drop trigger function
    op.execute("DROP FUNCTION IF EXISTS auth.update_updated_at_column()")

    # Drop tables in reverse order of dependencies
    op.drop_table('bitacora_accesos', schema='auth')
    op.drop_table('autorizaciones', schema='auth')
    op.drop_table('roles_permisos_modulo_categoria', schema='auth')
    op.drop_table('categorias', schema='auth')
    op.drop_table('modulos', schema='auth')
    op.drop_table('users', schema='auth')
    op.drop_table('permisos', schema='auth')
    op.drop_table('roles', schema='auth')

    # Drop schema
    op.execute("DROP SCHEMA IF EXISTS auth CASCADE")
