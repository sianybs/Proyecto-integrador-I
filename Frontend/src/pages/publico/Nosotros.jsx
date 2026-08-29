import { Link } from "react-router-dom";
import { Button, Card, Col, Container, Row } from "react-bootstrap";

export default function Nosotros() {
  return (
    <main className="nosotros-original">
      <section className="nosotros-original-hero">
        <div>
          <h1>¿Quiénes Somos?</h1>
          <p>Un espacio de amor, salud y esperanza para los animales de Costa Rica</p>
        </div>
      </section>

      <Container className="nosotros-original-contenido">
        <Row className="justify-content-center mb-5">
          <Col lg={9}>
            <Card className="nosotros-historia-card border-0 shadow">
              <Card.Body className="p-4 p-md-5">
                <h2>Nuestra Historia</h2>
                <p>
                  Vet-Care nació con el sueño de cuidar la salud de las mascotas
                  y dar una segunda oportunidad a perros y gatos en condición de
                  abandono. Lo que comenzó como un esfuerzo lleno de vocación hoy
                  reúne una clínica veterinaria y un refugio comprometidos con el
                  bienestar de cada animal.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <section className="nosotros-proposito">
          <h2>Nuestro Propósito</h2>

          <Row className="g-4 proposito-grid">
            <Col lg={4} md={6}>
              <Card className="proposito-card h-100 border-0 shadow">
                <Row className="g-0 h-100">
                  <Col md={4}>
                    <Card.Img src="/imagenes/nosotros-patita.webp" alt="Misión de Vet-Care" />
                  </Col>
                  <Col md={8}>
                    <Card.Body>
                      <Card.Title as="h3">Misión</Card.Title>
                      <Card.Text>
                        Proteger y brindar atención integral a los animales,
                        promoviendo la salud, la adopción responsable y la
                        tenencia consciente.
                      </Card.Text>
                    </Card.Body>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col lg={4} md={6}>
              <Card className="proposito-card h-100 border-0 shadow">
                <Row className="g-0 h-100">
                  <Col md={4}>
                    <Card.Img src="/imagenes/nosotros-equipo.jpg" alt="Visión de Vet-Care" />
                  </Col>
                  <Col md={8}>
                    <Card.Body>
                      <Card.Title as="h3">Visión</Card.Title>
                      <Card.Text>
                        Ser una organización de referencia en Costa Rica, donde
                        la atención veterinaria y el refugio trabajen unidos por
                        cada vida.
                      </Card.Text>
                    </Card.Body>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col lg={4} md={6}>
              <Card className="proposito-card h-100 border-0 shadow">
                <Row className="g-0 h-100">
                  <Col md={4}>
                    <Card.Img src="/imagenes/nosotros-nina.webp" alt="Valores de Vet-Care" />
                  </Col>
                  <Col md={8}>
                    <Card.Body>
                      <Card.Title as="h3">Valores</Card.Title>
                      <ul>
                        <li>Compasión</li>
                        <li>Responsabilidad</li>
                        <li>Compromiso</li>
                        <li>Trabajo en equipo</li>
                        <li>Amor y respeto por cada vida</li>
                      </ul>
                    </Card.Body>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </section>

        <section className="nosotros-que-hacemos">
          <h2>¿Qué Hacemos?</h2>
          <div className="que-hacemos-grid">
            <article>
              <span>♡</span>
              <strong>Rescate</strong>
              <small>Ayudamos a animales en abandono o vulnerabilidad</small>
            </article>
            <article>
              <span>+</span>
              <strong>Atención Veterinaria</strong>
              <small>Consultas, diagnósticos, tratamientos y seguimiento</small>
            </article>
            <article>
              <span>⌂</span>
              <strong>Adopciones Responsables</strong>
              <small>Un proceso cuidadoso para encontrar un hogar definitivo</small>
            </article>
          </div>
        </section>

        <section className="nosotros-original-accion">
          <h2>También puedes ser parte de esta historia</h2>
          <p>Conoce a nuestros animales o ayúdanos a continuar cuidándolos.</p>
          <div>
            <Button as={Link} to="/refugio/catalogo" className="boton-area boton-refugio">
              Ver animales disponibles
            </Button>
            <Button as={Link} to="/donar" className="boton-area nosotros-boton-donar">
              Quiero donar
            </Button>
          </div>
        </section>
      </Container>
    </main>
  );
}
