import { useState } from 'react';
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

function PagamentoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const importo = location.state?.importo;
  const descrizione = location.state?.descrizione;
  const ordineId = location.state?.ordineId;

  if (!importo) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Nessun importo specificato.{' '}
          <Button variant="link" className="p-0" onClick={() => navigate('/')}>
            Torna alla home
          </Button>
        </Alert>
      </Container>
    );
  }

  const handlePaga = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await axiosClient.post('/pagamenti/checkout', { importo, ordineId });
      window.location.href = res.data.url;
    } catch (err) {
      setError(err.response?.data?.message || 'Errore durante il pagamento');
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '100%', maxWidth: '460px' }} className="p-4 page-card">
        <h2 className="mb-4 text-center">Riepilogo ordine</h2>
        {descrizione && <p className="text-muted text-center mb-3">{descrizione}</p>}
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="d-flex justify-content-between align-items-center mb-4 py-3 border-top border-bottom">
          <span className="fw-semibold">Totale</span>
          <span className="fs-4 fw-bold">€{(importo / 100).toFixed(2)}</span>
        </div>
        <Button variant="dark" className="w-100" onClick={handlePaga} disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : 'Paga con Stripe'}
        </Button>
        <Button variant="link" className="w-100 mt-2 text-muted" onClick={() => navigate(-1)} disabled={loading}>
          Annulla
        </Button>
      </Card>
    </Container>
  );
}

export default PagamentoPage;
