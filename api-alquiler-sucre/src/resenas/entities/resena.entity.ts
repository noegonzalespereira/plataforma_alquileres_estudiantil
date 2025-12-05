import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Inmueble } from '../../inmuebles/entities/inmueble.entity';

@Entity('resena')
export class Resena {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  calificacion: number; // Del 1 al 5

  @Column('text')
  comentario: string;

  @CreateDateColumn()
  fecha: Date;

  // Relación: Un estudiante escribe la reseña
  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_estudiante' })
  estudiante: Usuario;

  // Relación: La reseña pertenece a un inmueble
  @ManyToOne(() => Inmueble, (inmueble) => inmueble.resenas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_inmueble' })
  inmueble: Inmueble;
}