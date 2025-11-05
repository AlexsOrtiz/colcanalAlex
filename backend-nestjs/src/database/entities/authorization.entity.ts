import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

@Entity('autorizaciones')
@Unique(['usuarioAutorizadorId', 'usuarioAutorizadoId', 'tipoAutorizacion'])
export class Authorization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_autorizador' })
  usuarioAutorizadorId: number;

  @Column({ name: 'usuario_autorizado' })
  usuarioAutorizadoId: number;

  @Column({ name: 'tipo_autorizacion', type: 'varchar', length: 20, nullable: true })
  tipoAutorizacion: string;

  @ManyToOne(() => User, (user) => user.authorizationsGranted)
  @JoinColumn({ name: 'usuario_autorizador' })
  usuarioAutorizador: User;

  @ManyToOne(() => User, (user) => user.authorizationsReceived)
  @JoinColumn({ name: 'usuario_autorizado' })
  usuarioAutorizado: User;
}
