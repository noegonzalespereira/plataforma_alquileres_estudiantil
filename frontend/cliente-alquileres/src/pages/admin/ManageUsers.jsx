import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Badge, Card, Spinner, InputGroup, Form, Row, Col } from 'react-bootstrap';
import { 
  PersonLinesFill, 
  TrashFill, 
  Search, 
  FunnelFill,
  PersonBadge,
  HouseDoor,
  ShieldLock
} from 'react-bootstrap-icons';
import api from '../../api/axiosConfig';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('todos');

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

  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ ¿Seguro que quieres bloquear/eliminar a este usuario?")) return;
    try {
      await api.delete(`/usuarios/${id}`);
      fetchUsers(); // Recargar lista
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

  // Icono según rol
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
          <div className="text-end">
            <h4 className="fw-bold m-0 text-secondary">{users.length}</h4>
            <small>Total</small>
          </div>
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
                      {u.rol !== 'admin' && ( // No dejar que el admin se borre a sí mismo
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          onClick={() => handleDelete(u.id)}
                          title="Desactivar Usuario"
                        >
                          <TrashFill />
                        </Button>
                      )}
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
    </Container>
  );
};

export default ManageUsers;