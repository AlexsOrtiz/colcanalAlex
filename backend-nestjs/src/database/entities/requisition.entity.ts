import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { Project } from './project.entity';
import { OperationCenter } from './operation-center.entity';
import { ProjectCode } from './project-code.entity';
import { User } from './user.entity';
import { RequisitionItem } from './requisition-item.entity';
import { RequisitionLog } from './requisition-log.entity';

@Entity('requisitions')
export class Requisition {
  @PrimaryGeneratedColumn({ name: 'requisition_id' })
  requisitionId: number;

  @Column({ name: 'requisition_number', type: 'varchar', length: 20, unique: true })
  requisitionNumber: string;

  @Column({ name: 'company_id' })
  companyId: number;

  @Column({ name: 'project_id', nullable: true })
  projectId: number;

  @Column({ name: 'operation_center_id' })
  operationCenterId: number;

  @Column({ name: 'project_code_id', nullable: true })
  projectCodeId: number;

  @Column({ name: 'created_by' })
  createdBy: number;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 50,
    default: 'Pendiente',
  })
  status: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Project, { nullable: true })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => OperationCenter)
  @JoinColumn({ name: 'operation_center_id' })
  operationCenter: OperationCenter;

  @ManyToOne(() => ProjectCode, { nullable: true })
  @JoinColumn({ name: 'project_code_id' })
  projectCode: ProjectCode;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => RequisitionItem, (item) => item.requisition, {
    cascade: true,
  })
  items: RequisitionItem[];

  @OneToMany(() => RequisitionLog, (log) => log.requisition, {
    cascade: true,
  })
  logs: RequisitionLog[];
}
