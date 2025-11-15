import React, { useEffect, useState } from 'react'
import { Turno } from '../api/mockApi'
import { apiClient } from '../api/apiClient'
import PatientForm from '../components/PatientForm'
import ColaList from '../components/ColaList'
import ReassignModal from '../components/ReassignModal'
import { useAuth } from '../contexts/AuthContext'

export default function Reception() {
  const [queues, setQueues] = useState<Record<string, Turno[]>>({})
  const [reassignModal, setReassignModal] = useState<{turnoId: string, patientName: string, clinic: string} | null>(null)
  const { role } = useAuth()

  useEffect(() => {
    const unsub = apiClient.subscribe(q => setQueues(q))
    return unsub
  }, [])

  const handleReassign = (turnoId: string, patientName: string, clinic: string) => {
    if (role !== 'reception' && role !== 'admin') return
    setReassignModal({ turnoId, patientName, clinic })
  }

  const clinics = Object.keys(queues)

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
          {clinics.map(clinic => (
            <div key={clinic} className="clinic-block">
              <h3>{clinic}</h3>
              <ColaList 
                items={queues[clinic] || []}
                onReassign={handleReassign}
                clinics={clinics}
              />
            </div>
          ))}
        </section>
      </div>

      {reassignModal && (
        <ReassignModal
          turnoId={reassignModal.turnoId}
          patientName={reassignModal.patientName}
          currentClinic={reassignModal.clinic}
          clinics={clinics}
          onClose={() => setReassignModal(null)}
          onSuccess={() => {
            // La suscripción se encargará de actualizar
          }}
        />
      )}
    </div>
  )
}
