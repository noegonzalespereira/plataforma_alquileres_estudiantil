import { IsDateString, IsBoolean } from 'class-validator';

export class ActivateInmuebleDto {
  @IsDateString()
  fechaVencimiento: string; // El admin decide hasta cuándo dura el pago

  @IsBoolean()
  visible: boolean;
}