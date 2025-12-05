import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resena } from './entities/resena.entity';
import { CreateResenaDto } from './dto/create-resena.dto';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Inmueble } from '../inmuebles/entities/inmueble.entity';

@Injectable()
export class ResenasService {
  constructor(
    @InjectRepository(Resena) private resenaRepo: Repository<Resena>,
    @InjectRepository(Inmueble) private inmuebleRepo: Repository<Inmueble>,
    @InjectRepository(Usuario) private usuarioRepo: Repository<Usuario>,
  ) {}

  async create(userId: number, dto: CreateResenaDto) {
    const estudiante = await this.usuarioRepo.findOneBy({ id: userId });
    if (!estudiante) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const inmueble = await this.inmuebleRepo.findOneBy({ id: dto.idInmueble });
    
    if (!inmueble) throw new NotFoundException('Inmueble no existe');

    const nueva = this.resenaRepo.create({
      ...dto,
      estudiante,
      inmueble
    });
    return await this.resenaRepo.save(nueva);
  }

  // Obtener reseñas de un inmueble
  async findByInmueble(idInmueble: number) {
    return await this.resenaRepo.find({
      where: { inmueble: { id: idInmueble } },
      relations: ['estudiante'],
      order: { fecha: 'DESC' }
    });
  }
}