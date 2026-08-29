import { useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

const FORM_VACIO = {
  Nombre: '',
  Especie: '',
  Raza: '',
  EdadAnimal: '',
};

export default function MisMascotas() {
  const { usuario } = useAuth();

  const [mascotas, setMascotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [desactivando, setDesactivando] = useState(false);

  const [mascotaEditando, setMascotaEditando] = useState(null);
  const [mascotaDesactivando, setMascotaDesactivando] =
    useState(null);

  const [form, setForm] = useState(FORM_VACIO);

  const [error, setError] = useState('');
  const [errorEdicion, setErrorEdicion] = useState('');
  const [errorDesactivacion, setErrorDesactivacion] =
    useState('');
  const [exito, setExito] = useState('');

  useEffect(() => {
    async function cargarMascotas() {
      try {
        setError('');

        const { data } = await axiosClient.get(
          `/mascotas/cliente/${usuario.id}`
        );

        setMascotas(data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'No se pudieron cargar tus mascotas.'
        );
      } finally {
        setCargando(false);
      }
    }

    cargarMascotas();
  }, [usuario.id]);

  function abrirEdicion(mascota) {
    setMascotaEditando(mascota);

    setForm({
      Nombre: mascota.Nombre || '',
      Especie: mascota.Especie || '',
      Raza: mascota.Raza || '',
      EdadAnimal: mascota.EdadAnimal || '',
    });

    setErrorEdicion('');
    setExito('');
  }

  function cerrarEdicion() {
    if (guardando) {
      return;
    }

    setMascotaEditando(null);
    setForm(FORM_VACIO);
    setErrorEdicion('');
  }

  function manejarCambio(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function guardarMascota(e) {
    e.preventDefault();
    setErrorEdicion('');

    if (!form.Nombre.trim() || !form.Especie) {
      setErrorEdicion(
        'El nombre y la especie son obligatorios.'
      );
      return;
    }

    setGuardando(true);

    try {
      const { data } = await axiosClient.put(
        `/mascotas/mi-mascota/${mascotaEditando.IdMascota}`,
        {
          Nombre: form.Nombre,
          Especie: form.Especie,
          Raza: form.Raza,
          EdadAnimal: form.EdadAnimal,
        }
      );

      setMascotas((mascotasActuales) =>
        mascotasActuales.map((mascota) =>
          mascota.IdMascota === data.mascota.IdMascota
            ? data.mascota
            : mascota
        )
      );

      setExito(data.message);
      setMascotaEditando(null);
      setForm(FORM_VACIO);
    } catch (err) {
      setErrorEdicion(
        err.response?.data?.message ||
          'No se pudo actualizar la mascota.'
      );
    } finally {
      setGuardando(false);
    }
  }

  function abrirDesactivacion(mascota) {
    setMascotaDesactivando(mascota);
    setErrorDesactivacion('');
    setExito('');
  }

  function cerrarDesactivacion() {
    if (desactivando) {
      return;
    }

    setMascotaDesactivando(null);
    setErrorDesactivacion('');
  }

  async function confirmarDesactivacion() {
    setErrorDesactivacion('');
    setDesactivando(true);

    try {
      const { data } = await axiosClient.patch(
        `/mascotas/mi-mascota/${mascotaDesactivando.IdMascota}/desactivar`
      );

      setMascotas((mascotasActuales) =>
        mascotasActuales.filter(
          (mascota) =>
            mascota.IdMascota !==
            mascotaDesactivando.IdMascota
        )
      );

      setExito(data.message);
      setMascotaDesactivando(null);
    } catch (err) {
      setErrorDesactivacion(
        err.response?.data?.message ||
          'No se pudo eliminar la mascota del perfil.'
      );
    } finally {
      setDesactivando(false);
    }
  }

  return (
    <main className="pagina-publica-ancho py-4">
      <div className="mb-4">
        <h1>Mis mascotas</h1>

        <p className="subtitulo">
          Consulta y actualiza las mascotas registradas en tu cuenta.
        </p>
      </div>

      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      {exito && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setExito('')}
        >
          {exito}
        </Alert>
      )}

      {cargando && (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" />

          <p className="mt-3">
            Cargando tus mascotas...
          </p>
        </div>
      )}

      {!cargando && !error && mascotas.length === 0 && (
        <Alert variant="info">
          No tienes mascotas activas registradas. Puedes registrar una
          cuando agendes una cita.
        </Alert>
      )}

      {!cargando && !error && mascotas.length > 0 && (
        <Row className="g-4">
          {mascotas.map((mascota) => (
            <Col
              key={mascota.IdMascota}
              xs={12}
              md={6}
              lg={4}
            >
              <Card className="h-100 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <Card.Title className="mb-0">
                      {mascota.Nombre}
                    </Card.Title>

                    <Badge bg="danger">
                      {mascota.Especie}
                    </Badge>
                  </div>

                  <Card.Text>
                    <strong>Raza:</strong>{' '}
                    {mascota.Raza || 'No especificada'}
                  </Card.Text>

                  <Card.Text>
                    <strong>Edad:</strong>{' '}
                    {mascota.EdadAnimal || 'No especificada'}
                  </Card.Text>

                  <div className="d-flex gap-2 mt-auto pt-3">
                    <Button
                      type="button"
                      variant="outline-danger"
                      size="sm"
                      onClick={() => abrirEdicion(mascota)}
                    >
                      Modificar
                    </Button>

                    <Button
                      type="button"
                      variant="outline-secondary"
                      size="sm"
                      onClick={() =>
                        abrirDesactivacion(mascota)
                      }
                    >
                      Eliminar del perfil
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Cuadro para modificar la mascota */}
      <Modal
        show={Boolean(mascotaEditando)}
        onHide={cerrarEdicion}
        centered
      >
        <Form onSubmit={guardarMascota}>
          <Modal.Header closeButton>
            <Modal.Title>
              Modificar mascota
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {errorEdicion && (
              <Alert variant="danger">
                {errorEdicion}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>

              <Form.Control
                name="Nombre"
                value={form.Nombre}
                onChange={manejarCambio}
                maxLength={35}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Especie</Form.Label>

              <Form.Select
                name="Especie"
                value={form.Especie}
                onChange={manejarCambio}
                required
              >
                <option value="">
                  Selecciona una especie
                </option>
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Conejo">Conejo</option>
                <option value="Roedor">Roedor</option>
                <option value="Loro">Loro</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Raza</Form.Label>

              <Form.Control
                name="Raza"
                value={form.Raza}
                onChange={manejarCambio}
                maxLength={25}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Edad</Form.Label>

              <Form.Control
                name="EdadAnimal"
                value={form.EdadAnimal}
                onChange={manejarCambio}
                maxLength={15}
                placeholder="Ej. 3 años"
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button
              type="button"
              variant="outline-secondary"
              onClick={cerrarEdicion}
              disabled={guardando}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="danger"
              disabled={guardando}
            >
              {guardando
                ? 'Guardando...'
                : 'Guardar cambios'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Confirmación para desactivar la mascota */}
      <Modal
        show={Boolean(mascotaDesactivando)}
        onHide={cerrarDesactivacion}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Eliminar mascota del perfil
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {errorDesactivacion && (
            <Alert variant="danger">
              {errorDesactivacion}
            </Alert>
          )}

          <p>
            ¿Seguro que deseas eliminar del perfil a{' '}
            <strong>
              {mascotaDesactivando?.Nombre}
            </strong>
            ?
          </p>

          <Alert variant="warning" className="mb-0">
            La mascota dejará de aparecer para nuevas citas, pero sus
            citas anteriores y su historial médico se conservarán.
          </Alert>
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="button"
            variant="outline-secondary"
            onClick={cerrarDesactivacion}
            disabled={desactivando}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={confirmarDesactivacion}
            disabled={desactivando}
          >
            {desactivando
              ? 'Eliminando...'
              : 'Sí, eliminar del perfil'}
          </Button>
        </Modal.Footer>
      </Modal>
    </main>
  );
}