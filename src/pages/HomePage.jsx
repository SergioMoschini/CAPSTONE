import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import AOS from 'aos';
import 'aos/dist/aos.css';

function HomePage() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <>
      <section className="chi-sono-section" data-aos="fade-right">
        <Container>
          <div className="text-center mb-5">
            <img src="/logo.png" alt="Mowski Miniatures" className="hero-logo mb-4" />
            <h2 className="vetrina-intro-title">Chi sono</h2>
            <hr className="gold-divider" />
          </div>
          <Row className="align-items-center justify-content-center">
            <Col md={5} className="text-center mb-4 mb-md-0" data-aos="fade-left">
              <img
                src="/artist.jpg"
                alt="Mowski"
                className="chi-sono-img"
              />
            </Col>
            <Col md={6}>
              <p className="chi-sono-testo">
                Sono Sergio, un pittore di miniature appassionato di Warhammer 40.000
                e fantasy. Dipingo a mano ogni pezzo con cura e attenzione al dettaglio,
                dal livello tabletop al display. Ogni miniatura è un progetto unico,
                realizzato con passione e dedizione.
              </p>
              <p className="chi-sono-testo">
                Accetto commissioni per singole miniature, interi eserciti e scenografia.
                Contattami per un preventivo personalizzato.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      <div className="sezione-divider">
        <span className="sezione-divider-line" />
        <span className="sezione-divider-icon">⚔</span>
        <span className="sezione-divider-line" />
      </div>

      <section className="hero-section mb-5">
        <Container className="text-center position-relative">
          <h1
            className="hero-title"
            style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2.4rem)' }}
            data-aos="fade-down"
          >
            Miniature Dipinte<br />su Commissione
          </h1>
          <hr className="gold-divider" />
          <p className="hero-subtitle mb-5" data-aos="fade-up" data-aos-delay="200">
            Ogni miniatura è un&apos;opera unica, dipinta a mano con cura e precisione.
            Esplora la vetrina o richiedi un lavoro personalizzato.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/vetrina" className="btn btn-gold">
              Esplora la Vetrina
            </Link>
            <Link to="/commissioni" className="btn btn-outline-gold">
              Richiedi una Commissione
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}

export default HomePage;
