import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateReporteDto {
  @IsString()
  @IsEnum(['estafa', 'queja', 'sugerencia'])
  tipo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;
}