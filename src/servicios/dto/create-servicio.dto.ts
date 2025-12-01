import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateServicioDto {
  @IsString()
  @IsNotEmpty()
  nombre: string; // Ej: "WiFi", "Ducha Caliente"

  @IsString()
  @IsOptional()
  icono?: string; // Ej: "wifi-icon" (para usar librerías como FontAwesome o Material)
}