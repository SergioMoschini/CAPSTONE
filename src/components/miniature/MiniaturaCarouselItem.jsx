import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const DESCRIZIONE_LIMITE = 150;

const badgeConfig = {
  DISPONIBILE: { label: "Disponibile", cls: "slide-badge badge-disponibile" },
  VENDUTA: { label: "Venduta", cls: "slide-badge badge-venduta" },
  NON_DISPONIBILE: { label: "Non disponibile", cls: "slide-badge badge-non-disponibile" },
};

function MiniaturaCarouselItem({ miniatura }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { carrello, aggiungiAlCarrello } = useCart();

  const descrizione = miniatura.descrizione || "";
  const isLong = descrizione.length > DESCRIZIONE_LIMITE;
  const testo =
    !expanded && isLong ? descrizione.slice(0, DESCRIZIONE_LIMITE) + "..." : descrizione;

  const badge = badgeConfig[miniatura.stato];
  const mostraCarrello = miniatura.stato === "DISPONIBILE" && user && user.role !== "ADMIN";
  const nelCarrello = carrello.some((item) => item.id === miniatura.id);

  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: "0px 8px 24px rgba(0,0,0,0.3)" }}
      transition={{ duration: 0.2 }}
    >
    <div className="miniatura-slide">
      <div className="miniatura-slide-img-wrapper">
        {miniatura.immagineCopertina && (
          <img
            src={miniatura.immagineCopertina}
            alt={miniatura.titolo}
            className="miniatura-slide-img"
          />
        )}
        {badge && <span className={badge.cls}>{badge.label}</span>}
      </div>
      <div className="miniatura-slide-body">
        <h2 className="miniatura-slide-title">{miniatura.titolo}</h2>
        <p className="miniatura-slide-desc">
          {testo}
          {isLong && !expanded && (
            <span className="continua-link" onClick={() => setExpanded(true)}>
              {" "}CONTINUA A LEGGERE
            </span>
          )}
        </p>
        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-gold"
            onClick={() => navigate(`/vetrina/${miniatura.id}`)}
          >
            Scopri di più
          </button>
          {miniatura.stato === "DISPONIBILE" && (
            user && user.role !== "ADMIN" ? (
              <button
                className="btn btn-outline-gold"
                onClick={() => aggiungiAlCarrello(miniatura)}
                disabled={nelCarrello}
              >
                {nelCarrello ? 'Nel carrello' : '+ Carrello'}
              </button>
            ) : !user && (
              <Link to="/login" className="small" style={{ color: 'var(--gold)', alignSelf: 'center' }}>
                Registrati o accedi per acquistare
              </Link>
            )
          )}
        </div>
      </div>
    </div>
    </motion.div>
  );
}

export default MiniaturaCarouselItem;
