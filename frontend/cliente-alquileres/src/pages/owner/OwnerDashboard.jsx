import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Spinner, Badge } from 'react-bootstrap';
import { Building, CurrencyDollar, FileEarmarkText, PeopleFill, PlusLg } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
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
    const fetchData = async () => {
      try {
        // Obtenemos los contratos del propietario logueado
        const res = await api.get('/contratos/mis-contratos');
        setContracts(res.data);
      } catch (error) {
        console.error("Error al cargar contratos", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- CÁLCULOS ---
  const activeContracts = contracts.filter(c => c.estado === 'vigente');
  const totalIncome = activeContracts.reduce((acc, curr) => acc + Number(curr.montoAcordado), 0);

  if (loading) return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Spinner animation="border" style={{ color: colors.purpleDark }} />
    </Container>
  );

  return (
    <Container fluid className="py-4" style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      <Container>
        {/* ENCABEZADO */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-0" style={{ color: colors.purpleDark }}>
              <Building className="me-2" /> Mis Inmuebles
            </h2>
            <small className="text-muted">Bienvenido, {user?.nombre}</small>
          </div>
          <Link to="/owner/create-contract">
            <Button className="shadow-sm border-0 d-flex align-items-center fw-bold px-4" style={{ backgroundColor: colors.coral }}>
              <PlusLg className="me-2"/> Nuevo Contrato
            </Button>
          </Link>
        </div>

        {/* TARJETAS DE RESUMEN */}
        <Row className="mb-4">
          <Col md={4}>
            <Card className="text-white shadow-sm border-0 mb-3" style={{ backgroundColor: colors.purpleLight }}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="mb-0">{activeContracts.length}</h3>
                    <span>Inmuebles Alquilados</span>
                  </div>
                  <Building size={40} style={{ opacity: 0.5 }} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-white shadow-sm border-0 mb-3" style={{ backgroundColor: colors.purpleDark }}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="mb-0">{totalIncome} Bs.</h3>
                    <span>Ingresos Mensuales</span>
                  </div>
                  <CurrencyDollar size={40} style={{ opacity: 0.5 }} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-white shadow-sm border-0 mb-3" style={{ backgroundColor: colors.yellow }}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="mb-0">{contracts.length}</h3>
                    <span>Historial Total</span>
                  </div>
                  <FileEarmarkText size={40} style={{ opacity: 0.5 }} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* TABLA DE CONTRATOS */}
        <Card className="shadow-sm border-0">
          <Card.Header className="py-3 text-white" style={{ backgroundColor: colors.purpleDark }}>
            <h5 className="mb-0"><PeopleFill className="me-2"/> Inquilinos Actuales</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Inmueble</th>
                  <th>Inquilino (Estudiante)</th>
                  <th>Fechas</th>
                  <th>Monto</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => (
                  <tr key={contract.id}>
                    <td className="ps-4">
                      <div className="fw-bold" style={{ color: colors.purpleDark }}>
                        {contract.inmueble?.titulo}
                      </div>
                      <small className="text-muted">ID: {contract.inmueble?.id}</small>
                    </td>
                    <td>
                      <div>{contract.estudiante?.nombre} {contract.estudiante?.apellido}</div>
                      <small className="text-muted">{contract.estudiante?.email}</small>
                    </td>
                    <td>
                      <small>
                        Del: <strong>{contract.fechaInicio}</strong><br/>
                        Al: <strong>{contract.fechaFin}</strong>
                      </small>
                    </td>
                    <td className="fw-bold" style={{ color: colors.coral }}>
                      {contract.montoAcordado} Bs.
                    </td>
                    <td>
                      {contract.estado === 'vigente' ? (
                        <Badge bg="success" className="px-3 rounded-pill">Vigente</Badge>
                      ) : (
                        <Badge bg="secondary" className="px-3 rounded-pill">Finalizado</Badge>
                      )}
                    </td>
                  </tr>
                ))}
                {contracts.length === 0 && (
                   <tr>
                     <td colSpan="5" className="text-center py-5 text-muted">
                       No tienes contratos registrados.
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

export default OwnerDashboard;