import React, { useState } from 'react'
import { apiClient } from '../api/apiClient'

export default function PatientForm({ onRegistered }: { onRegistered?: () => void }){
  const [name, setName] = useState('')
  const [clinic, setClinic] = useState('Clinica General')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const [success, setSuccess] = useState(false)
  const clinics = ['Clinica General','Pediatría','Traumatología']

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    if (!name) {
      setError('El nombre es obligatorio')
      return
    }
    setLoading(true)
    try {
      await apiClient.registerPatient(name, clinic)
      setName('')
      setSuccess(true)
      if (onRegistered) onRegistered()
    } catch (err) {
      setError('Error al registrar paciente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="card" onSubmit={submit} aria-label="Formulario de registro de paciente">
      <h3>Registrar paciente</h3>
      <label htmlFor="patient-name">Nombre</label>
      <input id="patient-name" value={name} onChange={e=>setName(e.target.value)} autoFocus aria-required="true" />
      <label htmlFor="patient-clinic">Clínica</label>
      <select id="patient-clinic" value={clinic} onChange={e=>setClinic(e.target.value)} aria-required="true">
        {clinics.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <button type="submit" disabled={loading}>{loading ? 'Registrando...' : 'Registrar y asignar'}</button>
      {error && <div className="empty" role="alert" style={{color:'var(--color-error)',marginTop:8}}>{error}</div>}
      {success && <div className="empty" role="status" style={{color:'var(--color-success)',marginTop:8}}>Paciente registrado correctamente</div>}
    </form>
  )
}
