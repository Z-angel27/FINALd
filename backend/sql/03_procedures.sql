USE TurnosDB;
GO

-- Procedure: Registrar nuevo turno
IF OBJECT_ID('dbo.sp_RegisterTurno','P') IS NOT NULL
    DROP PROCEDURE dbo.sp_RegisterTurno;
GO
CREATE PROCEDURE dbo.sp_RegisterTurno
    @PatientName varchar(100),
    @ClinicName varchar(100),
    @CreatedBy int
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @clinicId int = (SELECT ClinicId FROM dbo.Clinics WHERE Name=@ClinicName)
    IF @clinicId IS NULL
    BEGIN
        RAISERROR('Clinica no encontrada',16,1)
        RETURN
    END
    INSERT INTO dbo.Turnos (PatientName, ClinicId, Status, CreatedBy)
    VALUES (@PatientName, @clinicId, 'waiting', @CreatedBy)
    SELECT SCOPE_IDENTITY() AS NewTurnoId
END
GO

-- Procedure: Llamar siguiente paciente en una clínica (marca el primer 'waiting' como 'called')
IF OBJECT_ID('dbo.sp_CallNext','P') IS NOT NULL
    DROP PROCEDURE dbo.sp_CallNext;
GO
CREATE PROCEDURE dbo.sp_CallNext
    @ClinicName varchar(100)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @clinicId int = (SELECT ClinicId FROM dbo.Clinics WHERE Name=@ClinicName)
    IF @clinicId IS NULL
    BEGIN
        RAISERROR('Clinica no encontrada',16,1)
        RETURN
    END

    ;WITH nextTurn AS (
        SELECT TOP(1) TurnoId
        FROM dbo.Turnos
        WHERE ClinicId = @clinicId AND Status = 'waiting'
        ORDER BY CreatedAt ASC, TurnoId ASC
    )
    UPDATE t
    SET Status = 'called', UpdatedAt = GETDATE()
    FROM dbo.Turnos t
    INNER JOIN nextTurn nt ON t.TurnoId = nt.TurnoId

    SELECT * FROM dbo.Turnos WHERE TurnoId IN (SELECT TurnoId FROM nextTurn)
END
GO

-- Procedure: Iniciar consulta (marcar 'called' -> 'in_consult')
IF OBJECT_ID('dbo.sp_StartConsult','P') IS NOT NULL
    DROP PROCEDURE dbo.sp_StartConsult;
GO
CREATE PROCEDURE dbo.sp_StartConsult
    @TurnoId int,
    @DoctorId int
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Turnos
    SET Status = 'in_consult', DoctorId = @DoctorId, UpdatedAt = GETDATE()
    WHERE TurnoId = @TurnoId;

    SELECT * FROM dbo.Turnos WHERE TurnoId = @TurnoId;
END
GO

-- Procedure: Finalizar consulta (marcar 'in_consult' -> 'done')
IF OBJECT_ID('dbo.sp_EndConsult','P') IS NOT NULL
    DROP PROCEDURE dbo.sp_EndConsult;
GO
CREATE PROCEDURE dbo.sp_EndConsult
    @TurnoId int
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Turnos
    SET Status = 'done', UpdatedAt = GETDATE()
    WHERE TurnoId = @TurnoId;

    SELECT * FROM dbo.Turnos WHERE TurnoId = @TurnoId;
END
GO

-- Procedure: Marcar ausente
IF OBJECT_ID('dbo.sp_MarkAbsent','P') IS NOT NULL
    DROP PROCEDURE dbo.sp_MarkAbsent;
GO
CREATE PROCEDURE dbo.sp_MarkAbsent
    @TurnoId int
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Turnos
    SET Status = 'absent', UpdatedAt = GETDATE()
    WHERE TurnoId = @TurnoId;

    SELECT * FROM dbo.Turnos WHERE TurnoId = @TurnoId;
END
GO

-- Procedure: Obtener colas por clínica con estados
IF OBJECT_ID('dbo.sp_GetQueues','P') IS NOT NULL
    DROP PROCEDURE dbo.sp_GetQueues;
GO
CREATE PROCEDURE dbo.sp_GetQueues
AS
BEGIN
    SET NOCOUNT ON;
    SELECT c.ClinicId, c.Name as ClinicName,
        t.TurnoId, t.PatientName, t.Status, t.CreatedAt, t.UpdatedAt, u.FullName as CreatedByName, d.FullName as DoctorName
    FROM dbo.Clinics c
    LEFT JOIN dbo.Turnos t ON t.ClinicId = c.ClinicId
    LEFT JOIN dbo.Users u ON u.UserId = t.CreatedBy
    LEFT JOIN dbo.Users d ON d.UserId = t.DoctorId
    ORDER BY c.ClinicId, t.CreatedAt ASC
END
GO
