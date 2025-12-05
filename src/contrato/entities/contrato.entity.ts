import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Inmueble } from '../../inmuebles/entities/inmueble.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('contrato')
export class Contrato {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', name: 'fecha_inicio' })
  fechaInicio: Date;

  @Column({ type: 'date', name: 'fecha_fin' })
  fechaFin: Date;

  @Column('decimal', { precision: 10, scale: 2, name: 'monto_acordado' })
  montoAcordado: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  deposito: number;

  @Column({ type: 'enum', enum: ['vigente', 'finalizado', 'cancelado'], default: 'vigente' })
  estado: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  // --- Relaciones ---

  @ManyToOne(() => Inmueble, (inmueble) => inmueble.contratos)
  @JoinColumn({ name: 'id_inmueble' })
  inmueble: Inmueble;

  @ManyToOne(() => Usuario, (usuario) => usuario.contratosDeEstudiante)
  @JoinColumn({ name: 'id_estudiante' })
  estudiante: Usuario;

  @ManyToOne(() => Usuario, (usuario) => usuario.contratosDePropietario)
  @JoinColumn({ name: 'id_propietario' })
  propietario: Usuario;
}