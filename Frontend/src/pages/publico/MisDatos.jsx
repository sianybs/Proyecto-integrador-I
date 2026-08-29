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
  NombreCompleto: '',
  Cedula: '',
  Telefono: '',
  CorreoElectronico: '',
};

const FORM_CONTRASENA_VACIO = {
  ContrasenaActual: '',
  NuevaContrasena: '',
  ConfirmarContrasena: '',
};

export default function MisDatos() {
  const { usuario, actualizarUsuario } = useAuth();

  const [form, setForm] = useState(FORM_VACIO);
  const [datosGuardados, setDatosGuardados] =
    useState(FORM_VACIO);

  const [formContrasena, setFormContrasena] = useState(
    FORM_CONTRASENA_VACIO
  );

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cambiandoContrasena, setCambiandoContrasena] =
    useState(false);

  const [editando, setEditando] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] =
    useState(false);

  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [errorContrasena, setErrorContrasena] = useState('');

  useEffect(() => {
    async function cargarPerfil() {
      try {
        setError('');

        const { data } = await axiosClient.get(
          '/clientes/mi-perfil'
        );

        const datosPerfil = {
          NombreCompleto: data.NombreCompleto || '',
          Cedula: data.Cedula || '',
          Telefono: data.Telefono || '',
          CorreoElectronico: data.CorreoElectronico || '',
        };

        setForm(datosPerfil);
        setDatosGuardados(datosPerfil);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'No se pudo cargar tu información.'
        );
      } finally {
        setCargando(false);
      }
    }

    cargarPerfil();
  }, []);

  function manejarCambio(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function iniciarEdicion() {
    setForm(datosGuardados);
    setError('');
    setExito('');
    setEditando(true);
  }

  function cancelarEdicion() {
    setForm(datosGuardados);
    setError('');
    setEditando(false);
  }

  async function guardarCambios(e) {
    e.preventDefault();
    setError('');
    setExito('');

    if (!/^\d{8}$/.test(form.Telefono)) {
      setError(
        'El teléfono debe contener exactamente 8 números.'
      );
      return;
    }

    setGuardando(true);

    try {
      const { data } = await axiosClient.put(
        '/clientes/mi-perfil',
        {
          NombreCompleto: form.NombreCompleto,
          Telefono: form.Telefono,
          CorreoElectronico: form.CorreoElectronico,
        }
      );

      setDatosGuardados(form);
      actualizarUsuario(data.usuario);
      setExito(data.message);
      setEditando(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'No se pudo actualizar tu información.'
      );
    } finally {
      setGuardando(false);
    }
  }

  function abrirCambioContrasena() {
    setFormContrasena(FORM_CONTRASENA_VACIO);
    setErrorContrasena('');
    setExito('');
    setMostrarContrasena(true);
  }

  function cerrarCambioContrasena() {
    if (cambiandoContrasena) {
      return;
    }

    setFormContrasena(FORM_CONTRASENA_VACIO);
    setErrorContrasena('');
    setMostrarContrasena(false);
  }

  function manejarCambioContrasena(e) {
    setFormContrasena({
      ...formContrasena,
      [e.target.name]: e.target.value,
    });
  }

  async function guardarContrasena(e) {
    e.preventDefault();
    setErrorContrasena('');

    if (formContrasena.NuevaContrasena.length < 6) {
      setErrorContrasena(
        'La nueva contraseña debe tener al menos 6 caracteres.'
      );
      return;
    }

    if (
      formContrasena.NuevaContrasena !==
      formContrasena.ConfirmarContrasena
    ) {
      setErrorContrasena(
        'La nueva contraseña y su confirmación no coinciden.'
      );
      return;
    }

    setCambiandoContrasena(true);

    try {
      const { data } = await axiosClient.patch(
        '/clientes/mi-perfil/contrasena',
        formContrasena
      );

      setExito(data.message);
      setFormContrasena(FORM_CONTRASENA_VACIO);
      setMostrarContrasena(false);
    } catch (err) {
      setErrorContrasena(
        err.response?.data?.message ||
          'No se pudo cambiar la contraseña.'
      );
    } finally {
      setCambiandoContrasena(false);
    }
  }

  if (cargando) {
    return (
      <main className="pagina-publica-ancho py-5 text-center">
        <Spinner animation="border" role="status" />
        <p className="mt-3">
          Cargando tu información...
        </p>
      </main>
    );
  }

  return (
    <main className="pagina-publica-ancho py-4">
      <div className="mb-4">
        <h1>Mis datos</h1>

        <p className="subtitulo">
          Consulta y actualiza la información de tu cuenta.
        </p>
      </div>

      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <strong>Información personal</strong>{' '}

            <Badge bg="danger">
              {usuario.rol}
            </Badge>
          </div>

          {!editando && (
            <div className="d-flex gap-2">
              <Button
                type="button"
                variant="outline-secondary"
                size="sm"
                onClick={abrirCambioContrasena}
              >
                Cambiar contraseña
              </Button>

              <Button
                type="button"
                variant="outline-danger"
                size="sm"
                onClick={iniciarEdicion}
              >
                Modificar datos
              </Button>
            </div>
          )}
        </Card.Header>

        <Card.Body>
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

          <Form onSubmit={guardarCambios}>
            <Row className="g-3">
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label>Nombre completo</Form.Label>

                  <Form.Control
                    name="NombreCompleto"
                    value={form.NombreCompleto}
                    onChange={manejarCambio}
                    disabled={!editando}
                    maxLength={100}
                    required
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label>Cédula</Form.Label>

                  <Form.Control
                    value={form.Cedula}
                    disabled
                  />

                  <Form.Text muted>
                    La cédula no puede modificarse desde el perfil.
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label>Teléfono</Form.Label>

                  <Form.Control
                    name="Telefono"
                    value={form.Telefono}
                    onChange={manejarCambio}
                    disabled={!editando}
                    inputMode="numeric"
                    pattern="[0-9]{8}"
                    minLength={8}
                    maxLength={8}
                    required
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label>
                    Correo electrónico
                  </Form.Label>

                  <Form.Control
                    type="email"
                    name="CorreoElectronico"
                    value={form.CorreoElectronico}
                    onChange={manejarCambio}
                    disabled={!editando}
                    maxLength={100}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {editando && (
              <div className="d-flex gap-2 mt-4">
                <Button
                  type="submit"
                  variant="danger"
                  disabled={guardando}
                >
                  {guardando
                    ? 'Guardando cambios...'
                    : 'Guardar cambios'}
                </Button>

                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={cancelarEdicion}
                  disabled={guardando}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </Form>
        </Card.Body>
      </Card>

      <Modal
        show={mostrarContrasena}
        onHide={cerrarCambioContrasena}
        centered
      >
        <Form onSubmit={guardarContrasena}>
          <Modal.Header closeButton>
            <Modal.Title>
              Cambiar contraseña
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {errorContrasena && (
              <Alert variant="danger">
                {errorContrasena}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>
                Contraseña actual
              </Form.Label>

              <Form.Control
                type="password"
                name="ContrasenaActual"
                value={formContrasena.ContrasenaActual}
                onChange={manejarCambioContrasena}
                autoComplete="current-password"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Nueva contraseña
              </Form.Label>

              <Form.Control
                type="password"
                name="NuevaContrasena"
                value={formContrasena.NuevaContrasena}
                onChange={manejarCambioContrasena}
                autoComplete="new-password"
                minLength={6}
                required
              />

              <Form.Text muted>
                Debe tener al menos 6 caracteres.
              </Form.Text>
            </Form.Group>

            <Form.Group>
              <Form.Label>
                Confirmar nueva contraseña
              </Form.Label>

              <Form.Control
                type="password"
                name="ConfirmarContrasena"
                value={formContrasena.ConfirmarContrasena}
                onChange={manejarCambioContrasena}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button
              type="button"
              variant="outline-secondary"
              onClick={cerrarCambioContrasena}
              disabled={cambiandoContrasena}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="danger"
              disabled={cambiandoContrasena}
            >
              {cambiandoContrasena
                ? 'Cambiando...'
                : 'Cambiar contraseña'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </main>
  );
}