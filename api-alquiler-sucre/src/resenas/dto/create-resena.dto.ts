import { IsString, IsInt, Min, Max } from 'class-validator';

export class CreateResenaDto {
  @IsInt()
  idInmueble: number;

  @IsInt()
  @Min(1) @Max(5)
  calificacion: number;

  @IsString()
  comentario: string;
}