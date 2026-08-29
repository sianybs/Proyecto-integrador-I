import { Button, Card, Col, Container, Row } from "react-bootstrap";

export default function Contacto() {
  return (
    <main className="pagina-informativa contacto-pagina">
      <section className="info-hero">
        <span className="info-etiqueta">Conversemos</span>
        <h1>Estamos para ayudarte</h1>
        <p>Si tenés dudas sobre nuestros servicios, citas o adopciones, comunícate con nosotros.</p>
      </section>

      <Container className="info-contenido">
        <Row className="g-4 justify-content-center">
          <Col md={6} lg={4}>
            <Card className="contacto-card h-100 border-0">
              <Card.Body>
                <span className="contacto-icono">☎</span>
                <h2>Teléfono</h2>
                <p>Atención directa durante nuestro horario de servicio.</p>
                <Button as="a" href="tel:22222222" className="contacto-enlace">2222-2222</Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4}>
            <Card className="contacto-card h-100 border-0 contacto-card-destacada">
              <Card.Body>
                <span className="contacto-icono">✉</span>
                <h2>Correo electrónico</h2>
                <p>Escribinos y responderemos tu consulta lo antes posible.</p>
                <Button as="a" href="mailto:vetcare1317@gmail.com" className="contacto-enlace">
                  vetcare1317@gmail.com
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4}>
            <Card className="contacto-card h-100 border-0">
              <Card.Body>
                <span className="contacto-icono">⌖</span>
                <h2>Visítanos</h2>
                <p>El Roble, Puntarenas, Costa Rica.</p>
                <Button as="a" href="/ubicacion" className="contacto-enlace">Ver ubicación</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <section className="contacto-aviso">
          <div><strong>Horario</strong><span>Lunes a sábado · 8:00 a.m. a 4:00 p.m.</span></div>
          <div><strong>Emergencias</strong><span>Llámanos para recibir orientación inmediata.</span></div>
        </section>
      </Container>
    </main>
  );
}
