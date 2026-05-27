import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Inmueble } from './entities/inmueble.entity';
import { FotoInmueble } from './entities/foto-inmueble.entity';
import { CreateInmuebleDto } from './dto/create-inmueble.dto';
import { ActivateInmuebleDto } from './dto/activate-inmueble.dto';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Servicio } from '../servicios/entities/servicio.entity';
import * as nodemailer from 'nodemailer';

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

  private async enviarEmail(destinatario: string, asunto: string, html: string) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });
      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: destinatario,
        subject: asunto,
        html,
      });
    } catch (err) {
      console.error('Error enviando email:', err);
    }
  }

  // 1. CREAR
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

    return await this.inmuebleRepo.save(inmueble);
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

  // 5. PROPIETARIO: Solicitar renovación con comprobante de pago
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

    return await this.inmuebleRepo.save(inmueble);
  }

  // 6. ADMIN: Activar / Confirmar pago → envía email al propietario
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

    // Enviar email de confirmación al propietario si se activó
    if (dto.visible && inmueble.propietario?.email) {
      const vencimiento = new Date(dto.fechaVencimiento).toLocaleDateString('es-BO', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
      await this.enviarEmail(
        inmueble.propietario.email,
        '✅ Tu publicación fue aprobada - Sistema Alquileres Sucre',
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #402149; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Sistema Alquileres Sucre</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #402149;">¡Publicación Aprobada!</h2>
            <p>Hola <strong>${inmueble.propietario.nombre} ${inmueble.propietario.apellido}</strong>,</p>
            <p>Tu pago fue verificado y tu inmueble ya está publicado y visible para los estudiantes.</p>
            <div style="background: white; border-left: 4px solid #f67f54; padding: 15px; margin: 20px 0;">
              <p><strong>Inmueble:</strong> ${inmueble.titulo}</p>
              <p><strong>Publicado hasta:</strong> ${vencimiento}</p>
            </div>
            <p style="color: #666;">Si tienes alguna consulta, contáctanos respondiendo este correo.</p>
          </div>
          <div style="background: #402149; padding: 10px; text-align: center;">
            <p style="color: #ccc; margin: 0; font-size: 12px;">Sistema Alquileres Estudiantil - Sucre, Bolivia</p>
          </div>
        </div>
        `
      );
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
