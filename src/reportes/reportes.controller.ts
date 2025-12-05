import { Controller, Get, Post, Body, UseGuards, Request,Patch,Delete,Param,ParseIntPipe } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  // 1. CREAR REPORTE (Cualquier usuario logueado)
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Request() req, @Body() createReporteDto: CreateReporteDto) {
    return this.reportesService.create(req.user.userId, createReporteDto);
  }

  // 2. VER TODOS LOS REPORTES (Solo Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get()
  findAll() {
    return this.reportesService.findAll();
  }
  // 3. MARCAR COMO RESUELTO (Solo Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id/resolver')
  resolve(@Param('id', ParseIntPipe) id: number) {
    return this.reportesService.resolve(id);
  }

  // 4. ELIMINAR REPORTE (Solo Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reportesService.remove(id);
  }
}