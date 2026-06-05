import { useState } from "react";
import { Container, Form, Button, Alert, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import { useFadeIn } from "../hooks/useFadeIn";

const PASSI = [
  {
    numero: "01",
    titolo: "Descrivi il progetto",
    testo: "Racconta cosa vuoi: il soggetto, il capitolo, i colori, lo stile. Più dettagli fornisci, meglio posso capire la tua visione.",
  },
  {
    numero: "02",
    titolo: "Ricevi un preventivo",
    testo: "Analizzo la richiesta e ti rispondo con tempi e costi. Nessun impegno fino alla tua conferma.",
  },
  {
    numero: "03",
    titolo: "La miniatura prende vita",
    testo: "Lavoro sul pezzo con cura e comunico costanti aggiornamenti con foto durante il processo.",
  },
];

const COSA_PUOI_RICHIEDERE = [
  "Singole miniature o interi eserciti",
  "Qualsiasi fazione, capitolo o esercito di Warhammer",
  "Basi personalizzate e scenografia",
  "Conversioni e kitbash su richiesta",
  "Diversi livelli di dettaglio: tabletop, avanzato o display",
];

function CommissionePage() {
  const [form, setForm] = useState({ titolo: "", descrizione: "", budget: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  useFadeIn();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate("/login");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await axiosClient.post("/commissioni", { ...form, budget: Number(form.budget) });
      setSuccess("Commissione inviata! Ti contatteremo presto.");
      setForm({ titolo: "", descrizione: "", budget: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Errore nell'invio della commissione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5 d-flex flex-column align-items-center">
      <div className="commissione-intro text-center mb-5 fade-in-up">
        <p className="hero-eyebrow">Su misura per te</p>
        <h1 className="vetrina-intro-title mb-3">Commissioni</h1>
        <hr className="gold-divider" />
        <p className="vetrina-intro-desc">
          Hai in mente una miniatura specifica ma non sai da dove cominciare? Commissionala direttamente a me. Ogni pezzo viene dipinto a mano, con attenzione
          al dettaglio e fedeltà alla tua richiesta.
        </p>
      </div>

      <div className="commissione-card mb-5 w-100 fade-in-up" style={{ maxWidth: "680px" }}>
        <h2 className="commissione-section-title mb-4">Cosa puoi richiedere</h2>
        <ul className="commissione-list">
          {COSA_PUOI_RICHIEDERE.map((voce, i) => (
            <li key={i} className="commissione-list-item">
              <span className="commissione-bullet">◆</span>
              {voce}
            </li>
          ))}
        </ul>
      </div>

      <div className="w-100 mb-5 fade-in-up" style={{ maxWidth: "680px" }}>
        <h2 className="commissione-section-title mb-4 text-center">Come funziona</h2>
        <div className="commissione-passi">
          {PASSI.map((passo) => (
            <div key={passo.numero} className="commissione-passo">
              <span className="passo-numero">{passo.numero}</span>
              <div>
                <p className="passo-titolo">{passo.titolo}</p>
                <p className="passo-testo">{passo.testo}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-100 text-center mb-3" style={{ maxWidth: "600px" }}>
        <hr className="gold-divider" />
        <h2 className="commissione-section-title mt-3">Invia la tua richiesta</h2>
      </div>
      <Card className="p-4 page-card w-100 fade-in-up" style={{ maxWidth: "600px" }}>
        {!token && <Alert variant="info">Devi essere loggato per inviare una commissione.</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Titolo</Form.Label>
            <Form.Control type="text" name="titolo" value={form.titolo} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Descrizione</Form.Label>
            <Form.Control as="textarea" rows={4} name="descrizione" value={form.descrizione} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Budget (€)</Form.Label>
            <Form.Control type="number" step="0.01" min="0" name="budget" value={form.budget} onChange={handleChange} required />
          </Form.Group>
          <Button type="submit" variant="dark" disabled={loading || !token}>
            {loading ? "Invio..." : "Invia Richiesta"}
          </Button>
        </Form>
      </Card>
    </Container>
  );
}

export default CommissionePage;
