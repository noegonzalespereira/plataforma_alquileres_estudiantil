import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MensajeService } from './mensaje.service';
import { MensajeController } from './mensaje.controller';
import { Mensaje } from './entities/mensaje.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mensaje])],
  controllers: [MensajeController],
  providers: [MensajeService],
})
export class MensajeModule {}