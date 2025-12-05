import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; 
import { TypeOrmModule } from '@nestjs/typeorm';

// Tus módulos...
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { InmueblesModule } from './inmuebles/inmuebles.module';
import { ServiciosModule } from './servicios/servicios.module';
import { MensajeModule } from './mensaje/mensaje.module';
import { ContratoModule } from './contrato/contrato.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost', 
      port: 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '', 
      database: process.env.DB_DATABASE || 'alquileres_sucre_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsuariosModule, AuthModule, InmueblesModule, ServiciosModule, MensajeModule, ContratoModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}