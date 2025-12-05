import React, { useEffect, useState } from 'react';
import { Container, Table, Badge, Card, Button, InputGroup, Form, Spinner } from 'react-bootstrap';
import { FileEarmarkText, Search, Download } from 'react-bootstrap-icons';
import api from '../../api/axiosConfig';

const AdminContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const colors = { bg: '#eaf0f2', purpleDark: '#402149', coral: '#f67f54' };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/contratos/admin/todos');
        setContracts(res.data);
      } catch (error) {
        console.error("Error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtro inteligente
  const filtered = contracts.filter(c => 
    c.inmueble?.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.propietario?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.estudiante?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular total movido en alquileres vigentes
  const totalMoney = filtered
    .filter(c => c.estado === 'vigente')
    .reduce((acc, curr) => acc + Number(curr.montoAcordado), 0);

  if (loading) return <Container className="py-5 text-center"><Spinner animation="border"/></Container>;

  return (
    <Container fluid className="py-4" style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0" style={{ color: colors.purpleDark }}>
            <FileEarmarkText className="me-2"/> Historial de Alquileres
          </h2>
          <div className="bg-white px-3 py-2 rounded shadow-sm border">
            <small className="text-muted d-block">Movimiento Mensual (Vigentes)</small>
            <span className="fw-bold text-success fs-5">{totalMoney} Bs.</span>
          </div>
        </div>

        <Card className="shadow-sm border-0 mb-4">
          <Card.Body>
            <InputGroup>
              <InputGroup.Text className="bg-white"><Search/></InputGroup.Text>
              <Form.Control 
                placeholder="Buscar por inmueble, propietario o estudiante..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Card.Body>
        </Card>

        <Card className="shadow-sm border-0">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0 align-middle">
              <thead className="text-white" style={{ backgroundColor: colors.purpleDark }}>
                <tr>
                  <th className="ps-4 py-3">ID</th>
                  <th>Inmueble</th>
                  <th>Propietario</th>
                  <th>Estudiante</th>
                  <th>Fechas</th>
                  <th>Monto</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td className="ps-4">#{c.id}</td>
                    <td>
                      <div className="fw-bold">{c.inmueble?.titulo}</div>
                      <small className="text-muted">{c.inmueble?.zona}</small>
                    </td>
                    <td>{c.propietario?.nombre} {c.propietario?.apellido}</td>
                    <td>{c.estudiante?.nombre} {c.estudiante?.apellido}</td>
                    <td>
                      <small>
                        Del: {c.fechaInicio}<br/>
                        Al: {c.fechaFin}
                      </small>
                    </td>
                    <td className="fw-bold text-success">{c.montoAcordado} Bs.</td>
                    <td>
                      <Badge bg={c.estado === 'vigente' ? 'success' : c.estado === 'finalizado' ? 'secondary' : 'danger'}>
                        {c.estado.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>
    </Container>
  );
};

export default AdminContracts;