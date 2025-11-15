// Mock API with in-memory queues and BroadcastChannel for realtime simulation
import { v4 as uuidv4 } from 'uuid'

export type Turno = {
  id: string
  patientName: string
  clinic: string
  status: 'waiting' | 'called' | 'in_consult' | 'done' | 'absent'
  createdAt: string
}

type Queues = Record<string, Turno[]>

const CHANNEL = 'turnos_channel_v1'
const bc = typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel(CHANNEL) : null

let queues: Queues = {
  'Clinica General': [],
  'Pediatría': [],
  'Traumatología': [],
}

function broadcast() {
  if (bc) bc.postMessage({ type: 'update', payload: queues })
  // also dispatch a window event for single-tab
  window.dispatchEvent(new CustomEvent('turnos:update', { detail: queues }))
}

export const mockApi = {
  getQueues() {
    return Promise.resolve(queues)
  },
  registerPatient(patientName: string, clinic: string) {
    const turno: Turno = {
      id: uuidv4(),
      patientName,
      clinic,
      status: 'waiting',
      createdAt: new Date().toISOString(),
    }
    queues[clinic] = queues[clinic] || []
    queues[clinic].push(turno)
    broadcast()
    return Promise.resolve(turno)
  },
  callNext(clinic: string) {
    const q = queues[clinic] || []
    const next = q.find(t => t.status === 'waiting')
    if (!next) return Promise.resolve(null)
    next.status = 'called'
    broadcast()
    return Promise.resolve(next)
  },
  startConsult(turnoId: string) {
    for (const clinic of Object.keys(queues)) {
      const t = queues[clinic].find(x => x.id === turnoId)
      if (t) {
        t.status = 'in_consult'
        broadcast()
        return Promise.resolve(t)
      }
    }
    return Promise.resolve(null)
  },
  endConsult(turnoId: string) {
    for (const clinic of Object.keys(queues)) {
      const t = queues[clinic].find(x => x.id === turnoId)
      if (t) {
        t.status = 'done'
        broadcast()
        return Promise.resolve(t)
      }
    }
    return Promise.resolve(null)
  },
  markAbsent(turnoId: string) {
    for (const clinic of Object.keys(queues)) {
      const t = queues[clinic].find(x => x.id === turnoId)
      if (t) {
        t.status = 'absent'
        broadcast()
        return Promise.resolve(t)
      }
    }
    return Promise.resolve(null)
  },
  reassignTurno(turnoId: string, newClinicId: number, motivo: string) {
    // Buscar el turno en la clínica actual
    for (const clinic of Object.keys(queues)) {
      const idx = queues[clinic].findIndex(x => x.id === turnoId)
      if (idx >= 0) {
        const turno = queues[clinic][idx]
        // Encontrar la nueva clínica
        const clinics = ['Clinica General', 'Pediatría', 'Traumatología']
        const newClinic = clinics[newClinicId - 1] || 'Clinica General'
        
        // Remover de clínica anterior
        queues[clinic].splice(idx, 1)
        
        // Agregar a nueva clínica con estado 'waiting'
        turno.clinic = newClinic
        turno.status = 'waiting'
        queues[newClinic] = queues[newClinic] || []
        queues[newClinic].push(turno)
        
        broadcast()
        return Promise.resolve({ ok: true, turno })
      }
    }
    return Promise.resolve({ ok: false, turno: null })
  },
  subscribe(cb: (q: Queues) => void) {
    const handler = (e: MessageEvent) => {
      if (e?.data?.type === 'update') cb(e.data.payload)
    }
    const handler2 = (e: Event) => cb((e as CustomEvent).detail)
    if (bc) bc.addEventListener('message', handler)
    window.addEventListener('turnos:update', handler2 as EventListener)
    // provide initial state
    setTimeout(() => cb(queues), 0)
    return () => {
      if (bc) bc.removeEventListener('message', handler)
      window.removeEventListener('turnos:update', handler2 as EventListener)
    }
  }
}
