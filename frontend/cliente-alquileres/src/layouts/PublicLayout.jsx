import { Outlet } from 'react-router-dom';
import { Container, Navbar } from 'react-bootstrap';
import { HouseHeart } from 'react-bootstrap-icons';

const PublicLayout = () => {
  return (
    <>
      <Navbar bg="light" variant="light" className="shadow-sm">
        <Container>
          <Navbar.Brand className="d-flex align-items-center gap-2 fw-bold text-primary">
            <HouseHeart size={30} /> 
            Alquileres Sucre
          </Navbar.Brand>
        </Container>
      </Navbar>
      
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Outlet />
      </Container>
    </>
  );
};

export default PublicLayout;