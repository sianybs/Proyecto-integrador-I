import { Button, Card, Col, Container, Row } from "react-bootstrap";

export default function Ubicacion() {
  return (
    <main className="pagina-informativa ubicacion-pagina">
      <section className="info-hero">
        <span className="info-etiqueta">Estamos cerca de vos</span>
        <h1>Visítanos en Vet-Care</h1>
        <p>Un lugar pensado para cuidar a tus mascotas y brindarles la atención que merecen.</p>
      </section>

      <Container className="info-contenido">
        <Row className="g-4 align-items-stretch">
          <Col lg={7}>
            <Card className="mapa-card h-100 border-0">
              <iframe
                title="Ubicación de Vet-Care en El Roble, Puntarenas"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-84.8500%2C9.9500%2C-84.7300%2C10.0100&layer=mapnik"
                loading="lazy"
              />
              <Card.Body>
                <span className="info-icono">⌖</span>
                <div>
                  <Card.Title as="h2">El Roble, Puntarenas</Card.Title>
                  <Card.Text>Costa Rica · Fácil acceso para vehículos</Card.Text>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={5}>
            <div className="detalle-ubicacion h-100">
              <Card className="info-card border-0">
                <Card.Body>
                  <span className="info-icono">⌂</span>
                  <div><h3>Dirección</h3><p>El Roble, Puntarenas, Costa Rica.</p></div>
                </Card.Body>
              </Card>
              <Card className="info-card border-0">
                <Card.Body>
                  <span className="info-icono">◷</span>
                  <div><h3>Horario de atención</h3><p>Lunes a sábado, de 8:00 a.m. a 4:00 p.m.</p></div>
                </Card.Body>
              </Card>
              <Card className="info-card border-0">
                <Card.Body>
                  <span className="info-icono">➜</span>
                  <div><h3>Cómo llegar</h3><p>A pocos minutos del centro de Puntarenas.</p></div>
                </Card.Body>
              </Card>
              <Button
                as="a"
                href="https://www.google.com/maps/search/?api=1&query=El+Roble+Puntarenas+Costa+Rica"
                target="_blank"
                rel="noreferrer"
                className="info-boton-principal"
              >
                Abrir indicaciones en el mapa
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </main>
  );
}
