import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async notificarPublicacionCreada(
    to: string,
    data: { nombre: string; apellido: string; tituloInmueble: string },
  ) {
    try {
      await this.mailerService.sendMail({
        to,
        subject: '📋 Publicación recibida - Sistema Alquileres Sucre',
        template: './publicacion-creada',
        context: data,
      });
    } catch (err) {
      console.error('Error enviando email publicacion-creada:', err);
    }
  }

  async notificarPagoPendiente(
    to: string,
    data: { nombrePropietario: string; tituloInmueble: string; idInmueble: number },
  ) {
    try {
      await this.mailerService.sendMail({
        to,
        subject: '💳 Comprobante de pago pendiente - Sistema Alquileres Sucre',
        template: './pago-pendiente-admin',
        context: data,
      });
    } catch (err) {
      console.error('Error enviando email pago-pendiente-admin:', err);
    }
  }

  async notificarPublicacionAprobada(
    to: string,
    data: { nombre: string; apellido: string; tituloInmueble: string; fechaVencimiento: string },
  ) {
    try {
      await this.mailerService.sendMail({
        to,
        subject: '✅ Tu publicación fue aprobada - Sistema Alquileres Sucre',
        template: './publicacion-aprobada',
        context: data,
      });
    } catch (err) {
      console.error('Error enviando email publicacion-aprobada:', err);
    }
  }
}
