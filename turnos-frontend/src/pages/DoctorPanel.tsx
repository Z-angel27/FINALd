import React, { useEffect, useState } from 'react'
import { Turno } from '../api/mockApi'
import { apiClient } from '../api/apiClient'
import ColaList from '../components/ColaList'
import Modal from '../components/Modal'
import ReassignModal from '../components/ReassignModal'
import { useAuth } from '../contexts/AuthContext'

export default function DoctorPanel() {
  const [queues, setQueues] = useState<Record<string, Turno[]>>({})
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null)
  const { role } = useAuth()
  const [confirm, setConfirm] = useState<{action: 'end'|'absent'|null, turnoId?: string} | null>(null)
  const [reassignModal, setReassignModal] = useState<{turnoId: string, patientName: string, clinic: string} | null>(null)

  useEffect(() => {
    const unsub = apiClient.subscribe(q => setQueues(q))
    return unsub
  }, [])

  const callNext = async () => {
    if (!selectedClinic) return
    if (role !== 'doctor') return
    await apiClient.callNext(selectedClinic)
  }

  const start = async (id: string) => {
    if (role !== 'doctor') return
    await apiClient.startConsult(id)
  }

  const end = async (id: string) => {
    if (role !== 'doctor') return
    setConfirm({ action: 'end', turnoId: id })
  }

  const markAbsent = async (id: string) => {
    if (role !== 'doctor') return
    setConfirm({ action: 'absent', turnoId: id })
  }

  const handleReassign = (turnoId: string, patientName: string, clinic: string) => {
    if (role !== 'doctor' && role !== 'reception') return
    setReassignModal({ turnoId, patientName, clinic })
  }

  const doConfirmed = async () => {
    if (!confirm || !confirm.turnoId) return setConfirm(null)
    if (confirm.action === 'end') await apiClient.endConsult(confirm.turnoId)
    if (confirm.action === 'absent') await apiClient.markAbsent(confirm.turnoId)
    setConfirm(null)
  }

  const clinics = Object.keys(queues)

  return (
    <div className="page">
      <h2>Panel Médico</h2>
      <div className="layout">
        <aside className="left small">
          <h4>Seleccionar Clínica</h4>
          <ul>
            {clinics.map(c => (
              <li key={c}>
                <button className={selectedClinic===c? 'active':''} onClick={() => setSelectedClinic(c)}>{c}</button>
              </li>
            ))}
          </ul>
          <div className="controls">
            {role === 'doctor' ? (
              <button onClick={callNext} disabled={!selectedClinic}>Llamar siguiente</button>
            ) : (
              <div className="empty">Solo personal médico puede llamar pacientes</div>
            )}
          </div>
        </aside>
        <section className="right">
          {selectedClinic ? (
            <>
              <h3>{selectedClinic}</h3>
              <ColaList 
                items={queues[selectedClinic] || []} 
                onStart={start} 
                onEnd={end} 
                onAbsent={markAbsent}
                onReassign={handleReassign}
                clinics={clinics}
              />
            </>
          ) : (
            <div>Seleccione una clínica para ver la cola</div>
          )}
        </section>
      </div>

      {confirm && (
        <Modal title="Confirmar acción" onClose={() => setConfirm(null)}>
          <div>¿Confirma que desea marcar "{confirm.action}" para este paciente?</div>
          <div style={{display:'flex',gap:8,marginTop:12,justifyContent:'flex-end'}}>
            <button onClick={() => setConfirm(null)}>Cancelar</button>
            <button onClick={doConfirmed}>Confirmar</button>
          </div>
        </Modal>
      )}

      {reassignModal && (
        <ReassignModal
          turnoId={reassignModal.turnoId}
          patientName={reassignModal.patientName}
          currentClinic={reassignModal.clinic}
          clinics={clinics}
          onClose={() => setReassignModal(null)}
          onSuccess={() => {
            // La suscripción a cambios se encargará de actualizar
          }}
        />
      )}
    </div>
  )
}
