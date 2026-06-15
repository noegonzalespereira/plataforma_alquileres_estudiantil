const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');

const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
const BUCKET = process.env.BUCKET_NAME || 'alquileres-imagenes-10380909';
const MAX_WIDTH = 800;
const MAX_HEIGHT = 600;

exports.handler = async (event) => {
  for (const record of event.Records) {
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    if (!key.startsWith('originales/')) {
      console.log(`Ignorando clave sin prefijo originales/: ${key}`);
      continue;
    }

    const thumbnailKey = key.replace('originales/', 'thumbnail/');

    console.log(`Procesando: ${key} → ${thumbnailKey}`);

    // Descargar imagen original desde S3
    const { Body, ContentType } = await s3.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    );

    const chunks = [];
    for await (const chunk of Body) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Redimensionar manteniendo proporciones, sin agrandar imágenes pequeñas
    const resized = await sharp(buffer)
      .resize(MAX_WIDTH, MAX_HEIGHT, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Subir thumbnail a S3
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: thumbnailKey,
        Body: resized,
        ContentType: 'image/jpeg',
      }),
    );

    console.log(`Thumbnail generado correctamente: ${thumbnailKey}`);
  }
};
