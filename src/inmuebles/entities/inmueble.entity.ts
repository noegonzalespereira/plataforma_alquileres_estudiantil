import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Servicio } from '../../servicios/entities/servicio.entity';
import { FotoInmueble } from './foto-inmueble.entity';
import { Mensaje } from '../../mensaje/entities/mensaje.entity';
import { Contrato } from '../../contrato/entities/contrato.entity';

@Entity('inmueble')
export class Inmueble {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  titulo: string;

  @Column('text')
  descripcion: string;

  @Column({ type: 'enum', enum: ['cuarto', 'monoambiente', 'departamento'] })
  tipo: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precio: number;

  @Column()
  direccion: string;

  @Column({ length: 100 })
  zona: string;

  @Column({ type: 'enum', enum: ['disponible', 'ocupado'], default: 'disponible' })
  estado: string;
  @Column({ type: 'date', nullable: true, name: 'fecha_vencimiento' })
  fechaVencimiento: Date; // Si hoy es mayor a esta fecha, no se muestra

  @Column({ default: false })
  visible: boolean;

  @CreateDateColumn({ name: 'fecha_publicacion' })
  fechaPublicacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  // --- Relaciones ---

  @ManyToOne(() => Usuario, (usuario) => usuario.inmuebles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_propietario' })
  propietario: Usuario;

  @OneToMany(() => FotoInmueble, (foto) => foto.inmueble)
  fotos: FotoInmueble[];

  // Tabla pivote Inmueble <-> Servicio
  @ManyToMany(() => Servicio, (servicio) => servicio.inmuebles)
  @JoinTable({
    name: 'inmueble_servicio', 
    joinColumn: { name: 'id_inmueble', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'id_servicio', referencedColumnName: 'id' },
  })
  servicios: Servicio[];

  @OneToMany(() => Mensaje, (mensaje) => mensaje.inmueble)
  mensajes: Mensaje[];

  @OneToMany(() => Contrato, (contrato) => contrato.inmueble)
  contratos: Contrato[];
}