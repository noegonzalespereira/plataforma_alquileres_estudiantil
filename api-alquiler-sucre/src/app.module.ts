import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { InmueblesModule } from './inmuebles/inmuebles.module';
import { ServiciosModule } from './servicios/servicios.module';
import { MensajeModule } from './mensaje/mensaje.module';
import { ContratoModule } from './contrato/contrato.module';
import { ResenasModule } from './resenas/resenas.module';
import { ReportesModule } from './reportes/reportes.module';
import { MailModule } from './mail/mail.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'alquileres_sucre_db',
      autoLoadEntities: true,
      synchronize: true,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }),
    MailModule,
    UsuariosModule, AuthModule, InmueblesModule, ServiciosModule,
    MensajeModule, ContratoModule, ResenasModule, ReportesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}