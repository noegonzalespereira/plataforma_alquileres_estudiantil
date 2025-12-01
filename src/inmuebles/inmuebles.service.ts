import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Inmueble } from './entities/inmueble.entity';
import { FotoInmueble } from './entities/foto-inmueble.entity';
import { CreateInmuebleDto } from './dto/create-inmueble.dto';
import { ActivateInmuebleDto } from './dto/activate-inmueble.dto';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Servicio } from '../servicios/entities/servicio.entity';

@Injectable()
export class InmueblesService {
  constructor(
    @InjectRepository(Inmueble)
    private readonly inmuebleRepo: Repository<Inmueble>,
    
    @InjectRepository(FotoInmueble)
    private readonly fotoRepo: Repository<FotoInmueble>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,

    @InjectRepository(Servicio)
    private readonly servicioRepo: Repository<Servicio>,
  ) {}

  // 1. CREAR (Solo Admin)
  async create(dto: CreateInmuebleDto) {
    // A. Buscar al dueño
    const propietario = await this.usuarioRepo.findOneBy({ id: dto.idPropietario });
    if (!propietario) throw new NotFoundException('Propietario no encontrado');

    // B. Buscar los servicios (Luz, Agua, etc.)
    // Usamos ByIds para buscar varios a la vez
    const servicios: Servicio[] = []; // <--- Le decimos que es un array de Servicio
    if (dto.serviciosIds.length > 0) {
       // Nota: En TypeORM moderno se usa findBy con In, o query builder. 
       // Simplificamos iterando o usando query builder si son muchos.
       for (const sId of dto.serviciosIds) {
          const s = await this.servicioRepo.findOneBy({ id: sId });
          if (s) servicios.push(s);
       }
    }

    // C. Preparar las fotos
    const fotosEntidades = dto.fotosUrls.map(url => {
      const foto = new FotoInmueble();
      foto.url = url;
      return foto;
    });

    // D. Crear Inmueble
    const inmueble = this.inmuebleRepo.create({
      ...dto,
      propietario: propietario,
      servicios: servicios,
      fotos: fotosEntidades, // TypeORM guardará las fotos automáticamente por el cascade: true
      visible: false, // Nace oculto hasta que el admin active
    });

    return await this.inmuebleRepo.save(inmueble);
  }

  // 2. LISTAR PARA ESTUDIANTES (Solo visibles y no vencidos)
  async findAllPublic() {
    const hoy = new Date();
    return await this.inmuebleRepo.find({
      where: {
        visible: true,
        fechaVencimiento: MoreThan(hoy),
        estado: 'disponible' // Opcional: si solo quieres mostrar disponibles
      },
      relations: ['fotos', 'servicios', 'propietario'],
      select: {
        propietario: { // Por seguridad, solo devolvemos datos básicos del dueño
          id: true,
          nombre: true,
          apellido: true,
          telefono: true,
          rol: true
        }
      }
    });
  }

  // 3. LISTAR PARA ADMIN (Ve todo)
  async findAllAdmin() {
    return await this.inmuebleRepo.find({
      relations: ['fotos', 'servicios', 'propietario'],
    });
  }

  // 4. ACTIVAR / RENOVAR SUSCRIPCIÓN (Admin)
  async activate(id: number, dto: ActivateInmuebleDto) {
    const inmueble = await this.inmuebleRepo.findOneBy({ id });
    if (!inmueble) throw new NotFoundException('Inmueble no encontrado');

    inmueble.visible = dto.visible;
    inmueble.fechaVencimiento = new Date(dto.fechaVencimiento);
    
    return await this.inmuebleRepo.save(inmueble);
  }

  async findOne(id: number) {
    return await this.inmuebleRepo.findOne({
      where: { id },
      relations: ['fotos', 'servicios', 'propietario', 'contratos']
    });
  }
}