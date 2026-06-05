import { useState, useEffect, useRef } from 'react';
import {
  Container, Tabs, Tab, Table, Button, Modal,
  Form, Alert, Spinner, Badge,
} from 'react-bootstrap';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

const STATI_ORDINE = ['IN_ATTESA', 'CONFERMATO', 'SPEDITO', 'CONSEGNATO', 'ANNULLATO'];
const STATI_COMMISSIONE = ['IN_ATTESA', 'APPROVATA', 'IN_LAVORAZIONE', 'COMPLETATA', 'RIFIUTATA'];

function MiniaturaForm({ miniatura, onSaved, onClose }) {
  const [form, setForm] = useState({
    titolo: miniatura?.titolo ?? '',
    descrizione: miniatura?.descrizione ?? '',
    prezzo: miniatura?.prezzo ?? '',
  });
  const [copertina, setCopertina] = useState(null);
  const [immagini, setImmagini] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('titolo', form.titolo);
      fd.append('descrizione', form.descrizione);
      fd.append('prezzo', form.prezzo);
      if (copertina) fd.append('copertina', copertina);
      immagini.forEach((file) => fd.append('immagini', file));
      if (miniatura) {
        await axiosClient.put(`/miniature/${miniatura.id}`, fd);
      } else {
        await axiosClient.post('/miniature', fd);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Errore durante il salvataggio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Group className="mb-3">
        <Form.Label>Titolo</Form.Label>
        <Form.Control name="titolo" value={form.titolo} onChange={handleChange} required />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Descrizione</Form.Label>
        <Form.Control as="textarea" rows={3} name="descrizione" value={form.descrizione} onChange={handleChange} required />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Prezzo (€)</Form.Label>
        <Form.Control type="number" step="0.01" min="0" name="prezzo" value={form.prezzo} onChange={handleChange} required />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>
          Immagine copertina{miniatura && <span className="text-muted fw-normal"> — lascia vuoto per non cambiare</span>}
        </Form.Label>
        <Form.Control type="file" accept="image/*" onChange={(e) => setCopertina(e.target.files[0] ?? null)} required={!miniatura} />
      </Form.Group>
      <Form.Group className="mb-4">
        <Form.Label>
          Immagini aggiuntive (max 4){miniatura && <span className="text-muted fw-normal"> — lascia vuoto per non cambiare</span>}
        </Form.Label>
        <Form.Control type="file" accept="image/*" multiple onChange={(e) => setImmagini(Array.from(e.target.files).slice(0, 4))} />
      </Form.Group>
      <div className="d-flex gap-2 justify-content-end">
        <Button variant="outline-secondary" onClick={onClose} disabled={loading}>Annulla</Button>
        <Button variant="dark" type="submit" disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : miniatura ? 'Salva modifiche' : 'Aggiungi'}
        </Button>
      </div>
    </Form>
  );
}

function MiniaturaTab() {
  const [miniature, setMiniature] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    axiosClient
      .get('/miniature')
      .then((res) => setMiniature(res.data))
      .catch(() => setError('Errore nel caricamento delle miniature'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminare questa miniatura?')) return;
    try {
      await axiosClient.delete(`/miniature/${id}`);
      load();
    } catch {
      alert("Errore durante l'eliminazione");
    }
  };

  const handleStatoChange = async (id, stato) => {
    setMiniature((prev) => prev.map((m) => (m.id === id ? { ...m, stato } : m)));
    try {
      await axiosClient.patch(`/miniature/${id}/stato`, { stato });
    } catch {
      alert('Errore durante il cambio di stato');
      load();
    }
  };

  const openAdd = () => { setEditing(null); setShowModal(true); };
  const openEdit = (m) => { setEditing(m); setShowModal(true); };
  const onSaved = () => { setShowModal(false); load(); };

  if (loading) return <div className="text-center py-4"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <>
      <div className="d-flex justify-content-end mb-3">
        <Button variant="dark" onClick={openAdd}>+ Aggiungi miniatura</Button>
      </div>
      <Table hover responsive>
        <thead>
          <tr><th>Titolo</th><th>Prezzo</th><th>Stato</th><th></th></tr>
        </thead>
        <tbody>
          {miniature.map((m) => (
            <tr key={m.id}>
              <td>{m.titolo}</td>
              <td>€{Number(m.prezzo).toFixed(2)}</td>
              <td>
                <Form.Select
                  size="sm"
                  value={m.stato}
                  onChange={(e) => handleStatoChange(m.id, e.target.value)}
                  style={{ minWidth: '160px' }}
                >
                  <option value="DISPONIBILE">DISPONIBILE</option>
                  <option value="VENDUTA">VENDUTA</option>
                  <option value="NON_DISPONIBILE">NON_DISPONIBILE</option>
                </Form.Select>
              </td>
              <td>
                <div className="d-flex gap-2">
                  <Button size="sm" variant="outline-dark" onClick={() => openEdit(m)}>Modifica</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => handleDelete(m.id)}>Elimina</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editing ? 'Modifica miniatura' : 'Aggiungi miniatura'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MiniaturaForm key={editing?.id ?? 'new'} miniatura={editing} onSaved={onSaved} onClose={() => setShowModal(false)} />
        </Modal.Body>
      </Modal>
    </>
  );
}

function OrdiniTab() {
  const [ordini, setOrdini] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosClient
      .get('/ordini')
      .then((res) => setOrdini(res.data))
      .catch((err) => setError(err.response?.data?.message || `Errore ${err.response?.status ?? ''}: ${err.message}`))
      .finally(() => setLoading(false));
  }, []);

  const handleStatoChange = async (id, stato) => {
    try {
      await axiosClient.patch(`/ordini/${id}/stato`, { stato });
      setOrdini((prev) => prev.map((o) => (o.id === id ? { ...o, stato } : o)));
    } catch {
      alert('Errore durante il cambio di stato');
    }
  };

  const handleElimina = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo ordine?')) return;
    try {
      await axiosClient.delete(`/ordini/${id}`);
      setOrdini((prev) => prev.filter((o) => o.id !== id));
    } catch {
      alert("Errore durante l'eliminazione dell'ordine");
    }
  };

  if (loading) return <div className="text-center py-4"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Table hover responsive>
      <thead>
        <tr><th>ID</th><th>Username</th><th>Totale</th><th>Data</th><th>Stato</th><th></th></tr>
      </thead>
      <tbody>
        {ordini.map((o) => (
          <tr key={o.id}>
            <td className="text-muted small">{o.id.slice(0, 8)}…</td>
            <td>{o.username}</td>
            <td>€{Number(o.costoTotale).toFixed(2)}</td>
            <td>{new Date(o.createdAt).toLocaleDateString('it-IT')}</td>
            <td>
              <Form.Select size="sm" value={o.stato} onChange={(e) => handleStatoChange(o.id, e.target.value)} style={{ minWidth: '150px' }}>
                {STATI_ORDINE.map((s) => <option key={s} value={s}>{s}</option>)}
              </Form.Select>
            </td>
            <td>
              <Button size="sm" variant="danger" onClick={() => handleElimina(o.id)}>
                Elimina
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function CommissioniTab() {
  const [commissioni, setCommissioni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosClient
      .get('/commissioni')
      .then((res) => setCommissioni(res.data))
      .catch((err) => setError(err.response?.data?.message || `Errore ${err.response?.status ?? ''}: ${err.message}`))
      .finally(() => setLoading(false));
  }, []);

  const handleStatoChange = async (id, stato) => {
    try {
      await axiosClient.patch(`/commissioni/${id}/stato`, { stato });
      setCommissioni((prev) => prev.map((c) => (c.id === id ? { ...c, stato } : c)));
    } catch {
      alert('Errore durante il cambio di stato');
    }
  };

  if (loading) return <div className="text-center py-4"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Table hover responsive>
      <thead>
        <tr><th>ID</th><th>Username</th><th>Titolo</th><th>Budget</th><th>Stato</th></tr>
      </thead>
      <tbody>
        {commissioni.map((c) => (
          <tr key={c.id}>
            <td className="text-muted small">{c.id.slice(0, 8)}…</td>
            <td>{c.username}</td>
            <td>{c.titolo}</td>
            <td>€{Number(c.budget).toFixed(2)}</td>
            <td>
              <Form.Select size="sm" value={c.stato} onChange={(e) => handleStatoChange(c.id, e.target.value)} style={{ minWidth: '170px' }}>
                {STATI_COMMISSIONE.map((s) => <option key={s} value={s}>{s}</option>)}
              </Form.Select>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function ChatAdminTab() {
  const [utenti, setUtenti] = useState([]);
  const [loadingUtenti, setLoadingUtenti] = useState(true);
  const [utenteSelezionato, setUtenteSelezionato] = useState(null);
  const [messaggi, setMessaggi] = useState([]);
  const [testo, setTesto] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    axiosClient
      .get('/messaggi/admin/utenti')
      .then((res) => setUtenti(res.data))
      .catch(() => {})
      .finally(() => setLoadingUtenti(false));
  }, []);

  useEffect(() => {
    if (!utenteSelezionato) return;

    const fetchConv = () => {
      axiosClient
        .get(`/messaggi/admin/conversazione/${utenteSelezionato.id}`)
        .then((res) => setMessaggi(res.data))
        .catch(() => {});
    };

    fetchConv();
    const interval = setInterval(fetchConv, 5000);
    return () => clearInterval(interval);
  }, [utenteSelezionato]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messaggi]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!testo.trim() || !utenteSelezionato) return;
    setSending(true);
    try {
      await axiosClient.post(`/messaggi/admin/conversazione/${utenteSelezionato.id}`, { testo });
      setTesto('');
      const res = await axiosClient.get(`/messaggi/admin/conversazione/${utenteSelezionato.id}`);
      setMessaggi(res.data);
    } catch {
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-admin-layout">
      <div className="chat-admin-sidebar">
        {loadingUtenti ? (
          <div className="text-center py-3"><Spinner animation="border" size="sm" /></div>
        ) : utenti.length === 0 ? (
          <p className="text-muted small p-3">Nessun utente</p>
        ) : (
          utenti.map((u) => (
            <div
              key={u.id}
              className={`chat-admin-user-item${utenteSelezionato?.id === u.id ? ' active' : ''}`}
              onClick={() => { setUtenteSelezionato(u); setMessaggi([]); }}
            >
              {u.username}
            </div>
          ))
        )}
      </div>

      <div className="chat-admin-conversation">
        {!utenteSelezionato ? (
          <p className="text-muted text-center py-5">Seleziona un utente per vedere la conversazione</p>
        ) : (
          <>
            <div className="chat-admin-messages">
              {messaggi.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-message ${msg.mittenteId === utenteSelezionato.id ? 'chat-message--other' : 'chat-message--self'}`}
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
                placeholder={`Rispondi a ${utenteSelezionato.username}…`}
                size="sm"
                disabled={sending}
              />
              <Button type="submit" variant="dark" size="sm" disabled={sending || !testo.trim()}>
                {sending ? <Spinner animation="border" size="sm" /> : '→'}
              </Button>
            </Form>
          </>
        )}
      </div>
    </div>
  );
}

function AdminPage() {
  const { token } = useAuth();
  const [nonLetti, setNonLetti] = useState(0);

  useEffect(() => {
    if (!token) return;

    const fetchNonLetti = () => {
      axiosClient
        .get('/messaggi/admin/non-letti')
        .then((res) => setNonLetti(res.data))
        .catch(() => {});
    };

    fetchNonLetti();
    const interval = setInterval(fetchNonLetti, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const chatTitle = (
    <span>
      Chat{nonLetti > 0 && <Badge bg="danger" pill className="ms-1">{nonLetti}</Badge>}
    </span>
  );

  return (
    <Container className="py-4">
      <h1 className="mb-4">Pannello admin</h1>
      <Tabs defaultActiveKey="miniature" className="mb-4">
        <Tab eventKey="miniature" title="Miniature">
          <MiniaturaTab />
        </Tab>
        <Tab eventKey="ordini" title="Ordini">
          <OrdiniTab />
        </Tab>
        <Tab eventKey="commissioni" title="Commissioni">
          <CommissioniTab />
        </Tab>
        <Tab eventKey="chat" title={chatTitle}>
          <ChatAdminTab />
        </Tab>
      </Tabs>
    </Container>
  );
}

export default AdminPage;
