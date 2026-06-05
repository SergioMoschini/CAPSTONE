import { useState } from "react";
import { Container, Row, Col, Button, Form, Alert, Spinner, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import axiosClient from "../api/axiosClient";

function CarrelloPage() {
  const { carrello, rimuoviDalCarrello, svuotaCarrello, totale } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [indirizzo, setIndirizzo] = useState(user?.indirizzo ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (carrello.length === 0) {
    return (
      <Container className="py-5 text-center">
        <p className="text-muted fs-5 mb-4">Il tuo carrello è vuoto.</p>
        <Link to="/vetrina" className="btn btn-gold">
          Vai alla vetrina
        </Link>
      </Container>
    );
  }

  const handlePagamento = async () => {
    setError("");
    setLoading(true);
    try {
      const ordineRes = await axiosClient.post("/ordini", {
        indirizzoSpedizione: indirizzo || "Da definire",
        miniature: carrello.map((item) => ({ miniaturaId: item.id, quantita: 1 })),
        commissioneIds: [],
      });
      const ordineId = ordineRes.data.id;

      const sessioneRes = await axiosClient.post("/pagamenti/checkout", { ordineId, importo: Math.round(totale * 100) });
      svuotaCarrello();
      window.location.href = sessioneRes.data.url;
    } catch (err) {
      setError(err.response?.data?.message || "Errore durante il pagamento. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4" style={{ maxWidth: "800px" }}>
      <h1 className="mb-4">Il tuo carrello</h1>

      <div className="mb-4">
        {carrello.map((item) => (
          <Row key={item.id} className="align-items-center py-3 border-bottom">
            <Col xs={2}>
              {item.immagineCopertina && (
                <img src={item.immagineCopertina} alt={item.titolo} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "6px" }} />
              )}
            </Col>
            <Col xs={5}>
              <p className="fw-semibold mb-0">{item.titolo}</p>
              <Badge bg="secondary" className="mt-1">
                Qtà: 1
              </Badge>
            </Col>
            <Col xs={3} className="text-end fw-semibold">
              €{Number(item.prezzo).toFixed(2)}
            </Col>
            <Col xs={1} className="text-end">
              <Button variant="link" className="text-danger p-0" onClick={() => rimuoviDalCarrello(item.id)} title="Rimuovi">
                ✕
              </Button>
            </Col>
          </Row>
        ))}
      </div>

      <div className="d-flex justify-content-end mb-4">
        <span className="fs-4 fw-bold">Totale: €{totale.toFixed(2)}</span>
      </div>

      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold">Indirizzo di spedizione</Form.Label>
        <Form.Control value={indirizzo} onChange={(e) => setIndirizzo(e.target.value)} placeholder="Via Roma 1, 00100 Roma" />
        <Form.Text className="text-muted">Modifica solo per questo ordine — non verrà salvato nel profilo.</Form.Text>
      </Form.Group>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="d-flex justify-content-between align-items-center">
        <Button variant="outline-secondary" onClick={() => navigate("/vetrina")}>
          ← Continua lo shopping
        </Button>
        <Button variant="dark" size="lg" onClick={handlePagamento} disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : "Procedi al pagamento"}
        </Button>
      </div>
    </Container>
  );
}

export default CarrelloPage;
