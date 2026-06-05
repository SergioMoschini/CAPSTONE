import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [carrello, setCarrello] = useState([]);

  const aggiungiAlCarrello = (miniatura) => {
    if (!localStorage.getItem('token')) return;
    setCarrello((prev) => {
      if (prev.some((item) => item.id === miniatura.id)) return prev;
      return [
        ...prev,
        {
          id: miniatura.id,
          titolo: miniatura.titolo,
          prezzo: miniatura.prezzo,
          immagineCopertina: miniatura.immagineCopertina,
          quantita: 1,
        },
      ];
    });
  };

  const rimuoviDalCarrello = (id) =>
    setCarrello((prev) => prev.filter((item) => item.id !== id));

  const cambiaQuantita = (id, quantita) => {
    if (quantita < 1) return;
    setCarrello((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantita } : item))
    );
  };

  const svuotaCarrello = () => setCarrello([]);

  const totale = carrello.reduce((sum, item) => sum + Number(item.prezzo) * item.quantita, 0);
  const numeroArticoli = carrello.reduce((sum, item) => sum + item.quantita, 0);

  return (
    <CartContext.Provider
      value={{ carrello, aggiungiAlCarrello, rimuoviDalCarrello, cambiaQuantita, svuotaCarrello, totale, numeroArticoli }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
