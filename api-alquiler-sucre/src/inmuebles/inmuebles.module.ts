import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InmueblesService } from './inmuebles.service';
import { InmueblesController } from './inmuebles.controller';
import { Inmueble } from './entities/inmueble.entity';
import { FotoInmueble } from './entities/foto-inmueble.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Servicio } from '../servicios/entities/servicio.entity';
import { S3Service } from './s3.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inmueble, FotoInmueble, Usuario, Servicio]),
  ],
  controllers: [InmueblesController],
  providers: [InmueblesService, S3Service],
  exports: [InmueblesService, S3Service],
})
export class InmueblesModule {}
