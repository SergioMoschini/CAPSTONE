import { useState } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

function RegisterPage() {
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axiosClient.post('/auth/register', form);
      setSuccess('Registrazione completata! Controlla la tua email, poi accedi.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Errore durante la registrazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '100%', maxWidth: '420px' }} className="p-4 page-card">
        <h2 className="mb-4 text-center">Registrati</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control type="text" name="username" value={form.username} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" name="password" value={form.password} onChange={handleChange} required />
            <Form.Text style={{ color: 'var(--gold-light)' }}>
              Min. 8 caratteri, almeno una maiuscola, un numero e un carattere speciale.
            </Form.Text>
          </Form.Group>
          <Button type="submit" variant="dark" className="w-100" disabled={loading}>
            {loading ? 'Registrazione...' : 'Registrati'}
          </Button>
        </Form>
        <p className="text-center mt-3 mb-0">
          Hai già un account? <Link to="/login">Accedi</Link>
        </p>
      </Card>
    </Container>
  );
}

export default RegisterPage;
