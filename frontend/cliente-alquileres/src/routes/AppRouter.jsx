import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HomePage from '../pages/HomePage';
import ProfilePage from '../pages/auth/ProfilePage';
// Importamos Layouts
import PublicLayout from '../layouts/PublicLayout';
import StudentLayout from '../layouts/StudentLayout';
import OwnerLayout from '../layouts/OwnerLayout';
import AdminLayout from '../layouts/AdminLayout';

// Importamos Páginas de Auth
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Importamos Páginas de Estudiante
import CatalogPage from '../pages/student/CatalogPage';
import PropertyDetail from '../pages/student/PropertyDetail'; // <--- Faltaba este
import StudentContracts from '../pages/student/StudentContracts'; // <--- Faltaba este (si lo creaste)
import StudentChat from '../pages/student/StudentChat'; // <--- Importar
// Importamos Páginas de Propietario
import OwnerDashboard from '../pages/owner/OwnerDashboard';
import CreateContract from '../pages/owner/CreateContract'; // <--- Faltaba este
import OwnerChat from '../pages/owner/OwnerChat'; // <--- Faltaba este
import OwnerProperties from '../pages/owner/OwnerProperties';
import OwnerReviews from '../pages/owner/OwnerReviews';

// Importamos Páginas de Admin
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageProperties from '../pages/admin/ManageProperties'; // <--- Faltaba este
import ManageServices from '../pages/admin/ManageServices'; // <--- Faltaba este
import CreateProperty from '../pages/admin/CreateProperty';
import ManageUsers from '../pages/admin/ManageUsers';
import ManageAdmins from '../pages/admin/ManageAdmins';
import AdminContracts from '../pages/admin/AdminContracts';
import ManageReports from '../pages/admin/ManageReports';

const AppRouter = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center mt-5">Cargando sistema...</div>;

  return (
    <Routes>
      {/* 1. RUTAS PÚBLICAS (Envueltas en PublicLayout) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* 2. ZONA ESTUDIANTE */}
      {user?.rol === 'estudiante' && (
        <Route path="/student" element={<StudentLayout />}>
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="property/:id" element={<PropertyDetail />} /> {/* Ruta dinámica para ver detalles */}
          <Route path="contracts" element={<StudentContracts />} /> {/* Usa el componente real o un placeholder */}
          <Route path="chat" element={<StudentChat />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route index element={<Navigate to="catalog" />} />
        </Route>
      )}

      {/* 3. ZONA PROPIETARIO */}
      {user?.rol === 'propietario' && (
        <Route path="/owner" element={<OwnerLayout />}>
          <Route path="dashboard" element={<OwnerDashboard />} />
          <Route path="create-contract" element={<CreateContract />} /> {/* Componente real */}
          <Route path="chat" element={<OwnerChat />} /> {/* Componente real */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="properties" element={<OwnerProperties />} />
    <Route path="reviews" element={<OwnerReviews />} />
          <Route index element={<Navigate to="dashboard" />} />
        </Route>
      )}

      {/* 4. ZONA ADMIN */}
      {user?.rol === 'admin' && (
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} /> {/* Stats */}
          <Route path="properties" element={<ManageProperties />} /> {/* Tabla de validación */}
          <Route path="services" element={<ManageServices />} /> {/* CRUD Servicios */}
          <Route path="create-property" element={<CreateProperty />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="admins" element={<ManageAdmins />} />
          <Route path="contracts" element={<AdminContracts />} />
          <Route path="reports" element={<ManageReports />} />
          {/* Por defecto vamos a properties o dashboard */}
          <Route index element={<Navigate to="properties" />} />
        </Route>
      )}

      {/* 5. CUALQUIER OTRA RUTA -> AL LOGIN */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRouter;