import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Badge, Modal, Form, Card, Spinner, InputGroup, Carousel, Row, Col, Nav, Alert, Image } from 'react-bootstrap';
import {
  CalendarCheck, Search, PencilSquare, TrashFill,
  HouseDoorFill, GeoAltFill, ExclamationTriangleFill, EyeFill, CurrencyDollar,
  Images, Upload, PlusCircleFill, HouseAddFill
} from 'react-bootstrap-icons';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUrl';

const ManageProperties = () => {
  const { user } = useAuth();
  // --- ESTADOS PRINCIPALES ---
  const [inmuebles, setInmuebles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtros y Selección
  const [filterTab, setFilterTab] = useState('todos'); // 'todos', 'vencidos', 'activos'
  const [selectedProp, setSelectedProp] = useState(null); 

  // --- ESTADOS DE MODALS ---
  const [showRenewModal, setShowRenewModal] = useState(false); // Para Renovar/Pagar
  const [showEditModal, setShowEditModal] = useState(false);   // Para Editar
  const [showViewModal, setShowViewModal] = useState(false);   // Para Ver

  // --- FORMULARIOS ---
  const [newDate, setNewDate] = useState('');
  const [comprobanteFile, setComprobanteFile] = useState(null);
  const [renewLoading, setRenewLoading] = useState(false);

  // Formulario Edición
  const [editForm, setEditForm] = useState({ titulo: '', precio: '', zona: '', descripcion: '' });
  const [editFiles, setEditFiles] = useState([]); 
  const [previewUrls, setPreviewUrls] = useState([]);

  // --- ESTADOS CREAR INMUEBLE ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [servicesList, setServicesList] = useState([]);
  const [createForm, setCreateForm] = useState({
    titulo: '', descripcion: '', tipo: 'cuarto', precio: '', direccion: '', zona: '',
  });
  const [selectedServices, setSelectedServices] = useState([]);
  const [createFiles, setCreateFiles] = useState([]);
  const [createPreviewUrls, setCreatePreviewUrls] = useState([]);

  // --- COLORES ---
  const colors = { bg: '#eaf0f2', purpleDark: '#402149', coral: '#f67f54', yellow: '#f9bb6e' };

  // --- CARGA INICIAL ---
  useEffect(() => { fetchInmuebles(); }, []);

  const fetchInmuebles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inmuebles/mis-inmuebles');
      setInmuebles(res.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  // ================= LÓGICA DE NEGOCIO =================

  // --- 1. RENOVAR SUSCRIPCIÓN ---
  const PRECIO_DIA = 0.60;

  const calcularDias = () => {
    if (!newDate) return 0;
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const fin = new Date(newDate); fin.setHours(0, 0, 0, 0);
    const diff = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const openRenew = (prop) => {
    setSelectedProp(prop);
    const base = prop.fechaVencimiento ? new Date(prop.fechaVencimiento) : new Date();
    const start = base < new Date() ? new Date() : base;
    start.setDate(start.getDate() + 30);
    setNewDate(start.toISOString().split('T')[0]);
    setComprobanteFile(null);
    setShowRenewModal(true);
  };

  const handleRenew = async () => {
    if (!comprobanteFile) { alert('Debes subir el comprobante de pago.'); return; }
    if (calcularDias() <= 0) { alert('La fecha debe ser posterior a hoy.'); return; }
    setRenewLoading(true);
    try {
      const formData = new FormData();
      formData.append('fechaVencimiento', newDate);
      formData.append('comprobante', comprobanteFile);
      await api.patch(`/inmuebles/${selectedProp.id}/solicitar-pago`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowRenewModal(false);
      fetchInmuebles();
      alert('Solicitud enviada. Recibirás un correo cuando el admin confirme tu pago.');
    } catch (error) {
      console.error(error);
      alert('Error al enviar la solicitud.');
    } finally {
      setRenewLoading(false);
    }
  };

  

  // --- 3. EDITAR DATOS + FOTOS ---
  const openEdit = (prop) => {
    setSelectedProp(prop);
    setEditForm({
      titulo: prop.titulo,
      precio: prop.precio,
      zona: prop.zona,
      descripcion: prop.descripcion
    });
    setEditFiles([]); 
    setPreviewUrls([]);
    setShowEditModal(true);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setEditFiles(files);
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('titulo', editForm.titulo);
      formData.append('precio', editForm.precio);
      formData.append('zona', editForm.zona);
      formData.append('descripcion', editForm.descripcion);

      // Agregar fotos nuevas
      editFiles.forEach(file => {
        formData.append('fotos', file);
      });

      await api.patch(`/inmuebles/${selectedProp.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setShowEditModal(false);
      fetchInmuebles();
      alert("✅ Datos y fotos actualizados correctamente");
    } catch (error) {
      console.error(error);
      alert("Error al editar los datos");
    }
  };

  // --- 4. VER Y ELIMINAR ---
  const openView = (prop) => { setSelectedProp(prop); setShowViewModal(true); };

  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ ¿Eliminar definitivamente este inmueble?")) return;
    try {
      await api.delete(`/inmuebles/${id}`);
      fetchInmuebles();
      alert("Inmueble eliminado correctamente.");
    } catch (error) {
      alert("Error al eliminar. Puede que tenga contratos activos.");
    }
  };

  // --- LÓGICA CREAR INMUEBLE ---
  const openCreateModal = async () => {
    try {
      const res = await api.get('/servicios');
      setServicesList(res.data);
    } catch (e) { console.error(e); }
    setCreateForm({ titulo: '', descripcion: '', tipo: 'cuarto', precio: '', direccion: '', zona: '' });
    setSelectedServices([]);
    setCreateFiles([]);
    setCreatePreviewUrls([]);
    setShowCreateModal(true);
  };

  const handleCreateFileChange = (e) => {
    const files = Array.from(e.target.files);
    setCreateFiles(files);
    setCreatePreviewUrls(files.map(f => URL.createObjectURL(f)));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const data = new FormData();
      Object.entries(createForm).forEach(([k, v]) => data.append(k, v));
      data.append('idPropietario', user.id);
      selectedServices.forEach(id => data.append('serviciosIds[]', id));
      createFiles.forEach(file => data.append('fotos', file));
      await api.post('/inmuebles', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Inmueble registrado exitosamente');
      setShowCreateModal(false);
      fetchInmuebles();
    } catch (error) {
      console.error(error);
      alert('Error al crear el inmueble. Verifica los datos.');
    } finally {
      setCreateLoading(false);
    }
  };

  // --- HELPERS Y FILTROS ---
  const isExpired = (dateString) => {
    if (!dateString) return true;
    return new Date(dateString) < new Date();
  };

  const getFilteredData = () => {
    let data = inmuebles;

    // Filtro por Pestaña
    if (filterTab === 'vencidos') {
      data = data.filter(i => isExpired(i.fechaVencimiento));
    } else if (filterTab === 'activos') {
      data = data.filter(i => !isExpired(i.fechaVencimiento) && i.visible);
    }

    // Filtro por Buscador
    return data.filter(i => 
      i.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.propietario?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredInmuebles = getFilteredData();

  if (loading) return <Container className="text-center py-5"><Spinner animation="border"/></Container>;

  return (
    <Container fluid className="py-4" style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      <Container>
        <h2 className="fw-bold mb-4" style={{ color: colors.purpleDark }}>Gestión de Suscripciones</h2>

        {/* PESTAÑAS DE FILTRO */}
        <Nav variant="pills" className="mb-4 bg-white p-2 rounded shadow-sm d-inline-flex">
          <Nav.Item>
            <Nav.Link 
              active={filterTab === 'todos'} 
              onClick={() => setFilterTab('todos')}
              className="text-dark fw-bold px-4"
            >Todos</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={filterTab === 'activos'} 
              onClick={() => setFilterTab('activos')}
              className={filterTab === 'activos' ? 'bg-success text-white px-4' : 'text-success px-4'}
            >Activos</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={filterTab === 'vencidos'} 
              onClick={() => setFilterTab('vencidos')}
              className={filterTab === 'vencidos' ? 'bg-danger text-white px-4' : 'text-danger px-4'}
            >
              <ExclamationTriangleFill className="me-2"/> Vencidos
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              onClick={openCreateModal}
              className="d-flex align-items-center gap-2 fw-bold"
              style={{ backgroundColor: colors.coral, color: 'white', borderRadius: '6px', cursor: 'pointer' }}
            >
              <PlusCircleFill /> Crear Inmueble
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {/* BUSCADOR Y REFRESCAR */}
        <div className="d-flex mb-3 gap-2">
          <InputGroup className="shadow-sm">
            <InputGroup.Text className="bg-white"><Search/></InputGroup.Text>
            <Form.Control 
              placeholder="Buscar propiedad " 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Button onClick={fetchInmuebles} style={{ backgroundColor: colors.purpleDark, border: 'none' }}>
            Refrescar
          </Button>
        </div>

        {/* TABLA PRINCIPAL */}
        <Card className="shadow-sm border-0">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Propiedad</th>
                  <th>Estado del Pago</th>
                  
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInmuebles.map((item) => {
                  const vencido = isExpired(item.fechaVencimiento);
                  return (
                    <tr key={item.id} style={{ backgroundColor: vencido ? '#fff5f5' : 'white' }}>
                      {/* FOTO Y TITULO */}
                      <td className="ps-4">
                        <div className="d-flex align-items-center">
                          <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', marginRight: '15px', backgroundColor: '#eee' }}>
                            {item.fotos && item.fotos.length > 0 ? (
                              <img src={getImageUrl(item.fotos[0].url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="img" />
                            ) : <HouseDoorFill size={20} className="m-3 text-muted"/>}
                          </div>
                          <div>
                            <div className="fw-bold text-truncate" style={{maxWidth: '250px', color: colors.purpleDark}}>{item.titulo}</div>
                            <small className="text-muted">Dueño: {item.propietario?.nombre} {item.propietario?.apellido}</small>
                          </div>
                        </div>
                      </td>
                      
                      {/* ESTADO PAGO */}
                      <td>
                        {item.pendientePago ? (
                          <Badge bg="warning" text="dark" className="p-2">EN REVISIÓN</Badge>
                        ) : vencido ? (
                          <Badge bg="danger" className="p-2"><ExclamationTriangleFill className="me-1"/> VENCIDO</Badge>
                        ) : (
                          <Badge bg="success" className="p-2"><CalendarCheck className="me-1"/> VIGENTE</Badge>
                        )}
                        <div className="small text-muted mt-1">
                          Vence: {item.fechaVencimiento ? new Date(item.fechaVencimiento).toLocaleDateString() : 'Sin fecha'}
                        </div>
                      </td>

                      

                      {/* ACCIONES */}
                      <td className="text-center">
                        <div className="d-flex gap-2 justify-content-center">
                          {/* Botón Renovar */}
                          <Button
                            variant={item.pendientePago ? "warning" : vencido ? "danger" : "outline-success"}
                            size="sm"
                            onClick={() => openRenew(item)}
                            disabled={item.pendientePago}
                            title={item.pendientePago ? "Esperando confirmación del admin" : "Solicitar publicación"}
                          >
                            <CurrencyDollar className="me-1"/>
                            {item.pendientePago ? "En revisión" : vencido ? "Pagar" : "Extender"}
                          </Button>

                          {/* Otros Botones */}
                          <Button variant="outline-info" size="sm" onClick={() => openView(item)} title="Ver Detalle"><EyeFill/></Button>
                          <Button variant="outline-warning" size="sm" onClick={() => openEdit(item)} title="Editar"><PencilSquare/></Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDelete(item.id)} title="Borrar"><TrashFill/></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>

      {/* --- MODAL SOLICITAR PAGO --- */}
      <Modal show={showRenewModal} onHide={() => !renewLoading && setShowRenewModal(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: colors.purpleDark }} className="text-white">
          <Modal.Title><CurrencyDollar className="me-2"/> Solicitar Publicación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info" className="small">
            Selecciona hasta qué fecha quieres publicar tu inmueble. El sistema calculará el monto a pagar (0.60 Bs/día).
            Sube tu comprobante y el admin confirmará por correo.
          </Alert>

          {/* FECHA */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Publicar hasta:</Form.Label>
            <Form.Control
              type="date"
              value={newDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </Form.Group>

          {/* CÁLCULO AUTOMÁTICO */}
          {calcularDias() > 0 && (
            <div className="rounded p-3 mb-3 text-center" style={{ backgroundColor: '#fff3cd', border: '1px solid #f9bb6e' }}>
              <div className="text-muted small">Días de publicación</div>
              <div className="fw-bold fs-4">{calcularDias()} días</div>
              <div className="text-muted small mt-1">0.60 Bs × {calcularDias()} días</div>
              <div className="fw-bold fs-3" style={{ color: colors.coral }}>
                {(calcularDias() * PRECIO_DIA).toFixed(2)} Bs
              </div>
            </div>
          )}

          {/* COMPROBANTE */}
          <Form.Group>
            <Form.Label className="fw-bold">Comprobante de pago:</Form.Label>
            <Form.Label
              className="btn btn-outline-secondary border-2 d-flex align-items-center justify-content-center gap-2 w-100"
              style={{ borderStyle: 'dashed', height: '50px', cursor: 'pointer' }}
            >
              <Upload />
              {comprobanteFile ? comprobanteFile.name : 'Subir imagen / PDF del comprobante'}
              <Form.Control
                type="file"
                accept="image/*,.pdf"
                hidden
                onChange={(e) => setComprobanteFile(e.target.files[0] || null)}
              />
            </Form.Label>
            {comprobanteFile && (
              <div className="text-success small mt-1">Archivo seleccionado: {comprobanteFile.name}</div>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRenewModal(false)} disabled={renewLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleRenew}
            disabled={renewLoading || calcularDias() <= 0 || !comprobanteFile}
            style={{ backgroundColor: colors.coral, border: 'none' }}
          >
            {renewLoading ? <Spinner size="sm" animation="border"/> : 'Enviar Solicitud'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- MODAL EDITAR CON FOTOS --- */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
        <Modal.Header closeButton className="text-white" style={{ backgroundColor: colors.purpleLight }}>
          <Modal.Title>Editar Inmueble</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveEdit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Título</Form.Label>
                  <Form.Control value={editForm.titulo} onChange={(e) => setEditForm({...editForm, titulo: e.target.value})} required />
                </Form.Group>
                <Row>
                  <Col><Form.Group className="mb-3"><Form.Label className="fw-bold">Precio</Form.Label><Form.Control type="number" value={editForm.precio} onChange={(e) => setEditForm({...editForm, precio: e.target.value})} required /></Form.Group></Col>
                  <Col><Form.Group className="mb-3"><Form.Label className="fw-bold">Zona</Form.Label><Form.Control value={editForm.zona} onChange={(e) => setEditForm({...editForm, zona: e.target.value})} required /></Form.Group></Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Descripción</Form.Label>
                  <Form.Control as="textarea" rows={4} value={editForm.descripcion} onChange={(e) => setEditForm({...editForm, descripcion: e.target.value})} />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold text-primary">
                    <Images className="me-2"/> Agregar Fotos Nuevas
                  </Form.Label>
                  <div className="d-grid">
                    <Form.Label className="btn btn-outline-secondary border-2 d-flex align-items-center justify-content-center gap-2" style={{ borderStyle: 'dashed', height: '50px', cursor: 'pointer' }}>
                      <Upload /> Seleccionar Archivos
                      <Form.Control type="file" multiple accept="image/*" hidden onChange={handleFileChange} />
                    </Form.Label>
                  </div>
                  
                  {/* Vista Previa */}
                  <div className="d-flex gap-2 mt-3 overflow-auto p-2 border rounded bg-light" style={{ maxHeight: '150px' }}>
                    {previewUrls.length > 0 ? (
                      previewUrls.map((url, idx) => (
                        <Image key={idx} src={url} thumbnail style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                      ))
                    ) : (
                      <div className="text-muted small w-100 text-center py-4">No has seleccionado fotos nuevas</div>
                    )}
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancelar</Button>
            <Button type="submit" style={{ backgroundColor: colors.yellow, border: 'none', color: '#000' }}>Guardar Cambios</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* --- MODAL VER DETALLE --- */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
        <Modal.Body className="p-0">
          {selectedProp && (
            <div>
              <div style={{ backgroundColor: '#000', height: '350px' }}>
                <Carousel>
                  {selectedProp.fotos?.map((foto, idx) => (
                    <Carousel.Item key={idx} style={{ height: '350px' }}>
                      <img className="d-block w-100 h-100" src={getImageUrl(foto.url)} style={{ objectFit: 'contain' }} alt="slide"/>
                    </Carousel.Item>
                  ))}
                </Carousel>
              </div>
              <div className="p-4">
                <h4>{selectedProp.titulo}</h4>
                <h4 style={{ color: colors.coral }}>{selectedProp.precio} Bs.</h4>
                <p className="text-muted"><GeoAltFill/> {selectedProp.zona} - {selectedProp.direccion}</p>
                <hr/>
                <h6>Descripción:</h6>
                <p>{selectedProp.descripcion}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      {/* --- MODAL CREAR INMUEBLE --- */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{ backgroundColor: colors.purpleDark }} className="text-white">
          <Modal.Title><HouseAddFill className="me-2"/> Registrar Nuevo Inmueble</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Título del Anuncio</Form.Label>
                  <Form.Control value={createForm.titulo} onChange={(e) => setCreateForm({ ...createForm, titulo: e.target.value })} required placeholder="Ej: Cuarto soleado centro" />
                </Form.Group>
                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Tipo</Form.Label>
                      <Form.Select value={createForm.tipo} onChange={(e) => setCreateForm({ ...createForm, tipo: e.target.value })}>
                        <option value="cuarto">Cuarto</option>
                        <option value="monoambiente">Monoambiente</option>
                        <option value="departamento">Departamento</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Precio (Bs)</Form.Label>
                      <Form.Control type="number" value={createForm.precio} onChange={(e) => setCreateForm({ ...createForm, precio: e.target.value })} required />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Zona / Barrio</Form.Label>
                  <Form.Control value={createForm.zona} onChange={(e) => setCreateForm({ ...createForm, zona: e.target.value })} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Dirección Exacta</Form.Label>
                  <Form.Control value={createForm.direccion} onChange={(e) => setCreateForm({ ...createForm, direccion: e.target.value })} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Descripción</Form.Label>
                  <Form.Control as="textarea" rows={4} value={createForm.descripcion} onChange={(e) => setCreateForm({ ...createForm, descripcion: e.target.value })} required />
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
                        onChange={() => setSelectedServices(prev =>
                          prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id]
                        )}
                      />
                    ))}
                  </div>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold"><Images className="me-2"/> Fotos del Inmueble</Form.Label>
                  <Form.Label className="btn btn-outline-primary border-2 d-flex align-items-center justify-content-center gap-2 w-100" style={{ borderStyle: 'dashed', height: '50px', cursor: 'pointer' }}>
                    <Upload /> Subir Imágenes
                    <Form.Control type="file" multiple accept="image/*" hidden onChange={handleCreateFileChange} />
                  </Form.Label>
                  <div className="d-flex gap-2 mt-2 overflow-auto">
                    {createPreviewUrls.map((url, idx) => (
                      <Image key={idx} src={url} thumbnail style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                    ))}
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={createLoading} style={{ backgroundColor: colors.coral, border: 'none' }}>
              {createLoading ? <Spinner size="sm" animation="border"/> : 'Guardar y Publicar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </Container>
  );
};

export default ManageProperties;