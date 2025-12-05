import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Button, Table, Badge } from 'react-bootstrap';
import { HouseDoorFill, EyeFill, EyeSlashFill, ArrowRightCircle } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';

const AdminDashboard = () => {
  const [inmuebles, setInmuebles] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- PALETA DE COLORES ---
  const colors = {
    bg: '#eaf0f2',
    purpleLight: '#936b9f',
    purpleDark: '#402149',
    yellow: '#f9bb6e',
    coral: '#f67f54'
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/inmuebles/admin/todos');
      setInmuebles(res.data);
    } catch (error) {
      console.error("Error al cargar datos", error);
    } finally {
      setLoading(false);
    }
  };

  // --- CÁLCULOS DE ESTADÍSTICAS ---
  const total = inmuebles.length;
  const activos = inmuebles.filter(i => i.visible).length;
  const pendientes = total - activos;

  if (loading) return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Spinner animation="border" style={{ color: colors.purpleDark }} />
    </Container>
  );

  return (
    <Container fluid className="py-4" style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0" style={{ color: colors.purpleDark }}>
            <HouseDoorFill className="me-2" /> Panel de Control
          </h2>
          <Link to="/admin/properties">
            <Button style={{ backgroundColor: colors.purpleDark, border: 'none' }}>
              Gestión Avanzada <ArrowRightCircle className="ms-2"/>
            </Button>
          </Link>
        </div>

        {/* --- TARJETAS DE RESUMEN --- */}
        <Row className="mb-4">
          <Col md={4}>
            <Card className="text-white shadow-sm border-0 mb-3" style={{ backgroundColor: colors.purpleLight }}>
              <Card.Body className="d-flex justify-content-between align-items-center p-4">
                <div>
                  <h2 className="mb-0 fw-bold">{total}</h2>
                  <span>Total Inmuebles</span>
                </div>
                <HouseDoorFill size={50} style={{ opacity: 0.3 }} />
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-white shadow-sm border-0 mb-3" style={{ backgroundColor: colors.coral }}>
              <Card.Body className="d-flex justify-content-between align-items-center p-4">
                <div>
                  <h2 className="mb-0 fw-bold">{activos}</h2>
                  <span>Visibles al Público</span>
                </div>
                <EyeFill size={50} style={{ opacity: 0.3 }} />
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-white shadow-sm border-0 mb-3" style={{ backgroundColor: colors.purpleDark }}>
              <Card.Body className="d-flex justify-content-between align-items-center p-4">
                <div>
                  <h2 className="mb-0 fw-bold">{pendientes}</h2>
                  <span>Ocultos / Vencidos</span>
                </div>
                <EyeSlashFill size={50} style={{ opacity: 0.3 }} />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* --- TABLA RESUMEN (ÚLTIMOS AGREGADOS) --- */}
        <Card className="shadow-sm border-0">
          <Card.Header className="bg-white py-3">
            <h5 className="mb-0 fw-bold text-secondary">Últimos Inmuebles Registrados</h5>
          </Card.Header>
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Título</th>
                <th>Propietario</th>
                <th>Precio</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {inmuebles.slice(0, 5).map((item) => ( // Solo mostramos los primeros 5
                <tr key={item.id}>
                  <td className="ps-4 fw-bold text-primary">{item.titulo}</td>
                  <td>{item.propietario?.nombre} {item.propietario?.apellido}</td>
                  <td className="fw-bold">{item.precio} Bs.</td>
                  <td>
                    {item.visible ? (
                      <Badge bg="success">Activo</Badge>
                    ) : (
                      <Badge bg="secondary">Oculto</Badge>
                    )}
                  </td>
                </tr>
              ))}
              {inmuebles.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">No hay datos recientes.</td>
                </tr>
              )}
            </tbody>
          </Table>
          <Card.Footer className="bg-white text-center py-3">
            <Link to="/admin/properties" className="text-decoration-none fw-bold" style={{ color: colors.coral }}>
              Ver todos los inmuebles
            </Link>
          </Card.Footer>
        </Card>

      </Container>
    </Container>
  );
};

export default AdminDashboard;