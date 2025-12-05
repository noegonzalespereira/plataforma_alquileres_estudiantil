import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateMensajeDto {
  @IsString()
  @IsNotEmpty()
  contenido: string;

  @IsInt()
  idReceptor: number; // El ID del usuario al que le escribes

  @IsInt()
  idInmueble: number; // Sobre qué casa están hablando
}