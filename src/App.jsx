import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import NavBar from './components/common/NavBar';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VetrinaPage from './pages/VetrinaPage';
import MiniatureDettaglioPage from './pages/MiniatureDettaglioPage';
import CommissionePage from './pages/CommissionePage';
import ProfiloPage from './pages/ProfiloPage';
import PagamentoPage from './pages/PagamentoPage';
import OrdineConfermatoPage from './pages/OrdineConfermatoPage';
import AdminPage from './pages/AdminPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CarrelloPage from './pages/CarrelloPage';
import ChatWidget from './components/common/ChatWidget';

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { token, user, loading } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (loading) return null;
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
}

function Layout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className={`d-flex flex-column min-vh-100${isAdmin ? ' admin-layout' : ''}`}>
      <NavBar />
      <main className="flex-grow-1 d-flex flex-column">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
            <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />
            <Route path="/vetrina" element={<PageWrapper><VetrinaPage /></PageWrapper>} />
            <Route path="/vetrina/:id" element={<PageWrapper><MiniatureDettaglioPage /></PageWrapper>} />
            <Route path="/commissioni" element={<PageWrapper><CommissionePage /></PageWrapper>} />
            <Route path="/profilo" element={<PageWrapper><PrivateRoute><ProfiloPage /></PrivateRoute></PageWrapper>} />
            <Route path="/pagamento" element={<PageWrapper><PrivateRoute><PagamentoPage /></PrivateRoute></PageWrapper>} />
            <Route path="/ordine-confermato" element={<PageWrapper><OrdineConfermatoPage /></PageWrapper>} />
            <Route path="/admin" element={<PageWrapper><AdminRoute><AdminPage /></AdminRoute></PageWrapper>} />
            <Route path="/reset-password" element={<PageWrapper><ResetPasswordPage /></PageWrapper>} />
            <Route path="/carrello" element={<PageWrapper><PrivateRoute><CarrelloPage /></PrivateRoute></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
