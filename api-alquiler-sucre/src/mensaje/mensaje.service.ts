import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mensaje } from './entities/mensaje.entity';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Inmueble } from '../inmuebles/entities/inmueble.entity';

@Injectable()
export class MensajeService {
  constructor(
    @InjectRepository(Mensaje)
    private readonly mensajeRepo: Repository<Mensaje>,
    
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,

    @InjectRepository(Inmueble)
    private readonly inmuebleRepo: Repository<Inmueble>,
  ) {}

  // 1. ENVIAR MENSAJE
  async create(idEmisor: number, dto: CreateMensajeDto) {
    // Validar que existe el receptor
    const receptor = await this.usuarioRepo.findOneBy({ id: dto.idReceptor });
    if (!receptor) throw new NotFoundException('Usuario receptor no encontrado');

    // Validar que existe el emisor
    const emisor = await this.usuarioRepo.findOneBy({ id: idEmisor });
    if (!emisor) throw new NotFoundException('Usuario emisor no encontrado');

    // Validar que existe el inmueble
    const inmueble = await this.inmuebleRepo.findOneBy({ id: dto.idInmueble });
    if (!inmueble) throw new NotFoundException('Inmueble no encontrado');

    const mensaje = this.mensajeRepo.create({
      contenido: dto.contenido,
      emisor: emisor,
      receptor: receptor,
      inmueble: inmueble,
      leido: false,
    });

    return await this.mensajeRepo.save(mensaje);
  }

  // 2. VER CONVERSACIÓN (Chat entre dos personas sobre un inmueble)
  // Devuelve el historial de mensajes ordenado por fecha
  async getConversation(idUsuarioActual: number, idOtroUsuario: number, idInmueble: number) {
    return await this.mensajeRepo.find({
      where: [
        // Caso A: Yo envié, el otro recibió
        { 
          emisor: { id: idUsuarioActual }, 
          receptor: { id: idOtroUsuario },
          inmueble: { id: idInmueble }
        },
        // Caso B: El otro envió, yo recibí
        { 
          emisor: { id: idOtroUsuario }, 
          receptor: { id: idUsuarioActual },
          inmueble: { id: idInmueble }
        }
      ],
      order: { fechaEnvio: 'ASC' }, // Los mensajes viejos arriba, nuevos abajo
      relations: ['emisor', 'receptor'] // Para saber quién mandó qué
    });
  }

  // 3. MIS CHATS (Obtener lista de personas con las que he hablado)
  // Esta es una consulta avanzada. Por ahora haremos una simple:
  // "Dame todos los mensajes donde yo soy receptor o emisor"
  async getMyMessages(idUsuario: number) {
    return await this.mensajeRepo.find({
      where: [
        { emisor: { id: idUsuario } },
        { receptor: { id: idUsuario } }
      ],
      relations: ['emisor', 'receptor', 'inmueble'],
      order: { fechaEnvio: 'DESC' } // Los más recientes primero
    });
  }

  // 4. MARCAR COMO LEÍDO
  async markAsRead(idMensaje: number) {
    await this.mensajeRepo.update(idMensaje, { leido: true });
    return { message: 'Mensaje marcado como leído' };
  }
}