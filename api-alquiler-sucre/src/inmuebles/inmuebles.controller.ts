import {
  Controller, Get, Post, Body, Patch, Param,
  UseGuards, ParseIntPipe, UseInterceptors,
  UploadedFiles, UploadedFile, Delete, Req,
} from '@nestjs/common';
import { InmueblesService } from './inmuebles.service';
import { CreateInmuebleDto } from './dto/create-inmueble.dto';
import { ActivateInmuebleDto } from './dto/activate-inmueble.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { createS3Storage } from './s3.storage';

/** Extrae la URL pública de S3 del objeto de archivo subido por multer-s3 */
function getS3Url(file: Express.Multer.File): string {
  return (file as any).location as string;
}

@Controller('inmuebles')
export class InmueblesController {
  constructor(private readonly inmueblesService: InmueblesService) {}

  // 1. PÚBLICO: Estudiantes buscando casa
  @Get()
  findAll() {
    return this.inmueblesService.findAllPublic();
  }

  // 2. PROPIETARIO: Ver solo sus inmuebles (debe ir ANTES de :id)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('propietario', 'admin')
  @Get('mis-inmuebles')
  findMios(@Req() req: any) {
    return this.inmueblesService.findByPropietario(req.user.userId);
  }

  // 3. PÚBLICO o PROTEGIDO: Ver detalle de una casa
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inmueblesService.findOne(id);
  }

  // 4. SOLO ADMIN / PROPIETARIO: Crear publicación con fotos → S3
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'propietario')
  @Post()
  @UseInterceptors(
    FilesInterceptor('fotos', 10, {
      storage: createS3Storage('inmuebles'),
    }),
  )
  create(
    @Body() createInmuebleDto: CreateInmuebleDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    // .location es la URL pública de S3
    const imagenesPaths = files ? files.map(getS3Url) : [];
    return this.inmueblesService.create(createInmuebleDto, imagenesPaths);
  }

  // 5. SOLO ADMIN: Ver lista completa (incluso vencidos)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'propietario')
  @Get('admin/todos')
  findAllAdmin() {
    return this.inmueblesService.findAllAdmin();
  }

  // 6. EDITAR INFORMACIÓN + AGREGAR FOTOS (Admin / Propietario) → S3
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'propietario')
  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('fotos', 10, {
      storage: createS3Storage('inmuebles'),
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInmuebleDto: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const nuevasFotosPaths = files ? files.map(getS3Url) : [];
    return this.inmueblesService.update(id, updateInmuebleDto, nuevasFotosPaths);
  }

  // 7. ELIMINAR (Admin / Propietario)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'propietario')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inmueblesService.remove(id);
  }

  // 8. PROPIETARIO: Subir comprobante de pago → S3
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('propietario')
  @Patch(':id/solicitar-pago')
  @UseInterceptors(
    FileInterceptor('comprobante', {
      storage: createS3Storage('comprobantes'),
    }),
  )
  solicitarPago(
    @Param('id', ParseIntPipe) id: number,
    @Body('fechaVencimiento') fechaVencimiento: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const comprobantePath = file ? getS3Url(file) : '';
    return this.inmueblesService.solicitarPago(id, fechaVencimiento, comprobantePath);
  }

  // 9. ADMIN: Confirmar pago → activa y envía email
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'propietario')
  @Patch(':id/activar')
  activar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActivateInmuebleDto,
  ) {
    return this.inmueblesService.activate(id, dto);
  }
}
