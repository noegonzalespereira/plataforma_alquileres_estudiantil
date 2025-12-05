import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express'; 
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Elimina datos que no estén en el DTO (seguridad)
    forbidNonWhitelisted: true, // Lanza error si envían datos extra
    transform: true, // <--- Importante para convertir "1" a numero 1 en multipart
    transformOptions: {
      enableImplicitConversion: true,
    }
  }));

  // Habilitar CORS para que React se pueda conectar después
  app.enableCors();
  const uploadDir = resolve('./uploads');
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir);
    console.log('Carpeta uploads creada exitosamente');
  }
  app.useStaticAssets(uploadDir, {
    prefix: '/uploads/',
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
