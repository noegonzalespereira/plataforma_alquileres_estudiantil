import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { HouseHeart, ShieldCheck, PeopleFill, Search, CheckCircleFill } from 'react-bootstrap-icons';

const HomePage = () => {
  // Paleta de colores
  const colors = {
    bg: '#eaf0f2',
    purpleDark: '#402149',
    purpleLight: '#936b9f',
    coral: '#f67f54',
    yellow: '#f9bb6e'
  };

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* --- HERO SECTION (Portada) --- */}
      <div style={{ 
        background: `linear-gradient(135deg, ${colors.purpleDark} 0%, ${colors.purpleLight} 100%)`, 
        color: 'white', 
        padding: '100px 0',
        textAlign: 'center'
      }}>
        <Container>
          <Row className="justify-content-center">
            <Col md={8}>
              <HouseHeart size={80} className="mb-4 text-white" />
              <h1 className="display-4 fw-bold mb-3">Encuentra tu hogar ideal en Sucre</h1>
              <p className="lead mb-5 opacity-75">
                La plataforma segura para estudiantes universitarios y propietarios. 
                Sin estafas, con contratos legales y trato directo.
              </p>
              <div className="d-flex gap-3 justify-content-center">
                <Link to="/student/catalog">
                  <Button size="lg" style={{ backgroundColor: colors.coral, border: 'none', padding: '15px 40px', fontWeight: 'bold' }}>
                    <Search className="me-2"/> Buscar Alquiler
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="lg" variant="outline-light" style={{ padding: '15px 40px', fontWeight: 'bold' }}>
                    Registrarme
                  </Button>
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* --- BENEFICIOS --- */}
      <Container className="py-5 flex-grow-1">
        <Row className="text-center g-4">
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm p-4 hover-card">
              <div className="mb-3 text-center">
                <ShieldCheck size={50} style={{ color: colors.purpleDark }} />
              </div>
              <h4 className="fw-bold">100% Seguro</h4>
              <p className="text-muted">
                Todas las publicaciones son validadas por nuestros administradores. 
                Olvídate de las estafas en redes sociales.
              </p>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm p-4 hover-card">
              <div className="mb-3 text-center">
                <PeopleFill size={50} style={{ color: colors.coral }} />
              </div>
              <h4 className="fw-bold">Trato Directo</h4>
              <p className="text-muted">
                Contacta directamente con el propietario a través de nuestro chat interno. 
                Sin intermediarios molestos.
              </p>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm p-4 hover-card">
              <div className="mb-3 text-center">
                <CheckCircleFill size={50} style={{ color: colors.purpleLight }} />
              </div>
              <h4 className="fw-bold">Contratos Legales</h4>
              <p className="text-muted">
                Generamos contratos digitales para proteger tus derechos como estudiante 
                y asegurar el pago al propietario.
              </p>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* --- FOOTER --- */}
      <footer className="text-center py-4 text-white" style={{ backgroundColor: colors.purpleDark }}>
        <Container>
          <p className="mb-0">© 2025 Alquileres Sucre. Todos los derechos reservados.</p>
          <small style={{ color: colors.yellow }}>Proyecto Universitario</small>
        </Container>
      </footer>
    </div>
  );
};

export default HomePage;