import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Badge, ListGroup } from 'react-bootstrap';
import { Send, PersonCircle, Building, ArrowClockwise, ChatSquareText } from 'react-bootstrap-icons';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const OwnerChat = () => {
  const { user } = useAuth();
  
  // --- ESTADOS ---
  const [conversations, setConversations] = useState([]); // Lista de chats en la izquierda
  const [selectedChat, setSelectedChat] = useState(null); // Chat abierto actualmente
  const [messages, setMessages] = useState([]); // Mensajes del chat abierto
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Referencia para el scroll automático al final del chat
  const messagesEndRef = useRef(null);

  // --- PALETA DE COLORES ---
  const colors = {
    bg: '#eaf0f2',
    purpleLight: '#936b9f',
    purpleDark: '#402149',
    yellow: '#f9bb6e',
    coral: '#f67f54',
    white: '#ffffff'
  };

  // --- 1. CARGAR BANDEJA DE ENTRADA ---
  useEffect(() => {
    fetchInbox();
  }, []);

  const fetchInbox = async () => {
    try {
      setLoading(true);
      // Obtenemos TODOS los mensajes donde participo
      const res = await api.get('/mensajes/mis-mensajes');
      const allMsgs = res.data;

      // --- ALGORITMO DE AGRUPACIÓN ---
      // El backend devuelve mensajes sueltos. Debemos agruparlos por "Conversación".
      // Una conversación es única por: (OtroUsuario + Inmueble)
      const groups = {};

      allMsgs.forEach(msg => {
        // Determinar quién es "el otro"
        const isMe = msg.emisor.id === user.id;
        const otherUser = isMe ? msg.receptor : msg.emisor;
        
        // Clave única para agrupar
        const key = `${otherUser.id}-${msg.inmueble.id}`;

        if (!groups[key]) {
          groups[key] = {
            key,
            otherUser,
            inmueble: msg.inmueble,
            lastMessage: msg,
            // Guardamos IDs para llamar a la API después
            otherUserId: otherUser.id,
            inmuebleId: msg.inmueble.id
          };
        }
      });

      // Convertir objeto a array
      setConversations(Object.values(groups));
    } catch (error) {
      console.error("Error cargando inbox", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. CARGAR MENSAJES DE UN CHAT ESPECÍFICO ---
  const loadChat = async (conv) => {
    setSelectedChat(conv);
    try {
      const res = await api.get(`/mensajes/chat/con/${conv.otherUserId}/inmueble/${conv.inmuebleId}`);
      setMessages(res.data);
      scrollToBottom();
    } catch (error) {
      console.error("Error cargando chat", error);
    }
  };

  // --- 3. ENVIAR MENSAJE ---
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    setSending(true);
    try {
      const payload = {
        contenido: newMessage,
        idReceptor: selectedChat.otherUserId,
        idInmueble: selectedChat.inmuebleId
      };

      const res = await api.post('/mensajes', payload);
      
      // Agregamos el mensaje a la lista visualmente (sin recargar todo)
      // El backend devuelve el mensaje creado completo
      // Pero ojo: el backend devuelve entidades completas, aquí simulamos la estructura para rapidez
      const newMsgObj = {
        ...res.data, // El backend devuelve el objeto mensaje creado
        emisor: user, // Nosotros somos el emisor
        receptor: selectedChat.otherUser
      };

      setMessages([...messages, newMsgObj]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error("Error enviando mensaje", error);
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
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Spinner animation="border" style={{ color: colors.purpleDark }} />
    </Container>
  );

  return (
    <Container fluid className="py-4" style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      <Container>
        <Row style={{ height: '80vh' }}>
          
          {/* --- COLUMNA IZQUIERDA: LISTA DE CONVERSACIONES --- */}
          <Col md={4} className="h-100 d-flex flex-column mb-3 mb-md-0">
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="text-white d-flex justify-content-between align-items-center" style={{ backgroundColor: colors.purpleLight }}>
                <h5 className="mb-0 fw-bold">Bandeja de Entrada</h5>
                <Button variant="link" className="text-white p-0" onClick={fetchInbox} title="Recargar">
                  <ArrowClockwise size={20} />
                </Button>
              </Card.Header>
              <ListGroup variant="flush" className="overflow-auto" style={{ flex: 1 }}>
                {conversations.length === 0 ? (
                  <div className="text-center p-4 text-muted">No tienes mensajes aún.</div>
                ) : (
                  conversations.map((conv) => (
                    <ListGroup.Item 
                      key={conv.key} 
                      action 
                      active={selectedChat?.key === conv.key}
                      onClick={() => loadChat(conv)}
                      className="border-bottom"
                      style={{ 
                        backgroundColor: selectedChat?.key === conv.key ? '#f0ebf5' : 'white',
                        color: 'inherit',
                        borderLeft: selectedChat?.key === conv.key ? `4px solid ${colors.purpleDark}` : 'none'
                      }}
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1 fw-bold" style={{ color: colors.purpleDark }}>
                          <PersonCircle className="me-2"/>
                          {conv.otherUser.nombre} {conv.otherUser.apellido}
                        </h6>
                        <small className="text-muted">
                          {new Date(conv.lastMessage.fechaEnvio).toLocaleDateString()}
                        </small>
                      </div>
                      <div className="d-flex align-items-center text-muted small mb-2">
                        <Building className="me-1" size={12}/> {conv.inmueble.titulo}
                      </div>
                      <p className="mb-1 text-truncate small text-secondary">
                        {conv.lastMessage.emisor.id === user.id ? 'Tú: ' : ''} 
                        {conv.lastMessage.contenido}
                      </p>
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            </Card>
          </Col>

          {/* --- COLUMNA DERECHA: ZONA DE CHAT --- */}
          <Col md={8} className="h-100">
            <Card className="shadow-lg border-0 h-100">
              {selectedChat ? (
                <>
                  {/* HEADER DEL CHAT */}
                  <Card.Header className="text-white py-3 d-flex align-items-center" style={{ backgroundColor: colors.purpleDark }}>
                    <div className="bg-white text-dark rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                      <PersonCircle size={24} color={colors.purpleDark} />
                    </div>
                    <div>
                      <h5 className="mb-0 fw-bold">{selectedChat.otherUser.nombre} {selectedChat.otherUser.apellido}</h5>
                      <small style={{ opacity: 0.8 }}><Building className="me-1"/> Interesado en: {selectedChat.inmueble.titulo}</small>
                    </div>
                  </Card.Header>

                  {/* CUERPO DEL CHAT (MENSAJES) */}
                  <Card.Body className="d-flex flex-column p-0">
                    <div 
                      className="flex-grow-1 p-4 overflow-auto" 
                      style={{ backgroundColor: '#f8f9fa' }}
                    >
                      {messages.map((msg) => {
                        const isMe = msg.emisor.id === user.id;
                        return (
                          <div key={msg.id} className={`d-flex mb-3 ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>
                            <div 
                              className="p-3 shadow-sm"
                              style={{ 
                                maxWidth: '75%', 
                                borderRadius: isMe ? '15px 15px 0 15px' : '15px 15px 15px 0',
                                backgroundColor: isMe ? colors.purpleDark : 'white',
                                color: isMe ? 'white' : 'black',
                                border: isMe ? 'none' : '1px solid #ddd'
                              }}
                            >
                              <div className="mb-1">{msg.contenido}</div>
                              <div className={`text-end small ${isMe ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                                {new Date(msg.fechaEnvio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* INPUT PARA ENVIAR */}
                    <div className="p-3 bg-white border-top">
                      <Form onSubmit={handleSend} className="d-flex gap-2">
                        <Form.Control
                          type="text"
                          placeholder="Escribe un mensaje..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          style={{ borderRadius: '20px', paddingLeft: '15px' }}
                          disabled={sending}
                          autoFocus
                        />
                        <Button 
                          type="submit" 
                          disabled={sending || !newMessage.trim()}
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: '45px', height: '45px', backgroundColor: colors.coral, border: 'none' }}
                        >
                          {sending ? <Spinner animation="border" size="sm" /> : <Send size={18} />}
                        </Button>
                      </Form>
                    </div>
                  </Card.Body>
                </>
              ) : (
                /* ESTADO VACÍO (SIN SELECCIONAR CHAT) */
                <Card.Body className="d-flex flex-column justify-content-center align-items-center text-muted">
                  <ChatSquareText size={80} style={{ color: colors.purpleLight, opacity: 0.3 }} className="mb-3" />
                  <h4>Selecciona una conversación</h4>
                  <p>Elige un estudiante de la lista para ver el historial y responder.</p>
                </Card.Body>
              )}
            </Card>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default OwnerChat;