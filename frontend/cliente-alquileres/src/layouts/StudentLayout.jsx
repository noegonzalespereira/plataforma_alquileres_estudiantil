import { Outlet, Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button,NavDropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
// Importamos los iconos que necesitamos
import { Search, FileText, ChatDots,Gear, BoxArrowRight, PersonCircle } from 'react-bootstrap-icons';

const StudentLayout = () => {
  const { user, logout } = useAuth();

  return (
    <>
      <Navbar bg="primary" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/student/catalog" className="d-flex align-items-center gap-2">
            <PersonCircle size={24} /> 
            <span>Estudiante: {user?.nombre}</span>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="student-nav" />
          <Navbar.Collapse id="student-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/student/catalog" className="d-flex align-items-center gap-2">
                <Search /> Buscar Alquiler
              </Nav.Link>
              <Nav.Link as={Link} to="/student/contracts" className="d-flex align-items-center gap-2">
                <FileText /> Mis Contratos
              </Nav.Link>
              <Nav.Link as={Link} to="/student/chat" className="d-flex align-items-center gap-2">
                <ChatDots /> Mis Chats
              </Nav.Link>
              <Nav.Link as={Link} to="/student/profile">
                  <Gear className="me-2"/> Mi Perfil
                </Nav.Link>
            </Nav>
            
            <Button variant="outline-light" onClick={logout} className="d-flex align-items-center gap-2">
              <BoxArrowRight /> Salir
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      {/* Contenido de la página */}
      <Container className="py-4">
        <Outlet />
      </Container>
    </>
  );
};

export default StudentLayout;