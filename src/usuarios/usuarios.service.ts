import { Injectable, NotFoundException } from '@nestjs/common';
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
  async create(createUsuarioDto: CreateUsuarioDto) {
    const { password, ...restoDeDatos } = createUsuarioDto;
    const hashedPassword = await bcrypt.hash(password, 10); 

    
    const nuevoUsuario = this.usuarioRepository.create({
      ...restoDeDatos,
      password: hashedPassword,
    });

    
    return await this.usuarioRepository.save(nuevoUsuario);
  }

  async findAll() {
    return await this.usuarioRepository.find({
      where: { activo: true }, 
    });
  }

  async findOne(id: number) {
    const usuario = await this.usuarioRepository.findOneBy({ id });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return usuario;
  }
  // ... dentro de la clase UsuariosService
  async findByEmail(email: string) {
    return await this.usuarioRepository.findOneBy({ email });
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.findOne(id); 

    if (updateUsuarioDto.password) {
      updateUsuarioDto.password = await bcrypt.hash(updateUsuarioDto.password, 10);
    }

    this.usuarioRepository.merge(usuario, updateUsuarioDto);
    return await this.usuarioRepository.save(usuario);
  }

  async remove(id: number) {
    const usuario = await this.findOne(id);
    
    usuario.activo = false;
    return await this.usuarioRepository.save(usuario);
  }
}

