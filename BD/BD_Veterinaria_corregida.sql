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
    CorreoElectronico VARCHAR(100) NOT NULL UNIQUE,
    Contrasena VARCHAR(255) NULL
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
    Activo BIT NOT NULL
        CONSTRAINT DF_Mascota_Activo DEFAULT (1),
    IdCliente INT NOT NULL,

    CONSTRAINT FK_Mascota_Cliente FOREIGN KEY (IdCliente)
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




SELECT TOP 5 IdCita, Fecha, Hora, Estado, IdMascota
FROM Cita
ORDER BY IdCita DESC;


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
    Imagen VARCHAR(255),
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
    FechaNacimiento DATE NOT NULL,
    Estado VARCHAR(15) NOT NULL
    DEFAULT 'Pendiente'
    CHECK (Estado IN ('Pendiente', 'Aprobada', 'Rechazada', 'Cancelada', 'Devuelta')),

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

-- Tabla de Roles
CREATE TABLE RolEmpleado (
    IdRol INT IDENTITY(1,1) PRIMARY KEY,
    NombreRol VARCHAR(50) NOT NULL UNIQUE,
    Descripcion VARCHAR(200)
);
GO

-- Insertar roles de empleados
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



-- Tabla de Empleados
CREATE TABLE Empleado
(
    IdEmpleado INT IDENTITY(1,1) PRIMARY KEY,

    NombreCompleto VARCHAR(100) NOT NULL,

    Cedula VARCHAR(10) NOT NULL UNIQUE,

    -- Correo institucional generado automáticamente por el sistema
    CorreoElectronico VARCHAR(100) NOT NULL UNIQUE,

    Telefono VARCHAR(8),

    FechaContratacion DATE NOT NULL
        DEFAULT GETDATE(),

    Activo BIT NOT NULL
        DEFAULT 1,

    -- Contraseña almacenada como hash de bcrypt
    Contrasena VARCHAR(255) NOT NULL,

    -- 1 = debe cambiar la contraseña temporal
    -- 0 = ya estableció su propia contraseña
    DebeCambiarContrasena BIT NOT NULL
        DEFAULT 1,

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

    -- Verificar que esté dentro del horario de atención (8:00am - 4:00pm)
    IF @Hora < '08:00' OR @Hora > '16:00'
    BEGIN
        RAISERROR('Las citas solo se pueden agendar entre las 8:00 a.m. y las 4:00 p.m.',16,1);
        RETURN;
    END;

    -- Verificar que ese horario no esté ya ocupado por otra cita activa
    IF EXISTS (
        SELECT 1 FROM Cita
        WHERE Fecha = @Fecha
          AND Hora = @Hora
          AND Estado <> 'Cancelada'
    )
    BEGIN
        RAISERROR('Ese horario ya está ocupado, por favor elija otra hora.',16,1);
        RETURN;
    END;

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
CREATE OR ALTER PROCEDURE sp_ContratarEmpleado
(
    @IdPostulacion INT,
    @Telefono VARCHAR(8),
    @CorreoEmpleado VARCHAR(100),
    @Contrasena VARCHAR(255)
)
AS
BEGIN
    SET NOCOUNT ON;

    -- Verificar que la postulación exista
    IF NOT EXISTS
    (
        SELECT 1
        FROM Postulacion
        WHERE IdPostulacion = @IdPostulacion
    )
    BEGIN
        RAISERROR('La postulación no existe.', 16, 1);
        RETURN;
    END;

    -- Verificar que todavía esté pendiente
    IF EXISTS
    (
        SELECT 1
        FROM Postulacion
        WHERE IdPostulacion = @IdPostulacion
          AND Estado <> 'Pendiente'
    )
    BEGIN
        RAISERROR('La postulación ya fue procesada.', 16, 1);
        RETURN;
    END;

    -- Verificar que no haya generado ya un empleado
    IF EXISTS
    (
        SELECT 1
        FROM Empleado
        WHERE IdPostulacion = @IdPostulacion
    )
    BEGIN
        RAISERROR('La postulación ya generó un empleado.', 16, 1);
        RETURN;
    END;

    -- Verificar que el correo institucional no esté repetido
    IF EXISTS
    (
        SELECT 1
        FROM Empleado
        WHERE CorreoElectronico = @CorreoEmpleado
    )
    BEGIN
        RAISERROR('El correo institucional ya está en uso.', 16, 1);
        RETURN;
    END;

    -- Cambiar estado de la postulación
    UPDATE Postulacion
    SET Estado = 'Aceptada'
    WHERE IdPostulacion = @IdPostulacion;

    -- Crear el empleado
    INSERT INTO Empleado
    (
        NombreCompleto,
        Cedula,
        CorreoElectronico,
        Telefono,
        FechaContratacion,
        Activo,
        Contrasena,
        DebeCambiarContrasena,
        IdRol,
        IdPostulacion
    )
    SELECT
        NombreCompleto,
        Cedula,
        @CorreoEmpleado,
        @Telefono,
        GETDATE(),
        1,
        @Contrasena,
        1,
        IdRol,
        IdPostulacion
    FROM Postulacion
    WHERE IdPostulacion = @IdPostulacion;

END;
GO

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



-- en caso de que el cliente quiera cancelar la adopcion
CREATE PROCEDURE sp_CancelarSolicitudAdopcion
(
    @IdSolicitud INT
)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM SolicitudAdopcion WHERE IdSolicitud = @IdSolicitud)
    BEGIN
        RAISERROR('La solicitud no existe.',16,1);
        RETURN;
    END;

    IF EXISTS (SELECT 1 FROM SolicitudAdopcion WHERE IdSolicitud = @IdSolicitud AND Estado <> 'Pendiente')
    BEGIN
        RAISERROR('Solo se puede cancelar una solicitud que aún está pendiente.',16,1);
        RETURN;
    END;

    UPDATE SolicitudAdopcion
    SET Estado = 'Cancelada'
    WHERE IdSolicitud = @IdSolicitud;
END;
GO

-- Devolver una mascota ya adoptada (solicitud estaba Aprobada)
CREATE PROCEDURE sp_DevolverAdopcion
(
    @IdSolicitud INT
)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM SolicitudAdopcion WHERE IdSolicitud = @IdSolicitud)
    BEGIN
        RAISERROR('La solicitud no existe.',16,1);
        RETURN;
    END;

    IF EXISTS (SELECT 1 FROM SolicitudAdopcion WHERE IdSolicitud = @IdSolicitud AND Estado <> 'Aprobada')
    BEGIN
        RAISERROR('Solo se puede devolver una mascota que ya fue adoptada (solicitud Aprobada).',16,1);
        RETURN;
    END;

    UPDATE SolicitudAdopcion
    SET Estado = 'Devuelta'
    WHERE IdSolicitud = @IdSolicitud;

    -- El animal vuelve a estar disponible para adopción
    UPDATE AnimalDelRefugio
    SET Disponible = 1
    WHERE IdAnimalRefugio = (
        SELECT IdAnimalRefugio FROM SolicitudAdopcion WHERE IdSolicitud = @IdSolicitud
    );
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



---------------------------- Funciones ------------------------------------
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


-------------------------- Triggers ---------------------------------------
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

---------------------------- Cruds -----------------------------------
-- Complementan los procedimientos de procesos existentes, estos no reemplazan los procedimientos de negocio ya creados.

------------------------------------- CLIENTES ---------------------------------------------
-- Crud; Cliente
CREATE PROCEDURE sp_CrearCliente
(
    @Nombre VARCHAR(100),
    @Cedula VARCHAR(10),
    @Telefono VARCHAR(8),
    @Correo VARCHAR(100),
    @Contrasena VARCHAR(255) = NULL
)
AS
BEGIN
    INSERT INTO Cliente (NombreCompleto, Cedula, Telefono, CorreoElectronico, Contrasena)
    VALUES (@Nombre, @Cedula, @Telefono, @Correo, @Contrasena);
END;
GO
-- NOTA DE RUTH;
-- Agregue CORREO Y CONTRASEÑA al procedimiento de 
-- creación de cliente para permitir el registro completo del cliente 
-- con credenciales de acceso.
-- Si fuera a "romper" o "hacer caer la" base de datos, se podría eliminar 
-- la columna de contraseña y correo electrónico del procedimiento de creación de cliente, 
-- yo me puedo encargar de ELIMINARLO si hubiera un problema,
-- pero por ahora lo dejé así para que el registro de clientes sea completo.
CREATE PROCEDURE sp_ConsultarClientes
AS
BEGIN
    SELECT * FROM Cliente ORDER BY IdCliente;
END;
GO

CREATE PROCEDURE sp_ActualizarCliente
(
    @IdCliente INT,
    @Nombre VARCHAR(100),
    @Cedula VARCHAR(10),
    @Telefono VARCHAR(8),
    @Correo VARCHAR(100)
)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Cliente WHERE IdCliente=@IdCliente)
    BEGIN RAISERROR('El cliente no existe.',16,1); RETURN; END;
    UPDATE Cliente
    SET NombreCompleto=@Nombre, Cedula=@Cedula, Telefono=@Telefono,
        CorreoElectronico=@Correo
    WHERE IdCliente=@IdCliente;
END;
GO

CREATE PROCEDURE sp_EliminarCliente
(@IdCliente INT)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Cliente WHERE IdCliente=@IdCliente)
    BEGIN RAISERROR('El cliente no existe.',16,1); RETURN; END;
    DELETE FROM Cliente WHERE IdCliente=@IdCliente;
END;
GO

-------------------------- MASCOTAS ------------------------------------
-- Crud; Mascota
CREATE PROCEDURE sp_CrearMascota
(
    @Nombre VARCHAR(35), @Especie VARCHAR(15), @Raza VARCHAR(25),
    @Edad VARCHAR(15), @IdCliente INT
)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Cliente WHERE IdCliente=@IdCliente)
    BEGIN RAISERROR('El cliente no existe.',16,1); RETURN; END;
    INSERT INTO Mascota (Nombre,Especie,Raza,EdadAnimal,IdCliente)
    VALUES (@Nombre,@Especie,@Raza,@Edad,@IdCliente);
    SELECT SCOPE_IDENTITY() AS IdMascota;
END;
GO

CREATE PROCEDURE sp_ConsultarMascotas
AS
BEGIN
    SELECT M.IdMascota,M.Nombre,M.Especie,M.Raza,M.EdadAnimal,M.Activo,
           M.IdCliente,C.NombreCompleto AS NombreDueno
    FROM Mascota M INNER JOIN Cliente C ON M.IdCliente=C.IdCliente
    ORDER BY M.IdMascota;
END;
GO

CREATE PROCEDURE sp_ActualizarMascota
(
    @IdMascota INT, @Nombre VARCHAR(35), @Especie VARCHAR(15),
    @Raza VARCHAR(25), @Edad VARCHAR(15), @IdCliente INT
)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Mascota WHERE IdMascota=@IdMascota)
    BEGIN RAISERROR('La mascota no existe.',16,1); RETURN; END;
    IF NOT EXISTS (SELECT 1 FROM Cliente WHERE IdCliente=@IdCliente)
    BEGIN RAISERROR('El cliente no existe.',16,1); RETURN; END;
    UPDATE Mascota
    SET Nombre=@Nombre,Especie=@Especie,Raza=@Raza,EdadAnimal=@Edad,IdCliente=@IdCliente
    WHERE IdMascota=@IdMascota;
END;
GO

CREATE PROCEDURE sp_DesactivarMascotaCliente
(
    @IdMascota INT,
    @IdCliente INT
)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Mascota WHERE IdMascota=@IdMascota)
    BEGIN RAISERROR('La mascota no existe.',16,1); RETURN; END;

    IF NOT EXISTS
    (
        SELECT 1 FROM Mascota
        WHERE IdMascota=@IdMascota AND IdCliente=@IdCliente
    )
    BEGIN
        RAISERROR('No tienes permiso para desactivar esta mascota.',16,1);
        RETURN;
    END;

    IF EXISTS
    (
        SELECT 1 FROM Mascota
        WHERE IdMascota=@IdMascota AND Activo=0
    )
    BEGIN RAISERROR('La mascota ya se encuentra inactiva.',16,1); RETURN; END;

    UPDATE Mascota
    SET Activo=0
    WHERE IdMascota=@IdMascota AND IdCliente=@IdCliente;
END;
GO

CREATE PROCEDURE sp_EliminarMascota
(@IdMascota INT)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Mascota WHERE IdMascota=@IdMascota)
    BEGIN RAISERROR('La mascota no existe.',16,1); RETURN; END;
    DELETE FROM Mascota WHERE IdMascota=@IdMascota;
END;
GO

------------------------------- CITAS ----------------------------------------
-- Crud; Cita
CREATE PROCEDURE sp_CrearCita
(
    @Fecha DATE,@Hora TIME,@Motivo VARCHAR(125),@IdMascota INT
)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Mascota WHERE IdMascota=@IdMascota)
    BEGIN RAISERROR('La mascota no existe.',16,1); RETURN; END;
    INSERT INTO Cita (Fecha,Hora,Motivo,IdMascota)
    VALUES (@Fecha,@Hora,@Motivo,@IdMascota);
END;
GO

CREATE PROCEDURE sp_ConsultarCitas
AS
BEGIN
    SELECT * FROM vw_CitasVeterinaria ORDER BY Fecha,Hora;
END;
GO

CREATE PROCEDURE sp_ActualizarCita
(
    @IdCita INT,@Fecha DATE,@Hora TIME,@Motivo VARCHAR(125),
    @Estado VARCHAR(15),@IdMascota INT
)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Cita WHERE IdCita=@IdCita)
    BEGIN RAISERROR('La cita no existe.',16,1); RETURN; END;
    IF NOT EXISTS (SELECT 1 FROM Mascota WHERE IdMascota=@IdMascota)
    BEGIN RAISERROR('La mascota no existe.',16,1); RETURN; END;
    IF @Estado NOT IN ('Pendiente','Atendida','Reprogramada','Cancelada')
    BEGIN RAISERROR('El estado de la cita no es válido.',16,1); RETURN; END;
    IF @Fecha < CAST(GETDATE() AS DATE)
    BEGIN RAISERROR('No se pueden establecer citas en fechas pasadas.',16,1); RETURN; END;
    UPDATE Cita SET Fecha=@Fecha,Hora=@Hora,Motivo=@Motivo,Estado=@Estado,IdMascota=@IdMascota
    WHERE IdCita=@IdCita;
END;
GO

CREATE PROCEDURE sp_EliminarCita
(@IdCita INT)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Cita WHERE IdCita=@IdCita)
    BEGIN RAISERROR('La cita no existe.',16,1); RETURN; END;
    DELETE FROM Cita WHERE IdCita=@IdCita;
END;
GO

-- sp Cancelar cita
CREATE PROCEDURE sp_CancelarCita
(
    @IdCita INT
)
AS
BEGIN

    IF NOT EXISTS (SELECT 1 FROM Cita WHERE IdCita = @IdCita)
    BEGIN
        RAISERROR('La cita no existe.',16,1);
        RETURN;
    END;

    IF EXISTS (SELECT 1 FROM Cita WHERE IdCita = @IdCita AND Estado IN ('Cancelada', 'Atendida'))
    BEGIN
        RAISERROR('Esta cita ya no se puede cancelar (ya fue cancelada o atendida).',16,1);
        RETURN;
    END;

    -- Verificar que falte más de 1 hora para la cita
    IF EXISTS (
        SELECT 1 FROM Cita
        WHERE IdCita = @IdCita
        AND DATEDIFF(MINUTE, GETDATE(), CAST(Fecha AS DATETIME) + CAST(Hora AS DATETIME)) < 60
    )
    BEGIN
        RAISERROR('Ya no se puede cancelar: falta menos de 1 hora para la cita.',16,1);
        RETURN;
    END;

    UPDATE Cita
    SET Estado = 'Cancelada'
    WHERE IdCita = @IdCita;

END;
GO

-- Evita agendar 2 citas activas en el mismo horario (a nivel de base de datos, no solo en Node)
CREATE UNIQUE INDEX UX_Cita_HorarioActivo
ON Cita (Fecha, Hora)
WHERE Estado <> 'Cancelada';
GO

---------------------------------- SUSCRIPCION ------------------------------------------------
-- Crud; Suscripcion
CREATE PROCEDURE sp_CrearSuscripcion
(
    @IdCliente INT
)
AS
BEGIN

    -- Verificar que el cliente exista
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

    -- Verificar que el cliente no tenga una suscripción activa
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

    -- Crear la suscripción
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

CREATE PROCEDURE sp_ConsultarSuscripciones
AS
BEGIN

    SELECT
        S.IdSuscripcion,
        S.FechaRegistro,
        S.Activa,
        S.IdCliente,
        C.NombreCompleto,
        C.CorreoElectronico
    FROM Suscripcion S
    INNER JOIN Cliente C
        ON S.IdCliente = C.IdCliente
    ORDER BY S.IdSuscripcion;

END;
GO


CREATE PROCEDURE sp_ActualizarSuscripcion
(
    @IdSuscripcion INT,
    @IdCliente INT
)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Suscripcion WHERE IdSuscripcion=@IdSuscripcion)
    BEGIN RAISERROR('La suscripción no existe.',16,1); RETURN; END;
    IF NOT EXISTS (SELECT 1 FROM Cliente WHERE IdCliente=@IdCliente)
    BEGIN RAISERROR('El cliente no existe.',16,1); RETURN; END;

    UPDATE Suscripcion
    SET IdCliente = @IdCliente
    WHERE IdSuscripcion = @IdSuscripcion;
END;
GO



CREATE PROCEDURE sp_EliminarSuscripcion
(@IdSuscripcion INT)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Suscripcion WHERE IdSuscripcion=@IdSuscripcion)
    BEGIN RAISERROR('La suscripción no existe.',16,1); RETURN; END;
    DELETE FROM Suscripcion WHERE IdSuscripcion=@IdSuscripcion;
END;
GO

------------------------------------------- VETERINARIA ---------------------------------------------------------
-- Crud; Atencion Veterinaria
CREATE PROCEDURE sp_CrearAtencionVeterinaria
(
    @Fecha DATE,@Diagnostico VARCHAR(100),@Tratamiento VARCHAR(100),
    @Observaciones VARCHAR(100),@IdCita INT
)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Cita WHERE IdCita=@IdCita)
    BEGIN RAISERROR('La cita no existe.',16,1); RETURN; END;
    INSERT INTO AtencionVeterinaria
        (Fecha,Diagnostico,Tratamiento,Observaciones,IdCita)
    VALUES (@Fecha,@Diagnostico,@Tratamiento,@Observaciones,@IdCita);
END;
GO

CREATE PROCEDURE sp_ConsultarAtencionesVeterinarias
AS
BEGIN
    SELECT * FROM AtencionVeterinaria ORDER BY IdAtencion;
END;
GO

CREATE PROCEDURE sp_ActualizarAtencionVeterinaria
(
    @IdAtencion INT,@Fecha DATE,@Diagnostico VARCHAR(100),@Tratamiento VARCHAR(100),
    @Observaciones VARCHAR(100),@IdCita INT
)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM AtencionVeterinaria WHERE IdAtencion=@IdAtencion)
    BEGIN RAISERROR('La atención veterinaria no existe.',16,1); RETURN; END;
    IF NOT EXISTS (SELECT 1 FROM Cita WHERE IdCita=@IdCita)
    BEGIN RAISERROR('La cita no existe.',16,1); RETURN; END;
    UPDATE AtencionVeterinaria
    SET Fecha=@Fecha,Diagnostico=@Diagnostico,Tratamiento=@Tratamiento,
        Observaciones=@Observaciones,IdCita=@IdCita
    WHERE IdAtencion=@IdAtencion;
END;
GO

CREATE PROCEDURE sp_EliminarAtencionVeterinaria
(@IdAtencion INT)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM AtencionVeterinaria WHERE IdAtencion=@IdAtencion)
    BEGIN RAISERROR('La atención veterinaria no existe.',16,1); RETURN; END;
    DELETE FROM AtencionVeterinaria WHERE IdAtencion=@IdAtencion;
END;
GO

---------------------------------- ANIMALES REFUGIO ---------------------------------------------------
-- Crud; Refugio Animal
CREATE PROCEDURE sp_CrearAnimalRefugio
(
    @Nombre VARCHAR(30),@Especie VARCHAR(30),@Edad VARCHAR(25),@Historia VARCHAR(100),
    @Personalidad VARCHAR(50),@HistorialSalud VARCHAR(100),@Disponible BIT=1,
    @Imagen VARCHAR(255)=NULL
)
AS
BEGIN
    INSERT INTO AnimalDelRefugio
        (Nombre,Especie,Edad,Historia,Personalidad,HistorialSalud,Disponible,Imagen)
    VALUES (@Nombre,@Especie,@Edad,@Historia,@Personalidad,@HistorialSalud,@Disponible,@Imagen);
END;
GO

CREATE PROCEDURE sp_ConsultarAnimalesRefugio
AS
BEGIN
    SELECT * FROM AnimalDelRefugio ORDER BY IdAnimalRefugio;
END;
GO

CREATE PROCEDURE sp_ActualizarAnimalRefugio
(
    @IdAnimalRefugio INT,@Nombre VARCHAR(30),@Especie VARCHAR(30),@Edad VARCHAR(25),
    @Historia VARCHAR(100),@Personalidad VARCHAR(50),@HistorialSalud VARCHAR(100),
    @Disponible BIT,@Imagen VARCHAR(255)=NULL
)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM AnimalDelRefugio WHERE IdAnimalRefugio=@IdAnimalRefugio)
    BEGIN RAISERROR('El animal no existe.',16,1); RETURN; END;
    UPDATE AnimalDelRefugio
    SET Nombre=@Nombre,Especie=@Especie,Edad=@Edad,Historia=@Historia,
        Personalidad=@Personalidad,HistorialSalud=@HistorialSalud,Disponible=@Disponible,
        Imagen=COALESCE(@Imagen,Imagen)
    WHERE IdAnimalRefugio=@IdAnimalRefugio;
END;
GO

CREATE PROCEDURE sp_EliminarAnimalRefugio
(@IdAnimalRefugio INT)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM AnimalDelRefugio WHERE IdAnimalRefugio=@IdAnimalRefugio)
    BEGIN RAISERROR('El animal no existe.',16,1); RETURN; END;
    DELETE FROM AnimalDelRefugio WHERE IdAnimalRefugio=@IdAnimalRefugio;
END;
GO

--------------------------------------- ADOPCION --------------------------------------------------
-- Crud; Solicitu de Adopcion
CREATE PROCEDURE sp_CrearSolicitudAdopcion
(
    @Condicion VARCHAR(75),@TieneMascotas BIT,@Motivo VARCHAR(75),@FechaNacimiento DATE,
    @IdCliente INT,@IdAnimal INT
)
AS
BEGIN
    IF DATEDIFF(YEAR, @FechaNacimiento, GETDATE())
       - CASE
           WHEN DATEADD(YEAR, DATEDIFF(YEAR, @FechaNacimiento, GETDATE()), @FechaNacimiento) > CAST(GETDATE() AS DATE)
           THEN 1 ELSE 0
         END < 18
    BEGIN
        RAISERROR('Debes ser mayor de 18 años para solicitar una adopción.',16,1);
        RETURN;
    END;

    IF NOT EXISTS (SELECT 1 FROM Cliente WHERE IdCliente=@IdCliente)
    BEGIN RAISERROR('El cliente no existe.',16,1); RETURN; END;
    IF NOT EXISTS (SELECT 1 FROM AnimalDelRefugio WHERE IdAnimalRefugio=@IdAnimal)
    BEGIN RAISERROR('El animal no existe.',16,1); RETURN; END;
    INSERT INTO SolicitudAdopcion
        (CondicionVivienda,TieneMascotas,MotivoAdopcion,FechaNacimiento,IdCliente,IdAnimalRefugio)
    VALUES (@Condicion,@TieneMascotas,@Motivo,@FechaNacimiento,@IdCliente,@IdAnimal);
END;
GO

CREATE PROCEDURE sp_ConsultarSolicitudesAdopcion
AS
BEGIN
    SELECT * FROM vw_SolicitudesAdopcion ORDER BY IdSolicitud;
END;
GO

CREATE PROCEDURE sp_ActualizarSolicitudAdopcion
(
    @IdSolicitud INT,@Condicion VARCHAR(75),@TieneMascotas BIT,@Motivo VARCHAR(75),
    @Estado VARCHAR(15),@IdCliente INT,@IdAnimal INT
)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM SolicitudAdopcion WHERE IdSolicitud=@IdSolicitud)
    BEGIN RAISERROR('La solicitud no existe.',16,1); RETURN; END;
    IF NOT EXISTS (SELECT 1 FROM Cliente WHERE IdCliente=@IdCliente)
    BEGIN RAISERROR('El cliente no existe.',16,1); RETURN; END;
    IF NOT EXISTS (SELECT 1 FROM AnimalDelRefugio WHERE IdAnimalRefugio=@IdAnimal)
    BEGIN RAISERROR('El animal no existe.',16,1); RETURN; END;
    IF @Estado NOT IN ('Pendiente','Aprobada','Rechazada')
    BEGIN RAISERROR('El estado no es válido.',16,1); RETURN; END;
    UPDATE SolicitudAdopcion
    SET CondicionVivienda=@Condicion,TieneMascotas=@TieneMascotas,MotivoAdopcion=@Motivo,
        Estado=@Estado,IdCliente=@IdCliente,IdAnimalRefugio=@IdAnimal
    WHERE IdSolicitud=@IdSolicitud;
END;
GO

CREATE PROCEDURE sp_EliminarSolicitudAdopcion
(@IdSolicitud INT)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM SolicitudAdopcion WHERE IdSolicitud=@IdSolicitud)
    BEGIN RAISERROR('La solicitud no existe.',16,1); RETURN; END;
    DELETE FROM SolicitudAdopcion WHERE IdSolicitud=@IdSolicitud;
END;
GO

------------------------------------ DONACIONES ---------------------------------------------
-- Crud; Donacion a la veterinaria (Ambas areas)
CREATE PROCEDURE sp_CrearDonacion
(
    @Fecha DATE,@Monto DECIMAL(10,2),@Metodo VARCHAR(20),@Destino VARCHAR(100),@IdCliente INT
)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Cliente WHERE IdCliente=@IdCliente)
    BEGIN RAISERROR('El cliente no existe.',16,1); RETURN; END;
    IF @Monto <= 0
    BEGIN RAISERROR('El monto debe ser mayor que cero.',16,1); RETURN; END;
    INSERT INTO Donacion (Fecha,Monto,MetodoPago,DestinoDonacion,IdCliente)
    VALUES (@Fecha,@Monto,@Metodo,@Destino,@IdCliente);
END;
GO

CREATE PROCEDURE sp_ConsultarDonaciones
AS
BEGIN
    SELECT * FROM vw_Donaciones ORDER BY IdDonacion;
END;
GO

CREATE PROCEDURE sp_ActualizarDonacion
(
    @IdDonacion INT,@Fecha DATE,@Monto DECIMAL(10,2),@Metodo VARCHAR(20),
    @Destino VARCHAR(100),@Estado VARCHAR(15),@IdCliente INT
)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Donacion WHERE IdDonacion=@IdDonacion)
    BEGIN RAISERROR('La donación no existe.',16,1); RETURN; END;
    IF NOT EXISTS (SELECT 1 FROM Cliente WHERE IdCliente=@IdCliente)
    BEGIN RAISERROR('El cliente no existe.',16,1); RETURN; END;
    IF @Monto <= 0
    BEGIN RAISERROR('El monto debe ser mayor que cero.',16,1); RETURN; END;
    IF @Estado NOT IN ('Pendiente','Aprobada','Rechazada')
    BEGIN RAISERROR('El estado no es válido.',16,1); RETURN; END;
    UPDATE Donacion
    SET Fecha=@Fecha,Monto=@Monto,MetodoPago=@Metodo,DestinoDonacion=@Destino,
        Estado=@Estado,IdCliente=@IdCliente
    WHERE IdDonacion=@IdDonacion;
END;
GO

CREATE PROCEDURE sp_EliminarDonacion
(@IdDonacion INT)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Donacion WHERE IdDonacion=@IdDonacion)
    BEGIN RAISERROR('La donación no existe.',16,1); RETURN; END;
    DELETE FROM Donacion WHERE IdDonacion=@IdDonacion;
END;
GO

----------------------------------- POSTULACION ---------------------------------------
-- Crud; Postulacion de Empleo
CREATE PROCEDURE sp_CrearPostulacion
(
    @NombreCompleto VARCHAR(100),@Cedula VARCHAR(10),@FechaNacimiento DATE,
    @CorreoElectronico VARCHAR(100),@Curriculum VARCHAR(255),
    @MotivoPostulacion VARCHAR(150),@IdRol INT
)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM RolEmpleado WHERE IdRol=@IdRol)
    BEGIN RAISERROR('El rol no existe.',16,1); RETURN; END;
    INSERT INTO Postulacion
        (NombreCompleto,Cedula,FechaNacimiento,CorreoElectronico,Curriculum,MotivoPostulacion,IdRol)
    VALUES (@NombreCompleto,@Cedula,@FechaNacimiento,@CorreoElectronico,@Curriculum,@MotivoPostulacion,@IdRol);
END;
GO

CREATE PROCEDURE sp_ConsultarPostulaciones
AS
BEGIN
    SELECT P.IdPostulacion,P.NombreCompleto,P.Cedula,P.FechaNacimiento,
           P.CorreoElectronico,P.Curriculum,P.MotivoPostulacion,P.FechaPostulacion,
           P.Estado,P.IdRol,R.NombreRol
    FROM Postulacion P INNER JOIN RolEmpleado R ON P.IdRol=R.IdRol
    ORDER BY P.IdPostulacion;
END;
GO

CREATE PROCEDURE sp_ActualizarPostulacion
(
    @IdPostulacion INT,@NombreCompleto VARCHAR(100),@Cedula VARCHAR(10),@FechaNacimiento DATE,
    @CorreoElectronico VARCHAR(100),@Curriculum VARCHAR(255),@MotivoPostulacion VARCHAR(150),
    @Estado VARCHAR(15),@IdRol INT
)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Postulacion WHERE IdPostulacion=@IdPostulacion)
    BEGIN RAISERROR('La postulación no existe.',16,1); RETURN; END;
    IF NOT EXISTS (SELECT 1 FROM RolEmpleado WHERE IdRol=@IdRol)
    BEGIN RAISERROR('El rol no existe.',16,1); RETURN; END;
    IF @Estado NOT IN ('Pendiente','Aceptada','Rechazada')
    BEGIN RAISERROR('El estado no es válido.',16,1); RETURN; END;
    UPDATE Postulacion
    SET NombreCompleto=@NombreCompleto,Cedula=@Cedula,FechaNacimiento=@FechaNacimiento,
        CorreoElectronico=@CorreoElectronico,Curriculum=@Curriculum,
        MotivoPostulacion=@MotivoPostulacion,Estado=@Estado,IdRol=@IdRol
    WHERE IdPostulacion=@IdPostulacion;
END;
GO

CREATE PROCEDURE sp_EliminarPostulacion
(@IdPostulacion INT)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Postulacion WHERE IdPostulacion=@IdPostulacion)
    BEGIN RAISERROR('La postulación no existe.',16,1); RETURN; END;
    IF EXISTS (SELECT 1 FROM Empleado WHERE IdPostulacion=@IdPostulacion)
    BEGIN RAISERROR('No se puede eliminar la postulación porque ya generó un empleado.',16,1); RETURN; END;
    DELETE FROM Postulacion WHERE IdPostulacion=@IdPostulacion;
END;
GO

------------------------------ EMPLEADOS -------------------------------------------------
-- Crud; Empleado
CREATE PROCEDURE sp_CrearEmpleado
(
    @NombreCompleto VARCHAR(100),@Cedula VARCHAR(10),@CorreoElectronico VARCHAR(100),
    @Telefono VARCHAR(8),@FechaContratacion DATE,@Activo BIT,@IdRol INT,@IdPostulacion INT,
    @Contrasena VARCHAR(255)
)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM RolEmpleado WHERE IdRol=@IdRol)
    BEGIN RAISERROR('El rol no existe.',16,1); RETURN; END;
    IF NOT EXISTS (SELECT 1 FROM Postulacion WHERE IdPostulacion=@IdPostulacion)
    BEGIN RAISERROR('La postulación no existe.',16,1); RETURN; END;
    INSERT INTO Empleado
        (NombreCompleto,Cedula,CorreoElectronico,Telefono,FechaContratacion,Activo,IdRol,IdPostulacion,Contrasena)
    VALUES (@NombreCompleto,@Cedula,@CorreoElectronico,@Telefono,@FechaContratacion,@Activo,@IdRol,@IdPostulacion,@Contrasena);
END;
GO

CREATE PROCEDURE sp_ConsultarEmpleados
AS
BEGIN
    SELECT E.IdEmpleado,E.NombreCompleto,E.Cedula,E.CorreoElectronico,E.Telefono,
           E.FechaContratacion,E.Activo,E.IdRol,R.NombreRol,E.IdPostulacion
    FROM Empleado E INNER JOIN RolEmpleado R ON E.IdRol=R.IdRol
    ORDER BY E.IdEmpleado;
END;
GO

CREATE PROCEDURE sp_ActualizarEmpleado
(
    @IdEmpleado INT,@NombreCompleto VARCHAR(100),@Cedula VARCHAR(10),@CorreoElectronico VARCHAR(100),
    @Telefono VARCHAR(8),@FechaContratacion DATE,@Activo BIT,@IdRol INT,@IdPostulacion INT
)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Empleado WHERE IdEmpleado=@IdEmpleado)
    BEGIN RAISERROR('El empleado no existe.',16,1); RETURN; END;
    IF NOT EXISTS (SELECT 1 FROM RolEmpleado WHERE IdRol=@IdRol)
    BEGIN RAISERROR('El rol no existe.',16,1); RETURN; END;
    IF NOT EXISTS (SELECT 1 FROM Postulacion WHERE IdPostulacion=@IdPostulacion)
    BEGIN RAISERROR('La postulación no existe.',16,1); RETURN; END;
    UPDATE Empleado
    SET NombreCompleto=@NombreCompleto,Cedula=@Cedula,CorreoElectronico=@CorreoElectronico,
        Telefono=@Telefono,FechaContratacion=@FechaContratacion,Activo=@Activo,
        IdRol=@IdRol,IdPostulacion=@IdPostulacion
    WHERE IdEmpleado=@IdEmpleado;
END;
GO

CREATE PROCEDURE sp_EliminarEmpleado
(@IdEmpleado INT)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Empleado WHERE IdEmpleado=@IdEmpleado)
    BEGIN RAISERROR('El empleado no existe.',16,1); RETURN; END;
    DELETE FROM Empleado WHERE IdEmpleado=@IdEmpleado;
END;
GO

CREATE PROCEDURE sp_AsignarContrasenaEmpleado
(
    @IdEmpleado INT,
    @Contrasena VARCHAR(255)
)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Empleado WHERE IdEmpleado = @IdEmpleado)
    BEGIN
        RAISERROR('El empleado no existe.', 16, 1);
        RETURN;
    END;

    UPDATE Empleado
    SET Contrasena = @Contrasena,
        DebeCambiarContrasena = 0
    WHERE IdEmpleado = @IdEmpleado;
END;
GO



--------------------------------- ROLES -----------------------------------------
-- Crud: Roles de Empleados
CREATE PROCEDURE sp_CrearRolEmpleado
(@NombreRol VARCHAR(50),@Descripcion VARCHAR(200))
AS
BEGIN
    IF EXISTS (SELECT 1 FROM RolEmpleado WHERE NombreRol = @NombreRol)
    BEGIN
        RAISERROR('Ya existe un rol con ese nombre.',16,1);
        RETURN;
    END;

    INSERT INTO RolEmpleado (NombreRol,Descripcion)
    VALUES (@NombreRol,@Descripcion);
END;
GO

CREATE PROCEDURE sp_ConsultarRolesEmpleado
AS
BEGIN
    SELECT * FROM RolEmpleado ORDER BY IdRol;
END;
GO

CREATE PROCEDURE sp_ActualizarRolEmpleado
(@IdRol INT,@NombreRol VARCHAR(50),@Descripcion VARCHAR(200))
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM RolEmpleado WHERE IdRol=@IdRol)
    BEGIN RAISERROR('El rol no existe.',16,1); RETURN; END;
    UPDATE RolEmpleado SET NombreRol=@NombreRol,Descripcion=@Descripcion
    WHERE IdRol=@IdRol;
END;
GO

CREATE PROCEDURE sp_EliminarRolEmpleado
(@IdRol INT)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM RolEmpleado WHERE IdRol=@IdRol)
    BEGIN RAISERROR('El rol no existe.',16,1); RETURN; END;
    IF EXISTS (SELECT 1 FROM Empleado WHERE IdRol=@IdRol)
       OR EXISTS (SELECT 1 FROM Postulacion WHERE IdRol=@IdRol)
    BEGIN RAISERROR('No se puede eliminar el rol porque está siendo utilizado.',16,1); RETURN; END;
    DELETE FROM RolEmpleado WHERE IdRol=@IdRol;
END;
GO

----------------------------- ADMINISTRADOR ---------------------------------------
-- Crud; Administrador
CREATE PROCEDURE sp_CrearAdministrador
(@Correo VARCHAR(100),@Contrasena VARCHAR(255))
AS
BEGIN
    INSERT INTO Administrador (Correo,Contrasena)
    VALUES (@Correo,@Contrasena);
END;
GO

CREATE PROCEDURE sp_ConsultarAdministradores
AS
BEGIN
    SELECT IdAdministrador,Correo FROM Administrador ORDER BY IdAdministrador;
END;
GO

CREATE PROCEDURE sp_ActualizarAdministrador
(@IdAdministrador INT,@Correo VARCHAR(100),@Contrasena VARCHAR(255))
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Administrador WHERE IdAdministrador=@IdAdministrador)
    BEGIN RAISERROR('El administrador no existe.',16,1); RETURN; END;
    UPDATE Administrador SET Correo=@Correo,Contrasena=@Contrasena
    WHERE IdAdministrador=@IdAdministrador;
END;
GO

CREATE PROCEDURE sp_EliminarAdministrador
(@IdAdministrador INT)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Administrador WHERE IdAdministrador=@IdAdministrador)
    BEGIN RAISERROR('El administrador no existe.',16,1); RETURN; END;
    DELETE FROM Administrador WHERE IdAdministrador=@IdAdministrador;
END;
GO


--------------------- Vistas -----------------------

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
    HistorialSalud,
    Imagen
FROM AnimalDelRefugio
WHERE Disponible = 1;
GO

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

-----------------------Crear los roles---------------------
--rol de administrador
CREATE ROLE RolAdministrador;
GO

--rol de veterinario
CREATE ROLE RolVeterinario;
GO

-- rol de recepcionista
CREATE ROLE RolRecepcionista;
GO

--rol de encargadoRefugio
CREATE ROLE RolEncargadoRefugio;
GO

--rol de cliente
CREATE ROLE RolCliente;
GO

---------------------dar permisos a los roles--------------------------------
--para administrador
GRANT SELECT, INSERT, UPDATE, DELETE
ON Cliente
TO RolAdministrador;
GO



-- permisos para veterinario
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

GRANT SELECT, UPDATE
ON Cita
TO RolVeterinario;
GO

--permisos para recepcionista
GRANT SELECT, INSERT, UPDATE, DELETE
ON Cliente
TO RolRecepcionista;
GO

GRANT SELECT, INSERT, UPDATE, DELETE
ON Mascota
TO RolRecepcionista;
GO

GRANT SELECT, INSERT, UPDATE, DELETE
ON Cita
TO RolRecepcionista;
GO

-- permisos para encargado de refugio
GRANT SELECT, INSERT, UPDATE, DELETE
ON AnimalDelRefugio
TO RolEncargadoRefugio;
GO

GRANT SELECT, INSERT, UPDATE, DELETE
ON SolicitudAdopcion
TO RolEncargadoRefugio;
GO

GRANT SELECT, INSERT, UPDATE, DELETE
ON Donacion
TO RolEncargadoRefugio;
GO

-- permisos para el cliente
GRANT SELECT
ON vw_AnimalesDisponibles
TO RolCliente;
GO

GRANT INSERT
ON SolicitudAdopcion
TO RolCliente;
GO

GRANT INSERT
ON Donacion
TO RolCliente;
GO

GRANT INSERT
ON Postulacion
TO RolCliente;
GO

GRANT SELECT,INSERT, UPDATE
ON Cita
TO RolCliente;
GO


-- dar permiso a las vistas al veterinario hara que asi no tenga que acceder a todas las tablas
GRANT SELECT
ON vw_HistorialMedico
TO RolVeterinario;
GO

-- Usuario para el administrador
CREATE USER UsuarioAdministrador
WITHOUT LOGIN;
GO

-- Usuario para el veterinario
CREATE USER UsuarioVeterinario
WITHOUT LOGIN;
GO

-- Usuario para el recepcionista
CREATE USER UsuarioRecepcionista
WITHOUT LOGIN;
GO

-- Usuario para el encargado del refugio
CREATE USER UsuarioEncargadoRefugio
WITHOUT LOGIN;
GO

-- Usuario para el cliente
CREATE USER UsuarioCliente
WITHOUT LOGIN;
GO


-- Asignacion de los usuarios a sus roles
---------------------------------------------------------
-- Asignar usuario administrador al rol administrador
ALTER ROLE RolAdministrador
ADD MEMBER UsuarioAdministrador;
GO

ALTER ROLE db_owner 
ADD MEMBER UsuarioAdministrador;
GO

-- Asignar usuario veterinario al rol veterinario
ALTER ROLE RolVeterinario
ADD MEMBER UsuarioVeterinario;
GO

-- aSIGNAR USUARIO RECEPCIONISTA AL ROL RECEPCIONISTA
ALTER ROLE RolRecepcionista
ADD MEMBER UsuarioRecepcionista;
GO

--aSIGNAR USUARIO PARA EL ENCARGADO DE REFUGIO
ALTER ROLE RolEncargadoRefugio
ADD MEMBER UsuarioEncargadoRefugio;
GO

--aSIGNAR USUARIO A CLIENTE
ALTER ROLE RolCliente
ADD MEMBER UsuarioCliente;
GO


----------------------- DATOS DE PRUEBA --------------------------
-- 1. Administrador
INSERT INTO Administrador (Correo, Contrasena)
VALUES ('admin@vetcare.com', '$2b$10$WVuIDnDmyHTlefjzhIVHG.f1udCMAxYUgxWYNgmdQ7xfKf.ocl8eq');

UPDATE Administrador
SET Contrasena = '$2b$10$Qur4R0QLK3H3T2Y/J/dGl.HfcwufyiF6UYtpGfHh1MCoPudEGdxVG'
WHERE Correo = 'admin@vetcare.com';
--contraseña es Prueba123!


-- 2. Veterinario de prueba (IdRol = 2)
INSERT INTO Postulacion (NombreCompleto, Cedula, FechaNacimiento, CorreoElectronico, Curriculum, MotivoPostulacion, Estado, IdRol)
VALUES ('Veterinario de Prueba', '1111111111', '1990-01-01', 'veterinario@vetcare.com', 'N/A', 'Postulacion de prueba', 'Aceptada', 2);

INSERT INTO Empleado (NombreCompleto, Cedula, CorreoElectronico, Telefono, FechaContratacion, Activo, Contrasena, IdRol, IdPostulacion)
VALUES ('Veterinario de Prueba', '1111111111', 'veterinario@vetcare.com', '88880001', GETDATE(), 1,
       '$2b$10$AaNNmU14GD6eJ3pvpRjlU.2dQw4X51ERJ06L0nfnfq0aWmaGHEix2',
       2, SCOPE_IDENTITY());

-- 3. Recepcionista de prueba (IdRol = 4)
INSERT INTO Postulacion (NombreCompleto, Cedula, FechaNacimiento, CorreoElectronico, Curriculum, MotivoPostulacion, Estado, IdRol)
VALUES ('Recepcionista de Prueba', '2222222222', '1990-01-01', 'recepcionista@vetcare.com', 'N/A', 'Postulacion de prueba', 'Aceptada', 4);

INSERT INTO Empleado (NombreCompleto, Cedula, CorreoElectronico, Telefono, FechaContratacion, Activo, Contrasena, IdRol, IdPostulacion)
VALUES ('Recepcionista de Prueba', '2222222222', 'recepcionista@vetcare.com', '88880002', GETDATE(), 1,
        '$2b$10$7oKEXKzwMZjT9uaN.IgAIuFij5K1OQC.Ol9aEWILZq9603cDCxsaW',
        4, SCOPE_IDENTITY());

-- 4. Encargado del Refugio de prueba (IdRol = 5)
INSERT INTO Postulacion (NombreCompleto, Cedula, FechaNacimiento, CorreoElectronico, Curriculum, MotivoPostulacion, Estado, IdRol)
VALUES ('Encargado de Prueba', '3333333333', '1990-01-01', 'refugio@vetcare.com', 'N/A', 'Postulacion de prueba', 'Aceptada', 5);

INSERT INTO Empleado (NombreCompleto, Cedula, CorreoElectronico, Telefono, FechaContratacion, Activo, Contrasena, IdRol, IdPostulacion)
VALUES ('Encargado de Prueba', '3333333333', 'refugio@vetcare.com', '88880003', GETDATE(), 1,
        '$2b$10$PHRCAkPNw3mL0yPxok2O/uKTZVZxNN2us9w9/Roy9q4UHoQ8K6i3e',
        5, SCOPE_IDENTITY());

UPDATE Empleado
SET Contrasena = '$2b$10$Qur4R0QLK3H3T2Y/J/dGl.HfcwufyiF6UYtpGfHh1MCoPudEGdxVG'
WHERE CorreoElectronico IN ('veterinario@vetcare.com', 'recepcionista@vetcare.com', 'refugio@vetcare.com');
--contraseña es Prueba123!
--------------------- FIN ------------------------------------
-- EN CASO DE QUE SE NECESITE MODIFICAR O REINICIAR LA DB, SE PUEDE USAR EL SIGUIENTE CODIGO:
-- Si no, entonces no se realiza el codigo de eliminacion, para evitar la perdida de datos.
-- DROP DATABASE DB_Veterinaria;
GO
