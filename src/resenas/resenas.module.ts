import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResenasService } from './resenas.service';
import { ResenasController } from './resenas.controller';
import { Resena } from './entities/resena.entity';
import { Inmueble } from '../inmuebles/entities/inmueble.entity'; // Importante
import { Usuario } from '../usuarios/entities/usuario.entity';   // Importante

@Module({
  imports: [
    TypeOrmModule.forFeature([Resena, Inmueble, Usuario])
  ],
  controllers: [ResenasController],
  providers: [ResenasService],
})
export class ResenasModule {}