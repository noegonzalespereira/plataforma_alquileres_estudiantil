import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Inmueble } from './entities/inmueble.entity';
import { FotoInmueble } from './entities/foto-inmueble.entity';
import { CreateInmuebleDto } from './dto/create-inmueble.dto';
import { ActivateInmuebleDto } from './dto/activate-inmueble.dto';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Servicio } from '../servicios/entities/servicio.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class InmueblesService {
  constructor(
    @InjectRepository(Inmueble)
    private readonly inmuebleRepo: Repository<Inmueble>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,

    @InjectRepository(Servicio)
    private readonly servicioRepo: Repository<Servicio>,

    private readonly mailService: MailService,
  ) {}

  // 1. CREAR — notifica al propietario que su publicación fue recibida
  async create(dto: CreateInmuebleDto, fotosPaths: string[]) {
    const propietario = await this.usuarioRepo.findOneBy({ id: dto.idPropietario });
    if (!propietario) throw new NotFoundException('Propietario no encontrado');

    const servicios: Servicio[] = [];
    if (dto.serviciosIds && dto.serviciosIds.length > 0) {
      for (const sId of dto.serviciosIds) {
        const s = await this.servicioRepo.findOneBy({ id: sId });
        if (s) servicios.push(s);
      }
    }

    const fotosEntidades = fotosPaths.map(path => {
      const foto = new FotoInmueble();
      foto.url = path;
      return foto;
    });

    const inmueble = this.inmuebleRepo.create({
      ...dto,
      propietario,
      servicios,
      fotos: fotosEntidades,
      visible: false,
    });

    const resultado = await this.inmuebleRepo.save(inmueble);

    if (propietario.email) {
      await this.mailService.notificarPublicacionCreada(propietario.email, {
        nombre: propietario.nombre,
        apellido: propietario.apellido,
        tituloInmueble: inmueble.titulo,
      });
    }

    return resultado;
  }

  // 2. LISTAR PARA ESTUDIANTES (Solo visibles y no vencidos)
  async findAllPublic() {
    const hoy = new Date();
    return await this.inmuebleRepo.find({
      where: { visible: true, fechaVencimiento: MoreThan(hoy), estado: 'disponible' },
      relations: ['fotos', 'servicios', 'propietario'],
      select: {
        propietario: { id: true, nombre: true, apellido: true, telefono: true, rol: true }
      }
    });
  }

  // 3. LISTAR PARA PROPIETARIO (Solo sus inmuebles)
  async findByPropietario(propietarioId: number) {
    return await this.inmuebleRepo.find({
      where: { propietario: { id: propietarioId } },
      relations: ['fotos', 'servicios', 'propietario'],
    });
  }

  // 4. LISTAR PARA ADMIN (Ve todo)
  async findAllAdmin() {
    return await this.inmuebleRepo.find({
      relations: ['fotos', 'servicios', 'propietario'],
    });
  }

  // 5. PROPIETARIO: Solicitar renovación con comprobante — notifica a todos los admins
  async solicitarPago(id: number, fechaVencimiento: string, comprobantePath: string) {
    const inmueble = await this.inmuebleRepo.findOne({
      where: { id },
      relations: ['propietario'],
    });
    if (!inmueble) throw new NotFoundException('Inmueble no encontrado');

    inmueble.fechaVencimiento = new Date(fechaVencimiento);
    inmueble.comprobantePago = comprobantePath;
    inmueble.pendientePago = true;
    inmueble.visible = false;

    const resultado = await this.inmuebleRepo.save(inmueble);

    const admins = await this.usuarioRepo.findBy({ rol: 'admin' });
    const nombrePropietario = inmueble.propietario
      ? `${inmueble.propietario.nombre} ${inmueble.propietario.apellido}`
      : 'Propietario';

    for (const admin of admins) {
      if (admin.email) {
        await this.mailService.notificarPagoPendiente(admin.email, {
          nombrePropietario,
          tituloInmueble: inmueble.titulo,
          idInmueble: inmueble.id,
        });
      }
    }

    return resultado;
  }

  // 6. ADMIN: Activar / Confirmar pago — notifica al propietario
  async activate(id: number, dto: ActivateInmuebleDto) {
    const inmueble = await this.inmuebleRepo.findOne({
      where: { id },
      relations: ['propietario'],
    });
    if (!inmueble) throw new NotFoundException('Inmueble no encontrado');

    inmueble.visible = dto.visible;
    inmueble.fechaVencimiento = new Date(dto.fechaVencimiento);
    inmueble.pendientePago = false;

    const resultado = await this.inmuebleRepo.save(inmueble);

    if (dto.visible && inmueble.propietario?.email) {
      const fechaVencimientoFormateada = new Date(dto.fechaVencimiento).toLocaleDateString('es-BO', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
      await this.mailService.notificarPublicacionAprobada(inmueble.propietario.email, {
        nombre: inmueble.propietario.nombre,
        apellido: inmueble.propietario.apellido,
        tituloInmueble: inmueble.titulo,
        fechaVencimiento: fechaVencimientoFormateada,
      });
    }

    return resultado;
  }

  async findOne(id: number) {
    return await this.inmuebleRepo.findOne({
      where: { id },
      relations: ['fotos', 'servicios', 'propietario', 'contratos']
    });
  }

  // 7. ACTUALIZAR DATOS + FOTOS
  async update(id: number, updateInmuebleDto: any, nuevasFotosPaths: string[] = []) {
    const inmueble = await this.inmuebleRepo.findOne({
      where: { id },
      relations: ['fotos']
    });
    if (!inmueble) throw new NotFoundException(`Inmueble #${id} no encontrado`);

    this.inmuebleRepo.merge(inmueble, updateInmuebleDto);

    if (nuevasFotosPaths.length > 0) {
      const nuevasEntidades = nuevasFotosPaths.map(path => {
        const foto = new FotoInmueble();
        foto.url = path;
        return foto;
      });
      inmueble.fotos = [...inmueble.fotos, ...nuevasEntidades];
    }

    return await this.inmuebleRepo.save(inmueble);
  }

  // 8. ELIMINAR INMUEBLE
  async remove(id: number) {
    const inmueble = await this.inmuebleRepo.findOneBy({ id });
    if (!inmueble) throw new NotFoundException(`Inmueble #${id} no encontrado`);
    return await this.inmuebleRepo.remove(inmueble);
  }
}
