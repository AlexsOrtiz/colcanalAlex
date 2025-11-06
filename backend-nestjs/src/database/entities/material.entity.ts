import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MaterialGroup } from './material-group.entity';

@Entity('materials')
export class Material {
  @PrimaryGeneratedColumn({ name: 'material_id' })
  materialId: number;

  @Column({ type: 'text', unique: true })
  code: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'group_id' })
  groupId: number;

  @ManyToOne(() => MaterialGroup, (materialGroup) => materialGroup.materials)
  @JoinColumn({ name: 'group_id' })
  materialGroup: MaterialGroup;
}
