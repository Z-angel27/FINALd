# Frontend - Sistema Visual de Cola de Turnos

Este repositorio contiene el frontend (React + Vite + TypeScript) para el sistema de gestión de turnos.

Requisitos:
- Node.js 18+ y npm o yarn

Instalación y ejecución (en Windows, bash):

```bash
cd "c:/Users/angel/Documents/Desarrolllo web/FINALd/turnos-frontend"
npm install
npm run dev
```

Descripción:
- `src/api/mockApi.ts` contiene un mock in-memory que usa BroadcastChannel para simular actualizaciones en tiempo real entre pestañas.
- Páginas principales: Recepción (preclasificación), Panel Médico, Display (pantalla pública), Login.

Siguientes pasos:
- Conectar las llamadas del `mockApi` al backend real usando JWT y WebSockets o SSE.
- Implementar validación/roles en el backend y refresco de tokens si es necesario.
