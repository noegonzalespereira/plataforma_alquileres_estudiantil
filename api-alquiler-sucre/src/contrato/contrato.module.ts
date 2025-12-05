import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContratosService } from './contrato.service';
import { ContratosController } from './contrato.controller';
import { Contrato } from './entities/contrato.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Inmueble } from '../inmuebles/entities/inmueble.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contrato, Usuario, Inmueble])
  ],
  controllers: [ContratosController],
  providers: [ContratosService],
})
export class ContratoModule {} 