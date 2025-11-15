import React from 'react'
import { Turno } from '../api/mockApi'
import TurnoCard from './TurnoCard'

export default function ColaList({ 
  items, 
  onStart, 
  onEnd, 
  onAbsent,
  onReassign,
  clinics
} : { 
  items: Turno[]
  onStart?: (id:string)=>void
  onEnd?: (id:string)=>void
  onAbsent?: (id:string)=>void
  onReassign?: (id:string, patientName:string, clinic:string)=>void
  clinics?: string[]
}){
  return (
    <div className="cola-list">
      {items.length === 0 && <div className="empty">Sin turnos</div>}
      {items.map(t => (
        <TurnoCard 
          key={t.id} 
          turno={t} 
          onStart={onStart} 
          onEnd={onEnd} 
          onAbsent={onAbsent}
          onReassign={onReassign}
          clinics={clinics}
        />
      ))}
    </div>
  )
}
