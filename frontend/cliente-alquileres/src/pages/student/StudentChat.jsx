import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, ListGroup, Badge } from 'react-bootstrap';
import { Send, PersonCircle, HouseDoorFill, ArrowClockwise, ChatQuoteFill } from 'react-bootstrap-icons';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const StudentChat = () => {
  const { user } = useAuth();
  
  // --- ESTADOS ---
  const [conversations, setConversations] = useState([]); 
  const [selectedChat, setSelectedChat] = useState(null); 
  const [messages, setMessages] = useState([]); 
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  // --- COLORES ---
  const colors = {
    bg: '#eaf0f2',
    purpleDark: '#402149',
    coral: '#f67f54',
    purpleLight: '#936b9f'
  };

  // --- 1. CARGAR BANDEJA ---
  useEffect(() => {
    fetchInbox();
  }, []);

  const fetchInbox = async () => {
    try {
      setLoading(true);
      const res = await api.get('/mensajes/mis-mensajes');
      const allMsgs = res.data;

      // Agrupar mensajes por (Propietario + Inmueble)
      const groups = {};

      allMsgs.forEach(msg => {
        // Identificar al "Otro" (El Propietario)
        const isMe = msg.emisor.id === user.id;
        const otherUser = isMe ? msg.receptor : msg.emisor;
        
        const key = `${otherUser.id}-${msg.inmueble.id}`;

        if (!groups[key]) {
          groups[key] = {
            key,
            otherUser, // Aquí otherUser es el Propietario
            inmueble: msg.inmueble,
            lastMessage: msg,
            otherUserId: otherUser.id,
            inmuebleId: msg.inmueble.id
          };
        }
      });

      setConversations(Object.values(groups));
    } catch (error) {
      console.error("Error cargando chats", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. CARGAR MENSAJES ---
  const loadChat = async (conv) => {
    setSelectedChat(conv);
    try {
      // Pedimos la charla con el Propietario sobre esa casa
      const res = await api.get(`/mensajes/chat/con/${conv.otherUserId}/inmueble/${conv.inmuebleId}`);
      setMessages(res.data);
      scrollToBottom();
    } catch (error) {
      console.error(error);
    }
  };

  // --- 3. ENVIAR ---
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    setSending(true);
    try {
      const payload = {
        contenido: newMessage,
        idReceptor: selectedChat.otherUserId, // ID del Propietario
        idInmueble: selectedChat.inmuebleId
      };

      const res = await api.post('/mensajes', payload);
      
      const newMsgObj = {
        ...res.data,
        emisor: user,
        receptor: selectedChat.otherUser
      };

      setMessages([...messages, newMsgObj]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      alert('Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  if (loading && conversations.length === 0) return (
    <Container className="py-5 text-center"><Spinner animation="border" style={{ color: colors.purpleDark }}/></Container>
  );

  return (
    <Container fluid className="py-4" style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      <Container>
        <h2 className="mb-4 fw-bold" style={{ color: colors.purpleDark }}>
          <ChatQuoteFill className="me-2"/> Mis Consultas
        </h2>

        <Row style={{ height: '75vh' }}>
          
          {/* IZQUIERDA: LISTA DE PROPIETARIOS */}
          <Col md={4} className="h-100 d-flex flex-column mb-3 mb-md-0">
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
                <span className="fw-bold text-muted">Mensajes Recientes</span>
                <Button variant="link" size="sm" onClick={fetchInbox}><ArrowClockwise/></Button>
              </Card.Header>
              <ListGroup variant="flush" className="overflow-auto" style={{ flex: 1 }}>
                {conversations.length === 0 ? (
                  <div className="text-center p-4 text-muted small">
                    Aún no has contactado a ningún propietario.
                    <br/>¡Ve al catálogo e inicia una charla!
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <ListGroup.Item 
                      key={conv.key} 
                      action 
                      active={selectedChat?.key === conv.key}
                      onClick={() => loadChat(conv)}
                      className="border-0 border-bottom py-3"
                      style={{ 
                        backgroundColor: selectedChat?.key === conv.key ? '#f8f9fa' : 'white',
                        borderLeft: selectedChat?.key === conv.key ? `4px solid ${colors.coral}` : '4px solid transparent'
                      }}
                    >
                      <div className="d-flex justify-content-between">
                        <strong style={{ color: colors.purpleDark }}>{conv.otherUser.nombre} (Propietario)</strong>
                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                          {new Date(conv.lastMessage.fechaEnvio).toLocaleDateString()}
                        </small>
                      </div>
                      <div className="text-muted small mb-1">
                        <HouseDoorFill className="me-1"/> {conv.inmueble.titulo}
                      </div>
                      <p className="mb-0 text-truncate small text-secondary fst-italic">
                        {conv.lastMessage.emisor.id === user.id ? 'Tú: ' : ''} 
                        {conv.lastMessage.contenido}
                      </p>
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            </Card>
          </Col>

          {/* DERECHA: VENTANA DE CHAT */}
          <Col md={8} className="h-100">
            <Card className="shadow border-0 h-100">
              {selectedChat ? (
                <>
                  <Card.Header className="text-white py-3" style={{ backgroundColor: colors.purpleDark }}>
                    <div className="d-flex align-items-center">
                      <div className="bg-white rounded-circle p-1 me-3 d-flex justify-content-center align-items-center" style={{ width: '40px', height: '40px' }}>
                        <HouseDoorFill color={colors.purpleDark} size={20}/>
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold">{selectedChat.inmueble.titulo}</h6>
                        <small style={{ opacity: 0.8 }}>Propietario: {selectedChat.otherUser.nombre} {selectedChat.otherUser.apellido}</small>
                      </div>
                    </div>
                  </Card.Header>

                  <Card.Body className="d-flex flex-column p-0 bg-light">
                    <div className="flex-grow-1 p-4 overflow-auto">
                      {messages.map((msg) => {
                        const isMe = msg.emisor.id === user.id;
                        return (
                          <div key={msg.id} className={`d-flex mb-3 ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>
                            <div 
                              className="px-3 py-2 shadow-sm"
                              style={{ 
                                maxWidth: '75%', 
                                borderRadius: '15px',
                                borderTopRightRadius: isMe ? '0' : '15px',
                                borderTopLeftRadius: isMe ? '15px' : '0',
                                backgroundColor: isMe ? colors.coral : 'white',
                                color: isMe ? 'white' : 'black'
                              }}
                            >
                              <div>{msg.contenido}</div>
                              <div className={`text-end small ${isMe ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.65rem', marginTop: '2px' }}>
                                {new Date(msg.fechaEnvio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 bg-white border-top">
                      <Form onSubmit={handleSend}>
                        <div className="d-flex gap-2">
                          <Form.Control
                            type="text"
                            placeholder="Escribe tu consulta..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            style={{ borderRadius: '25px', paddingLeft: '20px' }}
                            disabled={sending}
                          />
                          <Button 
                            type="submit" 
                            className="rounded-circle"
                            style={{ width: '45px', height: '45px', backgroundColor: colors.purpleDark, border: 'none' }}
                            disabled={sending || !newMessage.trim()}
                          >
                            {sending ? <Spinner size="sm"/> : <Send size={18}/>}
                          </Button>
                        </div>
                      </Form>
                    </div>
                  </Card.Body>
                </>
              ) : (
                <Card.Body className="d-flex flex-column justify-content-center align-items-center text-muted">
                  <PersonCircle size={60} style={{ color: '#ddd' }} className="mb-3"/>
                  <h5>Selecciona una conversación</h5>
                  <p>Aquí verás tus mensajes con los propietarios.</p>
                </Card.Body>
              )}
            </Card>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default StudentChat;