import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Al cargar la app, revisamos si hay un token guardado
  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
        // Aquí podrías validar el token con el backend si quisieras ser más estricto
      }
      setLoading(false);
    };
    checkLogin();
  }, []);

  // 2. Función de Login
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      
      // Guardamos en LocalStorage para que no se pierda al recargar
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.usuario));
      
      setUser(res.data.usuario);
      return { success: true, user: res.data.usuario };
    } catch (error) {
      console.error(error);
      return { success: false, message: error.response?.data?.message || 'Error al iniciar sesión' };
    }
  };

  // 3. Función de Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login'; // Redirigir al login
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};