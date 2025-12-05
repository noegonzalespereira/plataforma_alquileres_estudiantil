import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContratoService } from './contrato.service';
import { ContratoController } from './contrato.controller';
import { Contrato } from './entities/contrato.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Contrato])],
  controllers: [ContratoController],
  providers: [ContratoService],
})
export class ContratoModule {}
