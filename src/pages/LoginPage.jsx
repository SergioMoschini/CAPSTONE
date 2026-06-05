import { useState } from 'react';
import { Container, Form, Button, Alert, Card, Modal } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

function ForgotPasswordModal({ show, onHide }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    onHide();
    setEmail('');
    setSent(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axiosClient.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      setError('Errore di rete. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Recupero password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {sent ? (
          <Alert variant="success" className="mb-0">
            Se l&apos;email è registrata, riceverai un link per reimpostare la password.
          </Alert>
        ) : (
          <Form onSubmit={handleSubmit} id="forgot-form">
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </Form.Group>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleClose}>
          {sent ? 'Chiudi' : 'Annulla'}
        </Button>
        {!sent && (
          <Button type="submit" form="forgot-form" variant="dark" disabled={loading}>
            {loading ? 'Invio...' : 'Invia link di recupero'}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axiosClient.post('/auth/login', form);
      login(res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Credenziali non valide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '100%', maxWidth: '420px' }} className="p-4 page-card">
        <h2 className="mb-4 text-center">Accedi</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-1">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" name="password" value={form.password} onChange={handleChange} required />
          </Form.Group>
          <div className="text-end mb-3">
            <Button variant="link" className="p-0 small" onClick={() => setShowForgot(true)}>
              Password dimenticata?
            </Button>
          </div>
          <Button type="submit" variant="dark" className="w-100" disabled={loading}>
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </Button>
        </Form>
        <p className="text-center mt-3 mb-0">
          Non hai un account? <Link to="/register">Registrati</Link>
        </p>
      </Card>

      <ForgotPasswordModal show={showForgot} onHide={() => setShowForgot(false)} />
    </Container>
  );
}

export default LoginPage;
