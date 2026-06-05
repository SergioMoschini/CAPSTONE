import { Card, Badge } from "react-bootstrap";

const badgeVariant = {
  DISPONIBILE: "success",
  VENDUTA: "secondary",
  NON_DISPONIBILE: "warning",
};

function MiniaturaCard({ miniatura }) {
  return (
    <Card className="h-100 miniatura-card">
      {miniatura.immagineCopertina && <Card.Img variant="top" src={miniatura.immagineCopertina} alt={miniatura.titolo} style={{ height: "200px", objectFit: "cover" }} />}
      <Card.Body className="d-flex flex-column">
        <Card.Title>{miniatura.titolo}</Card.Title>
        <Card.Text className="text-muted flex-grow-1">{miniatura.descrizione}</Card.Text>
        <div className="d-flex justify-content-between align-items-center mt-2">
          <strong>€{Number(miniatura.prezzo).toFixed(2)}</strong>
          <Badge bg={badgeVariant[miniatura.stato] ?? "secondary"}>{miniatura.stato}</Badge>
        </div>
      </Card.Body>
    </Card>
  );
}

export default MiniaturaCard;
