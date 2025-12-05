// 1. AGREGAMOS: UseInterceptors, UploadedFiles
import { Controller, Get, Post, Body, Patch, Param, UseGuards, ParseIntPipe, UseInterceptors, UploadedFiles,Delete } from '@nestjs/common';
import { InmueblesService } from './inmuebles.service';
import { CreateInmuebleDto } from './dto/create-inmueble.dto';
import { ActivateInmuebleDto } from './dto/activate-inmueble.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

// 2. AGREGAMOS: FilesInterceptor (ya lo tenías, pero asegúrate)
import { FilesInterceptor } from '@nestjs/platform-express';

// 3. AGREGAMOS: diskStorage
import { diskStorage } from 'multer';

// 4. AGREGAMOS: extname
import { extname } from 'path';

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
  @UseInterceptors(FilesInterceptor('fotos', 10, { 
    storage: diskStorage({
      destination: './uploads', 
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${uniqueSuffix}${ext}`);
      },
    }),
  }))
  create(
    @Body() createInmuebleDto: CreateInmuebleDto,
    @UploadedFiles() files: Array<Express.Multer.File> 
  ) {
    const imagenesPaths = files ? files.map(file => `uploads/${file.filename}`) : [];
    
    // Aquí TypeScript ya no debería quejarse
    return this.inmueblesService.create(createInmuebleDto, imagenesPaths);
  }

  // 4. SOLO ADMIN: Ver lista completa (incluso vencidos)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('admin/todos') 
  findAllAdmin() {
    return this.inmueblesService.findAllAdmin();
  }

  // 5. SOLO ADMIN: Activar / Renovar
 // 6. EDITAR INFORMACIÓN + AGREGAR FOTOS (Solo Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('fotos', 10, { // Permitimos subir fotos también al editar
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${uniqueSuffix}${ext}`);
      },
    }),
  }))
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateInmuebleDto: any,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    // Si subieron fotos nuevas, generamos sus rutas
    const nuevasFotosPaths = files ? files.map(file => `uploads/${file.filename}`) : [];
    
    return this.inmueblesService.update(id, updateInmuebleDto, nuevasFotosPaths);
  }
  // 7. ELIMINAR (Solo Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete(':id') // Importar Delete de @nestjs/common
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inmueblesService.remove(id);
  }
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id/activar') // La URL es /inmuebles/1/activar
  activar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActivateInmuebleDto) {
    return this.inmueblesService.activate(id, dto);
  }
}