import { Outlet, Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { ShieldLockFill,ExclamationTriangleFill, CheckCircle, GearFill,FileEarmarkText, BoxArrowRight,PlusLg,PeopleFill,PersonBadgeFill } from 'react-bootstrap-icons';

const AdminLayout = () => {
  const { user, logout } = useAuth();

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/admin/properties" className="d-flex align-items-center gap-2">
            <ShieldLockFill size={24} className="text-warning" /> 
            <span>Admin Panel</span>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="admin-nav" />
          <Navbar.Collapse id="admin-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/admin/properties" className="d-flex align-items-center gap-2">
                <CheckCircle /> Validar Publicaciones
              </Nav.Link>
              <Nav.Link as={Link} to="/admin/create-property">
                <PlusLg /> Registrar Inmueble
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/users">
                <PeopleFill /> Usuarios
            </Nav.Link>
              <Nav.Link as={Link} to="/admin/services" className="d-flex align-items-center gap-2">
                <GearFill /> Servicios
              </Nav.Link>
              <Nav.Link as={Link} to="/admin/admins">
                <PersonBadgeFill /> Admins
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/contracts">
                <FileEarmarkText /> Contratos Globales
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/reports">
                <ExclamationTriangleFill /> Reportes
                </Nav.Link>
            </Nav>

            <Button variant="outline-light" onClick={logout} className="d-flex align-items-center gap-2">
              <BoxArrowRight /> Salir
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-4">
        <Outlet />
      </Container>
    </>
  );
};

export default AdminLayout;