import axios from 'axios';

// Creamos una instancia para no repetir la URL a cada rato
const api = axios.create({
  baseURL: 'http://localhost:3000', // La URL de tu NestJS
});

// Interceptor: Antes de cada petición, inyectamos el Token si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Guardaremos el token aquí al loguearnos
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;