-- Creacion de la DB en el caso de que no exista.
IF DB_ID('DB_Veterinaria') IS NULL
BEGIN
    CREATE DATABASE DB_Veterinaria;
END
GO



-- Entrar a la base de datos creada.
USE DB_Veterinaria;
GO



-- Creacion de las Tablas de la zona del Area de Atencion Veterinaria.(Salud)
--Tabla cliente
CREATE TABLE Cliente
(
    IdCliente INT IDENTITY(1,1) PRIMARY KEY,
    NombreCompleto VARCHAR(100) NOT NULL,
    Cedula VARCHAR(10) NOT NULL UNIQUE,
    Telefono VARCHAR(8) NOT NULL,
    CorreoElectronico VARCHAR(100) NOT NULL,
);
GO

-- Tabla Mascota
CREATE TABLE Mascota
(
    IdMascota INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(35) NOT NULL,
    Especie VARCHAR(15) NOT NULL,
    Raza VARCHAR(25),
    EdadAnimal VARCHAR(15),
    IdCliente INT NOT NULL,

    FOREIGN KEY (IdCliente)
        REFERENCES Cliente(IdCliente)
);
GO

-- Tabla Cita
CREATE TABLE Cita
(
    IdCita INT IDENTITY(1,1) PRIMARY KEY,
    Fecha DATE NOT NULL,
    Hora TIME NOT NULL,
    Motivo VARCHAR(125) NOT NULL,
    Estado VARCHAR(15) NOT NULL DEFAULT 'Pendiente', CHECK (Estado IN ('Pendiente', 'Atendida', 'Reprogramada', 'Cancelada')),
    IdMascota INT NOT NULL,

    FOREIGN KEY (IdMascota)
        REFERENCES Mascota(IdMascota)
);
GO

-- Tabla Suscripcion
-- Tabla para almacenar los correos de las personas suscritas a notificaciones del sistema.
CREATE TABLE Suscripcion
(
    IdSuscripcion INT IDENTITY(1,1) PRIMARY KEY,
    FechaRegistro DATETIME NOT NULL DEFAULT GETDATE(),
    Activa BIT NOT NULL DEFAULT 1,
    IdCliente INT NOT NULL,

    FOREIGN KEY (IdCliente)
        REFERENCES Cliente(IdCliente)
);
GO

-- Tabla: AtencionVeterinaria
-- Esta tabla va a cubrir el diagnostico, tratamiento y observaciones de cada cita.
CREATE TABLE AtencionVeterinaria
(
    IdAtencion INT IDENTITY(1,1) PRIMARY KEY,
    Fecha DATE NOT NULL,
    Diagnostico VARCHAR(100) NOT NULL,
    Tratamiento VARCHAR(100) NOT NULL,
    Observaciones VARCHAR(100) NOT NULL,

    IdCita INT NOT NULL,

        FOREIGN KEY (IdCita)
        REFERENCES Cita(IdCita)
);
GO


-- Creacion de las Tablas de la zona del Area de Adopcion.
-- Tabla del Refugio Animal
-- Esta tabla va a contener la informacion de los animales que se encuentran en el refugio, incluyendo su historia y estado de salud.
CREATE TABLE AnimalDelRefugio
(
    IdAnimalRefugio INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(30) NOT NULL,
    Especie VARCHAR(30) NOT NULL,
    Edad VARCHAR(25),
    Historia VARCHAR(100),
    Personalidad VARCHAR(50),
    HistorialSalud VARCHAR(100),
    Disponible BIT DEFAULT 1
);
GO

-- Tabla de Solicitud de Adopcion
CREATE TABLE SolicitudAdopcion
(
    IdSolicitud INT IDENTITY(1,1) PRIMARY KEY,
    CondicionVivienda VARCHAR(75) NOT NULL,
    TieneMascotas BIT NOT NULL,
    MotivoAdopcion VARCHAR(75) NOT NULL,
    Estado VARCHAR(15) NOT NULL
    DEFAULT 'Pendiente'
    CHECK (Estado IN ('Pendiente', 'Aprobada', 'Rechazada')),

    IdCliente INT NOT NULL,
    IdAnimalRefugio INT NOT NULL,


    FOREIGN KEY (IdCliente)
        REFERENCES Cliente(IdCliente),

    FOREIGN KEY (IdAnimalRefugio)
        REFERENCES AnimalDelRefugio(IdAnimalRefugio)
);
GO

-- Tabla de Donacion
CREATE TABLE Donacion
(
    IdDonacion INT IDENTITY(1,1) PRIMARY KEY,
    Fecha DATE NOT NULL,
    Monto DECIMAL(10,2) NOT NULL,
    MetodoPago VARCHAR(20) NOT NULL,
    DestinoDonacion VARCHAR(100) NOT NULL,
    Estado VARCHAR(15) NOT NULL
    DEFAULT 'Pendiente'
    CHECK (Estado IN ('Pendiente','Aprobada','Rechazada')),

    IdCliente INT NOT NULL,

    FOREIGN KEY (IdCliente)
        REFERENCES Cliente(IdCliente)
);
GO

-- Tabla de postulacion de trabajo
-- Esta tabla cubre la postulacion para ambas areas de la veterinaria, tanto para el area de atencion veterinaria como para el area de adopcion.
CREATE TABLE Postulacion
(
    IdPostulacion INT IDENTITY(1,1) PRIMARY KEY,
    NombreCompleto VARCHAR(100) NOT NULL,
    Cedula VARCHAR(10) NOT NULL UNIQUE,
    FechaNacimiento DATE NOT NULL,
    CorreoElectronico VARCHAR(100) NOT NULL,
    Curriculum VARCHAR(255),
    MotivoPostulacion VARCHAR(150) NOT NULL,
    FechaPostulacion DATETIME DEFAULT GETDATE(),

    Estado VARCHAR(15) NOT NULL
        DEFAULT 'Pendiente'
        CHECK (Estado IN ('Pendiente', 'Aceptada', 'Rechazada')),

    IdRol INT NOT NULL,

    CONSTRAINT FK_Postulacion_RolEmpleado
        FOREIGN KEY (IdRol)
        REFERENCES RolEmpleado(IdRol)
);
GO

ALTER TABLE Postulacion
ADD IdRol INT;
GO

ALTER TABLE Postulacion
ADD CONSTRAINT FK_Postulacion_RolEmpleado
FOREIGN KEY (IdRol)
REFERENCES RolEmpleado(IdRol);
GO


--Tabla de Empleados
CREATE TABLE Empleado
(
    IdEmpleado INT IDENTITY(1,1) PRIMARY KEY,
    NombreCompleto VARCHAR(100) NOT NULL,
    Cedula VARCHAR(10) NOT NULL UNIQUE,
    CorreoElectronico VARCHAR(100),
    Telefono VARCHAR(8),
    FechaContratacion DATE,
    Activo BIT DEFAULT 1,

    IdRol INT NOT NULL,

    IdPostulacion INT NOT NULL,

    CONSTRAINT FK_Empleado_Postulacion
        FOREIGN KEY (IdPostulacion)
        REFERENCES Postulacion(IdPostulacion),

    CONSTRAINT FK_Empleado_Rol
        FOREIGN KEY (IdRol)
        REFERENCES RolEmpleado(IdRol)
);
GO

-- Tabla de Roles
CREATE TABLE RolEmpleado (
    IdRol INT IDENTITY(1,1) PRIMARY KEY,
    NombreRol VARCHAR(50) NOT NULL,
    Descripcion VARCHAR(200)
);

--insert
INSERT INTO RolEmpleado (NombreRol, Descripcion)
VALUES
('Administrador', 'Gestiona el sistema, empleados, usuarios y reportes.'),
('Veterinario', 'Realiza consultas, diagnósticos y tratamientos médicos de las mascotas.'),
('Asistente Veterinario', 'Apoya al veterinario en la atención y cuidado de los pacientes.'),
('Recepcionista', 'Administra las citas, registra clientes y brinda atención al público.'),
('Encargado del Refugio', 'Gestiona las adopciones, el estado de los animales y el funcionamiento del refugio.'),
('Cuidador de Animales', 'Se encarga de la alimentación, higiene y bienestar de los animales del refugio.'),
('Limpieza', 'Mantiene limpias las instalaciones de la clínica y del refugio.');
GO

ALTER TABLE Empleado
ADD IdRol INT;

ALTER TABLE Empleado
ADD CONSTRAINT FK_Empleado_RolEmpleado
FOREIGN KEY (IdRol)
REFERENCES RolEmpleado(IdRol);

select * from Empleado




-- Tabla Administrador 
CREATE TABLE Administrador
(
    IdAdministrador INT IDENTITY(1,1) PRIMARY KEY,
    Correo VARCHAR(100) NOT NULL UNIQUE,
    Contrasena VARCHAR(255) NOT NULL
);
GO



-- Procedimientos Almacenados

-- Procedimiento Registro del Cliente
CREATE PROCEDURE sp_RegistrarCliente
(
    @Nombre VARCHAR(100),
    @Cedula VARCHAR(10),
    @Telefono VARCHAR(8),
    @Correo VARCHAR(100)
)
AS
BEGIN

INSERT INTO Cliente
    (
    NombreCompleto,
    Cedula,
    Telefono,
    CorreoElectronico
    )
VALUES
    (
    @Nombre,
    @Cedula,
    @Telefono,
    @Correo
    );

END;
GO

-- Procedimiento Registro del Animal
CREATE PROCEDURE sp_RegistrarMascota
(
    @Nombre VARCHAR(35),
    @Especie VARCHAR(15),
    @Raza VARCHAR(25),
    @Edad VARCHAR(15),
    @IdCliente INT
)
AS
BEGIN

INSERT INTO Mascota
    (
    Nombre,
    Especie,
    Raza,
    EdadAnimal,
    IdCliente
    )

VALUES
    (
    @Nombre,
    @Especie,
    @Raza,
    @Edad,
    @IdCliente
    );

END;
GO

-- Procedimiento Agendar una Cita
CREATE PROCEDURE sp_AgendarCita
(
    @Fecha DATE,
    @Hora TIME,
    @Motivo VARCHAR(125),
    @IdMascota INT
)
AS
BEGIN

INSERT INTO Cita
    (
    Fecha,
    Hora,
    Motivo,
    IdMascota
    )

VALUES
    (
    @Fecha,
    @Hora,
    @Motivo,
    @IdMascota
    );

END;
GO


-- Procedimiento Registro de Donacion
CREATE PROCEDURE sp_RegistrarDonacion
(
    @Fecha DATE,
    @Monto DECIMAL(10,2),
    @Metodo VARCHAR(20),
    @Destino VARCHAR(100),
    @IdCliente INT
)
AS
BEGIN

INSERT INTO Donacion
(
    Fecha,
    Monto,
    MetodoPago,
    DestinoDonacion,
    IdCliente
)

VALUES
(
    @Fecha,
    @Monto,
    @Metodo,
    @Destino,
    @IdCliente
);
END
GO


-- Proceso de Aprobacion de Donacion
CREATE PROCEDURE sp_AprobarDonacion
(
    @IdDonacion INT
)
AS
BEGIN

    IF NOT EXISTS
    (
        SELECT 1
        FROM Donacion
        WHERE IdDonacion = @IdDonacion
    )
    BEGIN
        RAISERROR('La donación no existe.',16,1);
        RETURN;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM Donacion
        WHERE IdDonacion = @IdDonacion
        AND Estado <> 'Pendiente'
    )
    BEGIN
        RAISERROR('La donación ya fue procesada.',16,1);
        RETURN;
    END;

    UPDATE Donacion
    SET Estado = 'Aprobada'
    WHERE IdDonacion = @IdDonacion;

END;
GO

-- Proceso de Rechazo de Donacion
CREATE PROCEDURE sp_RechazarDonacion
(
    @IdDonacion INT
)
AS
BEGIN

    IF NOT EXISTS
    (
        SELECT 1
        FROM Donacion
        WHERE IdDonacion = @IdDonacion
    )
    BEGIN
        RAISERROR('La donación no existe.',16,1);
        RETURN;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM Donacion
        WHERE IdDonacion = @IdDonacion
        AND Estado <> 'Pendiente'
    )
    BEGIN
        RAISERROR('La donación ya fue procesada.',16,1);
        RETURN;
    END;

    UPDATE Donacion
    SET Estado = 'Rechazada'
    WHERE IdDonacion = @IdDonacion;

END;
GO


-- Procedimiento Registro de solicitud de Adopcion
CREATE PROCEDURE sp_RegistrarSolicitud
(
    @Condicion VARCHAR(75),
    @TieneMascotas BIT,
    @Motivo VARCHAR(75),
    @IdCliente INT,
    @IdAnimal INT
)
AS
BEGIN

INSERT INTO SolicitudAdopcion
    (
    CondicionVivienda,
    TieneMascotas,
    MotivoAdopcion,
    IdCliente,
    IdAnimalRefugio
    )

VALUES
    (
    @Condicion,
    @TieneMascotas,
    @Motivo,
    @IdCliente,
    @IdAnimal
    );

END;
GO


-- Procedimiento de revision de Postulacion
create PROCEDURE sp_RegistrarPostulacion
(
    @NombreCompleto VARCHAR(100),
    @Cedula VARCHAR(10),
    @FechaNacimiento DATE,
    @CorreoElectronico VARCHAR(100),
    @Curriculum VARCHAR(255),
    @MotivoPostulacion VARCHAR(150),
    @IdRol INT
)
AS
BEGIN

    INSERT INTO Postulacion
    (
        NombreCompleto,
        Cedula,
        FechaNacimiento,
        CorreoElectronico,
        Curriculum,
        MotivoPostulacion,
        IdRol
    )
    VALUES
    (
        @NombreCompleto,
        @Cedula,
        @FechaNacimiento,
        @CorreoElectronico,
        @Curriculum,
        @MotivoPostulacion,
        @IdRol
    );

END;
GO



-- Procedimiento Contratar Empleado
create PROCEDURE sp_ContratarEmpleado
(
    @IdPostulacion INT,
    @Telefono VARCHAR(8)
)
AS
BEGIN

    IF NOT EXISTS
    (
        SELECT 1
        FROM Postulacion
        WHERE IdPostulacion = @IdPostulacion
    )
    BEGIN
        RAISERROR('La postulación no existe.',16,1);
        RETURN;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM Postulacion
        WHERE IdPostulacion = @IdPostulacion
        AND Estado <> 'Pendiente'
    )
    BEGIN
        RAISERROR('La postulación ya fue procesada.',16,1);
        RETURN;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM Empleado
        WHERE IdPostulacion = @IdPostulacion
    )
    BEGIN
        RAISERROR('La postulación ya generó un empleado.',16,1);
        RETURN;
    END;

    UPDATE Postulacion
    SET Estado = 'Aceptada'
    WHERE IdPostulacion = @IdPostulacion;

    INSERT INTO Empleado
    (
        NombreCompleto,
        Cedula,
        CorreoElectronico,
        Telefono,
        IdRol,
        FechaContratacion,
        Activo,
        IdPostulacion
    )
    SELECT
        NombreCompleto,
        Cedula,
        CorreoElectronico,
        @Telefono,
        IdRol,
        GETDATE(),
        1,
        IdPostulacion
    FROM Postulacion
    WHERE IdPostulacion = @IdPostulacion;

END;
GO

    -- Cambiar estado
    UPDATE Postulacion

    SET Estado='Aceptada'

    WHERE IdPostulacion=@IdPostulacion;

    

-- Procedimiento para el rechazo
CREATE PROCEDURE sp_RechazarPostulacion
(
    @IdPostulacion INT
)
AS
BEGIN

    IF EXISTS
    (
        SELECT 1
        FROM Postulacion
        WHERE IdPostulacion=@IdPostulacion
        AND Estado<>'Pendiente'
    )
    BEGIN
        RAISERROR('La postulación ya fue procesada.',16,1);
        RETURN;
    END;

    UPDATE Postulacion

    SET Estado='Rechazada'

    WHERE IdPostulacion=@IdPostulacion;

END;
GO

-- Procedimiento del Estado de Adopcion del Animal
-- Aceptacion
CREATE PROCEDURE sp_AprobarAdopcion
(
    @IdSolicitud INT
)
AS
BEGIN

    IF NOT EXISTS
    (
        SELECT 1
        FROM SolicitudAdopcion
        WHERE IdSolicitud = @IdSolicitud
    )
    BEGIN
        RAISERROR('La solicitud no existe.',16,1);
        RETURN;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM SolicitudAdopcion
        WHERE IdSolicitud = @IdSolicitud
        AND Estado <> 'Pendiente'
    )
    BEGIN
        RAISERROR('La solicitud ya fue procesada.',16,1);
        RETURN;
    END;

    UPDATE SolicitudAdopcion
    SET Estado = 'Aprobada'
    WHERE IdSolicitud = @IdSolicitud;

    UPDATE AnimalDelRefugio
    SET Disponible = 0
    WHERE IdAnimalRefugio =
    (
        SELECT IdAnimalRefugio
        FROM SolicitudAdopcion
        WHERE IdSolicitud = @IdSolicitud
    );

END;
GO

-- Rechazo
CREATE PROCEDURE sp_RechazarAdopcion
(
    @IdSolicitud INT
)
AS
BEGIN

    -- Verificar que exista
    IF NOT EXISTS
    (
        SELECT 1
        FROM SolicitudAdopcion
        WHERE IdSolicitud = @IdSolicitud
    )
    BEGIN
        RAISERROR('La solicitud no existe.',16,1);
        RETURN;
    END;

    -- Verificar que aún esté pendiente
    IF EXISTS
    (
        SELECT 1
        FROM SolicitudAdopcion
        WHERE IdSolicitud = @IdSolicitud
        AND Estado <> 'Pendiente'
    )
    BEGIN
        RAISERROR('La solicitud ya fue procesada.',16,1);
        RETURN;
    END;

    -- Rechazar la solicitud
    UPDATE SolicitudAdopcion
    SET Estado = 'Rechazada'
    WHERE IdSolicitud = @IdSolicitud;

END;
GO

-- Procedimiento de registro de la Suscripcion
CREATE PROCEDURE sp_RegistrarSuscripcion
(
    @IdCliente INT
)
AS
BEGIN

    -- Verificar que exista el cliente
    IF NOT EXISTS
    (
        SELECT 1
        FROM Cliente
        WHERE IdCliente = @IdCliente
    )
    BEGIN
        RAISERROR('El cliente no existe.',16,1);
        RETURN;
    END;

    -- Verificar que no esté suscrito
    IF EXISTS
    (
        SELECT 1
        FROM Suscripcion
        WHERE IdCliente = @IdCliente
        AND Activa = 1
    )
    BEGIN
        RAISERROR('El cliente ya tiene una suscripción activa.',16,1);
        RETURN;
    END;

    INSERT INTO Suscripcion
    (
        IdCliente
    )
    VALUES
    (
        @IdCliente
    );

END;
GO

-- Procedimiento para registrar una atención veterinaria
CREATE PROCEDURE sp_RegistrarAtencionVeterinaria
(
    @Fecha DATE,
    @Diagnostico VARCHAR(100),
    @Tratamiento VARCHAR(100),
    @Observaciones VARCHAR(100),
    @IdCita INT
)
AS
BEGIN

    -- Verificar que la cita exista
    IF NOT EXISTS
    (
        SELECT 1
        FROM Cita
        WHERE IdCita = @IdCita
    )
    BEGIN
        RAISERROR('La cita no existe.',16,1);
        RETURN;
    END;

    -- Verificar que la cita no haya sido atendida
    IF EXISTS
    (
        SELECT 1
        FROM Cita
        WHERE IdCita = @IdCita
        AND Estado = 'Atendida'
    )
    BEGIN
        RAISERROR('La cita ya fue atendida.',16,1);
        RETURN;
    END;

    -- Registrar la atención veterinaria
    INSERT INTO AtencionVeterinaria
    (
        Fecha,
        Diagnostico,
        Tratamiento,
        Observaciones,
        IdCita
    )
    VALUES
    (
        @Fecha,
        @Diagnostico,
        @Tratamiento,
        @Observaciones,
        @IdCita
    );

    -- Cambiar el estado de la cita
    UPDATE Cita
    SET Estado = 'Atendida'
    WHERE IdCita = @IdCita;

END;
GO

-- Cancelar la suscripcion
CREATE PROCEDURE sp_CancelarSuscripcion
(
    @IdCliente INT
)
AS
BEGIN

    UPDATE Suscripcion
    SET Activa = 0
    WHERE IdCliente = @IdCliente
      AND Activa = 1;

END;
GO

-- Funciones
-- Funcion Cantidad de Mascotas de un cliente
CREATE FUNCTION fn_CantidadMascotas
(
@IdCliente INT
)

RETURNS INT

AS
BEGIN

DECLARE @Cantidad INT;

SELECT @Cantidad = COUNT(*)
FROM Mascota
WHERE IdCliente = @IdCliente;

RETURN @Cantidad;

END;
GO


-- Funcion Monto total donado por un usuario/cliente
CREATE FUNCTION fn_TotalDonado
(
@IdCliente INT
)

RETURNS DECIMAL(10,2)

AS
BEGIN

DECLARE @Total DECIMAL(10,2);

SELECT @Total = SUM(Monto)
FROM Donacion
WHERE IdCliente = @IdCliente;

RETURN ISNULL(@Total,0);

END;
GO


-- Triggers
-- Trigger; No permite citas en fechas pasada
CREATE TRIGGER trg_ValidarFechaCita

ON Cita

INSTEAD OF INSERT

AS

BEGIN

IF EXISTS
(
SELECT *
FROM inserted
WHERE Fecha < CAST(GETDATE() AS DATE)
)

BEGIN

RAISERROR('No se pueden registrar citas en fechas pasadas.',16,1);

RETURN;

END

INSERT INTO Cita
(
    Fecha,
    Hora,
    Motivo,
    Estado,
    IdMascota
)

SELECT
    Fecha,
    Hora,
    Motivo,
    Estado,
    IdMascota

FROM inserted;

END;
GO

----------------------------------------------------------------------------------------------------------


-- Inserciones de prueba
-- Registro de Clientes y consulta
EXEC sp_RegistrarCliente
'Juan Pérez Salas',
'1682078250',
'8238-1488',
'JuanPeSals@gmail.com';

EXEC sp_RegistrarCliente
'María Gómez Rodriguez',
'2013672954',
'8377-1477',
'MariaGomRodri@gmail.com';

EXEC sp_RegistrarCliente
'Carlos Ruiz Soto',
'1234567893',
'8663-2036',
'carlos@gmail.com';

SELECT * FROM Cliente;

-- Registro de Mascotas y consulta
EXEC sp_RegistrarMascota
'Max',
'Perro',
'Labrador',
'4 años',
1;

EXEC sp_RegistrarMascota
'Michi',
'Gato',
'Criollo',
'2 años',
2;

EXEC sp_RegistrarMascota
'Luna',
'Conejo',
'Mini Lop',
'1 año',
3;

SELECT * FROM Mascota;

-- Registro de Agendo de citas y consulta
EXEC sp_AgendarCita
'2026-08-01',
'10:00',
'Vacunación',
1;

EXEC sp_AgendarCita
'2026-08-03',
'11:00',
'Control General',
2;

EXEC sp_AgendarCita
'2026-08-04',
'14:00',
'Desparasitación',
3;

-- Comprobacion del trigger, para fechas pasadas
EXEC sp_AgendarCita
'2025-08-01',
'10:00',
'Prueba',
1;

SELECT * FROM Cita;

-- Registro de Donaciones y consulta
EXEC sp_RegistrarDonacion
'2026-08-01',
25000,
'SINPE',
'Refugio',
1;

EXEC sp_RegistrarDonacion
'2026-08-02',
15000,
'Tarjeta',
'Medicamentos',
2;

EXEC sp_RegistrarDonacion
'2026-08-03',
50000,
'Efectivo',
'Alimentación',
3;

SELECT * FROM Donacion;

-- Aprobacion una por una

EXEC sp_AprobarDonacion 1;

EXEC sp_RechazarDonacion 3;


-- Registro de animales en el refugio y consulta
INSERT INTO AnimalDelRefugio
(
Nombre,
Especie,
Edad,
Historia,
Personalidad,
HistorialSalud
)
VALUES
('Kira','Perro','6 años','Rescatado de la calle, en Puntarenas','Juguetona','Vacunas al día'),
('Cleo','Perro','3 años','Abandonada en San José','Cariñosa','Saludable con Vacunas'),
('Copito','Conejo','1 año','Rescatado en Miramar','Tranquilo','Excelente');

-- Regitro de Solicitud de Adopcion y consulta

EXEC sp_RegistrarSolicitud
'Casa propia con patio grande',
1,
'Quiero adoptar un compañero para mi perrito Max.',
1,
1;

SELECT * FROM SolicitudAdopcion;

-- Comprobacion de la adopcion y proceso 

EXEC sp_AprobarAdopcion 1;


SELECT * FROM SolicitudAdopcion;

SELECT * FROM AnimalDelRefugio;


-- Registro de las postulaciones y consulta
EXEC sp_RegistrarPostulacion
'Ana Mora Solís',
'4023214012',
'2000-06-15',
'AnaMoraSol@gmail.com',
'Curriculum.pdf',
'Me interesa trabajar en la veterinaria.',
'4'

EXEC sp_RegistrarPostulacion
'Luis Castro Beltrán',
'6729671202',
'1998-09-20',
'LuisCastroBel@gmail.com',
'CVLuis.pdf',
'Quiero formar parte del refugio y ayudar a los animales abandonados.',
'1';

SELECT * FROM Postulacion;


-- Comprobacion de contratar el empleado/ rechazar el empleado
EXEC sp_ContratarEmpleado
1,
'88881111';

SELECT * FROM Postulacion;

SELECT * FROM Empleado;

-------------------------------------
EXEC sp_RechazarPostulacion 2;

SELECT * FROM Postulacion;

SELECT dbo.fn_CantidadMascotas(1) AS CantidadMascotas;

SELECT dbo.fn_TotalDonado(1) AS TotalDonado;

-- Comprobacion de la suscripcion
EXEC sp_RegistrarSuscripcion
1;

SELECT * FROM Suscripcion;

-- Rechazar suscripcion
EXEC sp_CancelarSuscripcion
1;

SELECT * FROM Suscripcion;

-- Registro de la atencion Medica y consulta
EXEC sp_RegistrarAtencionVeterinaria
    '2026-08-01',
    'Otitis Leve',
    'Antibióticos durante 7 días',
    'Regresar en una semana para revisión.',
    1;

SELECT * FROM AtencionVeterinaria;

SELECT * FROM Cita;




---------- Vistas

--vista de historialMedico
CREATE VIEW vw_HistorialMedico
AS
SELECT
    M.IdMascota,
    M.Nombre AS NombreMascota,
    M.Especie,
    M.Raza,
    C.NombreCompleto AS NombreDueno,
    C.Telefono,
    CI.Fecha AS FechaCita,
    CI.Motivo,
    AV.Diagnostico,
    AV.Tratamiento,
    AV.Observaciones
FROM Mascota M
INNER JOIN Cliente C
    ON M.IdCliente = C.IdCliente
INNER JOIN Cita CI
    ON M.IdMascota = CI.IdMascota
INNER JOIN AtencionVeterinaria AV
    ON CI.IdCita = AV.IdCita;
GO

--Ver datos de vistas
SELECT *
FROM vw_HistorialMedico;


-- vista de citas
CREATE VIEW vw_CitasVeterinaria
AS
SELECT
    CI.IdCita,
    CI.Fecha,
    CI.Hora,
    CI.Motivo,
    CI.Estado,
    M.Nombre AS NombreMascota,
    M.Especie,
    C.NombreCompleto AS NombreDueno,
    C.Telefono,
    C.CorreoElectronico
FROM Cita CI
INNER JOIN Mascota M
    ON CI.IdMascota = M.IdMascota
INNER JOIN Cliente C
    ON M.IdCliente = C.IdCliente;
GO

--ver vista de citas
SELECT *
FROM vw_CitasVeterinaria;

-- vista de animales disponibles
CREATE VIEW vw_AnimalesDisponibles
AS
SELECT
    IdAnimalRefugio,
    Nombre,
    Especie,
    Edad,
    Historia,
    Personalidad,
    HistorialSalud
FROM AnimalDelRefugio
WHERE Disponible = 1;
GO

-- ver vista animales disponibles
SELECT *
FROM vw_AnimalesDisponibles;

--crear vista de solicitudes adopcion
CREATE VIEW vw_SolicitudesAdopcion
AS
SELECT
    SA.IdSolicitud,
    C.NombreCompleto AS NombreSolicitante,
    C.Cedula,
    C.Telefono,
    C.CorreoElectronico,
    A.Nombre AS Animal,
    A.Especie,
    SA.CondicionVivienda,
    SA.TieneMascotas,
    SA.MotivoAdopcion,
    SA.Estado
FROM SolicitudAdopcion SA
INNER JOIN Cliente C
    ON SA.IdCliente = C.IdCliente
INNER JOIN AnimalDelRefugio A
    ON SA.IdAnimalRefugio = A.IdAnimalRefugio;
GO

-- ver vista de solicitid adopcion
SELECT *
FROM vw_SolicitudesAdopcion;


--crear vista de donaciones
CREATE VIEW vw_Donaciones
AS
SELECT
    D.IdDonacion,
    D.Fecha,
    C.NombreCompleto AS Donante,
    C.Cedula,
    D.Monto,
    D.MetodoPago,
    D.DestinoDonacion,
    D.Estado
FROM Donacion D
INNER JOIN Cliente C
    ON D.IdCliente = C.IdCliente;
GO

--ver vista de donaciones
select *
from vw_Donaciones

--Crear los roles
--rol de administrador
CREATE ROLE RolAdministrador;
GO

--rol de veterinario
CREATE ROLE RolVeterinario;
GO

--dar permisos a los roles
--para administrador
GRANT SELECT, INSERT, UPDATE, DELETE
ON Cliente
TO RolAdministrador;
GO

-- para veterinario
GRANT SELECT
ON Cliente
TO RolVeterinario;
GO

GRANT SELECT
ON Mascota
TO RolVeterinario;
GO

GRANT SELECT, INSERT
ON AtencionVeterinaria
TO RolVeterinario;
GO

-- dar permiso a las vistas al veterinario hara que asi no tenga que acceder a todas las tablas
GRANT SELECT
ON vw_HistorialMedico
TO RolVeterinario;
GO

--crear consultas
--consulta de mascotas
SELECT
    M.IdMascota,
    M.Nombre AS NombreMascota,
    M.Especie,
    M.Raza,
    M.EdadAnimal,
    C.NombreCompleto AS NombreDueno,
    C.Telefono,
    C.CorreoElectronico
FROM Mascota M
INNER JOIN Cliente C
    ON M.IdCliente = C.IdCliente
WHERE M.Nombre LIKE '%Cleo%';



-- consulta buscar dueños
SELECT
    C.NombreCompleto AS NombreDueno,
    C.Cedula,
    M.IdMascota,
    M.Nombre AS NombreMascota,
    M.Especie,
    M.Raza,
    M.EdadAnimal
FROM Cliente C
INNER JOIN Mascota M
    ON C.IdCliente = M.IdCliente
WHERE C.NombreCompleto LIKE '%María Gómez Rodriguez%';

--Consulta de cits medicas
SELECT *
FROM vw_HistorialMedico
WHERE NombreMascota LIKE '%Max%';


--Consulta citas por fecha
SELECT *
FROM vw_CitasVeterinaria
WHERE Fecha = '2026-08-01';

--consultas cits pendientes
SELECT *
FROM vw_CitasVeterinaria
WHERE Estado = 'Pendiente';

--ver consulta de mascotas dispinibles
SELECT *
FROM vw_AnimalesDisponibles;

-- ver consulta solicitudes de adopcion pendientes
SELECT *
FROM vw_SolicitudesAdopcion
WHERE Estado = 'Pendiente';


-- consulta de donaciones
SELECT *
FROM vw_Donaciones;

--consulta de donaciones por periodo
SELECT *
FROM vw_Donaciones
WHERE Fecha BETWEEN '2026-01-01' AND '2026-12-31';

--consulta de postulaciones pendientes
SELECT
    P.IdPostulacion,
    P.NombreCompleto,
	p.FechaNacimiento,
    P.Cedula,
    P.CorreoElectronico,
    P.FechaPostulacion,
	p.MotivoPostulacion,
    P.Estado
FROM Postulacion P
WHERE P.Estado = 'Aceptada';  --Rechazada, Pendiente


-- Creación de reportes
--cantidada de citas por estado
SELECT
    Estado,
    COUNT(*) AS CantidadCitas
FROM Cita
GROUP BY Estado;

-- citas por fecha
SELECT
    Fecha,
    COUNT(*) AS CantidadCitas
FROM Cita
GROUP BY Fecha
ORDER BY Fecha;

-- mascotas por especie
SELECT
    Especie,
    COUNT(*) AS CantidadMascotas
FROM Mascota
GROUP BY Especie;

--total de donaciones
SELECT
    SUM(Monto) AS TotalDonaciones
FROM Donacion
WHERE Estado = 'Aprobada';

--donaciones por destino
SELECT
    DestinoDonacion,
    SUM(Monto) AS TotalDonado
FROM Donacion
WHERE Estado = 'Aprobada'
GROUP BY DestinoDonacion;

--animales disponibles para adopcion
SELECT
    Especie,
    COUNT(*) AS CantidadDisponibles
FROM AnimalDelRefugio
WHERE Disponible = 1
GROUP BY Especie;



-- EN CASO DE QUE SE NECESITE MODIFICAR O REINICIAR LA DB, SE PUEDE USAR EL SIGUIENTE CODIGO:
-- Si no, entonces no se realiza el codigo de eliminacion, para evitar la perdida de datos.
USE MASTER
GO

-- DROP DATABASE DB_Veterinaria;
GO
