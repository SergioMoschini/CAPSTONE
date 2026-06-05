import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Spinner, Alert } from "react-bootstrap";
import axiosClient from "../api/axiosClient";

function MiniatureDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [miniatura, setMiniatura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosClient
      .get(`/miniature/${id}`)
      .then((res) => setMiniatura(res.data))
      .catch(() => setError("Errore nel caricamento della miniatura"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" style={{ color: "var(--gold)" }} />
      </Container>
    );
  }

  if (error || !miniatura) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || "Miniatura non trovata"}</Alert>
      </Container>
    );
  }

  const images = [
    ...(miniatura.immagineCopertina ? [miniatura.immagineCopertina] : []),
    ...(Array.isArray(miniatura.immagini) ? miniatura.immagini : []),
  ];

  return (
    <Container className="py-5 detail-page">
      <button className="btn btn-outline-gold mb-4" onClick={() => navigate(-1)}>
        ← Torna alla vetrina
      </button>

      <h1 className="detail-title mb-4">{miniatura.titolo}</h1>

      {images.length > 0 && (
        <div className="detail-images-grid mb-5">
          {images.map((image, idx) => (
            <img
              key={idx}
              src={image}
              alt={`${miniatura.titolo} - foto ${idx + 1}`}
              className="detail-image"
            />
          ))}
        </div>
      )}

      <div className="detail-info">
        <p className="detail-prezzo">€{Number(miniatura.prezzo).toFixed(2)}</p>
        <p className="detail-descrizione">{miniatura.descrizione}</p>
      </div>
    </Container>
  );
}

export default MiniatureDetailPage;
