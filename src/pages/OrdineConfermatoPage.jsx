import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Alert, Button, Spinner } from 'react-bootstrap';
import axiosClient from '../api/axiosClient';
import { useCart } from '../context/CartContext';

function OrdineConfermatoPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const ordineId = searchParams.get('ordine_id');

  const { svuotaCarrello } = useCart();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const chiamataEseguita = useRef(false);

  useEffect(() => {
    if (!sessionId || !ordineId || chiamataEseguita.current) {
      setLoading(false);
      return;
    }
    chiamataEseguita.current = true;
    axiosClient
      .post('/pagamenti/conferma', { sessionId, ordineId })
      .then((res) => {
        const ok = res.data.success === true;
        setSuccess(ok);
        if (ok) svuotaCarrello();
      })
      .catch(() => setSuccess(false))
      .finally(() => setLoading(false));
  }, [sessionId, ordineId, svuotaCarrello]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        {success ? (
          <>
            <Alert variant="success">
              Pagamento completato! Il tuo ordine è stato confermato.
            </Alert>
            <Button variant="dark" className="w-100" onClick={() => navigate('/')}>
              Torna alla home
            </Button>
          </>
        ) : (
          <>
            <Alert variant="danger">
              Pagamento non andato a buon fine. Riprova.
            </Alert>
            <Button variant="dark" className="w-100" onClick={() => navigate('/carrello')}>
              Torna al carrello
            </Button>
          </>
        )}
      </div>
    </Container>
  );
}

export default OrdineConfermatoPage;
