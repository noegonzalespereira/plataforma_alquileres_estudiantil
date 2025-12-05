import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Modal, Row, Col, InputGroup } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { 
  ExclamationTriangleFill, 
  PersonCircle, 
  Save, 
  ShieldExclamation,
  EnvelopeFill,
  TelephoneFill,
  LockFill,
  PersonFill
} from 'react-bootstrap-icons';
import api from '../../api/axiosConfig';

const ProfilePage = () => {
  const { user } = useAuth(); // Traemos el usuario del contexto
  
  // --- ESTADOS ---
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: ''
  });

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({ tipo: 'queja', descripcion: '' });
  const [sendingReport, setSendingReport] = useState(false);

  // --- CORRECCIÓN AQUÍ: USE EFFECT PARA CARGAR DATOS ---
  // Este efecto "vigila" la variable 'user'. Si user cambia (o termina de cargar),
  // actualiza el formulario automáticamente.
  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        telefono: user.telefono || '',
        password: '' // La contraseña siempre empieza vacía
      });
    }
  }, [user]); // <--- La clave es este array de dependencias
  // ----------------------------------------------------

  // --- 1. ACTUALIZAR PERFIL ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      
      // Limpieza de datos antes de enviar
      if (!payload.password) delete payload.password; 
      delete payload.email; // No enviamos el email para evitar errores en backend

      await api.patch(`/usuarios/${user.id}`, payload);
      alert('✅ Perfil actualizado correctamente.');
    } catch (error) {
      console.error(error);
      alert('Error al actualizar perfil');
    }
  };

  // --- 2. ENVIAR REPORTE ---
  const handleSendReport = async () => {
    if (!reportData.descripcion.trim()) return alert("Por favor escribe una descripción.");
    
    setSendingReport(true);
    try {
      await api.post('/reportes', reportData);
      
      setShowReportModal(false);
      setReportData({ tipo: 'queja', descripcion: '' }); 
      alert('📩 Reporte enviado. El administrador revisará tu caso.');
    } catch (error) {
      console.error(error);
      alert('Error al enviar el reporte.');
    } finally {
      setSendingReport(false);
    }
  };

  // Si por alguna razón el usuario aún no carga, mostramos un mensaje o nada
  if (!user) return <div className="p-5 text-center">Cargando perfil...</div>;

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={7}>
          
          {/* TARJETA DE PERFIL */}
          <Card className="shadow-lg border-0">
            <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
              <h5 className="mb-0 fw-bold text-primary d-flex align-items-center">
                <PersonCircle className="me-2" size={24}/> Mi Perfil
              </h5>
              
              <Button 
                variant="outline-danger" 
                size="sm" 
                onClick={() => setShowReportModal(true)}
                className="fw-bold"
              >
                <ShieldExclamation className="me-1"/> Reportar Problema
              </Button>
            </Card.Header>

            <Card.Body className="p-4">
              <Form onSubmit={handleUpdateProfile}>
                
                {/* NOMBRE Y APELLIDO */}
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold text-muted small">Nombre</Form.Label>
                      <InputGroup>
                        <InputGroup.Text><PersonFill/></InputGroup.Text>
                        <Form.Control 
                          value={formData.nombre} 
                          onChange={e => setFormData({...formData, nombre: e.target.value})} 
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold text-muted small">Apellido</Form.Label>
                      <Form.Control 
                        value={formData.apellido} 
                        onChange={e => setFormData({...formData, apellido: e.target.value})} 
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* EMAIL Y TELEFONO */}
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold text-muted small">Correo Electrónico</Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-light"><EnvelopeFill/></InputGroup.Text>
                        <Form.Control 
                          value={formData.email} 
                          disabled // Email bloqueado
                          className="bg-light"
                        />
                      </InputGroup>
                      <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                        No editable.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold text-muted small">Celular / Teléfono</Form.Label>
                      <InputGroup>
                        <InputGroup.Text><TelephoneFill/></InputGroup.Text>
                        <Form.Control 
                          value={formData.telefono} 
                          onChange={e => setFormData({...formData, telefono: e.target.value})} 
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <hr className="my-4"/>

                {/* CAMBIO DE CONTRASEÑA */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold text-primary">Cambiar Contraseña</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><LockFill/></InputGroup.Text>
                    <Form.Control 
                      type="password" 
                      placeholder="Escribe aquí solo si deseas cambiarla..." 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                    />
                  </InputGroup>
                </Form.Group>

                <div className="d-grid">
                  <Button type="submit" variant="primary" size="lg" className="fw-bold shadow-sm">
                    <Save className="me-2"/> Guardar Cambios
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

        </Col>
      </Row>

      {/* --- MODAL DE REPORTE --- */}
      <Modal show={showReportModal} onHide={() => setShowReportModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title><ExclamationTriangleFill className="me-2"/> Enviar Reporte</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning" className="small">
            Reporta estafas o problemas graves. El administrador revisará tu caso.
          </Alert>
          
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Tipo</Form.Label>
            <Form.Select 
              value={reportData.tipo} 
              onChange={e => setReportData({...reportData, tipo: e.target.value})}
            >
              <option value="queja">Queja del servicio</option>
              <option value="estafa">Reportar Estafa / Fraude</option>
              <option value="sugerencia">Sugerencia</option>
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label className="fw-bold">Detalles</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={4} 
              placeholder="Describe lo sucedido..."
              value={reportData.descripcion}
              onChange={e => setReportData({...reportData, descripcion: e.target.value})}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReportModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleSendReport} disabled={sendingReport}>
            {sendingReport ? 'Enviando...' : 'Enviar Reporte'}
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default ProfilePage;