import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Spinner, Alert, Badge, Button, Modal, Form } from 'react-bootstrap';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const badgeConfig = {
  DISPONIBILE: { label: 'Disponibile', bg: 'success' },
  VENDUTA: { label: 'Venduta', bg: 'secondary' },
  NON_DISPONIBILE: { label: 'Non disponibile', bg: 'warning' },
};

function MiniatureDettaglioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { carrello, aggiungiAlCarrello } = useCart();
  const [miniatura, setMiniatura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImg, setSelectedImg] = useState(0);
  const [acquistaLoading, setAcquistaLoading] = useState(false);
  const [acquistaError, setAcquistaError] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showIndirizzoModal, setShowIndirizzoModal] = useState(false);
  const [indirizzo, setIndirizzo] = useState('');

  useEffect(() => {
    axiosClient
      .get(`/miniature/${id}`)
      .then((res) => setMiniatura(res.data))
      .catch(() => setError('Errore nel caricamento della miniatura'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" style={{ color: 'var(--gold)' }} />
      </Container>
    );
  }

  if (error || !miniatura) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || 'Miniatura non trovata'}</Alert>
      </Container>
    );
  }

  const images = [
    ...(miniatura.immagineCopertina ? [miniatura.immagineCopertina] : []),
    ...(Array.isArray(miniatura.immagini) ? miniatura.immagini : []),
  ];

  const slides = images.map((src) => ({ src }));
  const badge = badgeConfig[miniatura.stato];
  const isDisponibile = miniatura.stato === 'DISPONIBILE';

  const apriModalIndirizzo = () => {
    if (!token) { navigate('/login'); return; }
    setIndirizzo(user?.indirizzo ?? '');
    setAcquistaError('');
    setShowIndirizzoModal(true);
  };

  const handleCompra = async (e) => {
    e.preventDefault();
    setShowIndirizzoModal(false);
    setAcquistaLoading(true);
    try {
      const res = await axiosClient.post('/ordini', {
        indirizzoSpedizione: indirizzo || 'Da definire',
        miniature: [{ miniaturaId: miniatura.id, quantita: 1 }],
        commissioneIds: [],
      });
      const ordine = res.data;
      navigate('/pagamento', {
        state: {
          importo: Math.round(Number(ordine.costoTotale) * 100),
          descrizione: miniatura.titolo,
          ordineId: ordine.id,
        },
      });
    } catch (err) {
      setAcquistaError(err.response?.data?.message || "Errore durante la creazione dell'ordine");
    } finally {
      setAcquistaLoading(false);
    }
  };

  return (
    <Container className="py-5 detail-page">
      <button className="btn btn-outline-gold mb-4" onClick={() => navigate(-1)}>
        ← Torna alla vetrina
      </button>

      <h1 className="detail-title mb-3">{miniatura.titolo}</h1>

      {badge && (
        <Badge bg={badge.bg} className="mb-4">
          {badge.label}
        </Badge>
      )}

      {images.length > 0 && (
        <div className="mb-5">
          <div className="detail-main-img-wrapper mb-3">
            <img
              src={images[selectedImg]}
              alt={`${miniatura.titolo} - foto principale`}
              className="detail-image detail-image--main"
              style={{ cursor: 'zoom-in' }}
              onClick={() => { setLightboxIndex(selectedImg); setLightboxOpen(true); }}
            />
            <button
              className="detail-img-zoom-btn"
              onClick={() => { setLightboxIndex(selectedImg); setLightboxOpen(true); }}
              title="Ingrandisci"
            >
              ⤢
            </button>
          </div>
          {images.length > 1 && (
            <div className="detail-thumbnails">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${miniatura.titolo} - foto ${idx + 1}`}
                  className={`detail-thumbnail${selectedImg === idx ? ' active' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedImg(idx)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="detail-info">
        <p className="detail-prezzo">€{Number(miniatura.prezzo).toFixed(2)}</p>
        <p className="detail-descrizione">{miniatura.descrizione}</p>

        {acquistaError && (
          <Alert variant="danger" className="mt-3">{acquistaError}</Alert>
        )}

        {isDisponibile && (
          user && user.role !== 'ADMIN' ? (
            <div className="d-flex gap-2 flex-wrap mt-3">
              <Button variant="dark" size="lg" onClick={apriModalIndirizzo} disabled={acquistaLoading}>
                {acquistaLoading ? <Spinner animation="border" size="sm" /> : 'Acquista ora'}
              </Button>
              <button
                className="btn btn-outline-gold btn-lg"
                onClick={() => aggiungiAlCarrello(miniatura)}
                disabled={carrello.some((item) => item.id === miniatura.id)}
              >
                {carrello.some((item) => item.id === miniatura.id) ? 'Nel carrello' : '+ Carrello'}
              </button>
            </div>
          ) : !user && (
            <p className="mt-3 small">
              <Link to="/login" style={{ color: 'var(--gold)' }}>
                Registrati o accedi per acquistare
              </Link>
            </p>
          )
        )}
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
        index={lightboxIndex}
      />

      <Modal show={showIndirizzoModal} onHide={() => setShowIndirizzoModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Indirizzo di spedizione</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCompra}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Dove vuoi ricevere la miniatura?</Form.Label>
              <Form.Control
                value={indirizzo}
                onChange={(e) => setIndirizzo(e.target.value)}
                placeholder="Via Roma 1, 00100 Roma"
                autoFocus
              />
              <Form.Text className="text-muted">
                Modifica solo per questo ordine — non verrà salvato nel profilo.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowIndirizzoModal(false)}>
              Annulla
            </Button>
            <Button type="submit" variant="dark">
              Conferma e procedi
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default MiniatureDettaglioPage;
