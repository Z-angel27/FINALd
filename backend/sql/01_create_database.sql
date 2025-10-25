-- Crear base de datos para sistema de turnos
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'TurnosDB')
BEGIN
    CREATE DATABASE TurnosDB;
END
GO

USE TurnosDB;
GO

-- Crear tabla de roles
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Roles]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Roles](
        [RoleId] [int] IDENTITY(1,1) PRIMARY KEY,
        [Name] [varchar](50) NOT NULL UNIQUE
    )

    -- Insertar roles base
    INSERT INTO [dbo].[Roles] ([Name]) VALUES 
        ('admin'),
        ('doctor'),
        ('reception')
END
GO

-- Crear tabla de usuarios
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Users](
        [UserId] [int] IDENTITY(1,1) PRIMARY KEY,
        [Username] [varchar](50) NOT NULL UNIQUE,
        [Password] [varchar](100) NOT NULL, -- Stored hashed
        [FullName] [varchar](100) NOT NULL,
        [RoleId] [int] NOT NULL REFERENCES [dbo].[Roles](RoleId),
        [Active] [bit] NOT NULL DEFAULT 1,
        [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE()
    )

    -- Crear índice en username para búsqueda rápida en login
    CREATE NONCLUSTERED INDEX [IX_Users_Username] ON [dbo].[Users]([Username])
END
GO

-- Crear tabla de clínicas/especialidades
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Clinics]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Clinics](
        [ClinicId] [int] IDENTITY(1,1) PRIMARY KEY,
        [Name] [varchar](100) NOT NULL UNIQUE,
        [Active] [bit] NOT NULL DEFAULT 1
    )

    -- Insertar clínicas base
    INSERT INTO [dbo].[Clinics] ([Name]) VALUES 
        ('Clinica General'),
        ('Pediatría'),
        ('Traumatología')
END
GO

-- Crear tabla de turnos
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Turnos]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Turnos](
        [TurnoId] [int] IDENTITY(1,1) PRIMARY KEY,
        [PatientName] [varchar](100) NOT NULL,
        [ClinicId] [int] NOT NULL REFERENCES [dbo].[Clinics](ClinicId),
        [Status] [varchar](20) NOT NULL 
            CHECK ([Status] IN ('waiting', 'called', 'in_consult', 'done', 'absent')),
        [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] [datetime] NOT NULL DEFAULT GETDATE(),
        [CreatedBy] [int] NOT NULL REFERENCES [dbo].[Users](UserId),
        [DoctorId] [int] NULL REFERENCES [dbo].[Users](UserId)
    )

    -- Índices para búsquedas comunes
    CREATE NONCLUSTERED INDEX [IX_Turnos_Status] ON [dbo].[Turnos]([Status])
    CREATE NONCLUSTERED INDEX [IX_Turnos_ClinicId] ON [dbo].[Turnos]([ClinicId])
    CREATE NONCLUSTERED INDEX [IX_Turnos_CreatedAt] ON [dbo].[Turnos]([CreatedAt] DESC)
END
GO