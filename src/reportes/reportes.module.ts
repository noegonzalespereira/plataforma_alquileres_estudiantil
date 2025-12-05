import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { Reporte } from './entities/reporte.entity';
import { Usuario } from '../usuarios/entities/usuario.entity'; // Importante

@Module({
  imports: [
    TypeOrmModule.forFeature([Reporte, Usuario])
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}