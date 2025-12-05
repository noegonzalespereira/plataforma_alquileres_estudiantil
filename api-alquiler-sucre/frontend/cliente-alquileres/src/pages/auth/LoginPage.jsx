import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext'; // Importamos el contexto
import { useNavigate, Link } from 'react-router-dom';
import { PersonCircle, LockFill, EnvelopeFill, BoxArrowInRight } from 'react-bootstrap-icons';

const LoginPage = () => {
  // --- ESTADOS ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // --- PALETA DE COLORES ---
  const colors = {
    bg: '#eaf0f2',
    purpleDark: '#402149',
    coral: '#f67f54',
    purpleLight: '#936b9f'
  };

  // --- MANEJO DEL SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(email, password);

    if (result.success) {
      // Redirección inteligente basada en el rol del usuario
      const role = result.user.rol;
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'propietario') navigate('/owner/dashboard');
      else if (role === 'estudiante') navigate('/student/catalog');
      else navigate('/'); 
    } else {
      setError(result.message || 'Credenciales incorrectas');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container style={{ maxWidth: '450px' }}>
        <Card className="shadow-lg border-0">
          <Card.Header className="text-center py-4 text-white" style={{ backgroundColor: colors.purpleDark }}>
            <PersonCircle size={50} className="mb-2" />
            <h3 className="fw-bold mb-0">Iniciar Sesión</h3>
            <small>Bienvenido a Alquileres Sucre</small>
          </Card.Header>
          
          <Card.Body className="p-4 p-md-5">
            {error && <Alert variant="danger" className="text-center">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4" controlId="formEmail">
                <Form.Label className="fw-bold" style={{ color: colors.purpleDark }}>
                  <EnvelopeFill className="me-2"/> Correo Electrónico
                </Form.Label>
                <Form.Control 
                  type="email" 
                  placeholder="ejemplo@correo.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="py-2"
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="formPassword">
                <Form.Label className="fw-bold" style={{ color: colors.purpleDark }}>
                  <LockFill className="me-2"/> Contraseña
                </Form.Label>
                <Form.Control 
                  type="password" 
                  placeholder="********" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="py-2"
                />
              </Form.Group>

              <div className="d-grid gap-2">
                <Button 
                  type="submit" 
                  size="lg"
                  disabled={isSubmitting}
                  style={{ backgroundColor: colors.coral, border: 'none', fontWeight: 'bold' }}
                >
                  {isSubmitting ? <Spinner animation="border" size="sm" /> : (
                    <>
                      <BoxArrowInRight className="me-2" /> Ingresar
                    </>
                  )}
                </Button>
              </div>
            </Form>

            <div className="text-center mt-4 pt-3 border-top">
              <span className="text-muted">¿No tienes cuenta? </span>
              <Link 
                to="/register" 
                className="fw-bold text-decoration-none"
                style={{ color: colors.purpleLight }}
              >
                Regístrate aquí
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default LoginPage;