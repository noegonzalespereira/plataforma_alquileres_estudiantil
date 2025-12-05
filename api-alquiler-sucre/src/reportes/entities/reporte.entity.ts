import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('reporte')
export class Reporte {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  tipo: string; // 'estafa', 'queja', 'sugerencia'

  @Column('text')
  descripcion: string;

  @Column({ default: 'pendiente' }) // 'pendiente', 'revisado', 'resuelto'
  estado: string;

  @CreateDateColumn()
  fecha: Date;

  // Quién manda el reporte (puede ser estudiante o propietario)
  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;
}