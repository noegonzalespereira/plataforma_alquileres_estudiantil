import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private readonly bucketName = process.env.AWS_S3_BUCKET_NAME;

  constructor() {
    this.s3Client = new S3Client({
      region: `${process.env.AWS_REGION}`,
      credentials: {
        accessKeyId: `${process.env.AWS_ACCESS_KEY_ID}`,
        secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
      },
    });
  }

  /**
   * Sube un archivo al bucket S3 y devuelve la URL de CloudFront.
   * @param file  Archivo de multer (memoryStorage → tiene .buffer)
   * @param key   Ruta dentro del bucket: ej. "inmuebles/1234-foto.jpg"
   */
  async uploadFile(file: Express.Multer.File, key: string) {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      // La URL pública es a través de CloudFront (no de S3 directo)
      return { key, url: `${process.env.AWS_S3_CDN}/${key}` };
    } catch (error) {
      console.error('Error al subir a S3:', error);
      throw new InternalServerErrorException('No se pudo subir el archivo a S3');
    }
  }

  /**
   * Genera una URL pre-firmada para descargar un objeto privado.
   * @param key  Clave del objeto en S3
   */
  async getPresignedDownloadUrl(key: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600, // válida por 1 hora
      });
      return url;
    } catch (error) {
      throw new InternalServerErrorException(
        'No se pudo generar la URL de descarga',
      );
    }
  }
}
