import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginAuthDto } from './dto/login-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService, // Traemos el servicio de usuarios
    private jwtService: JwtService,
  ) {}

  async login(loginAuthDto: LoginAuthDto) {
    const { email, password } = loginAuthDto;

    // 1. Buscamos al usuario por email
    // Nota: Necesitamos que UsuariosService tenga un método para buscar por email (lo haremos abajo)
    const user = await this.usuariosService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas (Email)');
    }

    // 2. Verificamos la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas (Password)');
    }

    // 3. Generamos el Token (Payload)
    // Aquí guardamos datos útiles para no tener que consultar la BD a cada rato
    const payload = { sub: user.id, email: user.email, rol: user.rol, nombre: user.nombre };

    return {
      access_token: await this.jwtService.signAsync(payload),
      usuario: { // Devolvemos datos básicos para el frontend
        id: user.id,
        nombre: user.nombre,
        rol: user.rol
      }
    };
  }
}