import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Carousel, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { GeoAltFill, PersonCircle, ChatQuoteFill, ArrowLeft, CheckCircleFill, StarFill, Star } from 'react-bootstrap-icons';
import api from '../../api/axiosConfig';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [prop, setProp] = useState(null);
  const [reviews, setReviews] = useState([]); // Estado para guardar las reseñas
  const [loading, setLoading] = useState(true);
  
  // Estado para el mensaje de contacto (Chat)
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('Hola, estoy interesado en este alquiler. ¿Sigue disponible?');
  const [sending, setSending] = useState(false);

  // Estado para NUEVA Reseña
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const colors = {
    bg: '#eaf0f2',
    purpleDark: '#402149',
    coral: '#f67f54'
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Hacemos dos peticiones al mismo tiempo: Detalle Inmueble y sus Reseñas
      const [resProp, resReviews] = await Promise.all([
        api.get(`/inmuebles/${id}`),
        api.get(`/resenas/inmueble/${id}`)
      ]);
      
      setProp(resProp.data);
      setReviews(resReviews.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await api.post('/mensajes', {
        contenido: message,
        idReceptor: prop.propietario.id,
        idInmueble: prop.id
      });
      alert('Mensaje enviado. Revisa tu bandeja de chat.');
      navigate('/student/chat');
    } catch (error) {
      alert('Error al enviar mensaje');
    } finally {
      setSending(false);
      setShowModal(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setSubmittingReview(true);
    try {
      await api.post('/resenas', {
        idInmueble: parseInt(id),
        calificacion: newRating,
        comentario: newComment
      });
      
      // Limpiar y recargar
      setNewComment('');
      setNewRating(5);
      
      // Recargar solo las reseñas para ver la nueva
      const res = await api.get(`/resenas/inmueble/${id}`);
      setReviews(res.data);
      
      alert('¡Gracias por tu opinión!');
    } catch (error) {
      console.error(error);
      alert('Error al publicar reseña. ¿Ya iniciaste sesión como estudiante?');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Función auxiliar para pintar estrellitas (ej: 4 estrellas llenas, 1 vacía)
  const renderStars = (count) => {
    return [...Array(5)].map((_, i) => (
      i < count ? <StarFill key={i} className="text-warning me-1"/> : <Star key={i} className="text-muted me-1"/>
    ));
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border"/></div>;
  if (!prop) return <div className="text-center mt-5">Inmueble no encontrado</div>;

  return (
    <Container className="py-4" style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      <Button variant="link" onClick={() => navigate(-1)} className="mb-3 text-decoration-none fw-bold" style={{ color: colors.purpleDark }}>
        <ArrowLeft className="me-1"/> Volver al catálogo
      </Button>

      <Row>
        {/* COLUMNA IZQUIERDA: DETALLES Y RESEÑAS */}
        <Col lg={8}>
          
          {/* TARJETA PRINCIPAL DEL INMUEBLE */}
          <Card className="shadow-sm border-0 mb-4 overflow-hidden">
             <Carousel>
              {prop.fotos && prop.fotos.length > 0 ? (
                prop.fotos.map((foto, index) => (
                  <Carousel.Item key={index} style={{ height: '400px', backgroundColor: '#000' }}>
                    <img
                      className="d-block w-100 h-100"
                      src={`http://localhost:3000/${foto.url}`}
                      alt={`Slide ${index}`}
                      style={{ objectFit: 'contain' }}
                    />
                  </Carousel.Item>
                ))
              ) : (
                <div style={{ height: '400px', background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Sin imágenes
                </div>
              )}
            </Carousel>
            
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="fw-bold mb-0" style={{ color: colors.purpleDark }}>{prop.titulo}</h2>
                <Badge bg="success" className="fs-6 px-3 py-2">{prop.tipo.toUpperCase()}</Badge>
              </div>
              
              <h4 className="fw-bold mb-4" style={{ color: colors.coral }}>{prop.precio} Bs. / Mes</h4>
              
              <h5 className="fw-bold">Descripción</h5>
              <p className="text-muted" style={{ whiteSpace: 'pre-line' }}>{prop.descripcion}</p>
              
              <hr />
              
              <h5 className="fw-bold mb-3">Servicios Incluidos</h5>
              <div className="d-flex flex-wrap gap-2">
                {prop.servicios?.map(s => (
                  <Badge key={s.id} bg="light" text="dark" className="border px-3 py-2 fs-6 d-flex align-items-center">
                    <CheckCircleFill className="text-success me-2"/> {s.nombre}
                  </Badge>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* --- SECCIÓN DE RESEÑAS (NUEVO) --- */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-white py-3 border-bottom">
              <h5 className="mb-0 fw-bold">Opiniones de Estudiantes ({reviews.length})</h5>
            </Card.Header>
            <Card.Body className="p-4">
              
              {/* FORMULARIO PARA AGREGAR RESEÑA */}
              <div className="mb-5 p-4 bg-light rounded border">
                <h6 className="fw-bold mb-3">Deja tu opinión:</h6>
                <Form onSubmit={handleSubmitReview}>
                  <Form.Group className="mb-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="text-muted small">Calificación:</span>
                      <div className="d-flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span 
                            key={star} 
                            onClick={() => setNewRating(star)} 
                            style={{ cursor: 'pointer', fontSize: '1.5rem' }}
                            title={`${star} estrellas`}
                          >
                            {star <= newRating ? <StarFill className="text-warning"/> : <Star className="text-muted"/>}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Form.Control 
                      as="textarea" 
                      rows={2} 
                      placeholder="¿Qué tal es la casa? ¿El dueño es amable?" 
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <div className="text-end">
                    <Button 
                      size="sm" 
                      type="submit" 
                      disabled={submittingReview}
                      style={{ backgroundColor: colors.purpleDark, border: 'none' }}
                    >
                      {submittingReview ? 'Publicando...' : 'Publicar Comentario'}
                    </Button>
                  </div>
                </Form>
              </div>

              {/* LISTA DE COMENTARIOS */}
              {reviews.length === 0 ? (
                <div className="text-center text-muted py-3">Aún no hay reseñas. ¡Sé el primero!</div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {reviews.map(r => (
                    <div key={r.id} className="border-bottom pb-3">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <div className="d-flex align-items-center gap-2">
                          <PersonCircle className="text-secondary"/>
                          <strong>{r.estudiante?.nombre || 'Anónimo'}</strong>
                        </div>
                        <small className="text-muted">{new Date(r.fecha).toLocaleDateString()}</small>
                      </div>
                      <div className="mb-2">{renderStars(r.calificacion)}</div>
                      <p className="mb-0 text-secondary">{r.comentario}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>

        </Col>

        {/* COLUMNA DERECHA: DATOS DUEÑO Y CONTACTO */}
        <Col lg={4}>
          <Card className="shadow-sm border-0 sticky-top" style={{ top: '20px' }}>
            <Card.Header className="text-white py-3" style={{ backgroundColor: colors.purpleDark }}>
              <h5 className="mb-0">Contacto Propietario</h5>
            </Card.Header>
            <Card.Body className="p-4 text-center">
              <PersonCircle size={60} className="text-muted mb-3"/>
              <h4>{prop.propietario.nombre} {prop.propietario.apellido}</h4>
              <p className="text-muted mb-4">Propietario verificado</p>

              <div className="d-grid gap-2">
                <Button 
                  size="lg" 
                  style={{ backgroundColor: colors.coral, border: 'none' }}
                  onClick={() => setShowModal(true)}
                >
                  <ChatQuoteFill className="me-2"/> Me Interesa
                </Button>
                <div className="text-muted small mt-2">
                  <GeoAltFill className="me-1"/> Ubicación: {prop.zona}, {prop.direccion}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* MODAL DE MENSAJE RÁPIDO */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Contactar a {prop.propietario.nombre}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Escribe tu mensaje inicial:</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleContact} disabled={sending}>
            {sending ? 'Enviando...' : 'Enviar Mensaje'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PropertyDetail;