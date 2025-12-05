import { IsDateString, IsEmail,IsNumber, IsInt, IsOptional, Min } from 'class-validator';

export class CreateContratoDto {
  @IsInt()
  idInmueble: number;
  @IsEmail() // <--- AHORA PEDIMOS EMAIL
  emailEstudiante: string;
  

  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFin: string;

  @IsNumber()
  @Min(0)
  montoAcordado: number; // Puede ser diferente al precio de lista si regatearon

  @IsNumber()
  @IsOptional()
  deposito?: number; // Garantía (opcional)
}