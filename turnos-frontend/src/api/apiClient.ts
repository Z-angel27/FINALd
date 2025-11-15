import axios from 'axios'
import { mockApi, Turno } from './mockApi'

const BASE = (import.meta.env.VITE_API_URL as string) || ''

// If BASE is provided, this client will call the real backend, otherwise it falls back to mockApi.
export const apiClient = {
  async login(username: string, password: string) {
    if (!BASE) return { token: btoa(username + ':' + Date.now()) }
    const res = await axios.post(`${BASE}/auth/login`, { username, password })
    return res.data
  },

  async getQueues() {
    if (!BASE) return mockApi.getQueues()
    const res = await axios.get(`${BASE}/queues`)
    return res.data as Record<string, Turno[]>
  },

  async registerPatient(patientName: string, clinic: string) {
    if (!BASE) return mockApi.registerPatient(patientName, clinic)
    const res = await axios.post(`${BASE}/turnos`, { patientName, clinic })
    return res.data as Turno
  },

  async callNext(clinic: string) {
    if (!BASE) return mockApi.callNext(clinic)
    const res = await axios.post(`${BASE}/queues/${encodeURIComponent(clinic)}/call`)
    return res.data as Turno | null
  },

  async startConsult(turnoId: string) {
    if (!BASE) return mockApi.startConsult(turnoId)
    const res = await axios.post(`${BASE}/turnos/${turnoId}/start`)
    return res.data as Turno
  },

  async endConsult(turnoId: string) {
    if (!BASE) return mockApi.endConsult(turnoId)
    const res = await axios.post(`${BASE}/turnos/${turnoId}/end`)
    return res.data as Turno
  },

  async markAbsent(turnoId: string) {
    if (!BASE) return mockApi.markAbsent(turnoId)
    const res = await axios.post(`${BASE}/turnos/${turnoId}/absent`)
    return res.data as Turno
  },

  async reassignTurno(turnoId: string, newClinicId: number, motivo: string, usuarioId?: number) {
    if (!BASE) return mockApi.reassignTurno(turnoId, newClinicId, motivo)
    const res = await axios.post(`${BASE}/turnos/${turnoId}/reassign`, {
      newClinicId,
      motivo,
      usuarioId: usuarioId || 1
    })
    return res.data as { ok: boolean; turno: Turno }
  },

  async getTurnoReasignaciones(turnoId: string) {
    if (!BASE) return []
    const res = await axios.get(`${BASE}/turnos/${turnoId}/reasignaciones`)
    return res.data
  },

  subscribe(cb: (q: Record<string, Turno[]>)=>void) {
    if (!BASE) return mockApi.subscribe(cb)
    // Implement a simple SSE fallback if backend provides /events
    const evt = new EventSource(`${BASE}/events`)
    evt.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        cb(data)
      } catch (err) { console.warn('invalid event', err) }
    }
    return () => evt.close()
  }
}
