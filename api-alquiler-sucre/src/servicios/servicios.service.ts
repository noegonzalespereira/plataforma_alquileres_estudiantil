import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Servicio } from './entities/servicio.entity';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';

@Injectable()
export class ServiciosService {
  constructor(
    @InjectRepository(Servicio)
    private readonly servicioRepo: Repository<Servicio>,
  ) {}

  async create(createServicioDto: CreateServicioDto) {
    // Opcional: Verificar si ya existe para dar un mensaje bonito
    const existe = await this.servicioRepo.findOneBy({ nombre: createServicioDto.nombre });
    if (existe) throw new ConflictException('Este servicio ya existe en el catálogo');

    const servicio = this.servicioRepo.create(createServicioDto);
    return await this.servicioRepo.save(servicio);
  }

  async findAll() {
    return await this.servicioRepo.find();
  }

  async findOne(id: number) {
    const servicio = await this.servicioRepo.findOneBy({ id });
    if (!servicio) throw new NotFoundException(`Servicio #${id} no encontrado`);
    return servicio;
  }

  async update(id: number, updateServicioDto: UpdateServicioDto) {
    const servicio = await this.findOne(id); // Reutilizamos findOne para verificar existencia
    this.servicioRepo.merge(servicio, updateServicioDto);
    return await this.servicioRepo.save(servicio);
  }

  async remove(id: number) {
    const servicio = await this.findOne(id);
    return await this.servicioRepo.remove(servicio);
  }
}