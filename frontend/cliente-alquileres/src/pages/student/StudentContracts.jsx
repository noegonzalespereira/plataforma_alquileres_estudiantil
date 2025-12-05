import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Badge, Spinner } from 'react-bootstrap';
import { FileEarmarkText, HouseDoor } from 'react-bootstrap-icons';
import api from '../../api/axiosConfig';

const StudentContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await api.get('/contratos/mis-contratos');
        setContracts(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, []);

  if (loading) return <Container className="py-5 text-center"><Spinner animation="border"/></Container>;

  return (
    <Container className="py-4">
      <h2 className="mb-4 fw-bold" style={{ color: '#402149' }}>
        <FileEarmarkText className="me-2"/> Mis Alquileres
      </h2>
      
      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Inmueble</th>
                <th>Propietario</th>
                <th>Fechas</th>
                <th>Monto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => (
                <tr key={c.id}>
                  <td className="ps-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-light rounded p-2 text-muted">
                        <HouseDoor size={24}/>
                      </div>
                      <div>
                        <div className="fw-bold">{c.inmueble.titulo}</div>
                        <small className="text-muted">{c.inmueble.direccion}</small>
                      </div>
                    </div>
                  </td>
                  <td>{c.propietario.nombre} {c.propietario.apellido}</td>
                  <td>
                    <small>
                      Desde: {c.fechaInicio}<br/>
                      Hasta: {c.fechaFin}
                    </small>
                  </td>
                  <td className="fw-bold">{c.montoAcordado} Bs.</td>
                  <td>
                    <Badge bg={c.estado === 'vigente' ? 'success' : 'secondary'}>
                      {c.estado.toUpperCase()}
                    </Badge>
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
  );
};

export default StudentContracts;