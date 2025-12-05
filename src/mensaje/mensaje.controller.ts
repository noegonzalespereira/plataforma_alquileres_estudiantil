import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch, ParseIntPipe } from '@nestjs/common';
import { MensajeService } from './mensaje.service';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt')) // Todo el controlador protegido
@Controller('mensajes')
export class MensajeController {
  constructor(private readonly mensajeService: MensajeService) {}

  // 1. ENVIAR MENSAJE
  @Post()
  create(@Request() req, @Body() createMensajeDto: CreateMensajeDto) {
    // req.user.userId viene del Token (Estrategia JWT)
    return this.mensajeService.create(req.user.userId, createMensajeDto);
  }

  // 2. VER UN CHAT ESPECÍFICO
  // Ejemplo: /mensajes/chat/con/5/inmueble/20
  // (Ver chat con el usuario ID 5 sobre el Inmueble 20)
  @Get('chat/con/:idOtroUsuario/inmueble/:idInmueble')
  getConversation(
    @Request() req,
    @Param('idOtroUsuario', ParseIntPipe) idOtroUsuario: number,
    @Param('idInmueble', ParseIntPipe) idInmueble: number
  ) {
    return this.mensajeService.getConversation(req.user.userId, idOtroUsuario, idInmueble);
  }

  // 3. VER TODOS MIS MENSAJES (Bandeja de entrada general)
  @Get('mis-mensajes')
  getMyMessages(@Request() req) {
    return this.mensajeService.getMyMessages(req.user.userId);
  }

  // 4. MARCAR COMO LEÍDO
  @Patch(':id/leer')
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.mensajeService.markAsRead(id);
  }
}