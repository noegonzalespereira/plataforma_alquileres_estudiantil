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
        subject: 'Publicación recibida - Sistema Alquileres Sucre',
        html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#402149;padding:24px 32px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:22px;">Sistema Alquileres Sucre</h1>
          </div>
          <div style="background:#f0e8f5;padding:16px 32px;border-bottom:1px solid #e0d0ea;">
            <p style="margin:0;color:#402149;font-size:16px;font-weight:bold;">📋 Tu publicación fue recibida</p>
          </div>
          <div style="padding:32px;background:#f9f9f9;">
            <p style="color:#333;font-size:15px;">Hola <strong>${data.nombre} ${data.apellido}</strong>,</p>
            <p style="color:#555;font-size:14px;line-height:1.6;">
              Tu inmueble ha sido publicado exitosamente. Nuestro equipo revisará la publicación y,
              una vez que confirmes el pago, será visible para los estudiantes.
            </p>
            <div style="background:#fff;border-left:4px solid #f67f54;padding:15px;margin:20px 0;">
              <p style="margin:0;color:#402149;font-size:13px;font-weight:bold;">INMUEBLE PUBLICADO</p>
              <p style="margin:6px 0 0;color:#333;font-size:15px;font-weight:bold;">${data.tituloInmueble}</p>
            </div>
            <p style="color:#555;font-size:14px;"><strong>Próximos pasos:</strong></p>
            <ul style="color:#555;font-size:14px;line-height:1.8;">
              <li>Sube tu comprobante de pago desde el panel de propietario.</li>
              <li>El administrador verificará el comprobante.</li>
              <li>Una vez aprobado, tu publicación será visible para todos los estudiantes.</li>
            </ul>
          </div>
          <div style="background:#402149;padding:14px 32px;text-align:center;">
            <p style="color:#d4b8e0;margin:0;font-size:12px;">Sistema Alquileres Estudiantil — Sucre, Bolivia</p>
          </div>
        </div>`,
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
        subject: 'Comprobante de pago pendiente - Sistema Alquileres Sucre',
        html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#402149;padding:24px 32px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:22px;">Sistema Alquileres Sucre</h1>
            <p style="color:#d4b8e0;margin:6px 0 0;font-size:13px;">Panel Administrativo</p>
          </div>
          <div style="background:#fff7ed;padding:16px 32px;border-bottom:1px solid #fed7aa;">
            <p style="margin:0;color:#c2410c;font-size:16px;font-weight:bold;">💳 Comprobante de pago pendiente de revisión</p>
          </div>
          <div style="padding:32px;background:#f9f9f9;">
            <p style="color:#333;font-size:15px;">Hola <strong>Administrador</strong>,</p>
            <p style="color:#555;font-size:14px;line-height:1.6;">
              Un propietario subió su comprobante de pago y está esperando validación
              para que su publicación sea visible.
            </p>
            <div style="background:#fff;border-left:4px solid #f67f54;padding:15px;margin:20px 0;">
              <p style="margin:0 0 8px;color:#402149;font-size:12px;font-weight:bold;">PROPIETARIO</p>
              <p style="margin:0 0 12px;color:#333;font-size:15px;">${data.nombrePropietario}</p>
              <p style="margin:0 0 8px;color:#402149;font-size:12px;font-weight:bold;">INMUEBLE</p>
              <p style="margin:0 0 12px;color:#333;font-size:15px;font-weight:bold;">${data.tituloInmueble}</p>
              <p style="margin:0 0 8px;color:#402149;font-size:12px;font-weight:bold;">ID DE PUBLICACIÓN</p>
              <p style="margin:0;color:#333;font-size:14px;">#${data.idInmueble}</p>
            </div>
            <p style="color:#555;font-size:14px;"><strong>Acciones requeridas:</strong></p>
            <ul style="color:#555;font-size:14px;line-height:1.8;">
              <li>Ingresa al panel de administrador.</li>
              <li>Busca la publicación #${data.idInmueble} — <em>${data.tituloInmueble}</em>.</li>
              <li>Revisa el comprobante de pago.</li>
              <li>Aprueba o rechaza la publicación según corresponda.</li>
            </ul>
          </div>
          <div style="background:#402149;padding:14px 32px;text-align:center;">
            <p style="color:#d4b8e0;margin:0;font-size:12px;">Sistema Alquileres Estudiantil — Sucre, Bolivia</p>
          </div>
        </div>`,
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
        subject: 'Tu publicación fue aprobada - Sistema Alquileres Sucre',
        html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#402149;padding:24px 32px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:22px;">Sistema Alquileres Sucre</h1>
          </div>
          <div style="background:#f0fdf4;padding:16px 32px;border-bottom:1px solid #bbf7d0;">
            <p style="margin:0;color:#166534;font-size:16px;font-weight:bold;">✅ ¡Tu publicación fue aprobada y está visible!</p>
          </div>
          <div style="padding:32px;background:#f9f9f9;">
            <p style="color:#333;font-size:15px;">Hola <strong>${data.nombre} ${data.apellido}</strong>,</p>
            <p style="color:#555;font-size:14px;line-height:1.6;">
              Tu pago fue verificado correctamente. Tu inmueble ya está
              <strong style="color:#166534;">publicado y visible</strong> para todos los estudiantes.
            </p>
            <div style="background:#fff;border-left:4px solid #f67f54;padding:15px;margin:20px 0;">
              <p style="margin:0 0 8px;color:#402149;font-size:12px;font-weight:bold;">INMUEBLE</p>
              <p style="margin:0 0 12px;color:#333;font-size:15px;font-weight:bold;">${data.tituloInmueble}</p>
              <p style="margin:0 0 8px;color:#402149;font-size:12px;font-weight:bold;">PUBLICADO HASTA</p>
              <p style="margin:0;color:#333;font-size:15px;">${data.fechaVencimiento}</p>
            </div>
            <p style="color:#555;font-size:14px;line-height:1.6;">
              Recuerda renovar tu publicación antes de la fecha de vencimiento
              subiendo un nuevo comprobante de pago desde el panel de propietario.
            </p>
          </div>
          <div style="background:#402149;padding:14px 32px;text-align:center;">
            <p style="color:#d4b8e0;margin:0;font-size:12px;">Sistema Alquileres Estudiantil — Sucre, Bolivia</p>
          </div>
        </div>`,
      });
    } catch (err) {
      console.error('Error enviando email publicacion-aprobada:', err);
    }
  }
}
