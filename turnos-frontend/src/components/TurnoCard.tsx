import React from 'react'
import { Turno } from '../api/mockApi'

export default function TurnoCard({ 
  turno, 
  onStart, 
  onEnd, 
  onAbsent,
  onReassign,
  clinics
}: { 
  turno:Turno
  onStart?: (id:string)=>void
  onEnd?: (id:string)=>void
  onAbsent?: (id:string)=>void
  onReassign?: (id:string, patientName:string, clinic:string)=>void
  clinics?: string[]
}){
  return (
    <div className={`turno-card ${turno.status}`}>
      <div className="left">
        <div className="name">{turno.patientName}</div>
        <div className="meta">{new Date(turno.createdAt).toLocaleTimeString()}</div>
      </div>
      <div className="right">
        <div className="status">{turno.status}</div>
        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
          {onStart && <button onClick={()=>onStart(turno.id)}>Iniciar</button>}
          {onEnd && <button onClick={()=>onEnd(turno.id)}>Finalizar</button>}
          {onAbsent && <button onClick={()=>onAbsent(turno.id)}>Ausente</button>}
          {onReassign && clinics && <button onClick={()=>onReassign(turno.id, turno.patientName, turno.clinic)} style={{background:'var(--color-accent)',color:'#000'}}>Reasignar</button>}
        </div>
      </div>
    </div>
  )
}
