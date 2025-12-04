import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner, InputGroup } from 'react-bootstrap';
import { 
  GearFill, 
  PlusLg, 
  PencilSquare, 
  TrashFill, 
  Wifi, 
  DropletFill, 
  LightningFill, 
  Fire, 
  CarFrontFill, 
  ShieldLockFill, 
  TvFill,
  HouseDoor
} from 'react-bootstrap-icons';
import api from '../../api/axiosConfig';

// Mapeo manual de iconos para mostrar una vista previa bonita
// El admin guardará el texto (ej: "wifi") y nosotros renderizamos el componente visual
const iconMap = {
  'wifi': <Wifi size={25} />,
  'water': <DropletFill size={25} />,
  'light': <LightningFill size={25} />,
  'gas': <Fire size={25} />,
  'garage': <CarFrontFill size={25} />,
  'security': <ShieldLockFill size={25} />,
  'tv': <TvFill size={25} />,
  'default': <HouseDoor size={25} />
};

const ManageServices = () => {
  // --- ESTADOS ---
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados del Modal (Crear/Editar)
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  // Formulario
  const [nombre, setNombre] = useState('');
  const [icono, setIcono] = useState('default'); // Valor por defecto

  // --- PALETA DE COLORES ---
  const colors = {
    bg: '#eaf0f2',
    purpleLight: '#936b9f',
    purpleDark: '#402149',
    yellow: '#f9bb6e',
    coral: '#f67f54'
  };

  // --- CARGA DE DATOS ---
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/servicios');
      setServices(res.data);
    } catch (error) {
      console.error("Error cargando servicios", error);
    } finally {
      setLoading(false);
    }
  };

  // --- ABRIR MODAL (CREAR) ---
  const handleOpenCreate = () => {
    setIsEditing(false);
    setNombre('');
    setIcono('default');
    setShowModal(true);
  };

  // --- ABRIR MODAL (EDITAR) ---
  const handleOpenEdit = (service) => {
    setIsEditing(true);
    setCurrentId(service.id);
    setNombre(service.nombre);
    setIcono(service.icono || 'default');
    setShowModal(true);
  };

  // --- GUARDAR (POST/PATCH) ---
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { nombre, icono };
      
      if (isEditing) {
        await api.patch(`/servicios/${currentId}`, payload);
      } else {
        await api.post('/servicios', payload);
      }
      
      setShowModal(false);
      fetchServices(); // Recargar lista
      // alert(isEditing ? 'Servicio actualizado' : 'Servicio creado');
    } catch (error) {
      console.error(error);
      alert('Error al guardar el servicio');
    }
  };

  // --- ELIMINAR ---
  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este servicio del catálogo?")) return;
    try {
      await api.delete(`/servicios/${id}`);
      fetchServices();
    } catch (error) {
      alert('No se puede eliminar porque hay inmuebles usando este servicio');
    }
  };

  // Renderiza el icono seleccionado o uno por defecto
  const renderIcon = (iconName) => iconMap[iconName] || iconMap['default'];

  if (loading) return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Spinner animation="border" style={{ color: colors.purpleDark }} />
    </Container>
  );

  return (
    <Container fluid className="py-4" style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      <Container>
        
        {/* ENCABEZADO */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 className="fw-bold mb-0" style={{ color: colors.purpleDark }}>
              <GearFill className="me-2"/> Catálogo de Servicios
            </h2>
            <small className="text-muted">Define las comodidades disponibles para los inmuebles</small>
          </div>
          <Button 
            onClick={handleOpenCreate}
            className="shadow-sm d-flex align-items-center px-4"
            style={{ backgroundColor: colors.coral, border: 'none', fontWeight: 'bold' }}
          >
            <PlusLg className="me-2"/> Nuevo Servicio
          </Button>
        </div>

        {/* GRILLA DE TARJETAS */}
        <Row>
          {services.map((service) => (
            <Col key={service.id} md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm border-0 position-relative service-card">
                <Card.Body className="d-flex align-items-center p-4">
                  
                  {/* ICONO GRANDE IZQUIERDA */}
                  <div 
                    className="d-flex justify-content-center align-items-center rounded-circle me-3 flex-shrink-0"
                    style={{ 
                      width: '60px', 
                      height: '60px', 
                      backgroundColor: '#f3e5f5', 
                      color: colors.purpleDark 
                    }}
                  >
                    {renderIcon(service.icono)}
                  </div>

                  {/* INFO */}
                  <div className="flex-grow-1">
                    <h5 className="fw-bold mb-0" style={{ color: '#333' }}>{service.nombre}</h5>
                    <small className="text-muted">ID: {service.id}</small>
                  </div>

                  {/* BOTONES ACCIÓN (FLOTANTES O AL LADO) */}
                  <div className="d-flex gap-2">
                    <Button 
                      variant="light" 
                      className="rounded-circle p-2 border"
                      onClick={() => handleOpenEdit(service)}
                      title="Editar"
                    >
                      <PencilSquare color={colors.purpleLight}/>
                    </Button>
                    <Button 
                      variant="light" 
                      className="rounded-circle p-2 border"
                      onClick={() => handleDelete(service.id)}
                      title="Eliminar"
                    >
                      <TrashFill color={colors.coral}/>
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}

          {/* MENSAJE SI ESTÁ VACÍO */}
          {services.length === 0 && (
            <Col xs={12} className="text-center py-5">
              <div className="text-muted fs-5">No hay servicios registrados. ¡Crea el primero!</div>
            </Col>
          )}
        </Row>
      </Container>

      {/* --- MODAL CREAR / EDITAR --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: colors.purpleDark, color: 'white' }}>
          <Modal.Title>{isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body className="p-4">
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Nombre del Servicio</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Ej: Gas Domiciliario" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                autoFocus
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Seleccionar Icono</Form.Label>
              <Form.Select 
                value={icono} 
                onChange={(e) => setIcono(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                <option value="default">🏠 Casa (Por defecto)</option>
                <option value="wifi">📶 WiFi</option>
                <option value="water">💧 Agua Potable</option>
                <option value="light">⚡ Luz Eléctrica</option>
                <option value="gas">🔥 Gas Domiciliario</option>
                <option value="garage">🚗 Garaje</option>
                <option value="security">🛡️ Seguridad / Cámaras</option>
                <option value="tv">📺 TV Cable</option>
              </Form.Select>
              
              {/* VISTA PREVIA DEL ICONO SELECCIONADO */}
              <div className="mt-3 p-3 bg-light rounded text-center border">
                <div style={{ color: colors.purpleDark, marginBottom: '5px' }}>Vista Previa:</div>
                {renderIcon(icono)}
              </div>
            </Form.Group>

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              style={{ backgroundColor: colors.coral, border: 'none' }}
            >
              {isEditing ? 'Guardar Cambios' : 'Crear Servicio'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ManageServices;