import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ResenasService } from './resenas.service';
import { CreateResenaDto } from './dto/create-resena.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('resenas')
export class ResenasController {
  constructor(private readonly resenasService: ResenasService) {}

  // 1. CREAR RESEÑA (Solo Estudiantes)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('estudiante') // Solo estudiantes pueden calificar
  @Post()
  create(@Request() req, @Body() createResenaDto: CreateResenaDto) {
    // req.user.userId viene del token
    return this.resenasService.create(req.user.userId, createResenaDto);
  }

  // 2. VER RESEÑAS DE UN INMUEBLE (Público)
  // Ruta: GET /resenas/inmueble/5
  @Get('inmueble/:idInmueble')
  findByInmueble(@Param('idInmueble', ParseIntPipe) idInmueble: number) {
    return this.resenasService.findByInmueble(idInmueble);
  }

  // 3. BORRAR RESEÑA (Solo Admin, por moderación)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    // Nota: Deberías agregar un método remove en tu service si quieres esto
    return { message: 'Función de moderación pendiente de implementar en servicio' };
  }
}