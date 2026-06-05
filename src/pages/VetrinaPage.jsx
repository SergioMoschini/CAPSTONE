import { useEffect, useState } from "react";
import { Container, Alert, Spinner } from "react-bootstrap";
import { motion } from "framer-motion";
import axiosClient from "../api/axiosClient";
import MiniaturaCarouselItem from "../components/miniature/MiniaturaCarouselItem";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const FILTRI = [
  { valore: "TUTTE", etichetta: "Tutte" },
  { valore: "DISPONIBILE", etichetta: "Disponibili" },
  { valore: "VENDUTA", etichetta: "Vendute" },
  { valore: "NON_DISPONIBILE", etichetta: "Non disponibili" },
];

function VetrinaPage() {
  const [miniature, setMiniature] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("TUTTE");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    axiosClient
      .get("/miniature")
      .then((res) => setMiniature(res.data))
      .catch(() => setError("Errore nel caricamento delle miniature"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" style={{ color: "var(--gold)" }} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const disponibili = miniature.filter((m) => m.stato === "DISPONIBILE").length;
  const filtrate = filtro === "TUTTE" ? miniature : miniature.filter((m) => m.stato === filtro);

  return (
    <Container className="py-4">
      <div className="vetrina-intro text-center mb-5">
        <p className="hero-eyebrow">Collezione artigianale</p>
        <h1 className="vetrina-intro-title">Vetrina</h1>
        <hr className="gold-divider" />
        <p className="vetrina-intro-desc">
          Ogni pezzo è dipinto a mano con cura e attenzione al dettaglio.
          Sfoglia la collezione e scopri le miniature disponibili.
        </p>
        {disponibili > 0 && (
          <p className="vetrina-intro-count">
            {disponibili} {disponibili === 1 ? "miniatura disponibile" : "miniature disponibili"}
          </p>
        )}
      </div>

      {miniature.length > 0 && (
        <div className="vetrina-filtri mb-4">
          {FILTRI.map(({ valore, etichetta }) => (
            <button
              key={valore}
              className={`filtro-pill${filtro === valore ? " active" : ""}`}
              onClick={() => { setFiltro(valore); setCurrentIndex(0); }}
            >
              {etichetta}
            </button>
          ))}
        </div>
      )}

      {filtrate.length === 0 ? (
        <p className="text-muted text-center py-4">Nessuna miniatura in questa categoria.</p>
      ) : (
        <motion.div
          className="vetrina-carousel-wrapper"
          variants={container}
          initial="hidden"
          animate="show"
          key={`${filtro}-${currentIndex}`}
        >
          <div className="d-flex align-items-center gap-3">
            {filtrate.length > 1 && (
              <button
                className="btn btn-outline-gold flex-shrink-0"
                onClick={() => setCurrentIndex((i) => (i - 1 + filtrate.length) % filtrate.length)}
              >
                ←
              </button>
            )}
            <motion.div className="flex-grow-1" variants={item}>
              <MiniaturaCarouselItem miniatura={filtrate[currentIndex]} />
            </motion.div>
            {filtrate.length > 1 && (
              <button
                className="btn btn-outline-gold flex-shrink-0"
                onClick={() => setCurrentIndex((i) => (i + 1) % filtrate.length)}
              >
                →
              </button>
            )}
          </div>
          {filtrate.length > 1 && (
            <p className="text-muted text-center mt-2 mb-0">
              {currentIndex + 1} / {filtrate.length}
            </p>
          )}
        </motion.div>
      )}
    </Container>
  );
}

export default VetrinaPage;
