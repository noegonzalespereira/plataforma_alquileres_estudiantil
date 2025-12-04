import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Spinner, Image } from 'react-bootstrap';
import { HouseAddFill, Images, Upload } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

const CreateProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Listas para llenar los selects
  const [owners, setOwners] = useState([]);
  const [servicesList, setServicesList] = useState([]);

  // Estado del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'cuarto',
    precio: '',
    direccion: '',
    zona: '',
    idPropietario: '',
  });

  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // --- CARGAR DATOS INICIALES ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Necesitamos un endpoint para listar propietarios (puedes usar el de usuarios y filtrar en frontend o backend)
        // Por ahora asumimos que el endpoint /usuarios trae a todos
        const resUsers = await api.get('/usuarios'); 
        const resServices = await api.get('/servicios');
        
        // Filtramos solo los que son propietarios
        setOwners(resUsers.data.filter(u => u.rol === 'propietario'));
        setServicesList(resServices.data);
      } catch (error) {
        console.error("Error cargando listas", error);
      }
    };
    fetchData();
  }, []);

  // --- MANEJADORES ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleServiceChange = (id) => {
    // Si ya está, lo sacamos. Si no, lo metemos.
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter(s => s !== id));
    } else {
      setSelectedServices([...selectedServices, id]);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    // Crear URLs temporales para la vista previa
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  // --- ENVIAR FORMULARIO (MULTIPART) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Cuando subimos archivos, NO enviamos JSON. Enviamos FormData.
      const data = new FormData();
      data.append('titulo', formData.titulo);
      data.append('descripcion', formData.descripcion);
      data.append('tipo', formData.tipo);
      data.append('precio', formData.precio);
      data.append('direccion', formData.direccion);
      data.append('zona', formData.zona);
      data.append('idPropietario', formData.idPropietario);

      // Agregar Servicios (como array de números)
      selectedServices.forEach(id => data.append('serviciosIds[]', id));

      // Agregar Fotos
      selectedFiles.forEach(file => data.append('fotos', file));

      await api.post('/inmuebles', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('¡Inmueble registrado exitosamente!');
      navigate('/admin/properties'); // Volver a la lista para validarlo
    } catch (error) {
      console.error(error);
      alert('Error al crear el inmueble. Verifica los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Card className="shadow-lg border-0">
        <Card.Header className="bg-dark text-white py-3">
          <h4 className="mb-0"><HouseAddFill className="me-2"/> Registrar Nuevo Inmueble</h4>
        </Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row>
              {/* COLUMNA IZQUIERDA: DATOS BÁSICOS */}
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Propietario</Form.Label>
                  <Form.Select 
                    name="idPropietario" 
                    value={formData.idPropietario} 
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Seleccionar Dueño --</option>
                    {owners.map(o => (
                      <option key={o.id} value={o.id}>{o.nombre} {o.apellido} (ID: {o.id})</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Título del Anuncio</Form.Label>
                  <Form.Control name="titulo" value={formData.titulo} onChange={handleChange} required placeholder="Ej: Cuarto soleado centro" />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Tipo</Form.Label>
                      <Form.Select name="tipo" value={formData.tipo} onChange={handleChange}>
                        <option value="cuarto">Cuarto</option>
                        <option value="monoambiente">Monoambiente</option>
                        <option value="departamento">Departamento</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Precio (Bs)</Form.Label>
                      <Form.Control type="number" name="precio" value={formData.precio} onChange={handleChange} required />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Zona / Barrio</Form.Label>
                  <Form.Control name="zona" value={formData.zona} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Dirección Exacta</Form.Label>
                  <Form.Control name="direccion" value={formData.direccion} onChange={handleChange} required />
                </Form.Group>
              </Col>

              {/* COLUMNA DERECHA: DETALLES Y FOTOS */}
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Descripción Detallada</Form.Label>
                  <Form.Control as="textarea" rows={4} name="descripcion" value={formData.descripcion} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Servicios Incluidos</Form.Label>
                  <div className="d-flex flex-wrap gap-3 p-3 bg-light rounded border">
                    {servicesList.map(s => (
                      <Form.Check 
                        key={s.id}
                        type="checkbox"
                        label={s.nombre}
                        checked={selectedServices.includes(s.id)}
                        onChange={() => handleServiceChange(s.id)}
                      />
                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold"><Images className="me-2"/> Fotos del Inmueble</Form.Label>
                  <div className="d-grid">
                    <Form.Label 
                      className="btn btn-outline-primary border-2 d-flex align-items-center justify-content-center gap-2" 
                      style={{ borderStyle: 'dashed', height: '50px', cursor: 'pointer' }}
                    >
                      <Upload /> Subir Imágenes
                      <Form.Control type="file" multiple accept="image/*" hidden onChange={handleFileChange} />
                    </Form.Label>
                  </div>
                  <Form.Text className="text-muted">Selecciona una o varias imágenes.</Form.Text>
                  
                  {/* PREVISUALIZACIÓN */}
                  <div className="d-flex gap-2 mt-2 overflow-auto">
                    {previewUrls.map((url, idx) => (
                      <Image key={idx} src={url} thumbnail style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                    ))}
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-grid mt-4">
              <Button type="submit" size="lg" disabled={loading} style={{ backgroundColor: '#f67f54', border: 'none' }}>
                {loading ? <Spinner size="sm" animation="border"/> : 'Guardar y Publicar'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateProperty;