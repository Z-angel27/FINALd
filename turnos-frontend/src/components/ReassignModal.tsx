import React, { useState } from 'react'
import Modal from './Modal'
import { apiClient } from '../api/apiClient'

export default function ReassignModal({ 
  turnoId, 
  patientName, 
  currentClinic,
  clinics, 
  onClose, 
  onSuccess 
}: { 
  turnoId: string
  patientName: string
  currentClinic: string
  clinics: string[]
  onClose: () => void
  onSuccess?: () => void
}) {
  const [newClinic, setNewClinic] = useState('')
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)

  // Filtrar clínicas para que no incluya la actual
  const availableClinics = clinics.filter(c => c !== currentClinic)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!newClinic) {
      setError('Debe seleccionar una nueva clínica')
      return
    }
    if (!motivo.trim()) {
      setError('Debe escribir el motivo de la reasignación')
      return
    }
    if (motivo.trim().length < 5) {
      setError('El motivo debe tener al menos 5 caracteres')
      return
    }

    setLoading(true)
    try {
      // Mapear nombre de clínica a ID (asumiendo que el backend espera IDs)
      const clinicMap: Record<string, number> = {
        'Clinica General': 1,
        'Pediatría': 2,
        'Traumatología': 3
      }
      const newClinicId = clinicMap[newClinic] || 1

      await apiClient.reassignTurno(turnoId, newClinicId, motivo.trim())
      onClose()
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error(err)
      setError('Error al reasignar el turno. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Reasignar Turno" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} aria-label="Formulario de reasignación">
        <div>
          <p><strong>Paciente:</strong> {patientName}</p>
          <p><strong>Clínica actual:</strong> {currentClinic}</p>
        </div>

        <div>
          <label htmlFor="new-clinic" style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
            Nueva Clínica *
          </label>
          <select
            id="new-clinic"
            value={newClinic}
            onChange={(e) => setNewClinic(e.target.value)}
            required
            aria-required="true"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
          >
            <option value="">-- Selecciona una clínica --</option>
            {availableClinics.map(clinic => (
              <option key={clinic} value={clinic}>{clinic}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="motivo" style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
            Motivo de la Reasignación *
          </label>
          <textarea
            id="motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ej: Saturación de la clínica general, criterio médico, cambio de consultorio..."
            required
            aria-required="true"
            rows={4}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid var(--color-border)',
              fontFamily: 'inherit',
              fontSize: 'inherit'
            }}
          />
          <small style={{ display: 'block', marginTop: '4px', color: 'var(--color-muted)' }}>
            {motivo.length}/500 caracteres
          </small>
        </div>

        {error && (
          <div style={{ color: 'var(--color-error)', padding: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }} role="alert">
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button type="button" onClick={onClose} disabled={loading} style={{ background: 'var(--color-border)' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} style={{ background: 'var(--color-primary)', color: '#fff' }}>
            {loading ? 'Procesando...' : 'Reasignar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
