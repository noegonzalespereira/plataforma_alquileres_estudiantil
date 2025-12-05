import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Inmueble } from '../../inmuebles/entities/inmueble.entity';

@Entity('mensaje')
export class Mensaje {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  contenido: string;

  @CreateDateColumn({ name: 'fecha_envio' })
  fechaEnvio: Date;

  @Column({ default: false })
  leido: boolean;

  // --- Relaciones ---

  @ManyToOne(() => Usuario, (usuario) => usuario.mensajesEnviados, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_emisor' })
  emisor: Usuario;

  @ManyToOne(() => Usuario, (usuario) => usuario.mensajesRecibidos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_receptor' })
  receptor: Usuario;

  @ManyToOne(() => Inmueble, (inmueble) => inmueble.mensajes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_inmueble' })
  inmueble: Inmueble;
}