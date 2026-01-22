import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Button,
  Form,
  Spinner,
  Badge,
  ListGroup,
  Offcanvas,
  Row,
  Col,
} from 'react-bootstrap';
import {
  ChatDots,
  Send,
  Robot,
  Person,
  Search,
  Briefcase,
  Star,
  GeoAlt,
  Clock,
  CurrencyDollar,
  X,
  Plus,
  Trash,
  ChevronLeft,
} from 'react-bootstrap-icons';
import axiosInstance from '../api/axios';
import { toast } from 'react-toastify';

export default function AIChat({ show, onHide }) {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [showSessions, setShowSessions] = useState(true);
  const messagesEndRef = useRef(null);

  // Fetch sessions when component mounts or shows
  useEffect(() => {
    if (show) {
      fetchSessions();
    }
  }, [show]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const response = await axiosInstance.get('/api/ai/sessions');
      if (response.data.success) {
        setSessions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchMessages = async (sessionId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/ai/sessions/${sessionId}/messages`);
      if (response.data.success) {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      const response = await axiosInstance.post('/api/ai/sessions', {
        title: 'New Chat'
      });
      if (response.data.success) {
        const newSession = response.data.data;
        setSessions([newSession, ...sessions]);
        setCurrentSession(newSession);
        setMessages([]);
        setShowSessions(false);
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create new chat');
    }
  };

  const selectSession = async (session) => {
    setCurrentSession(session);
    setShowSessions(false);
    await fetchMessages(session.id);
  };

  const deleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this chat?')) return;

    try {
      await axiosInstance.delete(`/api/ai/sessions/${sessionId}`);
      setSessions(sessions.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
        setShowSessions(true);
      }
      toast.success('Chat deleted');
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete chat');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message to UI immediately
    const tempUserMsg = {
      id: Date.now(),
      role: 'USER',
      content: userMessage,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      setLoading(true);
      console.log('Sending message to AI:', userMessage);

      const response = await axiosInstance.post('/api/ai/chat', {
        message: userMessage,
        sessionId: currentSession?.id
      });

      console.log('AI Response:', response.data);

      if (response.data.success) {
        const data = response.data.data;

        // Update session if it was just created
        if (!currentSession) {
          setCurrentSession({ id: data.sessionId });
          fetchSessions();
        }

        // Add assistant response
        const assistantMsg = {
          id: Date.now() + 1,
          role: 'ASSISTANT',
          content: data.response || 'No response received',
          intent: data.intent,
          metadata: {
            searchResults: data.searchResults,
            needsMoreInfo: data.needsMoreInfo
          },
          createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        // Handle unsuccessful response
        console.error('AI Response not successful:', response.data);
        toast.error(response.data.message || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
      // Remove the temp user message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
      setInputMessage(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderSearchResults = (results, intent) => {
    if (!results || results.length === 0) return null;

    if (intent === 'SEARCH_WORKERS') {
      return (
        <div className="mt-3">
          <h6 className="text-muted mb-2">
            <Person className="me-2" />
            Found Workers
          </h6>
          <Row className="g-2">
            {results.slice(0, 5).map((worker) => (
              <Col xs={12} key={worker.id}>
                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">{worker.name}</h6>
                        {worker.location && (
                          <small className="text-muted d-block">
                            <GeoAlt className="me-1" />
                            {worker.location}
                          </small>
                        )}
                        {worker.skills && (
                          <div className="mt-1">
                            {worker.skills.split(',').slice(0, 3).map((skill, idx) => (
                              <Badge key={idx} bg="light" text="dark" className="me-1">
                                {skill.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-end">
                        {worker.avgRating && (
                          <div className="text-warning">
                            <Star className="me-1" />
                            {worker.avgRating}
                          </div>
                        )}
                        <small className="text-muted">
                          {worker.completedJobs} jobs
                        </small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      );
    }

    if (intent === 'SEARCH_JOBS') {
      return (
        <div className="mt-3">
          <h6 className="text-muted mb-2">
            <Briefcase className="me-2" />
            Found Jobs
          </h6>
          <Row className="g-2">
            {results.slice(0, 5).map((job) => (
              <Col xs={12} key={job.id}>
                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">{job.title}</h6>
                        <small className="text-muted d-block">
                          <GeoAlt className="me-1" />
                          {job.location}
                        </small>
                        {job.category && (
                          <Badge bg="primary" className="mt-1">
                            {job.category}
                          </Badge>
                        )}
                      </div>
                      <div className="text-end">
                        <div className="text-success fw-bold">
                          <CurrencyDollar />
                          LKR {job.hourlyRate}/hr
                        </div>
                        <small className="text-muted">
                          <Clock className="me-1" />
                          {new Date(job.postedDate).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                    <p className="small text-muted mt-2 mb-0">
                      {job.description?.substring(0, 100)}
                      {job.description?.length > 100 ? '...' : ''}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      );
    }

    return null;
  };

  const renderMessage = (message) => {
    const isUser = message.role === 'USER';
    const searchResults = message.metadata?.searchResults;

    return (
      <div
        key={message.id}
        className={`d-flex mb-3 ${isUser ? 'justify-content-end' : 'justify-content-start'}`}
      >
        <div
          className={`p-3 rounded-3 ${isUser
              ? 'bg-primary text-white'
              : 'bg-light'
            }`}
          style={{ maxWidth: '85%' }}
        >
          <div className="d-flex align-items-center mb-2">
            {isUser ? (
              <Person className="me-2" />
            ) : (
              <Robot className="me-2" />
            )}
            <small className="opacity-75">
              {isUser ? 'You' : 'AI Assistant'}
            </small>
          </div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
          {!isUser && searchResults && renderSearchResults(searchResults, message.intent)}
        </div>
      </div>
    );
  };

  return (
    <Offcanvas show={show} onHide={onHide} placement="end" style={{ width: '450px' }}>
      <Offcanvas.Header className="border-bottom">
        <div className="d-flex align-items-center w-100">
          {currentSession && !showSessions && (
            <Button
              variant="link"
              className="p-0 me-2"
              onClick={() => setShowSessions(true)}
            >
              <ChevronLeft size={20} />
            </Button>
          )}
          <Offcanvas.Title className="d-flex align-items-center">
            <Robot className="me-2 text-primary" size={24} />
            AI Assistant
          </Offcanvas.Title>
          <Button
            variant="link"
            className="ms-auto p-0"
            onClick={onHide}
          >
            <X size={24} />
          </Button>
        </div>
      </Offcanvas.Header>

      <Offcanvas.Body className="p-0 d-flex flex-column">
        {showSessions ? (
          // Sessions List View
          <div className="p-3 flex-grow-1 overflow-auto">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Chat History</h6>
              <Button
                variant="primary"
                size="sm"
                onClick={createNewSession}
              >
                <Plus className="me-1" />
                New Chat
              </Button>
            </div>

            {loadingSessions ? (
              <div className="text-center py-4">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <ChatDots size={48} className="mb-3 opacity-50" />
                <p>No chat history yet</p>
                <p className="small">Start a new conversation to get AI-powered recommendations!</p>
              </div>
            ) : (
              <ListGroup variant="flush">
                {sessions.map((session) => (
                  <ListGroup.Item
                    key={session.id}
                    action
                    onClick={() => selectSession(session)}
                    className="d-flex justify-content-between align-items-center border-0 rounded mb-1"
                  >
                    <div>
                      <div className="fw-medium">
                        {session.title || 'Chat Session'}
                      </div>
                      <small className="text-muted">
                        {session.messages?.[0]?.content?.substring(0, 40) || 'Empty'}...
                      </small>
                      <br />
                      <small className="text-muted">
                        {new Date(session.updatedAt).toLocaleDateString()}
                      </small>
                    </div>
                    <Button
                      variant="link"
                      className="text-danger p-0"
                      onClick={(e) => deleteSession(session.id, e)}
                    >
                      <Trash />
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>
        ) : (
          // Chat View
          <>
            <div className="flex-grow-1 overflow-auto p-3" style={{ minHeight: 0 }}>
              {messages.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <Search size={48} className="mb-3 opacity-50" />
                  <h6>How can I help you?</h6>
                  <p className="small">Try asking things like:</p>
                  <div className="d-flex flex-column gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => setInputMessage('Find painters in Colombo area')}
                    >
                      "Find painters in Colombo area"
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => setInputMessage('Show me plumbing jobs near Kandy')}
                    >
                      "Show me plumbing jobs near Kandy"
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => setInputMessage('I need someone for electrical work and painting')}
                    >
                      "I need someone for electrical work and painting"
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map(renderMessage)}
                  {loading && (
                    <div className="d-flex justify-content-start mb-3">
                      <div className="bg-light p-3 rounded-3">
                        <Spinner animation="border" size="sm" className="me-2" />
                        Thinking...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="border-top p-3">
              <Form onSubmit={sendMessage}>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    placeholder="Ask me anything..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={loading}
                    autoFocus
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!inputMessage.trim() || loading}
                  >
                    <Send />
                  </Button>
                </div>
              </Form>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}
