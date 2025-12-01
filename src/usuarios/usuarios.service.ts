import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  // CREAR (Registro)
  async create(createUsuarioDto: CreateUsuarioDto) {
    try {
      // 1. Encriptar contraseña
      const { password, ...userData } = createUsuarioDto;
      const hashedPassword = await bcrypt.hash(password, 10);

      // 2. Crear objeto
      const usuario = this.usuarioRepository.create({
        ...userData,
        password: hashedPassword,
      });

      // 3. Guardar y retornar (sin mostrar la pass)
      const savedUser = await this.usuarioRepository.save(usuario);
      delete savedUser.password;
      return savedUser;

    } catch (error) {
      // Manejo de error si el email o CI ya existen (código SQL 23505 o similar)
      if (error.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException('El Email o CI ya están registrados');
      }
      throw error;
    }
  }

  // LISTAR (Solo activos)
  async findAll() {
    return await this.usuarioRepository.find({
      where: { activo: true },
      select: ['id', 'nombre', 'apellido', 'email', 'rol', 'telefono', 'activo'] // No devolvemos password
    });
  }

  // BUSCAR POR ID
  async findOne(id: number) {
    const usuario = await this.usuarioRepository.findOne({ 
      where: { id },
      relations: ['inmuebles'] // Para ver sus propiedades asociadas
    });
    
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  // BUSCAR POR EMAIL (Para el Login - AuthModule)
  async findByEmail(email: string) {
    return await this.usuarioRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'rol', 'nombre', 'activo'] // Aquí sí necesitamos la password para comparar
    });
  }

  // ACTUALIZAR
  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.findOne(id);

    // Si actualizan contraseña, volver a encriptar
    if (updateUsuarioDto.password) {
      updateUsuarioDto.password = await bcrypt.hash(updateUsuarioDto.password, 10);
    }

    this.usuarioRepository.merge(usuario, updateUsuarioDto);
    return await this.usuarioRepository.save(usuario);
  }

  // ELIMINAR (Soft Delete)
  async remove(id: number) {
    const usuario = await this.findOne(id);
    usuario.activo = false; // Solo lo desactivamos
    return await this.usuarioRepository.save(usuario);
  }
}