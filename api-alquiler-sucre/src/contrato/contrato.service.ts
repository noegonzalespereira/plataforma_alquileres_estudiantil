import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm'; // Importamos DataSource para transacciones
import { Contrato } from './entities/contrato.entity';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Inmueble } from '../inmuebles/entities/inmueble.entity';

@Injectable()
export class ContratosService {
  constructor(
    @InjectRepository(Contrato)
    private readonly contratoRepo: Repository<Contrato>,
    
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,

    @InjectRepository(Inmueble)
    private readonly inmuebleRepo: Repository<Inmueble>,

    private readonly dataSource: DataSource, // Para hacer transacciones seguras
  ) {}

  // 1. CREAR CONTRATO (Solo Propietario)
  async create(idPropietario: number, dto: CreateContratoDto) {
    // A. Validar Inmueble
    const inmueble = await this.inmuebleRepo.findOne({ 
      where: { id:dto.idInmueble },
      relations: ['propietario'] 
    });

    if (!inmueble) throw new NotFoundException('Inmueble no encontrado');
    
    // Seguridad: Verificar que el que crea el contrato es el dueño real
    if (inmueble.propietario.id !== idPropietario) {
      throw new BadRequestException('No puedes crear contratos de un inmueble que no es tuyo');
    }

    if (inmueble.estado === 'ocupado') {
      throw new BadRequestException('Este inmueble ya está ocupado');
    }
    // B. BUSCAR ESTUDIANTE POR EMAIL (CAMBIO IMPORTANTE)
    const estudiante = await this.usuarioRepo.findOneBy({ email: dto.emailEstudiante });
    
    if (!estudiante) {
      throw new NotFoundException(`No existe ningún usuario con el correo ${dto.emailEstudiante}`);
    }
    
    if (estudiante.rol !== 'estudiante') {
      throw new BadRequestException('El usuario indicado no está registrado como Estudiante');
    }

    
    // C. TRANSACCIÓN (Guardar contrato Y actualizar inmueble al mismo tiempo)
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Crear el contrato
      const nuevoContrato = this.contratoRepo.create({
        fechaInicio: new Date(dto.fechaInicio),
        fechaFin: new Date(dto.fechaFin),
        montoAcordado: dto.montoAcordado,
        deposito: dto.deposito,
        propietario: inmueble.propietario,
        estudiante: estudiante, // Aquí pasamos el objeto Usuario completo
        inmueble: inmueble,
        estado: 'vigente'
      });
      await queryRunner.manager.save(nuevoContrato);

      // 2. Cambiar estado del inmueble a 'ocupado'
      inmueble.estado = 'ocupado';
      await queryRunner.manager.save(inmueble);

      // Confirmar cambios
      await queryRunner.commitTransaction();
      return nuevoContrato;

    } catch (error) {
      // Si algo falla, deshacer todo
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 2. VER MIS CONTRATOS (Detecta si soy estudiante o dueño)
  async findMyContracts(user: any) {
    if (user.rol === 'estudiante') {
      return await this.contratoRepo.find({
        where: { estudiante: { id: user.userId } },
        relations: ['inmueble', 'propietario'],
        order: { fechaInicio: 'DESC' }
      });
    } else if (user.rol === 'propietario') {
      return await this.contratoRepo.find({
        where: { propietario: { id: user.userId } },
        relations: ['inmueble', 'estudiante'],
        order: { fechaInicio: 'DESC' }
      });
    } else {
      // Si es admin ve todo
      return await this.contratoRepo.find({ relations: ['inmueble', 'propietario', 'estudiante'] });
    }
  }

  async findOne(id: number) {
    return await this.contratoRepo.findOne({
      where: { id },
      relations: ['inmueble', 'estudiante', 'propietario']
    });
  }

  // 3. FINALIZAR CONTRATO (Cuando el estudiante se va)
  async finalizarContrato(idContrato: number, idUsuario: number) {
    const contrato = await this.findOne(idContrato);
    if (!contrato) throw new NotFoundException('Contrato no encontrado');

    // Solo el dueño (o admin) debería poder finalizarlo formalmente
    if (contrato.propietario.id !== idUsuario) {
       // Aquí podrías validar rol admin también
       throw new BadRequestException('Solo el propietario puede finalizar el contrato');
    }

    // Transacción para liberar la casa
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Marcar contrato como finalizado
      contrato.estado = 'finalizado';
      await queryRunner.manager.save(contrato);

      // 2. Liberar el inmueble (ponerlo disponible)
      const inmueble = await this.inmuebleRepo.findOneBy({ id: contrato.inmueble.id });
      if (!inmueble) {
        throw new NotFoundException('El inmueble asociado al contrato no existe');
      }
      inmueble.estado = 'disponible';
      await queryRunner.manager.save(inmueble);

      await queryRunner.commitTransaction();
      return { message: 'Contrato finalizado y cuarto disponible nuevamente' };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async findAllAdmin() {
    return await this.contratoRepo.find({
      relations: ['inmueble', 'propietario', 'estudiante'],
      order: { fechaCreacion: 'DESC' }
    });
  }
}