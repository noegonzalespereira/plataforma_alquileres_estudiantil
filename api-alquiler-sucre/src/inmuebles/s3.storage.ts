import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import { extname } from 'path';

/**
 * Crea una instancia de S3Client usando las variables de entorno.
 * Se llama en tiempo de petición para que las vars ya estén disponibles.
 */
function getS3Client(): S3Client {
  return new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });
}

/**
 * Crea un storage de multer que sube archivos directamente a S3.
 * @param folder  Carpeta dentro del bucket (ej: 'inmuebles', 'comprobantes')
 */
export function createS3Storage(folder: string) {
  return multerS3({
    s3: getS3Client(),
    bucket: (_req, _file, cb) =>
      cb(null, process.env.AWS_S3_BUCKET_NAME || ''),
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `${folder}/${uniqueSuffix}${ext}`);
    },
  });
}
