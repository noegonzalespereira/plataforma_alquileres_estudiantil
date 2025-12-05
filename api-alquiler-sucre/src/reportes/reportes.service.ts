import { Injectable,NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reporte } from './entities/reporte.entity';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuariosController } from 'src/usuarios/usuarios.controller';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Reporte) private reporteRepo: Repository<Reporte>,
    @InjectRepository(Usuario) private usuarioRepo: Repository<Usuario>,
  ) {}

  async create(userId: number, dto: CreateReporteDto) {
    const usuario = await this.usuarioRepo.findOneBy({ id: userId });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const reporte = this.reporteRepo.create({ ...dto, usuario });
    return await this.reporteRepo.save(reporte);
  }

  // Solo Admin ve esto
  async findAll() {
    return await this.reporteRepo.find({
      relations: ['usuario'],
      order: { fecha: 'DESC' }
    });
  }
  async resolve(id: number) {
    const reporte = await this.reporteRepo.findOneBy({ id });
    if (!reporte) throw new NotFoundException('Reporte no encontrado');
    
    reporte.estado = 'resuelto';
    return await this.reporteRepo.save(reporte);
  }

  // 4. ELIMINAR REPORTE
  async remove(id: number) {
    const reporte = await this.reporteRepo.findOneBy({ id });
    if (!reporte) throw new NotFoundException('Reporte no encontrado');
    
    return await this.reporteRepo.remove(reporte);
  }
}