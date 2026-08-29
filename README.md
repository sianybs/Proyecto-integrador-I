# Vet-Care — Veterinaria y Refugio

Proyecto integrador universitario para administrar una clínica veterinaria y un refugio de animales. Incluye un sitio público para clientes y un panel interno con acceso según el rol del personal.

## Tecnologías

- Frontend: React 19, Vite, React Router, Bootstrap y React Bootstrap.
- Backend: Node.js, Express, JWT, bcrypt, Multer y Nodemailer.
- Base de datos: Microsoft SQL Server con tablas, vistas y procedimientos almacenados.

## Funcionalidades principales

### Clientes

- Registro e inicio de sesión.
- Consulta y modificación del perfil.
- Registro, modificación y desactivación de mascotas.
- Citas con horarios de 30 minutos, validación de fechas pasadas y cancelación.
- Historial de citas.
- Catálogo de animales con fotografías y ventana de detalles.
- Solicitudes de adopción únicamente para mayores de 18 años.
- Consulta, cancelación y devolución de adopciones.
- Donaciones y postulaciones de empleo.
- Cambio de contraseña y notificaciones por correo.

### Personal

- Panel interno protegido por JWT y permisos según el rol.
- CRUD de dueños, mascotas, citas y atenciones veterinarias.
- Gestión de animales del refugio, fotografías, adopciones y donaciones.
- Gestión de postulaciones y empleados.
- Contratación con generación de cuenta y contraseña temporal.
- Cambio obligatorio de la contraseña temporal en el primer ingreso.
- Reportes de salud y refugio.

### Roles de la aplicación

- Administrador.
- Veterinario.
- Recepcionista.
- Encargado del Refugio.
- Cliente.

## Estructura

```text
Proyecto-integrador-I/
├── BD/
│   └── BD_Veterinaria_corregida.sql
├── Backend/
│   ├── config/
│   ├── controller/
│   ├── middleware/
│   ├── routes/
│   ├── uploads/
│   ├── utils/
│   ├── .env.example
│   └── app.js
└── Frontend/
    ├── public/
    └── src/
        ├── api/
        ├── components/
        ├── context/
        └── pages/
```

## Requisitos

- Node.js 20 o superior.
- npm.
- Microsoft SQL Server.
- SQL Server Management Studio (SSMS), recomendado.
- Una cuenta de Gmail con contraseña de aplicación para probar los correos.

## 1. Crear la base de datos

1. Abrir SQL Server Management Studio.
2. Conectarse a la instancia de SQL Server.
3. Abrir `BD/BD_Veterinaria_corregida.sql`.
4. Ejecutar el archivo completo.

El script crea `DB_Veterinaria` desde cero con sus tablas, procedimientos, vistas, validaciones, roles y datos necesarios.

> El script completo es la fuente oficial para una instalación nueva. Los archivos de actualización usados durante el desarrollo no son necesarios al reconstruir la base desde cero.

## 2. Configurar el backend

Dentro de `Backend`, copiar `.env.example` con el nombre `.env` y reemplazar los valores de ejemplo:

```env
DB_USER=usuario_sql_server
DB_PASSWORD=contrasena_sql_server
DB_SERVER=localhost
DB_DATABASE=DB_Veterinaria
DB_PORT=1433

PORT=4000
JWT_SECRET=una_clave_larga_y_secreta

EMAIL_USER=correo@gmail.com
EMAIL_PASSWORD=contrasena_de_aplicacion_de_google
```

El archivo `.env` contiene información privada y está excluido de Git.

Instalar las dependencias e iniciar la API:

```bash
cd Backend
npm install
npm run dev
```

Comprobar la conexión en `http://localhost:4000/api/health`. La API funciona en `http://localhost:4000`.

## 3. Iniciar el frontend

En otra terminal:

```bash
cd Frontend
npm install
npm run dev
```

Abrir `http://localhost:5173`.

## Fotografías y archivos

- Las fotografías de demostración se conservan en `Backend/uploads/animales`.
- Las fotografías nuevas se guardan localmente en esa misma carpeta.
- Los currículos se guardan en `Backend/uploads/curriculos` y están excluidos de Git por privacidad.
- Las imágenes deben ser JPG, PNG o WebP y no superar 5 MB.
- Los currículos deben ser PDF y no superar 5 MB.

## Seguridad

- Las contraseñas se almacenan con bcrypt.
- Las sesiones utilizan JWT con vencimiento.
- Las rutas privadas validan la sesión y los roles autorizados.
- Los empleados reciben una contraseña temporal y deben reemplazarla antes de entrar al panel.
- No se debe subir `Backend/.env` ni compartir contraseñas reales.

## Validaciones destacadas

- No se permiten dos citas activas en la misma fecha y hora.
- No se permiten citas en fechas u horarios que ya pasaron.
- Los horarios disponibles van de 08:00 a 15:30 en espacios de 30 minutos.
- Una solicitud de adopción exige que la persona tenga al menos 18 años.
- Una mascota adoptada deja de estar disponible y vuelve al catálogo cuando es devuelta.
- Se conserva el historial de los registros relacionados.

## Comprobaciones antes de entregar

Desde `Frontend`:

```bash
npm run lint
npm run build
```

También se recomienda probar:

1. Registro e inicio de sesión de un cliente.
2. Registro de mascota y creación/cancelación de una cita.
3. Solicitud, aprobación y devolución de una adopción.
4. Postulación, contratación y cambio de contraseña temporal.
5. Acceso al panel con cada rol.

## Equipo

Proyecto Integrador I — Vet-Care, clínica veterinaria y refugio de animales.
