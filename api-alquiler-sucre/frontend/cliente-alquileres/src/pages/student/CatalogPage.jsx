import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { Search, FunnelFill, GeoAltFill, HouseDoorFill, CashStack } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';

const CatalogPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [maxPrice, setMaxPrice] = useState('');

  // Colores
  const colors = {
    bg: '#eaf0f2',
    purpleDark: '#402149',
    coral: '#f67f54',
    purpleLight: '#936b9f'
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      // El endpoint público que creamos (solo muestra visibles y vigentes)
      const res = await api.get('/inmuebles');
      setProperties(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Lógica de filtrado en el cliente
  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.zona.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'todos' || p.tipo === filterType;
    const matchesPrice = maxPrice === '' || Number(p.precio) <= Number(maxPrice);

    return matchesSearch && matchesType && matchesPrice;
  });

  return (
    <Container fluid className="py-4" style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      <Container>
        {/* BARRA DE BÚSQUEDA Y FILTROS */}
        <Card className="shadow-sm border-0 mb-4 p-3">
          <Row className="g-3 align-items-end">
            <Col md={5}>
              <Form.Label className="fw-bold"><Search className="me-1"/> Buscar</Form.Label>
              <InputGroup>
                <Form.Control 
                  placeholder="Zona, calle o título..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Label className="fw-bold"><HouseDoorFill className="me-1"/> Tipo</Form.Label>
              <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="todos">Todos</option>
                <option value="cuarto">Cuarto</option>
                <option value="monoambiente">Monoambiente</option>
                <option value="departamento">Departamento</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label className="fw-bold"><CashStack className="me-1"/> Precio Máx (Bs.)</Form.Label>
              <Form.Control 
                type="number" 
                placeholder="Ej: 1000" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </Col>
            <Col md={1}>
               <Button 
                variant="outline-secondary" 
                className="w-100" 
                onClick={() => {setSearchTerm(''); setFilterType('todos'); setMaxPrice('');}}
                title="Limpiar filtros"
               >
                 <FunnelFill />
               </Button>
            </Col>
          </Row>
        </Card>

        {/* LISTADO DE PROPIEDADES */}
        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" style={{ color: colors.purpleDark }}/></div>
        ) : (
          <Row>
            {filteredProperties.map((prop) => (
              <Col key={prop.id} md={6} lg={4} className="mb-4">
                <Card className="h-100 shadow-sm border-0 hover-card" style={{ transition: '0.3s' }}>
                  {/* FOTO */}
                  <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                    {prop.fotos && prop.fotos.length > 0 ? (
                      <img 
                        src={`http://localhost:3000/${prop.fotos[0].url}`} 
                        alt={prop.titulo}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="d-flex justify-content-center align-items-center h-100 bg-light text-muted">
                        <HouseDoorFill size={40} />
                      </div>
                    )}
                    <Badge bg="primary" className="position-absolute top-0 end-0 m-3 shadow">
                      {prop.tipo.toUpperCase()}
                    </Badge>
                  </div>

                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="fw-bold text-truncate" style={{ maxWidth: '70%' }}>{prop.titulo}</h5>
                      <h5 className="fw-bold" style={{ color: colors.coral }}>{prop.precio} Bs.</h5>
                    </div>
                    
                    <p className="text-muted small mb-3">
                      <GeoAltFill className="me-1"/> {prop.zona} - {prop.direccion}
                    </p>

                    {/* SERVICIOS (Iconos pequeños) */}
                    <div className="d-flex gap-2 mb-3">
                      {prop.servicios?.slice(0, 4).map(s => (
                        <Badge key={s.id} bg="light" text="dark" className="border">
                          {s.nombre}
                        </Badge>
                      ))}
                      {prop.servicios?.length > 4 && <small>+{prop.servicios.length - 4}</small>}
                    </div>

                    <div className="d-grid">
                      <Link to={`/student/property/${prop.id}`} className="text-decoration-none">
                        <Button style={{ backgroundColor: colors.purpleDark, border: 'none' }} className="w-100">
                          Ver Detalles
                        </Button>
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
            
            {filteredProperties.length === 0 && (
              <Col xs={12} className="text-center py-5 text-muted">
                <h4>No encontramos resultados</h4>
                <p>Intenta ajustar los filtros de búsqueda.</p>
              </Col>
            )}
          </Row>
        )}
      </Container>
    </Container>
  );
};

export default CatalogPage;