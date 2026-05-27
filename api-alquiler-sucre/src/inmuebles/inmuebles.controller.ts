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
import { memoryStorage } from 'multer';
import { S3Service } from './s3.service';

@Controller('inmuebles')
export class InmueblesController {
  constructor(
    private readonly inmueblesService: InmueblesService,
    private readonly s3Service: S3Service,
  ) {}

  // ─── 1. PÚBLICO: Listar inmuebles disponibles ───────────────────────────────
  @Get()
  findAll() {
    return this.inmueblesService.findAllPublic();
  }

  // ─── 2. PROPIETARIO: Ver solo sus inmuebles (ANTES de :id) ─────────────────
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('propietario', 'admin')
  @Get('mis-inmuebles')
  findMios(@Req() req: any) {
    return this.inmueblesService.findByPropietario(req.user.userId);
  }

  // ─── 3. PÚBLICO: Detalle de un inmueble ────────────────────────────────────
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inmueblesService.findOne(id);
  }

  // ─── 4. ADMIN / PROPIETARIO: Crear publicación con fotos → S3 + CloudFront ─
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'propietario')
  @Post()
  @UseInterceptors(
    FilesInterceptor('fotos', 10, { storage: memoryStorage() }),
  )
  async create(
    @Body() createInmuebleDto: CreateInmuebleDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    // Subir cada foto a S3 y obtener la URL de CloudFront
    const imagenesPaths: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const key = `inmuebles/${Date.now()}-${file.originalname}`;
        const { url } = await this.s3Service.uploadFile(file, key);
        imagenesPaths.push(url);
      }
    }
    return this.inmueblesService.create(createInmuebleDto, imagenesPaths);
  }

  // ─── 5. ADMIN / PROPIETARIO: Ver lista completa ────────────────────────────
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'propietario')
  @Get('admin/todos')
  findAllAdmin() {
    return this.inmueblesService.findAllAdmin();
  }

  // ─── 6. ADMIN / PROPIETARIO: Editar + agregar fotos → S3 + CloudFront ──────
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'propietario')
  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('fotos', 10, { storage: memoryStorage() }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInmuebleDto: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const nuevasFotosPaths: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const key = `inmuebles/${Date.now()}-${file.originalname}`;
        const { url } = await this.s3Service.uploadFile(file, key);
        nuevasFotosPaths.push(url);
      }
    }
    return this.inmueblesService.update(id, updateInmuebleDto, nuevasFotosPaths);
  }

  // ─── 7. ADMIN / PROPIETARIO: Eliminar inmueble ─────────────────────────────
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'propietario')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inmueblesService.remove(id);
  }

  // ─── 8. PROPIETARIO: Subir comprobante de pago → S3 + CloudFront ───────────
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('propietario')
  @Patch(':id/solicitar-pago')
  @UseInterceptors(
    FileInterceptor('comprobante', { storage: memoryStorage() }),
  )
  async solicitarPago(
    @Param('id', ParseIntPipe) id: number,
    @Body('fechaVencimiento') fechaVencimiento: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    let comprobantePath = '';
    if (file) {
      const key = `comprobantes/${Date.now()}-${file.originalname}`;
      const { url } = await this.s3Service.uploadFile(file, key);
      comprobantePath = url;
    }
    return this.inmueblesService.solicitarPago(id, fechaVencimiento, comprobantePath);
  }

  // ─── 9. ADMIN: Confirmar pago → activa y envía email ───────────────────────
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
