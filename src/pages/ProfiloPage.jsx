import { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Badge, Spinner, Alert, Form, Button, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

const statoBadgeOrdine = {
  IN_ATTESA:  { bg: 'warning',  text: 'dark' },
  CONFERMATO: { bg: 'info',     text: 'dark' },
  SPEDITO:    { bg: 'primary',  text: undefined },
  CONSEGNATO: { bg: 'success',  text: undefined },
  ANNULLATO:  { bg: 'danger',   text: undefined },
};

const statoBadgeCommissione = {
  IN_ATTESA:     { bg: 'warning',  text: 'dark' },
  APPROVATA:     { bg: 'info',     text: 'dark' },
  IN_LAVORAZIONE:{ bg: 'primary',  text: undefined },
  COMPLETATA:    { bg: 'success',  text: undefined },
  RIFIUTATA:     { bg: 'danger',   text: undefined },
};

function OrdineCard({ ordine }) {
  const badge = statoBadgeOrdine[ordine.stato] ?? { bg: 'secondary' };

  return (
    <Card className="page-card mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className="text-muted small">#{ordine.id.slice(0, 8)}…</span>
          <Badge bg={badge.bg} text={badge.text}>{ordine.stato}</Badge>
        </div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="text-muted small">
            {new Date(ordine.createdAt).toLocaleDateString('it-IT')}
          </span>
          <span className="fw-bold fs-5">€{Number(ordine.costoTotale).toFixed(2)}</span>
        </div>

        {ordine.indirizzoSpedizione && (
          <p className="text-muted small mb-2">
            <span className="fw-semibold">Spedizione: </span>{ordine.indirizzoSpedizione}
          </p>
        )}

        {ordine.miniature?.length > 0 && (
          <div className="mb-2">
            <p className="fw-semibold small mb-1">Miniature</p>
            <ul className="list-unstyled mb-0 ps-2">
              {ordine.miniature.map((item) => (
                <li key={item.id} className="text-muted small">
                  {item.titolo} × {item.quantita} — €{Number(item.prezzo).toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {ordine.commissioni?.length > 0 && (
          <div>
            <p className="fw-semibold small mb-1">Commissioni</p>
            <ul className="list-unstyled mb-0 ps-2">
              {ordine.commissioni.map((c) => (
                <li key={c.id} className="text-muted small">
                  {c.titolo} — budget €{Number(c.budget).toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

function CommissioneCard({ commissione }) {
  const badge = statoBadgeCommissione[commissione.stato] ?? { bg: 'secondary' };

  return (
    <Card className="page-card mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className="fw-semibold">{commissione.titolo}</span>
          <Badge bg={badge.bg} text={badge.text}>{commissione.stato}</Badge>
        </div>
        <p className="text-muted small mb-2">{commissione.descrizione}</p>
        <div className="d-flex justify-content-between align-items-center">
          <span className="text-muted small">
            {new Date(commissione.dataRichiesta).toLocaleDateString('it-IT')}
          </span>
          <span className="fw-bold">€{Number(commissione.budget).toFixed(2)}</span>
        </div>
      </Card.Body>
    </Card>
  );
}

function ProfiloPage() {
  const { user, loading, fetchMe } = useAuth();
  const [ordini, setOrdini] = useState([]);
  const [ordiniLoading, setOrdiniLoading] = useState(true);
  const [ordiniError, setOrdiniError] = useState('');
  const [commissioni, setCommissioni] = useState([]);
  const [commissioniLoading, setCommissioniLoading] = useState(true);
  const [commissioniError, setCommissioniError] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', email: '', password: '', indirizzo: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const openEdit = () => {
    setEditForm({
      username: user.username ?? '',
      email: user.email ?? '',
      password: '',
      indirizzo: user.indirizzo ?? '',
    });
    setEditError('');
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditLoading(true);
    try {
      const body = {
        username: editForm.username,
        email: editForm.email,
        indirizzo: editForm.indirizzo,
        password: editForm.password || null,
      };
      await axiosClient.put('/utenti/me', body);
      await fetchMe();
      setEditOpen(false);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Errore durante il salvataggio');
    } finally {
      setEditLoading(false);
    }
  };

  useEffect(() => {
    axiosClient
      .get('/ordini/me')
      .then((res) => setOrdini(res.data))
      .catch(() => setOrdiniError('Errore nel caricamento degli ordini'))
      .finally(() => setOrdiniLoading(false));

    axiosClient
      .get('/commissioni/me')
      .then((res) => setCommissioni(res.data))
      .catch(() => setCommissioniError('Errore nel caricamento delle commissioni'))
      .finally(() => setCommissioniLoading(false));
  }, []);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Utente non trovato.</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Il mio profilo</h1>

      <Card className="p-4 page-card mb-3" style={{ maxWidth: '500px' }}>
        <Row className="mb-2">
          <Col xs={4} className="text-muted fw-semibold">Username</Col>
          <Col>{user.username}</Col>
        </Row>
        <Row className="mb-2">
          <Col xs={4} className="text-muted fw-semibold">Email</Col>
          <Col>{user.email}</Col>
        </Row>
        <Row className="mb-2">
          <Col xs={4} className="text-muted fw-semibold">Ruolo</Col>
          <Col>
            <Badge bg={user.role === 'ADMIN' ? 'danger' : 'primary'}>{user.role}</Badge>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xs={4} className="text-muted fw-semibold">Registrato il</Col>
          <Col>{new Date(user.createdAt).toLocaleDateString('it-IT')}</Col>
        </Row>
        {user.indirizzo && (
          <Row className="mb-3">
            <Col xs={4} className="text-muted fw-semibold">Indirizzo</Col>
            <Col>{user.indirizzo}</Col>
          </Row>
        )}
        <button className="btn btn-outline-gold btn-sm" onClick={openEdit}>
          Modifica profilo
        </button>
      </Card>

      <Modal show={editOpen} onHide={closeEdit} centered>
        <Modal.Header closeButton>
          <Modal.Title>Modifica profilo</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            {editError && <Alert variant="danger">{editError}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                placeholder="Lascia vuoto per non modificarla"
              />
            </Form.Group>
            <Form.Group className="mb-1">
              <Form.Label>Indirizzo di spedizione <span className="text-muted fw-normal">(opzionale)</span></Form.Label>
              <Form.Control
                value={editForm.indirizzo}
                onChange={(e) => setEditForm({ ...editForm, indirizzo: e.target.value })}
                placeholder="Via Roma 1, 00100 Roma"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={closeEdit} disabled={editLoading}>
              Annulla
            </Button>
            <Button type="submit" variant="dark" disabled={editLoading}>
              {editLoading ? <Spinner animation="border" size="sm" /> : 'Salva modifiche'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <h2 className="mb-3">I miei ordini</h2>

      {ordiniLoading ? (
        <Spinner animation="border" size="sm" />
      ) : ordiniError ? (
        <Alert variant="danger">{ordiniError}</Alert>
      ) : ordini.length === 0 ? (
        <p className="text-muted">Nessun ordine trovato.</p>
      ) : (
        <div style={{ maxWidth: '600px' }}>
          {ordini.map((ordine) => (
            <OrdineCard key={ordine.id} ordine={ordine} />
          ))}
        </div>
      )}

      <h2 className="mb-3 mt-5">Le mie commissioni</h2>

      {commissioniLoading ? (
        <Spinner animation="border" size="sm" />
      ) : commissioniError ? (
        <Alert variant="danger">{commissioniError}</Alert>
      ) : commissioni.length === 0 ? (
        <p className="text-muted">Nessuna commissione trovata.</p>
      ) : (
        <div style={{ maxWidth: '600px' }}>
          {commissioni.map((c) => (
            <CommissioneCard key={c.id} commissione={c} />
          ))}
        </div>
      )}
    </Container>
  );
}

export default ProfiloPage;
