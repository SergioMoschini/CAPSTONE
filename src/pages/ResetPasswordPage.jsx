import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import axiosClient from '../api/axiosClient';

const REGEX_PASSWORD = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/;

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [conferma, setConferma] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) navigate('/login', { replace: true });
  }, [token, navigate]);

  if (!token) return null;

  const validate = () => {
    if (password !== conferma) return 'Le password non coincidono.';
    if (!REGEX_PASSWORD.test(password))
      return 'La password deve avere almeno 6 caratteri, una maiuscola, un numero e un carattere speciale.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError('');
    setLoading(true);
    try {
      await axiosClient.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Link non valido o scaduto. Richiedi un nuovo link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '100%', maxWidth: '420px' }} className="p-4 page-card">
        <h2 className="mb-4 text-center">Reimposta password</h2>

        {success ? (
          <Alert variant="success" className="text-center mb-0">
            Password reimpostata con successo!<br />
            <span className="text-muted small">Reindirizzamento al login…</span>
          </Alert>
        ) : (
          <>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nuova password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
                <Form.Text className="text-muted">
                  Min. 6 caratteri, almeno una maiuscola, un numero e un carattere speciale.
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>Conferma password</Form.Label>
                <Form.Control
                  type="password"
                  value={conferma}
                  onChange={(e) => setConferma(e.target.value)}
                  required
                />
              </Form.Group>
              <Button type="submit" variant="dark" className="w-100" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Reimposta password'}
              </Button>
            </Form>
          </>
        )}
      </Card>
    </Container>
  );
}

export default ResetPasswordPage;
