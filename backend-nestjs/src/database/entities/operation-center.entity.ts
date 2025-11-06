import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { Project } from './project.entity';

@Entity('operation_centers')
export class OperationCenter {
  @PrimaryGeneratedColumn({ name: 'center_id' })
  centerId: number;

  @Column({ name: 'company_id' })
  companyId: number;

  @Column({ name: 'project_id', nullable: true })
  projectId: number;

  @Column({ type: 'varchar', length: 3 })
  code: string;

  @ManyToOne(() => Company, (company) => company.operationCenters)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Project, (project) => project.operationCenters, {
    nullable: true,
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;
}
