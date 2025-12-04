import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Badge, Spinner, Button, Alert } from 'react-bootstrap';
import { ExclamationTriangleFill, EnvelopeExclamation, PersonCircle, CheckCircleFill, TrashFill, CheckLg } from 'react-bootstrap-icons';
import api from '../../api/axiosConfig';

const ManageReports = () => {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);

  const colors = { bg: '#eaf0f2', purpleDark: '#402149', coral: '#f67f54' };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reportes');
      setReportes(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- ACCIONES ---
  const handleResolve = async (id) => {
    try {
      await api.patch(`/reportes/${id}/resolver`);
      fetchReports(); // Recargar para ver el cambio de color
      alert("Reporte marcado como resuelto ✅");
    } catch (error) {
      alert("Error al actualizar reporte");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este reporte del historial?")) return;
    try {
      await api.delete(`/reportes/${id}`);
      fetchReports();
    } catch (error) {
      alert("Error al eliminar reporte");
    }
  };

  const getBadge = (tipo) => {
    if (tipo === 'estafa') return <Badge bg="danger">ESTAFA</Badge>;
    if (tipo === 'queja') return <Badge bg="warning" text="dark">Queja</Badge>;
    return <Badge bg="info">Sugerencia</Badge>;
  };

  if (loading) return <Container className="py-5 text-center"><Spinner animation="border"/></Container>;

  return (
    <Container fluid className="py-4" style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      <Container>
        <h2 className="mb-4 fw-bold" style={{ color: colors.purpleDark }}>
          <EnvelopeExclamation className="me-2"/> Buzón de Reportes
        </h2>

        <Card className="shadow-sm border-0">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Estado</th>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Tipo</th>
                  <th>Mensaje</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reportes.map((r) => (
                  <tr key={r.id} style={{ backgroundColor: r.estado === 'resuelto' ? '#f0fff4' : 'white' }}>
                    <td className="ps-4">
                      {r.estado === 'resuelto' ? (
                        <CheckCircleFill className="text-success" title="Resuelto" size={20}/>
                      ) : (
                        <ExclamationTriangleFill className="text-warning" title="Pendiente" size={20}/>
                      )}
                    </td>
                    <td className="text-muted small" style={{ width: '120px' }}>
                      {new Date(r.fecha).toLocaleDateString()}
                    </td>
                    <td style={{ width: '200px' }}>
                      <div className="d-flex align-items-center gap-2">
                        <PersonCircle className="text-secondary"/>
                        <div>
                          <div className="fw-bold">{r.usuario?.nombre}</div>
                          <small className="text-muted">{r.usuario?.rol}</small>
                        </div>
                      </div>
                    </td>
                    <td style={{ width: '100px' }}>{getBadge(r.tipo)}</td>
                    <td>
                      <div className="p-2 bg-light rounded border small">
                        {r.descripcion}
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        {r.estado !== 'resuelto' && (
                          <Button 
                            size="sm" 
                            variant="outline-success" 
                            onClick={() => handleResolve(r.id)}
                            title="Marcar como Resuelto"
                          >
                            <CheckLg />
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline-danger" 
                          onClick={() => handleDelete(r.id)}
                          title="Eliminar Reporte"
                        >
                          <TrashFill />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {reportes.length === 0 && (
                  <tr><td colSpan="6" className="text-center py-5 text-muted">No hay reportes nuevos.</td></tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>
    </Container>
  );
};

export default ManageReports;