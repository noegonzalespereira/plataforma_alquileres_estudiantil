import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MensajeService } from './mensaje.service';
import { MensajeController } from './mensaje.controller';
import { Mensaje } from './entities/mensaje.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Inmueble } from '../inmuebles/entities/inmueble.entity'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Mensaje, Usuario, Inmueble])
  ],
  controllers: [MensajeController],
  providers: [MensajeService],
})
export class MensajeModule {}