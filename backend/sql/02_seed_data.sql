USE TurnosDB;
GO

-- Insertar usuario admin (contraseña: admin123) usando SHA2_256
-- Nota: para producción usar bcrypt y no almacenar solo un hash simple.
IF NOT EXISTS(SELECT 1 FROM dbo.Users WHERE Username='admin')
BEGIN
    INSERT INTO dbo.Users (Username, Password, FullName, RoleId)
    VALUES (
        'admin',
        CONVERT(varchar(100), HASHBYTES('SHA2_256', 'admin123'), 2),
        'Administrador',
        (SELECT RoleId FROM dbo.Roles WHERE Name='admin')
    )
END
GO

-- Insertar un médico y un recepcionista de ejemplo (contraseña: secret)
IF NOT EXISTS(SELECT 1 FROM dbo.Users WHERE Username='doctor1')
BEGIN
    INSERT INTO dbo.Users (Username, Password, FullName, RoleId)
    VALUES (
        'doctor1',
        CONVERT(varchar(100), HASHBYTES('SHA2_256', 'secret'), 2),
        'Dr. Morales',
        (SELECT RoleId FROM dbo.Roles WHERE Name='doctor')
    )
END
GO

IF NOT EXISTS(SELECT 1 FROM dbo.Users WHERE Username='recep1')
BEGIN
    INSERT INTO dbo.Users (Username, Password, FullName, RoleId)
    VALUES (
        'recep1',
        CONVERT(varchar(100), HASHBYTES('SHA2_256', 'secret'), 2),
        'Recepción 1',
        (SELECT RoleId FROM dbo.Roles WHERE Name='reception')
    )
END
GO

-- Opcional: insertar algunos turnos de prueba
IF NOT EXISTS(SELECT 1 FROM dbo.Turnos)
BEGIN
    INSERT INTO dbo.Turnos (PatientName, ClinicId, Status, CreatedBy)
    VALUES
    ('Juan Pérez', (SELECT ClinicId FROM dbo.Clinics WHERE Name='Clinica General'), 'waiting', 2),
    ('María López', (SELECT ClinicId FROM dbo.Clinics WHERE Name='Pediatría'), 'waiting', 3),
    ('Carlos Ruiz', (SELECT ClinicId FROM dbo.Clinics WHERE Name='Traumatología'), 'waiting', 2)
END
GO
