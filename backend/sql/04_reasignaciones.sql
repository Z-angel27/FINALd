-- Script para agregar soporte de reasignación de turnos
USE TurnosDB;
GO

-- Crear tabla de auditoría para reasignaciones
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TurnoReasignaciones]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TurnoReasignaciones](
        [ReasignacionId] [int] IDENTITY(1,1) PRIMARY KEY,
        [TurnoId] [int] NOT NULL REFERENCES [dbo].[Turnos](TurnoId),
        [ClinicaAnterior] [int] NOT NULL REFERENCES [dbo].[Clinics](ClinicId),
        [ClinicaNueva] [int] NOT NULL REFERENCES [dbo].[Clinics](ClinicId),
        [Motivo] [varchar](500) NOT NULL,
        [UsuarioReasignacion] [int] NOT NULL REFERENCES [dbo].[Users](UserId),
        [FechaReasignacion] [datetime] NOT NULL DEFAULT GETDATE(),
        [Descripcion] [varchar](max) NULL
    )
    
    -- Índices para búsquedas comunes
    CREATE NONCLUSTERED INDEX [IX_TurnoReasignaciones_TurnoId] ON [dbo].[TurnoReasignaciones]([TurnoId])
    CREATE NONCLUSTERED INDEX [IX_TurnoReasignaciones_FechaReasignacion] ON [dbo].[TurnoReasignaciones]([FechaReasignacion] DESC)
END
GO

-- Procedimiento: Reasignar turno a otra clínica
IF OBJECT_ID('dbo.sp_ReasignTurno','P') IS NOT NULL
    DROP PROCEDURE dbo.sp_ReasignTurno;
GO
CREATE PROCEDURE dbo.sp_ReasignTurno
    @TurnoId int,
    @ClinicaNuevaId int,
    @Motivo varchar(500),
    @UsuarioId int
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ClinicaAnteriorId int
    DECLARE @PatientName varchar(100)
    DECLARE @Status varchar(20)
    
    -- Obtener datos del turno actual
    SELECT @ClinicaAnteriorId = ClinicId, @PatientName = PatientName, @Status = Status
    FROM dbo.Turnos
    WHERE TurnoId = @TurnoId
    
    IF @ClinicaAnteriorId IS NULL
    BEGIN
        RAISERROR('Turno no encontrado',16,1)
        RETURN
    END
    
    -- Validar que la nueva clínica existe
    IF NOT EXISTS(SELECT 1 FROM dbo.Clinics WHERE ClinicId = @ClinicaNuevaId)
    BEGIN
        RAISERROR('Clínica nueva no existe',16,1)
        RETURN
    END
    
    -- Validar que no sea la misma clínica
    IF @ClinicaAnteriorId = @ClinicaNuevaId
    BEGIN
        RAISERROR('La nueva clínica es la misma que la anterior',16,1)
        RETURN
    END
    
    -- Iniciar transacción
    BEGIN TRANSACTION
    
    BEGIN TRY
        -- Actualizar el turno a la nueva clínica (mantener el estado como 'waiting')
        UPDATE dbo.Turnos
        SET ClinicId = @ClinicaNuevaId, 
            Status = 'waiting',  -- Resetear a waiting al reasignar
            DoctorId = NULL,     -- Limpiar doctor asignado
            UpdatedAt = GETDATE()
        WHERE TurnoId = @TurnoId
        
        -- Registrar la reasignación en auditoría
        INSERT INTO dbo.TurnoReasignaciones (TurnoId, ClinicaAnterior, ClinicaNueva, Motivo, UsuarioReasignacion, Descripcion)
        VALUES (@TurnoId, @ClinicaAnteriorId, @ClinicaNuevaId, @Motivo, @UsuarioId, 
                'Paciente: ' + @PatientName + ', Status anterior: ' + @Status)
        
        COMMIT TRANSACTION
        
        -- Retornar los datos actualizados del turno
        SELECT * FROM dbo.Turnos WHERE TurnoId = @TurnoId
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION
        RAISERROR('Error en la reasignación', 16, 1)
    END CATCH
END
GO

-- Procedimiento: Obtener historial de reasignaciones de un turno
IF OBJECT_ID('dbo.sp_GetTurnoReasignaciones','P') IS NOT NULL
    DROP PROCEDURE dbo.sp_GetTurnoReasignaciones;
GO
CREATE PROCEDURE dbo.sp_GetTurnoReasignaciones
    @TurnoId int
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        r.ReasignacionId,
        r.TurnoId,
        ca.Name as ClinicaAnterior,
        cn.Name as ClinicaNueva,
        r.Motivo,
        u.FullName as UsuarioReasignacion,
        r.FechaReasignacion,
        r.Descripcion
    FROM dbo.TurnoReasignaciones r
    INNER JOIN dbo.Clinics ca ON r.ClinicaAnterior = ca.ClinicId
    INNER JOIN dbo.Clinics cn ON r.ClinicaNueva = cn.ClinicId
    INNER JOIN dbo.Users u ON r.UsuarioReasignacion = u.UserId
    WHERE r.TurnoId = @TurnoId
    ORDER BY r.FechaReasignacion DESC
END
GO
