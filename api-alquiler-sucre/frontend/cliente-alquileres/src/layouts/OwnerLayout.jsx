import { Outlet, Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Building,Gear, FileEarmarkPlus,StarFill, ChatQuote, BoxArrowRight, HouseDoorFill } from 'react-bootstrap-icons';

const OwnerLayout = () => {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Usamos bg="success" para diferenciar visualmente */}
      <Navbar bg="success" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/owner/dashboard" className="d-flex align-items-center gap-2">
            <HouseDoorFill size={24} /> 
            <span>Propietario: {user?.nombre}</span>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="owner-nav" />
          <Navbar.Collapse id="owner-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/owner/dashboard" className="d-flex align-items-center gap-2">
                <Building /> Mis Inmuebles
              </Nav.Link>
              <Nav.Link as={Link} to="/owner/create-contract" className="d-flex align-items-center gap-2">
                <FileEarmarkPlus /> Nuevo Contrato
              </Nav.Link>
              <Nav.Link as={Link} to="/owner/chat" className="d-flex align-items-center gap-2">
                <ChatQuote /> Mensajes
              </Nav.Link>
              <Nav.Link as={Link} to="/owner/properties">
                    <HouseDoorFill /> Mis Avisos
                </Nav.Link>
                <Nav.Link as={Link} to="/owner/reviews">
                    <StarFill /> Opiniones
                </Nav.Link>
              <Nav.Link as={Link} to="/owner/profile"> {/* <--- LINK CORRECTO */}
                  <Gear className="me-2"/> Mi Perfil
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

export default OwnerLayout;