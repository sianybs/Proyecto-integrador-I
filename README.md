# Proyecto Integrador I — Sistema de Veterinaria y Refugio

Sistema web para gestionar una veterinaria y su refugio de animales asociado:
clientes, mascotas, citas, atenciones veterinarias, adopciones, donaciones,
postulaciones de empleo y empleados, con login por rol.

## Índice
1. [Arquitectura general](#arquitectura-general)
2. [Base de datos](#base-de-datos)
3. [Backend](#backend)
4. [Autenticación y roles](#autenticación-y-roles)
5. [Cómo correr el proyecto](#cómo-correr-el-proyecto)
6. [Guía de endpoints por módulo](#guía-de-endpoints-por-módulo)
7. [Frontend](#frontend)
8. [Pendientes conocidos](#pendientes-conocidos)

---

## Arquitectura general

```
Proyecto-integrador-I/
├── BD/                     -> Script SQL completo (tablas, SPs, vistas, roles)
├── Backend/                -> API REST (Node.js + Express + SQL Server)
│   ├── app.js               punto de entrada, monta todas las rutas
│   ├── config/db.js         conexión a SQL Server (pool de mssql)
│   ├── controller/          lógica de cada módulo (llama a los SPs)
│   ├── routes/               define los endpoints de cada módulo
│   └── utils/mailer.js       envío de correos (nodemailer)
└── Frontend/                -> React + Vite (todavía sin pantallas propias)
```

**Cómo fluye una petición:** `Postman/Frontend -> routes/*.js -> controller/*.js
-> config/db.js (pool) -> Stored Procedure en SQL Server -> respuesta JSON`

Casi toda la lógica de negocio (validaciones, reglas) vive en los **Stored
Procedures** de la base, no en JavaScript. Los controllers son en su mayoría
"traductores" entre HTTP y SPs. Esto es a propósito: mantiene las reglas
centralizadas en un solo lugar.

---

## Base de datos

Motor: **SQL Server**. Nombre: `DB_Veterinaria`. Script completo en
`BD/BD_Veterinaria_corregida.sql` (correlo entero para armar la base desde
cero: crea tablas, procedimientos, vistas, roles y datos de prueba).

### Tablas principales
| Tabla | Para qué es |
|---|---|
| `Cliente` | Dueños de mascotas / usuarios del sistema tipo "cliente" |
| `Mascota` | Mascotas, ligadas a un `Cliente` |
| `Cita` | Citas veterinarias, ligadas a una `Mascota` |
| `AtencionVeterinaria` | Diagnóstico/tratamiento de una `Cita` ya atendida |
| `AnimalDelRefugio` | Animales del refugio disponibles para adopción |
| `SolicitudAdopcion` | Solicitudes de adopción de un `Cliente` sobre un animal |
| `Donacion` | Donaciones hechas por un `Cliente` |
| `RolEmpleado` | Catálogo de roles (Administrador, Veterinario, Asistente
  Veterinario, Recepcionista, Encargado del Refugio, Cuidador de Animales,
  Limpieza) |
| `Postulacion` | Postulaciones de empleo a un `RolEmpleado` |
| `Empleado` | Empleados contratados (a partir de una `Postulacion` aceptada,
  o creados directo). Tiene `Contrasena` (bcrypt) y `DebeCambiarContrasena` |
| `Administrador` | Cuentas de administrador del sistema (login aparte) |
| `Suscripcion` | (existe en la BD, sin módulo en el backend todavía) |

### Reglas automáticas en la base
- **Trigger `trg_ValidarFechaCita`**: no deja crear citas con fecha pasada.
- **Índice único `UX_Cita_HorarioActivo`**: no permite dos citas activas
  (`Estado <> 'Cancelada'`) en la misma `Fecha` + `Hora`. Esta es la
  verdadera garantía contra citas duplicadas — no depende del código de
  Node, así que aunque haya un bug en el backend, la base lo bloquea igual.
- **Vistas** (`vw_HistorialMedico`, `vw_CitasVeterinaria`,
  `vw_AnimalesDisponibles`, `vw_SolicitudesAdopcion`, `vw_Donaciones`):
  joins pre-armados que usan las consultas y reportes.

### Niveles de acceso (roles de SQL Server)
Existen 5 roles de base de datos, con permisos acotados a lo que cada uno
necesita (ver el bloque `CREATE ROLE` / `GRANT` al final del script):

| Rol de BD | Cubre estos roles de `RolEmpleado` | Puede |
|---|---|---|
| `RolAdministrador` | Administrador | Todo |
| `RolVeterinario` | Veterinario, Asistente Veterinario | Ver clientes/mascotas/citas, registrar y actualizar atenciones |
| `RolRecepcionista` | Recepcionista | Crear/editar clientes, mascotas y citas (mostrador de la clínica) |
| `RolEncargadoRefugio` | Encargado del Refugio, Cuidador de Animales | CRUD de animales del refugio, gestionar adopciones y donaciones |
| `RolCliente` | Cliente | Ver catálogo público, crear su propia solicitud de adopción/donación/cita |

⚠️ Importante: estos roles hoy son solo objetos de SQL Server, probados con
`EXECUTE AS USER`. El backend se conecta con **un solo usuario** (el de
`.env`), así que estos roles todavía no se aplican automáticamente según
quién esté logueado en la app — ver [Pendientes](#pendientes-conocidos).

---

## Backend

### Instalación
```bash
cd Backend
npm install
```

### Variables de entorno
Copiá `Backend/.env.example` a `Backend/.env` y completá con tus datos
reales (nunca subas `.env` a Git — ya está en `.gitignore`):

```
DB_USER=...
DB_PASSWORD=...
DB_SERVER=...
DB_DATABASE=DB_Veterinaria
DB_PORT=1433
PORT=4000
EMAIL_USER=...          # cuenta de Gmail que manda los correos
EMAIL_PASSWORD=...      # contraseña de aplicación de Gmail (no la normal)
JWT_SECRET=...          # cualquier string largo y secreto
```

### Correr el servidor
```bash
npm run dev
```
Usa `nodemon`, así que recarga solo al guardar cambios. **No uses
`npm run start`** para desarrollo — corre con `node` directo, sin recarga
automática, y te puede dejar corriendo código viejo sin que te des cuenta.

Confirmá que levantó bien entrando a:
- `http://localhost:4000/api/health` → `{ status: "ok", db: "conectado" }`

---

## Autenticación y roles

`POST /api/auth/login` con `{ correo, contrasena }`. El login busca el
correo en este orden: `Administrador` → `Empleado` (trae su rol real desde
`RolEmpleado`) → `Cliente`. Si coincide la contraseña (bcrypt), devuelve:

```json
{
  "token": "...",
  "usuario": { "id": 1, "nombre": "...", "correo": "...", "rol": "Veterinario" }
}
```

El token JWT dura 8 horas y trae `{ id, rol, correo }` en su payload.

### Flujo de contratación de un empleado
1. `POST /api/postulaciones` — alguien se postula a un `RolEmpleado`.
2. `PATCH /api/postulaciones/:id/contratar` — se acepta la postulación.
   Esto automáticamente:
   - Crea el registro en `Empleado`.
   - Genera un correo institucional `nombre.apellido@vetcare.com` (sin
     duplicados).
   - Genera una contraseña temporal segura, la encripta (bcrypt) y la
     guarda.
   - Manda un correo real a la persona con su correo institucional y esa
     contraseña temporal.
   - Marca `DebeCambiarContrasena = 1`.
3. Para cambiarle la contraseña manualmente (soporte, o si no llegó el
   correo): `PATCH /api/postulaciones/empleados/:id/contrasena` con
   `{ "contrasena": "..." }`.

---

## Cómo correr el proyecto

1. Correr `BD/BD_Veterinaria_corregida.sql` completo en SQL Server
   (crea la base `DB_Veterinaria` con todo adentro).
2. Configurar `Backend/.env` (ver arriba).
3. `cd Backend && npm install && npm run dev`.
4. Probar con Postman contra `http://localhost:4000`.
5. (Frontend: ver sección aparte, todavía no tiene pantallas propias)

---

## Guía de endpoints por módulo

Todas las rutas empiezan con `http://localhost:4000/api/...`

| Módulo | Base | CRUD/Procesos |
|---|---|---|
| Auth | `/auth` | `POST /login` |
| Clientes | `/clientes` | GET, GET `/buscar?nombre=`, GET `/:id`, POST, PUT `/:id`, DELETE `/:id` |
| Mascotas | `/mascotas` | GET, GET `/buscar?nombre=`, GET `/cliente/:idCliente`, GET `/:id`, POST, PUT `/:id`, DELETE `/:id` |
| Citas | `/citas` | GET, GET `/fecha/:fecha`, GET `/:id`, POST, PUT `/:id`, PATCH `/:id/estado`, PATCH `/:id/cancelar`, DELETE `/:id` |
| Atenciones | `/atenciones` | GET, GET `/reporte`, GET `/mascota/:idMascota`, GET `/:id`, POST, PUT `/:id`, DELETE `/:id` |
| Refugio (animales) | `/refugio` | GET, GET `/disponibles`, GET `/:id`, POST, PUT `/:id`, DELETE `/:id` |
| Adopciones | `/adopciones` | GET, GET `/pendientes`, GET `/reporte`, POST, PATCH `/:id/aprobar`, `/rechazar`, `/cancelar`, `/devolver`, DELETE `/:id` |
| Donaciones | `/donaciones` | GET, GET `/periodo?desde=&hasta=`, GET `/reporte`, POST, PATCH `/:id/aprobar`, `/rechazar`, DELETE `/:id` |
| Postulaciones | `/postulaciones` | GET, GET `/reporte`, POST, PATCH `/:id/contratar`, `/rechazar`, DELETE `/:id` |
| Empleados | `/postulaciones/empleados` | GET, GET `/veterinarios`, POST, PUT `/:id`, DELETE `/:id`, PATCH `/:id/contrasena` |

**Notas importantes de flujo (para no repetir bugs que ya encontramos):**
- Una `Cita` se crea en estado `Pendiente`. `POST /atenciones` es lo que la
  pasa a `Atendida` automáticamente — **no** la marques como `Atendida` a
  mano antes, porque el sistema va a rechazar la atención (piensa que ya
  fue atendida).
- Cancelar una cita usa `PATCH /:id/cancelar` (respeta la regla de 1 hora
  de anticipación), no el `PATCH /:id/estado` genérico.
- Borrar un `Cliente`/`Mascota`/`Cita`/animal del `Refugio` que tenga
  registros asociados (mascotas, citas, adopciones) devuelve `409 Conflict`
  con un mensaje explicando por qué — es esperado, no es un bug.

---

## Frontend

React + Vite, todavía es el scaffold por defecto (sin pantallas propias).
Falta: pantallas de login, un dashboard por rol, y consumir cada endpoint
de arriba vía `fetch`/`axios`.

```bash
cd Frontend
npm install
npm run dev
```

---

## Pendientes conocidos

- ⚠️ **No hay middleware de autenticación.** El login funciona, pero
  ninguna ruta exige el JWT todavía — cualquiera puede llamar cualquier
  endpoint sin estar logueado. Hay que agregar un middleware que valide el
  token y, según el `rol` que traiga, permita o no la acción.
- `DebeCambiarContrasena` existe en `Empleado` pero el login no la usa
  todavía (no obliga a cambiar la contraseña temporal).
- Los niveles de acceso de SQL Server (`RolVeterinario`, etc.) no están
  conectados a usuarios reales de la app — hoy el backend usa una sola
  cuenta de conexión para todo.
- El fix de `409` en vez de `500` para errores de FK al eliminar ya está en
  `Cliente` — falta replicarlo en `Mascota`, `Cita` y `Refugio`.
- Hay un `package.json`/`package-lock.json` de sobra en la raíz del
  repo (fuera de `Backend/` y `Frontend/`), con una dependencia
  (`msnodesqlv8`) que no se usa — se puede borrar sin problema.
- Frontend sin pantallas propias todavía.
