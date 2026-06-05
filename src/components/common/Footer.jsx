import { Container } from "react-bootstrap";

function Footer() {
  return (
    <footer className="bg-dark text-light py-3 mt-auto">
      <Container className="text-center">
        <small>&copy; {new Date().getFullYear()} MowskiMiniatures — Miniature dipinte su commissione</small>
      </Container>
    </footer>
  );
}

export default Footer;
