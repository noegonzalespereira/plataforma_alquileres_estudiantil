import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, InputGroup } from 'react-bootstrap';
import { FileEarmarkPlusFill, HouseDoorFill, EnvelopeAtFill, CalendarDate, CashStack, ArrowLeft, PersonVcardFill } from 'react-bootstrap-icons';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const CreateContract = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [myProperties, setMyProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    idInmueble: '',
    emailEstudiante: '', // <--- CAMBIO AQUÍ
    fechaInicio: '',
    fechaFin: '',
    montoAcordado: '',
    deposito: ''
  });

  const colors = { bg: '#eaf0f2', purpleDark: '#402149', coral: '#f67f54', purpleLight: '#936b9f' };

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await api.get('/inmuebles');
        const mine = res.data.filter(p => p.propietario?.id === user.id);
        setMyProperties(mine);
      } catch (err) { console.error(err); }
    };
    if (user) fetchProperties();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        idInmueble: Number(formData.idInmueble),
        // emailEstudiante se envía como string, no hay que convertirlo
        montoAcordado: Number(formData.montoAcordado),
        deposito: Number(formData.deposito) || 0
      };

      await api.post('/contratos', payload);
      alert('✅ Contrato legal registrado. El estudiante ha sido vinculado y podrá verlo en su perfil.');
      navigate('/owner/dashboard');
      
    } catch (err) {
      console.error(err);
      // Mensaje amigable si el correo no existe
      const msg = err.response?.data?.message;
      if (msg && msg.includes('No existe ningún usuario')) {
        setError('❌ El correo ingresado no pertenece a ningún estudiante registrado.');
      } else {
        setError(msg || 'Error al crear el contrato.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5" style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      <Link to="/owner/dashboard" className="text-decoration-none fw-bold mb-3 d-inline-block" style={{ color: colors.purpleDark }}>
        <ArrowLeft className="me-1"/> Volver al Panel
      </Link>

      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg border-0">
            <Card.Header className="text-center py-4 text-white" style={{ backgroundColor: colors.coral }}>
              <FileEarmarkPlusFill size={40} className="mb-2" />
              <h3 className="fw-bold mb-0">Nuevo Contrato de Alquiler</h3>
              <small>Documento Legal Digital</small>
            </Card.Header>
            
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                
                {/* SELECCIÓN DE INMUEBLE */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold" style={{ color: colors.purpleDark }}>
                    <HouseDoorFill className="me-2"/> Seleccionar Inmueble
                  </Form.Label>
                  <Form.Select 
                    name="idInmueble" 
                    value={formData.idInmueble} 
                    onChange={handleChange} 
                    required
                    style={{ borderColor: colors.purpleLight }}
                  >
                    <option value="">-- Elige una propiedad disponible --</option>
                    {myProperties.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.titulo} - {p.precio} Bs. ({p.zona})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* DATOS DEL ESTUDIANTE (EMAIL) */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold" style={{ color: colors.purpleDark }}>
                    <EnvelopeAtFill className="me-2"/> Correo del Estudiante (Gmail)
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text><PersonVcardFill/></InputGroup.Text>
                    <Form.Control 
                      type="email" 
                      name="emailEstudiante" 
                      placeholder="ejemplo@gmail.com"
                      value={formData.emailEstudiante} 
                      onChange={handleChange} 
                      required 
                    />
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Ingresa el correo con el que el estudiante se registró. El sistema vinculará su <strong>Nombre y CI</strong> automáticamente al contrato.
                  </Form.Text>
                </Form.Group>

                {/* FECHAS */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold"><CalendarDate className="me-1"/> Fecha Inicio</Form.Label>
                      <Form.Control type="date" name="fechaInicio" value={formData.fechaInicio} onChange={handleChange} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold"><CalendarDate className="me-1"/> Fecha Fin</Form.Label>
                      <Form.Control type="date" name="fechaFin" value={formData.fechaFin} onChange={handleChange} required />
                    </Form.Group>
                  </Col>
                </Row>

                {/* MONTOS */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold"><CashStack className="me-1"/> Alquiler Mensual (Bs)</Form.Label>
                      <Form.Control type="number" name="montoAcordado" value={formData.montoAcordado} onChange={handleChange} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">Garantía / Depósito</Form.Label>
                      <Form.Control type="number" name="deposito" value={formData.deposito} onChange={handleChange} placeholder="Opcional" />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-grid mt-2">
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={loading}
                    style={{ backgroundColor: colors.purpleDark, border: 'none' }}
                  >
                    {loading ? 'Validando datos...' : 'Generar Contrato Legal'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateContract;