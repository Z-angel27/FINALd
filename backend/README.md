# Turnos - Backend (Node.js + Express + SQL Server)

Este backend proporciona endpoints para gestionar turnos y publicar eventos en tiempo real mediante SSE. Está pensado para usarse con la UI frontend incluida en el repo.

Requisitos
- Node.js 18+
- SQL Server (local o remoto)

Variables de entorno (archivo .env)

```
DB_USER=sa
DB_PASSWORD=YourStrong!Pass
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=TurnosDB
JWT_SECRET=change_this
PORT=4000
```

Pasos para preparar la base de datos (SQL Server):
1. Abrir SQL Server Management Studio y ejecutar los scripts en el orden:
   - `backend/sql/01_create_database.sql`
   - `backend/sql/02_seed_data.sql`
   - `backend/sql/03_procedures.sql`

2. Opcional: verificar tablas y datos.

Instalación y ejecución del backend (desde `backend`):

```bash
cd backend
npm install
npm run dev
```

Descripción rápida de endpoints
- POST /auth/login { username, password } -> { token, role }
- GET /api/queues -> Obtener colas agrupadas por clínica
- POST /api/turnos { patientName, clinic, createdBy } -> registrar
- POST /api/queues/:clinic/call -> llamar siguiente
- POST /api/turnos/:id/start -> iniciar consulta
- POST /api/turnos/:id/end -> finalizar consulta
- POST /api/turnos/:id/absent -> marcar ausente
- GET /events -> SSE stream con actualizaciones (content-type: text/event-stream)

Notas de seguridad
- En los scripts de ejemplo las contraseñas se han guardado con HASHBYTES(SHA2_256) para pruebas. En producción usar bcrypt (en el backend) y salting con políticas fuertes.
- Asegúrate de cambiar `JWT_SECRET`.

Siguientes pasos recomendados
- Añadir validaciones y manejo de roles en las rutas (middleware ya preparado en `src/auth.ts` si lo extiendes).
- Reemplazar comparador SHA por bcrypt.
- Añadir tests y CI.
