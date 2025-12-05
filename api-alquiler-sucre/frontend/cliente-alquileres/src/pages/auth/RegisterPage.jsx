import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { PersonPlusFill, CardHeading, TelephoneFill, LockFill, EnvelopeFill, PersonBadgeFill } from 'react-bootstrap-icons';
import api from '../../api/axiosConfig'; // Usamos axios directamente para registrar

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    ci: '',
    email: '',
    password: '',
    telefono: '',
    rol: 'estudiante' // Por defecto
  });

  // Colores
  const colors = {
    bg: '#eaf0f2',
    purpleDark: '#402149',
    coral: '#f67f54',
    purpleLight: '#936b9f'
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Hacemos POST al endpoint de usuarios
      await api.post('/usuarios', formData);
      alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
      navigate('/login'); // Mandar al login
    } catch (err) {
      console.error(err);
      // Intentamos mostrar el mensaje exacto del backend (ej: "Email ya existe")
      setError(err.response?.data?.message || 'Error al registrar usuario. Verifica tus datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <Container style={{ maxWidth: '700px' }}>
        <Card className="shadow-lg border-0">
          <Card.Header className="text-center py-4 text-white" style={{ backgroundColor: colors.purpleLight }}>
            <PersonPlusFill size={40} className="mb-2" />
            <h3 className="fw-bold mb-0">Crear Nueva Cuenta</h3>
            <small>Únete a nuestra comunidad</small>
          </Card.Header>
          
          <Card.Body className="p-4 p-md-5">
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Row>
                {/* Columna Izquierda: Datos Personales */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold"><PersonBadgeFill className="me-1"/> Nombre</Form.Label>
                    <Form.Control name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Ej: Juan" />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Apellido</Form.Label>
                    <Form.Control name="apellido" value={formData.apellido} onChange={handleChange} required placeholder="Ej: Pérez" />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold"><CardHeading className="me-1"/> Carnet (CI)</Form.Label>
                    <Form.Control name="ci" value={formData.ci} onChange={handleChange} required placeholder="Ej: 1234567" />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold"><TelephoneFill className="me-1"/> Teléfono</Form.Label>
                    <Form.Control name="telefono" value={formData.telefono} onChange={handleChange} required placeholder="Ej: 77712345" />
                  </Form.Group>
                </Col>

                {/* Columna Derecha: Cuenta y Rol */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold"><EnvelopeFill className="me-1"/> Email</Form.Label>
                    <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="juan@email.com" />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold"><LockFill className="me-1"/> Contraseña</Form.Label>
                    <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Mínimo 6 caracteres" />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">¿Qué eres?</Form.Label>
                    <div className="d-flex gap-3">
                      <Form.Check 
                        type="radio"
                        label="Estudiante"
                        name="rol"
                        value="estudiante"
                        checked={formData.rol === 'estudiante'}
                        onChange={handleChange}
                        id="rol-est"
                      />
                      <Form.Check 
                        type="radio"
                        label="Propietario"
                        name="rol"
                        value="propietario"
                        checked={formData.rol === 'propietario'}
                        onChange={handleChange}
                        id="rol-prop"
                      />
                    </div>
                    <Form.Text className="text-muted">
                      {formData.rol === 'estudiante' 
                        ? 'Podrás buscar alquileres y contactar dueños.' 
                        : 'Podrás publicar tus inmuebles y gestionar contratos.'}
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-grid gap-2 mt-3">
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={loading}
                  style={{ backgroundColor: colors.coral, border: 'none', fontWeight: 'bold' }}
                >
                  {loading ? <Spinner animation="border" size="sm" /> : 'Registrarse'}
                </Button>
              </div>
            </Form>

            <div className="text-center mt-4">
              <span className="text-muted">¿Ya tienes cuenta? </span>
              <Link 
                to="/login" 
                className="fw-bold text-decoration-none"
                style={{ color: colors.purpleDark }}
              >
                Inicia sesión aquí
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default RegisterPage;