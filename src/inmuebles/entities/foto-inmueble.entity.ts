import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Inmueble } from './inmueble.entity';

@Entity('foto_inmueble')
export class FotoInmueble {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  url: string;

  @CreateDateColumn({ name: 'fecha_subida' })
  fechaSubida: Date;

  @ManyToOne(() => Inmueble, (inmueble) => inmueble.fotos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_inmueble' })
  inmueble: Inmueble;
}