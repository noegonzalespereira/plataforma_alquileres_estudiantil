import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ContratosService } from './contrato.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('contratos')
export class ContratosController {
  constructor(private readonly contratosService: ContratosService) {}

  // 1. CREAR CONTRATO: Solo el Propietario puede registrarlo
  @Roles('propietario', 'admin') // Admin también por si acaso
  @Post()
  create(@Request() req, @Body() createContratoDto: CreateContratoDto) {
    // req.user.userId es el ID del Propietario logueado
    return this.contratosService.create(req.user.userId, createContratoDto);
  }

  // 2. VER MIS CONTRATOS: Estudiantes ven los suyos, dueños los suyos
  @Get('mis-contratos')
  findMyContracts(@Request() req) {
    // Pasamos el usuario completo (id y rol) para saber qué buscar
    return this.contratosService.findMyContracts(req.user);
  }

  // 3. DETALLE CONTRATO
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contratosService.findOne(id);
  }

  // 4. FINALIZAR CONTRATO
  @Roles('propietario', 'admin')
  @Patch(':id/finalizar')
  finalizar(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.contratosService.finalizarContrato(id, req.user.userId);
  }
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('admin/todos')
  findAllAdmin() {
    // Necesitamos crear este método en el servicio, o usar findMyContracts modificado
    return this.contratosService.findAllAdmin(); 
  }
}