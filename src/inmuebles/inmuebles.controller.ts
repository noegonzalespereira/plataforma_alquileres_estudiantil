import { Controller, Get, Post, Body, Patch, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { InmueblesService } from './inmuebles.service';
import { CreateInmuebleDto } from './dto/create-inmueble.dto';
import { ActivateInmuebleDto } from './dto/activate-inmueble.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('inmuebles')
export class InmueblesController {
  constructor(private readonly inmueblesService: InmueblesService) {}

  // 1. PÚBLICO: Estudiantes buscando casa
  @Get()
  findAll() {
    return this.inmueblesService.findAllPublic();
  }

  // 2. PÚBLICO o PROTEGIDO: Ver detalle de una casa
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inmueblesService.findOne(id);
  }

  // 3. SOLO ADMIN: Crear Publicación
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() createInmuebleDto: CreateInmuebleDto) {
    return this.inmueblesService.create(createInmuebleDto);
  }

  // 4. SOLO ADMIN: Ver lista completa (incluso vencidos)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('admin/todos') // Ruta especial: /inmuebles/admin/todos
  findAllAdmin() {
    return this.inmueblesService.findAllAdmin();
  }

  // 5. SOLO ADMIN: Activar / Renovar
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id/activar')
  activar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActivateInmuebleDto) {
    return this.inmueblesService.activate(id, dto);
  }
}