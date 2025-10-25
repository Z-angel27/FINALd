import React, { useEffect, useState } from 'react'
import { Turno } from '../api/mockApi'
import { apiClient } from '../api/apiClient'
import PatientForm from '../components/PatientForm'
import ColaList from '../components/ColaList'
import { useAuth } from '../contexts/AuthContext'

export default function Reception() {
  const [queues, setQueues] = useState<Record<string, Turno[]>>({})
  const { role } = useAuth()

  useEffect(() => {
    const unsub = apiClient.subscribe(q => setQueues(q))
    return unsub
  }, [])

  return (
    <div className="page">
      <h2>Recepción / Preclasificación</h2>
      <div className="layout">
        <section className="left">
          {role === 'reception' || role === 'admin' ? (
            <PatientForm onRegistered={() => { /* nothing */ }} />
          ) : (
            <div className="card">Acceso restringido: solo recepción puede registrar pacientes.</div>
          )}
        </section>
        <section className="right">
          {Object.keys(queues).map(clinic => (
            <div key={clinic} className="clinic-block">
              <h3>{clinic}</h3>
              <ColaList items={queues[clinic] || []} />
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
