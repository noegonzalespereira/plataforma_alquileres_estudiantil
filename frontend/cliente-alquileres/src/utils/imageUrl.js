/**
 * Devuelve la URL correcta para mostrar una imagen.
 *
 * - Si la URL ya es absoluta (empieza con http/https → CloudFront o S3) la usa tal cual.
 * - Si es relativa (ej: "uploads/foto.jpg" → imágenes antiguas) le agrega la base de la API.
 *
 * @param {string} url  Valor del campo foto.url que viene de la BD
 * @returns {string}    URL lista para usar en <img src={...}>
 */
export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url; // URL absoluta de CloudFront o S3 → usar directo
  }
  // URL relativa antigua (uploads/...) → añadir base de la API
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return `${apiBase}/${url}`;
};
