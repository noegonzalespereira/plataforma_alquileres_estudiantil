import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InmueblesService } from './inmuebles.service';
import { InmueblesController } from './inmuebles.controller';
import { Inmueble } from './entities/inmueble.entity';
import { FotoInmueble } from './entities/foto-inmueble.entity';
import { Usuario } from '../usuarios/entities/usuario.entity'; // <--- Importante
import { Servicio } from '../servicios/entities/servicio.entity'; // <--- Importante

@Module({
  imports: [
    TypeOrmModule.forFeature([Inmueble, FotoInmueble, Usuario, Servicio])
  ],
  controllers: [InmueblesController],
  providers: [InmueblesService],
  exports: [InmueblesService]
})
export class InmueblesModule {}