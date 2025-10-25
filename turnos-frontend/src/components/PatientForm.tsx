import React, { useState } from 'react'
import { apiClient } from '../api/apiClient'

export default function PatientForm({ onRegistered }: { onRegistered?: () => void }){
  const [name, setName] = useState('')
  const [clinic, setClinic] = useState('Clinica General')
  const clinics = ['Clinica General','Pediatría','Traumatología']

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    await apiClient.registerPatient(name, clinic)
    setName('')
    if (onRegistered) onRegistered()
  }

  return (
    <form className="card" onSubmit={submit}>
      <h3>Registrar paciente</h3>
      <label>
        Nombre
        <input value={name} onChange={e=>setName(e.target.value)} />
      </label>
      <label>
        Clínica
        <select value={clinic} onChange={e=>setClinic(e.target.value)}>
          {clinics.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <button type="submit">Registrar y asignar</button>
    </form>
  )
}
