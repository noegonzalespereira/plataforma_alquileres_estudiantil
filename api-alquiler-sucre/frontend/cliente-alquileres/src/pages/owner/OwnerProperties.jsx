import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner } from 'react-bootstrap';
import { HouseDoor, CalendarCheck, EyeFill, EyeSlashFill, ExclamationCircle } from 'react-bootstrap-icons';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const OwnerProperties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Colores
  const colors = { bg: '#eaf0f2', purpleDark: '#402149', coral: '#f67f54' };

  useEffect(() => {
    const fetchMyProps = async () => {
      try {
        // Obtenemos todos y filtramos en el frontend (o podrías crear un endpoint específico)
        const res = await api.get('/inmuebles');
        // Filtramos solo los que pertenecen a este dueño
        const mine = res.data.filter(p => p.propietario?.id === user.id);
        setProperties(mine);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProps();
  }, [user]);

  if (loading) return <Container className="text-center py-5"><Spinner animation="border"/></Container>;

  return (
    <Container fluid className="py-4" style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      <Container>
        <h2 className="mb-4 fw-bold" style={{ color: colors.purpleDark }}>
          <HouseDoor className="me-2"/> Mis Publicaciones
        </h2>

        {properties.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <h4>Aún no tienes propiedades publicadas.</h4>
            <p>Contacta al administrador para registrar tu primer inmueble.</p>
          </div>
        ) : (
          <Row>
            {properties.map((p) => {
              const isExpired = p.fechaVencimiento && new Date(p.fechaVencimiento) < new Date();
              
              return (
                <Col key={p.id} md={6} lg={4} className="mb-4">
                  <Card className="h-100 shadow-sm border-0">
                    <div style={{ height: '200px', backgroundColor: '#eee', overflow: 'hidden', position: 'relative' }}>
                      {p.fotos[0] ? (
                        <img src={`http://localhost:3000/${p.fotos[0].url}`} style={{ width:'100%', height:'100%', objectFit:'cover'}} alt="casa"/>
                      ) : <div className="d-flex h-100 justify-content-center align-items-center text-muted">Sin foto</div>}
                      
                      <Badge 
                        bg={p.visible ? "success" : "secondary"} 
                        className="position-absolute top-0 end-0 m-3"
                      >
                        {p.visible ? "Visible" : "Oculto"}
                      </Badge>
                    </div>
                    
                    <Card.Body>
                      <h5 className="fw-bold text-truncate">{p.titulo}</h5>
                      <h5 style={{ color: colors.coral }}>{p.precio} Bs.</h5>
                      <p className="text-muted small mb-2">{p.direccion}</p>
                      
                      <hr/>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">Vencimiento:</small>
                        {isExpired ? (
                          <Badge bg="danger"><ExclamationCircle/> Vencido</Badge>
                        ) : (
                          <span className="fw-bold text-success">
                            {p.fechaVencimiento ? new Date(p.fechaVencimiento).toLocaleDateString() : 'Indefinido'}
                          </span>
                        )}
                      </div>

                      {/* <div className="mt-3 d-grid">
                        <Button variant="outline-primary" size="sm" href={`/student/property/${p.id}`}>
                          <EyeFill className="me-1"/> Ver cómo luce
                        </Button>
                      </div> */}
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>
    </Container>
  );
};

export default OwnerProperties;