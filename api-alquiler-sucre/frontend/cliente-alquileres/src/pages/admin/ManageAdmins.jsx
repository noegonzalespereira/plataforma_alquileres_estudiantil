import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Modal, Form, Card, Spinner, Badge, Alert } from 'react-bootstrap';
import { PersonPlusFill, TrashFill, ShieldLockFill, PersonCheckFill } from 'react-bootstrap-icons';
import api from '../../api/axiosConfig';

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  // Formulario para nuevo admin
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', email: '', password: '', ci: '', telefono: ''
  });

  const colors = { bg: '#eaf0f2', purpleDark: '#402149', coral: '#f67f54' };

  useEffect(() => { fetchAdmins(); }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.get('/usuarios');
      // Filtramos solo los que son ADMIN en el frontend
      const adminList = res.data.filter(u => u.rol === 'admin');
      setAdmins(adminList);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Forzamos el rol 'admin'
      await api.post('/usuarios', { ...formData, rol: 'admin' });
      setShowModal(false);
      setFormData({ nombre: '', apellido: '', email: '', password: '', ci: '', telefono: '' });
      fetchAdmins();
      alert('¡Nuevo administrador registrado!');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear administrador');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ ¿Estás seguro de eliminar a este administrador? Perderá acceso inmediato.")) return;
    try {
      await api.delete(`/usuarios/${id}`);
      fetchAdmins();
    } catch (error) { alert('Error al eliminar'); }
  };

  return (
    <Container fluid className="py-4" style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-0" style={{ color: colors.purpleDark }}>
              <ShieldLockFill className="me-2"/> Equipo Administrativo
            </h2>
            <small className="text-muted">Gestiona quién tiene acceso total al sistema</small>
          </div>
          <Button 
            onClick={() => setShowModal(true)} 
            style={{ backgroundColor: colors.coral, border: 'none' }}
            className="d-flex align-items-center fw-bold px-4"
          >
            <PersonPlusFill className="me-2"/> Nuevo Admin
          </Button>
        </div>

        <Card className="shadow-sm border-0">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0 align-middle">
              <thead className="bg-light text-secondary">
                <tr>
                  <th className="ps-4">Nombre</th>
                  <th>Contacto</th>
                  <th>Credenciales</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-light rounded-circle p-2 me-3 text-primary">
                          <PersonCheckFill size={20}/>
                        </div>
                        <div>
                          <div className="fw-bold">{admin.nombre} {admin.apellido}</div>
                          <small className="text-muted">CI: {admin.ci}</small>
                        </div>
                      </div>
                    </td>
                    <td>{admin.telefono || 'Sin teléfono'}</td>
                    <td><Badge bg="dark">{admin.email}</Badge></td>
                    <td className="text-center">
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(admin.id)}>
                        <TrashFill /> Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>

      {/* MODAL NUEVO ADMIN */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>Registrar Nuevo Admin</Modal.Title></Modal.Header>
        <Form onSubmit={handleCreate}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control required onChange={e => setFormData({...formData, nombre: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Apellido</Form.Label>
              <Form.Control required onChange={e => setFormData({...formData, apellido: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>CI</Form.Label>
              <Form.Control required onChange={e => setFormData({...formData, ci: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email (Usuario)</Form.Label>
              <Form.Control type="email" required onChange={e => setFormData({...formData, email: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control type="password" required onChange={e => setFormData({...formData, password: e.target.value})} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" style={{ backgroundColor: colors.purpleDark, border: 'none' }}>Registrar</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};
export default ManageAdmins;