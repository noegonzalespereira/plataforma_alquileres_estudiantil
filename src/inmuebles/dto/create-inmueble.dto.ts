import { IsString, IsNumber, IsEnum, IsArray, IsOptional, IsInt } from 'class-validator';

export class CreateInmuebleDto {
  @IsInt()
  idPropietario: number; // El ID del dueño (Usuario)

  @IsString()
  titulo: string;

  @IsString()
  descripcion: string;

  @IsEnum(['cuarto', 'monoambiente', 'departamento'])
  tipo: string;

  @IsNumber()
  precio: number;

  @IsString()
  direccion: string;

  @IsString()
  zona: string;

  @IsArray()
  @IsInt({ each: true }) // Valida que sea un array de números [1, 3, 5]
  serviciosIds: number[]; // IDs de los servicios (luz, agua...)

  @IsArray()
  @IsString({ each: true }) // Valida array de textos
  fotosUrls: string[]; // ["url1.jpg", "url2.jpg"]
}