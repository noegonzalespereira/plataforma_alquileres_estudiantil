import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Badge, Card, Spinner, InputGroup, Form, Row, Col, Modal } from 'react-bootstrap';
import { 
  PersonLinesFill, 
  TrashFill, 
  Search, 
  FunnelFill,
  PersonBadge,
  HouseDoor,
  ShieldLock,
  PencilSquare,
  PersonPlusFill
} from 'react-bootstrap-icons';
import api from '../../api/axiosConfig';

const ManageUsers = () => {
  // --- ESTADOS ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('todos');

  // Estados del Modal (Crear/Editar)
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', ci: '', email: '', password: '', telefono: '', rol: 'estudiante'
  });

  // --- PALETA DE COLORES ---
  const colors = {
    bg: '#eaf0f2',
    purpleDark: '#402149',
    purpleLight: '#936b9f',
    coral: '#f67f54'
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/usuarios');
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- ACCIONES CRUD ---

  // 1. ABRIR MODAL CREAR
  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({ nombre: '', apellido: '', ci: '', email: '', password: '', telefono: '', rol: 'propietario' });
    setShowModal(true);
  };

  // 2. ABRIR MODAL EDITAR
  const handleOpenEdit = (user) => {
    setIsEditing(true);
    setCurrentId(user.id);
    setFormData({
      nombre: user.nombre,
      apellido: user.apellido,
      ci: user.ci,
      email: user.email,
      password: '', // Dejar vacío si no se cambia
      telefono: user.telefono || '',
      rol: user.rol
    });
    setShowModal(true);
  };

  // 3. GUARDAR (POST / PATCH)
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (isEditing && !payload.password) delete payload.password; // No enviar password vacío al editar

      if (isEditing) {
        await api.patch(`/usuarios/${currentId}`, payload);
        alert('Usuario actualizado correctamente');
      } else {
        await api.post('/usuarios', payload);
        alert('Usuario creado correctamente');
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error al guardar usuario');
    }
  };

  // 4. ELIMINAR
  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ ¿Seguro que quieres bloquear/eliminar a este usuario?")) return;
    try {
      await api.delete(`/usuarios/${id}`);
      fetchUsers(); 
      alert('Usuario desactivado correctamente.');
    } catch (error) {
      alert('Error al eliminar usuario.');
    }
  };

  // --- FILTROS ---
  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.nombre + ' ' + u.apellido).toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.ci.includes(searchTerm);
    const matchesRole = filterRole === 'todos' || u.rol === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (rol) => {
    switch(rol) {
      case 'admin': return <Badge bg="dark"><ShieldLock className="me-1"/> Admin</Badge>;
      case 'propietario': return <Badge bg="success"><HouseDoor className="me-1"/> Propietario</Badge>;
      case 'estudiante': return <Badge bg="primary"><PersonBadge className="me-1"/> Estudiante</Badge>;
      default: return <Badge bg="secondary">{rol}</Badge>;
    }
  };

  if (loading) return <Container className="text-center py-5"><Spinner animation="border" style={{color: colors.purpleDark}}/></Container>;

  return (
    <Container fluid className="py-4" style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      <Container>
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-0" style={{ color: colors.purpleDark }}>
              <PersonLinesFill className="me-2"/> Usuarios Registrados
            </h2>
            <small className="text-muted">Gestiona el acceso a la plataforma</small>
          </div>
          
          {/* BOTÓN NUEVO USUARIO */}
          <Button 
            onClick={handleOpenCreate}
            style={{ backgroundColor: colors.coral, border: 'none' }}
            className="d-flex align-items-center fw-bold"
          >
            <PersonPlusFill className="me-2"/> Nuevo Usuario
          </Button>
        </div>

        {/* BARRA DE FILTROS */}
        <Card className="shadow-sm border-0 mb-4">
          <Card.Body>
            <Row className="g-3">
              <Col md={8}>
                <InputGroup>
                  <InputGroup.Text className="bg-white"><Search/></InputGroup.Text>
                  <Form.Control 
                    placeholder="Buscar por nombre, email o CI..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={4}>
                <InputGroup>
                  <InputGroup.Text className="bg-white"><FunnelFill/></InputGroup.Text>
                  <Form.Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                    <option value="todos">Todos los Roles</option>
                    <option value="estudiante">Estudiantes</option>
                    <option value="propietario">Propietarios</option>
                    <option value="admin">Administradores</option>
                  </Form.Select>
                </InputGroup>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* TABLA DE USUARIOS */}
        <Card className="shadow-sm border-0">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0 align-middle">
              <thead className="text-white" style={{ backgroundColor: colors.purpleDark }}>
                <tr>
                  <th className="ps-4 py-3">Usuario</th>
                  <th>Contacto</th>
                  <th>Documento (CI)</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="ps-4">
                      <div className="fw-bold" style={{ color: colors.purpleDark }}>
                        {u.nombre} {u.apellido}
                      </div>
                      <small className="text-muted">ID: {u.id}</small>
                    </td>
                    <td>
                      <div>{u.email}</div>
                      <small className="text-muted">{u.telefono || 'Sin celular'}</small>
                    </td>
                    <td>{u.ci}</td>
                    <td>{getRoleBadge(u.rol)}</td>
                    <td>
                      {u.activo ? (
                        <span className="text-success fw-bold" style={{ fontSize: '0.8rem' }}>● Activo</span>
                      ) : (
                        <span className="text-danger fw-bold" style={{ fontSize: '0.8rem' }}>● Inactivo</span>
                      )}
                    </td>
                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        {/* BOTÓN EDITAR */}
                        <Button 
                          variant="outline-warning" 
                          size="sm" 
                          onClick={() => handleOpenEdit(u)}
                          title="Editar Usuario"
                        >
                          <PencilSquare />
                        </Button>

                        {/* BOTÓN ELIMINAR */}
                        {u.rol !== 'admin' && ( 
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => handleDelete(u.id)}
                            title="Desactivar Usuario"
                          >
                            <TrashFill />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      No se encontraron usuarios con esos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>

      {/* --- MODAL CREAR / EDITAR --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>{isEditing ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control required value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Cédula de Identidad (CI)</Form.Label>
              <Form.Control required value={formData.ci} onChange={e => setFormData({...formData, ci: e.target.value})} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contraseña {isEditing && <small className="text-muted">(Dejar vacío para mantener)</small>}</Form.Label>
              <Form.Control 
                type="password" 
                required={!isEditing} 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Rol</Form.Label>
                  <Form.Select value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})}>
                    <option value="estudiante">Estudiante</option>
                    <option value="propietario">Propietario</option>
                    <option value="admin">Administrador</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" style={{ backgroundColor: colors.purpleDark, border: 'none' }}>
              {isEditing ? 'Guardar Cambios' : 'Registrar Usuario'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </Container>
  );
};

export default ManageUsers;