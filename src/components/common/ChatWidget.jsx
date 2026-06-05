import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Form, Button, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';

function ChatWidget() {
  const { user, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [testo, setTesto] = useState('');
  const [sending, setSending] = useState(false);
  const [nonLetti, setNonLetti] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!token || !user || user.role === 'ADMIN') return;

    const fetchNonLetti = () => {
      axiosClient
        .get('/messaggi/me/non-letti')
        .then((res) => setNonLetti(res.data))
        .catch(() => {});
    };

    fetchNonLetti();
    const interval = setInterval(fetchNonLetti, 10000);
    return () => clearInterval(interval);
  }, [token, user]);

  useEffect(() => {
    if (!open) return;

    axiosClient
      .get('/messaggi/me')
      .then((res) => { setMessages(res.data); setError(''); })
      .catch(() => setError('Errore nel caricamento dei messaggi'))
      .finally(() => setLoading(false));

    const interval = setInterval(() => {
      axiosClient
        .get('/messaggi/me')
        .then((res) => setMessages(res.data))
        .catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!testo.trim()) return;
    setSending(true);
    try {
      await axiosClient.post('/messaggi/me', { testo });
      setTesto('');
      const res = await axiosClient.get('/messaggi/me');
      setMessages(res.data);
    } catch {
      setError("Errore durante l'invio");
    } finally {
      setSending(false);
    }
  };

  if (!token || !user || user.role === 'ADMIN') return null;

  const showDot = nonLetti > 0 && !open;

  return (
    <>
      <button
        className="chat-widget-btn"
        onClick={() => { if (!open) setLoading(true); setOpen((v) => !v); }}
        title="Chat con l'admin"
      >
        💬
        {showDot && <span className="chat-widget-dot" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="chat-widget-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="chat-widget-header">
              <span>Chat con l&apos;admin</span>
              <button className="chat-widget-close" onClick={() => setOpen(false)}>×</button>
            </div>

            <div className="chat-widget-messages">
              {!loading && messages.length === 0 && !error && (
                <p className="text-center small mb-0" style={{ color: '#4caf8a' }}>
                  Chiedi qualsiasi cosa ad un amministratore
                </p>
              )}
              {loading && (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" />
                </div>
              )}
              {error && <p className="text-danger small text-center">{error}</p>}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-message ${msg.mittenteId === user.id ? 'chat-message--self' : 'chat-message--other'}`}
                >
                  <span className="chat-message-testo">{msg.testo}</span>
                  <span className="chat-message-time">
                    {new Date(msg.dataInvio).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <Form onSubmit={handleSend} className="chat-widget-form">
              <Form.Control
                value={testo}
                onChange={(e) => setTesto(e.target.value)}
                placeholder="Scrivi un messaggio..."
                size="sm"
                disabled={sending}
                autoFocus
              />
              <Button type="submit" variant="dark" size="sm" disabled={sending || !testo.trim()}>
                {sending ? <Spinner animation="border" size="sm" /> : '→'}
              </Button>
            </Form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatWidget;
