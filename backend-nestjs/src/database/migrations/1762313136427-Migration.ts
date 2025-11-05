import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1762313136427 implements MigrationInterface {
    name = 'Migration1762313136427'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles" ADD "default_module" character varying(50)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "default_module"`);
    }

}
