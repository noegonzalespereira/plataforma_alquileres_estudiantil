import { IsString, IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  ci: string;

  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsEnum(['estudiante', 'propietario'])
  rol: string;
}