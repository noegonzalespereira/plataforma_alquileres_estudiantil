import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Inmueble } from '../../inmuebles/entities/inmueble.entity';

@Entity('servicio')
export class Servicio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  nombre: string;

  @Column({ nullable: true }) // Opcional, por si quieres poner iconos después
  icono: string;

  // Relación inversa para saber qué inmuebles tienen este servicio
  @ManyToMany(() => Inmueble, (inmueble) => inmueble.servicios)
  inmuebles: Inmueble[];
}
