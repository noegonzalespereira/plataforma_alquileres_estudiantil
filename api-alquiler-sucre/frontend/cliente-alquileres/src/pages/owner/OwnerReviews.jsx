import React, { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Spinner } from 'react-bootstrap';
import { StarFill, Star, ChatQuote, HouseDoor } from 'react-bootstrap-icons';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const OwnerReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const colors = { bg: '#eaf0f2', purpleDark: '#402149' };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // 1. Traer mis inmuebles
        const resProps = await api.get('/inmuebles');
        const myProps = resProps.data.filter(p => p.propietario?.id === user.id);
        
        // 2. Traer reseñas de cada inmueble
        let allReviews = [];
        for (const prop of myProps) {
          const res = await api.get(`/resenas/inmueble/${prop.id}`);
          // Agregamos el título del inmueble a la reseña para saber de cuál hablan
          const reviewsWithTitle = res.data.map(r => ({ ...r, inmuebleTitulo: prop.titulo }));
          allReviews = [...allReviews, ...reviewsWithTitle];
        }
        
        setReviews(allReviews);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [user]);

  const renderStars = (n) => [...Array(5)].map((_, i) => i < n ? <StarFill key={i} className="text-warning"/> : <Star key={i} className="text-muted"/>);

  if (loading) return <Container className="py-5 text-center"><Spinner animation="border"/></Container>;

  return (
    <Container fluid className="py-4" style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      <Container>
        <h2 className="mb-4 fw-bold" style={{ color: colors.purpleDark }}>
          <StarFill className="me-2 text-warning"/> Opiniones de Estudiantes
        </h2>

        {reviews.length === 0 ? (
          <div className="p-5 text-center bg-white rounded shadow-sm">
            <h4>Aún no tienes reseñas.</h4>
            <p className="text-muted">Cuando un estudiante califique tus alquileres, aparecerán aquí.</p>
          </div>
        ) : (
          <Row>
            {reviews.map((r) => (
              <Col key={r.id} md={6} className="mb-3">
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between mb-2">
                      <h6 className="fw-bold mb-0">{r.estudiante?.nombre} {r.estudiante?.apellido}</h6>
                      <small className="text-muted">{new Date(r.fecha).toLocaleDateString()}</small>
                    </div>
                    <div className="mb-2">{renderStars(r.calificacion)}</div>
                    <p className="text-secondary fst-italic">"{r.comentario}"</p>
                    <hr/>
                    <small className="text-primary fw-bold">
                      <HouseDoor className="me-1"/> {r.inmuebleTitulo}
                    </small>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </Container>
  );
};

export default OwnerReviews;