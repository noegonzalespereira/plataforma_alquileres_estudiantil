import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { Inmueble } from '../../inmuebles/entities/inmueble.entity';
import { Mensaje } from '../../mensaje/entities/mensaje.entity';
import { Contrato } from '../../contrato/entities/contrato.entity';

@Entity('usuario') // Nombre exacto de la tabla en MySQL
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 20 })
  ci: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100 })
  apellido: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @Column()
  password: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column({ type: 'enum', enum: ['estudiante', 'propietario','admin'] })
  rol: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'fecha_registro' })
  fechaRegistro: Date;

  // --- Relaciones ---

  // Un propietario tiene muchos inmuebles
  @OneToMany(() => Inmueble, (inmueble) => inmueble.propietario)
  inmuebles: Inmueble[];

  // Mensajes que envié
  @OneToMany(() => Mensaje, (mensaje) => mensaje.emisor)
  mensajesEnviados: Mensaje[];

  // Mensajes que recibí
  @OneToMany(() => Mensaje, (mensaje) => mensaje.receptor)
  mensajesRecibidos: Mensaje[];

  // Contratos (como estudiante o propietario)
  @OneToMany(() => Contrato, (contrato) => contrato.estudiante)
  contratosDeEstudiante: Contrato[];

  @OneToMany(() => Contrato, (contrato) => contrato.propietario)
  contratosDePropietario: Contrato[];
}