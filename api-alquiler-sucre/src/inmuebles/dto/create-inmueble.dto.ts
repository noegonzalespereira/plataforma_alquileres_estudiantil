import { IsString, IsNumber, IsEnum, IsArray, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInmuebleDto {
  @Type(() => Number)
  @IsInt()
  idPropietario: number; // El ID del dueño (Usuario)

  @IsString()
  titulo: string;

  @IsString()
  descripcion: string;

  @IsEnum(['cuarto', 'monoambiente', 'departamento'])
  tipo: string;

  @Type(() => Number)
  @IsNumber()
  precio: number;

  @IsString()
  direccion: string;

  @IsString()
  zona: string;

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  serviciosIds: number[];

  
}