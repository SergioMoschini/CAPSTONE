import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

function NavBar() {
  const { user, logout } = useAuth();
  const { numeroArticoli } = useCart();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="navbar-brand-gold">
          Mowski Miniatures
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto align-items-center">
            {pathname !== "/vetrina" && (
              <Nav.Link as={Link} to="/vetrina">Vetrina</Nav.Link>
            )}
            {pathname !== "/vetrina" && pathname !== "/commissioni" && (
              <span className="nav-separator">|</span>
            )}
            {pathname !== "/commissioni" && (
              <Nav.Link as={Link} to="/commissioni">Commissioni</Nav.Link>
            )}
          </Nav>
          <Nav className="align-items-center gap-2">
            {user ? (
              <>
                {user.role !== 'ADMIN' && (
                  <Nav.Link as={Link} to="/carrello" className="cart-nav-link">
                    🛒
                    {numeroArticoli > 0 && (
                      <motion.span
                        key={numeroArticoli}
                        className="cart-badge"
                        initial={{ scale: 1.5 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {numeroArticoli}
                      </motion.span>
                    )}
                  </Nav.Link>
                )}
                {user.role === 'ADMIN' && (
                  <Nav.Link as={Link} to="/admin">Admin</Nav.Link>
                )}
                <Nav.Link as={Link} to="/profilo">
                  {user.username}
                </Nav.Link>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Registrati
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
